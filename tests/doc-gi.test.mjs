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

test("every entry has a title, a known shelf, an allowed time and a reason", () => {
  assert.ok(Array.isArray(SACH) && SACH.length >= 10, "at least ten entries");
  for (const b of SACH) {
    assert.ok(typeof b.ten === "string" && b.ten.trim(), "ten: " + JSON.stringify(b));
    assert.equal(typeof b.tacgia, "string", "tacgia is a string (may be empty): " + b.ten);
    assert.ok(NGAN.includes(b.ngan), "ngan: " + b.ten);
    assert.ok([5, 15, 30].includes(b.phut), "phut: " + b.ten);
    assert.ok(typeof b.vi === "string" && b.vi.trim().length >= 8, "vi: " + b.ten);
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

test("the page keeps its promises: no score, no storage, no network calls, and says when the list is provisional", () => {
  assert.ok(!/localStorage|sessionStorage|document\.cookie|indexedDB|fetch\(|XMLHttpRequest|sendBeacon/.test(html), "no storage or network API");
  assert.ok(html.includes("không tính điểm và không lưu gì"), "says so to the visitor");
  assert.equal(typeof win.YEN_SACH_DU_KIEN, "boolean");
  assert.ok(html.includes('id="dukien"'), "has the provisional-list notice");
});
