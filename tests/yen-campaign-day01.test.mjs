import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createState, currentIncident, validatePlayable, sceneView,
  interact, choose, recover, advance
} from "../tinh-huong/campaign/engine.mjs";
import {
  DAY01, DAY01_BY_ID, DAY01_SCRIPTS, day01Debrief
} from "../tinh-huong/campaign/day01.mjs";
import { getSceneComposition, VISUAL_ASSETS } from "../tinh-huong/campaign/scene-composition.mjs";

const root=resolve(import.meta.dirname,"..");
const catalog=JSON.parse(readFileSync(resolve(root,"docs/visual-novel/episodes.json"),"utf8"));

function play(indices=[0,0,0],recovery=false){
 let state=createState(catalog);
 for(let i=0;i<3;i++){
  const entry=DAY01[i];
  assert.equal(currentIncident(catalog,state).id,entry.id);
  assert.equal(state.phase,"observe");
  const first=sceneView(catalog,DAY01_SCRIPTS,state);
  assert.equal(first.phase,"establishing");
  const before=state;
  state=choose(catalog,DAY01_SCRIPTS,state,entry.choices[indices[i]].id);
  assert.equal(before.phase,"observe","a choice must not mutate the previous state");
  assert.equal(state.phase,"resolve");
  const after=sceneView(catalog,DAY01_SCRIPTS,state);
  assert.equal(after.phase,"resolution");
  assert.notDeepEqual(first.shot.camera,after.shot.camera);
  assert.ok(after.visualChanges.length>=2);
  assert.throws(()=>choose(catalog,DAY01_SCRIPTS,state,entry.choices[indices[i]].id),/do not choose twice/);
  if(i===1 && indices[i]===2 && recovery){
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

test("Day 1 is an illustrated visual novel: 3 choices appear without touching scene objects",()=>{
 assert.equal(validatePlayable(catalog,DAY01_SCRIPTS),true);
 assert.throws(()=>validatePlayable(catalog,DAY01_SCRIPTS,{requireAll:true}),/90 playable/);
 assert.deepEqual(DAY01.map(e=>e.id),["D01-01","D01-02","D01-03"]);
 assert.equal(Object.keys(DAY01_BY_ID).length,3);
 for(const entry of DAY01){
  const script=DAY01_SCRIPTS[entry.id];
  assert.equal(script.mode,"visual-novel");
  assert.deepEqual(script.interactions,[]);
  assert.equal(entry.choices.length,3);
  assert.ok(entry.intro.length>25 && entry.cue.length>20 && entry.question.length>20);
  assert.ok(entry.sceneTheme && getSceneComposition(entry.id).layers.length>=6);
  assert.ok(entry.choices.every(c=>c.reaction.visualChanges.length>=2));
 }
});

test("painted staff/customer/Cục Yên, counter and incident objects all point to real source assets",()=>{
 for(const [key,ref] of Object.entries(VISUAL_ASSETS)){
  assert.equal(existsSync(resolve(root,ref.slice(1))),true,key+" "+ref);
 }
 const keys=[];
 for(const entry of DAY01){
  const composition=getSceneComposition(entry.id);
  assert.equal(composition.background,"/lab/assets/room-backdrop.jpg");
  assert.ok(composition.layers.length>=7);
  assert.ok(composition.layers.some(x=>x.id===composition.focusId));
  keys.push(composition.layers.map(x=>x.asset).join("|"));
 }
 assert.equal(new Set(keys).size,3,"every incident must have distinct staged artwork");
});
test("shots carry different camera, actor pose and story evidence, not object actions",()=>{
 for(const entry of DAY01){
  const shots=entry.scene.shots;
  assert.notEqual(shots.establishing.description,shots.interactive.description);
  assert.notEqual(shots.interactive.description,shots.resolution.description);
  assert.notEqual(shots.establishing.actors[0].pose,shots.resolution.actors[0].pose);
  assert.notEqual(shots.interactive.props[0].state,shots.resolution.props[0].state);
  assert.equal(DAY01_SCRIPTS[entry.id].interactions.length,0);
 }
});
test("engine retains old direct-scene guard for other scripts, while Day 1 needs no action",()=>{
 let state=createState(catalog);
 assert.throws(()=>interact(catalog,DAY01_SCRIPTS,state,"sort-tickets"),/visual-novel choices are direct/);
 state=choose(catalog,DAY01_SCRIPTS,state,"explain");
 assert.equal(state.actionId,null);
 assert.equal(state.history[0].actionId,null);
});
test("27 combinations can finish Day 1 and carry distinct flags and consequences to Day 2",()=>{
 for(let n=0;n<27;n++){
  const indices=[Math.floor(n/9)%3,Math.floor(n/3)%3,n%3];
  const state=play(indices,n%2===0);
  assert.equal(state.flags.queueSorted,indices[0]!==2);
  assert.equal(state.flags.queueExplained,indices[0]===0);
  assert.equal(state.flags.billCorrected,indices[2]===0);
  assert.equal(state.history.length,3);
  assert.ok(state.history.every(record=>record.day===1));
  for(const value of Object.values(state.metrics))assert.ok(value>=0&&value<=100);
  const notes=day01Debrief(state.flags);
  assert.equal(notes.length,3);
  assert.ok(notes.every(text=>text.length>30));
 }
});
test("unsafe water decision stays hazardous until player explicitly chooses recovery",()=>{
 const unsafe=play([0,2,0],false);
 assert.deepEqual(unsafe.unresolvedHazards,["D01-02"]);
 assert.equal(unsafe.flags.spillResolved,false);
 assert.match(day01Debrief(unsafe.flags)[1],/chưa được khắc phục/);
 const recovered=play([0,2,0],true);
 assert.equal(recovered.unresolvedHazards.length,0);
 assert.equal(recovered.flags.spillResolved,true);
 assert.ok(recovered.history[1].recovered);
});
test("communication and refunds change tomorrow's brief, not only displayed scores",()=>{
 const careful=play([0,0,0]), careless=play([2,1,2]);
 assert.deepEqual([careful.flags.queueExplained,careful.flags.spillResolved,careful.flags.billCorrected],[true,true,true]);
 assert.deepEqual([careless.flags.queueExplained,careless.flags.spillResolved,careless.flags.billCorrected],[false,false,false]);
 assert.notDeepEqual(day01Debrief(careful.flags),day01Debrief(careless.flags));
});
