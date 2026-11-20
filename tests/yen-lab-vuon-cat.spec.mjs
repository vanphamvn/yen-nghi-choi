// G06 (#147) Vườn cát không mục tiêu: a real canvas you rake and set stones on, with undo, an undoable "làm phẳng",
// "xong" and "dừng hẳn"; the same marks by ink words for keyboard / screen reader / no finger; pointer edge cases
// (cancel, lost capture, a second finger, pen pressure); small screens; nothing kept or sent; a no-canvas fallback.
// Pixels are compared through canvas.toDataURL(), so "undo restores" means the exact same picture.
import { test, expect } from '@playwright/test';
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const CAT = '/lab/vuon-cat/';
const tapOn = async locator => { if (test.info().project.use.hasTouch) await locator.tap(); else await locator.click(); };
const settle = page => page.waitForTimeout(450); // words under a finger drop taps for 400 ms on purpose
const word = (page, name) => page.getByRole('button', { name, exact: true });
const press = async (page, name) => { await settle(page); await tapOn(word(page, name)); };
const state = page => page.locator('#game');
const sand = page => page.evaluate(() => document.getElementById('vc-sand').toDataURL());
const items = page => page.evaluate(() => document.getElementById('vc-items').toDataURL());
const label = page => page.locator('#vc-tray').getAttribute('aria-label');
const opaque = page => page.evaluate(() => { const c = document.getElementById('vc-items'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });

// Synthetic pointer events (any pointer type, cancel, capture loss, two fingers) on the top canvas, at tray fractions.
const pointer = (page, type, x, y, init = {}) => page.evaluate(([type, x, y, init]) => {
  const t = document.getElementById('vc-items'), b = t.getBoundingClientRect();
  t.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, bubbles: true, clientX: b.left + x * b.width, clientY: b.top + y * b.height, ...init }));
}, [type, x, y, init]);
async function synthStroke(page, y, init = {}, end = 'pointerup') {
  await pointer(page, 'pointerdown', 0.1, y, init);
  for (let i = 1; i <= 20; i++) await pointer(page, 'pointermove', 0.1 + i * 0.04, y + Math.sin(i / 3) * 0.04, init);
  await pointer(page, end, 0.9, y, init);
}
// A real mouse drag across the tray.
async function drag(page, y) {
  const box = await page.locator('#vc-tray').boundingBox();
  await page.mouse.move(box.x + box.width * 0.12, box.y + box.height * y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + box.width * (0.12 + i * 0.06), box.y + box.height * (y + Math.sin(i / 2) * 0.05));
  await page.mouse.up();
}
async function start(page) {
  await page.goto(CAT);
  await settle(page);
  await tapOn(word(page, 'bắt đầu'));
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await page.evaluate(() => scrollTo(0, 0));
  await settle(page); // the tray drops touches for 400 ms after it appears where "bắt đầu" was
}

test('reachable from the room: the book\'s second spread links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await tapOn(page.getByRole('button', { name: 'Mở thực đơn trò chơi' }));
  await tapOn(page.getByRole('button', { name: 'Trang sau' }));
  const link = page.getByRole('link', { name: 'Vườn cát không mục tiêu' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await tapOn(link);
  await expect(page).toHaveURL(/\/lab\/vuon-cat\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Vườn cát không mục tiêu' })).toBeVisible();
});

test('idle: copy beside start, no tray yet, nothing moves or draws by itself', async ({ page }) => {
  await page.goto(CAT);
  await expect(page.getByText('Vẽ vài nét, thích thì xoá.')).toBeVisible();
  await expect(page.getByText('Không có hình đúng hay sai, không chấm điểm.', { exact: false })).toBeVisible();
  await expect(page.getByText('Không có gì tự chuyển động.', { exact: false })).toBeVisible();
  await expect(page.locator('#vc-tray')).toBeHidden();
  await page.waitForTimeout(1200);
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  expect(await page.evaluate(() => document.getAnimations().filter(a => !(a instanceof CSSTransition)).length)).toBe(0);
});

test('raking with the mouse really draws; undo restores the exact picture; the description follows', async ({ page }) => {
  await start(page);
  const flat = await sand(page);
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát phẳng, chưa có gì.');
  await drag(page, 0.3);
  const one = await sand(page);
  expect(one).not.toBe(flat);
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 1 đường cào.');
  await drag(page, 0.7);
  expect(await sand(page)).not.toBe(one);
  await press(page, 'hoàn tác');
  expect(await sand(page)).toBe(one);
  await press(page, 'hoàn tác');
  expect(await sand(page)).toBe(flat);
  await press(page, 'hoàn tác');
  await expect(page.locator('#game-whisper')).toHaveText('Chưa có gì để hoàn tác.');
});

test('stones sit on their own layer: a groove drawn over them never paints over the stone', async ({ page }) => {
  await start(page);
  await press(page, 'đá');
  await expect(word(page, 'đá')).toHaveAttribute('aria-pressed', 'true');
  const box = await page.locator('#vc-tray').boundingBox();
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect.poll(() => opaque(page)).toBeGreaterThan(200);
  // the paper around the stones is keyed out: the corners of where it was drawn stay see-through
  expect(await page.evaluate(() => {
    const c = document.getElementById('vc-items'), g = c.getContext('2d'), w = c.width * 0.2, h = w * 35 / 46;
    const x0 = Math.round(c.width * 0.5 - w / 2) + 2, y0 = Math.round(c.height * 0.5 - h / 2) + 2;
    return [g.getImageData(x0, y0, 1, 1).data[3], g.getImageData(Math.round(x0 + w - 5), y0, 1, 1).data[3]];
  })).toEqual([0, 0]);
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 1 thứ đặt lên.');
  const stones = await items(page);
  await press(page, 'cào');
  await drag(page, 0.5); // straight through the stone
  expect(await items(page)).toBe(stones);
  await press(page, 'vỏ sò');
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.75);
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 1 đường cào và 2 thứ đặt lên.');
  await press(page, 'hoàn tác');
  expect(await items(page)).toBe(stones);
});

test('"làm phẳng" flattens everything and can itself be undone; flat sand says so', async ({ page }) => {
  await start(page);
  const flat = await sand(page);
  await press(page, 'thêm vòng');
  await press(page, 'thêm đá');
  const garden = [await sand(page), await items(page)];
  await press(page, 'làm phẳng');
  expect(await sand(page)).toBe(flat);
  expect(await opaque(page)).toBe(0);
  await expect(page.locator('#game-whisper')).toHaveText('Đã làm phẳng cát. Hoàn tác nếu muốn lấy lại.');
  await press(page, 'làm phẳng');
  await expect(page.locator('#game-whisper')).toHaveText('Cát đang phẳng rồi.');
  await press(page, 'hoàn tác');
  expect([await sand(page), await items(page)]).toEqual(garden);
});

test('keyboard only: choose, add a ring, a wave and a stone, undo, finish; focus never lost; a held Enter acts once', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'emulated-touch', 'keyboard path on desktop');
  await page.goto(CAT);
  await settle(page);
  await word(page, 'bắt đầu').focus();
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(word(page, 'cào')).toBeFocused();
  const flat = await sand(page);
  await settle(page);
  await word(page, 'thêm vòng').focus();
  await page.keyboard.down('Enter'); await page.keyboard.down('Enter'); await page.keyboard.up('Enter'); // held: one ring
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 1 đường cào.');
  await expect(page.locator('#game-whisper')).toHaveText('Đã thêm một vòng.');
  await page.keyboard.press(TAB(page)); // → thêm sóng
  await page.keyboard.press('Enter');
  await page.keyboard.press(TAB(page)); // → thêm đá
  await page.keyboard.press('Enter');
  await expect(page.locator('#game-whisper')).toHaveText('Đã đặt hai viên đá.');
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 2 đường cào và 1 thứ đặt lên.');
  await page.keyboard.press(TAB(page)); // → hoàn tác
  await page.keyboard.press('Enter');
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 2 đường cào.');
  await page.keyboard.press(TAB(page)); // → làm phẳng
  await page.keyboard.press(TAB(page)); // → xong
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#vc-result-line')).toBeFocused();
  await page.keyboard.press('Enter'); // a stray Enter on the result does nothing
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  expect(await sand(page)).not.toBe(flat); // the garden stays on screen to look at
});

test('each play starts with the rake, even after choosing the shell last time', async ({ page }) => {
  await start(page);
  await press(page, 'vỏ sò');
  await press(page, 'xong');
  await press(page, 'chơi lại');
  await press(page, 'bắt đầu');
  await expect(word(page, 'cào')).toHaveAttribute('aria-pressed', 'true');
  await expect(word(page, 'vỏ sò')).toHaveAttribute('aria-pressed', 'false');
  await settle(page);
  await drag(page, 0.5);
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 1 đường cào.');
});

test('xong keeps the garden to look at; chơi lại flattens it; dừng hẳn flattens it at once', async ({ page }) => {
  await start(page);
  const flat = await sand(page);
  await press(page, 'thêm sóng');
  await press(page, 'xong');
  await expect(page.getByText('Vườn của bạn đó.')).toBeVisible();
  await expect(page.locator('#vc-tray')).toBeVisible();
  await expect(page.getByText('Nếu muốn, lúc này bạn thấy sao?')).toBeVisible();
  await press(page, 'chơi lại');
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await press(page, 'bắt đầu');
  expect(await sand(page)).toBe(flat);
  await press(page, 'thêm vòng');
  await press(page, 'dừng hẳn');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé. Cát đã phẳng lại.')).toBeVisible();
  await expect(word(page, 'chơi lại')).toBeFocused();
  await press(page, 'khó chịu hơn');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã nói. Cứ nghỉ một chút nhé; không cần làm gì thêm.');
  await press(page, 'chơi lại');
  await press(page, 'bắt đầu');
  expect(await sand(page)).toBe(flat);
});

test('pointer edge cases: touch and pen draw alike at any pressure; cancel or lost capture keeps the groove so far; a second finger is ignored', async ({ page }) => {
  await start(page);
  const flat = await sand(page);
  await synthStroke(page, 0.3, { pointerType: 'pen', pressure: 0 });
  const pen0 = await sand(page);
  await press(page, 'hoàn tác');
  await synthStroke(page, 0.3, { pointerType: 'pen', pressure: 1 });
  expect(await sand(page)).toBe(pen0); // pressure is ignored
  await press(page, 'hoàn tác');
  await synthStroke(page, 0.3, { pointerType: 'touch' });
  expect(await sand(page)).toBe(pen0);
  await synthStroke(page, 0.6, {}, 'pointercancel');
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 2 đường cào.');
  await synthStroke(page, 0.8, {}, 'lostpointercapture');
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 3 đường cào.');
  // A second finger lands while the first draws: only the first finger's groove counts.
  await pointer(page, 'pointerdown', 0.2, 0.15);
  await pointer(page, 'pointerdown', 0.6, 0.15, { pointerId: 2, isPrimary: false });
  await pointer(page, 'pointermove', 0.7, 0.2, { pointerId: 2, isPrimary: false });
  await pointer(page, 'pointerup', 0.7, 0.2, { pointerId: 2, isPrimary: false });
  await pointer(page, 'pointermove', 0.5, 0.15);
  await pointer(page, 'pointerup', 0.5, 0.15);
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 4 đường cào.');
  expect(await sand(page)).not.toBe(flat);
});

test('a double tap on "bắt đầu" starts once and does not press what appears under the finger', async ({ page }) => {
  await page.goto(CAT);
  await settle(page);
  const box = await word(page, 'bắt đầu').boundingBox();
  await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Kéo trên cát để cào, hoặc chọn đá rồi chạm để đặt.');
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát phẳng, chưa có gì.');
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: start in the first screen; while raking the tray, tools and controls fit with no overflow, targets ≥ 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(CAT);
    const startBox = await word(page, 'bắt đầu').boundingBox();
    expect(startBox.y + startBox.height).toBeLessThanOrEqual(h);
    await settle(page);
    await tapOn(word(page, 'bắt đầu'));
    await page.evaluate(() => scrollTo(0, 0));
    for (const target of [page.locator('#vc-tray'), word(page, 'cào'), word(page, 'thêm vòng'), word(page, 'hoàn tác'), word(page, 'xong')]) {
      const box = await target.boundingBox();
      expect(box.y + box.height, `${w}×${h}`).toBeLessThanOrEqual(h);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const words = await page.locator('.game .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => {
      const r = el.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(el);
      return { t: el.textContent.trim(), min: Math.min(r.width, r.height), lines: range.getClientRects().length };
    }));
    for (const x of words) { expect(x.min, x.t).toBeGreaterThanOrEqual(44); expect(x.lines, x.t).toBe(1); }
    // the canvas is drawn at the tray's real size (crisp), at most 2× pixel ratio
    const c = await page.evaluate(() => { const s = document.getElementById('vc-sand'), b = s.getBoundingClientRect(); return { cw: s.width, bw: b.width }; });
    expect(c.cw / c.bw).toBeGreaterThanOrEqual(0.99);
    expect(c.cw / c.bw).toBeLessThanOrEqual(2.01);
  });
}

test('320 px performance: forty long grooves, then undo and "làm phẳng" redraw quickly', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await start(page);
  const t0 = Date.now();
  await page.evaluate(() => {
    const t = document.getElementById('vc-items'), b = t.getBoundingClientRect();
    const fire = (type, x, y) => t.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: b.left + x * b.width, clientY: b.top + y * b.height }));
    for (let s = 0; s < 40; s++) {
      const y = 0.05 + (s % 20) * 0.045;
      fire('pointerdown', 0.05, y);
      for (let i = 1; i <= 60; i++) fire('pointermove', 0.05 + i * 0.015, y + Math.sin(i / 5) * 0.03);
      fire('pointerup', 0.95, y);
    }
  });
  expect(Date.now() - t0).toBeLessThan(8000); // generous: CI machines vary; a hang or quadratic blow-up would exceed it
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát có 40 đường cào.');
  const ms = await page.evaluate(async () => {
    const undo = document.querySelector('[data-act="undo"]');
    await new Promise(r => setTimeout(r, 450));
    const a = performance.now(); undo.click(); return performance.now() - a;
  });
  expect(ms).toBeLessThan(500);
});

test('nothing kept or sent: storage, cookies, URL and network stay empty; leaving flattens the sand', async ({ page }) => {
  const sent = [];
  page.on('request', r => sent.push(r.url()));
  await start(page);
  await page.waitForLoadState('load');
  await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
  const before = sent.length;
  await drag(page, 0.4);
  await press(page, 'đá');
  const box = await page.locator('#vc-tray').boundingBox();
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.6);
  await press(page, 'thêm vòng');
  await press(page, 'xong');
  expect(sent.slice(before).filter(u => !u.endsWith('/favicon.svg'))).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);
  await page.evaluate(() => { dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#vc-tray')).toHaveAttribute('aria-label', 'Khay cát phẳng, chưa có gì.');
});

test('a device that cannot draw on canvas gets a plain note and a working way out', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.goto(CAT);
  await expect(state(page)).toHaveAttribute('data-state', 'error');
  await expect(page.getByText('Máy này chưa vẽ được cát. Mình về góc ngồi chơi chơi trò khác nhé.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'chơi lại' })).toBeHidden(); // no dead "try again" that cannot work
  await tapOn(page.getByRole('link', { name: 'về góc ngồi chơi', exact: true }));
  await expect(page).toHaveURL(/\/lab\/$/);
});

test('reduced motion: the game is the same, nothing animates, it completes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(CAT);
  await page.waitForTimeout(450);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
  await page.waitForTimeout(450);
  await page.getByRole('button', { name: 'thêm sóng', exact: true }).click();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.waitForTimeout(450);
  await page.getByRole('button', { name: 'xong', exact: true }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await context.close();
});
