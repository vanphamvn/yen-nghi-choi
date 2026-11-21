import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../docs/visual-novel/episodes.json", import.meta.url), "utf8"));
const roadmap = readFileSync(new URL("../docs/visual-novel/ROADMAP-30-NGAY.md", import.meta.url), "utf8");
const flags = new Set(["safety","queue","trust","cash","food","inventory","team","community","privacy","rain","flow","ending"]);

test("catalog = exactly 30 sequential in-game days and 90 unique three-event incidents", () => {
  assert.equal(catalog.expectedDays, 30);
  assert.equal(catalog.expectedIncidentsPerDay, 3);
  assert.equal(catalog.expectedIncidents, 90);
  assert.equal(catalog.days.length, 30);
  const seen = new Set();
  let total = 0;
  for (const [dayIndex, day] of catalog.days.entries()) {
    const dayID = "D" + String(dayIndex + 1).padStart(2, "0");
    assert.equal(day.day, dayIndex + 1);
    assert.equal(day.id, dayID);
    assert.equal(day.incidents.length, 3);
    assert.ok(day.title.length > 3);
    assert.equal(day.chapter, dayIndex < 7 ? 1 : dayIndex < 14 ? 2 : dayIndex < 21 ? 3 : dayIndex < 28 ? 4 : 5);
    for (const [incidentIndex, incident] of day.incidents.entries()) {
      const id = dayID + "-" + String(incidentIndex + 1).padStart(2, "0");
      assert.equal(incident.id, id);
      assert.ok(!seen.has(id), "duplicate incident ID " + id);
      seen.add(id);
      assert.equal(incident.status, dayIndex === 0 ? "playable" : "planned", "only the three implemented Day 1 incidents may be playable");
      assert.equal(incident.slot, ["Sáng", "Chiều", "Tối"][incidentIndex]);
      assert.ok(incident.title.length > 6);
      assert.ok(flags.has(incident.carryFlag), "unknown story flag " + incident.carryFlag);
      assert.ok(incident.mechanic);
      for (const key of ["establishing", "interactive", "resolution"]) {
        assert.ok(typeof incident.visual?.[key] === "string" && incident.visual[key].length > 35, id + " missing visual " + key);
      }
      assert.ok(roadmap.includes(id), "roadmap missing " + id);
      total++;
    }
  }
  assert.equal(total, 90);
});

test("all 90 incidents have specific and distinct establishing and interactive descriptions", () => {
  const incidents = catalog.days.flatMap((day) => day.incidents);
  assert.equal(new Set(incidents.map((item) => item.visual.establishing)).size, 90);
  assert.equal(new Set(incidents.map((item) => item.visual.interactive)).size, 90);
  assert.match(roadmap, /không phải quiz có hình nền/i);
  assert.match(roadmap, /establishing\s*→\s*interactive\s*→\s*resolution/i);
});

test("planned status is clearly distinct from playable and production-verified", () => {
  assert.match(roadmap, /status: planned/);
  assert.match(roadmap, /SHA/);
  assert.match(roadmap, /reduced-motion/);
  assert.match(roadmap, /không phải 90 cảnh đã code\/art/);
});
