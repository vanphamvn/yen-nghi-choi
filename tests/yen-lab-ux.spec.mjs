import { test, expect } from '@playwright/test';

const prototype = '/docs/yen-lab/wireframes.html';
const visibleAction = (page, action) => page.locator(`[data-action="${action}"]:visible`);
async function activate(locator, touch) { if (touch) await locator.tap(); else await locator.click(); }
async function enterFirstTool(page, touch) {
  await activate(page.locator('[data-tool]:visible').first(), touch);
  await expect(page.locator('#intro')).toBeVisible();
}
async function attachScreen(page, testInfo, state) {
  await testInfo.attach(`${testInfo.project.name}-${state}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

test('manual needs, all-list and direct-play scenarios stay within two selections', async ({ page }, testInfo) => {
  const touch = testInfo.project.name === 'emulated-touch';
  await page.goto(prototype);
  await expect(page.locator('#hub')).toBeVisible();
  await attachScreen(page, testInfo, 'hub');
  const choices = page.locator('[data-need]');
  await expect(choices).toHaveCount(4);
  await activate(choices.nth(1), touch); // Deliberate selection, never inferred emotional state.
  await enterFirstTool(page, touch); // Need + tool = two selections to intro.
  await page.goto(prototype);
  await activate(page.locator('[data-need]').last(), touch);
  await expect(page.locator('[data-tool]:visible')).toHaveCount(3);
  await enterFirstTool(page, touch); // All-list + tool = two selections.
  await page.goto(prototype);
  await enterFirstTool(page, touch); // Just playing: no mood choice required.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('start, pause, resume, stop, reset, complete and error have explicit usable exits', async ({ page }, testInfo) => {
  const touch = testInfo.project.name === 'emulated-touch';
  await page.goto(prototype);
  await enterFirstTool(page, touch);
  await activate(visibleAction(page, 'start'), touch);
  await expect(page.locator('#active')).toBeVisible();
  await attachScreen(page, testInfo, 'active');
  await activate(visibleAction(page, 'pause'), touch);
  await expect(page.locator('#paused')).toBeVisible();
  await activate(visibleAction(page, 'resume'), touch);
  await expect(page.locator('#active')).toBeVisible();
  await activate(visibleAction(page, 'stop'), touch);
  await expect(page.locator('#result')).toBeVisible();
  await activate(visibleAction(page, 'reset'), touch);
  await expect(page.locator('#intro')).toBeVisible();
  await activate(visibleAction(page, 'start'), touch);
  await activate(visibleAction(page, 'complete'), touch);
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.getByText('Không rõ', { exact: true })).toBeVisible();
  await attachScreen(page, testInfo, 'complete');
  await activate(visibleAction(page, 'reset'), touch);
  await activate(visibleAction(page, 'start'), touch);
  await activate(visibleAction(page, 'error'), touch);
  await expect(page.locator('#error')).toBeVisible();
  await activate(visibleAction(page, 'retry'), touch);
  await expect(page.locator('#intro')).toBeVisible();
});

test('keyboard journey and browser history return to safe intro without autoplay', async ({ page }) => {
  await page.goto(prototype);
  await page.locator('[data-tool]:visible').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#intro')).toBeVisible();
  expect(await page.evaluate(() => document.activeElement?.matches('#intro h1, #intro h2, #intro h3'))).toBe(true);
  await visibleAction(page, 'start').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#active')).toBeVisible();
  await visibleAction(page, 'stop').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#result')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#hub')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#active')).toBeHidden();
});

test('reflection stays in memory and manual need never enters URL or storage', async ({ page, context }) => {
  const unexpectedRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4189' || request.method() !== 'GET') unexpectedRequests.push(request.url());
  });
  await page.goto(prototype);
  await page.locator('[data-need]').first().click();
  expect(new URL(page.url()).hash).toBe('');
  await enterFirstTool(page, false);
  expect(new URL(page.url()).hash).toMatch(/^#tool=(breath|release|small)$/);
  await visibleAction(page, 'start').click();
  await visibleAction(page, 'complete').click();
  await page.locator('[data-reflection]').filter({ hasText: 'Không rõ' }).click();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect(await context.cookies()).toEqual([]);
  expect(page.url()).not.toContain('reflection');
  await page.reload();
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#result')).toBeHidden();
  expect(unexpectedRequests).toEqual([]);
});

test('reduced-motion keeps controls and responsive widths avoid overflow', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(prototype);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await attachScreen(page, testInfo, `reduced-${width}-idle`);
    await enterFirstTool(page, false);
    await expect(visibleAction(page, 'start')).toBeVisible();
    await visibleAction(page, 'start').click();
    await expect(visibleAction(page, 'stop')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await attachScreen(page, testInfo, `reduced-${width}-active`);
    await visibleAction(page, 'complete').click();
    await expect(page.locator('#result')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await attachScreen(page, testInfo, `reduced-${width}-complete`);
  }
});
