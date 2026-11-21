// Static visual staging only. The game engine owns choices, effects and day progression.
// Contact y is the ground/surface touched by the asset's FEET/BASE, not its center.
// All positions are percentages of the visible upper-half scene, NOT a full-page layout.
const A="/game/preview-2d/assets/";
const C="/lab/assets/sprites/collections/assets/coffee-tea/";
const S="/lab/assets/sprites/shared/";
const M="/assets/cuc-yen/sprites/";

export const VISUAL_ASSET_DIMENSIONS=Object.freeze({
 backdrop:[1586,992],counter:[768,195],staff:[1024,1280],guest:[1024,1280],
 mascot:[800,800],espresso:[256,262],tray:[367,161],pitcher:[207,190],
 tea:[249,177],menu:[274,212],paper:[83,91],wetFloor:[181,50]
});

export const VISUAL_ASSETS=Object.freeze({
  backdrop:"/lab/assets/room-backdrop.jpg",
  counter:A+"scene/counter-painted-v1.webp",
  staff:A+"sprites/barista.png",
  guest:A+"sprites/shipper.png", // provisional takeaway customer; no dedicated guest painting yet
  mascot:M+"front.webp",
  espresso:C+"v2-espresso-machine.webp",
  tray:C+"v2-serving-tray.webp",
  pitcher:C+"v2-milk-pitcher.webp",
  tea:C+"v2-glass-tea.webp",
  menu:C+"v2-menu-card.webp",
  paper:S+"paper-note.webp",
  wetFloor:S+"shadow.webp" // temporary painted shadow tinted blue, not finished water artwork
});

const layer=(id,role,asset,surface,x,y,size,depth,extra={})=>({
 id,role,asset,surface,contact:{x,y},size,depth,kind:extra.kind||"painted",
 footOffset:extra.footOffset??98,
 ...extra
});
const counter=(x,y,size)=>layer("counter","counter","counter","floor",x,y,size,28,{footOffset:100});
const employee=(x,y,size)=>layer("staff","staff","staff","floor",x,y,size,12,{kind:"sheet",frame:0,footOffset:94});
const guest=(x,y,size)=>layer("customer","customer","guest","floor",x,y,size,53,{kind:"sheet",frame:0,footOffset:94});
const yen=(x,y,size)=>layer("cuc-yen","mascot","mascot","floor",x,y,size,56,{footOffset:92});
const prop=(id,asset,surface,x,y,size,depth,extra={})=>layer(id,"prop",asset,surface,x,y,size,depth,extra);
const focus=(id,asset,surface,x,y,size,depth=42,extra={})=>layer(id,"focus",asset,surface,x,y,size,depth,extra);

export const SCENE_COMPOSITIONS=Object.freeze({
 "D01-01":{
  backdrop:"backdrop",
  focusId:"ticket-center",
  description:"Khách đang chờ trước quầy; nhân viên sau quầy, máy pha và ba phiếu order đặt trên quầy; Cục Yên đứng trên sàn",
  layers:[
   employee(41,71,20),
   counter(43,82,72),
   prop("espresso","espresso","counter",22,66,16,34,{footOffset:90}),
   focus("ticket-left","paper","counter",55,67,7.5,44,{rotation:-8}),
   focus("ticket-center","paper","counter",63,67,8.5,45,{rotation:3}),
   focus("ticket-right","paper","counter",71,67,7.5,44,{rotation:8}),
   prop("tray","tray","counter",75,66,8,35),
   guest(85,95,23),
   yen(12,96,21)
  ],
  outcomeChanges:{
    explain:{"ticket-left":{x:55,rotation:-2},"ticket-center":{x:63,rotation:0},"ticket-right":{x:71,rotation:2},"customer":{x:84,frame:1}},
    silent:{"ticket-center":{rotation:-1}},
    priority:{"ticket-left":{x:71},"ticket-right":{x:55},"customer":{x:82,frame:1}}
  }
 },
 "D01-02":{
  backdrop:"backdrop",
  focusId:"spill",
  description:"Bình nghiêng và sàn ướt ngay lối đi; nhân viên rời quầy, khách đi gần đó và Cục Yên đứng cạnh vũng nước",
  layers:[
   employee(40,93,21),
   counter(24,80,45),
   prop("espresso","espresso","counter",14,68,12,34,{footOffset:90}),
   focus("spill","wetFloor","floor",64,91,34,43,{footOffset:91,tint:"wet",rotation:-5}),
   focus("pitcher","pitcher","floor",63,84,14,45,{rotation:-42,footOffset:90}),
   guest(86,96,23),
   yen(47,96,21)
  ],
  outcomeChanges:{
    clean:{"spill":{state:"dry"},"pitcher":{rotation:0},"customer":{x:89,frame:1}},
    later:{"spill":{state:"wet-warning"},"customer":{x:90,frame:1}},
    open:{"spill":{state:"unsafe"},"customer":{x:80,frame:1}},
    recovered:{"spill":{state:"dry"},"pitcher":{rotation:0},"customer":{x:89,frame:1}}
  }
 },
 "D01-03":{
  backdrop:"backdrop",
  focusId:"receipt",
  description:"Máy pha và menu nằm trên quầy; giấy biên lai sai được đưa lên quầy; nhân viên đối diện khách, Cục Yên đứng trên sàn",
  layers:[
   employee(42,71,20),
   counter(43,82,72),
   prop("espresso","espresso","counter",20,66,15,34,{footOffset:90}),
   prop("menu","menu","counter",54,67,10,38,{rotation:-7}),
   focus("receipt","paper","counter",66,66,11,45,{rotation:7}),
   prop("tea","tea","counter",75,66,8,35),
   guest(84,95,23),
   yen(11,96,19)
  ],
  outcomeChanges:{
    refund:{"receipt":{state:"corrected",rotation:-2},"customer":{x:87,frame:1}},
    later:{"receipt":{state:"pending"},"customer":{x:84}},
    ignore:{"receipt":{state:"wrong"},"customer":{x:89,frame:1}}
  }
 }
});

export function getSceneComposition(id,outcome){
 const scene=SCENE_COMPOSITIONS[id];
 if(!scene)throw new Error("Unknown scene composition: "+id);
 const changes=scene.outcomeChanges[outcome]||{};
 const layers=scene.layers.map(source=>{
  const change=changes[source.id]||{};
  return {
   ...source,
   contact:{...source.contact,x:change.x??source.contact.x,y:change.y??source.contact.y},
   rotation:change.rotation??source.rotation??0,
   state:change.state||"",
   frame:change.frame??source.frame??0,
   src:VISUAL_ASSETS[source.asset]
  };
 });
 return {id,description:scene.description,background:VISUAL_ASSETS[scene.backdrop],focusId:scene.focusId,layers};
}

export function validateSceneComposition(id,scene=SCENE_COMPOSITIONS[id]){
 const errors=[];
 if(!scene){return["missing scene "+id];}
 const ids=new Set(), roles=new Map();
 const layers=scene.layers;
 if(!layers.length)errors.push("scene has no layers");
 for(const item of layers){
  if(ids.has(item.id))errors.push("duplicate id "+item.id);
  ids.add(item.id);roles.set(item.role,(roles.get(item.role)||0)+1);
  if(!VISUAL_ASSETS[item.asset])errors.push("missing source asset: "+item.id);
  if(!["floor","counter","table","held"].includes(item.surface))errors.push("unknown surface "+item.id);
  if(!Number.isFinite(item.size)||item.size<=0||item.size>(item.role==="counter"?85:45))errors.push("invalid size "+item.id);
  if(!Number.isFinite(item.depth))errors.push("depth required "+item.id);
  if(!Number.isFinite(item.contact.x)||item.contact.x<0||item.contact.x>100||
     !Number.isFinite(item.contact.y)||item.contact.y<0||item.contact.y>100)
    errors.push("invalid contact "+item.id);
  if(["staff","customer","mascot"].includes(item.role)&&item.surface!=="floor")errors.push("actor must stand on floor: "+item.id);
  if(["staff","customer","mascot"].includes(item.role)&&item.contact.y<(item.role==="staff"?68:80))errors.push("actor feet above floor: "+item.id);
  if(item.role==="staff"&&(item.depth>=28||item.contact.x>78))errors.push("staff not behind counter: "+item.id);
  if(item.role==="customer"&&item.depth<=28)errors.push("customer should be in front: "+item.id);
  if(item.role==="mascot"&&item.depth<=28)errors.push("Cuc Yen should stand in front on the floor: "+item.id);
  if(item.asset==="espresso"&&item.surface!=="counter")errors.push("espresso machine must be on counter: "+item.id);
  if(item.asset==="espresso"&&!(item.contact.y>=60&&item.contact.y<=70))errors.push("machine base not on countertop: "+item.id);
  if(item.asset==="espresso"&&Math.abs(item.footOffset/100-ESPRESSO_PAINTED_BASE_RATIO)>.005)
    errors.push("espresso must anchor at painted metal base, not transparent shadow: "+item.id);
  if(item.id==="spill"&&!(item.surface==="floor"&&item.contact.y>=76))errors.push("spill must be on the floor");
  if(item.kind==="sheet"&&!Number.isInteger(item.frame??0))errors.push("sheet frame invalid "+item.id);
 }
 const staff=layers.find(item=>item.role==="staff");
 const visitor=layers.find(item=>item.role==="customer");
 if(staff&&visitor&&staff.size>visitor.size*.92)
  errors.push("rear barista too large compared with foreground customer");
 for(const role of ["staff","customer","mascot","counter","focus"]){
  if(!roles.get(role))errors.push("missing "+role+" in "+id);
 }
 if(!ids.has(scene.focusId))errors.push("focal object not on stage");
 if(layers.some(x=>x.surface==="counter")&&!roles.has("counter"))errors.push("counter-top item without furniture");
 for(const [outcome,changes] of Object.entries(scene.outcomeChanges||{})){
  for(const [key,patch] of Object.entries(changes)){
   if(!ids.has(key))errors.push("outcome "+outcome+" targets missing layer "+key);
   if("y" in patch&&!(patch.y>=0&&patch.y<=100))errors.push("outcome y invalid for "+key);
  }
 }
 return errors;
}


// Projection with a physical tabletop, rather than guessing the machine's y%.
// The visible painted metal feet end around 90% of the espresso sprite height.
// Its transparent drop shadow extends lower; anchoring the outer image box left
// the machine visibly floating over the wooden countertop.
export const ESPRESSO_PAINTED_BASE_RATIO=0.90;
export const COUNTER_ASPECT_RATIO=195/768;
export function projectContact(layer,scene,stageWidth,stageHeight){
 const x=stageWidth*layer.contact.x/100;
 let y=stageHeight*layer.contact.y/100;
 if(layer.surface==="counter"){
  const furniture=scene.layers.find(item=>item.role==="counter");
  if(!furniture)throw new Error("Counter surface has no supporting counter");
  const h=stageWidth*(furniture.size/100)*COUNTER_ASPECT_RATIO;
  y=stageHeight*furniture.contact.y/100 - h*(furniture.footOffset/100);
 }
 return{x,y};
}
