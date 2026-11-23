import test from "node:test";
import assert from "node:assert/strict";
import { loadInputs, nextWork, dayIsDone } from "../tools/vn-next-work.mjs";

const inputs = loadInputs();

test("roadmap tickets cover days 1-30 once, in order, with known dependencies", () => {
  const ids = new Set(inputs.roadmap.tickets.map((t) => t.id));
  const covered = [];
  for (const t of inputs.roadmap.tickets) {
    for (const dep of t.dependsOn) assert.ok(ids.has(dep), `${t.id} depends on unknown ${dep}`);
    if (t.days) for (let d = t.days[0]; d <= t.days[1]; d++) covered.push(d);
  }
  assert.deepEqual(covered, Array.from({ length: 30 }, (_, i) => i + 1));
});

test("Day 1 is done and the earliest unfinished day of an unblocked pack is the slice", () => {
  assert.ok(dayIsDone(inputs.episodes.days[0]));
  const r = nextWork(inputs);
  const story = r.eligible.filter((e) => e.slice);
  assert.equal(story.length, 1, "only one story slice at a time");
  const first = inputs.episodes.days.find((d) => !dayIsDone(d));
  assert.equal(story[0].slice.day, first.day);
  assert.equal(story[0].slice.incidents.length, 3);
});

test("an open PR for the day moves it to inFlight instead of eligible", () => {
  const first = inputs.episodes.days.find((d) => !dayIsDone(d));
  const nn = String(first.day).padStart(2, "0");
  const r = nextWork(inputs, { issues: {}, openPrs: [{ number: 9, headRefName: `vn/d${nn}`, title: "x" }] });
  assert.ok(r.inFlight.some((f) => f.day === first.day && f.pr === 9));
  assert.ok(!r.eligible.some((e) => e.slice && e.slice.day === first.day));
});

test("GitHub issue state wins: a closed pack unblocks the next pack, F06 waits for F05", () => {
  const r = nextWork(inputs, { issues: { "223": "CLOSED", "224": "OPEN", "228": "OPEN" }, openPrs: [] });
  assert.ok(r.eligible.some((e) => e.ticket === "VN-P02"));
  assert.ok(r.blocked.some((b) => b.ticket === "VN-F06" && b.waitingFor.includes("VN-F05")));
});
