// node --test tests/game-v3-assets.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('game/assets/asset-manifest.json',root),'utf8'));
const game=readFileSync(new URL('game/game.js',root),'utf8');
const scene=readFileSync(new URL('game/world-v3.js',root),'utf8');
const html=readFileSync(new URL('game/index.html',root),'utf8');

function inspectGLB(asset){
  const file=new URL(asset.path,root);
  const buffer=readFileSync(file);
  assert.equal(buffer.toString('ascii',0,4),'glTF',asset.id+' invalid glb signature');
  assert.equal(buffer.readUInt32LE(4),2,asset.id+' not glTF2');
  assert.equal(buffer.readUInt32LE(8),buffer.length,asset.id+' length mismatch');
  assert.equal(buffer.toString('ascii',16,20),'JSON',asset.id+' missing JSON chunk');
  const len=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+len).toString('utf8'));
  const hash=createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
  assert.equal(hash,asset.blobSha,asset.id+' sha1/provenance mismatch');
  return {json,bytes:buffer.length};
}
test('every GLB file is a valid vendored glTF2 blob with traceable CC0 source',()=>{
  assert.equal(manifest.v3.assets.length,18);
  let total=0;
  for(const asset of manifest.v3.assets){
    assert.equal(asset.license,'CC0-1.0');
    assert.match(asset.source,/^https:\/\/kenney.nl\/assets\//);
    assert.match(asset.upstream,/^https:\/\/github.com\/Hidencod\/tge-assets\//);
    assert.equal(asset.visualApproval,'pending','visual approval must not be faked');
    const {json,bytes}=inspectGLB(asset);
    assert.ok(json.meshes.length>0,asset.id+' no meshes');
    total+=bytes;
  }
  assert.ok(total<4.5*1024*1024,'Too much bundled GLB data for mobile');
});
test('all human assets have genuine idle, walk and interaction clips',()=>{
  for(const asset of manifest.v3.assets.filter(a=>a.id.startsWith('character-'))){
    const {json}=inspectGLB(asset);
    const clips=new Set((json.animations||[]).map(x=>x.name));
    for(const required of ['idle','walk','interact-right'])assert.ok(clips.has(required),asset.id+' lacks '+required);
    assert.ok(json.skins?.length>0,asset.id+' is not skinned');
  }
});
test('cat GLB has its own animation rig',()=>{
  const cat=manifest.v3.assets.find(a=>a.id==='animal-cat');
  const {json}=inspectGLB(cat);
  const clips=new Set((json.animations||[]).map(x=>x.name));
  for(const a of ['idle','walk','gesture-positive']) assert.ok(clips.has(a),'cat missing '+a);
});
test('engine integration uses GLBs, responsive loading, and classic recovery',()=>{
  assert.doesNotThrow(()=>new vm.Script(scene.replace('export async function createAnimeWorld','async function createAnimeWorld')));
  assert.doesNotThrow(()=>new vm.Script(game));
  assert.match(game,/import\('\.\/world-v3\.js'\)/);
  assert.match(game,/await buildWorld\(\)/);
  assert.match(game,/world\.setMotion\?\.\('walk'\)/);
  assert.match(game,/babylonjs-loaders@9\.36\.0/);
  assert.match(html,/id="render-loading" class="render-loading" hidden/);
  assert.match(html,/classic=1/);
  assert.match(html,/img-src 'self' data: blob:/);
  assert.match(scene,/new B\.ShadowGenerator/);
  assert.match(scene,/LoadAssetContainerAsync/);
});
