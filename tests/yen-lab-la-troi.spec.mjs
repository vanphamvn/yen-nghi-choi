// G07 (#148) Lá trôi, nghĩ trôi: place a neutral or written thought on a leaf and watch it pass.
// Issue test cases: input never appears in network/storage/URL, stop mid-animation, keyboard option.
import { test, expect } from '@playwright/test';

const LT = '/lab/la-troi/';
const SECRET = 'ý nghĩ riêng 7c1e của tôi';
const SETTLE = 450; // taps within 400 ms of a change are dropped on purpose
const DRIFT = 8000;
test.beforeEach(async ({ page }) => { await page.clock.install(); });

const game = page => page.locator('#game');
const slip = page => page.locator('#lt-slip');
const lane = page => page.locator('#lt-lane');
const field = page => page.getByRole('textbox', { name: 'Viết một ý nghĩ, không bắt buộc' });
const whisper = page => page.locator('#game-whisper');
const tap = async (page, name) => {
  await page.clock.runFor(SETTLE);
  const b = page.getByRole('button', { name, exact: true });
  if (test.info().project.use.hasTouch) await b.tap(); else await b.click();
};
const press = async (page, key) => { await page.clock.runFor(SETTLE); await page.keyboard.press(key); };
const nothingKept = page => page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash]);
const wordsLeft = page => page.evaluate(() => document.body.textContent + '|' + [...document.querySelectorAll('input')].map(i => i.value).join('|'));

test('reachable from the room: the book page links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  const link = page.locator('#lab-menu').getByRole('link', { name: 'Lá trôi, nghĩ trôi', exact: true });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(page).toHaveURL(/\/lab\/la-troi\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Lá trôi, nghĩ trôi' })).toBeVisible();
});

test('idle: allowed copy, no pressure to think positively, caution and privacy beside start; no form', async ({ page }) => {
  await page.goto(LT);
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.getByText('Thử nhìn một ý nghĩ đi ngang.')).toBeVisible(); // EVIDENCE.md G07 allowed copy
  await expect(page.getByText(/Không cần đẩy nó đi hay nghĩ khác đi; ý nghĩ quay lại cũng bình thường\./)).toBeVisible();
  await expect(page.getByText('Không cần viết chuyện nặng lòng. Thấy khó chịu hơn thì dừng lúc nào cũng được.')).toBeVisible();
  await expect(page.getByText(/Chữ bạn viết chỉ ở trên trang này, không gửi, không lưu/)).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /chia sẻ|share|gửi/i })).toHaveCount(0);
  // Never promises to erase or fix thoughts, never asks for positive thinking or judges content.
  await expect(page.getByText(/xoá suy nghĩ|xóa suy nghĩ|tiêu cực|tích cực|chữa|hết lo/)).toHaveCount(0);
  await expect(page.locator('.lab-fineprint')).toContainText('chưa được kiểm chứng hiệu quả riêng');
  const input = page.locator('#lt-input');
  await expect(input).toHaveAttribute('autocomplete', 'off');
  await expect(input).toHaveAttribute('spellcheck', 'false');
  await expect(input).toHaveAttribute('maxlength', '60');
  const caution = await page.getByText(/Không cần viết chuyện nặng lòng/).boundingBox();
  const start = await page.getByRole('button', { name: 'bắt đầu', exact: true }).boundingBox();
  expect(start.y).toBeGreaterThan(caution.y);
});

test('a suggested thought: one tap places it on the leaf; it drifts and is gone when the leaf has passed', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await expect(game(page)).toHaveAttribute('data-state', 'running');
  await expect(page.getByRole('button', { name: 'việc phải làm', exact: true })).toBeFocused(); // not the field: no keyboard
  await tap(page, 'việc phải làm');
  await expect(game(page)).toHaveAttribute('data-phase', 'drift');
  await expect(slip(page)).toHaveText('việc phải làm');
  await expect(lane(page)).toHaveClass(/is-drifting/);
  expect(await lane(page).evaluate(el => getComputedStyle(el).animationDuration)).toBe(`${DRIFT / 1000}s`); // = DRIFT_MS
  await expect(page.locator('#game-cue')).toHaveText('Nhìn lá trôi qua');
  await expect(whisper(page)).toHaveText('Đã đặt ý nghĩ lên lá. Lá đang trôi.');
  await expect(page.getByRole('button', { name: 'cho lá trôi luôn', exact: true })).toBeFocused();
  await expect(page.locator('.lt-choose')).toBeHidden();
  await expect(page.getByRole('button', { name: 'xong', exact: true })).toBeHidden(); // finish only between leaves
  await page.clock.runFor(DRIFT);
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(slip(page)).toBeEmpty();
  await expect(whisper(page)).toHaveText('Lá đã trôi qua. Chọn ý nghĩ khác, hoặc xong.');
  await expect(page.locator('#game-cue')).toHaveText('Chọn một ý nghĩ khác, hoặc xong');
  await tap(page, 'xong');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#lt-result-line')).toHaveText('Ngồi xem lá trôi xong rồi.');
  await expect(page.locator('#lt-result-line')).toBeFocused();
  await expect(page.getByText('Ý nghĩ có thể quay lại, vậy cũng bình thường.', { exact: false })).toBeVisible();
  await expect(page.getByText(/điểm|kỷ lục|chuỗi ngày|\d+ ý nghĩ/)).toHaveCount(0); // no score, no count
});

test('a written thought: Vietnamese + emoji, Enter places it, never read back aloud, wiped after it passes', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await field(page).fill('   Mai   nộp bài 😬  ');
  await press(page, 'Enter');
  await expect(slip(page)).toHaveText('Mai nộp bài 😬');
  await expect(page.locator('#lt-input')).toHaveValue(''); // hidden while the leaf drifts, and already empty
  await expect(whisper(page)).not.toContainText('nộp bài');
  await tap(page, 'cho lá trôi luôn');
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  expect(await wordsLeft(page)).not.toContain('nộp bài');
  // nothing written: a gentle nudge, no leaf
  await tap(page, 'đặt lên lá');
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(whisper(page)).toHaveText('Chọn một ý nghĩ có sẵn, hoặc viết vài chữ trước.');
  await field(page).fill('     ');
  await tap(page, 'đặt lên lá');
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
});

test('no leaf at all is fine: start then xong', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await tap(page, 'xong');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#lt-result-line')).toHaveText('Hôm nay chỉ ngồi nhìn suối cũng được.');
});

test('stop mid-animation wipes at once; again starts clean; leaving and a back/forward restore keep nothing', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await field(page).fill(SECRET);
  await tap(page, 'đặt lên lá');
  await page.clock.runFor(3000); // mid-drift
  await expect(slip(page)).toHaveText(SECRET);
  await tap(page, 'dừng hẳn');
  await expect(game(page)).toHaveAttribute('data-state', 'stopped');
  expect(await wordsLeft(page)).not.toContain(SECRET);
  await expect(page.getByRole('button', { name: 'chơi lại', exact: true })).toBeFocused();
  await page.clock.runFor(DRIFT); // the stopped drift timer does nothing later
  await expect(game(page)).toHaveAttribute('data-state', 'stopped');
  await tap(page, 'chơi lại');
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#game-title')).toBeFocused();

  await tap(page, 'bắt đầu');
  await field(page).fill(SECRET);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  expect(await wordsLeft(page)).not.toContain(SECRET);
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('#game-title')).toBeFocused();
  // Playwright's browsers keep no back/forward cache: this part shows a normal reload after back starts clean.
  await page.goto('/lab/');
  await page.goBack();
  await expect(game(page)).toHaveAttribute('data-state', 'idle');
  expect(await wordsLeft(page)).not.toContain(SECRET);
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
});

test('the written thought never reaches the network, storage, URL or history', async ({ page, context }) => {
  const sent = [];
  context.on('request', r => sent.push(`${r.method()} ${r.url()} ${r.postData() || ''}`));
  await page.goto(LT);
  const history = await page.evaluate(() => history.length);
  await tap(page, 'bắt đầu');
  await field(page).fill(SECRET);
  await press(page, 'Enter');
  await page.clock.runFor(DRIFT);
  await field(page).fill(SECRET);
  await tap(page, 'dừng hẳn');
  const encoded = [SECRET, encodeURIComponent(SECRET), SECRET.replace(/ /g, '+')];
  expect(sent.filter(line => encoded.some(m => line.includes(m)))).toEqual([]);
  expect(await nothingKept(page)).toEqual([0, 0, '', '', '']);
  expect(await page.evaluate(() => history.length)).toBe(history);
  expect(await page.evaluate(async () => (await (indexedDB.databases?.() ?? [])).length)).toBe(0);
});

test('a burst of taps: a leftover tap after a leaf is placed or let go does not place another or finish', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await page.clock.runFor(SETTLE);
  await page.getByRole('button', { name: 'bụng hơi đói', exact: true }).dblclick();
  await expect(slip(page)).toHaveText('bụng hơi đói');
  await page.clock.runFor(SETTLE);
  await page.getByRole('button', { name: 'cho lá trôi luôn', exact: true }).click();
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  // the next tap lands at once on whatever appeared in its place: dropped
  await page.getByRole('button', { name: 'việc phải làm', exact: true }).click();
  await page.getByRole('button', { name: 'xong', exact: true }).click();
  await expect(game(page)).toHaveAttribute('data-state', 'running');
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(slip(page)).toBeEmpty();
});

test('keyboard only: Tab to an idea or the field, Enter places, Enter lets go, Tab to xong; held Enter places once', async ({ page }) => {
  test.skip(!!test.info().project.use.hasTouch, 'keyboard path on desktop');
  await page.goto(LT);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).focus();
  await press(page, 'Enter');
  await expect(page.getByRole('button', { name: 'việc phải làm', exact: true })).toBeFocused();
  await press(page, 'Enter');
  await expect(slip(page)).toHaveText('việc phải làm');
  await press(page, 'Enter'); // focus is on "cho lá trôi luôn"
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await field(page).focus();
  await page.keyboard.type('đang nghĩ vu vơ');
  await page.clock.runFor(SETTLE);
  // An auto-repeat Enter alone (as when Enter is still held from earlier) never places the leaf…
  await field(page).evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true, cancelable: true })));
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(field(page)).toHaveValue('đang nghĩ vu vơ');
  // …a fresh press does.
  await page.keyboard.press('Enter');
  await expect(slip(page)).toHaveText('đang nghĩ vu vơ');
  // On a focused word, an auto-repeat keydown is cancelled before it can become a click.
  const repeatCancelled = await page.getByRole('button', { name: 'cho lá trôi luôn', exact: true }).evaluate(el => {
    const e = new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true, cancelable: true });
    el.dispatchEvent(e);
    return e.defaultPrevented;
  });
  expect(repeatCancelled).toBe(true);
  await page.clock.runFor(DRIFT);
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await page.getByRole('button', { name: 'xong', exact: true }).focus();
  await press(page, 'Enter');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await press(page, 'Enter'); // stray Enter on the result line does nothing
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
});

test('a leaf passing on its own does not pull focus away from where the guest is', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await tap(page, 'bụng hơi đói');
  await page.getByRole('link', { name: 'Nguồn phương pháp' }).focus();
  await page.clock.runFor(DRIFT);
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(page.getByRole('link', { name: 'Nguồn phương pháp' })).toBeFocused();
  // …but if focus was on "cho lá trôi luôn", which is now hidden, it moves to the first idea instead of being lost.
  await tap(page, 'chuyện ngày mai');
  await expect(page.getByRole('button', { name: 'cho lá trôi luôn', exact: true })).toBeFocused();
  await page.clock.runFor(DRIFT);
  await expect(page.getByRole('button', { name: 'việc phải làm', exact: true })).toBeFocused();
});

test('a Vietnamese IME composition Enter does not place the leaf', async ({ page }) => {
  await page.goto(LT);
  await tap(page, 'bắt đầu');
  await field(page).fill('nghĩ');
  await field(page).evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true })));
  await field(page).evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
  await expect(game(page)).toHaveAttribute('data-phase', 'choose');
  await expect(field(page)).toHaveValue('nghĩ');
});

test('screen reader: labelled field, grouped ideas, one live status, the stream is decorative', async ({ page }) => {
  await page.goto(LT);
  await expect(page.locator('.lt-stream')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[role="status"][aria-live="polite"]')).toHaveCount(1);
  await tap(page, 'bắt đầu');
  await expect(field(page)).toBeVisible();
  await expect(page.getByRole('group', { name: 'Chọn một ý nghĩ, hoặc viết vài chữ' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Điều khiển trò' })).toBeVisible();
  await expect(whisper(page)).toHaveText('Bắt đầu. Chọn một ý nghĩ có sẵn, hoặc viết vài chữ rồi đặt lên lá.');
});

for (const [w, h] of [[320, 640], [360, 740], [390, 844]]) {
  test(`${w}×${h}: caution + bắt đầu in the first screen; choosing and drifting fit; long words wrap; no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(LT);
    const inView = async locator => { const b = await locator.boundingBox(); return b && b.y >= 0 && b.y + b.height <= h; };
    expect(await inView(page.getByRole('button', { name: 'bắt đầu', exact: true }))).toBe(true);
    expect(await inView(page.getByText(/Không cần viết chuyện nặng lòng/))).toBe(true);
    await tap(page, 'bắt đầu');
    await page.evaluate(() => scrollTo(0, 0));
    // The paper sheet stays inside the screen while choosing (the game clips overflow, so scrollWidth alone cannot see it).
    const sheet = await page.locator('.game-sheet').boundingBox();
    expect(sheet.x).toBeGreaterThanOrEqual(0);
    expect(sheet.x + sheet.width).toBeLessThanOrEqual(w);
    for (const l of [page.locator('.lt-stream'), page.getByRole('button', { name: 'việc phải làm', exact: true }), field(page),
      page.getByRole('button', { name: 'đặt lên lá', exact: true }), page.getByRole('button', { name: 'xong', exact: true }), page.getByRole('button', { name: 'dừng hẳn', exact: true })]) {
      expect(await inView(l), await l.evaluate(el => el.outerHTML.slice(0, 50))).toBe(true);
    }
    // The longest thought (60 characters of real words) is fully readable on the slip all the way across: never narrowed
    // by its position, never cut off by the stream, never over the cue below.
    await field(page).fill('Không biết ngày mai có kịp nộp bài cho thầy hay lại trễ nữa');
    await tap(page, 'đặt lên lá');
    await page.evaluate(() => scrollTo(0, 0));
    for (const at of [1500, 2500, 2500]) { // ≈ 25 %, 56 %, 87 % of the drift
      await page.clock.runFor(at);
      const fit = await page.evaluate(() => {
        const s = document.getElementById('lt-slip'), st = document.querySelector('.lt-stream'), cue = document.getElementById('game-cue');
        const b = s.getBoundingClientRect(), sb = st.getBoundingClientRect(), cb = cue.getBoundingClientRect();
        const centre = (b.left + b.right) / 2 - (sb.left + sb.right) / 2;
        return { wide: b.width / sb.width, inside: b.left >= sb.left - 1 && b.right <= sb.right + 1, centre, notClipped: s.scrollHeight <= s.clientHeight + 1 && s.scrollWidth <= s.clientWidth + 1, aboveCue: b.bottom <= cb.top, lines: Math.round((b.height - 10) / parseFloat(getComputedStyle(s).lineHeight)) };
      });
      expect(fit.wide, JSON.stringify(fit)).toBeGreaterThan(0.6);
      expect(fit.wide, JSON.stringify(fit)).toBeLessThanOrEqual(0.82); // never wider than the stream allows
      if (Math.abs(fit.centre) < 20) expect(fit.inside, JSON.stringify(fit)).toBe(true); // mid-stream: whole slip on the water
      expect(fit.notClipped).toBe(true);
      expect(fit.aboveCue, JSON.stringify(fit)).toBe(true);
      expect(fit.lines, JSON.stringify(fit)).toBeLessThanOrEqual(3);
    }
    expect(await inView(page.getByRole('button', { name: 'cho lá trôi luôn', exact: true }))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('reduced motion: the leaf rests still, readable, with no time limit, until let go; the game completes', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL, viewport: { width: 320, height: 640 } });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(LT);
  await page.clock.runFor(SETTLE);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
  await page.clock.runFor(SETTLE);
  await page.locator('#lt-input').fill('Không biết ngày mai có kịp nộp bài cho thầy hay lại trễ nữa');
  await page.clock.runFor(SETTLE);
  await page.getByRole('button', { name: 'đặt lên lá', exact: true }).click();
  await expect(lane(page)).toHaveClass(/is-still/);
  expect(await lane(page).evaluate(el => [getComputedStyle(el).animationName, getComputedStyle(el).opacity])).toEqual(['none', '1']);
  await expect(page.locator('#game-whisper')).toHaveText('Đã đặt ý nghĩ lên lá. Lá nằm yên đến khi bạn chạm “cho lá trôi luôn”.');
  const fit = await slip(page).evaluate(s => {
    const b = s.getBoundingClientRect(), sb = document.querySelector('.lt-stream').getBoundingClientRect();
    return { wide: b.width / sb.width, inside: b.left >= sb.left - 1 && b.right <= sb.right + 1, clipped: s.scrollHeight > s.clientHeight + 1 };
  });
  expect(fit.wide).toBeGreaterThan(0.6);
  expect(fit.inside).toBe(true);
  expect(fit.clipped).toBe(false);
  await page.clock.runFor(5 * DRIFT); // no time limit: still there to read
  await expect(slip(page)).toHaveText(/nộp bài/);
  await page.clock.runFor(SETTLE);
  await page.getByRole('button', { name: 'cho lá trôi luôn', exact: true }).click();
  await expect(slip(page)).toBeEmpty();
  await page.clock.runFor(SETTLE);
  await page.getByRole('button', { name: 'xong', exact: true }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await context.close();
});

test('no network after load and no sound', async ({ page, context }) => {
  await page.goto(LT, { waitUntil: 'load' });
  const late = [];
  // The browser fetches <link rel="icon"> on its own timing, sometimes after load: the tab icon, not the game.
  page.on('request', r => { if (new URL(r.url()).pathname !== '/favicon.svg') late.push(r.url()); });
  await context.setOffline(true);
  await tap(page, 'bắt đầu');
  await tap(page, 'bài hát trong đầu');
  await page.clock.runFor(DRIFT);
  await tap(page, 'xong');
  await expect(game(page)).toHaveAttribute('data-state', 'complete');
  await context.setOffline(false);
  expect(late).toEqual([]);
  await expect(page.locator('audio, video')).toHaveCount(0);
});
