import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  SCENE_COMPOSITIONS, VISUAL_ASSETS, getSceneComposition,
  projectContact, validateSceneComposition, actorSeparation, paintedActorFootprint, COUNTER_ASPECT_RATIO, COUNTER_PAINTED_SURFACE_INSET_RATIO, ESPRESSO_PAINTED_BASE_RATIO
} from "../tinh-huong/campaign/scene-composition.mjs";

const root=resolve(import.meta.dirname,"..");
const SIZES=[[320,240],[320,284],[360,320],[390,422],[768,512],[812,375],[1440,900]];

test("spatial skill and rule file exist for future agents and future 87 incidents",()=>{
 assert.ok(existsSync(resolve(root,".agents/skills/yen-visual-novel-staging/SKILL.md")));
 assert.ok(existsSync(resolve(root,"docs/visual-novel/SCENE-SPATIAL-RULES.md")));
 const rules=readFileSync(resolve(root,"docs/visual-novel/SCENE-SPATIAL-RULES.md"),"utf8");
 for(const key of ["D01-01","D01-02","D01-03","floor","counter","Cục Yên"])
  assert.ok(rules.includes(key),key);
});

test("each of three visual scenes has real actor and story roles on correct surfaces",()=>{
 assert.deepEqual(Object.keys(SCENE_COMPOSITIONS),["D01-01","D01-02","D01-03"]);
 for(const [id,scene] of Object.entries(SCENE_COMPOSITIONS)){
  assert.deepEqual(validateSceneComposition(id),[],id+" staging violations");
  const byRole=role=>scene.layers.filter(layer=>layer.role===role);
  assert.equal(byRole("staff").length,1);
  assert.equal(byRole("customer").length,1);
  assert.equal(byRole("mascot").length,1);
  assert.equal(byRole("counter").length,1);
  assert.ok(byRole("focus").length>=1);
  assert.ok(scene.layers.find(layer=>layer.id===scene.focusId)?.surface);
  const byId=Object.fromEntries(scene.layers.map(x=>[x.id,x]));
  assert.equal(byId.staff.kind,"sheet");
  assert.equal(byId.customer.kind,"sheet");
  assert.equal(byId.staff.asset,"staff");
  assert.equal(byId.customer.asset,"guest");
  assert.equal(byId["cuc-yen"].surface,"floor");
  assert.equal(byId.staff.surface,"floor");
  assert.equal(byId.customer.surface,"floor");
  if(id==="D01-02"){
   assert.ok(byId.staff.depth>byId.counter.depth,"spill-side staff must be in front of the counter to keep the face visible");
   assert.deepEqual(actorSeparation(scene),[],"no painted character silhouettes may collide");
   const splash=byId.spill;
   assert.equal(splash.asset,"wetFloor");
   assert.ok(splash.size>=20&&splash.size<=26);
   assert.equal(byId.pitcher.surface,"floor");
   assert.ok(byId.pitcher.contact.x>byId.staff.contact.x&&byId.pitcher.contact.x<byId.customer.contact.x);
   assert.ok(byId["cuc-yen"].contact.x<byId.staff.contact.x);
  } else {
   assert.ok(byId.staff.depth<byId.counter.depth,"staff must remain behind the service counter");
  }
  assert.ok(byId.customer.depth>byId.counter.depth,"customer must be in front of counter");
  assert.ok(byId["cuc-yen"].depth>byId.counter.depth,"Cục Yên must be foreground floor actor");
  assert.equal(byId.espresso.surface,"counter","espresso must not float or rest on floor");
  assert.ok(byId.staff.size<=byId.customer.size*.92,"rear staff must look smaller than the foreground visitor");
  assert.ok(Math.abs(byId.espresso.footOffset/100-ESPRESSO_PAINTED_BASE_RATIO)<.005,
    "visible metal feet, not shadow or image box, must meet the counter");
  if(id==="D01-01"||id==="D01-03"){
   assert.ok(byId.staff.contact.y>=68&&byId.staff.contact.y<=75,
     "barista should stand on the deeper floor plane behind the counter");
  }
 }
});

test("regression: large rear barista and shadow-bottom espresso are rejected",()=>{
 for(const id of ["D01-01","D01-02","D01-03"]){
  const large=structuredClone(SCENE_COMPOSITIONS[id]);
  const staff=large.layers.find(x=>x.id==="staff");
  const visitor=large.layers.find(x=>x.id==="customer");
  staff.size=visitor.size*1.2;
  assert.ok(validateSceneComposition(id,large).some(e=>e.includes("rear barista too large")),id);
  const floating=structuredClone(SCENE_COMPOSITIONS[id]);
  floating.layers.find(x=>x.id==="espresso").footOffset=98;
  assert.ok(validateSceneComposition(id,floating).some(e=>e.includes("painted metal base")),id);
 }
});

test("floor spill uses a genuine alpha WebP, not the rectangular shadow placeholder",()=>{
 const source=VISUAL_ASSETS.wetFloor;
 assert.equal(source,"/tinh-huong/campaign/assets/watercolor-floor-puddle.webp");
 const bytes=readFileSync(resolve(root,source.slice(1)));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.ok(bytes.length>2000,"watercolor scene art should not be a blank placeholder");
 const unsafe=getSceneComposition("D01-02","open"),safe=getSceneComposition("D01-02","clean");
 assert.equal(unsafe.layers.find(x=>x.id==="spill").state,"unsafe");
 assert.equal(safe.layers.find(x=>x.id==="spill").state,"dry");
});

test("side-by-side painted actor silhouettes remain separated after every D01-02 response",()=>{
 const scene=SCENE_COMPOSITIONS["D01-02"];
 for(const answer of ["","clean","later","open","recovered"]){
  const staged=getSceneComposition("D01-02",answer);
  assert.deepEqual(actorSeparation(staged),[],answer||"initial");
  for(const role of ["staff","customer","mascot"]){
   const actor=staged.layers.find(x=>x.role===role);
   const footprint=paintedActorFootprint(actor);
   assert.ok(footprint.left>=0&&footprint.right<=100,"painted body stays in frame: "+role);
  }
 }
});

test("role sprite sheet is a real 4×4 painted pack, not the full image onstage",()=>{
 for(const key of ["staff","guest"]){
  const path=resolve(root,VISUAL_ASSETS[key].slice(1));
  const b=readFileSync(path);
  assert.equal(b.toString("ascii",1,4),"PNG");
  assert.equal(b.readUInt32BE(16),1024,key+" width");
  assert.equal(b.readUInt32BE(20),1280,key+" height");
 }
 for(const id of Object.keys(SCENE_COMPOSITIONS)){
  const scene=getSceneComposition(id);
  const actors=scene.layers.filter(x=>x.kind==="sheet");
  assert.equal(actors.length,2);
  assert.ok(actors.every(x=>x.frame===0||x.frame===1));
 }
});

test("all sources actually exist in repository, with no remote runtime image dependencies",()=>{
 for(const [id,src] of Object.entries(VISUAL_ASSETS)){
  assert.match(src,/^\//);
  assert.ok(/\.(webp|png|jpg)$/i.test(src),id);
  assert.equal(existsSync(resolve(root,src.slice(1))),true,src);
 }
});

test("countertop projection uses the painted wooden surface inset, not the image bounding top",()=>{
 for(const id of Object.keys(SCENE_COMPOSITIONS)){
  const scene=getSceneComposition(id);
  const counter=scene.layers.find(x=>x.id==="counter");
  const machine=scene.layers.find(x=>x.id==="espresso");
  for(const [width,height] of SIZES){
   const result=projectContact(machine,scene,width,height);
   const counterHeight=width*counter.size/100*COUNTER_ASPECT_RATIO;
   const physicalTop=height*counter.contact.y/100-counterHeight*counter.footOffset/100;
   const woodenSurfaceY=physicalTop+counterHeight*COUNTER_PAINTED_SURFACE_INSET_RATIO;
   assert.ok(Math.abs(result.y-woodenSurfaceY)<.01,id+" "+width+"x"+height);
   assert.ok(result.y>physicalTop+counterHeight*.10,"contact must reach the painted wood lip");
   assert.ok(result.y>height*.25,result.y);
   assert.ok(result.y<height*.78,result.y);
   const staff=scene.layers.find(x=>x.role==="staff");
   const staffFoot=projectContact(staff,scene,width,height);
   assert.equal(staffFoot.y,height*staff.contact.y/100);
   assert.ok(staffFoot.y>physicalTop,"staff shoes are behind counter");
   const guest=scene.layers.find(x=>x.role==="customer");
   assert.ok(projectContact(guest,scene,width,height).y>physicalTop);
  }
 }
});

test("spill stays on the floor and dries only when the choice or recovery resolves the hazard",()=>{
 const before=getSceneComposition("D01-02");
 const safe=getSceneComposition("D01-02","clean");
 const unsafe=getSceneComposition("D01-02","open");
 const warning=getSceneComposition("D01-02","later");
 const repaired=getSceneComposition("D01-02","recovered");
 const find=(x,id)=>x.layers.find(y=>y.id===id);
 assert.equal(find(before,"spill").surface,"floor");
 assert.ok(find(before,"spill").contact.y>=80);
 assert.equal(find(safe,"spill").state,"dry");
 assert.equal(find(repaired,"spill").state,"dry");
 assert.equal(find(unsafe,"spill").state,"unsafe");
 assert.equal(find(warning,"spill").state,"wet-warning");
 assert.notEqual(find(safe,"pitcher").rotation,find(before,"pitcher").rotation);
 assert.ok(find(unsafe,"customer").contact.x<find(before,"customer").contact.x);
 assert.equal(find(before,"spill").state,"","the prior scene must not mutate");
});

test("focal objects change under decisions and never jump surfaces",()=>{
 for(const [id,scene] of Object.entries(SCENE_COMPOSITIONS)){
  const initial=getSceneComposition(id);
  const focus=initial.layers.find(x=>x.id===scene.focusId);
  assert.equal(focus.role,"focus");
  for(const [choice,patches] of Object.entries(scene.outcomeChanges)){
   const staged=getSceneComposition(id,choice);
   assert.equal(staged.layers.length,initial.layers.length);
   for(const [key,patch] of Object.entries(patches)){
    const original=initial.layers.find(x=>x.id===key),changed=staged.layers.find(x=>x.id===key);
    assert.equal(changed.surface,original.surface,key+" jumped physical surface");
    assert.ok(Object.keys(patch).some(field=>["x","rotation","state","frame"].includes(field)),key);
   }
  }
 }
});

test("contract detects floating actors and a coffee machine placed on the floor",()=>{
 const original=SCENE_COMPOSITIONS["D01-01"];
 const clone=()=>structuredClone(original);
 const one=clone();one.layers.find(x=>x.id==="cuc-yen").surface="counter";
 assert.ok(validateSceneComposition("D01-01",one).some(e=>/actor must stand on floor/.test(e)));
 const two=clone();two.layers.find(x=>x.id==="espresso").surface="floor";
 assert.ok(validateSceneComposition("D01-01",two).some(e=>/espresso machine must be on counter/.test(e)));
 const three=clone();three.layers.find(x=>x.role==="staff").contact.y=40;
 assert.ok(validateSceneComposition("D01-01",three).some(e=>/feet above floor/.test(e)));
 const four=clone();four.layers= four.layers.filter(x=>x.id!=="counter");
 assert.ok(validateSceneComposition("D01-01",four).some(e=>/missing counter|without furniture/.test(e)));
});
