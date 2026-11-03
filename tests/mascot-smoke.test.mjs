// Run without dependencies: node --test tests/mascot-smoke.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const svg=readFileSync(new URL("../assets/cuc-yen/mascot.svg",import.meta.url),"utf8");
const spriteIds=new Set(Array.from(svg.matchAll(/<symbol id="(cuc-yen-[a-z-]+)"/g),m=>m[1]));
const sceneMatch=html.match(/const YEN_SCENE_ART=(\{[\s\S]*?\});\s*function renderYenScene\(/);
assert.ok(sceneMatch,"Hero scene data must be JSON and have a renderer");
const scenes=JSON.parse(sceneMatch[1]);
const expected=["alarm","cup","flight","flan","rain","magic","ufo","bubble","news","sleep",
  "toast","dog","menu","logo","serve","run","vacuum","clone","dj","skate"];

test("one mascot source with regular and staff roles",()=>{
  assert.equal(spriteIds.size,21);
  for(const name of ["waving","happy","sleepy","surprised","clerk","clerk-ready","clerk-stamp","clerk-spin","clerk-win","barista"]){
    assert.ok(spriteIds.has("cuc-yen-"+name),"Missing mascot pose: "+name);
  }
});

test("permit office no longer contains the old illustrated Cục Yên",()=>{
  const permit=html.slice(html.indexOf('<section class="section permit-section'),html.indexOf('<section class="section release-section'));
  assert.ok(permit.includes('<use href="/assets/cuc-yen/mascot.svg#cuc-yen-clerk-ready"'));
  assert.ok(permit.includes('class="permit-cuc-yen cuc-yen-model"'));
  assert.ok(!permit.includes('fill="#d5e4b0"'),"Old green inline character has returned");
});

test("20 cutscenes use canonical mascot symbols and props",()=>{
  assert.deepEqual(Object.keys(scenes).sort(),expected.slice().sort());
  assert.ok(html.includes('const mascot=\'<use class="scene-cuc-model"'));
  assert.ok(html.includes('scene-props-back'));
  assert.ok(html.includes('scene-props-front'));
  for(const [name,scene] of Object.entries(scenes)){
    assert.ok(spriteIds.has("cuc-yen-"+scene.pose),"Invalid "+name+" character pose: "+scene.pose);
    assert.ok(scene.size>=170&&scene.size<=310,name+" size is out of scene bounds");
    assert.ok(scene.x>=0&&scene.y>=-20,name+" actor starts outside scene");
    assert.ok(typeof scene.back==="string"&&typeof scene.front==="string");
    assert.ok(html.includes('data-scene="'+name+'"]'),name+" needs a scene-specific prop timeline");
    assert.ok(!scene.front.includes("<svg"),name+" prop contains an SVG that would be expanded by legacy CSS");
  }
});

test("scene settles character only, not the entire backdrop",()=>{
  assert.ok(html.includes('.mascot-cutscene.is-settled .scene-cuc-actor{animation:yenStoryIdle'));
  assert.ok(!html.includes('.mascot-cutscene.is-settled > svg{transform-origin:50% 62%'));
});

test("key cafe interactions and policies stay available",()=>{
  assert.ok(html.includes("spinButton.addEventListener('click',spin)"));
  assert.ok(html.includes('Mỗi đơn hàng thanh toán từ 25.000đ'));
  assert.ok(html.includes('id="yen-drinks-visit" href="#yen-ngoai-doi"'));
  assert.ok(html.includes("10.513739%2C107.346992"));
});
