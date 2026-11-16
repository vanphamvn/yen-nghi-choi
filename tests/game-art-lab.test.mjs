// Run locally: node --test tests/game-art-lab.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../game/art-lab/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../game/art-lab/style.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../game/art-lab/app.js',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../game/assets/asset-manifest.json',import.meta.url),'utf8'));
const artBible=readFileSync(new URL('../game/ART_DIRECTION.md',import.meta.url),'utf8');
const plan=readFileSync(new URL('../game/VISUAL_REBUILD_PLAN.md',import.meta.url),'utf8');

test('Art Lab is isolated from the production game and not indexed',()=>{
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/href="\.\.\/"/);
  assert.match(html,/id="renderCanvas"/);
  assert.match(html,/id="asset-file"[^>]*accept="\.glb/);
  assert.match(html,/id="animation"/);
  assert.match(html,/id="fps"/);
  assert.match(html,/id="capture"/);
  assert.match(css,/@media\(max-width:520px\)/);
});

test('local GLB access only, limits and explicit plugin extension',()=>{
  assert.match(js,/FILE_LIMIT = 40 \* 1024 \* 1024/);
  assert.match(js,/URL\.createObjectURL\(file\)/);
  assert.match(js,/URL\.revokeObjectURL\(url\)/);
  assert.match(js,/LoadAssetContainerAsync\('',url,scene,undefined,'\.glb'\)/);
  assert.match(js,/function disposeAsset\(/);
  assert.match(js,/function boundsFromMeshes\(/);
  assert.match(js,/function populateAnimations\(/);
  assert.match(js,/function setCamera\(/);
  assert.match(js,/function median\(/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|navigator\.sendBeacon/);
});

test('pinned Babylon and GLB loader versions',()=>{
  assert.match(html,/babylonjs@9\.36\.0\/babylon\.js/);
  assert.match(html,/babylonjs-loaders@9\.36\.0\/babylonjs\.loaders\.min\.js/);
  assert.match(html,/connect-src 'self' blob:/);
  assert.match(html,/object-src 'none'/);
});

test('Asset manifest never marks a missing asset approved',()=>{
  assert.equal(manifest.schemaVersion,1);
  assert.deepEqual(manifest.conventions.animationClips,['Idle','Walk','Interact']);
  for (const asset of manifest.assets){
    assert.equal(asset.status,'proposed');
    assert.equal(asset.path,null);
    assert.equal(asset.license,null);
    assert.ok(asset.blockingIssue>=75);
  }
});

test('Art direction and roadmap include visual gate, mobile performance and provenance',()=>{
  assert.match(artBible,/chưa duyệt/i);
  assert.match(artBible,/silhouette/i);
  assert.match(artBible,/Láng Dài/);
  assert.match(plan,/30 FPS/);
  assert.match(plan,/screenshot/i);
  assert.match(plan,/license/i);
  assert.match(plan,/vertical slice/i);
  assert.match(plan,/Rollback/i);
});

test('Art Lab JS is syntactically valid and wires setup on load',()=>{
  assert.doesNotThrow(()=>new vm.Script(js,{filename:'game/art-lab/app.js'}));
  assert.match(js,/setInterval\(updateStats,1000\)/);
  assert.match(js,/runRenderLoop/);
  assert.match(js,/getTotalIndices/);
});
