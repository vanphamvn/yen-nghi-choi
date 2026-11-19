// LAB-F08 (#132): runtime privacy, CSP and accessibility baseline for every Yên Lab page.
// Instruments storage, network, device and audio APIs before any page script runs, then drives real flows.
import { test, expect } from '@playwright/test';

const PAGES = ['/lab/', '/docs/yen-lab/game-kit.html'];
const ORIGIN = 'http://127.0.0.1:4189';

async function probe(page) {
  await page.addInitScript(() => {
    const hits = (window.__labProbe = []);
    const spy = (obj, key, label) => {
      const orig = obj && obj[key];
      if (typeof orig !== 'function') return;
      obj[key] = function (...args) { hits.push(label); return orig.apply(this, args); };
    };
    for (const k of ['setItem', 'getItem', 'removeItem', 'clear']) spy(Storage.prototype, k, `storage.${k}`);
    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', { configurable: true, get() { hits.push('cookie.get'); return cookie.get.call(document); }, set(v) { hits.push('cookie.set'); cookie.set.call(document, v); } });
    spy(window, 'fetch', 'fetch');
    spy(XMLHttpRequest.prototype, 'open', 'xhr');
    spy(navigator, 'sendBeacon', 'beacon');
    if (navigator.mediaDevices) spy(navigator.mediaDevices, 'getUserMedia', 'getUserMedia');
    if (navigator.geolocation) { spy(navigator.geolocation, 'getCurrentPosition', 'geo'); spy(navigator.geolocation, 'watchPosition', 'geo'); }
    spy(HTMLMediaElement.prototype, 'play', 'media.play');
    spy(history, 'pushState', 'history.push');
    spy(history, 'replaceState', 'history.replace');
    const WS = window.WebSocket;
    window.WebSocket = function (...a) { hits.push('websocket'); return new WS(...a); };
    document.addEventListener('securitypolicyviolation', e => hits.push(`csp:${e.violatedDirective}:${e.blockedURI}`));
  });
  const requests = [];
  page.on('request', r => requests.push({ url: r.url(), method: r.method(), body: r.postData() }));
  return requests;
}

async function playRoom(page) {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Chọc Cục Yên một cái' }).click();
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  await page.keyboard.press('Escape');
}

async function playKit(page) {
  await page.goto('/docs/yen-lab/game-kit.html');
  const tap = async name => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('bắt đầu'); await tap('tạm dừng'); await tap('tiếp tục'); await tap('dừng hẳn');
  await tap('khó chịu hơn'); await tap('làm lại'); await tap('bắt đầu');
  await page.clock.runFor(31_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await tap('bỏ qua');
}

test('no storage, cookies, network, device, audio or URL state during real Lab flows', async ({ page }) => {
  const requests = await probe(page);
  await page.clock.install();
  await playRoom(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playKit(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  expect(await page.evaluate(() => [location.search, location.hash, history.length <= 3])).toEqual(['', '', true]);
  // Only same-origin GETs of static files, never a body (nothing a guest picks or types leaves the page).
  const offenders = requests.filter(r => !r.url.startsWith(ORIGIN) || r.method !== 'GET' || r.body);
  expect(offenders).toEqual([]);
  expect(requests.filter(r => /\.(json|php)|\/api\//.test(r.url))).toEqual([]);
});

test('/lab/ is served with the strict HTTP CSP and nothing on the page violates it', async ({ page }) => {
  const requests = await probe(page);
  const res = await page.goto('/lab/');
  const csp = res.headers()['content-security-policy'];
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("connect-src 'none'");
  expect(csp).not.toMatch(/unsafe-|\*|https?:/);
  expect(res.headers()['cross-origin-opener-policy']).toBe('same-origin');
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  expect(await page.evaluate(() => window.__labProbe.filter(h => h.startsWith('csp:')))).toEqual([]);
  expect(requests.every(r => r.url.startsWith(ORIGIN))).toBe(true);
});

for (const path of PAGES) {
  test(`a11y baseline on ${path}: names, alt, landmarks, focus visible, exit path`, async ({ page }) => {
    await page.goto(path);
    expect(await page.getAttribute('html', 'lang')).toBe('vi');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    // Every visible control has an accessible name (text, hidden label or aria-label).
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('a, button')]
      .filter(el => el.offsetParent !== null && !(el.textContent.trim() || el.getAttribute('aria-label')))
      .map(el => el.outerHTML.slice(0, 80)));
    expect(unnamed).toEqual([]);
    expect(await page.locator('img:not([alt])').count()).toBe(0);
    // A way back to the room or to Yên is always present.
    expect(await page.locator('a[href="/lab/"], a[href="/"]').count()).toBeGreaterThan(0);
    // Keyboard: every focus stop shows a visible outline.
    const seen = new Set();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        return { key: el.outerHTML.slice(0, 60), outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2, inDialog: !!el.closest('dialog') };
      });
      if (!info || seen.has(info.key)) continue;
      seen.add(info.key);
      expect(info.outline, info.key).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(2);
  });
}

test('reduced motion: no animation or transition anywhere in the room while playing', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Chọc Cục Yên một cái' }).click();
  const moving = await page.evaluate(() => [...document.querySelectorAll('*')].filter(el => {
    const s = getComputedStyle(el);
    return (s.animationName !== 'none' && parseFloat(s.animationDuration) > 0) || parseFloat(s.transitionDuration) > 0;
  }).map(el => el.className));
  expect(moving).toEqual([]);
  await context.close();
});

test('no audio or video elements and nothing plays without a tap', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('audio, video')).toHaveCount(0);
  }
});
