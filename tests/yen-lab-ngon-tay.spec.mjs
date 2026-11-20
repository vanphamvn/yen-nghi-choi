// G04 (#145) Ngón tay biết thở: own-pace finger tracing with no timer. Progress comes only from the guest (any movement
// on the hand, no precision) or "tiếp"; up = breathe in, down = breathe out; pointer cancel/capture loss keep progress;
// keyboard and screen-reader route; one or two rounds; stop/reset; small screens; nothing kept or sent.
import { test, expect } from '@playwright/test';
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const NT = '/lab/ngon-tay/';
const tapOn = async locator => { if (test.info().project.use.hasTouch) await locator.tap(); else await locator.click(); };
const settle = page => page.waitForTimeout(450);
const word = (page, name) => page.getByRole('button', { name, exact: true });
const press = async (page, name) => { await settle(page); await tapOn(word(page, name)); };
const state = page => page.locator('#game');
const where = page => page.locator('#nt-where');
// Synthetic pointer events on the hand, in CSS pixels from its top-left corner.
const pointer = (page, type, x, y, init = {}) => page.evaluate(([type, x, y, init]) => {
  const h = document.getElementById('nt-hand'), b = h.getBoundingClientRect();
  h.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, bubbles: true, clientX: b.left + x, clientY: b.top + y, ...init }));
}, [type, x, y, init]);
async function wiggle(page, px, end = 'pointerup', init = {}) { // move about px pixels in small, uneven steps
  await pointer(page, 'pointerdown', 60, 60, init);
  let x = 60, y = 60, moved = 0, i = 0;
  while (moved < px) { const dx = (i % 3) - 1 || 2, dy = i % 2 ? 3 : -3; x += dx; y += dy; moved += Math.hypot(dx, dy); i++; await pointer(page, 'pointermove', x, y, init); }
  await pointer(page, end, x, y, init);
}
// The same rubbing, all in one go inside the page (a real quick scribble: a few hundred moves within milliseconds).
const scribble = (page, px) => page.evaluate(px => {
  const h = document.getElementById('nt-hand'), b = h.getBoundingClientRect();
  const fire = (type, x, y) => h.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, bubbles: true, clientX: b.left + x, clientY: b.top + y }));
  let x = 60, y = 60, moved = 0, i = 0;
  fire('pointerdown', x, y);
  while (moved < px) { const dx = i % 2 ? 6 : -6; x += dx; y += i % 3 ? 2 : -2; moved += Math.hypot(dx, 2); i++; fire('pointermove', x, y); }
  fire('pointerup', x, y);
}, px);
async function start(page) {
  await page.goto(NT);
  await settle(page);
  await tapOn(word(page, 'bắt đầu'));
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await page.evaluate(() => scrollTo(0, 0));
  await settle(page);
}

test('reachable from the room: the book\'s second spread links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await tapOn(page.getByRole('button', { name: 'Mở thực đơn trò chơi' }));
  await tapOn(page.getByRole('button', { name: 'Trang sau' }));
  const link = page.getByRole('link', { name: 'Ngón tay biết thở' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await tapOn(link);
  await expect(page).toHaveURL(/\/lab\/ngon-tay\/$/);
});

test('idle: breathing caution and own-pace line beside start; nothing runs by itself', async ({ page }) => {
  await page.goto(NT);
  await expect(page.getByText('Thử đi ngón tay theo nhịp riêng.')).toBeVisible();
  await expect(page.getByText('Không cần hít sâu hay nín thở. Nếu chóng mặt, hụt hơi hoặc khó chịu, hãy dừng và thở tự nhiên.', { exact: false })).toBeVisible();
  await expect(page.getByText('Thở theo nhịp của bạn, ngón tay đi theo hơi thở.', { exact: false })).toBeVisible();
  await expect(word(page, 'một lượt')).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(1500);
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  // the module never cues a hold, and up/down alternate breathe in / out
  const cues = await page.evaluate(async () => { const m = await import('/lab/ngon-tay/ngon-tay.mjs'); return Array.from({ length: m.LEGS }, (_, i) => m.legCue(i).breath); });
  expect(cues).toEqual(Array.from({ length: 10 }, (_, i) => (i % 2 ? 'thở ra nhẹ' : 'hít vào nhẹ')));
});

test('own pace: nothing moves while the guest waits; "tiếp" walks all ten legs with the right cues, then completes', async ({ page }) => {
  await start(page);
  await expect(page.locator('#game-cue')).toHaveText('hít vào nhẹ');
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5');
  await page.waitForTimeout(3000);
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5'); // no timer: waiting never moves on
  const seen = [];
  for (let i = 0; i < 10; i++) {
    seen.push([await page.locator('#game-cue').textContent(), await where(page).textContent()]);
    await press(page, 'tiếp');
  }
  expect(seen[1]).toEqual(['thở ra nhẹ', 'ngón út · xuống · 1 / 5']);
  expect(seen[4]).toEqual(['hít vào nhẹ', 'ngón giữa · lên · 3 / 5']);
  expect(seen[8]).toEqual(['hít vào nhẹ', 'ngón cái · lên · 5 / 5']);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Xong rồi. Không cần thấy khác đi.')).toBeVisible();
  await expect(page.locator('#nt-result-line')).toBeFocused();
  await expect(page.getByText('Nếu muốn, lúc này bạn thấy sao?')).toBeVisible();
  await expect(page.getByText(/điểm|kỷ lục|chuỗi ngày|giỏi lắm/)).toHaveCount(0);
});

test('tracing needs no precision: small shaky movements anywhere on the hand move the marker, in any direction', async ({ page }) => {
  await start(page);
  const marker = () => page.evaluate(() => [document.getElementById('nt-marker').getAttribute('cx'), document.getElementById('nt-marker').getAttribute('cy')].map(Number));
  const m0 = await marker();
  await wiggle(page, 25);
  expect(await marker()).not.toEqual(m0); // moved part-way along the first leg
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5');
  await page.waitForTimeout(2100); // a calm breath later, enough wobbly movement finishes the leg
  await wiggle(page, 200);
  await expect(where(page)).toHaveText('ngón út · xuống · 1 / 5');
});

test('a fast scribble never rushes the breath: one long quick gesture moves at most one leg and announces at most once', async ({ page }) => {
  await start(page);
  await page.waitForTimeout(2100);
  const said = [];
  await page.exposeFunction('noteSr', t => said.push(t));
  await page.evaluate(() => new MutationObserver(() => window.noteSr(document.getElementById('nt-sr').textContent)).observe(document.getElementById('nt-sr'), { childList: true, characterData: true, subtree: true }));
  await scribble(page, 3000); // a whole round's worth of rubbing in one quick go
  await expect(where(page)).toHaveText('ngón út · xuống · 1 / 5'); // one leg, not ten
  await page.waitForTimeout(200);
  expect(said).toEqual(['Xuống ngón út: thở ra nhẹ.']);
  await scribble(page, 3000); // straight away again: the new leg is not over yet
  await expect(where(page)).toHaveText('ngón út · xuống · 1 / 5');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
});

test('pointer cancel and lost capture keep the progress so far; a second finger does not add', async ({ page }) => {
  await start(page);
  await wiggle(page, 30, 'pointercancel');
  const afterCancel = await page.locator('#nt-done').getAttribute('points');
  expect(afterCancel).not.toBe(''); // progress so far is kept
  await pointer(page, 'pointerdown', 60, 60);
  await pointer(page, 'pointermove', 64, 64);
  await pointer(page, 'lostpointercapture', 64, 64);
  const afterLoss = await page.locator('#nt-done').getAttribute('points');
  for (let i = 0; i < 10; i++) await pointer(page, 'pointermove', 64 + i * 5, 64); // moves after losing capture do nothing
  expect(await page.locator('#nt-done').getAttribute('points')).toBe(afterLoss);
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  // second finger while the first is down: ignored
  await pointer(page, 'pointerdown', 60, 60);
  const before = await page.locator('#nt-done').getAttribute('points');
  await pointer(page, 'pointerdown', 120, 120, { pointerId: 2, isPrimary: false });
  for (let i = 0; i < 30; i++) await pointer(page, 'pointermove', 120 + i * 4, 120, { pointerId: 2, isPrimary: false });
  expect(await page.locator('#nt-done').getAttribute('points')).toBe(before);
  await pointer(page, 'pointerup', 60, 60);
});

test('two rounds: twenty legs, the round shows, then complete', async ({ page }) => {
  await page.goto(NT);
  await press(page, 'hai lượt');
  await press(page, 'bắt đầu');
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5 · lượt 1 / 2');
  for (let i = 0; i < 10; i++) await press(page, 'tiếp');
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5 · lượt 2 / 2');
  for (let i = 0; i < 10; i++) await press(page, 'tiếp');
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
});

test('stop at any time, again starts over; the reflection keeps nothing', async ({ page }) => {
  await start(page);
  await press(page, 'tiếp'); await press(page, 'tiếp');
  await press(page, 'dừng hẳn');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé.')).toBeVisible();
  await expect(word(page, 'làm lại')).toBeFocused();
  await press(page, 'khó chịu hơn');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã nói. Cứ nghỉ và thở tự nhiên nhé; không cần làm lại.');
  await press(page, 'làm lại');
  await press(page, 'bắt đầu');
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5');
});

test('keyboard and screen reader: "tiếp" is the route, each leg is announced once, a held Enter moves one leg', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'emulated-touch', 'keyboard path on desktop');
  await page.goto(NT);
  await settle(page);
  await word(page, 'bắt đầu').focus();
  await page.keyboard.press('Enter');
  await expect(word(page, 'tiếp')).toBeFocused();
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Thở theo nhịp của bạn. Lên ngón út: hít vào nhẹ.');
  await expect(page.locator('#nt-sr')).toHaveText(''); // one live update on start, not two
  await expect(page.locator('#nt-sr')).toHaveAttribute('aria-live', 'polite');
  await settle(page);
  await page.keyboard.down('Enter'); await page.keyboard.down('Enter'); await page.keyboard.down('Enter'); await page.keyboard.up('Enter');
  await expect(page.locator('#nt-sr')).toHaveText('Xuống ngón út: thở ra nhẹ.'); // one leg, not three
  await settle(page);
  await page.keyboard.press(TAB(page)); // → dừng hẳn
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
});

test('a double tap on "bắt đầu" starts once and does not trace or press what appears under the finger', async ({ page }) => {
  await page.goto(NT);
  await settle(page);
  const box = await word(page, 'bắt đầu').boundingBox();
  await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(where(page)).toHaveText('ngón út · lên · 1 / 5');
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: caution and start in the first screen; while tracing, hand, cue, "tiếp" and stop fit, no overflow, targets ≥ 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(NT);
    for (const t of [word(page, 'bắt đầu'), page.getByText('hãy dừng và thở tự nhiên', { exact: false })]) {
      const b = await t.boundingBox();
      expect(b.y + b.height, `${w}×${h} idle`).toBeLessThanOrEqual(h);
    }
    await settle(page);
    await tapOn(word(page, 'bắt đầu'));
    await page.evaluate(() => scrollTo(0, 0));
    for (const t of [page.locator('#nt-hand'), page.locator('#game-cue'), word(page, 'tiếp'), word(page, 'dừng hẳn')]) {
      const b = await t.boundingBox();
      expect(b.y + b.height, `${w}×${h} running`).toBeLessThanOrEqual(h);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const words = await page.locator('.game .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => {
      const r = el.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(el);
      return { t: el.textContent.trim(), min: Math.min(r.width, r.height), lines: range.getClientRects().length };
    }));
    for (const x of words) { expect(x.min, x.t).toBeGreaterThanOrEqual(44); expect(x.lines, x.t).toBe(1); }
  });
}

test('reduced motion: nothing animates, the game completes the same way', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(NT);
  await page.waitForTimeout(450);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(450); await page.getByRole('button', { name: 'tiếp', exact: true }).click(); }
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await context.close();
});

test('nothing kept or sent; leaving starts over', async ({ page }) => {
  const sent = [];
  page.on('request', r => sent.push(r.url()));
  await start(page);
  await page.waitForLoadState('load');
  await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
  const before = sent.length;
  await wiggle(page, 120);
  await press(page, 'tiếp');
  expect(sent.slice(before).filter(u => !u.endsWith('/favicon.svg'))).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);
  await page.evaluate(() => { dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
});
