// LAB-F14 (#138): the twenty-game catalog in the browser. tools/check-yen-lab-catalog.mjs proves the files agree; this
// proves what a guest meets: each open game loads only its own code, works as text without JavaScript, still offers a way
// out on a slow or broken load, and the reserved route of a planned game shows the Lab's 404 page, not a fake game.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync(new URL('../docs/yen-lab/ops/catalog.json', import.meta.url), 'utf8'));
const open = catalog.games.filter(g => g.status !== 'planned');
const planned = catalog.games.filter(g => g.status === 'planned');
const tapOn = async locator => { if (test.info().project.use.hasTouch) await locator.tap(); else await locator.click(); };
const exitWord = page => page.getByRole('link', { name: 'về góc ngồi chơi', exact: true });

for (const g of open) {
  test(`${g.key} ${g.title}: deep link loads only its own game code`, async ({ page }) => {
    const scripts = [];
    page.on('request', r => { if (r.resourceType() === 'script') scripts.push(new URL(r.url()).pathname); });
    const response = await page.goto(g.route);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(g.title);
    await expect(page.getByRole('button', { name: 'bắt đầu', exact: true })).toBeEnabled();
    // Its own module, plus the shared timer engine for the timed games; never another game's folder.
    expect(scripts[0]).toBe(g.module);
    expect(scripts.filter(s => s !== g.module && s !== '/lab/engine.mjs')).toEqual([]);
    await page.waitForTimeout(1700); // past the slow-load delay: on a normal load the note never shows
    await expect(page.locator('.game-wait')).toBeHidden();
  });

  test(`${g.key} ${g.title}: without JavaScript it explains itself and the way out works`, async ({ browser }) => {
    const context = await browser.newContext({ ...test.info().project.use, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(g.route);
    // getByText skips <noscript>; innerText only holds rendered text, so this proves the guest sees it.
    expect(await page.locator('main').innerText()).toContain('Trò này cần JavaScript');
    await page.waitForTimeout(1700);
    await expect(page.locator('.game-wait')).toBeHidden(); // <noscript> says it; no "đang mở ra" that never opens
    await tapOn(exitWord(page));
    await expect(page).toHaveURL(/\/lab\/$/);
    await context.close();
  });

  test(`${g.key} ${g.title}: slow network shows a quiet note, the way out works, then the game opens`, async ({ page }) => {
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route(`**${g.module}`, async route => { await held; await route.continue(); });
    // A module script delays DOMContentLoaded, but the page paints before it: wait for the first paint, not the event.
    await page.goto(g.route, { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(g.title);
    const start = page.getByRole('button', { name: 'bắt đầu', exact: true });
    await expect(start).toBeDisabled(); // never a dead-but-enabled word while the module is on its way
    await expect(page.locator('.game-wait')).toBeHidden();
    await expect(page.locator('.game-wait')).toBeVisible({ timeout: 4000 });
    await expect(exitWord(page)).toBeVisible();
    release();
    await expect(start).toBeEnabled();
    await expect(page.locator('.game-wait')).toBeHidden();
  });
}

test('a loaded game that keeps "bắt đầu" off on purpose never says it is still loading', async ({ page }) => {
  // Căng rồi thả disables "bắt đầu" while no body part is chosen; that is a choice, not a slow load.
  await page.goto('/lab/cang/');
  await expect(page.getByRole('button', { name: 'bắt đầu', exact: true })).toBeEnabled();
  const pressedParts = page.locator('button[data-part][aria-pressed="true"]');
  while (await pressedParts.count()) await tapOn(pressedParts.first());
  await expect(page.getByRole('button', { name: 'bắt đầu', exact: true })).toBeDisabled();
  await page.waitForTimeout(1800);
  await expect(page.locator('.game-wait')).toBeHidden();
});

test('a broken game module leaves the note and a working way out', async ({ page }) => {
  const g = open[0];
  await page.route(`**${g.module}`, route => route.abort());
  await page.goto(g.route);
  await expect(page.getByRole('button', { name: 'bắt đầu', exact: true })).toBeDisabled();
  await expect(page.locator('.game-wait')).toBeVisible({ timeout: 4000 });
  await tapOn(exitWord(page));
  await expect(page).toHaveURL(/\/lab\/$/);
});

test('every planned route is reserved: Lab 404 page, no game, a way back', async ({ page, request }) => {
  for (const g of planned) {
    const response = await request.get(g.route);
    expect(response.status(), g.route).toBe(404);
    expect(await response.text(), g.route).toContain('Góc này chưa mở');
  }
  const g = planned[0];
  const requests = [];
  page.on('request', r => requests.push(r));
  await page.goto(g.route);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Góc này chưa mở');
  await expect(page.getByRole('button')).toHaveCount(0); // nothing to play, nothing pretending to be a game
  expect(requests.filter(r => r.resourceType() === 'script')).toEqual([]);
  expect(requests.every(r => new URL(r.url()).origin === new URL(page.url()).origin)).toBe(true);
  await tapOn(page.getByRole('link', { name: 'về góc ngồi chơi', exact: true }));
  await expect(page).toHaveURL(/\/lab\/$/);
});

test('an address that was never a game also lands on the Lab 404 page', async ({ request }) => {
  const response = await request.get('/lab/khong-co-tro-nay/');
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('về góc ngồi chơi');
});

test('the homepage loads neither the catalog nor any game', async ({ page }) => {
  const paths = [];
  page.on('request', r => paths.push(new URL(r.url()).pathname));
  await page.goto('/', { waitUntil: 'load' });
  expect(paths.filter(p => p.endsWith('catalog.json') || p.endsWith('.mjs') || open.some(g => p.startsWith(g.route)))).toEqual([]);
});
