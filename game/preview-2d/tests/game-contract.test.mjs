import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const dir=path.dirname(fileURLToPath(import.meta.url));
const gamePath=path.join(dir,'..','game.js');
const assetDir=path.join(dir,'..','assets','sprites');
const source=readFileSync(gamePath,'utf8');
const internals={};
const instrumented=source.replace(/\binit\(\);\s*\}\)\(\);\s*$/, 'Object.assign(globalThis.__gameInternals,{blocked,NPC_ROUTINES,SPRITE_ROLES,CLIPS});\n})();');
assert.notEqual(instrumented,source,'game.js test injection anchor changed');
vm.runInNewContext(instrumented,{window:{},Phaser:{Scene:class{}},__gameInternals:internals},{filename:'game.js',timeout:2500});
const {blocked,NPC_ROUTINES,SPRITE_ROLES,CLIPS}=internals;

test('all NPCs have autonomous routines with valid reachable waypoints',()=>{
  assert.equal(typeof blocked,'function');
  for(const [id,route] of Object.entries(NPC_ROUTINES)){
    assert.ok(route.length>0,id);
    for(const p of route){
      assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.wait>0,id);
      if(id!=='barista')assert.equal(blocked(p.x,p.y),false,id+' blocked waypoint');
    }
    if(id==='barista')continue; // works in a counter station that is blocked to the player
    for(let index=0;index<route.length;index++){
      const a=route[index],b=route[(index+1)%route.length];
      for(let step=1;step<=25;step++){
        const t=step/25;
        assert.equal(blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t),false,id+' blocked segment');
      }
    }
  }
});

test('all spritesheets match a fixed four-by-four atlas format',()=>{
  const manifest=JSON.parse(readFileSync(path.join(assetDir,'manifest.json'),'utf8'));
  assert.equal(manifest.schemaVersion,1);
  assert.deepEqual(manifest.format.columns,4);
  assert.deepEqual(manifest.format.rows,4);
  assert.deepEqual(manifest.format.frameSize,[256,320]);
  assert.deepEqual(manifest.format.size,[1024,1280]);
  assert.equal(SPRITE_ROLES.length,5);
  for(const role of SPRITE_ROLES){
    const entry=manifest.roleAssets[role];
    assert.ok(entry,'missing '+role);
    const data=readFileSync(path.join(assetDir,entry.file));
    assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16),1024,role+' width');
    assert.equal(data.readUInt32BE(20),1280,role+' height');
    assert.equal(data.length,entry.bytes,role+' length');
  }
});

test('animation frame IDs stay inside 16-frame atlases',()=>{
  for(const [name,clip] of Object.entries(CLIPS)){
    assert.ok(clip.fps>0&&clip.fps<=24,name+' fps');
    assert.ok(clip.frames.length>0,name+' empty');
    for(const id of clip.frames)assert.ok(Number.isInteger(id)&&id>=0&&id<16,name+' out-of-bounds frame');
  }
});
