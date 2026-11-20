// G05 (#146) Thám tử hiện tại: 5-4-3-2-1 noticing. Clues are in the real room; the page only counts taps.
// Issue test cases: complete with skips, outdoor / no smell, screen reader numbers, no personal input persistence.
import { test, expect } from '@playwright/test';

const TT = '/lab/tham-tu/';
const game = page => page.locator('#game');
// Taps within 400 ms of a step change are dropped on purpose (a leftover tap of the same burst), so every helper first
// lets the fake clock pass that guard. Tests of the guard itself tap without waiting.
const SETTLE = 450;
test.beforeEach(async ({ page }) => { await page.clock.install(); });
const tap = async (page, name) => {
  await page.clock.runFor(SETTLE);
  const b = page.getByRole('button', { name, exact: true });
  if (test.info().project.use.hasTouch) await b.tap(); else await b.click();
};
const press = async (page, key) => { await page.clock.runFor(SETTLE); await page.keyboard.press(key); };
const lead = page => page.locator('[data-act="found"]');
const skip = page => page.locator('[data-act="skip"]');
const tapLead = async page => { await page.clock.runFor(SETTLE); await lead(page).click(); };
const tapSkip = async page => { await page.clock.runFor(SETTLE); await skip(page).click(); };
const whisper = page => page.locator('#game-whisper');
const nothingKept = page => page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash]);

test('reachable from the room: the book page links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = page.locator('#lab-menu').getByRole('link', { name: 'Thám tử hiện tại', exact: true });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/lab\/tham-tu\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Thám tử hiện tại' })).toBeVisible();
});

test('idle: careful copy beside start (eyes open, nothing strange to touch/smell/taste, skip any step); no input at all', async ({ page }) => {
  await page.goto(TT);
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.getByText('Để ý vài thứ quanh bạn.')).toBeVisible(); // EVIDENCE.md G05 allowed copy
  await expect(page.getByText(/Mở mắt, nhìn và nghe quanh chỗ bạn ngồi\. Không cần chạm, ngửi hay nếm gì, và đừng thử thứ lạ; bước nào không hợp thì bỏ qua\./)).toBeVisible();
  await expect(page.getByText(/manh mối ở ngoài đời, trang chỉ đếm giúp bạn/)).toBeVisible();
  // Not a hidden-object game and not a text box: nothing personal can be typed.
  await expect(page.locator('input, textarea, [contenteditable], form, select')).toHaveCount(0);
  // Never a treatment or panic claim; the method limit is in the fine print.
  await expect(page.getByText(/chữa|trị liệu|hết hoảng|hết lo âu|chứng minh/)).toHaveCount(0);
  await expect(page.locator('.lab-fineprint')).toContainText('chưa được kiểm chứng hiệu quả');
  // The start word is the first control of the game and sits right under the caution.
  const caution = await page.getByText(/Mở mắt, nhìn và nghe/).boundingBox();
  const start = await page.getByRole('button', { name: 'bắt đầu', exact: true }).boundingBox();
  expect(start.y).toBeGreaterThan(caution.y);
});

test('full case: 5 seen, 4 felt, 3 heard, 2 smells, 1 taste; counts announce numbers, then a quiet result', async ({ page }) => {
  await page.goto(TT);
  await tap(page, 'bắt đầu');
  await expect(game(page)).toHaveAttribute('data-state', 'running');
  await expect(game(page)).toHaveAttribute('data-step', '1');
  await expect(lead(page)).toBeFocused();
  await expect(page.locator('#game-cue')).toHaveText('Tìm 5 thứ bạn nhìn thấy');
  await expect(page.locator('#tt-count')).toHaveText('0 / 5');
  await expect(page.locator('#game-dots i')).toHaveCount(5);

  await tap(page, 'thấy một thứ');
  await expect(page.locator('#tt-count')).toHaveText('1 / 5');
  await expect(whisper(page)).toHaveText('1 / 5'); // screen reader hears the number
  await expect(page.locator('#game-dots i.is-done')).toHaveCount(1);
  for (let i = 0; i < 4; i++) await tap(page, 'thấy một thứ');
  await expect(game(page)).toHaveAttribute('data-step', '2');
  await expect(whisper(page)).toHaveText('Đủ 5 thứ bạn thấy. Bước 2 / 5: Để ý 4 thứ bạn cảm thấy trên người.');
  await expect(lead(page)).toHaveText('cảm thấy một thứ');
  await expect(lead(page)).toBeFocused();
  for (let i = 0; i < 4; i++) await tap(page, 'cảm thấy một thứ');
  for (let i = 0; i < 3; i++) await tap(page, 'nghe một tiếng');
  await expect(skip(page)).toHaveText('không có mùi nào');
  for (let i = 0; i < 2; i++) await tap(page, 'có một mùi');
  await expect(skip(page)).toHaveText('không có vị nào');
  await tap(page, 'có một vị');

  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#tt-result-line')).toHaveText('Xong vụ án.');
  await expect(page.locator('#tt-result-line')).toBeFocused(); // not "chơi lại"
  await expect(page.locator('#tt-after')).toContainText('Bạn đã để ý 15 thứ quanh mình.');
  await expect(whisper(page)).toHaveText('Đã xong, để ý được 15 thứ.');
  await expect(page.getByText(/điểm|kỷ lục|xuất sắc|chuỗi ngày/)).toHaveCount(0); // no score, no streak
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
});

test('outdoors / no smell or taste: skip those steps, and partial counts still finish without pressure', async ({ page }) => {
  await page.goto(TT);
  await tap(page, 'bắt đầu');
  await tap(page, 'thấy một thứ');
  await tap(page, 'thấy một thứ'); // two of five is enough: once something is counted, the skip word says so
  await tap(page, 'đủ rồi');
  await expect(whisper(page)).toHaveText('Sang bước sau. Bước 2 / 5: Để ý 4 thứ bạn cảm thấy trên người.');
  await expect(page.locator('#tt-count')).toHaveText('0 / 4');
  await tap(page, 'bỏ qua bước này');
  await tap(page, 'nghe một tiếng');
  await tap(page, 'đủ rồi');
  await expect(page.locator('#tt-sub')).toHaveText('Không ngửi thấy gì cũng được, đừng ngửi thứ lạ.');
  await tap(page, 'không có mùi nào');
  await expect(page.locator('#tt-sub')).toContainText('Đừng nếm thứ lạ.');
  await tap(page, 'không có vị nào');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#tt-after')).toContainText('Bạn đã để ý 3 thứ quanh mình.');
});

test('skip everything: a valid, gentle ending', async ({ page }) => {
  await page.goto(TT);
  await tap(page, 'bắt đầu');
  for (const word of ['bỏ qua bước này', 'bỏ qua bước này', 'bỏ qua bước này', 'không có mùi nào', 'không có vị nào']) await tap(page, word);
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#tt-result-line')).toHaveText('Hôm nay không tìm manh mối nào cũng được.');
  await expect(whisper(page)).toHaveText('Đã xong.');
});

test('stop at any step, then chơi lại starts clean; leaving and coming back starts clean too', async ({ page }) => {
  await page.goto(TT);
  await tap(page, 'bắt đầu');
  for (let i = 0; i < 5; i++) await tap(page, 'thấy một thứ');
  await tap(page, 'cảm thấy một thứ');
  await tap(page, 'dừng hẳn');
  await expect(game(page)).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'chơi lại', exact: true })).toBeFocused();
  await tap(page, 'chơi lại');
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#game-title')).toBeFocused();
  await tap(page, 'bắt đầu');
  await expect(game(page)).toHaveAttribute('data-step', '1');
  await expect(page.locator('#tt-count')).toHaveText('0 / 5');

  await tap(page, 'thấy một thứ');
  // The real reset path: the pageshow a browser fires when restoring from the back/forward cache.
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#game-title')).toBeFocused(); // focus is not left on a hidden word
  // Playwright's browsers keep no back/forward cache: this part shows a normal reload after back starts clean.
  await page.goto('/lab/');
  await page.goBack();
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(game(page)).toHaveAttribute('data-step', '0');
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
});

test('keyboard only: Tab to bắt đầu, Enter/Space count, focus stays on the lead word through every step', async ({ page }) => {
  test.skip(!!test.info().project.use.hasTouch, 'keyboard path on desktop');
  await page.goto(TT);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(lead(page)).toBeFocused();
  for (let i = 0; i < 5; i++) await press(page, 'Enter');
  await expect(game(page)).toHaveAttribute('data-step', '2');
  await expect(lead(page)).toBeFocused();
  for (let i = 0; i < 4; i++) await press(page, 'Space');
  await expect(game(page)).toHaveAttribute('data-step', '3');
  await page.keyboard.press('Tab'); // → skip
  await expect(skip(page)).toBeFocused();
  await press(page, 'Enter');
  await expect(game(page)).toHaveAttribute('data-step', '4');
  await expect(lead(page)).toBeFocused(); // after a skip, back on the lead word
  await page.keyboard.press('Tab');
  await press(page, 'Enter'); // không có mùi nào
  await press(page, 'Enter'); // có một vị
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#tt-result-line')).toBeFocused();
  await press(page, 'Enter'); // a stray Enter on the result does nothing
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
});

test('screen reader: named controls, one live status, decorative picture hidden', async ({ page }) => {
  await page.goto(TT);
  await expect(page.locator('.tt-stage')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[role="status"][aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('#game-dots')).toHaveAttribute('aria-hidden', 'true'); // the words "1 / 5" carry the count
  await expect(page.getByRole('group', { name: 'Điều khiển trò' })).toBeVisible();
  await tap(page, 'bắt đầu');
  await expect(whisper(page)).toHaveText('Bước 1 / 5: Tìm 5 thứ bạn nhìn thấy. Mỗi lần để ý được một thứ thì chạm “thấy một thứ”.');
  for (const name of ['thấy một thứ', 'bỏ qua bước này', 'dừng hẳn']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
});

for (const [w, h] of [[320, 640], [360, 740], [390, 844]]) {
  test(`${w}×${h}: caution + bắt đầu, then cue + count + lead word fit the first screen; no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(TT);
    const inView = async locator => { const b = await locator.boundingBox(); return b && b.y >= 0 && b.y + b.height <= h; };
    expect(await inView(page.getByRole('button', { name: 'bắt đầu', exact: true }))).toBe(true);
    expect(await inView(page.getByText(/Mở mắt, nhìn và nghe/))).toBe(true);
    await tap(page, 'bắt đầu');
    await page.evaluate(() => scrollTo(0, 0));
    for (const l of [page.locator('#game-cue'), page.locator('#tt-count'), lead(page), skip(page), page.getByRole('button', { name: 'dừng hẳn', exact: true })]) {
      expect(await inView(l)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (let i = 0; i < 4; i++) await tapSkip(page);
    await expect(page.locator('#tt-sub')).toContainText('Đừng nếm thứ lạ.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('reduced motion: plays to the end with nothing animating', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(TT);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
  for (let i = 0; i < 15; i++) await tapLead(page);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
    const s = getComputedStyle(el);
    return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
  }));
  expect(moving).toBe(false);
  await context.close();
});

test('a burst of taps: the extra tap after a step change or the last count is dropped, not applied to what moved under it', async ({ page }) => {
  await page.goto(TT);
  await tap(page, 'bắt đầu');
  for (let i = 0; i < 4; i++) await tapLead(page);
  await lead(page).dblclick(); // 5th + an extra tap right away
  await expect(game(page)).toHaveAttribute('data-step', '2');
  await expect(page.locator('#tt-count')).toHaveText('0 / 4'); // the extra tap did not count as something felt
  await tapSkip(page);
  await skip(page).click(); // double tap on the skip word: only one step skipped
  await expect(game(page)).toHaveAttribute('data-step', '3');
  for (let i = 0; i < 3; i++) await tapSkip(page);
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  // whatever now sits under the finger ("chơi lại", "về góc ngồi chơi") ignores the leftover tap
  await page.getByRole('button', { name: 'chơi lại', exact: true }).click();
  await page.locator('main.game a[href="/lab/"]').first().click();
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page).toHaveURL(/\/lab\/tham-tu\/$/);
  await page.clock.runFor(SETTLE); // after a moment, they work again
  await page.getByRole('button', { name: 'chơi lại', exact: true }).click();
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
});

test('holding Enter on the lead word counts once, not through every step', async ({ page }) => {
  test.skip(!!test.info().project.use.hasTouch, 'keyboard path on desktop');
  await page.goto(TT);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(SETTLE);
  await page.keyboard.down('Enter');
  for (let i = 0; i < 20; i++) await page.keyboard.down('Enter'); // auto-repeat: keydown with repeat=true
  await page.keyboard.up('Enter');
  await expect(page.locator('#tt-count')).toHaveText('1 / 5');
  await expect(game(page)).toHaveAttribute('data-step', '1');
});

test('no network after load, nothing stored, no sound', async ({ page, context }) => {
  await page.goto(TT, { waitUntil: 'load' });
  const late = [];
  page.on('request', r => late.push(r.url()));
  await context.setOffline(true);
  await tap(page, 'bắt đầu');
  for (let i = 0; i < 15; i++) await tapLead(page);
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await context.setOffline(false);
  expect(late).toEqual([]);
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
  await expect(page.locator('audio, video')).toHaveCount(0);
});
