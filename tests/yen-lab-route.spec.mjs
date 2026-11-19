// LAB-F05 (#129): /lab/ route shell, release-status list and feature-gated homepage link.
import { test, expect } from '@playwright/test';

const LAB = '/lab/';
const WIDTHS = [320, 360, 390, 768, 1440];

// Keep runs hermetic: the homepage requests Google Fonts/Maps, which are irrelevant to these checks.
async function blockExternal(page) {
  const external = [];
  await page.route(url => !/^http:\/\/127\.0\.0\.1:4189\//.test(url.href), route => { external.push(route.request().url()); return route.abort(); });
  return external;
}

test('direct URL, reload and trailing-slash redirect load the Lab shell', async ({ page }) => {
  const external = await blockExternal(page);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  const response = await page.goto(LAB);
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle(/Yên Lab/);
  await expect(page.getByRole('heading', { level: 1, name: 'Yên Lab' })).toBeVisible();
  await expect(page.locator('.room-sign-sub')).toContainText('beta');
  await expect(page.getByRole('button', { name: 'Chọc Cục Yên một cái' })).toBeVisible();
  await expect(page.locator('.room-plaque')).toContainText('không lưu gì');
  await expect(page.locator('main')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Yên Lab' })).toBeVisible();

  await page.goto('/lab');
  expect(new URL(page.url()).pathname).toBe('/lab/');
  expect(errors).toEqual([]);
  expect(external).toEqual([]); // The Lab page itself makes no third-party request.
});

test('hero, three needs, release-status list, house rules and way back to Yên', async ({ page }) => {
  await blockExternal(page);
  await page.goto(LAB);
  await expect(page.locator('[data-need]')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Nội quy', exact: true })).toBeVisible();
  await expect(page.getByText('không thay thế tư vấn hoặc điều trị chuyên môn')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nguồn phương pháp' })).toBeVisible();

  // Unreleased tools are labelled and never dead links or buttons.
  // Deferred routines (e.g. G02 Căng rồi thả, pending protocol review) are not listed at all.
  await expect(page.locator('[data-tool="release"]')).toHaveCount(0);
  // Needs are informational until M3: no controls inside them either.
  await expect(page.locator('[data-need] a, [data-need] button, [data-need] [tabindex]')).toHaveCount(0);
  const coming = page.locator('[data-tool][data-status="coming"]');
  expect(await coming.count()).toBeGreaterThan(0);
  for (const item of await coming.all()) {
    await expect(item.getByText('Sắp có')).toBeVisible();
    await expect(item.locator('a, button, [role="button"], [tabindex]')).toHaveCount(0);
  }
  const released = await page.locator('[data-tool][data-status="released"]').count();
  await expect(page.locator('#lab-release-status')).toHaveAttribute('data-released-count', String(released));
  await expect(page.locator('[data-tool] button, [data-need] button, .room-note button, .room-shelf button')).toHaveCount(0);

  // Không JS cần thiết: page has no scripts at all in the route shell.
  // Only the page's own small script, served from /lab/.
  expect(await page.locator('script').evaluateAll(list => list.map(s => new URL(s.src, location.href).pathname))).toEqual(['/lab/lab.js']);

  const home = page.locator('footer').getByRole('link', { name: 'Về Yên' });
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#dau')).toBeAttached();
});

test('room playthings: poke Cục Yên and switch the lamp, keyboard included, nothing stored', async ({ page }, testInfo) => {
  await blockExternal(page);
  await page.goto(LAB);
  const buddy = page.getByRole('button', { name: 'Chọc Cục Yên một cái' });
  const says = page.locator('#buddy-says');
  const first = await says.textContent();
  await expect(buddy).toBeEnabled();
  if (testInfo.project.name === 'emulated-touch') await buddy.tap(); else await buddy.click();
  await expect(says).not.toHaveText(first);
  await expect(says).toHaveAttribute('aria-live', 'polite');
  const second = await says.textContent();
  await buddy.focus();
  await page.keyboard.press('Enter');
  await expect(says).not.toHaveText(second);

  const lamp = page.getByRole('button', { name: 'Tắt đèn' });
  await lamp.click();
  await expect(page.locator('[data-room]')).toHaveClass(/is-dim/);
  await expect(page.getByRole('button', { name: 'Bật đèn' })).toBeVisible();
  await page.getByRole('button', { name: 'Bật đèn' }).press('Space');
  await expect(page.locator('[data-room]')).not.toHaveClass(/is-dim/);

  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  await page.reload(); // Nothing remembered: lamp back on, first line again.
  await expect(page.locator('[data-room]')).not.toHaveClass(/is-dim/);
  await expect(says).toHaveText(first);
});

test('without JavaScript the room has no dead buttons', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(LAB);
  await expect(page.locator('#lamp-switch')).toBeHidden();
  await expect(page.locator('#buddy')).toBeDisabled();
  await expect(page.getByRole('heading', { level: 1, name: 'Yên Lab' })).toBeVisible();
  await context.close();
});

test('unknown Lab paths return the site 404 with a way home', async ({ page }) => {
  const response = await page.goto('/lab/khong-co-bai-nay/');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Về trang chủ Yên' })).toBeVisible();
});

test('homepage link stays hidden until flag_yenlab, then supports back/forward', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/');
  const link = page.locator('a.yen-lab-link');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute('href', '/lab/');
  await expect(link).toBeHidden(); // Gate M1 (#134) not passed yet.
  expect(await page.evaluate(() => window.flag_yenlab)).toBe(0);
  // Existing homepage sections remain intact.
  for (const id of ['#mascot', '#tam-trang', '#cuahang', '#yen-ngoai-doi', '.irl-map']) await expect(page.locator(id).first()).toBeAttached();

  // Flip the real flag (flag_yenlab = 1) in the served source so the toggle code itself is exercised.
  await page.route('**/127.0.0.1:4189/', async route => {
    const res = await route.fetch();
    const body = (await res.text()).replace('var flag_yenlab = 0;', 'var flag_yenlab = 1;');
    await route.fulfill({ response: res, body });
  });
  await page.goto('/');
  expect(await page.evaluate(() => window.flag_yenlab)).toBe(1);
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/lab\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/127\.0\.0\.1:4189\/$/);
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'Yên Lab' })).toBeVisible();
});

for (const width of WIDTHS) {
  test(`no horizontal overflow and ≥44px targets at ${width}px`, async ({ page }, testInfo) => {
    await blockExternal(page);
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    await page.goto(LAB);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const small = await page.evaluate(() => [...document.querySelectorAll('a:not(.lab-skip), button')]
      .filter(el => el.offsetParent !== null && el.closest('.lab-fineprint') === null)
      .map(el => ({ text: el.textContent.trim(), h: el.getBoundingClientRect().height }))
      .filter(x => x.h < 44));
    expect(small).toEqual([]);
    // Regression (PR #167 browser check): Vietnamese header links must not wrap to two lines at 320px.
    const wrapped = await page.evaluate(() => [...document.querySelectorAll('.lab-nav a')]
      .filter(el => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5 + 8 && el.getClientRects().length > 0)
      .map(el => el.textContent.trim()));
    expect(wrapped).toEqual([]);
    const lines = await page.evaluate(() => [...document.querySelectorAll('.lab-nav a')].map(el => { const r = document.createRange(); r.selectNodeContents(el); return r.getClientRects().length; }));
    expect(lines.every(n => n === 1)).toBe(true);
    await testInfo.attach(`lab-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });
}
