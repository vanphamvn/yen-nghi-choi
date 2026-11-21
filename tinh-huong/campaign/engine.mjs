// Một Tháng Không Yên · deterministic 30-day campaign engine (VN-F01 #219).
// Pure JavaScript: no storage, network, clock, DOM, random values or personal data.
import { STARTING_STATS } from "../story.mjs";

export const VERSION = 1;
export const METRICS = Object.freeze(["safety", "trust", "flow", "budget"]);
export const PHASES = Object.freeze(["observe", "decide", "resolve", "ending"]);
export const INTERACTIONS = Object.freeze(["inspect", "arrange", "isolate", "move", "compare", "place"]);
export const SHOT_PHASES = Object.freeze(["establishing", "interactive", "resolution"]);
export const ENDINGS = Object.freeze({
  repair: { id: "repair", title: "Yên đang được sửa lại", note: "An toàn phải được khôi phục trước khi đẩy nhanh doanh thu." },
  steady: { id: "steady", title: "Yên còn nhiều việc phải làm", note: "Quán tiếp tục hoạt động. Có những điều cần cải thiện và những điều đáng giữ." },
  thriving: { id: "thriving", title: "Yên dần có nhịp riêng", note: "Quán giữ được an toàn, niềm tin và nhịp vận hành. Không phải ngày nào cũng dễ." }
});

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (s) => typeof s === "string" && s.trim().length > 0;
const ensure = (ok, message) => { if (!ok) throw new Error("Yên Campaign: " + message); };
const validFlag = (k) => /^[a-z][A-Za-z0-9_]{1,60}$/.test(k) && !["constructor", "prototype"].includes(k);
const clamp = (n) => Math.max(0, Math.min(100, n));

function copyState(state, patch = {}) {
  return { ...state, ...patch, metrics: { ...state.metrics, ...(patch.metrics || {}) },
    flags: { ...state.flags, ...(patch.flags || {}) },
    history: patch.history || state.history.slice(), unresolvedHazards: patch.unresolvedHazards || state.unresolvedHazards.slice() };
}
function checkEffects(effects) {
  ensure(isObject(effects), "effects must be an object");
  for (const [key, value] of Object.entries(effects)) {
    ensure(METRICS.includes(key) && Number.isInteger(value) && value >= -100 && value <= 100, "invalid metric delta " + key);
  }
}
function checkFlags(flags) {
  ensure(isObject(flags), "flags must be an object");
  for (const [key, value] of Object.entries(flags)) {
    ensure(validFlag(key) && (typeof value === "boolean" || typeof value === "string" && value.length <= 80),
      "invalid story flag: " + key);
  }
}
function applyEffects(metrics, effects) {
  const next = { ...metrics };
  for (const [key, value] of Object.entries(effects)) next[key] = clamp(metrics[key] + value);
  return next;
}
function applyFlags(flags, changes = {}) {
  const next = { ...flags };
  for (const [key, value] of Object.entries(changes)) next[key] = value;
  return next;
}
function checkShot(shot, id) {
  ensure(isObject(shot) && text(shot.backdrop) && text(shot.description) && text(shot.alt), id + " missing shot/backdrop/alt");
  ensure(Array.isArray(shot.actors) && Array.isArray(shot.props), id + " must include actors and props layers");
  for (const a of shot.actors) {
    ensure(isObject(a) && text(a.id) && text(a.pose) && text(a.alt), id + " actor missing id/pose/alt");
  }
  for (const p of shot.props) {
    ensure(isObject(p) && text(p.id) && text(p.state) && text(p.alt), id + " prop missing id/state/alt");
  }
}
function checkVisualChange(change, id) {
  ensure(isObject(change) && ["actor", "prop", "setting"].includes(change.layer) &&
    text(change.id) && text(change.to), id + " requires a visible actor/prop/setting change");
}
function checkReaction(reaction, id) {
  ensure(isObject(reaction) && text(reaction.speaker) && text(reaction.line), id + " requires character reaction");
  ensure(Array.isArray(reaction.visualChanges) && reaction.visualChanges.length > 0,
    id + " must change on-screen actor, prop or setting, not just text");
  reaction.visualChanges.forEach((change) => checkVisualChange(change, id));
}
function checkRecovery(recovery, id) {
  if (recovery === null || recovery === undefined) return;
  ensure(isObject(recovery) && text(recovery.label) && text(recovery.reason), id + " recovery needs label and reason");
  checkEffects(recovery.effects || {});
  checkFlags(recovery.flags || {});
  ensure(typeof recovery.resolvesHazard === "boolean", id + " recovery must explicitly state hazard resolution");
  checkReaction(recovery.reaction, id + " recovery");
}

export function validateCatalog(catalog) {
  ensure(isObject(catalog) && catalog.schemaVersion === 1, "unsupported catalog schema");
  ensure(Array.isArray(catalog.days) && catalog.days.length === 30, "campaign must contain 30 in-game days");
  const seen = new Set();
  catalog.days.forEach((day, dayIndex) => {
    const id = "D" + String(dayIndex + 1).padStart(2, "0");
    ensure(day.id === id && day.day === dayIndex + 1 && text(day.title), "invalid day " + id);
    ensure(Array.isArray(day.incidents) && day.incidents.length === 3, id + " needs 3 incidents");
    day.incidents.forEach((incident, index) => {
      const incID = id + "-" + String(index + 1).padStart(2, "0");
      ensure(incident.id === incID && !seen.has(incID) && text(incident.title), "invalid/duplicate incident " + incID);
      seen.add(incID);
      ensure(isObject(incident.visual) && SHOT_PHASES.every((phase) => text(incident.visual[phase])),
        incID + " needs 3 planned visual states");
      ensure(["planned", "in-progress", "playable", "released"].includes(incident.status),
        incID + " unknown status");
    });
  });
  ensure(seen.size === 90, "catalog must have 90 unique incidents");
  return true;
}

// A playable script is independent from the planning catalog: planned != art completed.
export function validateScript(script, incident) {
  ensure(isObject(script) && script.id === incident.id, incident.id + " missing script or ID mismatch");
  ensure(isObject(script.scene) && text(script.scene.location), script.id + " missing scene");
  ensure(isObject(script.scene.shots), script.id + " missing shots");
  SHOT_PHASES.forEach((phase) => checkShot(script.scene.shots[phase], script.id + "." + phase));
  ensure(Array.isArray(script.interactions) && script.interactions.length > 0, script.id + " needs actual scene interaction");
  const actionIDs = new Set();
  for (const action of script.interactions) {
    ensure(isObject(action) && text(action.id) && !actionIDs.has(action.id) &&
      INTERACTIONS.includes(action.type) && text(action.targetId) && text(action.prompt) &&
      text(action.keyboardAlternative), script.id + " invalid interactive action");
    actionIDs.add(action.id);
    checkVisualChange(action.visualChange, script.id + "." + action.id);
  }
  ensure(Array.isArray(script.choices) && script.choices.length >= 2 && script.choices.length <= 4,
    script.id + " needs 2–4 decisions");
  const choiceIDs = new Set();
  for (const choice of script.choices) {
    ensure(isObject(choice) && text(choice.id) && !choiceIDs.has(choice.id) && text(choice.label) && text(choice.reason),
      script.id + " invalid choice");
    choiceIDs.add(choice.id);
    checkEffects(choice.effects);
    checkFlags(choice.flags || {});
    ensure(["safe", "caution", "hazard"].includes(choice.risk), script.id + " invalid risk");
    if (choice.risk === "hazard") {
      ensure((choice.effects.safety || 0) < 0, script.id + " cannot reward safety for a hazard");
      ensure(isObject(choice.recovery), script.id + " hazard choice must offer a recovery path");
    }
    checkReaction(choice.reaction, script.id + "." + choice.id);
    checkRecovery(choice.recovery, script.id + "." + choice.id);
  }
  if (script.callbacks !== undefined) {
    ensure(Array.isArray(script.callbacks), script.id + " callbacks must be a list");
    for (const callback of script.callbacks) {
      ensure(validFlag(callback.flag) && typeof callback.equals === "boolean" &&
        text(callback.line) && Array.isArray(callback.visualChanges) && callback.visualChanges.length > 0,
        script.id + " invalid cross-day callback");
      callback.visualChanges.forEach((change) => checkVisualChange(change, script.id + ".callback"));
    }
  }
  return true;
}
export function validatePlayable(catalog, scripts, { requireAll = false } = {}) {
  validateCatalog(catalog);
  ensure(isObject(scripts), "scripts must be keyed by incident ID");
  const ids = new Map(catalog.days.flatMap((day) => day.incidents.map((inc) => [inc.id, inc])));
  for (const [id, script] of Object.entries(scripts)) {
    ensure(ids.has(id), "script not in catalog: " + id);
    validateScript(script, ids.get(id));
  }
  if (requireAll) ensure(Object.keys(scripts).length === 90, "full campaign requires 90 playable scripts");
  return true;
}

export function createState(catalog) {
  validateCatalog(catalog);
  return {
    version: VERSION, dayIndex: 0, incidentIndex: 0, phase: "observe",
    metrics: { ...STARTING_STATS }, flags: {}, unresolvedHazards: [], history: [],
    actionId: null, pending: null, ending: null
  };
}
export function currentIncident(catalog, state) {
  ensure(Number.isInteger(state.dayIndex) && Number.isInteger(state.incidentIndex), "invalid position");
  return catalog.days[state.dayIndex]?.incidents[state.incidentIndex] || null;
}
function checkPlayableAtCursor(catalog, scripts, state) {
  const incident = currentIncident(catalog, state);
  ensure(incident !== null, "no active incident");
  const script = scripts[incident.id];
  ensure(script, "incident not yet playable: " + incident.id);
  validateScript(script, incident);
  return script;
}

// The engine never guesses whether an unseen asset is available.
// It returns shot declarations to the scene renderer, which owns actual image loading.
export function sceneView(catalog, scripts, state) {
  ensure(state.phase !== "ending", "ending has no incident scene");
  const script = checkPlayableAtCursor(catalog, scripts, state);
  const phase = state.phase === "observe" ? "establishing" :
    state.phase === "decide" ? "interactive" : "resolution";
  const shot = script.scene.shots[phase];
  const callbacks = (script.callbacks || []).filter((cb) => state.flags[cb.flag] === cb.equals);
  const reactionChanges = state.pending?.reaction?.visualChanges || [];
  const actionChange = state.actionId ?
    script.interactions.find((a) => a.id === state.actionId)?.visualChange : null;
  return {
    incidentId: script.id, location: script.scene.location, phase,
    shot: structuredClone(shot), callbacks: structuredClone(callbacks),
    visualChanges: structuredClone([...(actionChange ? [actionChange] : []),
      ...(phase === "resolution" ? reactionChanges : [] )]),
    reaction: phase === "resolution" ? structuredClone(state.pending?.reaction || null) : null
  };
}
export function interact(catalog, scripts, state, actionId) {
  ensure(state.phase === "observe", "scene interaction can only happen while observing");
  const script = checkPlayableAtCursor(catalog, scripts, state);
  const action = script.interactions.find((item) => item.id === actionId);
  ensure(action, "unknown scene action: " + actionId);
  return copyState(state, { phase: "decide", actionId, pending: null });
}
export function choose(catalog, scripts, state, choiceId) {
  ensure(state.phase === "decide", "interact with the scene before deciding, and do not choose twice");
  const script = checkPlayableAtCursor(catalog, scripts, state);
  const choice = script.choices.find((item) => item.id === choiceId);
  ensure(choice, "unknown decision: " + choiceId);
  const metrics = applyEffects(state.metrics, choice.effects);
  const flags = applyFlags(state.flags, choice.flags || {});
  const hazards = state.unresolvedHazards.slice();
  if (choice.risk === "hazard" && !hazards.includes(script.id)) hazards.push(script.id);
  const record = { day: state.dayIndex + 1, incidentId: script.id, actionId: state.actionId,
    choiceId: choice.id, choiceLabel: choice.label, reason: choice.reason, risk: choice.risk,
    recovered: false };
  return copyState(state, {
    phase: "resolve", metrics, flags, unresolvedHazards: hazards,
    history: [...state.history, record],
    pending: { choiceId, reason: choice.reason, reaction: choice.reaction, recovery: choice.recovery || null, recovered: false }
  });
}
export function recover(catalog, scripts, state) {
  ensure(state.phase === "resolve" && state.pending?.recovery && !state.pending.recovered,
    "no available recovery or already recovered");
  const script = checkPlayableAtCursor(catalog, scripts, state);
  const recovery = state.pending.recovery;
  const metrics = applyEffects(state.metrics, recovery.effects || {});
  const flags = applyFlags(state.flags, recovery.flags || {});
  const hazards = state.unresolvedHazards.filter((id) => !recovery.resolvesHazard || id !== script.id);
  const history = state.history.slice();
  history[history.length - 1] = { ...history[history.length - 1], recovered: true, recoveryReason: recovery.reason };
  return copyState(state, {
    metrics, flags, unresolvedHazards: hazards, history,
    pending: { ...state.pending, recovered: true, reaction: recovery.reaction }
  });
}
export function selectEnding(state) {
  ensure(state.dayIndex === 29 && state.incidentIndex === 2, "endings only after day 30");
  if (state.unresolvedHazards.length || state.metrics.safety < 55) return ENDINGS.repair;
  if (state.metrics.safety >= 70 && state.metrics.trust >= 65 && state.metrics.flow >= 55) return ENDINGS.thriving;
  return ENDINGS.steady;
}
export function advance(catalog, state) {
  ensure(state.phase === "resolve", "must resolve the current incident before advancing");
  const oldIncident = currentIncident(catalog, state);
  ensure(oldIncident, "invalid active incident");
  if (state.dayIndex === 29 && state.incidentIndex === 2) {
    const ending = selectEnding(state);
    return copyState(state, { phase: "ending", pending: null, actionId: null, ending });
  }
  const incidentIndex = (state.incidentIndex + 1) % 3;
  const dayIndex = state.dayIndex + (incidentIndex === 0 ? 1 : 0);
  ensure(dayIndex < 30, "cannot advance beyond the month");
  return copyState(state, { dayIndex, incidentIndex, phase: "observe", pending: null, actionId: null });
}
