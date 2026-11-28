// "Hôm nay đọc gì?" (/doc-gi/): the book list the owner edits must stay usable by the page.
// Run without dependencies: node --test tests/doc-gi.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../doc-gi/sach.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../doc-gi/index.html", import.meta.url), "utf8");
const win = {};
new Function("window", src)(win);
const SACH = win.YEN_SACH;
const NGAN = ["cuoi", "am", "nam", "con", "khong"];
const HINH = ["mattroi", "song", "la", "vom", "gach", "ly"];

test("every entry has a title, a known shelf, an allowed time and a reason", () => {
  assert.ok(Array.isArray(SACH) && SACH.length >= 10, "at least ten entries");
  for (const b of SACH) {
    assert.ok(typeof b.ten === "string" && b.ten.trim(), "ten: " + JSON.stringify(b));
    assert.equal(typeof b.tacgia, "string", "tacgia is a string (may be empty): " + b.ten);
    assert.ok(NGAN.includes(b.ngan), "ngan: " + b.ten);
    assert.ok([5, 15, 30].includes(b.phut), "phut: " + b.ten);
    assert.ok(typeof b.vi === "string" && b.vi.trim().length >= 8, "vi: " + b.ten);
    if (b.hinh !== undefined) assert.ok(HINH.includes(b.hinh), "hinh: " + b.ten);
  }
  assert.equal(new Set(SACH.map(b => b.ten)).size, SACH.length, "no title twice");
});

test("every shelf has something, and 'anything' never comes up empty", () => {
  for (const n of NGAN) assert.ok(SACH.some(b => b.ngan === n), "shelf " + n + " is empty");
  for (const t of [5, 15, 30]) assert.ok(SACH.some(b => b.phut <= t), "nothing fits " + t + " minutes");
});

test("the page offers exactly the shelves and times the list uses", () => {
  const radios = name => Array.from(html.matchAll(new RegExp('name="' + name + '" value="([^"]*)"', "g")), m => m[1]);
  assert.deepEqual(radios("phut"), ["5", "15", "30"]);
  assert.deepEqual(radios("ngan"), ["", ...NGAN]);
});

test("the cover picture names in the list match the ones the page can draw", () => {
  const m = html.match(/const HINH = \[([^\]]+)\]/);
  assert.ok(m, "page declares its cover pictures");
  assert.deepEqual(m[1].split(",").map(x => x.trim().replace(/'/g, "")), HINH);
});

test("the page keeps its promises: no score, no storage, no network calls, and says when the list is provisional", () => {
  assert.ok(!/localStorage|sessionStorage|document\.cookie|indexedDB|fetch\(|XMLHttpRequest|sendBeacon/.test(html), "no storage or network API");
  assert.ok(html.includes("không tính điểm và không lưu gì"), "says so to the visitor");
  assert.equal(typeof win.YEN_SACH_DU_KIEN, "boolean");
  assert.ok(html.includes('id="dukien"'), "has the provisional-list notice");
});

// Owner decision (28.11.2026): the books are not bought yet, so the game is hidden behind one switch in sach.js.
test("one switch hides the game: the page shows a waiting line, and the play corner hides its card", () => {
  assert.equal(typeof win.YEN_SACH_AN, "boolean", "sach.js sets YEN_SACH_AN");
  assert.ok(html.includes("if (window.YEN_SACH_AN)") && html.includes('id="wait" hidden'), "the page has a waiting line it shows when hidden");
  assert.ok(/\.an \.shelfwrap,[^{]*\{display:none\}/.test(html), "the shelf, the button and the questions disappear when hidden");
  const hub = readFileSync(new URL("../choi/index.html", import.meta.url), "utf8");
  assert.ok(hub.includes('<li id="card-doc-gi" hidden>'), "the card is hidden unless the switch says otherwise");
  assert.ok(hub.includes("window.YEN_SACH_AN === false"), "the play corner reads the same switch");
});
