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
  await expect(page.getByText('Beta', { exact: true })).toBeVisible();
  await expect(page.getByText('Thử một bài ngắn. Dừng lúc nào cũng được.')).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Yên Lab' })).toBeVisible();

  await page.goto('/lab');
  expect(new URL(page.url()).pathname).toBe('/lab/');
  expect(errors).toEqual([]);
  expect(external).toEqual([]); // The Lab page itself makes no third-party request.
});

test('hero, three needs, release-status list, safety note and way back to Yên', async ({ page }) => {
  await blockExternal(page);
  await page.goto(LAB);
  await expect(page.locator('[data-need]')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Trước khi thử' })).toBeVisible();
  await expect(page.getByText('không thay thế tư vấn hoặc điều trị chuyên môn')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nguồn phương pháp' })).toBeVisible();

  // Unreleased tools are labelled and never dead links or buttons.
  const coming = page.locator('[data-tool][data-status="coming"]');
  expect(await coming.count()).toBeGreaterThan(0);
  for (const item of await coming.all()) {
    await expect(item.getByText('Sắp có')).toBeVisible();
    await expect(item.locator('a, button, [role="button"], [tabindex]')).toHaveCount(0);
  }
  const released = await page.locator('[data-tool][data-status="released"]').count();
  await expect(page.locator('#lab-release-status')).toHaveAttribute('data-released-count', String(released));
  await expect(page.locator('main button')).toHaveCount(0);

  // Không JS cần thiết: page has no scripts at all in the route shell.
  await expect(page.locator('script')).toHaveCount(0);

  const home = page.locator('footer').getByRole('link', { name: 'Về Yên' });
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#dau')).toBeAttached();
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
  for (const id of ['#tam-trang', '#cuahang', '#yen-ngoai-doi']) await expect(page.locator(id)).toBeAttached();

  // Simulate the release flip (flag_yenlab = 1) and use the real link.
  await page.evaluate(() => document.documentElement.classList.add('yen-lab-on'));
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
    const small = await page.evaluate(() => [...document.querySelectorAll('a:not(.lab-skip)')]
      .filter(el => el.offsetParent !== null && el.closest('.lab-safety') === null)
      .map(el => ({ text: el.textContent.trim(), h: el.getBoundingClientRect().height }))
      .filter(x => x.h < 44));
    expect(small).toEqual([]);
    await testInfo.attach(`lab-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });
}
