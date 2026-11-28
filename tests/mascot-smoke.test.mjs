// Run without dependencies: node --test tests/mascot-smoke.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const html=readFileSync(new URL("../trang-chu.html",import.meta.url),"utf8");
const svg=readFileSync(new URL("../assets/cuc-yen/mascot.svg",import.meta.url),"utf8");
const spriteIds=new Set(Array.from(svg.matchAll(/<symbol id="(cuc-yen-[a-z-]+)"/g),m=>m[1]));
const sceneMatch=html.match(/const YEN_SCENE_ART=(\{[\s\S]*?\});\s*function renderYenScene\(/);
assert.ok(sceneMatch,"Hero scene data must be JSON and have a renderer");
const scenes=JSON.parse(sceneMatch[1]);
const expected=["alarm","cup","flight","flan","rain","magic","ufo","bubble","news","sleep",
  "toast","dog","menu","logo","serve","run","vacuum","clone","dj","skate"];

test("oil-paint character style is consistent across all 21 mascot variants",()=>{
  assert.ok(svg.includes('id="cy-cream-paint"'),"Missing cream brushstrokes");
  assert.ok(svg.includes('id="cy-caramel-paint"'),"Missing caramel brushstrokes");
  assert.ok(svg.includes('id="cy-scarf-paint"'),"Missing scarf brushstrokes");
  assert.ok(svg.includes('id="cy-soft-paint-shadow"'),"Missing sculpted shadow");
  assert.ok(svg.includes('id="cy-cream"')&&svg.includes('id="cy-caramel"')&&svg.includes('id="cy-moss"'));
  assert.ok(svg.includes('<g id="cy-torso" filter="url(#cy-soft-paint-shadow)">'));
  assert.ok(html.includes('<style id="cuc-yen-oil-style">'));
  assert.ok(html.includes('mask-image:radial-gradient'));
  assert.ok(!svg.includes('<symbol id="cuc-yen-wink" viewBox="0 0 320 320"><use href="#cuc-yen-cheeky"/><use href="#cy-clerk-cap"/>'));
});

test("one mascot source with regular and staff roles",()=>{
  assert.equal(spriteIds.size,21);
  for(const name of ["waving","happy","sleepy","surprised","clerk","clerk-ready","clerk-stamp","clerk-spin","clerk-win","barista"]){
    assert.ok(spriteIds.has("cuc-yen-"+name),"Missing mascot pose: "+name);
  }
});

test("permit office has no old mascot and the center-stage cinema uses canonical Cục Yên",()=>{
  const permit=html.slice(html.indexOf('<section class="section permit-section'),html.indexOf('<section class="section release-section'));
  assert.ok(!permit.includes('class="permit-clerk"'),"Obsolete stamp counter returned");
  assert.ok(!permit.includes('fill="#d5e4b0"'),"Old green inline character has returned");
  assert.ok(html.includes('class="yen-stamp-cinema-cuc"'),"Cục Yên must appear in the immersive stamp scene");
  assert.ok(html.includes('<use href="/assets/cuc-yen/mascot.svg#cuc-yen-clerk-ready"'),"Cục Yên must use its canonical model");
});

test("20 cutscenes use canonical mascot symbols and props",()=>{
  assert.deepEqual(Object.keys(scenes).sort(),expected.slice().sort());
  assert.ok(html.includes('const mascot=\'<image class="scene-cuc-model" href="\'+CUC_SPRITE+scene.pose+\'.webp"'));
  assert.ok(html.includes('const CUC_SPRITE="/assets/cuc-yen/sprites/";'));
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

test("all 20 scenes dramatize the story with a visual prop and distinct timing",()=>{
  assert.ok(html.includes('scene-story-detail'),"Scene detail layer missing");
  assert.ok(html.includes('+(scene.detail||"")'),"Scene details are not rendered");
  for(const [id,scene] of Object.entries(scenes)){
    assert.ok(typeof scene.story==="string"&&scene.story.length>35,id+" needs a narrative storyboard");
    assert.ok(typeof scene.detail==="string"&&scene.detail.includes("<"),id+" needs scenario-specific artwork");
    assert.ok(scene.motion.length>3&&html.includes('.scene-motion-'+scene.motion+'{animation-name:'),id+" needs an actor timeline");
    assert.ok(html.includes('[data-scene="'+id+'"] .story-')||id==="flight",id+" lacks prop/action animation");
  }
  assert.equal(scenes.run.pose,"back","Runner must show its backside");
  assert.equal((scenes.rain.back.match(/story-drop-\d/g)||[]).length,3,"Exactly 3 raindrops");
  assert.ok(scenes.flan.detail.includes("story-spoon"));
  assert.ok(scenes.skate.front.includes("story-cookie-board"));
  assert.ok(scenes.skate.detail.includes("story-banana-peel"));
  assert.ok(scenes.clone.front.includes("story-mini-3"));
  assert.ok(html.includes('const requestedScene=(new URLSearchParams(window.location.search)).get("cuc_scene")'));

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

// iOS WebKit drops gradients/patterns/clipPaths referenced through an external <use href="mascot.svg#…">,
// so Cục Yên's body painted transparent on iPhone. The homepage must draw the raster sprites instead.
test("homepage draws Cục Yên from raster sprites, never an external mascot.svg <use>",()=>{
  assert.ok(!html.includes("mascot.svg"),"External mascot.svg reference returned to the homepage");
  const refs=new Set(Array.from(html.matchAll(/\/assets\/cuc-yen\/sprites\/([a-z-]+)\.webp/g),m=>m[1]));
  const valid=html.match(/const valid=new Set\((\[[^\]]+\])\)/);
  for(const mood of JSON.parse(valid[1]))refs.add(mood);
  for(const scene of Object.values(scenes))refs.add(scene.pose);
  assert.ok(refs.size>=15,"Expected hero, wheel, preview, scene and reaction poses");
  for(const pose of refs){
    assert.ok(spriteIds.has("cuc-yen-"+pose),"Unknown pose: "+pose);
    assert.ok(existsSync(new URL("../assets/cuc-yen/sprites/"+pose+".webp",import.meta.url)),"Missing sprite: "+pose+".webp");
  }
});
