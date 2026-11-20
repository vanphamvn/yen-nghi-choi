// G09 (#150) Gọi tên cơn bực: pick up to two words for what is felt now (or "không biết gọi tên"), optional strength,
// look at them without judgement, edit or finish. Issue test cases: no label selected, multiple labels, screen reader
// choices, privacy no storage.
import { test, expect } from '@playwright/test';

const GT = '/lab/goi-ten/';
const SETTLE = 450; // taps within 400 ms of a change are dropped on purpose
test.beforeEach(async ({ page }) => { await page.clock.install(); });

const game = page => page.locator('#game');
const named = page => page.locator('#gt-named');
const whisper = page => page.locator('#game-whisper');
const word = (page, name) => page.getByRole('button', { name, exact: true });
const tap = async (page, name) => {
  await page.clock.runFor(SETTLE);
  const b = word(page, name);
  if (test.info().project.use.hasTouch) await b.tap(); else await b.click();
};
const press = async (page, key) => { await page.clock.runFor(SETTLE); await page.keyboard.press(key); };
const nothingKept = page => page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash]);
const pressedWords = page => page.locator('[data-feel][aria-pressed="true"], [data-strength][aria-pressed="true"]').allTextContents();

const FEELINGS = ['bực', 'cáu', 'khó chịu', 'mệt', 'lo', 'buồn', 'tủi thân', 'hụt hẫng', 'bồn chồn', 'chán', 'bình thường', 'nhẹ nhõm', 'vui', 'không biết gọi tên'];

test('reachable from the room: the book page links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = page.locator('#lab-menu').getByRole('link', { name: 'Gọi tên cơn bực', exact: true });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/lab\/goi-ten\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Gọi tên cơn bực' })).toBeVisible();
});

test('idle: allowed copy, no right or wrong feeling, stop any time, privacy beside start; no diagnosis wording', async ({ page }) => {
  await page.goto(GT);
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.getByText('Thử gọi tên điều đang cảm thấy.')).toBeVisible(); // EVIDENCE.md G09 allowed copy
  await expect(page.getByText(/Không có chữ đúng hay sai, và không cần nó dễ chịu\./)).toBeVisible();
  await expect(page.getByText(/Thấy nặng lòng hơn thì dừng lúc nào cũng được\. Lựa chọn chỉ ở trên trang này, không gửi, không lưu/)).toBeVisible();
  await expect(page.locator('input, textarea, form, select')).toHaveCount(0);
  await expect(page.getByText(/trầm cảm|rối loạn|nguy hiểm|bệnh|chẩn đoán|kiểm soát cơn giận|hết bực|chữa/)).toHaveCount(0);
  await expect(page.locator('.lab-fineprint')).toContainText('chưa được kiểm chứng hiệu quả riêng');
  const note = await page.getByText(/Thấy nặng lòng hơn/).boundingBox();
  const start = await word(page, 'bắt đầu').boundingBox();
  expect(start.y).toBeGreaterThan(note.y);
});

test('labels are varied (unpleasant, neutral, pleasant, unknown) and none is pre-selected', async ({ page }) => {
  await page.goto(GT);
  await tap(page, 'bắt đầu');
  await expect(page.locator('[data-feel]')).toHaveText(FEELINGS);
  await expect(page.locator('[data-strength]')).toHaveText(['một chút', 'vừa', 'nhiều']);
  expect(await pressedWords(page)).toEqual([]);
  await expect(word(page, 'bực')).toBeFocused();
  await expect(page.locator('.gt-stage')).toBeHidden(); // the weather strip is not a "get to sunshine" path while choosing
});

test('no label selected: looking is fine, a gentle line, then done', async ({ page }) => {
  await page.goto(GT);
  await tap(page, 'bắt đầu');
  await tap(page, 'nhìn lại');
  await expect(game(page)).toHaveAttribute('data-phase', 'view');
  await expect(named(page)).toHaveText('Chưa gọi được tên cũng được.');
  await expect(named(page)).toBeFocused();
  await tap(page, 'xong');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#gt-result-line')).toBeFocused();
});

test('multiple labels: at most two, a third is refused kindly; deselect to swap; strength optional and single', async ({ page }) => {
  await page.goto(GT);
  await tap(page, 'bắt đầu');
  await tap(page, 'bực');
  await expect(word(page, 'bực')).toHaveAttribute('aria-pressed', 'true');
  await expect(whisper(page)).toHaveText('Đã chọn. 1 / 2 chữ.');
  await tap(page, 'mệt');
  await tap(page, 'buồn'); // third
  await expect(whisper(page)).toHaveText('Đã có hai chữ rồi. Bỏ một chữ nếu muốn đổi.');
  expect(await pressedWords(page)).toEqual(['bực', 'mệt']);
  await tap(page, 'bực'); // deselect
  await expect(whisper(page)).toHaveText('Đã bỏ chọn. 1 / 2 chữ.');
  await tap(page, 'buồn');
  expect(await pressedWords(page)).toEqual(['mệt', 'buồn']);
  await tap(page, 'một chút');
  await tap(page, 'nhiều'); // single choice: replaces
  expect(await pressedWords(page)).toEqual(['mệt', 'buồn', 'nhiều']);
  await tap(page, 'nhiều'); // and can be cleared
  expect(await pressedWords(page)).toEqual(['mệt', 'buồn']);
  await tap(page, 'vừa');
  await tap(page, 'nhìn lại');
  await expect(named(page)).toHaveText('Lúc này: mệt và buồn, vừa.');
  await expect(whisper(page)).toHaveText('Lúc này: mệt và buồn, vừa.');
  // No interpretation of the choice: the only lines are the words and the neutral note.
  await expect(page.locator('#gt-view-note')).toHaveText('Chỉ gọi tên thôi. Không cần đổi nó, không cần giải thích nó.');
  await expect(page.getByText(/nên|hãy thử|có vẻ bạn|dấu hiệu|tích cực/)).toHaveCount(0);
});

test('"không biết gọi tên" stands alone: it clears the words, and a word clears it', async ({ page }) => {
  await page.goto(GT);
  await tap(page, 'bắt đầu');
  await tap(page, 'lo');
  await tap(page, 'chán');
  await tap(page, 'không biết gọi tên');
  expect(await pressedWords(page)).toEqual(['không biết gọi tên']);
  await tap(page, 'vui');
  expect(await pressedWords(page)).toEqual(['vui']);
  await tap(page, 'không biết gọi tên');
  await tap(page, 'nhìn lại');
  await expect(named(page)).toHaveText('Lúc này: không biết gọi tên.');
  // strength without a word is allowed too
  await tap(page, 'sửa lại');
  await tap(page, 'không biết gọi tên');
  await tap(page, 'nhiều');
  await tap(page, 'nhìn lại');
  await expect(named(page)).toHaveText('Chưa có chữ nào, chỉ biết là nhiều.');
});

test('edit keeps the choices and lets them change; done and stop wipe them; again starts clean', async ({ page }) => {
  await page.goto(GT);
  await tap(page, 'bắt đầu');
  await tap(page, 'cáu');
  await tap(page, 'nhìn lại');
  await tap(page, 'sửa lại');
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(word(page, 'cáu')).toHaveAttribute('aria-pressed', 'true');
  await expect(word(page, 'cáu')).toBeFocused();
  await tap(page, 'cáu');
  await tap(page, 'khó chịu');
  await tap(page, 'nhìn lại');
  await expect(named(page)).toHaveText('Lúc này: khó chịu.');
  await tap(page, 'xong');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  expect(await pressedWords(page)).toEqual([]);
  await expect(named(page)).toBeEmpty();
  await tap(page, 'chơi lại');
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#game-title')).toBeFocused();
  await tap(page, 'bắt đầu');
  await tap(page, 'hụt hẫng');
  await tap(page, 'dừng hẳn');
  await expect(game(page)).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé. Lựa chọn đã xóa.')).toBeVisible();
  expect(await pressedWords(page)).toEqual([]);
  await expect(word(page, 'chơi lại')).toBeFocused();
});

test('privacy: choices never reach storage, URL, history or the network; leaving and a back/forward restore forget them', async ({ page, context }) => {
  const sent = [];
  context.on('request', r => sent.push(`${r.method()} ${r.url()} ${r.postData() || ''}`));
  await page.goto(GT);
  await page.waitForLoadState('load');
  const before = sent.length;
  const history = await page.evaluate(() => history.length);
  await tap(page, 'bắt đầu');
  await tap(page, 'tủi thân');
  await tap(page, 'nhiều');
  await tap(page, 'nhìn lại');
  expect(sent.slice(before).filter(l => !l.includes('/favicon.svg'))).toEqual([]);
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
  expect(await page.evaluate(() => history.length)).toBe(history);
  expect(await page.evaluate(async () => (await (indexedDB.databases?.() ?? [])).length)).toBe(0);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  expect(await pressedWords(page)).toEqual([]);
  await expect(named(page)).toBeEmpty();
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('#game-title')).toBeFocused();
  // Playwright's browsers keep no back/forward cache: this part shows a normal reload after back starts clean.
  await page.goto('/lab/');
  await page.goBack();
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  expect(await pressedWords(page)).toEqual([]);
});

test('screen reader: toggle buttons expose their state, groups are named, one live status', async ({ page }) => {
  await page.goto(GT);
  await expect(page.locator('.gt-stage')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[role="status"][aria-live="polite"]')).toHaveCount(1);
  await tap(page, 'bắt đầu');
  await expect(page.getByRole('group', { name: 'Lúc này bạn thấy thế nào?' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'mạnh cỡ nào, nếu muốn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'bực', pressed: false })).toBeVisible();
  await tap(page, 'bực');
  await expect(page.getByRole('button', { name: 'bực', pressed: true })).toBeVisible();
  await expect(whisper(page)).toHaveText('Đã chọn. 1 / 2 chữ.');
});

test('keyboard only: Tab through words, Enter/Space toggle, look, edit, done; held keys toggle once', async ({ page }) => {
  test.skip(!!test.info().project.use.hasTouch, 'keyboard path on desktop');
  await page.goto(GT);
  await word(page, 'bắt đầu').focus();
  await press(page, 'Enter');
  await expect(word(page, 'bực')).toBeFocused();
  await press(page, 'Space');
  await expect(word(page, 'bực')).toHaveAttribute('aria-pressed', 'true');
  // an auto-repeat keydown on a focused word is cancelled before it can toggle again
  const cancelled = await word(page, 'bực').evaluate(el => {
    const e = new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true, cancelable: true });
    el.dispatchEvent(e);
    return e.defaultPrevented;
  });
  expect(cancelled).toBe(true);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(word(page, 'mệt')).toBeFocused();
  await press(page, 'Enter');
  await word(page, 'nhìn lại').focus();
  await press(page, 'Enter');
  await expect(named(page)).toBeFocused();
  await expect(named(page)).toHaveText('Lúc này: bực và mệt.');
  await word(page, 'xong').focus();
  await press(page, 'Enter');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#gt-result-line')).toBeFocused();
  await press(page, 'Enter'); // a stray Enter on the result does nothing
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
});

test('a burst of taps: the leftover tap after "nhìn lại" does not finish, and after "xong" does not restart', async ({ page }) => {
  await page.goto(GT);
  await tap(page, 'bắt đầu');
  await tap(page, 'buồn');
  await page.clock.runFor(SETTLE);
  await word(page, 'nhìn lại').click();
  await word(page, 'xong').click(); // lands at once where "nhìn lại" was
  await expect(game(page)).toHaveAttribute('data-state', 'running');
  await expect(game(page)).toHaveAttribute('data-phase', 'view');
  await page.clock.runFor(SETTLE);
  await word(page, 'xong').click();
  await word(page, 'chơi lại').click();
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
});

for (const [w, h] of [[320, 640], [360, 740], [390, 844]]) {
  test(`${w}×${h}: note + bắt đầu in the first screen; every word, strength and nhìn lại fit; no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(GT);
    const inView = async locator => { const b = await locator.boundingBox(); return b && b.y >= 0 && b.y + b.height <= h; };
    expect(await inView(word(page, 'bắt đầu'))).toBe(true);
    expect(await inView(page.getByText(/Thấy nặng lòng hơn/))).toBe(true);
    await tap(page, 'bắt đầu');
    await page.evaluate(() => scrollTo(0, 0));
    const sheet = await page.locator('.game-sheet').boundingBox();
    expect(sheet.x).toBeGreaterThanOrEqual(0);
    expect(sheet.x + sheet.width).toBeLessThanOrEqual(w);
    for (const name of [...FEELINGS, 'một chút', 'vừa', 'nhiều', 'nhìn lại', 'dừng hẳn']) {
      expect(await inView(word(page, name)), name).toBe(true);
      expect((await word(page, name).boundingBox()).height, name).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('reduced motion: completes with nothing animating', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(GT);
  for (const name of ['bắt đầu', 'vui', 'nhìn lại', 'xong']) { await page.clock.runFor(SETTLE); await page.getByRole('button', { name, exact: true }).click(); }
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
    const s = getComputedStyle(el);
    return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
  }));
  expect(moving).toBe(false);
  await context.close();
});

test('no network after load and no sound', async ({ page, context }) => {
  await page.goto(GT, { waitUntil: 'load' });
  const late = [];
  // The browser fetches <link rel="icon"> on its own timing, sometimes after load: the tab icon, not the game.
  page.on('request', r => { if (new URL(r.url()).pathname !== '/favicon.svg') late.push(r.url()); });
  await context.setOffline(true);
  for (const name of ['bắt đầu', 'bồn chồn', 'một chút', 'nhìn lại', 'xong']) await tap(page, name);
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await context.setOffline(false);
  expect(late).toEqual([]);
  await expect(page.locator('audio, video')).toHaveCount(0);
});
