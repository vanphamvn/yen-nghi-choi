// Yên Lab privacy / CSP / claims baseline (LAB-F08, #132). Static check, no browser: run `node tools/check-yen-lab-privacy.mjs`.
// It catches regressions in source; the browser spec tests/yen-lab-privacy.spec.mjs checks real runtime behaviour.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(path.join(root, p), 'utf8');
const walk = dir => readdirSync(path.join(root, dir)).flatMap(name => {
  const rel = path.posix.join(dir, name);
  return statSync(path.join(root, rel)).isDirectory() ? walk(rel) : [rel];
});

export const LAB_CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'none'; connect-src 'none'; media-src 'none'; worker-src 'none'; manifest-src 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'; object-src 'none'";

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

// Pages and scripts that make up Yên Lab (the kit page is the reference game screen).
const labFiles = walk('lab');
const pages = [...labFiles.filter(f => f.endsWith('.html')), 'docs/yen-lab/game-kit.html'];
const scripts = [...labFiles.filter(f => /\.(m?js|cjs)$/.test(f)), 'docs/yen-lab/game-kit.mjs']; // assets/ included

// 1 · HTTP headers for /lab/* on both hosts.
const toml = read('netlify.toml');
const block = toml.split('[[headers]]').find(b => /for\s*=\s*"\/lab\/\*"/.test(b)) || '';
if (!block.includes(`Content-Security-Policy = "${LAB_CSP}"`)) fail('netlify.toml', 'missing or different /lab/* Content-Security-Policy header');
if (!/Permissions-Policy = "camera=\(\), microphone=\(\), geolocation=\(\)"/.test(toml)) fail('netlify.toml', 'site-wide Permissions-Policy must keep camera/microphone/geolocation off');
const vercel = JSON.parse(read('vercel.json'));
const vLab = vercel.headers.find(h => h.source === '/lab/(.*)');
if (vLab?.headers.find(h => h.key === 'Content-Security-Policy')?.value !== LAB_CSP) fail('vercel.json', 'missing or different /lab/(.*) Content-Security-Policy header');

// 2 · Pages: strict meta CSP, no inline code, no forms/frames/media autoplay, only same-origin resources.
for (const file of pages) {
  const html = read(file);
  const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
  if (!meta) { fail(file, 'no <meta> Content-Security-Policy'); continue; }
  const csp = meta[1];
  if (!/default-src 'none'/.test(csp)) fail(file, "CSP must start from default-src 'none'");
  if (/unsafe-inline|unsafe-eval|\*|https?:|data:|blob:/.test(csp)) fail(file, `CSP too permissive: ${csp}`);
  if (!/script-src 'self'(;|$)/.test(csp)) fail(file, "script-src must be exactly 'self'");
  if (!/connect-src 'none'/.test(csp)) fail(file, "connect-src must be 'none' (no network calls)");
  if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) fail(file, 'inline <script>');
  if (/\sstyle="/i.test(html)) fail(file, 'inline style attribute (blocked by CSP)');
  if (/\son[a-z]+="/i.test(html)) fail(file, 'inline event handler attribute');
  if (/<(form|iframe|embed|object)\b/i.test(html)) fail(file, 'form/iframe/embed/object not allowed');
  if (/<(audio|video)\b[^>]*\bautoplay/i.test(html)) fail(file, 'autoplay media');
  for (const [, attr, url] of html.matchAll(/<(?:script|img|link|source)\b[^>]*?\b(src|href)="([^"]+)"/gi)) {
    if (/^(https?:)?\/\//i.test(url)) fail(file, `cross-origin resource ${attr}=${url}`);
  }
  if (!/<html lang="vi">/.test(html)) fail(file, 'missing lang="vi"');
  if ((html.match(/<h1\b/g) || []).length !== 1) fail(file, 'exactly one <h1> expected');
  for (const [img] of html.matchAll(/<img\b[^>]*>/gi)) if (!/\balt="/.test(img)) fail(file, `img without alt: ${img.slice(0, 60)}`);
}

// 3 · Scripts: no storage, network, tracking, device sensors, media capture or audio autoplay.
const FORBIDDEN = [
  [/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bcaches\./, 'browser storage'],
  [/document\.cookie|cookieStore/, 'cookies'],
  [/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|RTCPeerConnection/, 'network request'],
  [/getUserMedia|mediaDevices|geolocation|DeviceMotion|DeviceOrientation|Notification\.request|navigator\.permissions/, 'device permission'],
  [/new\s+Audio\b|AudioContext|speechSynthesis|createElement\(\s*['"`](audio|video)|\.autoplay\s*=/, 'audio/video (must be user-started and reviewed first)'],
  [/history\.(push|replace)State|location\.(href|hash|search|pathname)\s*\+?=|location\.(assign|replace)\s*\(/, 'state in URL/history'],
  [/new\s+Image\s*\(|\.(src|href|srcset)\s*\+?=\s*[^;\n]*[+`]|setAttribute\(\s*['"](src|href|srcset)['"]\s*,\s*[^)]*[+`]/, 'dynamic resource URL (could carry data in a query string)'],
  [/\beval\s*\(|new\s+Function\s*\(|(inner|outer)HTML\s*\+?=|insertAdjacentHTML|document\.write/, 'dynamic code / HTML injection'],
];
for (const file of scripts) {
  // Ignore comments, but only real ones: `//` at line start or after whitespace, so 'https://…' strings stay scanned.
  const code = read(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const [re, what] of FORBIDDEN) if (re.test(code)) fail(file, `forbidden: ${what} (${code.match(re)[0]})`);
}

// 4 · Copy: no treatment promises or validation claims (SAFETY.md "Editorial review checks").
const CLAIMS = [
  /khoa học (đã )?chứng minh/i, /được chứng minh/i, /chữa lành|chữa trị|trị liệu/i, /hết (lo âu|stress|căng thẳng)/i,
  /giảm (lo âu|stress|căng thẳng) (ngay|chắc chắn)/i, /đảm bảo (bình tĩnh|thư giãn|hiệu quả)/i, /reset não|tần số chữa/i, /chẩn đoán (bạn|tâm lý)/i,
];
for (const file of pages) {
  const text = read(file).replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  for (const re of CLAIMS) if (re.test(text)) fail(file, `health claim in copy: "${text.match(re)[0]}"`);
  // "điều trị" is only allowed inside the non-treatment sentence.
  for (const m of text.matchAll(/[^.]*điều trị[^.]*/gi)) if (!/không thay thế/i.test(m[0])) fail(file, `"điều trị" outside the non-treatment line: ${m[0].trim()}`);
}
// Every Lab page states the non-treatment line somewhere visible.
for (const file of pages) if (!/không thay thế tư vấn hoặc điều trị chuyên môn/.test(read(file))) fail(file, 'missing non-treatment line');
for (const file of pages) if (!/>Nguồn phương pháp</.test(read(file))) fail(file, 'missing "Nguồn phương pháp" link');

if (failures.length) {
  console.error(`Yên Lab privacy baseline FAILED (${failures.length}):\n- ` + failures.join('\n- '));
  process.exit(1);
}
console.log(`Yên Lab privacy baseline passed: ${pages.length} pages, ${scripts.length} scripts, /lab/* headers on Netlify + Vercel. Static check only; see tests/yen-lab-privacy.spec.mjs for runtime.`);
