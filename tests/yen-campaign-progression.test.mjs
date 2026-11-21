import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {createState,choose,recover,advance} from "../tinh-huong/campaign/engine.mjs";
import {DAY01_SCRIPTS} from "../tinh-huong/campaign/day01.mjs";
import {RANKS,shopProgress,rewardFor,RECOVERY_BONUS} from "../tinh-huong/campaign/progression.mjs";

const catalog=JSON.parse(readFileSync(resolve(import.meta.dirname,"../docs/visual-novel/episodes.json"),"utf8"));
const ranks=["Tập đứng quầy","Quầy đã vào nhịp","Gỡ rối gọn ghẽ",
  "Có người giữ quầy","Giữ Yên giờ đông","Vững tay xoay ca","Trái tim quán Yên"];

test("shop progression has seven unique attainable and increasing ranks",()=>{
 assert.deepEqual(RANKS.map(x=>x.title),ranks);
 assert.equal(RANKS[0].from,0);
 assert.equal(new Set(RANKS.map(x=>x.from)).size,7);
 assert.ok(RANKS.every((r,i)=>!i||r.from>RANKS[i-1].from));
 assert.equal(shopProgress([]).level,1);
 assert.equal(shopProgress([]).xp,0);
});
test("risks reward responsible decisions, not unsafe shortcuts",()=>{
 assert.equal(rewardFor({risk:"safe"}),12);
 assert.equal(rewardFor({risk:"caution"}),6);
 assert.equal(rewardFor({risk:"hazard"}),2);
 assert.equal(rewardFor({risk:"hazard",recovered:true}),2+RECOVERY_BONUS);
 assert.throws(()=>rewardFor({risk:"unknown"}),/Unknown campaign decision risk/);
});
test("progress derives from decisions with rank transitions and next-title text",()=>{
 const first=shopProgress([{risk:"safe"}]);
 assert.deepEqual([first.xp,first.level,first.earned,first.remaining],[12,1,12,8]);
 assert.equal(first.nextTitle,"Quầy đã vào nhịp");
 const second=shopProgress([{risk:"safe"},{risk:"safe"}]);
 assert.deepEqual([second.xp,second.level,second.earned,second.remaining],[24,2,4,36]);
 assert.equal(second.justLeveled,true);
 const third=shopProgress([{risk:"safe"},{risk:"safe"},{risk:"safe"}]);
 assert.equal(third.xp,36);
 assert.equal(third.level,2);
});
test("27 possible Day 1 choice combinations produce correct immutable XP without persistent state",()=>{
 const options=[["explain","silent","priority"],["clean","later","open"],["refund","later","ignore"]];
 for(let n=0;n<27;n++){
  const ids=[options[0][Math.floor(n/9)%3],options[1][Math.floor(n/3)%3],options[2][n%3]];
  let state=createState(catalog);
  let expected=0;
  for(const [index,id] of ids.entries()){
   const previous=state;
   state=choose(catalog,DAY01_SCRIPTS,state,id);
   expected+=rewardFor(state.history[index]);
   assert.equal(shopProgress(state.history).xp,expected);
   assert.equal(previous.history.length,index,"previous state remains unchanged");
   assert.throws(()=>choose(catalog,DAY01_SCRIPTS,state,id),/do not choose twice/);
   state=advance(catalog,state);
  }
  assert.equal(state.dayIndex,1);
  assert.equal(state.history.length,3);
  assert.equal(shopProgress(state.history).xp,expected);
 }
});
test("recovery adds its bonus once, cannot be farmed, and restart returns level 1",()=>{
 let state=createState(catalog);
 state=choose(catalog,DAY01_SCRIPTS,state,"explain");state=advance(catalog,state);
 state=choose(catalog,DAY01_SCRIPTS,state,"open");
 assert.equal(shopProgress(state.history).xp,14);
 state=recover(catalog,DAY01_SCRIPTS,state);
 assert.equal(shopProgress(state.history).xp,18);
 assert.throws(()=>recover(catalog,DAY01_SCRIPTS,state),/already recovered/);
 state=advance(catalog,state);
 state=choose(catalog,DAY01_SCRIPTS,state,"refund");
 assert.equal(shopProgress(state.history).xp,30);
 assert.equal(shopProgress(createState(catalog).history).xp,0);
});
test("completed 30-day scores cap at the top level instead of inventing future ranks",()=>{
 const history=Array.from({length:90},()=>({risk:"safe"}));
 const p=shopProgress(history);
 assert.equal(p.level,7);
 assert.equal(p.percent,100);
 assert.equal(p.nextLevel,null);
 assert.equal(p.threshold,0);
 assert.equal(p.remaining,0);
 assert.equal(p.xp,1080);
});

test("rank pacing spans the full 30-day month, not only the opening week",()=>{
 const early=Array.from({length:18},()=>({risk:"safe"}));
 const later=Array.from({length:75},()=>({risk:"safe"}));
 assert.ok(shopProgress(early).level<7,"Day 6 should not exhaust awards");
 assert.equal(shopProgress(later).level,7,"steady choices by day 25 can reach top rank");
 assert.deepEqual(RANKS.map(x=>x.from),[0,20,60,150,310,560,900]);
});
