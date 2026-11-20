// G08 (#149) Ngồi nhìn mây: real 1–3 minute timing by the engine clock, clouds that only drift while running with
// "trôi", a still sky on request or with reduced motion, "mình lơ đãng rồi" that never counts, pause/background/stop,
// reset, menu entry and small screens. page.clock fakes performance.now and timers, not the CSS animation timeline,
// so cloud motion is asserted by play state (running/paused/none) and, where it matters, by a real-time position check.
import { test, expect } from '@playwright/test';
// Safari/WebKit only moves focus through links and buttons with Option+Tab (default "Tab to highlight" is off).
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const MAY = '/lab/nhin-may/';
const tapOn = async locator => { if (test.info().project.use.hasTouch) await locator.tap(); else await locator.click(); };
const tap = async (page, name) => { await page.clock.runFor(400); await tapOn(page.getByRole('button', { name, exact: true })); };
const state = page => page.locator('#game');
const clouds = page => page.evaluate(() => [...document.querySelectorAll('.nm-cloud')].map(c => c.getAnimations().map(a => a.playState).join() || 'none'));
const cloudX = page => page.evaluate(() => [...document.querySelectorAll('.nm-cloud')].map(c => c.getBoundingClientRect().x));

test('reachable from the room: the book\'s second spread links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await tapOn(page.getByRole('button', { name: 'Mở thực đơn trò chơi' }));
  await tapOn(page.getByRole('button', { name: 'Trang sau' }));
  const link = page.getByRole('link', { name: 'Ngồi nhìn mây' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await tapOn(link);
  await expect(page).toHaveURL(/\/lab\/nhin-may\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Ngồi nhìn mây' })).toBeVisible();
});

test('idle: caution beside start, 1 minute and drifting clouds by default, nothing moves or runs before a tap', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await expect(page.getByText('Ngồi xem mây một lát.')).toBeVisible();
  await expect(page.getByText('Mỏi mắt hay chóng mặt thì cho mây đứng yên, nhìn ra xa, hoặc dừng lúc nào cũng được.')).toBeVisible();
  await expect(page.getByRole('button', { name: '1 phút' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'trôi', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.nm-cloud')).toHaveCount(4);
  expect(await clouds(page)).toEqual(['paused', 'paused', 'paused', 'paused']); // a still sky until the guest starts
  await page.clock.runFor(60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'idle'); // never auto-starts
  await expect(page.getByRole('button', { name: 'mình lơ đãng rồi' })).toBeHidden();
});

test('1 minute: clouds drift, time counts down, lơ đãng is answered gently and never counted, then it completes', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await tap(page, 'bắt đầu');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(page.locator('#game-cue')).toHaveText('Nhìn một đám mây');
  await expect(page.locator('#nm-left')).toHaveText('còn 1:00');
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Cứ nhìn mây, không cần làm gì thêm.');
  expect(await clouds(page)).toEqual(['running', 'running', 'running', 'running']);
  await page.clock.runFor(1000);
  await expect(page.locator('#nm-left')).toHaveText('còn 0:59');
  const lines = [];
  for (let i = 0; i < 5; i++) { await tap(page, 'mình lơ đãng rồi'); lines.push(await page.locator('#game-whisper').textContent()); }
  const { WANDER } = await page.evaluate(async () => ({ WANDER: (await import('/lab/nhin-may/nhin-may.mjs')).WANDER }));
  expect(lines).toEqual([...WANDER, WANDER[0]]); // fixed gentle lines in turn
  await expect(page.getByText(/\d+ lần|điểm|tập trung tốt|kỷ lục|giỏi lắm/)).toHaveCount(0); // never a count or score
  await expect(state(page)).toHaveAttribute('data-state', 'running'); // wandering changes nothing about the game
  await page.clock.runFor(60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Hết giờ rồi. Ngồi thêm hay đi lúc nào cũng được.')).toBeVisible();
  await expect(page.locator('#nm-result-line')).toBeFocused(); // a stray Enter must not restart
  expect(await clouds(page)).toEqual(['paused', 'paused', 'paused', 'paused']);
  await expect(page.getByText('Nếu muốn, lúc này bạn thấy sao?')).toBeVisible();
});

test('clouds really move while running and stand still when paused (real time)', async ({ page }) => {
  await page.goto(MAY);
  await tapOn(page.getByRole('button', { name: 'bắt đầu' }));
  const a = await cloudX(page);
  await page.waitForTimeout(1500);
  const b = await cloudX(page);
  for (let i = 0; i < 4; i++) {
    expect(b[i] - a[i]).toBeGreaterThan(0.5); // left to right…
    expect(b[i] - a[i]).toBeLessThan(15); // …and slowly: well under 10 px a second at this width
  }
  await page.waitForTimeout(400);
  await tapOn(page.getByRole('button', { name: 'tạm dừng' }));
  const c = await cloudX(page);
  await page.waitForTimeout(1200);
  const d = await cloudX(page);
  for (let i = 0; i < 4; i++) expect(Math.abs(d[i] - c[i])).toBeLessThan(0.5); // (a sub-pixel step can land in the pausing frame)
});

test('a double tap on "bắt đầu" starts once and does not answer "mình lơ đãng rồi" that appears under the finger', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await page.clock.runFor(400);
  const start = page.getByRole('button', { name: 'bắt đầu' });
  const box = await start.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const wander = page.getByRole('button', { name: 'mình lơ đãng rồi' });
  await wander.click(); // the second tap of the burst
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Cứ nhìn mây, không cần làm gì thêm.');
  await page.clock.runFor(400);
  await wander.click(); // a real tap later is answered
  await expect(page.locator('#game-whisper')).toHaveText('Không sao. Nhìn lại một đám mây nào đó.');
});

test('"đứng yên" keeps the sky still while the clock still runs to the end; 3 minutes', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await tap(page, 'đứng yên');
  await tap(page, '3 phút');
  await tap(page, 'bắt đầu');
  await expect(page.locator('#nm-left')).toHaveText('còn 3:00');
  expect(await clouds(page)).toEqual(['paused', 'paused', 'paused', 'paused']);
  await page.clock.runFor(179_000);
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(page.locator('#nm-left')).toHaveText('còn 0:01');
  await page.clock.runFor(1500);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await tap(page, 'làm lại');
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.getByRole('button', { name: 'đứng yên' })).toHaveAttribute('aria-pressed', 'true'); // kept in page memory only
  await expect(page.getByRole('button', { name: '3 phút' })).toHaveAttribute('aria-pressed', 'true');
});

test('pause, resume and stop: time while paused is not counted; stop shows the after-game question', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(10_000);
  await tap(page, 'tạm dừng');
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  expect(await clouds(page)).toEqual(['paused', 'paused', 'paused', 'paused']);
  const left = await page.locator('#nm-left').textContent();
  await page.clock.runFor(120_000);
  await expect(page.locator('#nm-left')).toHaveText(left);
  await expect(page.getByText('Mây chờ bạn.')).toBeVisible();
  await tap(page, 'tiếp tục');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await tap(page, 'dừng hẳn');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé.')).toBeVisible();
  await tap(page, 'khó chịu hơn');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã nói. Cứ nghỉ mắt, nhìn ra xa một chút nhé; không cần làm lại.');
  await expect(page.getByRole('button', { name: 'làm lại' })).toBeFocused();
  await expect(page.getByText('Nếu muốn, lúc này bạn thấy sao?')).toBeHidden(); // the answer is not kept
});

test('background tab pauses the clock and the clouds, stays paused, no catching up', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(5000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  expect(await clouds(page)).toEqual(['paused', 'paused', 'paused', 'paused']);
  await page.clock.runFor(5 * 60_000);
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await expect(page.getByText('Bấm “tiếp tục” khi bạn sẵn sàng. Mây chờ bạn.')).toBeVisible();
  await expect(page.locator('#nm-left')).toHaveText('còn 0:55');
  await expect(page.getByRole('button', { name: 'tiếp tục' })).toBeFocused();
});

test('reduced motion: the sky never moves, the drift choice is not offered, the game still completes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(MAY);
  await expect(page.getByRole('button', { name: 'trôi', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'đứng yên' })).toBeHidden();
  // the caution never points at the hidden choice
  await expect(page.getByText('Mỏi mắt hay chóng mặt thì nhìn ra xa, hoặc dừng lúc nào cũng được.')).toBeVisible();
  await expect(page.getByText('cho mây đứng yên', { exact: false })).toBeHidden();
  // the still sky still shows four clouds inside it
  const sky = await page.locator('#nm-sky').boundingBox();
  for (const box of await page.locator('.nm-cloud').evaluateAll(list => list.map(c => c.getBoundingClientRect().toJSON()))) {
    expect(box.width).toBeGreaterThan(20);
    expect(box.x + box.width / 2).toBeGreaterThan(sky.x);
    expect(box.x + box.width / 2).toBeLessThan(sky.x + sky.width);
  }
  await page.clock.runFor(400);
  await page.getByRole('button', { name: 'bắt đầu' }).click();
  expect(await clouds(page)).toEqual(['none', 'none', 'none', 'none']);
  await expect(page.locator('#nm-left')).toHaveText('còn 1:00');
  await page.clock.runFor(61_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await context.close();
});

test('keyboard: choose, start, wander, pause and stop by keys; a held Enter acts once', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'emulated-touch', 'keyboard path on desktop');
  await page.clock.install();
  await page.goto(MAY);
  await page.getByRole('button', { name: '2 phút' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '2 phút' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'bắt đầu' }).focus();
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(page.getByRole('button', { name: 'mình lơ đãng rồi' })).toBeFocused(); // first word on screen
  await page.clock.runFor(400);
  await page.keyboard.press('Enter');
  await expect(page.locator('#game-whisper')).toHaveText('Không sao. Nhìn lại một đám mây nào đó.');
  await page.keyboard.press(TAB(page)); // → "tạm dừng"
  await page.keyboard.press('Space');
  await expect(state(page)).toHaveAttribute('data-state', 'paused');
  await page.clock.runFor(400);
  await page.keyboard.down('Enter'); // focus is on "tiếp tục": hold Enter
  await page.keyboard.down('Enter'); // auto-repeat
  await page.keyboard.up('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'running'); // resumed once, not paused again
  await page.keyboard.press(TAB(page)); // → "tạm dừng"
  await page.keyboard.press(TAB(page)); // → "dừng hẳn"
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
});

test('320 px: nothing overflows, words stay on one line, targets ≥ 44 px, nothing stored or sent', async ({ page }) => {
  const sent = [];
  page.on('request', r => sent.push(r.url()));
  await page.setViewportSize({ width: 320, height: 640 });
  await page.clock.install();
  await page.goto(MAY);
  await page.waitForLoadState('load');
  const before = sent.length;
  const check = async label => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label).toBe(true);
    const words = await page.locator('.game .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => {
      const r = el.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(el);
      return { t: el.textContent.trim(), min: Math.min(r.width, r.height), lines: range.getClientRects().length };
    }));
    for (const w of words) { expect(w.min, `${label}: ${w.t}`).toBeGreaterThanOrEqual(44); expect(w.lines, `${label}: ${w.t}`).toBe(1); }
  };
  await check('idle');
  await tap(page, 'bắt đầu');
  await check('running');
  await tap(page, 'mình lơ đãng rồi');
  await tap(page, 'tạm dừng');
  await check('paused');
  await tap(page, 'dừng hẳn');
  await check('stopped');
  expect(sent.slice(before).filter(u => !u.endsWith('/favicon.svg'))).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: caution and "bắt đầu" are in the first screen; while running, the sky and every word are too`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.clock.install();
    await page.goto(MAY);
    for (const target of [page.getByRole('button', { name: 'bắt đầu' }), page.locator('.nm-caution-drift')]) {
      const box = await target.boundingBox();
      expect(box.y + box.height, `${w}×${h} idle`).toBeLessThanOrEqual(h);
    }
    await tap(page, 'bắt đầu');
    await page.evaluate(() => scrollTo(0, 0));
    for (const target of [page.locator('#nm-sky'), page.getByRole('button', { name: 'mình lơ đãng rồi' }), page.getByRole('button', { name: 'tạm dừng' }), page.getByRole('button', { name: 'dừng hẳn' })]) {
      const box = await target.boundingBox();
      expect(box.y + box.height, `${w}×${h} running`).toBeLessThanOrEqual(h);
    }
  });
}

test('leaving and coming back from the back/forward cache starts fresh', async ({ page }) => {
  await page.clock.install();
  await page.goto(MAY);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(5000);
  // Playwright has no real bfcache: dispatch the events the browser would send.
  await page.evaluate(() => { dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#nm-left')).toHaveText('');
});
