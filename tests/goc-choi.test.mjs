// Góc chơi (/choi/, /quet-la/, /meo-ngu/, /ve-mai/): the small games keep the promises they make to visitors.
// Run without dependencies: node --test tests/goc-choi.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const GAMES = [
  { dir: "quet-la", pic: "san.jpg", title: "Quét lá sân Yên" },
  { dir: "meo-ngu", pic: "quan.jpg", title: "Mèo ngủ ở đâu?" },
  { dir: "ve-mai", pic: "mai.jpg", title: "Vẽ lên mái nhà Yên" },
];
const hub = read("choi/index.html");

test("the play corner links every game, and every game links back", () => {
  for (const href of ["/doc-gi/", ...GAMES.map(g => "/" + g.dir + "/")]) assert.ok(hub.includes('href="' + href + '"'), "hub links " + href);
  for (const g of GAMES) assert.ok(read(g.dir + "/index.html").includes('href="/choi/"'), g.dir + " links back to the play corner");
  assert.ok(read("doc-gi/index.html").includes('href="/choi/"'), "the book game links back too");
});

for (const g of GAMES) {
  const html = read(g.dir + "/index.html");
  test(g.title + ": has its picture, a described scene and the shared look", () => {
    assert.ok(html.includes("<title>" + g.title), "title");
    assert.ok(existsSync(new URL("../" + g.dir + "/" + g.pic, import.meta.url)), "picture file exists");
    assert.ok(statSync(new URL("../" + g.dir + "/" + g.pic, import.meta.url)).size < 400_000, "picture stays under 400 kB");
    const img = html.match(/<img class="bg"[^>]*>/);
    assert.ok(img && img[0].includes('src="' + g.pic + '"'), "uses its picture");
    assert.ok(/alt="[^"]{30,}"/.test(img[0]), "the picture is described for people who cannot see it");
    assert.ok(html.includes('href="/choi/choi.css"'), "shared stylesheet");
  });
  test(g.title + ": no score, no clock, no storage, no network calls", () => {
    assert.ok(!/localStorage|sessionStorage|document\.cookie|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(html), "no storage or network API");
    assert.ok(!/setInterval\(|điểm số|kỷ lục|xếp hạng/i.test(html), "no timer loop, score or ranking");
    assert.ok(/[Kk]hông (tính điểm|lưu)/.test(html), "says so to the visitor");
    assert.ok(html.includes('role="status"'), "speaks its results to screen readers");
  });
}

test("each game can be played without dragging", () => {
  assert.ok(read("quet-la/index.html").includes('id="auto"'), "sweeping has a button that sweeps for you");
  assert.ok(read("meo-ngu/index.html").includes('id="show"'), "the cat game can show the cat");
  assert.ok(read("ve-mai/index.html").includes('id="auto"'), "drawing has a button that draws for you");
});

test("the drawing never leaves the visitor's device", () => {
  const html = read("ve-mai/index.html");
  assert.ok(html.includes("a.download"), "saving is a local download");
  assert.ok(!/<form|method=|action=/.test(html), "nothing is submitted anywhere");
});

test("the cat's hiding places are on the picture and big enough to tap", () => {
  const html = read("meo-ngu/index.html");
  const spots = Array.from(html.matchAll(/\{ x: ([\d.]+), y: ([\d.]+), w: ([\d.]+)/g), m => m.slice(1).map(Number));
  assert.ok(spots.length >= 8, "at least eight hiding places");
  for (const [x, y, w] of spots) { assert.ok(x > .04 && x < .96 && y > .1 && y < .9, "on the picture: " + x + "," + y); assert.ok(w >= .04 && w <= .1, "cat size: " + w); }
  assert.ok(html.includes("max(44px"), "the cat is a button at least 44px across");
});

// Owner decision (28.11.2026): visitors find the play corner after they have seen the invitation, not on the homepage.
test("the play corner is offered at the end of the invitation, and not on the homepage", () => {
  const soon = read("soon/index.html");
  assert.ok(soon.includes('<a class="e-more" href="/choi/">'), "the invitation links to the play corner");
  assert.ok(/\.e-more\{[^}]*visibility:hidden[^}]*pointer-events:none/.test(soon), "the link is hidden and untouchable by default");
  assert.ok(soon.includes("#env.eleven .e-more{opacity:1;visibility:visible;pointer-events:auto"), "it appears only on the invitation's very last step");
  assert.ok(!read("index.html").includes('href="/choi/"'), "the homepage carries only the opening notice and the invitation");
});
