// Run: node --test tests/game-day-loop.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../game/game.js',import.meta.url),'utf8');
const html = readFileSync(new URL('../game/index.html',import.meta.url),'utf8');

function createHarness() {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id,{
      id, textContent:'', innerHTML:'', hidden:false, disabled:false, style:{}, dataset:{},
      append(){},addEventListener(){},setAttribute(){},
      querySelector(){return {getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}}}
    });
    return nodes.get(id);
  };
  const context=vm.createContext({
    console,
    document:{
      getElementById:node,
      createElement:()=>({style:{},append(){},addEventListener(){},setAttribute(){}}),
      querySelectorAll:()=>[]
    },
    window:{addEventListener(){}},
    requestAnimationFrame(){return 1;},
    cancelAnimationFrame(){}
  });
  vm.runInContext(source,context,{filename:'game/game.js'});
  const setup = [
    'const position=(x=0,y=0,z=0)=>({x,y,z,set(x,y,z){this.x=x;this.y=y;this.z=z;}});',
    'const color=()=>({value:0,setHex(v){this.value=v;}});',
    'world = {',
    '  setTint(mesh,hex){mesh.tint=hex;},',
    '  player:{position:position(0,0,4.5),rotation:{y:0}},',
    '  indicator:{isVisible:false,position:position()},',
    '  markerPole:{isVisible:false,position:position()},',
    '  nearRing:{isVisible:false,position:position()},',
    '  focusedStation:null,',
    '  npcs:NPCS.map(n=>({...n,group:{position:position(n.x,0,n.z),rotation:{y:0},scaling:{set(){}}},halo:{material:{alpha:0}},interactions:0,react:0})),',
    '  refs:{machineLight:{tint:0},tableCup:{isVisible:true},bikeLamp:{isVisible:false},',
    '    benchPillow:{position:{x:2.5}},doorPanel:{tint:0},',
    '    plantLeaves:[{scaling:{y:.59,set(x,y,z){this.y=y}},tint:0}]}',
    '};',
    'game={role:"cat",attributes:{speed:3,dexterity:3,calm:3,charm:3},',
    '  day:1,phase:"explore",done:0,elapsed:0,ambientTime:0,',
    '  efficiency:50,peace:70,active:null,playing:true,powerCooldown:0,sprint:0,',
    '  shield:false,quickNext:false,propState:{door:0,counter:0,table:0,bike:0,bench:0,plant:0},',
    '  message:"",messageTime:0,nextEvent:22};',
    'updatePhaseUI();'
  ].join('\n');
  vm.runInContext(setup,context);
  return {eval:expression=>vm.runInContext(expression,context),node,context};
}

test('free roam starts on day one and cannot be ended before working',()=>{
  const h=createHarness();
  assert.equal(h.eval('game.phase'),'explore');
  assert.equal(h.node('shift-btn').textContent,'Bắt đầu ca ↗');
  h.eval('finishShift()');
  assert.equal(h.eval('game.phase'),'explore');
  assert.equal(h.eval('game.day'),1);
});
test('NPC dialogue and props work before a shift, then reset at shift start',()=>{
  const h=createHarness();
  h.eval('world.player.position.set(-7.6,0,3.2);interact();');
  assert.match(h.eval('game.message'),/Chú bảo vệ/);
  assert.equal(h.node('game-toast').hidden,false,'Speech toast should show with objectives collapsed');
  assert.equal(h.eval('world.npcs.find(x=>x.id==="npc_guard").interactions'),1);
  h.eval('world.player.position.set(3,0,-2.2);interact();');
  assert.equal(h.eval('game.propState.counter'),1);
  assert.equal(h.eval('world.refs.machineLight.tint'),0x77c78b);
  h.eval('startShift()');
  assert.equal(h.eval('game.phase'),'shift');
  assert.equal(h.eval('world.npcs.find(x=>x.id==="npc_guard").interactions'),0);
  assert.equal(h.eval('game.propState.counter'),0);
  assert.equal(h.eval('world.refs.machineLight.tint'),0x9b9188);
  assert.equal(h.eval('world.player.position.z'),4.5);
});
test('completing the third task permits manual shift end but does not force it',()=>{
  const h=createHarness();
  h.eval('startShift();game.done=2;completeAction();');
  assert.equal(h.eval('game.done'),3);
  assert.equal(h.eval('game.phase'),'ready');
  assert.equal(h.node('shift-btn').textContent,'Kết thúc ca ↗');
  assert.equal(h.eval('game.playing'),true);
  h.eval('game.elapsed=10000;');
  assert.equal(h.eval('game.phase'),'ready');
  h.eval('finishShift()');
  assert.equal(h.eval('game.phase'),'result');
  assert.equal(h.node('result').hidden,false);
});
test('next day keeps the world, resets stats and allows another shift',()=>{
  const h=createHarness();
  h.eval('startShift();game.done=3;game.phase="ready";game.efficiency=90;game.peace=75;finishShift();');
  assert.equal(h.node('result-tasks').textContent,'3 / 3');
  h.eval('nextDay()');
  assert.equal(h.eval('game.day'),2);
  assert.equal(h.eval('game.phase'),'explore');
  assert.equal(h.eval('game.done'),0);
  assert.equal(h.eval('game.efficiency'),50);
  assert.equal(h.eval('game.peace'),70);
  assert.equal(h.node('result').hidden,true);
  h.eval('startShift()');
  assert.equal(h.eval('game.day'),2);
  assert.equal(h.eval('game.phase'),'shift');
});
test('six NPCs, six props, mobile input and no timed game over',()=>{
  const h=createHarness();
  assert.equal(h.eval('NPCS.length'),6);
  assert.equal(h.eval('Object.keys(PROP_TEXT).length'),6);
  for (const id of ['hud-day','shift-btn','shift-state','target-hint','result-day','interact-label']) {
    assert.ok(html.includes('id="'+id+'"'),id+' is missing');
  }
  assert.ok(source.includes("joystick.addEventListener('pointerdown'"));
  assert.ok(!source.includes('endGame(false)'));
  assert.ok(!source.includes('game.elapsed>=150'));
  assert.ok(!/localStorage|sessionStorage|document\.cookie/.test(source));
});
