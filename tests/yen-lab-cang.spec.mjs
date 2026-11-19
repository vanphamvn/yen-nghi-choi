// G02 (#143) Căng rồi thả: gentle tense → release per part by the engine clock, release-only option, parts left out
// before starting or skipped while playing (never a failure), pause/background/stop, reduced motion, menu entry.
// page.clock fakes performance.now and timers (not the animation timeline: animation positions are asserted where
// the game sets them from the engine, at each phase and each resume).
import { test, expect } from '@playwright/test';
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const CANG = '/lab/cang/';
const CAUTION = 'Chỉ căng nhẹ nếu thấy dễ chịu. Bỏ qua chỗ đang đau hoặc chấn thương. Không nín thở; dừng và thả lỏng nếu khó chịu.';
const tap = async (page, name) => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
const state = page => page.locator('#game');
const cue = page => page.locator('#game-cue');
const anim = page => page.evaluate(() => document.getAnimations().filter(a => !(a instanceof CSSTransition) && !(a instanceof CSSAnimation)).map(a => ({ state: a.playState, t: Math.round(a.currentTime), d: a.effect.getTiming().duration })));

test('reachable from the room: the book page links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = page.getByRole('link', { name: 'Căng rồi thả' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/lab\/cang\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Căng rồi thả' })).toBeVisible();
});

test('idle: safety copy beside start, all four parts chosen, gentle tension only, nothing runs before a tap', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await expect(page.getByText(CAUTION)).toBeVisible();
  await expect(page.getByText('Thử nhận ra lúc cơ căng và lúc thả.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'căng nhẹ rồi thả' })).toHaveAttribute('aria-pressed', 'true');
  for (const name of ['tay', 'mặt', 'vai', 'chân']) await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('khoảng 3 phút 20 giây')).toBeVisible();
  await page.clock.runFor(60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  expect(await anim(page)).toEqual([]);
  // Protocol guard: tension never longer than 5 s, release always longer than tension, no hold phase, no neck/toe moves.
  const { MODES, PARTS } = await page.evaluate(async () => { const m = await import('/lab/cang/cang.mjs'); return { MODES: m.MODES, PARTS: m.PARTS }; });
  for (const mode of Object.values(MODES)) {
    expect(mode.steps.map(s => s.id).every(id => ['tense', 'notice', 'release'].includes(id))).toBe(true);
    const [first, release] = mode.steps;
    expect(first.ms).toBeLessThanOrEqual(5000);
    expect(release.id).toBe('release');
    expect(release.ms).toBeGreaterThan(first.ms);
  }
  const words = JSON.stringify(PARTS);
  expect(words).not.toMatch(/nín|hết sức|mạnh|cổ|ngón chân|đau/);
  for (const part of Object.values(PARTS)) expect(part.tense).toMatch(/nhẹ/);
});

test('tense mode: hands tense 5 s → release 20 s, twice, then the next part; full round completes in 3:20', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'bắt đầu');
  const secs = page.locator('#cang-seconds'), round = page.locator('#game-round');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(cue(page)).toHaveText('Nắm nhẹ hai bàn tay');
  await expect(page.locator('#cang-sub')).toHaveText('nhẹ thôi, vẫn thở bình thường');
  await expect(secs).toHaveText('còn 5 giây');
  await expect(round).toHaveText('tay · lần 1 / 2');
  await expect(page.locator('#cang-stage')).toHaveAttribute('data-part', 'tay');
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Căng nhẹ 5 giây rồi thả 20 giây.');
  await page.clock.runFor(5000);
  await expect(cue(page)).toHaveText('Thả tay ra, để ngón tay mềm');
  await expect(secs).toHaveText('còn 20 giây');
  await page.clock.runFor(20_000);
  await expect(round).toHaveText('tay · lần 2 / 2');
  await expect(cue(page)).toHaveText('Nắm nhẹ hai bàn tay');
  await page.clock.runFor(25_000);
  await expect(round).toHaveText('mặt · lần 1 / 2');
  await expect(cue(page)).toHaveText('Nhíu nhẹ trán, mím nhẹ môi');
  await expect(page.locator('#cang-stage')).toHaveAttribute('data-part', 'mat');
  await expect(page.locator('#game-dots i.is-done')).toHaveCount(1);
  await page.clock.runFor(50_000);
  await expect(cue(page)).toHaveText('Nhún nhẹ hai vai lên một chút');
  await page.clock.runFor(50_000);
  await expect(cue(page)).toHaveText('Ép nhẹ hai bàn chân xuống sàn');
  await page.clock.runFor(50_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Xong rồi. Không cần thấy khác đi.')).toBeVisible();
  await expect(page.getByText(/điểm|kỷ lục|chuỗi ngày|giỏi lắm|thất bại/)).toHaveCount(0);
});

test('skip a part while playing: moves on without failure; skipping the last part ends the game', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(2000);
  await tap(page, 'bỏ qua chỗ này');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(cue(page)).toHaveText('Nhíu nhẹ trán, mím nhẹ môi');
  await expect(page.locator('#game-round')).toHaveText('mặt · lần 1 / 2');
  await expect(page.locator('#cang-seconds')).toHaveText('còn 5 giây');
  await expect(page.locator('#game-whisper')).toHaveText('Bỏ qua tay. Không sao cả.');
  await expect(page.locator('#cang-sr-cue')).toHaveText('Nhíu nhẹ trán, mím nhẹ môi');
  // Skip while paused: stays paused on the next part; time paused is not counted.
  await tap(page, 'tạm dừng');
  await tap(page, 'bỏ qua chỗ này');
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#game-round')).toHaveText('vai · lần 1 / 2');
  await expect(page.locator('#game-whisper')).toHaveText('Bỏ qua mặt. Tiếp theo: vai, khi bạn bấm “tiếp tục”.');
  await page.clock.runFor(5 * 60_000);
  await tap(page, 'tiếp tục');
  await expect(cue(page)).toHaveText('Nhún nhẹ hai vai lên một chút');
  await expect(page.locator('#cang-seconds')).toHaveText('còn 5 giây');
  await tap(page, 'bỏ qua chỗ này');
  await expect(cue(page)).toHaveText('Ép nhẹ hai bàn chân xuống sàn');
  await tap(page, 'bỏ qua chỗ này');
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Xong rồi. Không cần thấy khác đi.')).toBeVisible();
});

test('leave out painful parts before starting; none chosen keeps "bắt đầu" disabled with a plain hint', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'tay');
  await tap(page, 'vai');
  await expect(page.getByRole('button', { name: 'tay', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('khoảng 1 phút 40 giây')).toBeVisible();
  await tap(page, 'bắt đầu');
  await expect(page.locator('#game-round')).toHaveText('mặt · lần 1 / 2');
  await expect(page.locator('#game-dots i')).toHaveCount(2);
  await page.clock.runFor(50_000);
  await expect(page.locator('#game-round')).toHaveText('chân · lần 1 / 2');
  await page.clock.runFor(50_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await tap(page, 'làm lại');
  await expect(page.getByRole('button', { name: 'tay', exact: true })).toHaveAttribute('aria-pressed', 'false'); // kept in memory only
  await tap(page, 'mặt');
  await tap(page, 'chân');
  await expect(page.getByText('chọn ít nhất một chỗ nhé')).toBeVisible();
  await expect(page.getByRole('button', { name: 'bắt đầu' })).toBeDisabled();
  await tap(page, 'chân');
  await expect(page.getByRole('button', { name: 'bắt đầu' })).toBeEnabled();
  await expect(page.getByText('khoảng 50 giây')).toBeVisible();
});

test('release-only mode: no tensing cue at all, Cục Yên does not squeeze', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'chỉ thả lỏng');
  await expect(page.getByText('không gồng gì cả · để ý 5 giây, thả lỏng 20 giây')).toBeVisible();
  await tap(page, 'bắt đầu');
  await expect(cue(page)).toHaveText('Để ý hai bàn tay');
  await expect(page.locator('#cang-sub')).toHaveText('không cần gồng');
  expect(await anim(page)).toEqual([]); // nothing to squeeze while only noticing
  const cues = new Set();
  for (let i = 0; i < 16; i++) { cues.add(await cue(page).textContent()); await page.clock.runFor(12_500); }
  expect([...cues].some(c => /Nắm|Nhíu|Nhún|Ép/.test(c))).toBe(false);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
});

test('picture follows the clock: squeeze while tensing, settle on release, frozen on pause, gone on stop', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'bắt đầu');
  let a = await anim(page);
  expect(a).toHaveLength(1);
  expect(a[0].d).toBe(5000);
  await page.clock.runFor(1600);
  await tap(page, 'tạm dừng');
  const frozen = (await anim(page))[0];
  expect(frozen.state).toBe('paused');
  await page.clock.runFor(30_000);
  expect((await anim(page))[0].t).toBe(frozen.t);
  await tap(page, 'tiếp tục');
  a = await anim(page);
  expect(a[0].t).toBeGreaterThanOrEqual(1950); // positioned from the engine clock, not restarted
  await page.clock.runFor(3000);
  a = await anim(page);
  expect(a).toHaveLength(1);
  expect(a[0].d).toBe(20_000); // release animation replaced the tense one
  await tap(page, 'dừng hẳn');
  expect(await anim(page)).toEqual([]);
  await expect(page.getByText('Mình dừng ở đây nhé.')).toBeVisible();
});

test('background tab pauses, stays paused, no catching up', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(2000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await page.clock.runFor(5 * 60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#game-paused-note')).toHaveText('Bấm “tiếp tục” khi bạn sẵn sàng. Cứ thả lỏng, thở tự nhiên.');
  await page.getByRole('button', { name: 'tiếp tục' }).click();
  await expect(cue(page)).toHaveText('Nắm nhẹ hai bàn tay');
  await expect(page.locator('#cang-seconds')).toHaveText('còn 3 giây');
});

test('reduced motion: no animation, no glow transition; the text guide still paces and completes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'bắt đầu');
  expect(await anim(page)).toEqual([]);
  expect(await page.locator('#cang-spot').evaluate(el => getComputedStyle(el).transitionDuration.split(',').every(d => parseFloat(d) === 0))).toBe(true);
  await expect(page.locator('#cang-seconds')).toHaveText('còn 5 giây');
  await page.clock.runFor(5000);
  await expect(cue(page)).toHaveText('Thả tay ra, để ngón tay mềm');
  await page.clock.runFor(200_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await context.close();
});

test('keyboard and touch: start, skip, pause, stop by keys; tap works on touch', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto(CANG);
  const start = page.getByRole('button', { name: 'bắt đầu' });
  if (testInfo.project.name === 'emulated-touch') { await page.clock.runFor(400); await start.tap(); }
  else { await start.focus(); await page.keyboard.press('Enter'); }
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(page.getByRole('button', { name: 'tạm dừng' })).toBeFocused();
  await page.clock.runFor(400);
  await page.keyboard.press(TAB(page)); // → "bỏ qua chỗ này"
  await expect(page.getByRole('button', { name: 'bỏ qua chỗ này' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#game-round')).toHaveText('mặt · lần 1 / 2');
  await page.clock.runFor(400);
  await page.keyboard.press('Shift+' + TAB(page)); // ← "tạm dừng"
  await page.keyboard.press('Space');
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await page.keyboard.press(TAB(page)); // "tiếp tục" → "bỏ qua chỗ này"
  await page.keyboard.press(TAB(page)); // → "dừng hẳn"
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
});

test('screen readers hear each phase once, politely, with the part named', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  const sr = page.locator('#cang-sr-cue');
  await expect(sr).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('#cang-stage')).toHaveAttribute('aria-hidden', 'true');
  await tap(page, 'bắt đầu');
  await expect(sr).toHaveText('Nắm nhẹ hai bàn tay');
  await page.clock.runFor(4600);
  await expect(sr).toHaveText('Thả tay ra, để ngón tay mềm');
  await page.clock.runFor(10_000);
  await expect(sr).toHaveText('Thả tay ra, để ngón tay mềm'); // not re-announced every second
  await tap(page, 'dừng hẳn');
  await expect(sr).toHaveText('');
});

test('320 px idle, running and paused: no overflow, words on one line, targets ≥ 44 px, nothing stored', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.clock.install();
  await page.goto(CANG);
  const check = async () => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const words = await page.locator('.game .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => {
      const r = el.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(el);
      return { t: el.textContent.trim(), min: Math.min(r.width, r.height), lines: range.getClientRects().length };
    }));
    expect(words.length).toBeGreaterThan(2);
    for (const w of words) { expect(w.min, w.t).toBeGreaterThanOrEqual(44); expect(w.lines, w.t).toBe(1); }
  };
  await check();
  await tap(page, 'bắt đầu');
  await check();
  await tap(page, 'tạm dừng');
  await check();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: caution and "bắt đầu" are in the first screen`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(CANG);
    for (const target of [page.getByRole('button', { name: 'bắt đầu' }), page.getByText(CAUTION)]) {
      const box = await target.boundingBox();
      expect(box.y + box.height, `${w}×${h}`).toBeLessThanOrEqual(h);
    }
  });
}

test('reflection: "khó chịu hơn" gets the rest reply, others a neutral thanks; nothing kept', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  await tap(page, 'bắt đầu');
  await tap(page, 'dừng hẳn');
  await tap(page, 'khó chịu hơn');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã nói. Cứ nghỉ và thả lỏng nhé; không cần làm lại.');
  await tap(page, 'làm lại');
  await tap(page, 'bắt đầu');
  await tap(page, 'dừng hẳn');
  await tap(page, 'không rõ');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã tự để ý một chút.');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search])).toEqual([0, 0, '', '']);
});

test('changing choices many times, then starting, runs one clean session', async ({ page }) => {
  await page.clock.install();
  await page.goto(CANG);
  for (const name of ['chỉ thả lỏng', 'tay', 'căng nhẹ rồi thả', 'tay', 'chân', 'chỉ thả lỏng']) await tap(page, name);
  await tap(page, 'bắt đầu');
  await expect(page.locator('#game-dots i')).toHaveCount(3);
  await page.clock.runFor(151_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await page.clock.runFor(10 * 60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
});
