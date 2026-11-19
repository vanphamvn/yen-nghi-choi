// G01 (#142) Thở cùng Yên: real pacing by the engine clock, own-pace option, picture synced to time, text guide,
// pause/background/stop, reduced motion, menu entry. page.clock fakes performance.now and timers (not the animation
// timeline, so animation positions are asserted where the game sets them from the engine: each phase and each resume).
import { test, expect } from '@playwright/test';
// Safari/WebKit only moves focus through links and buttons with Option+Tab (default "Tab to highlight" is off).
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const THO = '/lab/tho/';
const tap = async (page, name) => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
const state = page => page.locator('#game');
// Script-driven breath animations only (CSS hover transitions on the ink words are not part of the pacing).
const anim = page => page.evaluate(() => document.getAnimations().filter(a => !(a instanceof CSSTransition) && !(a instanceof CSSAnimation)).map(a => ({ state: a.playState, t: Math.round(a.currentTime), d: a.effect.getTiming().duration })));

test('reachable from the room: the book page links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = page.getByRole('link', { name: 'Thở cùng Yên' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/lab\/tho\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Thở cùng Yên' })).toBeVisible();
});

test('idle: safety copy beside start, default 1 minute slow pace, nothing runs before a tap', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await expect(page.getByText('Không cần hít sâu hay nín thở. Nếu chóng mặt, hụt hơi hoặc khó chịu, hãy dừng và thở tự nhiên.')).toBeVisible();
  await expect(page.getByText('Thử thở nhẹ theo nhịp, trong mức dễ chịu.')).toBeVisible();
  await expect(page.getByRole('button', { name: '1 phút' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'chậm' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('vào 4 giây · ra 6 giây')).toBeVisible();
  await page.clock.runFor(60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'idle'); // never auto-starts
  expect(await anim(page)).toEqual([]);
  // No hold phase anywhere: the only cues the game can show are the two gentle phases and own pace.
  const cues = await page.evaluate(async () => (await import('/lab/tho/tho.mjs')).PACES);
  for (const pace of Object.values(cues)) for (const step of pace.steps) expect(['in', 'out', 'own']).toContain(step.id);
  expect(Object.values(cues).flatMap(p => p.steps).filter(st => st.id === 'out').every(st => st.ms >= 4000)).toBe(true);
});

test('slow pace: in 4 s → out 6 s, seconds count down, rounds advance, 1 minute completes', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  const cue = page.locator('#game-cue'), secs = page.locator('#tho-seconds');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(cue).toHaveText('Hít vào nhẹ');
  await expect(secs).toHaveText('còn 4 giây');
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Hít vào nhẹ 4 giây, thở ra nhẹ 6 giây.');
  await page.clock.runFor(1000);
  await expect(secs).toHaveText('còn 3 giây');
  await page.clock.runFor(3000);
  await expect(cue).toHaveText('Thở ra nhẹ');
  await expect(secs).toHaveText('còn 6 giây');
  await page.clock.runFor(6000);
  await expect(cue).toHaveText('Hít vào nhẹ');
  await expect(page.locator('#game-round')).toHaveText('vòng 2 / 6');
  await page.clock.runFor(50_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Xong rồi. Không cần thấy khác đi.')).toBeVisible();
  await expect(page.getByText(/điểm|kỷ lục|chuỗi ngày|giỏi lắm/)).toHaveCount(0);
});

test('picture follows the clock: one finite animation per phase, positioned at elapsed time, frozen on pause', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  let a = await anim(page);
  expect(a).toHaveLength(1);
  expect(a[0].d).toBe(4000);
  await page.clock.runFor(1600);
  await tap(page, 'tạm dừng'); // 2 s into the 4 s inhale (1.6 s + the 0.4 s between taps)
  await tap(page, 'tiếp tục'); // time while paused is not counted
  a = await anim(page);
  expect(a).toHaveLength(1);
  expect(a[0].d).toBe(4000);
  expect(a[0].t).toBeGreaterThanOrEqual(1950); // positioned from the engine clock, not restarted at 0
  expect(a[0].t).toBeLessThanOrEqual(2600); // + a little real time: within a phase the animation plays on real time
  await page.clock.runFor(2000);
  a = await anim(page);
  expect(a).toHaveLength(1);
  expect(a[0].d).toBe(6000); // exhale animation replaced the inhale one
  expect(a[0].t).toBeLessThanOrEqual(600);
  await tap(page, 'tạm dừng');
  const frozen = (await anim(page))[0];
  expect(frozen.state).toBe('paused');
  await page.clock.runFor(30_000);
  expect((await anim(page))[0].t).toBe(frozen.t);
  await expect(page.locator('#game-cue')).toBeHidden(); // cue off while paused
  await tap(page, 'tiếp tục');
  expect((await anim(page))[0].state).toBe('running');
  await tap(page, 'dừng hẳn');
  expect(await anim(page)).toEqual([]);
  await expect(page.getByText('Mình dừng ở đây nhé.')).toBeVisible();
});

test('choices: medium pace and 3 minutes; natural pace never cues breathing', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'vừa');
  await tap(page, '3 phút');
  await expect(page.getByText('vào 3 giây · ra 4 giây')).toBeVisible();
  await tap(page, 'bắt đầu');
  await expect(page.locator('#game-round')).toHaveText('vòng 1 / 26'); // 180 s / 7 s ≈ 26 rounds
  await page.clock.runFor(3000);
  await expect(page.locator('#game-cue')).toHaveText('Thở ra nhẹ');
  // Choices are hidden while running.
  await expect(page.getByRole('button', { name: 'vừa' })).toBeHidden();
  await tap(page, 'dừng hẳn');
  await tap(page, 'làm lại');
  await expect(page.getByRole('button', { name: 'vừa' })).toHaveAttribute('aria-pressed', 'true'); // choice kept in memory

  await tap(page, 'tự nhiên');
  await tap(page, '1 phút');
  await tap(page, 'bắt đầu');
  const cues = new Set();
  for (let i = 0; i < 7; i++) { cues.add(await page.locator('#game-cue').textContent()); await page.clock.runFor(10_000); }
  expect([...cues]).toEqual(['Cứ thở theo nhịp của bạn']);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  expect(await anim(page)).toEqual([]);
});

test('background tab pauses the cue and picture, stays paused, no catching up', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(2000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  expect((await anim(page))[0].state).toBe('paused');
  await page.clock.runFor(5 * 60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await expect(page.getByRole('button', { name: 'tiếp tục' })).toBeFocused();
  await page.getByRole('button', { name: 'tiếp tục' }).click();
  await expect(page.locator('#game-cue')).toHaveText('Hít vào nhẹ'); // still 2 s into the first inhale
  await expect(page.locator('#tho-seconds')).toHaveText('còn 2 giây');
});

test('reduced motion: no animation at all, text guide still paces and completes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  expect(await anim(page)).toEqual([]);
  await expect(page.locator('#tho-seconds')).toHaveText('còn 4 giây');
  await page.clock.runFor(4000);
  await expect(page.locator('#game-cue')).toHaveText('Thở ra nhẹ');
  await page.clock.runFor(60_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await context.close();
});

test('keyboard and touch: choose, start, pause, stop by keys; tap works on touch', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto(THO);
  const start = page.getByRole('button', { name: 'bắt đầu' });
  if (testInfo.project.name === 'emulated-touch') { await page.clock.runFor(400); await start.tap(); }
  else { await start.focus(); await page.keyboard.press('Enter'); }
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await page.clock.runFor(400);
  await page.keyboard.press('Space'); // focus moved to "tạm dừng"
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await page.keyboard.press(TAB(page)); // → "dừng hẳn"
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
});

test('320 px: everything fits, words stay on one line, targets ≥ 44 px, nothing stored', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(THO);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const words = await page.locator('.game .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => {
    const r = el.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(el);
    return { t: el.textContent.trim(), min: Math.min(r.width, r.height), lines: range.getClientRects().length };
  }));
  expect(words.length).toBeGreaterThan(5);
  for (const w of words) { expect(w.min, w.t).toBeGreaterThanOrEqual(44); expect(w.lines, w.t).toBe(1); }
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: caution and "bắt đầu" are in the first screen`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(THO);
    for (const target of [page.getByRole('button', { name: 'bắt đầu' }), page.getByText('Không cần hít sâu hay nín thở', { exact: false })]) {
      const box = await target.boundingBox();
      expect(box.y + box.height, `${w}×${h}`).toBeLessThanOrEqual(h);
    }
  });
}

test('screen readers hear each phase once, politely; own pace hides rounds and shows time left only', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  const sr = page.locator('#tho-sr-cue');
  await expect(sr).toHaveAttribute('aria-live', 'polite');
  await tap(page, 'bắt đầu');
  await expect(sr).toHaveText(''); // the start announcement (with the pace) is in the whisper line
  await page.clock.runFor(3600);
  await expect(sr).toHaveText('Thở ra nhẹ');
  await page.clock.runFor(6000);
  await expect(sr).toHaveText('Hít vào nhẹ');
  await tap(page, 'dừng hẳn');
  await expect(sr).toHaveText('');
  await tap(page, 'làm lại');
  await tap(page, 'tự nhiên');
  await tap(page, 'bắt đầu');
  await expect(page.locator('.game-progress')).toBeHidden();
  await expect(page.locator('#tho-seconds')).toHaveText(/^còn 0:5\d$/);
  await page.clock.runFor(20_000);
  await expect(page.locator('#tho-seconds')).toHaveText(/^còn 0:3\d$/);
  await expect(sr).toHaveText(''); // nothing to pace, nothing announced
});

test('changing choices many times, then starting, runs one clean session', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  for (const name of ['vừa', 'tự nhiên', '5 phút', 'chậm', '3 phút', 'vừa', '1 phút']) await tap(page, name);
  await tap(page, 'bắt đầu');
  await expect(page.locator('#game-round')).toHaveText('vòng 1 / 9'); // 60 s / 7 s
  await page.clock.runFor(61_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await page.clock.runFor(10 * 60_000); // no stray timers from earlier sessions change anything
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
});

test('turning reduced motion on mid-game drops the animation; the game carries on', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  expect(await anim(page)).toHaveLength(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => anim(page)).toEqual([]);
  await page.clock.runFor(4000);
  await expect(page.locator('#game-cue')).toHaveText('Thở ra nhẹ');
  expect(await anim(page)).toEqual([]);
});

test('reflection: "khó chịu hơn" gets the rest-and-breathe-naturally reply, others a neutral thanks', async ({ page }) => {
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  await tap(page, 'dừng hẳn');
  await tap(page, 'khó chịu hơn');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã nói. Cứ nghỉ và thở tự nhiên nhé; không cần làm lại.');
  await tap(page, 'làm lại');
  await tap(page, 'bắt đầu');
  await tap(page, 'dừng hẳn');
  await tap(page, 'như cũ');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã tự để ý một chút.');
});

test('menu by keyboard: open the book, Tab to the game, Escape closes back to the book', async ({ page }) => {
  await page.goto('/lab/');
  const book = page.getByRole('button', { name: 'Mở thực đơn trò chơi' });
  await book.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press(TAB(page));
  await expect(page.getByRole('link', { name: 'Thở cùng Yên' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(book).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press(TAB(page));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/lab\/tho\/$/);
});

test('320 px while running and paused, and the menu at 320 px: no overflow, game link ≥ 44 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.clock.install();
  await page.goto(THO);
  await tap(page, 'bắt đầu');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await tap(page, 'tạm dừng');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = await page.getByRole('link', { name: 'Thở cùng Yên' }).boundingBox();
  expect(link.height).toBeGreaterThanOrEqual(44);
  expect(link.x).toBeGreaterThanOrEqual(0);
  expect(link.x + link.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
