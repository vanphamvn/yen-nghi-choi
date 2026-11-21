import test from "node:test";
import assert from "node:assert/strict";
import { SCENES, createInteraction, updateInteraction, visualState, getScene, validateInteractions } from "../tinh-huong/interactions/mechanics.mjs";

function tap(state,id) { return updateInteraction(state,{type:"activate",id}); }
const sequence = {
  arrange:["03","01","03","02"],
  isolate:["sign","dry","spill"],
  compare:["total","tea"],
  inspect:["book","cup"],
  place:["tray","cup","tray"],
  move:["corner","plant","corner"]
};

test("six reusable mechanics have real painted-world/incident contexts", () => {
  assert.equal(validateInteractions(),true);
  assert.equal(new Set(SCENES.map(s => s.kind)).size,6);
  for (const scene of SCENES) {
    assert.match(scene.incident,/^D\d\d-\d\d$/);
    assert.match(scene.backdrop,/lab\/assets\/room-backdrop\.jpg$/);
    assert.ok(scene.items.every(t=>t.label));
    assert.ok(scene.goal && scene.success && scene.actors);
  }
});

test("all six have a playable complete result with a visible world state change", () => {
  for (const scene of SCENES) {
    let state=createInteraction(scene.id);
    const before=visualState(scene,state);
    assert.equal(before.phase,"establishing");
    assert.equal(state.completed,false);
    for(const id of sequence[scene.id]) {
      const previous=state;
      state=tap(state,id);
      assert.notEqual(previous,state);
    }
    assert.equal(state.completed,true,scene.id);
    assert.equal(state.selected,null,scene.id);
    assert.equal(visualState(scene,state).phase,"resolution");
    assert.ok(state.outcome.length>20);
    const after=visualState(scene,state);
    if(scene.kind==="arrange") {
      assert.deepEqual(after.items.map(t=>t.id),scene.answer);
      assert.notDeepEqual(before.items.map(t=>t.id),after.items.map(t=>t.id));
    } else if(scene.kind==="isolate") {
      assert.equal(after.items.find(i=>i.id==="spill").marked,true);
      assert.equal(after.items.find(i=>i.id==="sign").warningPlaced,true);
      assert.equal(after.items.find(i=>i.id==="sign").x,51);
      assert.notEqual(before.items.find(i=>i.id==="sign").x,51);
    } else if(scene.kind==="compare") {
      assert.match(after.items.find(i=>i.id==="total").label,/41\.000/);
    } else if(scene.kind==="inspect") {
      assert.match(state.outcome,/mức ngọt tiêu chuẩn/);
      assert.equal(after.items.find(i=>i.id==="cup").inspected,true);
      assert.match(after.items.find(i=>i.id==="cup").label,/ngọt tiêu chuẩn/);
    } else {
      assert.ok(after.items.some(i=>i.placed));
      const target=after.items.find(i=>i.id===({place:"tray",move:"corner"}[scene.kind]));
      const item=after.items.find(i=>i.id===({place:"cup",move:"plant"}[scene.kind]));
      assert.equal(item.x,target.x); assert.equal(item.y,target.y);
    }
    assert.equal(tap(state,sequence[scene.id][0]),state,"cannot double-complete");
    const restart=updateInteraction(state,{type:"reset"});
    assert.equal(restart.completed,false);
    assert.equal(restart.attempts,0);
    assert.notEqual(restart,state);
  }
});

test("arranging order tickets is repeatable, reversible and does not mutate earlier state",()=>{
  const first=createInteraction("arrange");
  const s1=tap(first,"03"),s2=tap(s1,"01"),s3=tap(s2,"01"),s4=tap(s3,"03");
  assert.deepEqual(first.order,["03","01","02"]);
  assert.deepEqual(s2.order,["01","03","02"]);
  assert.deepEqual(s4.order,["03","01","02"]);
  assert.equal(s4.completed,false);
  const cancelled=tap(tap(s4,"03"),"03");
  assert.equal(cancelled.selected,null);
});
test("isolation needs a sign before targeting the wet path and never awards wrong zone",()=>{
  let state=createInteraction("isolate");
  const bad=tap(state,"spill");
  assert.equal(bad.completed,false);
  assert.match(bad.message,/Hãy chọn/);
  state=tap(bad,"sign");
  state=tap(state,"dry");
  assert.equal(state.completed,false);
  assert.equal(state.selected,"sign");
  const corrected=tap(state,"spill");
  assert.equal(corrected.completed,true);
});
test("invalid actions cannot unlock progress; no storage is used",()=>{
  const initial=createInteraction("inspect");
  assert.equal(updateInteraction(initial,{type:"activate",id:"missing"}),initial);
  assert.equal(updateInteraction(initial,{type:"unknown",id:"cup"}),initial);
  assert.throws(()=>createInteraction("undefined"),/unknown scene/);
  assert.equal(typeof globalThis.localStorage,"undefined");
});
