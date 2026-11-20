// G03 (#144) Quét người tìm căng thẳng: five zones reached by "tiếp", skip and stop anywhere, every instruction as text,
// nothing rated or kept; optional spoken cues off by default, offered only with an on-device Vietnamese voice, silent
// until turned on, hushed on every change. Speech is stubbed (headless browsers differ in voices); the stub records
// every speak/cancel so the rules can be checked exactly.
import { test, expect } from '@playwright/test';
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const GQ = '/lab/quet-nguoi/';
const tapOn = async locator => { if (test.info().project.use.hasTouch) await locator.tap(); else await locator.click(); };
const settle = page => page.waitForTimeout(450);
const word = (page, name) => page.getByRole('button', { name, exact: true });
const press = async (page, name) => { await settle(page); await tapOn(word(page, name)); };
const state = page => page.locator('#game');
const ZONE_NAMES = ['Đầu và mặt', 'Vai và cổ', 'Hai tay', 'Bụng và ngực', 'Hai chân'];

// A fake speechSynthesis with the given voices; records what the page asks it to do.
const fakeSpeech = voices => {
  window.__speech = { spoken: [], cancels: 0 };
  const synth = new EventTarget();
  synth.getVoices = () => voices;
  synth.speak = u => window.__speech.spoken.push({ text: u.text, voice: u.voice && u.voice.name, lang: u.lang });
  synth.cancel = () => { window.__speech.cancels++; };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => synth });
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
};
const LOCAL_VI = [{ name: 'Linh', lang: 'vi-VN', localService: true }, { name: 'Google tiếng Việt', lang: 'vi-VN', localService: false }];
const NETWORK_ONLY = [{ name: 'Google tiếng Việt', lang: 'vi-VN', localService: false }, { name: 'Samantha', lang: 'en-US', localService: true }];

async function start(page) {
  await page.goto(GQ);
  await settle(page);
  await tapOn(word(page, 'bắt đầu'));
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await page.evaluate(() => scrollTo(0, 0));
}

test('reachable from the room: the book\'s second spread links to the game', async ({ page }) => {
  await page.goto('/lab/');
  await tapOn(page.getByRole('button', { name: 'Mở thực đơn trò chơi' }));
  await tapOn(page.getByRole('button', { name: 'Trang sau' }));
  const link = page.getByRole('link', { name: 'Quét người tìm căng thẳng' });
  await expect(link).toBeVisible();
  expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await tapOn(link);
  await expect(page).toHaveURL(/\/lab\/quet-nguoi\/$/);
});

test('idle: caution beside start (eyes open, skip, look outward, stop); nothing is asked or rated', async ({ page }) => {
  await page.goto(GQ);
  await expect(page.getByText('Để ý một vài cảm giác đang có.')).toBeVisible();
  await expect(page.getByText('Mở mắt cũng được.', { exact: false })).toBeVisible();
  await expect(page.getByText('Vùng nào không muốn để ý thì bỏ qua, nhìn ra ngoài một chút, hoặc dừng lúc nào cũng được.', { exact: false })).toBeVisible();
  await expect(page.locator('input, select, textarea, [role="slider"]')).toHaveCount(0); // no pain or tension scale anywhere
  await page.waitForTimeout(1200);
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
});

test('all five zones in order by "tiếp", each with its own text cue and announcement, then complete', async ({ page }) => {
  await start(page);
  const seen = [];
  for (let i = 0; i < 5; i++) {
    const name = await page.locator('#gq-zone').textContent();
    const cue = await page.locator('#gq-cue').textContent();
    seen.push(name);
    expect(cue.length, name).toBeGreaterThan(20); // a real instruction in text, not only a picture
    await expect(page.locator('#gq-where')).toHaveText(`${i + 1} / 5`);
    await expect(page.locator('#game-whisper')).toContainText(`${name}. ${cue}`);
    await press(page, 'tiếp');
  }
  expect(seen).toEqual(ZONE_NAMES);
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Xong một lượt. Không cần thấy khác đi.')).toBeVisible();
  await expect(page.locator('#gq-result-line')).toBeFocused();
  await expect(page.getByText(/điểm|mức căng|kết quả của bạn|giỏi lắm/)).toHaveCount(0);
});

test('skip any zone; skipping all five is fine and said kindly', async ({ page }) => {
  await start(page);
  await press(page, 'bỏ qua vùng này');
  await expect(page.locator('#gq-zone')).toHaveText('Vai và cổ');
  await expect(page.locator('#game-whisper')).toContainText('Bỏ qua. Vai và cổ.');
  for (let i = 0; i < 4; i++) await press(page, 'bỏ qua vùng này');
  await expect(state(page)).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#game-whisper')).toHaveText('Hôm nay bỏ qua hết cũng được.');
});

test('stop at any zone; again starts from the head; the reflection keeps nothing', async ({ page }) => {
  await start(page);
  await press(page, 'tiếp'); await press(page, 'tiếp');
  await press(page, 'dừng hẳn');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
  await expect(word(page, 'làm lại')).toBeFocused();
  await press(page, 'khó chịu hơn');
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã nói. Cứ nhìn ra xa, nghỉ một chút nhé; không cần làm lại.');
  await expect(page.getByText('Nếu muốn, lúc này bạn thấy sao?')).toBeHidden();
  await press(page, 'làm lại');
  await press(page, 'bắt đầu');
  await expect(page.locator('#gq-zone')).toHaveText('Đầu và mặt');
});

test('the spotlight follows the zone (hands get one spot per hand); it is decorative only', async ({ page }) => {
  await start(page);
  await expect(page.locator('.gq-figure')).toHaveAttribute('aria-hidden', 'true');
  const spots = () => page.evaluate(() => [...document.querySelectorAll('.gq-spot, .gq-spot-2')].map(s => getComputedStyle(s).display === 'none' ? null : Math.round(parseFloat(getComputedStyle(s).top))));
  const head = await spots();
  await press(page, 'tiếp'); await press(page, 'tiếp');
  await page.waitForTimeout(500);
  const hands = await spots();
  expect(head[1]).toBeNull();
  expect(hands[1]).not.toBeNull();
  expect(hands[0]).not.toBe(head[0]);
});

test('keyboard: start, tiếp, skip and stop by keys; a held Enter moves one zone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'emulated-touch', 'keyboard path on desktop');
  await page.goto(GQ);
  await settle(page);
  await word(page, 'bắt đầu').focus();
  await page.keyboard.press('Enter');
  await expect(word(page, 'tiếp')).toBeFocused();
  await settle(page);
  await page.keyboard.down('Enter'); await page.keyboard.down('Enter'); await page.keyboard.up('Enter');
  await expect(page.locator('#gq-zone')).toHaveText('Vai và cổ');
  await settle(page);
  await page.keyboard.press(TAB(page)); // → bỏ qua vùng này
  await page.keyboard.press('Enter');
  await expect(page.locator('#gq-zone')).toHaveText('Hai tay');
  await settle(page);
  await page.keyboard.press(TAB(page)); // → dừng hẳn
  await page.keyboard.press('Enter');
  await expect(state(page)).toHaveAttribute('data-state', 'stopped');
});

test('voice: offered only with an on-device Vietnamese voice, off by default, silent until turned on', async ({ page }) => {
  await page.addInitScript(fakeSpeech, LOCAL_VI);
  await page.goto(GQ);
  await expect(word(page, 'tắt')).toHaveAttribute('aria-pressed', 'true');
  await press(page, 'bắt đầu');
  await press(page, 'tiếp');
  expect(await page.evaluate(() => window.__speech.spoken)).toEqual([]); // off by default: nothing spoken
  await press(page, 'dừng hẳn');
  await press(page, 'làm lại');
  await press(page, 'bật');
  await press(page, 'bắt đầu');
  await press(page, 'tiếp');
  const spoken = await page.evaluate(() => window.__speech.spoken);
  expect(spoken.map(s => s.voice)).toEqual(['Linh', 'Linh']); // only the on-device voice, never the network one
  expect(spoken[0].text).toBe(`Đầu và mặt. ${await page.evaluate(async () => (await import('/lab/quet-nguoi/quet-nguoi.mjs')).ZONES[0].cue)}`);
  const cancels = await page.evaluate(() => window.__speech.cancels);
  await press(page, 'dừng hẳn');
  expect(await page.evaluate(() => window.__speech.cancels)).toBeGreaterThan(cancels); // stopping hushes it
  expect((await page.evaluate(() => window.__speech.spoken)).length).toBe(2);
});

test('voice: "tắt đọc to" silences it mid-scan without ending the scan; with voice on the live text names the zone only', async ({ page }) => {
  await page.addInitScript(fakeSpeech, LOCAL_VI);
  await page.goto(GQ);
  await expect(word(page, 'tắt đọc to')).toBeHidden(); // nothing to silence while off
  await press(page, 'bật');
  await press(page, 'bắt đầu');
  await expect(page.locator('#game-whisper')).toHaveText('Bắt đầu. Đầu và mặt.'); // the voice reads the cue; no double reading
  await expect(word(page, 'tắt đọc to')).toBeVisible();
  await press(page, 'tắt đọc to');
  await expect(page.locator('#game-whisper')).toHaveText('Đã tắt đọc to.');
  await expect(word(page, 'tắt đọc to')).toBeHidden();
  await expect(state(page)).toHaveAttribute('data-state', 'running');
  await expect(word(page, 'tiếp')).toBeFocused();
  const spoken = (await page.evaluate(() => window.__speech.spoken)).length;
  await press(page, 'tiếp');
  expect((await page.evaluate(() => window.__speech.spoken)).length).toBe(spoken); // stays silent
  await expect(page.locator('#game-whisper')).toContainText('Vai và cổ. Để ý vai và cổ'); // the full cue is back in text
});

test('voice: if the on-device voice disappears, the option hides and the buttons say off; leaving hushes it', async ({ page }) => {
  await page.addInitScript(fakeSpeech, LOCAL_VI);
  await page.goto(GQ);
  await press(page, 'bật');
  await page.evaluate(() => { speechSynthesis.getVoices = () => []; speechSynthesis.dispatchEvent(new Event('voiceschanged')); });
  await expect(page.getByText('đọc to', { exact: true })).toBeHidden();
  await page.evaluate(() => { speechSynthesis.getVoices = () => [{ name: 'Linh', lang: 'vi_VN', localService: true }]; speechSynthesis.dispatchEvent(new Event('voiceschanged')); });
  await expect(word(page, 'bật')).toBeVisible(); // vi_VN (some Android builds) is recognised too
  await expect(word(page, 'bật')).toHaveAttribute('aria-pressed', 'false'); // came back as off, never silently on
  await expect(word(page, 'tắt')).toHaveAttribute('aria-pressed', 'true');
  await press(page, 'bật');
  await press(page, 'bắt đầu');
  const cancels = await page.evaluate(() => window.__speech.cancels);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  expect(await page.evaluate(() => window.__speech.cancels)).toBeGreaterThan(cancels);
});

test('voice: a device with only network or non-Vietnamese voices gets no voice option at all', async ({ page }) => {
  await page.addInitScript(fakeSpeech, NETWORK_ONLY);
  await page.goto(GQ);
  await expect(word(page, 'bật')).toBeHidden();
  await expect(page.locator('#gq-voice-label')).toBeHidden();
  await press(page, 'bắt đầu');
  await press(page, 'tiếp');
  expect(await page.evaluate(() => window.__speech.spoken)).toEqual([]);
});

test('voice: hiding the page hushes it; nothing speaks in the background', async ({ page }) => {
  await page.addInitScript(fakeSpeech, LOCAL_VI);
  await page.goto(GQ);
  await press(page, 'bật');
  await press(page, 'bắt đầu');
  const cancels = await page.evaluate(() => window.__speech.cancels);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await page.evaluate(() => window.__speech.cancels)).toBeGreaterThan(cancels);
});

for (const [w, h] of [[320, 640], [360, 800], [390, 844]]) {
  test(`${w}×${h}: caution and start in the first screen; while scanning, zone text and all words fit, no overflow, targets ≥ 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(GQ);
    for (const t of [word(page, 'bắt đầu'), page.getByText('hoặc dừng lúc nào cũng được', { exact: false })]) {
      const b = await t.boundingBox();
      expect(b.y + b.height, `${w}×${h} idle`).toBeLessThanOrEqual(h);
    }
    await settle(page);
    await tapOn(word(page, 'bắt đầu'));
    await page.evaluate(() => scrollTo(0, 0));
    for (const t of [page.locator('#gq-cue'), word(page, 'tiếp'), word(page, 'bỏ qua vùng này'), word(page, 'dừng hẳn')]) {
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

test('reduced motion: zone by zone by text, nothing animates, completes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(GQ);
  await page.waitForTimeout(450);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await expect(page.locator('#gq-zone')).toHaveText(ZONE_NAMES[i]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await page.waitForTimeout(450);
    await page.getByRole('button', { name: 'tiếp', exact: true }).click();
  }
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
  await press(page, 'tiếp'); await press(page, 'bỏ qua vùng này');
  expect(sent.slice(before).filter(u => !u.endsWith('/favicon.svg'))).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);
  await page.evaluate(() => { dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await expect(state(page)).toHaveAttribute('data-state', 'idle');
});
