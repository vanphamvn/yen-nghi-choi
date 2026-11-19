// LAB-F09 (#133): Yên Lab smoke — every Lab page at the 5 QA viewports, assets, links, overlays, overflow,
// one game start/pause/stop/reset, reduced motion. Runs against the local fixture server (PR CI) or, with
// LAB_BASE_URL set, against a deployed site; LAB_EXPECT_SHA then pins the exact build (release gate).
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const BASE = process.env.LAB_BASE_URL || 'http://127.0.0.1:4189';
const ORIGIN = new URL(BASE).origin;
const EXPECT_SHA = process.env.LAB_EXPECT_SHA || '';
const RECORD_DIR = 'test-results/lab-smoke';
// Every released Lab page. A new game adds its route here (and to the menu test in yen-lab-route.spec.mjs).
const PAGES = ['/lab/', '/docs/yen-lab/game-kit.html'];
const GAMES = [{ path: '/docs/yen-lab/game-kit.html', label: 'kit' }];
const VIEWPORTS = [[320, 640], [360, 800], [390, 844], [768, 1024], [1440, 900]];

test.use({ baseURL: BASE });

function watch(page) {
  const problems = [];
  page.on('pageerror', e => problems.push(`pageerror: ${e.message}`));
  // Netlify injects its toolbar script (/.netlify/scripts/hud) into every production page; it renders in an
  // about:srcdoc iframe whose inline code our CSP blocks. Lab pages have no iframes (static check forbids them), so
  // errors from about:srcdoc are the host's, not ours. The provenance test pins that this is the only injection.
  page.on('console', m => { if (m.type() === 'error' && m.location().url !== 'about:srcdoc') problems.push(`console: ${m.text()}`); });
  page.on('response', r => { if (r.url().startsWith(ORIGIN) && r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => { if (r.url().startsWith(ORIGIN)) problems.push(`failed ${r.url()} ${r.failure()?.errorText}`); });
  return problems;
}

// Known host injections on Netlify: a hosting comment after <head> and the toolbar script before </body>.
const NETLIFY_INJECTIONS = [
  /\n?<!-- This site is hosted on Netlify\.[\s\S]*?-->/,
  /\n?<script async src="\/\.netlify\/scripts\/hud\?[^"]*"[^>]*><\/script>/,
];

test('provenance: deployed Lab files are byte-identical to this commit, apart from known host injections', async ({ request }) => {
  test.skip(!process.env.LAB_BASE_URL || !EXPECT_SHA, 'needs a deployed site and LAB_EXPECT_SHA with that commit checked out');
  const files = [...PAGES.map(p => p.endsWith('/') ? p + 'index.html' : p), '/lab/lab.css', '/lab/lab.js', '/lab/game.css', '/lab/engine.mjs', '/docs/yen-lab/game-kit.mjs'];
  const diffs = [];
  for (const file of files) {
    const live = await (await request.get(file.replace(/index\.html$/, ''), { headers: { 'cache-control': 'no-cache' } })).text();
    const cleaned = NETLIFY_INJECTIONS.reduce((text, re) => text.replace(re, ''), live);
    if (cleaned !== readFileSync('.' + file, 'utf8')) diffs.push(file);
  }
  expect(diffs).toEqual([]);
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
        // Each visible control is the topmost thing at its own centre (no overlay, bubble or sticky bar on top).
        const covered = await page.evaluate(() => [...document.querySelectorAll('a[href], button')].filter(el => {
          // first line box: a link wrapped over two lines has a gap at the centre of its bounding box
          const r = el.getClientRects()[0];
          if (el.offsetParent === null || !r || r.width === 0 || el.closest('.lab-skip')) return false;
          const x = r.left + r.width / 2, y = r.top + r.height / 2;
          if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return false; // off-screen: checked when scrolled
          const top = document.elementFromPoint(x, y);
          return top && top !== el && !el.contains(top);
        }).map(el => el.textContent.trim() || el.outerHTML.slice(0, 60)));
        expect(covered).toEqual([]);
        expect(problems).toEqual([]);
        await testInfo.attach(`${path.replace(/\W+/g, '_')}-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
      });
    }
  });
}

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

for (const game of GAMES) {
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
