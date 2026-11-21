# Một Tháng Không Yên · Campaign Engine v1

Ticket: [VN-F01 #219](https://github.com/vanphamvn/yen-nghi-choi/issues/219) · Engine source: `tinh-huong/campaign/engine.mjs`

**Status:** campaign logic implemented, illustrations and all 90 playable scripts remain PLANNED. This contract does not imply an art release.

## Graph and finite states

30 days × 3 incidents, strictly ordered D01-01 through D30-03. Every incident follows: observe (establishing shot) → manipulate a physical object in-scene → decide → resolve (actor and prop reaction) → optional recovery → advance. Day 30 final event resolves into one of three endings. No calendar gate or daily real-time lock.

Three endings: repair for unresolved hazards or low safety, steady for a functioning but imperfect shop, thriving if safety/trust/flow thresholds are maintained. Safety cannot be traded for a better ending by exploiting higher speed or budget.

## Catalog / playable script contract

- The existing `episodes.json` catalog is a **planning manifest**, containing day, slot, planned incident, scenario visual briefs, story carry flags and status. Planned entries are never treated as playable.
- Playable incident scripts must declare id and scene.location.
- scene.shots has **establishing**, **interactive**, **resolution** shots; each defines backdrop asset ID, human-readable description, accessibility alt, actors with id/pose/alt, props with id/state/alt.
- interactions must contain a meaningful type (inspect, arrange, isolate, move, compare, place), targetId, instructional prompt, keyboardAlternative and visible actor/prop/setting change. A standalone text-choice quiz cannot pass.
- choices have id, label, reason, risk (safe/caution/hazard), bounded effects on safety/trust/flow/budget, optional flags, and reaction with speaker, dialogue and visible on-scene changes.
- A hazard must decrease safety and include a recovery action with label, explanation, flag/metric changes, explicit hazard resolution boolean, and visible response. No uncorrectable hazard lock.
- callbacks optionally read long-term boolean flags and alter later lines/visual layers. They may not prevent progression.

## State contract

```js
{
  version: 1, dayIndex: 0, incidentIndex: 0,
  phase: 'observe', // observe | decide | resolve | ending
  metrics: { safety: 65, trust: 55, flow: 55, budget: 60 },
  flags: {}, unresolvedHazards: [], history: [],
  actionId: null, pending: null, ending: null
}
```

Session-only data; no account, localStorage, cookies, backend, timestamps, camera, microphone or user-specific details. A deliberate save/export is deferred to #228. Returned state is immutable-by-convention: operations copy state rather than changing the input.

## Engine API

```js
validateCatalog(catalog);
validateScript(script, incident);
validatePlayable(catalog, scripts, { requireAll: true });
let state = createState(catalog);
let scene = sceneView(catalog, scripts, state);
state = interact(catalog, scripts, state, 'inspect-ticket');
state = choose(catalog, scripts, state, 'safe');
// optionally: state = recover(catalog, scripts, state);
state = advance(catalog, state);
```

State transitions are deterministic; a choice or recovery cannot be applied twice. Values stay in 0–100. Sequential progress has no flags required, so every choice branch eventually reaches D30-03. The engine does not fetch or decode assets; the VN-F02/03 renderer must verify that manifest references point to real artwork.

## Tests and release boundary

Unit tests must validate the real 90-item planned catalog, playable schema with representative fixture scripts, all 90 transitions with safe/cautious/unsafe/repaired choices, distinct reachable endings, flag callbacks Day 1 → Day 30, bounded stats, and duplicate-selection prevention. They do not certify actual art quality or production release.

Required next tasks: [VN-F02 #220](https://github.com/vanphamvn/yen-nghi-choi/issues/220) establish art bible/manifest, [VN-F03 #221](https://github.com/vanphamvn/yen-nghi-choi/issues/221) interaction primitives, [VN-F04 #222](https://github.com/vanphamvn/yen-nghi-choi/issues/222) fully playable Day 1 vertical slice with 3 illustrated incidents.

### Safety and privacy

The game is fiction, not a real-world emergency protocol or a medical assessment. In scenes with electrical, food or child safety risk, the art and interaction must prioritize isolation, help and proportionate escalation. The engine never rewards a hazard with a positive safety delta. Tests do not substitute for real browser and art review.