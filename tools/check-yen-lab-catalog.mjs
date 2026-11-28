// Yên Lab catalog contract (LAB-F14, #138). docs/yen-lab/ops/catalog.json is the one list of all twenty games; this
// checks it against everything else that names a game, so a title, route, status or evidence tier cannot drift:
// the roadmap, the EVIDENCE.md matrix, each released page on disk, the book menu, Cục Yên's suggestions and the homepage.
// Static file checks only; browser behavior (routes, no-JS, slow network) is in tests/yen-lab-catalog.spec.mjs.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(path.join(root, p.replace(/^\//, '')), 'utf8');
const exists = p => existsSync(path.join(root, p.replace(/^\//, '')));
const decode = s => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Blanket proof or benefit wording that no catalog entry, fallback page or fallback note may use.
const CLAIMS = /khoa học chứng minh|đã chứng minh|được chứng minh|giảm lo âu|chữa|trị liệu|proven|clinically|evidence-based|guaranteed/i;

export function checkCatalog() {
  const catalog = JSON.parse(read('docs/yen-lab/ops/catalog.json'));
  const games = catalog.games;
  const fail = [];
  const check = (ok, message) => { if (!ok) fail.push(message); };

  // Shape: twenty unique games G01–G20, stable routes derived from the id, known enums.
  assert.equal(games.length, 20, 'catalog must list exactly twenty games');
  assert.deepEqual(games.map(g => g.key), Array.from({ length: 20 }, (_, i) => `G${String(i + 1).padStart(2, '0')}`), 'keys must be G01–G20 in order');
  for (const field of ['id', 'title', 'route']) assert.equal(new Set(games.map(g => g[field])).size, 20, `${field} must be unique`);
  const open = games.filter(g => g.status !== 'planned');
  for (const g of games) {
    check(/^[a-z]+(-[a-z]+)*$/.test(g.id), `${g.key}: id "${g.id}" must be a lowercase ascii slug`);
    check(g.route === `/lab/${g.id}/`, `${g.key}: route must be /lab/<id>/`);
    check(catalog.statuses.includes(g.status), `${g.key}: unknown status ${g.status}`);
    check(catalog.categories.includes(g.category), `${g.key}: unknown category ${g.category}`);
    check(catalog.evidenceTiers.includes(g.evidenceTier), `${g.key}: unknown evidence tier ${g.evidenceTier}`);
    check(typeof g.caution === 'string' && g.caution.length > 20, `${g.key}: caution is required`);
    check(g.evidence === 'docs/yen-lab/EVIDENCE.md#twenty-tool-matrix', `${g.key}: evidence must point at the reviewed matrix`);
    check(!CLAIMS.test(JSON.stringify(g)), `${g.key}: no blanket proof or benefit wording`);
    // A deferred technique has an unresolved research blocker: it can never be open.
    if (g.evidenceTier === 'deferred') check(g.status === 'planned', `${g.key}: deferred evidence cannot be released`);
    if (g.status === 'planned') {
      for (const field of ['module', 'stylesheet', 'review', 'releasedIn']) check(g[field] === null, `${g.key}: planned game must have ${field}: null`);
      check(!exists(`lab/${g.id}`), `${g.key}: planned game must not have a page yet (lab/${g.id}/ exists)`);
    } else {
      check(g.module === `${g.route}${g.id}.mjs` && exists(g.module), `${g.key}: module ${g.module} missing`);
      check(g.stylesheet === `${g.route}${g.id}.css` && exists(g.stylesheet), `${g.key}: stylesheet ${g.stylesheet} missing`);
      check(g.review && exists(g.review), `${g.key}: review doc ${g.review} missing`);
      check(typeof g.releasedIn === 'string' && /#\d+/.test(g.releasedIn), `${g.key}: releasedIn must name the gate issue`);
    }
  }

  // Roadmap: same title and issue; open games are in-progress or done, done games are open.
  const tasks = new Map(JSON.parse(read('docs/yen-lab/ops/roadmap.json')).tasks.map(t => [t.key, t]));
  for (const g of games) {
    const t = tasks.get(g.key);
    check(t && t.kind === 'minigame', `${g.key}: not a minigame task in roadmap.json`);
    if (!t) continue;
    check(t.title === g.title, `${g.key}: title "${g.title}" ≠ roadmap "${t.title}"`);
    check(t.issue === g.issue, `${g.key}: issue ${g.issue} ≠ roadmap ${t.issue}`);
    // Released in its own PR while the ticket is in-progress; the record PR then marks it done. Done always means open.
    if (t.status === 'done') check(g.status !== 'planned', `${g.key}: roadmap done but catalog says planned`);
    if (g.status !== 'planned') check(['in-progress', 'done'].includes(t.status), `${g.key}: open in the catalog but roadmap says ${t.status}`);
  }

  // EVIDENCE.md matrix: same title, duration and classification for every row.
  const tiers = { 'Supported technique': 'supported', 'Indirect / adapted': 'indirect', 'Exploratory / creative': 'exploratory', Deferred: 'deferred' };
  const rows = new Map([...read('docs/yen-lab/EVIDENCE.md').matchAll(/^\| (G\d\d) · ([^·]+?) · ([^|(]+?)\s*(?:\(.*?\))?\s*\| (.*?)\|/gm)]
    .map(m => [m[1], { title: m[2].trim(), duration: m[3].trim(), tier: tiers[(m[4].match(/\*\*(.+?)\*\*/) || [])[1]] }]));
  for (const g of games) {
    const row = rows.get(g.key);
    check(row, `${g.key}: no EVIDENCE.md matrix row`);
    if (!row) continue;
    check(row.title === g.title, `${g.key}: title disagrees with EVIDENCE.md "${row.title}"`);
    check(row.duration === g.duration, `${g.key}: duration "${g.duration}" ≠ EVIDENCE.md "${row.duration}"`);
    check(row.tier === g.evidenceTier, `${g.key}: tier ${g.evidenceTier} ≠ EVIDENCE.md ${row.tier}`);
  }

  // Released pages: right title, only their own code (nothing from other games is bundled), no-JS text and a way out.
  for (const g of open) {
    const file = `${g.route}index.html`;
    check(exists(file), `${g.key}: ${file} missing`);
    if (!exists(file)) continue;
    const html = read(file);
    check(decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') === g.title, `${g.key}: <h1> is not "${g.title}"`);
    check(decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').startsWith(`${g.title} · Yên Lab`), `${g.key}: <title> must start with the game title`);
    const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m => m[1]);
    check(JSON.stringify(scripts) === JSON.stringify([g.module]), `${g.key}: page must load only ${g.module}, found ${scripts.join(', ')}`);
    const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
    check(JSON.stringify(sheets) === JSON.stringify(['/lab/lab.css', '/lab/game.css', g.stylesheet]), `${g.key}: unexpected stylesheets ${sheets.join(', ')}`);
    const imports = [...read(g.module).matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
    for (const spec of imports) check(!/\/lab\/(?!engine\.mjs)[^/]+\//.test(spec) && !/^\.\.\/(?!engine\.mjs)/.test(spec), `${g.key}: module imports another game's code (${spec})`);
    check(/<noscript>[\s\S]*href="\/lab\/"[\s\S]*<\/noscript>/.test(html), `${g.key}: no-JS text with a link back to /lab/ is required`);
    check(/<a class="ink-word" href="\/lab\/"[^>]*>về góc ngồi chơi<\/a>/.test(html), `${g.key}: "về góc ngồi chơi" exit link is required`);
    check(/data-act="start"[^>]*disabled/.test(html), `${g.key}: start must stay disabled until the module runs`);
    check(html.includes('class="game-note game-wait"'), `${g.key}: slow-load note (.game-wait) is required`);
    check(/<main class="game"[^>]* data-loading[ >]/.test(html), `${g.key}: <main class="game"> must start with data-loading`);
    check(read(g.module).includes('removeAttribute("data-loading")'), `${g.key}: module must remove data-loading once it runs`);
  }
  // No game folder exists outside the catalog.
  const folders = readdirSync(path.join(root, 'lab')).filter(n => statSync(path.join(root, 'lab', n)).isDirectory() && n !== 'assets');
  check(JSON.stringify(folders.sort()) === JSON.stringify(open.map(g => g.id).sort()), `lab/ game folders ${folders.join(', ')} ≠ open catalog games`);

  // Book menu: open games as links with the catalog title, planned ones only as inert "is-soon" lines.
  const book = read('lab/index.html');
  const dialog = (book.match(/<dialog class="menu"[\s\S]*?<\/dialog>/) || [''])[0];
  const links = [...dialog.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(m => [m[1], decode(m[2])]);
  check(JSON.stringify(links.map(l => l[0]).sort()) === JSON.stringify(open.map(g => g.route).sort()), 'book links must be exactly the open games');
  for (const [href, text] of links) check(games.find(g => g.route === href)?.title === text, `book: "${text}" ≠ catalog title for ${href}`);
  for (const [, text] of dialog.matchAll(/<li class="is-soon">([^<]+)<\/li>/g)) {
    check(games.some(g => g.status === 'planned' && g.title === decode(text)), `book: soon line "${text}" is not a planned catalog game`);
  }
  check(new RegExp(`data-released-count="${open.length}"`).test(dialog), `book: data-released-count must be ${open.length}`);
  const status = decode((dialog.match(/id="lab-release-status"[^>]*>([^<]+)</) || [])[1] || '');
  for (const g of open) check(status.includes(g.title), `book: release status line misses ${g.title}`);
  const noscript = [...((book.match(/<noscript><p class="menu-noscript">[\s\S]*?<\/noscript>/) || [''])[0]).matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(m => [m[1], decode(m[2])]);
  check(JSON.stringify(noscript.sort()) === JSON.stringify(open.map(g => [g.route, g.title]).sort()), 'book: no-JS list must be exactly the open games');

  // Cục Yên suggestions (F12): only open games, with the catalog title.
  for (const [, name, href] of read('lab/lab.js').matchAll(/name: '([^']+)', href: '([^']+)'/g)) {
    const g = games.find(x => x.route === href);
    check(g && g.status !== 'planned' && g.title === name, `Cục Yên suggests "${name}" at ${href}, not an open catalog game`);
  }

  // Homepage cost: the catalog and the games are never loaded by the homepage.
  const home = read('trang-chu.html'); // the Cục Yên homepage, kept at this address while / shows the opening notice
  check(!/catalog\.json|\.mjs["']/.test(home), 'homepage must not load the catalog or any game module');

  // Fallback: unknown /lab/ addresses (planned routes included) get the Lab 404 page with a way back.
  const rule = read('netlify.toml').split('[[redirects]]').slice(1).find(b => /from\s*=\s*"\/lab\/\*"/.test(b)) || '';
  check(/to\s*=\s*"\/lab\/404\.html"/.test(rule) && /status\s*=\s*404\b/.test(rule) && !/force\s*=\s*true/.test(rule), 'netlify.toml needs an unforced /lab/* → /lab/404.html status 404 rule');
  const notFound = read('lab/404.html');
  check(/href="\/lab\/"/.test(notFound) && !/<script/.test(notFound), 'lab/404.html needs a link to /lab/ and no script');
  const fallbackCopy = notFound.replace(/không thay thế tư vấn hoặc điều trị chuyên môn/g, '') + open.map(g => (read(`${g.route}index.html`).match(/class="game-note game-wait">([^<]*)</) || [])[1]).join(' ');
  check(!CLAIMS.test(fallbackCopy), 'fallback copy (lab/404.html, .game-wait notes) must not make proof or benefit claims');

  return { games, open, fail };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { games, open, fail } = checkCatalog();
  if (fail.length) { console.error(fail.map(f => `✗ ${f}`).join('\n')); process.exit(1); }
  console.log(`Catalog passed: ${games.length} games, ${open.length} open (${open.map(g => g.key).join(' ')}), ${games.length - open.length} planned; agrees with roadmap, EVIDENCE.md, pages, book, Cục Yên and the 404 fallback.`);
}
