// LAB-F05 (#129): /lab/ route shell, release-status list and feature-gated homepage link.
import { test, expect } from '@playwright/test';

const LAB = '/lab/';
const WIDTHS = [320, 360, 390, 768, 1440];

// Keep runs hermetic: the homepage requests Google Fonts/Maps, which are irrelevant to these checks.
async function blockExternal(page) {
  const external = [];
  await page.route(url => !url.href.startsWith(`http://127.0.0.1:${process.env.LAB_UX_PORT || 4189}/`), route => { external.push(route.request().url()); return route.abort(); });
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
  await expect(page.getByRole('heading', { level: 1, name: /Yên Lab/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Chọc Cục Yên một cái' })).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: /Yên Lab/ })).toHaveCount(1);

  await page.goto('/lab');
  expect(new URL(page.url()).pathname).toBe('/lab/');
  expect(errors).toEqual([]);
  expect(external).toEqual([]); // The Lab page itself makes no third-party request.
});

test('hero, three needs, release-status list, house rules and way back to Yên', async ({ page }) => {
  await blockExternal(page);
  await page.goto(LAB);
  // Less text: no labels, notes or tags on the room.
  await expect(page.locator('[data-need], .room-plaque, .room-note, .room-switch, .room-sign')).toHaveCount(0);
  await expect(page.getByText('không thay thế tư vấn hoặc điều trị chuyên môn')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nguồn phương pháp' })).toBeVisible();

  // The painted book on the table opens the game menu (a native modal dialog).
  const book = page.getByRole('button', { name: 'Mở thực đơn trò chơi' });
  const menu = page.locator('#lab-menu');
  await expect(menu).toBeHidden();
  await book.click();
  await expect(menu).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Thực đơn' })).toBeVisible();
  // Opened by mouse/tap: focus sits on the dialog itself (no ring drawn around the book on iPhone WebKit).
  await expect(menu).toBeFocused();
  // No visible close button or tag: the open book itself closes the menu.
  await expect(page.locator('.menu-close')).toHaveCount(0);

  // Deferred routines are not listed; unreleased games are labelled and never dead links/buttons.
  await expect(page.locator('[data-tool="release"]')).toHaveCount(0);
  // (there may be none: once every listed game is released, the book simply has no "sắp có" line)
  const coming = page.locator('[data-tool][data-status="coming"]');
  for (const item of await coming.all()) {
    await expect(item.getByText('sắp có')).toBeVisible();
    await expect(item.locator('a, button, [role="button"], [tabindex]')).toHaveCount(0);
  }
  const released = await page.locator('[data-tool][data-status="released"]').count();
  await expect(page.locator('#lab-release-status')).toHaveAttribute('data-released-count', String(released));
  // Released games are a single real link to their own screen (G01 #142: /lab/tho/).
  for (const item of await page.locator('[data-tool][data-status="released"]').all()) {
    const href = await item.locator('a').getAttribute('href');
    expect(href).toMatch(/^\/lab\/[a-z-]+\/$/);
    expect((await page.request.get(href)).status()).toBe(200);
    await expect(item.getByText('sắp có')).toHaveCount(0);
  }
  expect(released).toBeGreaterThanOrEqual(1);

  // Close by button, Escape and tapping outside; focus returns to the book each time.
  await page.getByRole('button', { name: 'Gấp sổ lại' }).click();
  await expect(menu).toBeHidden();
  await expect(book).toBeFocused();
  await book.press('Enter');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gấp sổ lại' })).toBeFocused(); // keyboard open: close control focused
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(book).toBeFocused();
  await book.click();
  await page.mouse.click(5, 5); // outside the book, on the backdrop
  await expect(menu).toBeHidden();

  // Regression: iOS WebKit drops gradients/patterns referenced through an external <use>, which made Cục Yên
  // transparent on iPhone. Lab must use the raster sprite, never <use href=".../mascot.svg#...">.
  await expect(page.locator('use[href*="mascot.svg"]')).toHaveCount(0);
  expect(await page.locator('#buddy img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  // Only the page's own small script, served from /lab/.
  expect(await page.locator('script').evaluateAll(list => list.map(s => new URL(s.src, location.href).pathname))).toEqual(['/lab/lab.js']);

  const home = page.locator('footer').getByRole('link', { name: 'Về Yên' });
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#dau')).toBeAttached();
});

test('room playthings: poke Cục Yên by mouse, touch and keyboard, nothing stored', async ({ page }, testInfo) => {
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

  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  await page.reload(); // Nothing remembered: first line again.
  await expect(says).toHaveText(first);
});

test('without JavaScript the room has no dead buttons', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(LAB);
  await expect(page.locator('#menu-open')).toBeDisabled();
  await expect(page.locator('.menu-noscript')).toContainText('Thở cùng Yên');
  await expect(page.locator('#buddy')).toBeDisabled();
  await expect(page.getByRole('heading', { level: 1, name: /Yên Lab/ })).toHaveCount(1);
  await context.close();
});

test('unknown Lab paths return the site 404 with a way home', async ({ page }) => {
  const response = await page.goto('/lab/khong-co-bai-nay/');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Về trang chủ Yên' })).toBeVisible();
});

test('M1 (#134): homepage link is on, ≥44px, leads to a playable game; back/forward; rollback flag hides it', async ({ page }) => {
  await blockExternal(page);
  await page.clock.install();
  await page.goto('/');
  expect(await page.evaluate(() => window.flag_yenlab)).toBe(1);
  const link = page.locator('a.yen-lab-link');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute('href', '/lab/');
  await expect(link).toBeVisible();
  // Regression from PR #167 review: inline 13px text links were < 44px tall on phones (game link shares the style).
  for (const box of await page.locator('a.yen-game-link').evaluateAll(l => l.map(a => a.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(44);
  // Existing homepage sections remain intact.
  for (const id of ['#mascot', '#tam-trang', '#cuahang', '#yen-ngoai-doi', '.irl-map']) await expect(page.locator(id).first()).toBeAttached();

  // Homepage → room → book → Thở cùng Yên → really plays, no login.
  await link.click();
  await expect(page).toHaveURL(/\/lab\/$/);
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  await page.getByRole('link', { name: 'Thở cùng Yên' }).click();
  await expect(page).toHaveURL(/\/lab\/tho\/$/);
  await page.clock.runFor(400);
  await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'running');
  await page.clock.runFor(61_000);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  // Back/forward through the journey; nothing auto-starts on return.
  await page.goBack();
  await expect(page).toHaveURL(/\/lab\/$/);
  await page.goBack();
  await expect(page).toHaveURL(`http://127.0.0.1:${process.env.LAB_UX_PORT || 4189}/`);
  await page.goForward();
  await page.goForward();
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'idle');

  // Rollback path: flag_yenlab = 0 in the served source hides the link again (the toggle code itself runs).
  await page.route(`**/127.0.0.1:${process.env.LAB_UX_PORT || 4189}/`, async route => {
    const res = await route.fetch();
    const body = (await res.text()).replace('var flag_yenlab = 1;', 'var flag_yenlab = 0;');
    await route.fulfill({ response: res, body });
  });
  await page.goto('/');
  expect(await page.evaluate(() => window.flag_yenlab)).toBe(0);
  await expect(link).toBeHidden();
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

test('menu focus never draws a ring around the book after a tap (iPhone WebKit), but does for keyboard users', async ({ page }) => {
  await page.goto(LAB);
  const book = page.locator('#menu-open');
  const ring = () => book.evaluate(el => getComputedStyle(el).outlineStyle !== 'none' && el.matches(':focus-visible'));
  await book.click();
  await expect(page.locator('#lab-menu')).toBeVisible();
  await page.locator('#menu-close').click({ position: { x: 20, y: 20 } });
  await expect(page.locator('#lab-menu')).toBeHidden();
  await expect(book).toBeFocused();
  expect(await ring()).toBe(false);
  // The next key press brings the ring back for keyboard users.
  await page.keyboard.press('Shift');
  expect(await ring()).toBe(true);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(book).toBeFocused();
  expect(await ring()).toBe(true);
});

// LAB-F12 (#136): game suggestions come from Cục Yên's bubble (owner decision 20/11/2026: no visible need buttons).
// Static mapping, three loose groups (body / head / heart), a suggestion every other poke, never automatic.
test('Cục Yên suggests games: all three groups, only released games, a real link, never automatic, nothing kept', async ({ page }, testInfo) => {
  await blockExternal(page);
  const sent = [];
  page.on('request', r => sent.push(r.url()));
  await page.goto(LAB);
  await page.waitForLoadState('load');
  // Load every image first (lazy ones too): only what poking asks for is counted.
  await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
  const before = sent.length;
  const buddy = page.getByRole('button', { name: 'Chọc Cục Yên một cái' });
  const says = page.locator('#buddy-says');
  const released = await page.locator('#lab-menu [data-status="released"] a').evaluateAll(list => list.map(a => a.getAttribute('href')));
  expect(released.length).toBe(6);
  const seen = [];
  for (let i = 0; i < 12; i++) {
    if (testInfo.project.name === 'emulated-touch') await buddy.tap(); else await buddy.click();
    const link = says.locator('a');
    if (i % 2 === 0) {
      await expect(link).toHaveCount(1);
      const [href, group, name] = await link.evaluate(a => [a.getAttribute('href'), a.dataset.suggest, a.textContent]);
      // the link names the game exactly as the book does
      await expect(page.locator(`#lab-menu a[href="${href}"]`)).toHaveText(name);
      seen.push({ href, group });
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    } else {
      await expect(link).toHaveCount(0); // a chat line in between: the room is not a recommendation engine
    }
  }
  expect(new Set(seen.map(s => s.group))).toEqual(new Set(['body', 'head', 'heart']));
  expect(seen.every(s => released.includes(s.href))).toBe(true);
  expect(new Set(seen.map(s => s.href))).toEqual(new Set(released)); // every released game gets suggested
  for (let i = 1; i < seen.length; i++) expect(seen[i].group).not.toBe(seen[i - 1].group); // consecutive suggestions differ
  await expect(page).toHaveURL(/\/lab\/$/); // nothing navigated on its own
  expect(sent.slice(before)).toEqual([]); // suggesting asks the network for nothing
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);
  // the book is still the full list
  await page.getByRole('button', { name: 'Mở thực đơn trò chơi' }).click();
  await expect(page.locator('#lab-menu [data-status="released"] a')).toHaveCount(6);
});

test('Cục Yên suggestion by keyboard and screen reader: poke with Enter, Tab reaches the game, Enter opens it; back starts fresh', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'emulated-touch', 'keyboard path on desktop');
  await blockExternal(page);
  await page.goto(LAB);
  const buddy = page.getByRole('button', { name: 'Chọc Cục Yên một cái' });
  const says = page.locator('#buddy-says');
  const first = await says.textContent();
  await buddy.focus();
  await page.keyboard.press('Enter');
  await expect(says).toHaveAttribute('role', 'status');
  await expect(says).toContainText('Thở cùng Yên');
  // Safari/WebKit only moves focus to links with Option+Tab (default "Tab to highlight" is off).
  await page.keyboard.press(page.context().browser()?.browserType().name() === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'Thở cùng Yên' }).first()).toBeFocused();
  const focusRing = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
  expect(focusRing).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/lab\/tho\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/lab\/$/);
  await expect(says).toHaveText(first); // nothing remembered
});

for (const [w, h] of [[320, 640], [390, 844], [1280, 800]]) {
  test(`${w}×${h}: a suggested game link sits on top, inside the room, readable and tappable`, async ({ page }) => {
    await blockExternal(page);
    await page.setViewportSize({ width: w, height: h });
    await page.goto(LAB);
    const buddy = page.getByRole('button', { name: 'Chọc Cục Yên một cái' });
    for (let i = 0; i < 12; i++) {
      await buddy.click();
      if (i % 2) continue;
      const link = page.locator('#buddy-says a');
      const ok = await link.evaluate(a => {
        a.scrollIntoView({ block: 'center', behavior: 'instant' });
        const r = a.getClientRects()[0], stage = document.querySelector('[data-room]').getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const bubble = a.parentElement.getBoundingClientRect();
        return { onTop: top === a || a.contains(top), inStage: bubble.left >= stage.left - 1 && bubble.right <= stage.right + 1 && bubble.top >= stage.top - 1, name: a.textContent };
      });
      expect(ok.onTop, ok.name).toBe(true);
      expect(ok.inStage, ok.name).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
