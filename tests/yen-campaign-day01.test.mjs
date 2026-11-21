import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createState, currentIncident, validatePlayable, sceneView,
  interact, choose, recover, advance
} from "../tinh-huong/campaign/engine.mjs";
import { DAY01, DAY01_BY_ID, DAY01_SCRIPTS, DAY01_ART_REFS, day01Debrief }
 from "../tinh-huong/campaign/day01.mjs";
import { getScene, createInteraction, updateInteraction, visualState }
 from "../tinh-huong/interactions/mechanics.mjs";

const root=resolve(import.meta.dirname,"..");
const catalog=JSON.parse(readFileSync(resolve(root,"docs/visual-novel/episodes.json"),"utf8"));
const paths={
 arrange:["03","01","03","02"],
 isolate:["sign","spill"],
 compare:["tea"]
};

function solve(id){
 const m=getScene(id);
 let state=createInteraction(id);
 for(const item of paths[id])state=updateInteraction(state,{type:"activate",id:item});
 assert.equal(state.completed,true,id);
 assert.equal(visualState(m,state).phase,"resolution");
 return state;
}
function play(indices=[0,0,0],recovery=false){
 let state=createState(catalog);
 for(let i=0;i<3;i++){
  const entry=DAY01[i];
  const incident=currentIncident(catalog,state);
  assert.equal(incident.id,entry.id);
  assert.equal(state.phase,"observe");
  const scene=getScene(entry.mechanicId);
  const visual=visualState(scene,solve(entry.mechanicId));
  assert.equal(visual.completed,true);
  const first=sceneView(catalog,DAY01_SCRIPTS,state);
  assert.equal(first.phase,"establishing");
  state=interact(catalog,DAY01_SCRIPTS,state,entry.actionId);
  const close=sceneView(catalog,DAY01_SCRIPTS,state);
  assert.equal(close.phase,"interactive");
  assert.notDeepEqual(first.shot.camera,close.shot.camera);
  assert.throws(()=>interact(catalog,DAY01_SCRIPTS,state,entry.actionId),/can only happen/);
  state=choose(catalog,DAY01_SCRIPTS,state,entry.choices[indices[i]].id);
  const after=sceneView(catalog,DAY01_SCRIPTS,state);
  assert.equal(after.phase,"resolution");
  assert.ok(after.visualChanges.length>=2);
  assert.throws(()=>choose(catalog,DAY01_SCRIPTS,state,entry.choices[indices[i]].id),/do not choose twice/);
  if(i===1&&indices[i]===2&&recovery){
   assert.ok(state.pending.recovery);
   state=recover(catalog,DAY01_SCRIPTS,state);
   assert.equal(state.unresolvedHazards.length,0);
   assert.equal(state.flags.spillResolved,true);
  }
  state=advance(catalog,state);
 }
 assert.equal(state.dayIndex,1);
 assert.equal(state.incidentIndex,0);
 assert.equal(currentIncident(catalog,state).id,"D02-01");
 assert.equal(state.history.length,3);
 return state;
}

test("three Day 1 scripts pass the engine contract without pretending 90 days are playable",()=>{
 assert.equal(validatePlayable(catalog,DAY01_SCRIPTS),true);
 assert.throws(()=>validatePlayable(catalog,DAY01_SCRIPTS,{requireAll:true}),/90 playable/);
 assert.deepEqual(DAY01.map(e=>e.id),["D01-01","D01-02","D01-03"]);
 assert.equal(Object.keys(DAY01_BY_ID).length,3);
 for(const entry of DAY01) {
  assert.equal(entry.choices.length,3);
  assert.ok(entry.intro.length>25&&entry.cue.length>20&&entry.transition.length>20);
  assert.ok(entry.question&&entry.sceneTheme&&entry.assets.length>=3);
  assert.ok(entry.choices.every(c=>c.reaction.visualChanges.length>=2));
 }
});
test("all nine Day 1 painted-world asset references exist in the repo, not CSS placeholder art",()=>{
 for(const entry of DAY01){
  const refs=DAY01_ART_REFS[entry.id];
  assert.equal(refs.length,3);
  assert.ok(refs.every(src=>/\.webp$/.test(src)));
  for(const url of refs)assert.equal(existsSync(resolve(root,url.slice(1))),true,url);
  assert.equal(existsSync(resolve(root,"lab/assets/room-backdrop.jpg")),true);
 }
 const refLists=DAY01.map(e=>DAY01_ART_REFS[e.id].join("|"));
 assert.equal(new Set(refLists).size,3,"each incident needs a distinct painted prop/character composition");
});
test("each scenario has three distinct scene shots and an action on physical evidence",()=>{
 for(const entry of DAY01){
  const shots=entry.scene.shots;
  assert.ok(shots.establishing.description!==shots.interactive.description);
  assert.ok(shots.interactive.description!==shots.resolution.description);
  assert.ok(shots.establishing.actors[0].pose!==shots.interactive.actors[0].pose);
  assert.ok(shots.interactive.props[0].state!==shots.resolution.props[0].state);
  assert.ok(entry.action.targetId&&entry.action.keyboardAlternative);
  const m=solve(entry.mechanicId);
  assert.equal(m.completed,true);
 }
});
test("all 3³ choice combinations reach Day 2, preserve cross-day flags and bound metrics",()=>{
 for(let n=0;n<27;n++){
  const indices=[Math.floor(n/9)%3,Math.floor(n/3)%3,n%3];
  const state=play(indices,n%2===0);
  assert.ok(state.flags.queueSorted);
  assert.equal(state.history.length,3);
  assert.ok(state.history.every(r=>r.day===1));
  for(const value of Object.values(state.metrics))assert.ok(value>=0&&value<=100);
  const notes=day01Debrief(state.flags);
  assert.equal(notes.length,3);
  assert.ok(notes.every(x=>x.length>30));
  assert.equal(state.flags.billCorrected,indices[2]===0);
 }
});
test("water safety cannot be cheated: unsafe choice persists as hazard until corrected",()=>{
 const unsafe=play([0,2,0],false);
 assert.deepEqual(unsafe.unresolvedHazards,["D01-02"]);
 assert.equal(unsafe.flags.spillResolved,false);
 assert.match(day01Debrief(unsafe.flags)[1],/chưa được khắc phục/);
 const repaired=play([0,2,0],true);
 assert.equal(repaired.unresolvedHazards.length,0);
 assert.equal(repaired.flags.spillResolved,true);
 assert.ok(repaired.history[1].recovered);
});
test("refund and communication change Day 2 callbacks, not just numeric score",()=>{
 const careful=play([0,0,0]);
 const careless=play([2,1,2]);
 assert.equal(careful.flags.queueExplained,true);
 assert.equal(careful.flags.spillResolved,true);
 assert.equal(careful.flags.billCorrected,true);
 assert.equal(careless.flags.queueExplained,false);
 assert.equal(careless.flags.spillResolved,false);
 assert.equal(careless.flags.billCorrected,false);
 assert.notDeepEqual(day01Debrief(careful.flags),day01Debrief(careless.flags));
});
