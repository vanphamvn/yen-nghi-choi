// Yên Lab book menu page-turn (#187): no new dependencies, no automatic audio or timers while idle.
import { test, expect } from '@playwright/test';

test('book turns between spreads and keeps playable links on page one', async ({ page }, testInfo) => {
  await page.goto('/lab/');
  const book = page.getByRole('button', { name: 'Mở thực đơn trò chơi' });
  if (testInfo.project.name === 'emulated-touch') await book.tap(); else await book.click();
  const menu = page.locator('#lab-menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('data-page', '1');
  await expect(page.locator('#menu-prev')).toBeDisabled();
  await expect(page.locator('#menu-next')).toBeEnabled();
  await expect(page.getByRole('link', { name: 'Thở cùng Yên' })).toBeVisible();
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(menu).toHaveAttribute('data-page', '2');
  await expect(page.getByText('Thám tử hiện tại')).toBeVisible();
  await expect(page.locator('#menu-page-number')).toHaveText('Trang 2 / 2');
  await expect(page.locator('#menu-next')).toBeDisabled();
  await page.getByRole('button', { name: 'Trang trước' }).click();
  await expect(menu).toHaveAttribute('data-page', '1');
  await expect(page.getByRole('link', { name: 'Căng rồi thả' })).toBeVisible();
  await expect(page.locator('#menu-page-number')).toHaveText('Trang 1 / 2');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
});

test('Escape interrupts a page turn, reopening resets page and focus', async ({ page }) => {
  await page.goto('/lab/');
  await page.locator('#menu-open').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#menu-close')).toBeFocused();
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#lab-menu')).toBeHidden();
  await expect(page.locator('#menu-open')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#lab-menu')).toHaveAttribute('data-page', '1');
  await expect(page.getByRole('link', { name: 'Thở cùng Yên' })).toBeVisible();
});

test('reduced-motion and unavailable sprite switch pages with static fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/lab/assets/book-flip.avif', route => route.abort());
  await page.goto('/lab/');
  await page.locator('#menu-open').click();
  await expect(page.locator('.menu-book-art')).not.toHaveClass(/is-enhanced/);
  await expect(page.locator('.menu-book-art img')).toBeVisible();
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(page.locator('#lab-menu')).toHaveAttribute('data-page', '2');
  await expect(page.locator('#lab-menu')).not.toHaveClass(/is-turning/);
  await page.getByRole('button', { name: 'Trang trước' }).click();
  await expect(page.locator('#lab-menu')).toHaveAttribute('data-page', '1');
});

for (const width of [320, 360, 390, 768, 1440]) {
  test('book menu fits at ' + width + 'px', async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    await page.goto('/lab/');
    await page.locator('#menu-open').click();
    for (const pageNum of [1, 2]) {
      if (pageNum === 2) await page.getByRole('button', { name: 'Trang sau' }).click();
      await expect(page.locator('#lab-menu')).toHaveAttribute('data-page', String(pageNum));
      const info = await page.evaluate(() => {
        const m = document.getElementById('lab-menu').getBoundingClientRect();
        const buttons = [...document.querySelectorAll('.menu-turn-nav button')].map(b => b.getBoundingClientRect().height);
        return { fits: m.left >= -1 && m.right <= innerWidth + 1, targets: buttons, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(info.fits).toBe(true);
      expect(info.targets.every(h => h >= 44)).toBe(true);
      expect(info.overflow).toBe(false);
    }
    if (testInfo.project.name === 'desktop') await testInfo.attach('book-' + width, { body: await page.screenshot(), contentType: 'image/png' });
  });
}
