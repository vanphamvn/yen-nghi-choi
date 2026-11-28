// Regression: on iPhone Cục Yên's body rendered transparent on the homepage, because iOS WebKit does not resolve
// gradients/patterns/clipPaths referenced from inside an external <use href="/assets/cuc-yen/mascot.svg#…">.
// The homepage now draws Chromium-rendered WebP sprites (assets/cuc-yen/sprites/, tools/render-cuc-yen-sprites.mjs).
// CI runs this in Chromium; set LAB_UX_WEBKIT=1 locally to add the WebKit projects.
import { test, expect } from '@playwright/test';

async function blockExternal(page, baseURL) {
  await page.route(url => url.origin !== new URL(baseURL).origin, route => route.abort());
}

// Every sprite in the page must load, decode, and have an opaque body (centre of the 320×320 pose).
async function checkSprites(page) {
  return page.evaluate(async () => {
    const hrefs = [...new Set([...document.querySelectorAll('image')].map(i => i.getAttribute('href')).filter(h => h && h.includes('/cuc-yen/')))];
    const out = [];
    for (const href of hrefs) {
      const img = new Image();
      img.src = href;
      try { await img.decode(); } catch { out.push({ href, ok: false }); continue; }
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const alpha = ctx.getImageData(Math.round(c.width * 0.5), Math.round(c.height * 0.55), 1, 1).data[3];
      out.push({ href, ok: img.naturalWidth > 0 && alpha === 255 });
    }
    return out;
  });
}

const noExternalMascotUse = page => expect(page.locator('use[href*="mascot.svg"]')).toHaveCount(0);

for (const width of [390, 1440]) {
  test.describe(`homepage Cục Yên at ${width}px`, () => {
    test.use({ viewport: { width, height: width < 768 ? 844 : 900 } });

    test('hero, wheel and preview poses are raster sprites, not an external <use>', async ({ page, baseURL }) => {
      await blockExternal(page, baseURL);
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('/trang-chu.html', { waitUntil: 'domcontentloaded' });
      await noExternalMascotUse(page);

      const hero = page.locator('#mascot image');
      await expect(hero).toHaveAttribute('href', '/assets/cuc-yen/sprites/waving.webp');
      await expect(page.locator('#mascot')).toHaveAttribute('aria-label', /Cục Yên/);
      const box = await hero.boundingBox();
      expect(box.width).toBeGreaterThan(150);

      // Wheel role swap is pure CSS on the three sprites.
      const roles = page.locator('#yen-wheel-clerk image');
      await expect(roles).toHaveCount(3);
      const shown = () => roles.evaluateAll(list => list.filter(i => getComputedStyle(i).display !== 'none').map(i => i.getAttribute('class')));
      expect(await shown()).toEqual(['wheel-role-idle']);
      await page.locator('#yen-wheel-clerk').evaluate(el => el.classList.add('spinning'));
      expect(await shown()).toEqual(['wheel-role-spin']);
      await page.locator('#yen-wheel-clerk').evaluate(el => { el.classList.remove('spinning'); el.classList.add('celebrating'); });
      expect(await shown()).toEqual(['wheel-role-win']);

      await expect(page.locator('.irl-preview-mascot image')).toHaveAttribute('href', '/assets/cuc-yen/sprites/resting.webp');

      // Poke → wink pose, then back to waving.
      await page.locator('#mascot').click();
      await expect(hero).toHaveAttribute('href', '/assets/cuc-yen/sprites/wink.webp');
      await expect(hero).toHaveAttribute('href', '/assets/cuc-yen/sprites/waving.webp');

      // Reaction card built by JS.
      await page.evaluate(() => window.YenReaction.show(document.querySelector('#hero-stage'), 'cheeky', 'test'));
      await expect(page.locator('.cuc-reaction image')).toHaveAttribute('href', '/assets/cuc-yen/sprites/cheeky.webp');

      await noExternalMascotUse(page);
      for (const r of await checkSprites(page)) expect(r, r.href).toEqual({ href: r.href, ok: true });
      expect(errors).toEqual([]);
      await page.screenshot({ path: test.info().outputPath(`homepage-${width}.png`) });
    });

    test('cutscene actor and clone props are raster sprites', async ({ page, baseURL }) => {
      await blockExternal(page, baseURL);
      await page.goto('/trang-chu.html?cuc_scene=clone', { waitUntil: 'domcontentloaded' });
      await page.locator('#poke-btn').click();
      const actor = page.locator('#mascot-cutscene image.scene-cuc-model');
      await expect(actor).toHaveCount(1);
      await expect(page.locator('#mascot-cutscene .story-mini-clone image')).toHaveCount(3);
      await noExternalMascotUse(page);
      for (const r of await checkSprites(page)) expect(r, r.href).toEqual({ href: r.href, ok: true });
      await page.locator('#hero-stage').screenshot({ path: test.info().outputPath(`cutscene-clone-${width}.png`) });
    });
  });
}
