// LAB-F09 (#133): Yên Lab smoke — every Lab page at the 5 QA viewports, assets, links, overlays, overflow,
// one game start/pause/stop/reset, reduced motion. Runs against the local fixture server (PR CI) or, with
// LAB_BASE_URL set, against a deployed site; LAB_EXPECT_SHA then pins the exact build (release gate).
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const BASE = process.env.LAB_BASE_URL || `http://127.0.0.1:${process.env.LAB_UX_PORT || 4189}`;
const ORIGIN = new URL(BASE).origin;
const EXPECT_SHA = process.env.LAB_EXPECT_SHA || '';
const RECORD_DIR = 'test-results/lab-smoke';
// Every released Lab page. A new game adds its route here (and to the menu test in yen-lab-route.spec.mjs).
const PAGES = ['/lab/', '/lab/tho/', '/lab/cang/', '/lab/ba-dieu/', '/lab/tham-tu/', '/lab/la-troi/', '/lab/goi-ten/', '/lab/404.html', '/docs/yen-lab/game-kit.html'];
const GAMES = [{ path: '/lab/tho/', label: 'Thở cùng Yên' }, { path: '/lab/cang/', label: 'Căng rồi thả' }, { path: '/lab/ba-dieu/', label: 'Ba điều nhỏ xíu', untimed: true }, { path: '/lab/tham-tu/', label: 'Thám tử hiện tại', stepped: true }, { path: '/lab/la-troi/', label: 'Lá trôi, nghĩ trôi', leaves: true }, { path: '/lab/goi-ten/', label: 'Gọi tên cơn bực', labels: true }, { path: '/docs/yen-lab/game-kit.html', label: 'kit' }];
const VIEWPORTS = [[320, 640], [360, 800], [390, 844], [768, 1024], [1440, 900]];

test.use({ baseURL: BASE });

// Deployed sites: Netlify injects its own tooling (production toolbar /.netlify/scripts/hud, deploy-preview drawer
// /.netlify/scripts/cdp). It is host UI, not Lab code: block it in the test browser so it can neither draw over the
// page nor log its CSP errors. The provenance test below pins that these are the only injections.
const blockHostTooling = target => target.route('**/.netlify/scripts/**', route => route.abort());
test.beforeEach(async ({ page }) => { if (process.env.LAB_BASE_URL) await blockHostTooling(page); });

// The only tolerated console errors, both caused by Netlify's injected markup, never by Lab code:
//  - Chrome reporting our own block of the tooling script above;
//  - on deploy previews, the CSP blocking the drawer's style="position:fixed" (identified by that exact hash).
const PREVIEW_DIV_STYLE_HASH = createHash('sha256').update('position:fixed').digest('base64');
const isHostNoise = m =>
  (m.location().url.includes('/.netlify/scripts/') && m.text().startsWith('Failed to load resource')) ||
  (/deploy-preview-\d+--/.test(BASE) && m.text().includes(`'sha256-${PREVIEW_DIV_STYLE_HASH}'`));

function watch(page) {
  const problems = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !isHostNoise(m)) problems.push(`console: ${m.text()} @ ${m.location().url}`); });
  page.on('response', r => { if (r.url().startsWith(ORIGIN) && r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => { if (r.url().startsWith(ORIGIN) && !r.url().includes('/.netlify/scripts/')) problems.push(`failed ${r.url()} ${r.failure()?.errorText}`); });
  return problems;
}

// Known host injections on Netlify, matched exactly: production adds a hosting comment after <head> and the toolbar
// script before </body>; deploy previews add the drawer <div> before </body>.
const NETLIFY_INJECTIONS = [
  /\n?<!-- This site is hosted on Netlify\. Anyone can build[^>]*?-->/,
  /\n?<script async src="\/\.netlify\/scripts\/hud\?variant=public" data-nf-variant="public" data-netlify-site-id="[0-9a-f-]+" data-app-host="app\.netlify\.com" data-account-tier="[a-z]+"><\/script>/,
  /\n?<div data-netlify-deploy-id="[0-9a-f]+" data-netlify-site-id="[0-9a-f-]+" data-vcs="github" style="position:fixed">\s*<!-- This div is automatically inserted by Netlify for all Deploy Preview URLs\. -->\s*<script async src="\/\.netlify\/scripts\/cdp"><\/script>\s*<\/div>/,
];

test('provenance: deployed Lab files are byte-identical to this commit, apart from known host injections', async ({ request }) => {
  test.skip(!process.env.LAB_BASE_URL || !EXPECT_SHA, 'needs a deployed site and LAB_EXPECT_SHA with that commit checked out');
  const text = [...PAGES.map(p => p.endsWith('/') ? p + 'index.html' : p), '/lab/lab.css', '/lab/lab.js', '/lab/game.css', '/lab/engine.mjs', '/lab/tho/tho.css', '/lab/tho/tho.mjs', '/lab/cang/cang.css', '/lab/cang/cang.mjs', '/lab/ba-dieu/ba-dieu.css', '/lab/ba-dieu/ba-dieu.mjs', '/lab/tham-tu/tham-tu.css', '/lab/tham-tu/tham-tu.mjs', '/lab/la-troi/la-troi.css', '/lab/la-troi/la-troi.mjs', '/lab/goi-ten/goi-ten.css', '/lab/goi-ten/goi-ten.mjs', '/docs/yen-lab/game-kit.mjs', '/lab/assets/sprites/manifest.json', '/lab/assets/sprites/preview.css', '/lab/assets/sprites/preview.js', '/lab/assets/sprites/preview.html'];
  const spriteSubdirs = ['atlases', 'frames', 'games', 'shared'];
  const spriteBinary = spriteSubdirs.flatMap(dir =>
    readdirSync('lab/assets/sprites/' + dir, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.webp'))
      .map(entry => '/lab/assets/sprites/' + dir + '/' + entry.name)
  );
  const binary = [
    ...readdirSync('lab/assets', { withFileTypes: true })
      .filter(entry => entry.isFile() && !entry.name.endsWith('.md'))
      .map(entry => '/lab/assets/' + entry.name),
    ...spriteBinary, '/yen-logo.svg', '/favicon.svg'
  ];
  const diffs = [];
  for (const file of text) {
    const live = await (await request.get(file.replace(/index\.html$/, ''), { headers: { 'cache-control': 'no-cache' } })).text();
    const cleaned = NETLIFY_INJECTIONS.reduce((t, re) => t.replace(re, ''), live);
    if (cleaned !== readFileSync('.' + file, 'utf8')) diffs.push(file);
  }
  for (const file of binary) {
    const live = await (await request.get(file, { headers: { 'cache-control': 'no-cache' } })).body();
    if (!live.equals(readFileSync('.' + file))) diffs.push(file);
  }
  expect(diffs).toEqual([]);
  expect(text.length + binary.length).toBeGreaterThan(12);
});

test('provenance: the deployed build is the expected commit (only against a deployed site)', async ({ request, browser }) => {
  test.skip(!process.env.LAB_BASE_URL, 'local run: provenance applies to deployed sites only');
  const res = await request.get('/game/preview-2d/build-info.json', { headers: { 'cache-control': 'no-cache' } });
  expect(res.status()).toBe(200);
  const info = await res.json();
  if (EXPECT_SHA) expect(info.commitSha).toBe(EXPECT_SHA);
  mkdirSync(RECORD_DIR, { recursive: true });
  writeFileSync(`${RECORD_DIR}/provenance.json`, JSON.stringify({
    url: BASE, commitSha: info.commitSha, expectedSha: EXPECT_SHA || null, context: info.context, branch: info.branch,
    deployId: info.deployId, browser: `${browser.browserType().name()} ${browser.version()}`, checkedAt: new Date().toISOString(),
  }, null, 2) + '\n');
  if (BASE.includes('yencafeday.netlify.app') && !BASE.includes('--')) expect(info.context).toBe('production');
});

for (const [width, height] of VIEWPORTS) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height } });

    for (const path of PAGES) {
      test(`${path}: loads clean, no overflow, nothing covers a control`, async ({ page }, testInfo) => {
        const problems = watch(page);
        const res = await page.goto(path);
        expect(res.status()).toBe(200);
        await page.waitForLoadState('load');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        // Every image actually decoded (scroll through first so lazy images below the fold load too).
        await page.evaluate(async () => { scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 300)); });
        await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 10_000 }).catch(() => {});
        await page.evaluate(() => scrollTo(0, 0));
        const broken = await page.locator('img').evaluateAll(list => list.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
        expect(broken).toEqual([]);
        // Each visible control (including fixed ones) is the topmost thing at its own centre once scrolled into view:
        // no overlay, bubble or sticky bar on top of it.
        const covered = await page.evaluate(() => {
          const out = [];
          for (const el of document.querySelectorAll('a[href], button')) {
            if (el.closest('.lab-skip') || el.closest('dialog:not([open])') || getComputedStyle(el).visibility === 'hidden' || !el.getClientRects().length) continue;
            el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
            const r = el.getClientRects()[0]; // first line box: a wrapped link has a gap at its bounding-box centre
            if (r.width === 0) continue;
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            if (top && top !== el && !el.contains(top)) out.push(el.textContent.trim() || el.outerHTML.slice(0, 60));
          }
          scrollTo(0, 0);
          return out;
        });
        expect(covered).toEqual([]);
        expect(problems).toEqual([]);
        await testInfo.attach(`${path.replace(/\W+/g, '_')}-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
      });
    }
  });
}

// LAB-F14 (#138): on the real host this proves the netlify.toml /lab/* rule. A planned game's reserved route and any
// unknown Lab address get the Lab 404 page (status 404, a way back), while every released page, with or without its
// trailing slash, still wins over the rule.
test('catalog routes: planned and unknown Lab addresses get the Lab 404 page, released games still load', async ({ request }) => {
  const catalog = JSON.parse(readFileSync(new URL('../docs/yen-lab/ops/catalog.json', import.meta.url), 'utf8'));
  for (const g of catalog.games) {
    const response = await request.get(g.route, { maxRedirects: 3 });
    const body = await response.text();
    if (g.status === 'planned') {
      expect(response.status(), g.route).toBe(404);
      expect(body, g.route).toContain('Góc này chưa mở');
      expect(body, g.route).toContain('href="/lab/"');
    } else {
      expect(response.status(), g.route).toBe(200);
      expect(body, g.route).toContain(`<h1 id="game-title" tabindex="-1">${g.title}</h1>`);
      expect((await request.get(g.route.replace(/\/$/, ''), { maxRedirects: 3 })).status(), `${g.route} without slash`).toBe(200);
    }
  }
  const unknown = await request.get('/lab/khong-co-tro-nay/');
  expect(unknown.status()).toBe(404);
  expect(await unknown.text()).toContain('Góc này chưa mở');
});

test('no dead internal links on any Lab page', async ({ page, request }) => {
  const seen = new Map();
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.locator('a[href]').evaluateAll(list => list.map(a => a.href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== ORIGIN || seen.has(url.pathname)) continue; // external sources are listed in EVIDENCE.md, not fetched here
      seen.set(url.pathname, (await request.get(url.pathname, { maxRedirects: 3 })).status());
    }
  }
  const dead = [...seen].filter(([, status]) => status >= 400);
  expect(dead).toEqual([]);
  expect(seen.size).toBeGreaterThan(1);
});

for (const game of GAMES.filter(g => g.untimed)) {
  // A game without a timer has no pause: start → stop (wipes) → reset → start → write → done → complete.
  test(`${game.label}: start → stop → reset → write → complete really works, words never kept`, async ({ page }) => {
    const problems = watch(page);
    await page.goto(game.path);
    const g = page.locator('main.game');
    const tap = name => page.getByRole('button', { name, exact: true }).click();
    await tap('bắt đầu');
    await expect(g).toHaveAttribute('data-state', 'running');
    await page.getByRole('textbox').first().fill('smoke chữ thử');
    await tap('dừng hẳn');
    await expect(g).toHaveAttribute('data-state', 'stopped');
    await tap('xóa và làm lại');
    await expect(g).toHaveAttribute('data-state', 'idle');
    await tap('bắt đầu');
    await expect(page.getByRole('textbox').first()).toHaveValue('');
    await page.getByRole('textbox').first().fill('smoke chữ thử');
    await tap('xong');
    await expect(g).toHaveAttribute('data-state', 'complete');
    await expect(page.getByText('smoke chữ thử')).toBeVisible();
    await expect(page.locator('main.game a[href="/lab/"]').first()).toBeVisible();
    expect(await page.evaluate(() => location.search + location.hash)).toBe('');
    expect(problems).toEqual([]);
  });

  test(`${game.label}: reduced motion still completes, with nothing moving`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', baseURL: BASE });
    if (process.env.LAB_BASE_URL) await blockHostTooling(context);
    const page = await context.newPage();
    await page.goto(game.path);
    await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
    await page.getByRole('button', { name: 'xong', exact: true }).click();
    const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
      const s = getComputedStyle(el);
      return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
    }));
    expect(moving).toBe(false);
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await context.close();
  });
}

for (const game of GAMES.filter(g => g.stepped)) {
  // Counting steps, no timer and no text: start → stop → again → count/skip every step → complete.
  test(`${game.label}: start → stop → again → count and skip → complete really works`, async ({ page }) => {
    const problems = watch(page);
    await page.clock.install(); // taps within 400 ms of a step change are dropped on purpose; step the clock past that
    await page.goto(game.path);
    const g = page.locator('main.game');
    const wait = () => page.clock.runFor(450);
    const lead = { click: async () => { await wait(); await page.locator('[data-act="found"]').click(); } };
    const skip = { click: async () => { await wait(); await page.locator('[data-act="skip"]').click(); } };
    const tap = async name => { await wait(); await page.getByRole('button', { name, exact: true }).click(); };
    await tap('bắt đầu');
    await expect(g).toHaveAttribute('data-state', 'running');
    await lead.click();
    await tap('dừng hẳn');
    await expect(g).toHaveAttribute('data-state', 'stopped');
    await tap('chơi lại');
    await expect(g).toHaveAttribute('data-state', 'idle');
    await tap('bắt đầu');
    for (let i = 0; i < 5; i++) await lead.click();
    await expect(g).toHaveAttribute('data-step', '2');
    for (let i = 0; i < 3; i++) await skip.click();
    await lead.click();
    await expect(g).toHaveAttribute('data-state', 'complete');
    await expect(page.locator('main.game a[href="/lab/"]').first()).toBeVisible();
    expect(await page.evaluate(() => location.search + location.hash)).toBe('');
    expect(problems).toEqual([]);
  });

  test(`${game.label}: reduced motion still completes, with nothing moving`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', baseURL: BASE });
    if (process.env.LAB_BASE_URL) await blockHostTooling(context);
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(game.path);
    await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
    for (let i = 0; i < 5; i++) { await page.clock.runFor(450); await page.locator('[data-act="skip"]').click(); }
    const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
      const s = getComputedStyle(el);
      return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
    }));
    expect(moving).toBe(false);
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await context.close();
  });
}

for (const game of GAMES.filter(g => g.leaves)) {
  // A leaf at a time: start → place → stop (wipes) → again → write + place → let go → idea + drift ends → done.
  test(`${game.label}: start → place → stop → again → place, let go, drift ends → complete really works, words never kept`, async ({ page }) => {
    const problems = watch(page);
    await page.clock.install(); // taps within 400 ms of a change are dropped on purpose; step the clock past that
    await page.goto(game.path);
    const g = page.locator('main.game');
    const tap = async name => { await page.clock.runFor(450); await page.getByRole('button', { name, exact: true }).click(); };
    await tap('bắt đầu');
    await expect(g).toHaveAttribute('data-state', 'running');
    await tap('bụng hơi đói');
    await expect(g).toHaveAttribute('data-phase', 'drift');
    await tap('dừng hẳn');
    await expect(g).toHaveAttribute('data-state', 'stopped');
    await tap('chơi lại');
    await tap('bắt đầu');
    await page.getByRole('textbox').fill('smoke ý nghĩ thử');
    await tap('đặt lên lá');
    await expect(page.locator('#lt-slip')).toHaveText('smoke ý nghĩ thử');
    await tap('cho lá trôi luôn');
    await expect(g).toHaveAttribute('data-phase', 'choose');
    await expect(page.getByText('smoke ý nghĩ thử')).toHaveCount(0);
    await tap('chuyện ngày mai');
    await page.clock.runFor(9_000); // the drift ends on its own
    await expect(g).toHaveAttribute('data-phase', 'choose');
    await tap('xong');
    await expect(g).toHaveAttribute('data-state', 'complete');
    await expect(page.locator('main.game a[href="/lab/"]').first()).toBeVisible();
    expect(await page.evaluate(() => location.search + location.hash)).toBe('');
    expect(problems).toEqual([]);
  });

  test(`${game.label}: reduced motion still completes, with nothing moving`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', baseURL: BASE });
    if (process.env.LAB_BASE_URL) await blockHostTooling(context);
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(game.path);
    const tap = async name => { await page.clock.runFor(450); await page.getByRole('button', { name, exact: true }).click(); };
    await tap('bắt đầu');
    await tap('việc phải làm');
    const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
      const s = getComputedStyle(el);
      return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
    }));
    expect(moving).toBe(false);
    await expect(page.locator('#lt-slip')).toBeVisible(); // the static equivalent: the leaf rests in view until let go
    await page.clock.runFor(9_000);
    await expect(page.locator('#lt-slip')).toHaveText('việc phải làm');
    await tap('cho lá trôi luôn');
    await tap('xong');
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await context.close();
  });
}

for (const game of GAMES.filter(g => g.labels)) {
  // Choose words → look → edit → look → done; stop and again wipe the choices.
  test(`${game.label}: start → choose → stop → again → choose, look, edit, look → complete really works`, async ({ page }) => {
    const problems = watch(page);
    await page.clock.install(); // taps within 400 ms of a change are dropped on purpose; step the clock past that
    await page.goto(game.path);
    const g = page.locator('main.game');
    const tap = async name => { await page.clock.runFor(450); await page.getByRole('button', { name, exact: true }).click(); };
    await tap('bắt đầu');
    await tap('bực');
    await tap('dừng hẳn');
    await expect(g).toHaveAttribute('data-state', 'stopped');
    await tap('chơi lại');
    await tap('bắt đầu');
    await expect(page.getByRole('button', { name: 'bực', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await tap('mệt');
    await tap('vừa');
    await tap('nhìn lại');
    await expect(page.locator('#gt-named')).toHaveText('Lúc này: mệt, vừa.');
    await tap('sửa lại');
    await tap('lo');
    await tap('nhìn lại');
    await expect(page.locator('#gt-named')).toHaveText('Lúc này: mệt và lo, vừa.');
    await tap('xong');
    await expect(g).toHaveAttribute('data-state', 'complete');
    await expect(page.locator('main.game a[href="/lab/"]').first()).toBeVisible();
    expect(await page.evaluate(() => location.search + location.hash)).toBe('');
    expect(problems).toEqual([]);
  });

  test(`${game.label}: reduced motion still completes, with nothing moving`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', baseURL: BASE });
    if (process.env.LAB_BASE_URL) await blockHostTooling(context);
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(game.path);
    const tap = async name => { await page.clock.runFor(450); await page.getByRole('button', { name, exact: true }).click(); };
    await tap('bắt đầu');
    await tap('không biết gọi tên');
    await tap('nhìn lại');
    const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
      const s = getComputedStyle(el);
      return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
    }));
    expect(moving).toBe(false);
    await tap('xong');
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await context.close();
  });
}

for (const game of GAMES.filter(g => !g.untimed && !g.stepped && !g.leaves && !g.labels)) {
  test(`${game.label}: start → pause → resume → stop → reset → complete really works`, async ({ page }) => {
    const problems = watch(page);
    await page.clock.install();
    await page.goto(game.path);
    const g = page.locator('main.game');
    const tap = async name => { await page.clock.runFor(400); await page.getByRole('button', { name, exact: true }).click(); };
    await tap('bắt đầu');
    await expect(g).toHaveAttribute('data-state', 'running');
    await tap('tạm dừng');
    await expect(g).toHaveAttribute('data-state', 'paused');
    await tap('tiếp tục');
    await expect(g).toHaveAttribute('data-state', 'running');
    await tap('dừng hẳn');
    await expect(g).toHaveAttribute('data-state', 'stopped');
    await tap('làm lại');
    await expect(g).toHaveAttribute('data-state', 'idle');
    await tap('bắt đầu');
    await page.clock.runFor(10 * 60_000); // any Lab game is ≤ 5 minutes
    await expect(g).toHaveAttribute('data-state', 'complete');
    await expect(page.locator('main.game a[href="/lab/"]').first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test(`${game.label}: reduced motion still completes, with nothing moving`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', baseURL: BASE });
    if (process.env.LAB_BASE_URL) await blockHostTooling(context);
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(game.path);
    await page.clock.runFor(400);
    await page.getByRole('button', { name: 'bắt đầu', exact: true }).click();
    const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(el => {
      const s = getComputedStyle(el);
      return (s.animationName !== 'none' && s.animationDuration.split(',').some(v => parseFloat(v) > 0)) || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
    }));
    expect(moving).toBe(false);
    await page.clock.runFor(10 * 60_000);
    await expect(page.locator('main.game')).toHaveAttribute('data-state', 'complete');
    await context.close();
  });
}
