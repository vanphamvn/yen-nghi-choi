// node --test tests/game-model-visibility.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../game/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../game/game.js',import.meta.url),'utf8');
const world=readFileSync(new URL('../game/world-babylon.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../game/style.css',import.meta.url),'utf8');

function harness({role='barista',asset='success'}={}) {
  const nodes=new Map();
  const $=id=>{
    if(!nodes.has(id))nodes.set(id,{
      id,textContent:'',innerHTML:'',hidden:id==='setup'?false:id==='model-status'?false:true,
      dataset:{},style:{},disabled:false,attributes:{},
      append(){},replaceChildren(){},setAttribute(k,v){this.attributes[k]=v},
      addEventListener(){},querySelector(){return {getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}}}
    });
    return nodes.get(id);
  };
  const position=(x=0,y=0,z=0)=>({x,y,z,set(x,y,z){this.x=x;this.y=y;this.z=z;}});
  let loadCalls=0;
  const refs={
    machineLight:{},tableCup:{isVisible:true},bikeLamp:{isVisible:false},
    benchPillow:{position:{x:2.5}},doorPanel:{},
    plantLeaves:[{scaling:{set(){}},material:{}}]
  };
  const fakeWorld=()=>({
    npcs:[],refs,player:{position:position(),rotation:{y:0}},
    indicator:{isVisible:false,position:position()},
    markerPole:{isVisible:false,position:position()},
    nearRing:{isVisible:false,position:position()},
    setTint(){},resize(){},dispose(){},render(){},
    async loadHeroGLB(){
      loadCalls++;
      if(asset==='error')throw new Error('Simulated GLB failure');
      if(role==='cat')return {loaded:false,clips:[],reason:'cat avatar preserved'};
      return {loaded:true,clips:['Idle','Walk','Interact'],meshCount:39};
    }
  });
  const document={
    getElementById:$,
    querySelectorAll(){return []},
    createElement(){
      return {style:{},addEventListener(){},setAttribute(){},append(){},
        textContent:'',dataset:{}};
    },
    head:{appendChild(script){if(script.onload)script.onload()}}
  };
  const window={BABYLON:{Engine:class{}},addEventListener(){}};
  const context=vm.createContext({
    document,window,console:{info(){},error(){},warn(){}},
    requestAnimationFrame(){return 1},cancelAnimationFrame(){}
  });
  const patched=js+'\nANIME_WORLD={createAnimeWorld:()=>__fakeWorld()};';
  context.__fakeWorld=fakeWorld;
  vm.runInContext(patched,context,{filename:'game.js'});
  vm.runInContext('setRole('+JSON.stringify(role)+')',context);
  return {node:$,context,async start(){await vm.runInContext('startGame()',context)},
    get calls(){return loadCalls;}};
}

test('initial role is updated human, not legacy cat',()=>{
  assert.match(js,/let selectedRole = 'barista'/);
  assert.match(html,/data-role="barista" aria-pressed="true"/);
  assert.match(html,/data-role="cat" aria-pressed="false"/);
  assert.match(html,/Mèo cổ vũ<\/strong><small>Model mèo cũ, chưa thay/);
});

test('successful GLB import is reported persistently',async()=>{
  const h=harness();
  await h.start();
  assert.equal(h.calls,1);
  assert.equal(h.node('model-status').dataset.asset,'glb');
  assert.match(h.node('model-status').textContent,/Đã tải model GLB mới/);
});

test('cat selection explicitly reports legacy model, without attempting human GLB',async()=>{
  const h=harness({role:'cat'});
  await h.start();
  assert.equal(h.calls,1);
  assert.equal(h.node('model-status').dataset.asset,'legacy');
  assert.match(h.node('model-status').textContent,/Mèo: mô hình cũ/);
});

test('failed GLB does not silently claim a new character',async()=>{
  const h=harness({asset:'error'});
  await h.start();
  assert.equal(h.node('model-status').dataset.asset,'fallback');
  assert.match(h.node('model-status').textContent,/Lỗi tải GLB/);
  assert.equal(h.node('game').hidden,false);
});

test('asset verification happens before disabling procedural player',()=>{
  const a=world.indexOf('if(!geometry.length || !roots.length');
  const b=world.indexOf('for(const mesh of fallbackMeshes)mesh.setEnabled(false)');
  assert.ok(a>=0&&b>a);
  assert.match(css,/\.model-status\[data-asset="fallback"\]/);
  assert.match(html,/id="model-status"/);
  assert.doesNotThrow(()=>new vm.Script(js));
});
