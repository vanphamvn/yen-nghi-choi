import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateCatalog, validateScript, validatePlayable, createState, currentIncident, sceneView,
  interact, choose, recover, advance, selectEnding, METRICS, ENDINGS
} from "../tinh-huong/campaign/engine.mjs";

const catalog = JSON.parse(readFileSync(new URL("../docs/visual-novel/episodes.json", import.meta.url), "utf8"));
const events = catalog.days.flatMap((d) => d.incidents);
const reaction = (state) => ({
  speaker: "Khách tại quầy", line: "Mình đã thấy quầy thay đổi.",
  visualChanges: [{ layer: "prop", id: "ticket", to: state }, { layer: "actor", id: "guest", to: "reacting-" + state }]
});
const shot = (kind, inc) => ({
  backdrop: "illustrations/" + inc.id + "-" + kind + ".webp",
  description: inc.title + ": cảnh " + kind,
  alt: "Khung cảnh " + inc.title + " có phiếu giao dịch và người đang chờ.",
  actors: [{ id: "guest", pose: kind === "resolution" ? "settled" : "waiting", alt: "Khách tại quầy" }],
  props: [{ id: "ticket", state: kind, alt: "Phiếu đơn hàng trên quầy" }]
});
// Test fixtures are deliberately NOT approved game art. Runtime art comes in ticket VN-F02.
const createScript = (inc) => ({
  id: inc.id,
  scene: { location: "Quầy cà phê", shots: {
    establishing: shot("establishing", inc),
    interactive: shot("interactive", inc),
    resolution: shot("resolution", inc)
  }},
  interactions: [{
    id: "inspect-ticket", type: "inspect", targetId: "ticket",
    prompt: "Chạm phiếu và kiểm tra trước khi quyết định",
    keyboardAlternative: "Tab đến phiếu rồi Enter để kiểm tra",
    visualChange: { layer: "prop", id: "ticket", to: "inspected" }
  }],
  choices: [
    {
      id: "safe", label: "Kiểm tra an toàn rồi tiếp khách", reason: "Tránh để rủi ro kéo dài.",
      risk: "safe", effects: { safety: 2, trust: 2, flow: 1, budget: -1 },
      flags: inc.id === "D01-01" ? { queueChecked: true } : {},
      reaction: reaction("safe")
    },
    {
      id: "steady", label: "Cần thêm thông tin trước", reason: "Chưa giải quyết triệt để nhưng không bỏ qua.",
      risk: "caution", effects: { safety: 0, trust: 0, flow: 0, budget: 0 },
      reaction: reaction("caution")
    },
    {
      id: "hazard", label: "Phớt lờ khu nguy hiểm để làm nhanh", reason: "Chọn tốc độ thay vì an toàn.",
      risk: "hazard", effects: { safety: -5, trust: -2, flow: 2, budget: 2 },
      reaction: reaction("hazard"),
      recovery: {
        label: "Dừng việc và khoanh vùng nguy hiểm",
        reason: "Sửa quyết định cũ và giúp khách rời khu vực nguy hiểm.",
        effects: { safety: 4, trust: 1, flow: -2 },
        flags: { hazardRepaired: true }, resolvesHazard: true,
        reaction: reaction("recovered")
      }
    }
  ],
  callbacks: inc.id === "D30-01" ? [{
    flag: "queueChecked", equals: true,
    line: "Quầy vẫn giữ thói quen đối chiếu phiếu từ ngày khai trương.",
    visualChanges: [{ layer: "prop", id: "ticket", to: "ordered" }]
  }] : []
});

const scripts = Object.fromEntries(events.map((e) => [e.id, createScript(e)]));

function run(choiceFn, shouldRecover = () => false) {
  let state = createState(catalog);
  const ids = [];
  for (let i = 0; i < 90; i++) {
    const inc = currentIncident(catalog, state);
    assert.ok(inc, "day " + (i + 1) + " has an incident");
    ids.push(inc.id);
    const first = state;
    state = interact(catalog, scripts, state, "inspect-ticket");
    assert.equal(first.phase, "observe");
    state = choose(catalog, scripts, state, choiceFn(i));
    if (shouldRecover(i)) state = recover(catalog, scripts, state);
    state = advance(catalog, state);
  }
  assert.equal(ids.length, 90);
  assert.equal(new Set(ids).size, 90);
  assert.equal(state.phase, "ending");
  assert.equal(state.history.length, 90);
  assert.deepEqual(METRICS.every((key) => state.metrics[key] >= 0 && state.metrics[key] <= 100), true);
  return state;
}

test("validate the real planned content catalog (not published as gameplay)", () => {
  assert.equal(validateCatalog(catalog), true);
  assert.equal(events.length, 90);
  assert.equal(events.filter((e) => e.status === "planned").length, 90);
  assert.equal(validatePlayable(catalog, {}, { requireAll: false }), true);
  assert.throws(() => validatePlayable(catalog, {}, { requireAll: true }), /90 playable scripts/);
});
test("playable scene contract requires shots, actors, props, interaction, visual outcome and risk rules", () => {
  assert.equal(validatePlayable(catalog, scripts, { requireAll: true }), true);
  const inc = events[0];
  const script = createScript(inc);
  assert.equal(validateScript(script, inc), true);
  script.choices[0].reaction.visualChanges = [];
  assert.throws(() => validateScript(script, inc), /not just text/);
  script.choices[0].reaction.visualChanges = reaction("safe").visualChanges;
  script.choices[2].effects.safety = 2;
  assert.throws(() => validateScript(script, inc), /cannot reward safety/);
  script.choices[2].effects.safety = -5;
  script.choices[2].recovery = null;
  assert.throws(() => validateScript(script, inc), /recovery path/);
});
test("one incident is deterministic, requires an on-scene action, and cannot score twice", () => {
  const initial = createState(catalog);
  assert.equal(initial.phase, "observe");
  assert.throws(() => choose(catalog, scripts, initial, "safe"), /interact with the scene/);
  assert.throws(() => advance(catalog, initial), /must resolve/);
  const before = sceneView(catalog, scripts, initial);
  assert.equal(before.phase, "establishing");
  assert.equal(before.shot.actors[0].pose, "waiting");
  const inspected = interact(catalog, scripts, initial, "inspect-ticket");
  const during = sceneView(catalog, scripts, inspected);
  assert.equal(during.phase, "interactive");
  assert.equal(during.visualChanges[0].to, "inspected");
  const decided = choose(catalog, scripts, inspected, "safe");
  assert.equal(decided.history.length, 1);
  assert.equal(initial.history.length, 0); // state not mutated
  assert.equal(decided.metrics.safety, initial.metrics.safety + 2);
  assert.equal(decided.flags.queueChecked, true);
  assert.equal(sceneView(catalog, scripts, decided).visualChanges.at(-1).to, "reacting-safe");
  assert.throws(() => choose(catalog, scripts, decided, "safe"), /do not choose twice/);
  assert.throws(() => recover(catalog, scripts, decided), /no available recovery/);
  const next = advance(catalog, decided);
  assert.equal(next.dayIndex, 0);
  assert.equal(next.incidentIndex, 1);
  assert.equal(next.actionId, null);
});
test("risky decisions are recorded; recovery removes that hazard only once", () => {
  const first = createState(catalog);
  const second = interact(catalog, scripts, first, "inspect-ticket");
  const risky = choose(catalog, scripts, second, "hazard");
  assert.deepEqual(risky.unresolvedHazards, ["D01-01"]);
  const fixed = recover(catalog, scripts, risky);
  assert.deepEqual(fixed.unresolvedHazards, []);
  assert.equal(fixed.history[0].recovered, true);
  assert.equal(fixed.flags.hazardRepaired, true);
  assert.equal(sceneView(catalog, scripts, fixed).reaction.line, "Mình đã thấy quầy thay đổi.");
  assert.throws(() => recover(catalog, scripts, fixed), /already recovered/);
  assert.equal(risky.unresolvedHazards.length, 1);
});
test("every day transitions to the next, any single decision branch can reach day 30", () => {
  const safe = run(() => "safe");
  assert.equal(safe.ending.id, ENDINGS.thriving.id);
  const neutral = run(() => "steady");
  assert.equal(neutral.ending.id, ENDINGS.steady.id);
  const hazard = run(() => "hazard");
  assert.equal(hazard.ending.id, ENDINGS.repair.id);
  assert.equal(hazard.unresolvedHazards.length, 90);
  const recovering = run(() => "hazard", () => true);
  assert.equal(recovering.unresolvedHazards.length, 0);
  assert.notEqual(recovering.ending.id, "repair");
  assert.throws(() => advance(catalog, safe), /must resolve/);
});
test("flags from day 1 influence the scene on day 30 without locking story progress", () => {
  let state = createState(catalog);
  for (let i = 0; i < 87; i++) {
    state = interact(catalog, scripts, state, "inspect-ticket");
    state = choose(catalog, scripts, state, i === 0 ? "safe" : "steady");
    state = advance(catalog, state);
  }
  assert.equal(currentIncident(catalog, state).id, "D30-01");
  const scene = sceneView(catalog, scripts, state);
  assert.equal(scene.callbacks.length, 1);
  assert.match(scene.callbacks[0].line, /ngày khai trương/);
});
test("non-unsafe and unsafe choices are all traversable in bounded deterministic varied paths", () => {
  for (let seed = 0; seed < 24; seed++) {
    const state = run((i) => ["safe", "steady", "hazard"][(i * 11 + seed * 7) % 3], (i) => ((i + seed) % 4 === 0));
    assert.ok(ENDINGS[state.ending.id]);
    assert.equal(state.dayIndex, 29);
    assert.equal(state.incidentIndex, 2);
  }
});
