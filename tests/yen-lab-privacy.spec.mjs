// LAB-F08 (#132): runtime privacy, CSP and accessibility baseline for every Yên Lab page.
// Instruments storage, network, device and audio APIs before any page script runs, then drives real flows.
import { test, expect } from '@playwright/test';
// Safari/WebKit only moves focus through links and buttons with Option+Tab (default "Tab to highlight" is off).
const TAB = page => page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab';

const PAGES = ['/lab/', '/lab/tho/', '/lab/cang/', '/lab/ba-dieu/', '/lab/tham-tu/', '/lab/la-troi/', '/lab/goi-ten/', '/docs/yen-lab/game-kit.html'];
const ORIGIN = `http://127.0.0.1:${process.env.LAB_UX_PORT || 4189}`;

async function probe(page) {
  await page.addInitScript(() => {
    const hits = (window.__labProbe = []);
    const spy = (obj, key, label) => {
      const orig = obj && obj[key];
      if (typeof orig !== 'function') return;
      obj[key] = function (...args) { hits.push(label); return orig.apply(this, args); };
    };
    for (const k of ['setItem', 'getItem', 'removeItem', 'clear']) spy(Storage.prototype, k, `storage.${k}`);
    // Any touch of a storage object counts, including `localStorage.key = value`, IndexedDB, Cache API, cookieStore.
    for (const name of ['localStorage', 'sessionStorage', 'indexedDB', 'caches', 'cookieStore']) {
      const d = Object.getOwnPropertyDescriptor(window, name) || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), name);
      if (d && d.get) Object.defineProperty(window, name, { configurable: true, get() { hits.push(`storage:${name}`); return d.get.call(window); } });
    }
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

async function playTho(page) {
  await page.goto('/lab/tho/');
  const tap = async name => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('vừa'); await tap('3 phút'); await tap('bắt đầu'); await page.clock.runFor(8000);
  await tap('tạm dừng'); await tap('tiếp tục'); await page.clock.runFor(4 * 60_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await tap('dễ chịu hơn'); await tap('làm lại');
}

async function playCang(page) {
  await page.goto('/lab/cang/');
  const tap = async name => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('vai'); await tap('chỉ thả lỏng'); await tap('bắt đầu'); await page.clock.runFor(6000);
  await tap('tạm dừng'); await tap('bỏ qua chỗ này'); await tap('tiếp tục'); await page.clock.runFor(4 * 60_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await tap('khó chịu hơn'); await tap('làm lại');
}

const SECRET = 'Bí mật nhỏ của tôi 42';
async function playBaDieu(page) {
  await page.goto('/lab/ba-dieu/');
  const tap = async name => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('bắt đầu');
  await page.getByRole('textbox', { name: 'Điều nhỏ thứ nhất' }).fill(SECRET);
  await page.getByRole('textbox', { name: 'Điều nhỏ thứ nhất' }).press('Enter'); // no <form>: Enter never submits
  await tap('được ngồi yên');
  await tap('xong');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText(SECRET)).toBeVisible();
  await tap('xóa và làm lại');
  await expect(page.getByText(SECRET)).toHaveCount(0);
}

async function playThamTu(page) {
  await page.goto('/lab/tham-tu/');
  const tap = async name => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('bắt đầu');
  for (let i = 0; i < 5; i++) await tap('thấy một thứ');
  await tap('cảm thấy một thứ');
  await tap('đủ rồi');
  await tap('bỏ qua bước này');
  await tap('không có mùi nào');
  await tap('có một vị');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await tap('chơi lại');
}

async function playLaTroi(page) {
  await page.goto('/lab/la-troi/');
  const tap = async name => { await page.clock.runFor(450); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('bắt đầu');
  await page.getByRole('textbox', { name: 'Viết một ý nghĩ, không bắt buộc' }).fill(SECRET);
  await page.getByRole('textbox', { name: 'Viết một ý nghĩ, không bắt buộc' }).press('Enter'); // no <form>: Enter never submits
  await expect(page.locator('#lt-slip')).toHaveText(SECRET);
  await page.clock.runFor(9_000);
  await expect(page.getByText(SECRET)).toHaveCount(0); // gone once the leaf has passed
  await tap('một câu ai đó nói');
  await tap('cho lá trôi luôn');
  await tap('xong');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await tap('chơi lại');
}

async function playGoiTen(page) {
  await page.goto('/lab/goi-ten/');
  const tap = async name => { await page.clock.runFor(450); await page.getByRole('button', { name, exact: true }).click(); };
  await tap('bắt đầu');
  await tap('bực');
  await tap('tủi thân');
  await tap('nhiều');
  await tap('nhìn lại');
  await tap('sửa lại');
  await tap('tủi thân');
  await tap('nhìn lại');
  await tap('xong');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await tap('chơi lại');
}

test('no storage, cookies, network, device, audio or URL state during real Lab flows', async ({ page }) => {
  const requests = await probe(page);
  await page.clock.install();
  await page.goto('/lab/');
  const historyStart = await page.evaluate(() => history.length);
  await playRoom(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playKit(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playTho(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playCang(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playBaDieu(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playThamTu(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playLaTroi(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  await playGoiTen(page);
  expect(await page.evaluate(() => window.__labProbe)).toEqual([]);
  // Only page loads add history entries (re-loading /lab/ replaces its entry; kit and each game add one); nothing a guest
  // does is pushed into the URL.
  expect(await page.evaluate(() => [location.search, location.hash])).toEqual(['', '']);
  expect(await page.evaluate(() => history.length)).toBe(historyStart + 7);
  // Only same-origin GETs of static files, never a body (nothing a guest picks or types leaves the page).
  // …and never with a query string, which could smuggle a choice into server logs (e.g. img.src = '/x.webp?m=' + mood).
  const offenders = requests.filter(r => !r.url.startsWith(ORIGIN) || r.method !== 'GET' || r.body || new URL(r.url).search);
  expect(offenders).toEqual([]);
  expect(requests.filter(r => /\.(json|php)|\/api\//.test(r.url))).toEqual([]);
  // What a guest typed never appears in any request (URL, body), plain or encoded.
  const typed = [SECRET, encodeURIComponent(SECRET), SECRET.replace(/ /g, '+')];
  expect(requests.filter(r => typed.some(t => r.url.includes(t) || (r.body || '').includes(t)))).toEqual([]);
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
    const focusable = await page.evaluate(() => [...document.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null).length);
    const seen = new Set();
    for (let i = 0; i < focusable + 3; i++) {
      await page.keyboard.press(TAB(page));
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        // index in document order identifies the element exactly (no collapsing of look-alike controls)
        const s = getComputedStyle(el);
        return { key: [...document.querySelectorAll('*')].indexOf(el), html: el.outerHTML.slice(0, 60), outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 };
      });
      if (!info || seen.has(info.key)) continue;
      seen.add(info.key);
      expect(info.outline, info.html).toBe(true);
    }
    expect(seen.size).toBe(focusable); // every visible control is reachable by Tab
  });
}

test('reduced motion: no animation or transition anywhere in the room while playing', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Chọc Cục Yên một cái' }).click();
  const moving = await page.evaluate(() => {
    const any = list => list.split(',').some(v => parseFloat(v) > 0); // every value of e.g. "0s, 1s"
    return [...document.querySelectorAll('*')].flatMap(el => [null, '::before', '::after'].map(pseudo => {
      const s = getComputedStyle(el, pseudo);
      return (s.animationName !== 'none' && any(s.animationDuration)) || any(s.transitionDuration) ? `${el.className}${pseudo || ''}` : null;
    })).filter(Boolean);
  });
  expect(moving).toEqual([]);
  await context.close();
});

test('no audio or video elements and nothing plays without a tap', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('audio, video')).toHaveCount(0);
  }
});
