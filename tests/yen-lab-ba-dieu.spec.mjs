// G14 (#155) Ba điều nhỏ xíu: up to three small things, none required; suggestions; nothing kept anywhere.
// Issue test cases: empty/partial input, Vietnamese unicode, refresh clears, phone keyboard, no requests.
import { test, expect } from '@playwright/test';
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const BA = '/lab/ba-dieu/';
const state = page => page.locator('#game');
const tap = (page, name) => page.getByRole('button', { name, exact: true }).click();
const slip = (page, n) => page.getByRole('textbox', { name: ['Điều nhỏ thứ nhất', 'Điều nhỏ thứ hai, không bắt buộc', 'Điều nhỏ thứ ba, không bắt buộc'][n - 1] });
const notes = page => page.locator('#ba-notes li');
const nothingKept = page => page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash]);

test('reachable from the room: the book page links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = page.getByRole('link', { name: 'Ba điều nhỏ xíu' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/lab\/ba-dieu\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Ba điều nhỏ xíu' })).toBeVisible();
});

test('idle: gentle copy and privacy line beside start; no form, no share, nothing to submit', async ({ page }) => {
  await page.goto(BA);
  await expect(page.getByText('Có điều nhỏ nào bạn muốn giữ lại hôm nay?')).toBeVisible();
  await expect(page.getByText('Một điều cũng được. Hôm nay không nghĩ ra điều gì cũng được.')).toBeVisible();
  await expect(page.getByText('Chữ bạn viết chỉ ở trên trang này, không gửi, không lưu; rời đi là mất.')).toBeVisible();
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /chia sẻ|share|gửi/i })).toHaveCount(0);
  for (const input of await page.locator('.ba-slip input').all()) {
    await expect(input).toHaveAttribute('autocomplete', 'off');
    await expect(input).toHaveAttribute('spellcheck', 'false'); // no cloud spellcheck of private words
    await expect(input).toHaveAttribute('maxlength', '60');
  }
  // No promise that gratitude fixes anything; no count required.
  await expect(page.getByText(/hết buồn|chữa|phải viết đủ|bắt buộc ba/)).toHaveCount(0);
});

test('three things: type Vietnamese and emoji, Enter moves on, xong shows them as notes and empties the inputs', async ({ page }) => {
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(slip(page, 1)).toBeFocused();
  await page.keyboard.type('Mẹ gọi điện hỏi thăm 😊');
  await page.keyboard.press('Enter');
  await expect(slip(page, 2)).toBeFocused();
  await page.keyboard.type('   ly cà phê   sữa đá  ');
  await page.keyboard.press('Enter');
  await expect(slip(page, 3)).toBeFocused();
  await page.keyboard.type('Đường về nhà không kẹt xe');
  await page.keyboard.press('Enter'); // on the last slip, Enter finishes
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(notes(page)).toHaveText(['Mẹ gọi điện hỏi thăm 😊', 'ly cà phê sữa đá', 'Đường về nhà không kẹt xe']);
  await expect(page.locator('#ba-result-line')).toHaveText('Đây là những điều nhỏ của bạn.');
  expect(await page.locator('.ba-slip input').evaluateAll(list => list.map(i => i.value))).toEqual(['', '', '']);
  await expect(page.getByRole('button', { name: 'xóa và làm lại' })).toBeFocused();
  await expect(page.locator('#game-whisper')).toHaveText('Đã xong, 3 điều nhỏ.'); // the count only, never the words
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
});

test('partial and empty: one thing is enough; "xong" with nothing and "hôm nay chưa có điều gì" are both fine', async ({ page }) => {
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await slip(page, 2).fill('nắng sớm');
  await tap(page, 'xong');
  await expect(notes(page)).toHaveText(['nắng sớm']);
  await expect(page.locator('#ba-result-line')).toHaveText('Đây là điều nhỏ của bạn.');
  await tap(page, 'xóa và làm lại');
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('   ');
  await tap(page, 'xong');
  await expect(notes(page)).toHaveCount(0);
  await expect(page.locator('#ba-result-line')).toHaveText('Hôm nay chưa có điều gì cũng được.');
  await tap(page, 'xóa và làm lại');
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('sẽ không được giữ');
  await tap(page, 'hôm nay chưa có điều gì');
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(notes(page)).toHaveCount(0);
  await expect(page.getByText('sẽ không được giữ')).toHaveCount(0);
  await expect(page.getByText(/tiếc|thất bại|cố lên|điểm/)).toHaveCount(0);
});

test('suggestions fill the next empty slip without opening the keyboard; when all are full, nothing is overwritten', async ({ page }) => {
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('của tôi');
  await page.locator('#game-cue').click(); // blur, like tapping the paper
  await tap(page, 'ly trà ấm');
  await expect(slip(page, 2)).toHaveValue('ly trà ấm');
  expect(await page.evaluate(() => document.activeElement.tagName)).not.toBe('INPUT');
  await tap(page, 'một bài hát');
  await expect(slip(page, 3)).toHaveValue('một bài hát');
  await tap(page, 'bữa ăn ngon');
  await expect(page.locator('#game-whisper')).toHaveText('Ba mẩu giấy đã có chữ rồi. Sửa một mẩu nếu muốn.');
  expect(await page.locator('.ba-slip input').evaluateAll(list => list.map(i => i.value))).toEqual(['của tôi', 'ly trà ấm', 'một bài hát']);
});

test('stop and reset wipe the words at once; a refresh and back/forward never bring them back', async ({ page }) => {
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('điều riêng');
  await tap(page, 'dừng hẳn');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé. Chữ đã xóa.')).toBeVisible();
  expect(await page.locator('.ba-slip input').evaluateAll(list => list.map(i => i.value))).toEqual(['', '', '']);
  await tap(page, 'xóa và làm lại');
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('trước khi tải lại');
  await page.reload();
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  expect(await page.locator('.ba-slip input').evaluateAll(list => list.map(i => i.value))).toEqual(['', '', '']);
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('trước khi rời');
  await tap(page, 'xong');
  await page.goto('/lab/');
  await page.goBack();
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.getByText('trước khi rời')).toHaveCount(0);
  expect(await page.locator('.ba-slip input').evaluateAll(list => list.map(i => i.value))).toEqual(['', '', '']);
});

test('long input is capped at 60 characters and wraps on the note; nothing overflows at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('Một buổi chiều rất dài ở quán với bạn bè cũ, kể đủ thứ chuyện vui buồn không dứt'.repeat(2));
  expect((await slip(page, 1).inputValue()).length).toBe(60);
  await slip(page, 2).fill('KhôngcókhoảngtrắngnàoởđâycảchỉlàmộtchuỗirấtdàiKhôngcókhoảngtrắng');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await tap(page, 'xong');
  await expect(notes(page)).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('keyboard only: start, type, Tab through suggestions and controls, finish; focus never lost', async ({ page }) => {
  await page.goto(BA);
  const start = page.getByRole('button', { name: 'bắt đầu' });
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(slip(page, 1)).toBeFocused();
  await page.keyboard.type('trà chiều');
  await page.keyboard.press('Tab');
  await expect(slip(page, 2)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(slip(page, 3)).toBeFocused();
  await page.keyboard.press(TAB(page)); // → first suggestion
  await expect(page.getByRole('button', { name: 'ly trà ấm' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(slip(page, 2)).toHaveValue('ly trà ấm');
  await page.getByRole('button', { name: 'xong' }).focus();
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByRole('button', { name: 'xóa và làm lại' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('touch: tap start, tap a suggestion, tap xong', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'touch projects only');
  await page.goto(BA);
  await page.getByRole('button', { name: 'bắt đầu' }).tap();
  await page.getByRole('button', { name: 'được ngồi yên' }).tap();
  await page.getByRole('button', { name: 'xong' }).tap();
  await expect(notes(page)).toHaveText(['được ngồi yên']);
});

test('screen reader: slips are labelled and grouped, announcements never repeat what was typed', async ({ page }) => {
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await expect(page.locator('.ba-slips')).toHaveAttribute('role', 'group');
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Viết vài chữ vào mẩu giấy, hoặc chọn một gợi ý.');
  await slip(page, 1).fill('điều thầm kín');
  await tap(page, 'xong');
  await expect(page.locator('#game-whisper')).toHaveText('Đã xong, 1 điều nhỏ.');
  await expect(page.locator('#ba-notes')).toHaveAttribute('aria-labelledby', 'ba-result-line');
});

test('phone keyboard: the slip being typed in and "xong" stay on screen in a short viewport', async ({ page }) => {
  // A phone with the on-screen keyboard open leaves roughly 360×420 for the page.
  await page.setViewportSize({ width: 360, height: 420 });
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await slip(page, 3).focus();
  await page.waitForTimeout(400); // the game re-centres the focused slip after the keyboard animation
  const box = await page.locator('.ba-slip').nth(2).boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(420);
  await page.keyboard.type('gần xong');
  await page.getByRole('button', { name: 'xong' }).scrollIntoViewIfNeeded();
  await tap(page, 'xong');
  await expect(notes(page)).toHaveText(['gần xong']);
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: copy and "bắt đầu" in the first screen; writing state fits; targets ≥ 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(BA);
    for (const target of [page.getByRole('button', { name: 'bắt đầu' }), page.getByText('Hôm nay không nghĩ ra điều gì cũng được.', { exact: false })]) {
      const b = await target.boundingBox();
      expect(b.y + b.height, `${w}×${h}`).toBeLessThanOrEqual(h);
    }
    await tap(page, 'bắt đầu');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const targets = await page.locator('.game .ink-word, .ba-slip input').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => ({ t: el.textContent.trim() || el.id, h: el.getBoundingClientRect().height })));
    for (const t of targets) expect(t.h, t.t).toBeGreaterThanOrEqual(44);
    const xong = await page.getByRole('button', { name: 'xong' }).boundingBox();
    expect(xong.y + xong.height, `${w}×${h} xong`).toBeLessThanOrEqual(h);
  });
}

test('reduced motion: notes appear without animation and the game completes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(BA);
  await tap(page, 'bắt đầu');
  await slip(page, 1).fill('một');
  await tap(page, 'xong');
  await expect(notes(page)).toHaveCount(1);
  expect(await notes(page).first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await context.close();
});
