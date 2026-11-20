// LAB-F11 (#135): Core Beta 3 release gate. The per-game specs (tho/cang/ba-dieu) prove each game on its own; this
// spec proves the three together as one guest visit: room → book → each game → back to the room, words typed in
// Ba điều nhỏ xíu never leave the page or survive leaving, every game runs offline once loaded, nothing makes sound,
// and a cold load of each page stays light. Runs on desktop, emulated touch and (LAB_UX_DEVICES=1) emulated phones.
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const GAMES = [
  { path: '/lab/tho/', label: 'Thở cùng Yên', timed: true },
  { path: '/lab/cang/', label: 'Căng rồi thả', timed: true },
  { path: '/lab/ba-dieu/', label: 'Ba điều nhỏ xíu', timed: false },
];
const MARKER = 'beta3-riêng-tư-7f3a';
const SHOTS = process.env.LAB_BETA3_SHOTS || ''; // directory for release-note screenshots, only when asked

const tap = async (page, name) => {
  const button = page.getByRole('button', { name, exact: true });
  if (test.info().project.use.hasTouch) await button.tap(); else await button.click();
};
const shot = async (page, name) => {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${test.info().project.name}-${name}.png` });
};

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

async function playThrough(page, game, { clock = game.timed } = {}) {
  const g = page.locator('main.game');
  await expect(g).toHaveAttribute('data-state', 'idle');
  await shot(page, `${game.path.split('/')[2]}-1-idle`);
  if (game.timed) {
    await page.clock.runFor(400);
    await tap(page, 'bắt đầu');
    await expect(g).toHaveAttribute('data-state', 'running');
    await page.clock.runFor(5_000);
    await shot(page, `${game.path.split('/')[2]}-2-running`);
    await page.clock.runFor(10 * 60_000); // every Lab game is ≤ 5 minutes
  } else {
    await tap(page, 'bắt đầu');
    await expect(g).toHaveAttribute('data-state', 'running');
    await page.getByRole('textbox').first().fill(MARKER);
    await shot(page, `${game.path.split('/')[2]}-2-running`);
    await tap(page, 'xong');
    await expect(page.locator('.ba-notes li').first()).toHaveText(MARKER);
  }
  await expect(g).toHaveAttribute('data-state', 'complete');
  // Playwright's fake clock also freezes CSS animations, so the notes' fade-in stays at opacity 0 under it. The
  // "complete" screenshot is therefore only taken on a real-time pass (the offline test), after the fade.
  if (clock && !game.timed) return;
  if (clock) await page.clock.runFor(1_000);
  else if (SHOTS) await page.waitForTimeout(700);
  await shot(page, `${game.path.split('/')[2]}-3-complete`);
}

test('one guest visit: room → book → all three games → back to the room, no errors, nothing kept', async ({ page, context }) => {
  const problems = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  // WebKit logs that it ignores the Chrome-only viewport key `interactive-widget` (Ba điều nhỏ xíu keeps the slip above
  // the Android keyboard with it). That is a parse notice, not a Lab error; anything else fails.
  const ignoredViewportKey = m => m.text() === 'Viewport argument key "interactive-widget" not recognized and ignored.';
  // Only in the opt-in screenshot run: Playwright's screenshot() injects its own <style> on WebKit, which the Lab CSP
  // rightly refuses. The default (CI) run takes no screenshots and keeps this check fully strict.
  const fromScreenshotTool = m => SHOTS && m.text().startsWith('Refused to apply a stylesheet because its hash, its nonce');
  page.on('console', m => { if (m.type() === 'error' && !ignoredViewportKey(m) && !fromScreenshotTool(m)) problems.push(`console: ${m.text()}`); });
  page.on('response', r => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(SOUND_PROBE);
  await page.clock.install();
  await page.goto('/lab/');
  await shot(page, '0-room');
  expect(await page.evaluate(() => [window.__labSound, document.querySelectorAll('audio, video').length])).toEqual([{ audioContext: 0, mediaPlay: 0, speech: 0, vibrate: 0 }, 0]);

  for (const game of GAMES) {
    await expect(page).toHaveURL(/\/lab\/$/);
    await page.clock.runFor(400);
    await tap(page, 'Mở thực đơn trò chơi');
    await expect(page.locator('#lab-menu')).toBeVisible();
    if (game === GAMES[0]) await shot(page, '0-menu');
    const link = page.locator('#lab-menu').getByRole('link', { name: game.label, exact: true });
    if (test.info().project.use.hasTouch) await link.tap(); else await link.click();
    await expect(page).toHaveURL(new RegExp(game.path.replace(/\//g, '\\/') + '$'));
    await playThrough(page, game, { clock: true });
    expect(await page.evaluate(() => window.__labSound)).toEqual({ audioContext: 0, mediaPlay: 0, speech: 0, vibrate: 0 });
    expect(await page.evaluate(() => document.querySelectorAll('audio, video').length)).toBe(0); // autoplay needs no play()
    const home = page.locator('main.game').getByRole('link', { name: 'về góc ngồi chơi', exact: true });
    if (test.info().project.use.hasTouch) await home.tap(); else await home.click();
  }
  await expect(page).toHaveURL(/\/lab\/$/);
  expect(await page.evaluate(() => document.querySelectorAll('audio, video').length)).toBe(0);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  expect(await context.cookies()).toEqual([]);
  expect(problems).toEqual([]);
});

test('Ba điều nhỏ xíu: typed words never leave the page and are gone after leaving and coming back', async ({ page, context }) => {
  const sent = [];
  context.on('request', r => sent.push(`${r.method()} ${r.url()} ${r.postData() || ''}`));
  await page.goto('/lab/ba-dieu/');
  await tap(page, 'bắt đầu');
  const slips = page.getByRole('textbox');
  await slips.nth(0).fill(MARKER);
  await slips.nth(1).fill(MARKER + '-2');
  await tap(page, 'xong');
  await expect(page.getByText(MARKER, { exact: true })).toBeVisible();

  // The real wipe: the page's own pagehide handler (what a browser fires when the page goes into the back/forward
  // cache) must remove the words from the live document before it is frozen. textContent also sees hidden nodes.
  const wordsLeft = () => page.evaluate(() => document.body.textContent + [...document.querySelectorAll('input, textarea')].map(i => i.value).join('|'));
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  expect(await wordsLeft()).not.toContain(MARKER);
  await expect(page.locator('main.game')).toHaveAttribute('data-state', 'idle');

  // Then leave the way a guest would and come back with the back button. Playwright's browsers run without a
  // back/forward cache, so this part proves the page comes back clean from a reload, not from the cache.
  await page.goto('/lab/tho/');
  await page.goBack();
  await expect(page).toHaveURL(/\/lab\/ba-dieu\/$/);
  await expect(page.locator('main.game')).toHaveAttribute('data-state', 'idle');
  expect(await wordsLeft()).not.toContain(MARKER);
  await page.goForward();
  await page.goBack();
  expect(await page.evaluate(() => [...document.querySelectorAll('input')].map(i => i.value).join(''))).toBe('');

  const encoded = [MARKER, encodeURIComponent(MARKER), encodeURI(MARKER)];
  expect(sent.filter(line => encoded.some(m => line.includes(m)))).toEqual([]);
  expect(sent.filter(line => !line.split(' ')[1].startsWith(new URL(page.url()).origin))).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  expect(await page.evaluate(async () => (await (indexedDB.databases?.() ?? [])).length)).toBe(0);
});

for (const game of GAMES) {
  test(`${game.label}: once loaded, plays to the end offline and asks the network for nothing`, async ({ page, context }) => {
    if (game.timed) await page.clock.install();
    await page.goto(game.path, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
    const late = [];
    // The browser fetches <link rel="icon"> on its own timing, sometimes after load: the tab icon, not the game.
    page.on('request', r => { if (new URL(r.url()).pathname !== '/favicon.svg') late.push(r.url()); });
    await context.setOffline(true);
    await playThrough(page, game);
    await context.setOffline(false);
    expect(late).toEqual([]);
  });
}

test('cold load: each Beta page is light and quick on a fresh visit', async ({ browser, baseURL }) => {
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
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
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
  mkdirSync('test-results/lab-beta3', { recursive: true });
  writeFileSync('test-results/lab-beta3/cold-load.json', JSON.stringify(record, null, 2));
  await test.info().attach('cold-load', { body: JSON.stringify(record, null, 2), contentType: 'application/json' });
});
