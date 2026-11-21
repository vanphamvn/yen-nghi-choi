import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditArtManifest } from "../tools/check-yen-visual-art.mjs";

const getManifest = () => JSON.parse(readFileSync(new URL("../docs/visual-novel/art-manifest.json", import.meta.url), "utf8"));
const catalog = JSON.parse(readFileSync(new URL("../docs/visual-novel/episodes.json", import.meta.url), "utf8"));

test("90 incidents have unique art slots, all remain honest pending until actually illustrated", () => {
  const m = getManifest();
  const result = auditArtManifest(m, catalog);
  assert.equal(result.days, 30);
  assert.equal(result.incidents, 90);
  assert.equal(result.ready, 0);
  assert.equal(result.planned, 90);
  assert.equal(new Set(m.incidents.map(s => s.id)).size, 90);
  assert.equal(Object.keys(result.sourceBytes).length, 8);
  assert.ok(result.sourceBytes.room > 50_000, "must verify actual painted room asset");
});
test("a text-only planned entry cannot be marked ready or claim art review", () => {
  const m = getManifest();
  m.incidents[0].status = "ready";
  assert.throws(() => auditArtManifest(m, catalog, { checkFiles: false }), /shot without scene and alt/);
});
test("a ready entry requires three distinctly layered frames, real effects and review proof", () => {
  const m = getManifest();
  const item = m.incidents[0];
  item.status = "ready";
  const frame = (state) => ({
    background: "lab/assets/room-backdrop.jpg",
    alt: "Tranh vẽ quầy Yên với phiếu đơn được chuyển trạng thái " + state,
    actors: [{
      id: "mascot", src: "lab/assets/cuc-yen-tea.webp",
      state, alt: "Cục Yên đang " + state, x: 0.4, y: 0.5
    }],
    props: [{
      id: "cup", src: "lab/assets/cup.webp",
      state, alt: "Ly ở trạng thái " + state, x: 0.6, y: 0.65
    }]
  });
  item.frames.establishing = frame("watching");
  item.frames.interactive = frame("inspect");
  item.frames.resolution = frame("finished");
  item.visualChanges = [{layer:"prop", from:"waiting", to:"handled"}];
  item.artReview = {
    status:"pending", reviewerType:null, reviewEvidence:null, ownerReviewPending:true
  };
  assert.throws(() => auditArtManifest(m, catalog, { checkFiles: false }), /without review evidence/);

  item.artReview = {
    status:"agent-reviewed", reviewerType:"agent", reviewEvidence:"sample QA screenshot reference",
    ownerReviewPending:true
  };
  assert.equal(auditArtManifest(m, catalog).ready, 1);
  item.frames.resolution = frame("watching");
  item.frames.interactive = frame("watching");
  assert.throws(() => auditArtManifest(m, catalog, { checkFiles: false }), /unchanged frame/);
});
test("manifest cannot invent an asset path, even in the existing reference pack", () => {
  const m = getManifest();
  m.sourceAssets[0].path = "../other-site/illustration.png";
  assert.throws(() => auditArtManifest(m, catalog), /unsafe\/unsupported asset/);
});
