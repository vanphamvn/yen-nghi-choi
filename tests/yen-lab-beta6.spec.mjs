// LAB-F13 (#137): Beta 6 release gate. Each game has its own spec; this one proves the six together as one guest visit
// (room → book or Cục Yên → each game → back to the room), the optional "lúc này bạn thấy sao?" that keeps nothing,
// that every game finishes offline once loaded, makes no sound, stays light on a cold load, and that no page makes a
// medical or benefit claim. Runs on desktop, emulated touch and (LAB_UX_DEVICES=1) emulated phones.
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const SETTLE = 450; // the three M3 games drop taps within 400 ms of a change on purpose
const SHOTS = process.env.LAB_BETA6_SHOTS || ''; // directory for release-note screenshots, only when asked

const tapOn = async (page, locator) => { if (test.info().project.use.hasTouch) await locator.tap(); else await locator.click(); };
const tap = async (page, name) => { await page.clock.runFor(SETTLE); await tapOn(page, page.getByRole('button', { name, exact: true })); };
const shot = async (page, name) => {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${test.info().project.name}-${name}.png` });
};

// How a guest finishes each game. Timed games run on the fake clock; the others are a few taps.
const GAMES = [
  { path: '/lab/tho/', label: 'Thở cùng Yên', play: async page => { await tap(page, 'bắt đầu'); await page.clock.runFor(10 * 60_000); } },
  { path: '/lab/cang/', label: 'Căng rồi thả', play: async page => { await tap(page, 'bắt đầu'); await page.clock.runFor(10 * 60_000); } },
  { path: '/lab/ba-dieu/', label: 'Ba điều nhỏ xíu', play: async page => { await tap(page, 'bắt đầu'); await page.getByRole('textbox').first().fill('ly trà ấm'); await tap(page, 'xong'); } },
  { path: '/lab/tham-tu/', label: 'Thám tử hiện tại', reflect: true, play: async page => {
    await tap(page, 'bắt đầu');
    for (const word of ['thấy một thứ', 'thấy một thứ', 'đủ rồi', 'bỏ qua bước này', 'nghe một tiếng', 'đủ rồi', 'không có mùi nào', 'không có vị nào']) await tap(page, word);
  } },
  { path: '/lab/la-troi/', label: 'Lá trôi, nghĩ trôi', reflect: true, play: async page => {
    await tap(page, 'bắt đầu'); await tap(page, 'chuyện ngày mai'); await page.clock.runFor(9_000); await tap(page, 'xong');
  } },
  { path: '/lab/goi-ten/', label: 'Gọi tên cơn bực', reflect: true, play: async page => {
    await tap(page, 'bắt đầu'); await tap(page, 'mệt'); await tap(page, 'khác'); await tap(page, 'nhìn lại'); await tap(page, 'xong');
  } },
];
const slug = path => path.split('/')[2];

// Count anything that could make a sound: Web Audio, <audio>/<video>, speech synthesis, vibration.
const SOUND_PROBE = () => {
  const counts = { audioContext: 0, mediaPlay: 0, speech: 0, vibrate: 0 };
  window.__labSound = counts;
  for (const name of ['AudioContext', 'webkitAudioContext', 'OfflineAudioContext']) {
    const Original = window[name];
    if (typeof Original === 'function') window[name] = class extends Original { constructor(...a) { super(...a); counts.audioContext++; } };
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { counts.mediaPlay++; return play.apply(this, a); };
  if (window.speechSynthesis) { const speak = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { counts.speech++; return speak(u); }; }
  if (navigator.vibrate) { const vibrate = navigator.vibrate.bind(navigator); navigator.vibrate = p => { counts.vibrate++; return vibrate(p); }; }
};
const SILENT = { audioContext: 0, mediaPlay: 0, speech: 0, vibrate: 0 };

test('one guest visit: all six games from the book (one from Cục Yên), finished, back to the room; no errors, nothing kept', async ({ page, context }) => {
  const problems = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  // WebKit notes that it ignores the Chrome-only viewport key `interactive-widget` (two games use it); not a Lab error.
  const ignoredViewportKey = m => m.text() === 'Viewport argument key "interactive-widget" not recognized and ignored.';
  // Only in the opt-in screenshot run: Playwright's screenshot() injects a <style> the Lab CSP refuses on WebKit.
  const fromScreenshotTool = m => SHOTS && m.text().startsWith('Refused to apply a stylesheet because its hash, its nonce');
  page.on('console', m => { if (m.type() === 'error' && !ignoredViewportKey(m) && !fromScreenshotTool(m)) problems.push(`console: ${m.text()}`); });
  page.on('response', r => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(SOUND_PROBE);
  await page.clock.install();
  await page.goto('/lab/');
  await shot(page, '0-room');

  for (const game of GAMES) {
    await expect(page).toHaveURL(/\/lab\/$/);
    await page.clock.runFor(SETTLE);
    if (game.label === 'Lá trôi, nghĩ trôi') {
      // reached the other way: Cục Yên's suggestion (LAB-F12)
      const buddy = page.getByRole('button', { name: 'Chọc Cục Yên một cái' });
      const link = page.locator('#buddy-says a', { hasText: game.label });
      for (let i = 0; i < 12 && !(await link.count()); i++) await tapOn(page, buddy);
      await shot(page, '0-cuc-yen-suggests');
      await tapOn(page, link);
    } else {
      await tapOn(page, page.getByRole('button', { name: 'Mở thực đơn trò chơi' }));
      await expect(page.locator('#lab-menu')).toBeVisible();
      if (game === GAMES[0]) await shot(page, '0-menu');
      await tapOn(page, page.locator('#lab-menu').getByRole('link', { name: game.label, exact: true }));
    }
    await expect(page).toHaveURL(new RegExp(game.path.replace(/\//g, '\\/') + '$'));
    await game.play(page);
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await page.clock.runFor(1_000);
    await shot(page, `${slug(game.path)}-complete`);
    expect(await page.evaluate(() => window.__labSound)).toEqual(SILENT);
    expect(await page.evaluate(() => document.querySelectorAll('audio, video').length)).toBe(0);
    await page.clock.runFor(SETTLE);
    await tapOn(page, page.locator('main.game').getByRole('link', { name: 'về góc ngồi chơi', exact: true }));
  }
  await expect(page).toHaveURL(/\/lab\/$/);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  expect(await context.cookies()).toEqual([]);
  expect(problems).toEqual([]);
});

for (const game of GAMES.filter(g => g.reflect)) {
  test(`${game.label}: the optional "lúc này bạn thấy sao?" keeps nothing; "khó chịu hơn" gets a rest reply; also after stopping`, async ({ page }) => {
    const sent = [];
    page.on('request', r => sent.push(r.url()));
    await page.clock.install();
    await page.goto(game.path, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
    const before = sent.length;
    const reflect = page.locator('#game-reflect');
    await expect(reflect).toBeHidden(); // never before the game ends
    await game.play(page);
    await expect(reflect).toBeVisible();
    await expect(page.getByRole('group', { name: 'Nếu muốn, lúc này bạn thấy sao?' })).toBeVisible();
    await tap(page, 'khó chịu hơn');
    await expect(reflect).toBeHidden();
    await expect(page.locator('#game-whisper')).toHaveText(/^Cảm ơn bạn đã nói\. .*(nghỉ|không cần)/);
    await expect(page.getByRole('button', { name: 'chơi lại', exact: true })).toBeFocused();
    await tap(page, 'chơi lại');
    await tap(page, 'bắt đầu');
    await tap(page, 'dừng hẳn');
    await expect(reflect).toBeVisible(); // offered after stopping too, still optional
    await tap(page, 'bỏ qua');
    await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã tự để ý một chút.');
    expect(sent.slice(before).filter(u => !u.endsWith('/favicon.svg'))).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);
  });
}

for (const game of GAMES) {
  test(`${game.label}: once loaded, plays to the end offline and asks the network for nothing`, async ({ page, context }) => {
    await page.clock.install();
    await page.goto(game.path, { waitUntil: 'load' });
    // Load every image first, the lazy door in the footer included (WebKit may fetch it after load).
    await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
    const late = [];
    page.on('request', r => { if (new URL(r.url()).pathname !== '/favicon.svg') late.push(r.url()); });
    await context.setOffline(true);
    await game.play(page);
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await context.setOffline(false);
    expect(late).toEqual([]);
  });
}

// No page may promise a cure, a diagnosis or proven benefit (EVIDENCE.md, SAFETY.md, #137 research claim audit).
// "không thay thế tư vấn hoặc điều trị chuyên môn" and "liệu pháp ACT" (naming the source method) are the allowed uses.
const FORBIDDEN = [/khoa học (đã )?chứng minh/i, /được chứng minh/i, /chữa (lành|khỏi|bệnh)/i, /trị liệu/i, /chẩn đoán/i, /trầm cảm|rối loạn|lo âu/i,
  /hết (lo|buồn|bực|giận|hoảng|căng thẳng)/i, /xóa suy nghĩ|xoá suy nghĩ|suy nghĩ tiêu cực/i, /giảm (stress|căng thẳng|lo)/i, /hạch hạnh nhân|amygdala/i, /hiệu quả (cao|rõ|đã)/i];
test('claim audit: no page in the Lab promises a cure, a diagnosis or proven benefit; every game says it is not validated', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'text is the same on every project');
  for (const path of ['/lab/', ...GAMES.map(g => g.path)]) {
    await page.goto(path);
    // all text a guest could meet on the page, including states not shown yet (hidden nodes count: they will show)
    const text = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '));
    const allowed = text.replace(/không thay thế tư vấn hoặc điều trị chuyên môn/g, '').replace(/liệu pháp ACT/g, '');
    for (const re of FORBIDDEN) expect(allowed, `${path} ${re}`).not.toMatch(re);
    await expect(page.locator('.lab-fineprint')).toContainText('không thay thế tư vấn hoặc điều trị chuyên môn');
    if (path !== '/lab/') await expect(page.locator('.lab-fineprint')).toContainText(/chưa được kiểm chứng hiệu quả/);
  }
});

test('cold load: each Beta 6 page is light on a fresh visit', async ({ browser, baseURL }) => {
  test.skip(test.info().project.name !== 'desktop', 'numbers recorded once, on the desktop project');
  const record = [];
  for (const path of ['/lab/', ...GAMES.map(g => g.path)]) {
    const context = await browser.newContext({ baseURL }); // empty cache: a first visit
    const page = await context.newPage();
    await page.goto(path, { waitUntil: 'load' });
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource');
      return {
        bytes: nav.encodedBodySize + res.reduce((s, r) => s + r.encodedBodySize, 0),
        requests: res.length + 1,
        loadMs: Math.round(nav.loadEventEnd),
        thirdParty: res.filter(r => new URL(r.name).origin !== location.origin).map(r => r.name),
      };
    });
    record.push({ path, ...m });
    expect(m.thirdParty, path).toEqual([]);
    expect(m.bytes, `${path} transfer budget`).toBeLessThan(900_000);
    expect(m.requests, `${path} request budget`).toBeLessThanOrEqual(25);
    await context.close();
  }
  mkdirSync('test-results/lab-beta6', { recursive: true });
  writeFileSync('test-results/lab-beta6/cold-load.json', JSON.stringify(record, null, 2));
  await test.info().attach('cold-load', { body: JSON.stringify(record, null, 2), contentType: 'application/json' });
});
