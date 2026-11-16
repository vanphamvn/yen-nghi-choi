// node --test tests/game-v3-asset.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const asset=readFileSync(new URL('../game/assets/yen-barista-v1.glb',import.meta.url));
const game=readFileSync(new URL('../game/game.js',import.meta.url),'utf8');
const scene=readFileSync(new URL('../game/world-babylon.js',import.meta.url),'utf8');
const page=readFileSync(new URL('../game/index.html',import.meta.url),'utf8');

function glb(){
  assert.equal(asset.toString('ascii',0,4),'glTF');
  assert.equal(asset.readUInt32LE(4),2);
  assert.equal(asset.readUInt32LE(8),asset.length);
  const jsonLen=asset.readUInt32LE(12);
  assert.equal(asset.readUInt32LE(16),0x4e4f534a);
  const data=JSON.parse(asset.subarray(20,20+jsonLen).toString('utf8'));
  const binaryStart=20+jsonLen;
  assert.equal(asset.readUInt32LE(binaryStart+4),0x004e4942);
  const binarySize=asset.readUInt32LE(binaryStart);
  assert.equal(data.buffers[0].byteLength,binarySize);
  assert.equal(asset.length,binaryStart+8+binarySize);
  return data;
}

test('self-hosted GLB is valid glTF 2.0 with geometry and materials',()=>{
  const data=glb();
  assert.ok(data.meshes.length>=30);
  assert.ok(data.nodes.length>=40);
  assert.ok(data.materials.length>=12);
  assert.equal(data.scenes.length,1);
  for(const mesh of data.meshes)for(const p of mesh.primitives){
    assert.ok(p.attributes.POSITION<data.accessors.length);
    assert.ok(p.indices<data.accessors.length);
    assert.ok(p.material<data.materials.length);
  }
  for(const node of data.nodes)if(node.mesh!==undefined)assert.ok(node.mesh<data.meshes.length);
});

test('GLB has Idle, Walk and Interact animation groups with bounded time accessors',()=>{
  const data=glb();
  assert.deepEqual(data.animations.map(a=>a.name).sort(),['Idle','Interact','Walk']);
  for(const animation of data.animations){
    assert.ok(animation.channels.length>=2);
    for(const sampler of animation.samplers){
      const input=data.accessors[sampler.input];
      assert.ok(input.count>=2);
      assert.ok(input.min[0]===0);
      assert.ok(input.max[0]>0);
    }
  }
});

test('new asset stays local and all five roles remain usable',()=>{
  assert.match(game,/babylonjs-loaders@9\.36\.0/);
  assert.match(scene,/ImportMeshAsync\(null,'\.\/assets\/','yen-barista-v1\.glb'/);
  assert.match(scene,/if\(roleId==='cat'\)/);
  assert.match(scene,/playHeroClip\('Walk'\)/);
  assert.match(scene,/triggerHeroInteract/);
  assert.match(game,/tickHeroAnimation/);
  assert.match(page,/BETA · 03/);
  assert.match(page,/id="objective-panel" hidden/);
  assert.doesNotMatch(game,/localStorage|sessionStorage|document\.cookie/);
});

test('updated game code compiles without a build step',()=>{
  assert.doesNotThrow(()=>new vm.Script(game));
  assert.doesNotThrow(()=>new vm.Script(scene.replace('export function createAnimeWorld','function createAnimeWorld')));
});
