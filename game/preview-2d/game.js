/* Yencafeday 2D: layered architecture and depth-sorted interactive prop sprites.
 * Phaser uses independent reviewed painterly raster prop textures and PNG actor sheets.
 * No login, storage, tracking or real currency.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const roles={
 barista:{name:'Pha chế',power:'Bàn tay vàng',tasks:[
  {at:'counter',title:'Pha ly cà phê đầu ca',detail:'Đến quầy và pha ly nước đầu tiên.'},
  {at:'plant',title:'Chăm chậu cây cạnh cửa',detail:'Tưới cây trước khi khách tới.'},
  {at:'counter',title:'Hoàn thành món đặc biệt',detail:'Quay về quầy để hoàn thiện ly nước.'}]},
 waiter:{name:'Phục vụ',power:'Một tay năm ly',tasks:[
  {at:'table',title:'Dọn bàn khách',detail:'Sắp lại bàn và ly nước.'},
  {at:'counter',title:'Nhận khay nước',detail:'Đến quầy lấy nước.'},
  {at:'bench',title:'Mang nước tới ghế dài',detail:'Phục vụ khu ghế ngồi.'}]},
 shipper:{name:'Shipper',power:'Giao nhanh một chút',tasks:[
  {at:'counter',title:'Nhận đơn nước',detail:'Đến quầy nhận nước mang đi.'},
  {at:'bike',title:'Kiểm tra xe',detail:'Sắp xếp xe trước khi giao.'},
  {at:'door',title:'Giao đúng khách',detail:'Đến lối vào giao đơn nước.'}]},
 guard:{name:'Bảo vệ',power:'Ánh mắt giữ yên',tasks:[
  {at:'door',title:'Kiểm tra lối vào',detail:'Đón khách vào quán.'},
  {at:'table',title:'Giúp khách chọn chỗ',detail:'Hướng dẫn khách tới bàn.'},
  {at:'bench',title:'Kiểm tra lối đi',detail:'Giữ lối đi quanh ghế dài thông thoáng.'}]},
 cat:{name:'Mèo cổ vũ',power:'Meo chữa lành',tasks:[
  {at:'plant',title:'Vươn vai cạnh cây',detail:'Đến góc cây để khởi động.'},
  {at:'table',title:'Ghép nhóm với khách',detail:'Tới gần bàn và kêu meo.'},
  {at:'bench',title:'Nằm nghỉ đúng chỗ',detail:'Đến ghế dài, hoàn thành ca của mèo.'}]}
};
// Bottom-centre sprite pivots: proportions follow one shared 1440x900 world.
const SCENE_PROPS=[
 {id:'door',texture:'door-painted',raster:'./assets/scene/door-painted-v1.webp',x:550,y:606,w:215,h:355,shadow:[77,12]},
 {id:'counter',texture:'counter-painted',raster:'./assets/scene/counter-painted-v1.webp',x:1120,y:610,w:360,h:91,shadow:[160,12],layers:{width:768,height:195,frontStart:41,backDepth:500}},
 {id:'table',texture:'table-painted',raster:'./assets/scene/table-painted-v1.webp',x:355,y:723,w:140,h:86,shadow:[61,10]},
 {id:'bench',texture:'bench-painted',raster:'./assets/scene/bench-painted-v1.webp',x:1220,y:751,w:310,h:213,shadow:[132,18],layers:{width:652,height:430,frontStart:252,backDepth:675}},
 {id:'plant',texture:'plant-painted',raster:'./assets/scene/plant-painted-v1.webp',x:110,y:668,w:158,h:217,shadow:[33,10]},
 {id:'bike',texture:'scooter-painted',raster:'./assets/scene/scooter-painted-v1.webp',x:1360,y:836,w:188,h:207,shadow:[75,12]}
];
const SCENE_COLLIDERS=[
 {id:'counter',shape:'rect',l:940,t:560,r:1300,b:610},
 {id:'table',shape:'ellipse',x:355,y:704,rx:65,ry:28},
 {id:'bench',shape:'rect',l:1104,t:662,r:1372,b:752},
 {id:'bike',shape:'ellipse',x:1360,y:817,rx:72,ry:18},
 {id:'plant',shape:'ellipse',x:110,y:653,rx:30,ry:17}
];
const stations={
 door:{x:535,y:700,label:'Lối vào'},
 counter:{x:990,y:652,label:'Quầy pha chế'},
 table:{x:440,y:744,label:'Bàn khách'},
 bike:{x:1283,y:809,label:'Xe giao hàng'},
 bench:{x:1040,y:768,label:'Ghế dài'},
 plant:{x:190,y:613,label:'Chậu cây'}
};
const npcs=[
 {id:'reader',role:'reader',x:520,y:650,name:'Khách đọc sách',lines:['Mình vừa đọc tới chương... cái bìa.','Một trang sách và một ly nước. Tạm đủ.']},
 {id:'guest',role:'guest',x:690,y:605,name:'Khách chờ bạn',lines:['Bạn mình bảo năm phút nữa tới.','Mình gọi trước một ly. Kẻ đến sau tự tính.']},
 {id:'guard',role:'guard',x:535,y:714,name:'Chú bảo vệ',lines:['Để xe ngay ngắn là quán đã yên một nửa.','Mèo Mướp trông ghế, tôi trông cửa.']},
 {id:'barista',role:'barista',x:995,y:570,name:'Bạn pha chế',lines:['Nước ngon cần chút kiên nhẫn.','Máy pha cà phê hôm nay khá dễ bảo.']},
 {id:'waiter',role:'waiter',x:817,y:647,name:'Bạn phục vụ',lines:['Ngồi đâu cũng được, trừ quầy pha chế.','Để mình dọn lại bàn nhé.']},
 {id:'cat',role:'cat',x:613,y:802,name:'Mèo Mướp',lines:['Meo. (Mướp vừa đồng ý.)','Meo. (Mướp vừa đổi ý.)']}
];
// NPC routes remain on the walkable floor, with deliberate pauses at each stop.
const NPC_ROUTINES={
 reader:[{x:520,y:650,wait:9,action:true,activity:'Đang nghỉ cạnh bàn sách',destination:'bàn sách'},
  {x:618,y:745,wait:5,activity:'Đang đi dạo một chút',destination:'lối đi'},
  {x:520,y:650,wait:11,action:true,activity:'Vừa quay lại bàn sách',destination:'bàn sách'}],
 guest:[{x:690,y:605,wait:5,activity:'Đang chờ bạn ở gần quầy',destination:'gần quầy'},
  {x:751,y:701,wait:7,action:true,activity:'Đang nhìn ra lối vào',destination:'lối vào'},
  {x:690,y:605,wait:4,activity:'Đang chờ bạn quay lại',destination:'gần quầy'}],
 guard:[{x:535,y:714,wait:6,action:true,activity:'Đang đón khách',destination:'cửa quán'},
  {x:620,y:760,wait:4,activity:'Đang kiểm tra lối đi',destination:'lối đi'},
  {x:540,y:718,wait:7,action:true,activity:'Đã quay lại cửa quán',destination:'cửa quán'}],
 barista:[{x:995,y:570,wait:7,action:true,activity:'Đang trực quầy pha chế',destination:'quầy pha chế'}],
 waiter:[{x:817,y:647,wait:4,action:true,activity:'Đang chờ nước từ quầy',destination:'quầy nước'},
  {x:932,y:729,wait:5,action:true,activity:'Đang kiểm tra khu ghế ngồi',destination:'khu ghế ngồi'},
  {x:815,y:650,wait:6,activity:'Đang chờ lượt phục vụ tiếp theo',destination:'quầy nước'}],
 cat:[{x:613,y:802,wait:8,action:true,activity:'Đang canh chiếc ghế trống',destination:'góc nghỉ'},
  {x:714,y:803,wait:5,activity:'Đang khám phá lối đi',destination:'lối đi'},
  {x:613,y:802,wait:9,action:true,activity:'Vừa quay về góc quen',destination:'góc nghỉ'}]
};
const NPC_SPEED={reader:66,guest:59,guard:74,barista:0,waiter:82,cat:52};
const NPC_TALK_SECONDS=4.5;
function npcActivity(id){
 const route=NPC_ROUTINES[id],runtime=world?.npcStates.get(id);
 if(!route?.length||!runtime)return '';
 const stopped=runtime.wait>0||runtime.action>0||route.length===1;
 return stopped?route[runtime.stop].activity:
  'Đang đi tới '+route[(runtime.stop+1)%route.length].destination;
}
const propDialog={
 door:['Bạn chỉnh lại bảng ở lối vào.','Bảng cửa đã ngay ngắn.'],
 counter:['Máy pha bật đèn và bắt đầu chạy.','Máy pha được nghỉ vài giây.'],
 table:['Bạn dọn chiếc ly trống.','Một chiếc ly lại được đặt lên bàn.'],
 bike:['Bạn kiểm tra xe giao nước.','Đèn xe tắt. Xe cũng được nghỉ.'],
 bench:['Chiếc gối được chỉnh ngay ngắn.','Bạn đặt chiếc gối về vị trí cũ.'],
 plant:['Bạn tưới cây. Cây không nói gì.','Bạn kiểm tra chậu cây lần nữa.']
};
const DAYS=['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy','Chủ Nhật'];
const state={
 role:'barista',day:1,phase:'explore',done:0,elapsed:0,efficiency:50,peace:70,
 coins:2450,energy:100,active:null,powerCooldown:0,sprint:0,shield:false,
 quick:false,nextEvent:38,messageLeft:0,dialogues:{},props:{},history:[],
 inventory:['Ly nước của Yên','Cuốn sổ nhỏ','Một chiếc khăn sạch'],
 selectedPreview:'barista',animation:'idle',mute:false
};
let world=null,phaserGame=null,elapsedUI=0,activeModal='preview';
let focusBeforeModal=null;
let touch={x:0,y:0,pointer:null};
const heldKeys=new Set();
let interacting=false;
const assetUrl=(role,view='front')=>'./assets/'+role+(role==='cat'||view==='front'?'':'-'+(view==='back'?'back':'side'))+'.svg';

const SPRITE_ROLES=['barista','waiter','shipper','guard','cat'];
const spriteRole=role=>SPRITE_ROLES.includes(role)?role:(role==='reader'?'waiter':'shipper');
const sheetUrl=role=>'./assets/sprites/'+spriteRole(role)+'.png';
const CLIPS={
 'idle-down':{frames:[0,1],fps:3},
 'walk-down':{frames:[2,3,2,1],fps:8},
 'idle-right':{frames:[4,5],fps:3},
 'walk-right':{frames:[6,7,6,5],fps:8},
 'idle-up':{frames:[8,9],fps:3},
 'walk-up':{frames:[10,11,10,9],fps:8},
 'interact':{frames:[12,13,14,15],fps:6,once:true}
};
let previewTick=0;
function paintSpriteFrame(node,role,index,mirror=false){
 if(!node)return;
 const col=index%4,row=Math.floor(index/4);
 node.style.backgroundImage='url("'+sheetUrl(role)+'")';
 node.style.backgroundSize='400% 400%';
 node.style.backgroundPosition=(col*100/3)+'% '+(row*100/3)+'%';
 node.style.transform=mirror?'scaleX(-1)':'';
 node.dataset.frame=String(index);
}
function paintPreview(){
 const role=state.selectedPreview;
 if(!role)return;
 const t=previewTick++;
 const mode=state.animation;
 for(const [view,dir] of Object.entries({front:'down',right:'right',back:'up',left:'right'})){
  const clip=mode==='interact'&&view==='front'?CLIPS.interact:CLIPS[(mode==='walk'?'walk':'idle')+'-'+dir];
  paintSpriteFrame($('pose-'+view),role,clip.frames[t%clip.frames.length],view==='left');
 }
 const film=$('animation-film').querySelectorAll('.sprite-frame');
 const sequence=mode==='interact'?[12,13,14,15,14,12]:
    mode==='walk'?[2,3,6,7,10,11]:[0,1,4,5,8,9];
 film.forEach((element,index)=>paintSpriteFrame(element,role,sequence[(index+t)%sequence.length]));
}
function setUpSpriteThumbnails(){
 for(const el of document.querySelectorAll('[data-thumb]'))paintSpriteFrame(el,el.dataset.thumb,0);
}
function createRoleAnimations(scene,role){
 for(const [suffix,def] of Object.entries(CLIPS)){
  const key=role+'-'+suffix;
  if(scene.anims.exists(key))continue;
  scene.anims.create({key,frames:def.frames.map(frame=>({key:role,frame})),
    frameRate:def.fps,repeat:def.once?0:-1});
 }
}
function playDirectional(sprite,role,direction,moving=false){
 if(!sprite||!sprite.anims)return;
 const dir=direction==='up'?'up':direction==='left'||direction==='right'?'right':'down';
 const key=role+'-'+(moving?'walk':'idle')+'-'+dir;
 sprite.setFlipX(direction==='left');
 if(sprite.anims.currentAnim?.key!==key||!sprite.anims.isPlaying)sprite.play(key,true);
}

const clockText=seconds=>{
 const total=Math.max(0,Math.floor(seconds));
 return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
};
function gameTime(){
 // A game day starts 08:30; every 5 real seconds advances 1 in-game minute.
 const m=510+Math.floor(state.elapsed/5);
 return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}
function modal(name){
 if(name){
  if(!activeModal)focusBeforeModal=document.activeElement;
  resetInput();
 }
 activeModal=name;
 $('overlay').hidden=!name;
 $('overlay').setAttribute('aria-hidden',String(!name));
 $('model-modal').hidden=name!=='preview';
 $('info-modal').hidden=name!=='info';
 $('result-modal').hidden=name!=='result';
 if(name==='preview'){
   const allowed=state.phase==='explore';
   $('apply-model').disabled=!allowed;
   $('apply-model').textContent=allowed?'Vào quán với vai này':'Đổi vai khi đang khám phá';
 }
 // Pause game movement while inspecting menus, keep environment alive.
 if(name==='preview')$('close-modal').focus();
 else if(name==='info')$('close-info').focus();
 else if(name==='result')$('next-day').focus();
 else {focusBeforeModal?.focus();focusBeforeModal=null;}
}
function addLog(message) {
 state.history.unshift({day:state.day,time:gameTime(),text:message});
 if(state.history.length>40)state.history.pop();
}
function speech(message,seconds=3.2){
 $('dialogue').textContent=message;
 $('dialogue').hidden=false;
 state.messageLeft=seconds;
}
function hideSpeech(){$('dialogue').hidden=true;state.messageLeft=0;}
function setRole(role){
 if(!roles[role])return;
 state.role=role;
 world?.setPlayerRole(role);
 $('role-label').textContent=roles[role].name;
 updateUI();
}
function selectPreviewRole(role){
 if(!roles[role])return;
 state.selectedPreview=role;previewTick=0;
 for(const btn of document.querySelectorAll('.role-option')){
  const selected=btn.dataset.role===role;
  btn.classList.toggle('selected',selected);
  btn.setAttribute('aria-selected',String(selected));
 }
 $('model-turnaround').dataset.animation=state.animation;
 $('animation-film').dataset.animation=state.animation;
 const descriptions={barista:'Pha vài ly nước, chăm chậu cây, rồi nghỉ một chút.',
  waiter:'Dọn bàn, nhận nước và ghé khu ghế ngồi.',shipper:'Nhận đơn, kiểm tra xe và giao nước ở cửa quán.',
  guard:'Đón khách, chọn chỗ ngồi và giữ lối đi thông thoáng.',cat:'Đi dạo, ghé thăm mọi người và meo một tiếng.'};
 $('model-note').textContent=descriptions[role];
 paintPreview();
}
function selectAnimation(animation){
 if(!['idle','walk','interact'].includes(animation))return;
 state.animation=animation;previewTick=0;
 $('model-turnaround').dataset.animation=animation;
 $('animation-film').dataset.animation=animation;
 for(const btn of document.querySelectorAll('[data-animation]')){
  const on=btn.dataset.animation===animation;
  btn.classList.toggle('active',on);
  btn.setAttribute('aria-pressed',String(on));
 }
 paintPreview();
}
function updateUI(){
 const label='NGÀY '+String(state.day).padStart(2,'0');
 $('top-day').textContent='Ngày '+state.day+' · '+DAYS[(state.day-1)%7];
 $('top-time').textContent=gameTime();
 $('top-coins').textContent=state.coins.toLocaleString('vi-VN');
 $('top-hearts').textContent=String(Math.round(state.peace));
 $('top-energy').textContent=Math.round(state.energy)+'/100';
 $('phase-label').textContent=label+' · '+({explore:'TRƯỚC CA',shift:'ĐANG LÀM VIỆC',ready:'ĐÃ XONG VIỆC',result:'KẾT CA'}[state.phase]||'KHÁM PHÁ');
 $('role-label').textContent=roles[state.role].name;
 $('objective-badge').textContent=state.done+'/3';
 $('start-shift').disabled=state.phase!=='explore';
 $('finish-shift').disabled=state.phase!=='ready';
 $('power').disabled=state.phase!=='shift'||state.powerCooldown>0;
 $('interact').disabled=!world||!nearbyCandidate()||Boolean(state.active)||Boolean(activeModal);
}
function task(){return roles[state.role].tasks[state.done];}
function resetDay(){
 state.done=0;state.elapsed=0;state.efficiency=50;state.peace=70;state.energy=100;
 state.active=null;state.powerCooldown=0;state.sprint=0;state.shield=false;
 state.quick=false;state.nextEvent=38;state.props={};
 state.dialogues={};hideSpeech();
 world?.resetWorld();
 updateMarker();
 updateUI();
}
function startShift(){
 if(activeModal)modal(null);
 if(state.phase!=='explore')return;
 state.phase='shift';
 resetDay();
 addLog('Bắt đầu ca '+roles[state.role].name+'.');
 speech('Bắt đầu ca. Không có đồng hồ đếm ngược, bạn cứ từ từ.',4);
 updateUI();
}
function finishShift(){
 if(state.phase!=='ready')return;
 state.phase='result';
 state.coins+=Math.round(250+state.efficiency*5);
 addLog('Kết thúc ca, hoàn thành 3/3 việc.');
 $('result-day').textContent='NGÀY '+String(state.day).padStart(2,'0')+' · BIÊN BẢN CA';
 $('result-summary').textContent='Bạn đã xong ca '+roles[state.role].name.toLowerCase()+'. Quán vẫn sáng đèn, ngày mai lại có chuyện.';
 $('result-tasks').textContent=state.done+'/3';
 $('result-time').textContent=clockText(state.elapsed);
 $('result-peace').textContent=Math.round(state.peace)+'%';
 updateUI();modal('result');
}
function nextDay(){
 if(state.phase!=='result')return;
 state.day++;state.phase='explore';
 resetDay();modal(null);
 addLog('Quán mở cửa ngày '+state.day+'.');
 speech('Ngày mới ở Yên. Bạn cứ đi dạo trước, rồi làm việc sau.',4);
}
function nearbyCandidate(){
 if(!world?.player||!['explore','shift','ready'].includes(state.phase)||state.active)return null;
 const {x,y}=world.player;
 let best=null;
 for(const person of npcs){
   const actor=world.sprites.get(person.id);
   const px=actor?.x??person.x,py=actor?.y??person.y;
   const dist=Math.hypot(x-px,y-py);
   if(dist<130&&(!best||dist<best.dist))best={kind:'npc',name:person.name,id:person.id,x:px,y:py,dist};
 }
 for(const [id,p] of Object.entries(stations)){
   const dist=Math.hypot(x-p.x,y-p.y);
   if(dist<135&&(!best||dist<best.dist))best={kind:'prop',name:p.label,id,x:p.x,y:p.y,dist};
 }
 if(state.phase==='shift'&&state.done<3){
   const t=task(),p=stations[t.at],dist=Math.hypot(x-p.x,y-p.y);
   if(dist<150&&(!best||dist<=best.dist+36))
     best={kind:'task',name:t.title,id:t.at,x:p.x,y:p.y,dist};
 }
 return best;
}
function updateMarker(){
 if(!world?.marker)return;
 if(state.phase==='shift'&&!state.active&&task()){
   const p=stations[task().at];
   world.marker.setPosition(p.x,p.y+15).setVisible(true);
 }else world.marker.setVisible(false);
}
function interact(){
 if(activeModal||state.active)return;
 const nearby=nearbyCandidate();
 if(!nearby)return;
 world?.react();
 if(nearby.kind==='task'){
   world?.reactProp(nearby.id,1);
   state.active={elapsed:0,duration:state.quick?.6:2.1,task:task().title,at:nearby.id};
   state.quick=false;
   updateMarker();
   speech('Đang làm: '+state.active.task,2);
 }else if(nearby.kind==='npc'){
   const context=npcActivity(nearby.id);
   world?.reactNPC(nearby.id);
   const npc=npcs.find(n=>n.id===nearby.id);
   const idx=state.dialogues[nearby.id]||0;
   state.dialogues[nearby.id]=idx+1;
   const line=npc.name+(context?' · '+context:'')+': '+npc.lines[idx%npc.lines.length];
   speech(line,NPC_TALK_SECONDS);addLog('Nói chuyện với '+npc.name+'.');
   state.peace=clamp(state.peace+1,0,100);
 }else{
   const n=state.props[nearby.id]||0;
   state.props[nearby.id]=1-n;
   const line=propDialog[nearby.id][n];
   speech(line,3.4);addLog(line);
   world?.reactProp(nearby.id,n?0:1);
 }
 updateUI();
}
function finishAction(){
 if(state.phase!=='shift'||!state.active)return;
 const name=state.active.task;
 // Keep completed furniture changes until the next interaction or day reset.
 const at=state.active.at;
 if(at==='table'||at==='bench')state.props[at]=1;
 else world?.reactProp(at,0);
 state.active=null;state.done++;
 state.energy=clamp(state.energy-10,0,100);
 state.peace=clamp(state.peace+5,0,100);
 state.efficiency=clamp(state.efficiency+14,0,100);
 addLog('Hoàn thành: '+name+'.');
 if(state.done>=3){state.phase='ready';speech('Ba việc đã hoàn tất. Tự kết thúc ca khi bạn muốn.',4.6);}
 else speech('Xong một việc. Bạn có thể đi dạo trước việc tiếp theo.',3.3);
 updateMarker();updateUI();
}
function usePower(){
 if(activeModal||state.phase!=='shift'||state.powerCooldown>0)return;
 state.powerCooldown=25;
 switch(state.role){
  case 'barista':state.quick=true;speech('Bàn tay vàng: làm việc kế tiếp nhanh hơn.',3);break;
  case 'waiter':state.peace=clamp(state.peace+10,0,100);speech('Một tay năm ly: ai cũng đỡ bận.',3);break;
  case 'shipper':state.sprint=10;speech('Giao nước thần tốc. Nhưng đừng làm đổ nhé.',3);break;
  case 'guard':state.shield=true;state.peace=clamp(state.peace+7,0,100);speech('Ánh mắt bảo vệ: quán yên hơn.',3);break;
  case 'cat':state.peace=clamp(state.peace+18,0,100);speech('Meo. Mọi người đều thấy nhẹ lòng.',3);break;
 }
 addLog('Sử dụng kỹ năng '+roles[state.role].power+'.');
 updateUI();
}
function tick(dt){
 if(activeModal)return;
 if(state.phase==='shift'||state.phase==='ready')state.elapsed+=dt;
 if(state.phase==='shift'){
   state.powerCooldown=Math.max(0,state.powerCooldown-dt);
   state.sprint=Math.max(0,state.sprint-dt);
   if(state.elapsed>state.nextEvent){
     state.nextEvent+=38;
     if(state.shield){state.shield=false;speech('Chú bảo vệ đã ngăn một sự cố nhỏ.',3);}
     else{state.peace=clamp(state.peace-6,0,100);speech('Một khách vừa đổi món. Bình thường thôi.',3);}
   }
 }
 if(state.active){
   state.active.elapsed+=dt;
   if(state.active.elapsed>=state.active.duration)finishAction();
 }
 if(state.messageLeft>0){
  state.messageLeft-=dt;
  if(state.messageLeft<=0)hideSpeech();
 }
}
function blocked(x,y){
 // Collision checks physical sprite footprints, not colors in a painted image.
 return SCENE_COLLIDERS.some(c=>c.shape==='rect'
  ?x>c.l&&x<c.r&&y>c.t&&y<c.b
  :((x-c.x)/c.rx)**2+((y-c.y)/c.ry)**2<1);
}
function renderInfo(kind){
 const title={objective:'Việc trong ca',journal:'Nhật ký ở Yên',bag:'Túi đồ',settings:'Cách chơi'}[kind];
 $('info-title').textContent=title||'Quán Yên';
 const body=$('info-body');
 body.replaceChildren();
 const add=(tag,txt,cls)=>{
  const node=document.createElement(tag);node.textContent=txt;if(cls)node.className=cls;body.append(node);return node;
 };
 $('info-action').hidden=true;
 if(kind==='objective'){
   $('info-intro').textContent='Một ngày có ba việc, không giới hạn thời gian.';
   if(state.phase==='explore'){
     add('h3','Cứ đi chơi trước, làm sau.');
     add('p','Bạn có thể đi lại và trò chuyện trước khi bắt đầu ca.');
     $('info-action').hidden=false;$('info-action').textContent='Bắt đầu ca';
   }else if(state.phase==='ready'){
     add('h3','Xong cả ba việc.');
     add('p','Kết ca khi bạn muốn. Không có ai bấm đồng hồ đếm ngược.');
     $('info-action').hidden=false;$('info-action').textContent='Kết thúc ca';
   }else if(state.phase==='shift'){
     add('h3','Ca '+roles[state.role].name+' · '+state.done+'/3 việc');
     for(const [i,t]of roles[state.role].tasks.entries())
       add('p',(i<state.done?'✓ ':i===state.done?'→ ':'○ ')+t.title+' · '+t.detail,i<state.done?'task-complete':'');
   }else add('p','Đang xem kết quả ca.');
 }else if(kind==='journal'){
   $('info-intro').textContent='Ghi chú trong phiên chơi này, không lưu trên máy chủ.';
   if(!state.history.length)add('p','Ngày đầu tiên chưa có gì để ghi. Cứ đi dạo một vòng.');
   for(const item of state.history.slice(0,18))
     add('p','Ngày '+item.day+' · '+item.time+' · '+item.text);
 }else if(kind==='bag'){
   $('info-intro').textContent='Những món đồ nhỏ luôn có sẵn trong game.';
   for(const item of state.inventory)add('p','▤  '+item);
   add('p','Túi đồ là mô phỏng. Không có vật phẩm đổi quà thật.');
 }else{
   $('info-intro').textContent='Bản 2D đang thử nghiệm.';
   add('h3','Cách chơi');
   add('p','WASD hoặc phím mũi tên: đi lại. E: tương tác. Q: kỹ năng khi vào ca.');
   add('p','Bạn có thể khám phá trước ca, làm ba việc nhỏ, rồi tự chọn lúc kết ca và sang ngày mới.');
 }
 modal('info');
}
function resetStick(){
 const previous=touch.pointer;
 touch.x=touch.y=0;touch.pointer=null;$('thumb').style.transform='translate(0,0)';
 const area=$('stick');
 if(previous!==null&&area.hasPointerCapture?.(previous))area.releasePointerCapture(previous);
}
function resetInput(){
 heldKeys.clear();resetStick();
 world?.input?.keyboard?.resetKeys?.();
}
function trapModalFocus(event){
 const panel=$(activeModal==='preview'?'model-modal':activeModal==='info'?'info-modal':'result-modal');
 const buttons=[...panel.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')]
  .filter(node=>node.getClientRects().length>0);
 if(!buttons.length)return;
 const first=buttons[0],last=buttons[buttons.length-1],outside=!panel.contains(document.activeElement);
 if(event.shiftKey&&(document.activeElement===first||outside)){
  event.preventDefault();last.focus();
 }else if(!event.shiftKey&&(document.activeElement===last||outside)){
  event.preventDefault();first.focus();
 }
}
function bindStick(){
 const area=$('stick'),ring=area.querySelector('.stick-ring');
 const move=e=>{
   const rect=ring.getBoundingClientRect();
   const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);
   const mag=Math.max(1,Math.hypot(dx,dy)),v=Math.min(1,mag/38);
   touch.x=dx/mag*v;touch.y=dy/mag*v;
   $('thumb').style.transform='translate('+Math.round(touch.x*29)+'px,'+Math.round(touch.y*29)+'px)';
 };
 area.addEventListener('pointerdown',e=>{
   if(activeModal||touch.pointer!==null)return;
   touch.pointer=e.pointerId;area.setPointerCapture?.(e.pointerId);move(e);e.preventDefault();
 });
 area.addEventListener('pointermove',e=>{if(touch.pointer===e.pointerId)move(e)});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])
   area.addEventListener(event,e=>{if(touch.pointer===e.pointerId)resetStick()});
}
class CafeScene extends Phaser.Scene{
 constructor(){super('YenCafe2D');this.sprites=new Map();this.npcLabels=new Map();this.npcStates=new Map();this.propSprites=new Map();this.propDetails=new Map();this.propBackLayers=new Map();this.steam=[];this.plantDrops=[];this.lastDirection='down';}
 preload(){
  this.load.image('scene-backdrop','./assets/scene/backdrop-painted-v1.png');
  for(const prop of SCENE_PROPS){
   this.load.image('prop-'+prop.texture,prop.raster);
  }
  this.load.image('prop-machine-painted','./assets/scene/machine-painted-v1.webp');
  for(const name of ['cup','book','cushion'])
   this.load.image('prop-'+name,'./assets/scene/'+name+'-painted-v1.webp');
  for(const role of SPRITE_ROLES)
   this.load.spritesheet(role,sheetUrl(role),{frameWidth:256,frameHeight:320,endFrame:15});
  this.load.on('loaderror',file=>{
   console.error('Yencafeday failed to load sprite asset:',file?.key,file?.src);
   $('load-error').hidden=false;
  });
 }
 create(){
  world=this;
  // Pure architecture + ground: all furniture lives in independent sprite layers.
  this.add.image(720,450,'scene-backdrop').setDisplaySize(1440,900).setDepth(-1000);
  // Soft particles float in the sunlight. No camera-coupled interface effects.
  for(let i=0;i<11;i++){
    const px=125+(i*59)%460, py=347+(i*71)%300;
    const mote=this.add.circle(px,py,1.6+(i%3),0xfff3c9,.22).setDepth(-10);
    this.tweens.add({targets:mote,alpha:.02,y:py-22-(i%4)*5,
      duration:2600+i*173,delay:i*197,repeat:-1,yoyo:true,ease:'Sine.inOut'});
  }
  this.cameras.main.setBounds(0,0,1440,900);
  this.createProps();
  for(const role of SPRITE_ROLES)createRoleAnimations(this,role);
  for(const person of npcs){
   const asset=spriteRole(person.role);
   const isCat=asset==='cat';
   const sprite=this.add.sprite(person.x,person.y,asset,0)
    .setDisplaySize(isCat?102:109,isCat?127:138).setOrigin(.5,1).setDepth(person.y);
   playDirectional(sprite,asset,'down',false);
   this.sprites.set(person.id,sprite);
   const label=this.add.text(person.x,person.y-(isCat?130:146),person.name,{
    fontFamily:'Trebuchet MS, Arial',fontSize:'15px',fontStyle:'bold',
    color:'#553e32',backgroundColor:'#fff6dfba',
    padding:{left:6,right:6,top:3,bottom:3}
   }).setOrigin(.5,1).setDepth(person.y+2);
   this.npcLabels.set(person.id,label);
   this.npcStates.set(person.id,{stop:0,wait:NPC_ROUTINES[person.id][0].wait,facing:'down',action:0,conversation:0});
  }
  this.player=this.add.sprite(600,750,'barista',0)
   .setDisplaySize(117,146).setOrigin(.5,1).setDepth(756);
  this.playerRole='barista';
  this.interactRemaining=0;
  playDirectional(this.player,'barista','down',false);
  this.marker=this.add.circle(0,0,42,0xffeab1,.19).setStrokeStyle(5,0xffd17a,.93)
   .setDepth(1200).setVisible(false);
  this.nearHalo=this.add.circle(0,0,43,0xfff2cd,.12).setStrokeStyle(4,0xffd995,.8)
   .setDepth(1200).setVisible(false);
  this.tweens.add({targets:this.marker,scale:1.15,alpha:.62,yoyo:true,repeat:-1,duration:820});
  const smoke=[];
  for(let i=0;i<3;i++){
    const vap=this.add.ellipse(1087+i*27,340+i*11,10,21,0xfff6df,.23).setDepth(350);
    this.tweens.add({targets:vap,y:309+i*7,alpha:0,yoyo:true,repeat:-1,duration:1500+i*200});
    smoke.push(vap);
  }
  this.cameras.main.startFollow(this.player,true,.085,.085);
  this.bindInputs();
  this.scale.on('resize',()=>this.setZoom());
  this.setZoom();
  updateMarker();updateUI();
  $('load-error').hidden=true;
  // The reference image opens with model preview; player can close/apply and play.
  selectPreviewRole(state.selectedPreview);
  modal('preview');
 }
 createProps(){
  // These are genuine independently drawn scene objects, not visual hotspots
  // painted into a non-interactive background.
  for(const def of SCENE_PROPS){
   this.add.ellipse(def.x,def.y-4,def.shadow[0]*2,def.shadow[1]*2,0x4a342d,.17)
    .setDepth(def.y-4);
   const sprite=this.add.image(def.x,def.y,'prop-'+def.texture)
    .setDisplaySize(def.w,def.h).setOrigin(.5,1).setDepth(def.y);
   if(def.layers){
    const {width,height,frontStart,backDepth}=def.layers;
    // Shared source and identical transform: no seam drift between rear top and fascia.
    const back=this.add.image(def.x,def.y,'prop-'+def.texture)
     .setDisplaySize(def.w,def.h).setOrigin(.5,1).setDepth(backDepth)
     .setCrop(0,0,width,frontStart);
    this.propBackLayers.set(def.id,back);
    if(def.id==='counter')this.counterTop=back; // Backward-compatible counter QA locator.
    sprite.setCrop(0,frontStart,width,height-frontStart);
   }
   this.propSprites.set(def.id,sprite);
   // Painterly props stay registered to a stable base pivot; animate separate effects instead.
  }
  this.counterMachine=this.add.image(1160,534,'prop-machine-painted')
   .setDisplaySize(85,72).setOrigin(.5,1).setDepth(609);
  // Small details have their own textures and state, independent of the tables.
  const cup=this.add.image(373,661,'prop-cup').setDisplaySize(24,24)
   .setOrigin(.5,1).setDepth(726);
  const book=this.add.image(331,662,'prop-book').setDisplaySize(35,17)
   .setOrigin(.5,1).setDepth(727);
  const cushion=this.add.image(1168,670,'prop-cushion').setDisplaySize(69,47)
   .setOrigin(.5,1).setDepth(754);
  this.propDetails.set('cup',cup);
  this.propDetails.set('book',book);
  this.propDetails.set('cushion',cushion);
  this.scooterLight=this.add.circle(1284,714,12,0xffe39b,.5)
   .setDepth(840).setVisible(false);
  this.tweens.add({targets:this.scooterLight,alpha:.1,scale:1.35,
   duration:650,repeat:-1,yoyo:true,ease:'Sine.inOut'});
  for(let i=0;i<5;i++){
   const drop=this.add.circle(80+i*12,498+(i%2)*7,2+(i%3),0xb9e4e5,.85).setDepth(670).setVisible(false);
   this.plantDrops.push(drop);
  }
  for(let i=0;i<3;i++){
   const steam=this.add.ellipse(1146+i*14,461+i*3,7,20,0xfff3d3,.28)
    .setDepth(612).setVisible(false);
   this.tweens.add({targets:steam,y:435+i*3,alpha:0,
    duration:1700+i*220,repeat:-1,yoyo:true});
   this.steam.push(steam);
  }
 }
 bindInputs(){
  this.keyboard=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT')||{};
 }
 setZoom(){
  // Cover the viewport with café art; crop beyond the camera rather than exposing blank borders.
  const ratio=Math.max(this.scale.width/1440,this.scale.height/900);
  this.cameras.main.setZoom(clamp(ratio,.60,1.45));
 }
 setPlayerRole(role){
  if(!this.player||!roles[role])return;
  this.playerRole=role;
  this.lastDirection='down';
  this.interactRemaining=0;
  this.player.setTexture(role,0);
  this.player.setDisplaySize(role==='cat'?110:117,role==='cat'?137:146);
  playDirectional(this.player,role,'down',false);
 }
 resetWorld(){
  if(!this.player)return;
  this.player.setPosition(601,753).setDepth(758).setFlipX(false);
  this.player.setAngle(0);
  this.lastDirection='down';
  this.setPlayerRole(state.role);
  this.marker?.setVisible(false);
  this.nearHalo?.setVisible(false);
  this.resetProps();
  for(const person of npcs){
   const sprite=this.sprites.get(person.id),runtime=this.npcStates.get(person.id);
   if(!sprite||!runtime)continue;
   sprite.setPosition(person.x,person.y).setDepth(person.y);
   Object.assign(runtime,{stop:0,wait:NPC_ROUTINES[person.id][0].wait,facing:'down',action:0,conversation:0});
   playDirectional(sprite,spriteRole(person.role),'down',false);
  }
 }
 react(){
  if(!this.player)return;
  this.interactRemaining=.76;
  this.player.play(state.role+'-interact',true);
 }
 reactNPC(id){
  const npc=npcs.find(n=>n.id===id);
  const sprite=this.sprites.get(id);
  if(npc&&sprite){
   const runtime=this.npcStates.get(id);
   if(runtime){runtime.action=.8;runtime.conversation=NPC_TALK_SECONDS;}
   sprite.play(spriteRole(npc.role)+'-interact',true);
  }
 }
 resetProps(){
  this.scooterLight?.setVisible(false);
  this.steam.forEach(p=>p.setVisible(false));
  this.plantDrops.forEach(p=>{this.tweens.killTweensOf?.(p);p.setVisible(false).setAlpha(.85);});
  const cup=this.propDetails.get('cup');
  const book=this.propDetails.get('book');
  for(const item of [cup,book,this.propDetails.get('cushion'),this.propSprites.get('door')])
   if(item)this.tweens.killTweensOf?.(item);
  if(cup)cup.setVisible(true).setAlpha(1);
  if(book)book.setAngle(0);
  const pillow=this.propDetails.get('cushion');
  if(pillow)pillow.setPosition(1168,670).setAngle(0);
  const door=this.propSprites.get('door');
  if(door)door.setAngle(0);
 }
 reactProp(id,next){
  // Changing game state visibly changes object sprites.
  if(id==='counter'){
   this.steam.forEach(p=>p.setVisible(!!next));
   this.cameras.main.shake(90,.0007);
  }else if(id==='table'){
   const cup=this.propDetails.get('cup');
   if(cup){
    if(!next)cup.setVisible(true);
    this.tweens.add({targets:cup,alpha:next?0:1,
     duration:220,onComplete:()=>cup.setVisible(!next)});
   }
   const book=this.propDetails.get('book');
   if(book)this.tweens.add({targets:book,angle:next?-7:0,duration:250});
  }else if(id==='bench'){
   const pillow=this.propDetails.get('cushion');
   if(pillow)this.tweens.add({targets:pillow,x:next?1197:1168,
      angle:next?9:0,duration:330,ease:'Sine.inOut'});
  }else if(id==='bike'){
   this.scooterLight?.setVisible(!!next);
  }else if(id==='plant'){
   // Water droplets are a separate interaction layer, not a scale-distorted plant.
   this.plantDrops.forEach((drop,i)=>{
    this.tweens.killTweensOf?.(drop);drop.setVisible(!!next).setPosition(80+i*12,498+(i%2)*7).setAlpha(.85);
    if(next)this.tweens.add({targets:drop,y:555+(i%3)*5,alpha:0,duration:550+i*95,
       onComplete:()=>drop.setVisible(false)});
   });
  }else if(id==='door'){
   const door=this.propSprites.get('door');
   if(door)this.tweens.add({targets:door,angle:next?-2:0,duration:340});
  }
 }
 updateNPCs(dt){
  for(const person of npcs){
   const sprite=this.sprites.get(person.id),runtime=this.npcStates.get(person.id);
   if(!sprite||!runtime)continue;
   const route=NPC_ROUTINES[person.id],role=spriteRole(person.role);
   if(!route?.length)continue;
   if(runtime.conversation>0){
    // Keep the speaker in place until their displayed line has finished.
    // Preserve the route's remaining wait instead of restarting its schedule.
    runtime.conversation=Math.max(0,runtime.conversation-dt);
    runtime.action=Math.max(0,runtime.action-dt);
    if(runtime.action===0)playDirectional(sprite,role,runtime.facing,false);
   }else if(runtime.action>0){
    runtime.action=Math.max(0,runtime.action-dt);
   }else if(runtime.wait>0){
    runtime.wait=Math.max(0,runtime.wait-dt);
    playDirectional(sprite,role,runtime.facing,false);
    // A short ambient gesture at longer stops, without interrupting dialogue.
    if(runtime.wait===0&&route[runtime.stop].action){
     runtime.action=.7;sprite.play(role+'-interact',true);
     // A moving actor gestures once, then departs. Re-arming this wait for
     // multi-stop routes would trap every action-bearing NPC at its first stop.
     if(route.length===1)runtime.wait=route[runtime.stop].wait;
    }
   }else{
    const nextIndex=(runtime.stop+1)%route.length,target=route[nextIndex];
    const dx=target.x-sprite.x,dy=target.y-sprite.y,dist=Math.hypot(dx,dy);
    const travel=Math.min(dist,(NPC_SPEED[person.id]||65)*dt);
    if(dist>0.01){
     const nx=sprite.x+dx/dist*travel,ny=sprite.y+dy/dist*travel;
     if(!blocked(nx,ny)||person.id==='barista'){
      sprite.setPosition(nx,ny);
      runtime.facing=Math.abs(dy)>Math.abs(dx)?(dy<0?'up':'down'):(dx<0?'left':'right');
      playDirectional(sprite,role,runtime.facing,true);
     }else{
      // Avoid a stalled NPC repeatedly trying to cross furniture.
      runtime.stop=nextIndex;runtime.wait=target.wait;
     }
    }
    if(dist<=Math.max(1,travel)){
     sprite.setPosition(target.x,target.y);
     runtime.stop=nextIndex;runtime.wait=target.wait;
     playDirectional(sprite,role,runtime.facing,false);
    }
   }
   sprite.setDepth(sprite.y);
   const label=this.npcLabels.get(person.id);
   if(label){
    const height=role==='cat'?130:146;
    label.setPosition(sprite.x,sprite.y-height).setDepth(sprite.y+2);
   }
  }
 }
 update(t,dtMs){
  if(!this.player)return;
  // Preserve real-time movement if rendering falls below 30 FPS.
  const dt=Math.min(dtMs/1000,.30);
  tick(dt);
  let dx=Number(Boolean(heldKeys.has('d')||heldKeys.has('arrowright')||this.keyboard.D?.isDown||this.keyboard.RIGHT?.isDown))
       -Number(Boolean(heldKeys.has('a')||heldKeys.has('arrowleft')||this.keyboard.A?.isDown||this.keyboard.LEFT?.isDown))+touch.x;
  let dy=Number(Boolean(heldKeys.has('s')||heldKeys.has('arrowdown')||this.keyboard.S?.isDown||this.keyboard.DOWN?.isDown))
       -Number(Boolean(heldKeys.has('w')||heldKeys.has('arrowup')||this.keyboard.W?.isDown||this.keyboard.UP?.isDown))+touch.y;
  const n=Math.hypot(dx,dy);
  this.interactRemaining=Math.max(0,this.interactRemaining-dt);
  if(!activeModal&&['explore','shift','ready'].includes(state.phase)
     &&n>.08&&!state.active&&this.interactRemaining===0){
   dx/=Math.max(n,1);dy/=Math.max(n,1);
   const speed=state.sprint>0?332:225;
   const travel=speed*dt,steps=Math.max(1,Math.ceil(travel/22));
   for(let step=0;step<steps;step++){
    const x=clamp(this.player.x+dx*travel/steps,90,1365);
    const y=clamp(this.player.y+dy*travel/steps,507,840);
    if(!blocked(x,this.player.y))this.player.x=x;
    if(!blocked(this.player.x,y))this.player.y=y;
   }
   const direction=Math.abs(dy)>.52?(dy<0?'up':'down'):(dx<0?'left':'right');
   this.lastDirection=direction;
   playDirectional(this.player,state.role,direction,true);
   this.player.setDepth(this.player.y+3);
  }else if(this.interactRemaining===0){
   playDirectional(this.player,state.role,this.lastDirection,false);
  }
  this.updateNPCs(dt);
  const candidate=nearbyCandidate();
  if(candidate&&!activeModal){
    $('world-hint').hidden=false;
    const touchHint=window.matchMedia?.('(pointer: coarse)').matches;
    $('world-hint').textContent=(candidate.kind==='task'?'Nhiệm vụ: ':touchHint?'Chạm Tương tác · ':'E · ')+candidate.name;
    this.nearHalo.setPosition(candidate.x,candidate.y+14).setVisible(true);
  }else{
    $('world-hint').hidden=true;this.nearHalo.setVisible(false);
  }
  if(t-elapsedUI>180){
    updateUI();elapsedUI=t;
  }
 }
}
function init(){
 // Main menu buttons
 $('start-shift').addEventListener('click',startShift);
 $('finish-shift').addEventListener('click',finishShift);
 $('open-preview').addEventListener('click',()=>{selectPreviewRole(state.role);modal('preview')});
 $('open-objective').addEventListener('click',()=>renderInfo('objective'));
 $('open-journal').addEventListener('click',()=>renderInfo('journal'));
 $('open-bag').addEventListener('click',()=>renderInfo('bag'));
 $('settings-btn').addEventListener('click',()=>renderInfo('settings'));
 $('close-modal').addEventListener('click',()=>modal(null));
 $('close-info').addEventListener('click',()=>modal(null));
 $('info-action').addEventListener('click',()=>{
  const phase=state.phase;modal(null);
  if(phase==='explore')startShift();else if(phase==='ready')finishShift();
 });
 $('apply-model').addEventListener('click',()=>{
  if(state.phase!=='explore')return;
  setRole(state.selectedPreview);
  state.inventory[0]='Ly nước của '+roles[state.role].name;
  addLog('Đổi vai sang '+roles[state.role].name+'.');
  speech('Đã chọn '+roles[state.role].name+'. Giờ đi khám phá quán nhé.',3.2);
  modal(null);
 });
 $('next-day').addEventListener('click',nextDay);
 $('interact').addEventListener('click',interact);
 $('power').addEventListener('click',usePower);
 for(const button of document.querySelectorAll('.role-option'))
   button.addEventListener('click',()=>selectPreviewRole(button.dataset.role));
 for(const button of document.querySelectorAll('[data-animation]'))
   button.addEventListener('click',()=>selectAnimation(button.dataset.animation));
 $('overlay').addEventListener('click',e=>{if(e.target===$('overlay')&&activeModal!=='result')modal(null)});
 window.addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if(key==='tab'&&activeModal){trapModalFocus(event);return;}
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){
   if(activeModal)return;
   heldKeys.add(key);
   if(!activeModal)event.preventDefault();
  }else if(key==='e'&&!event.repeat&&!activeModal){
   event.preventDefault();interact();
  }else if(key==='q'&&!event.repeat&&!activeModal){
   event.preventDefault();usePower();
  }else if(key==='escape'&&!event.repeat){
   if(activeModal&&activeModal!=='result')modal(null);
   else if(!activeModal)modal('preview');
  }
 });
 window.addEventListener('keyup',event=>heldKeys.delete(event.key.toLowerCase()));
 window.addEventListener('blur',resetInput);
 document.addEventListener?.('visibilitychange',()=>{if(document.hidden)resetInput()});
 bindStick();
 setUpSpriteThumbnails();
 selectAnimation('idle');
 // Animate the preview using the exact 16 PNG frames, not CSS bob/one static SVG.
 if(typeof window.setInterval==='function')
   window.setInterval(()=>{if(activeModal==='preview')paintPreview();},165);
 if(!window.Phaser?.Game||!window.Phaser?.Scene){
   $('load-error').hidden=false;return;
 }
 try{
  phaserGame=new Phaser.Game({
    type:typeof window.location?.search==='string'&&window.location.search.includes('canvas=1')?Phaser.CANVAS:Phaser.AUTO,
    parent:'scene',
    width:1200,height:800,
    backgroundColor:'#e6c39b',
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
    render:{pixelArt:false,antialias:true},
    scene:[CafeScene]
  });
 }catch(e){
  console.error('Yencafeday Phaser failed',e);
  $('load-error').hidden=false;
 }
}
if(typeof window.location?.search==='string' && window.location.search.includes('qa=1')){
 window.__yenQA=Object.freeze({inspect:()=>({
  phase:state.phase,role:state.role,done:state.done,active:!!state.active,
  modal:activeModal,held:[...heldKeys],
  player:world?.player?{x:Math.round(world.player.x),y:Math.round(world.player.y),
   anim:world.player.anims?.currentAnim?.key}:null,
  near:nearbyCandidate()?.id||null,
  fps:world?.game?.loop?.actualFps||null,
  props:world?[...world.propSprites].map(([id,p])=>({id,x:p.x,y:p.y,depth:p.depth,texture:p.texture.key})):[],
  details:world?[...world.propDetails].map(([id,p])=>({id,x:p.x,y:p.y,visible:p.visible,alpha:p.alpha,angle:p.angle,texture:p.texture.key})):[],
  counterLayers:world?.counterTop?{backDepth:world.counterTop.depth,machine:{x:world.counterMachine.x,y:world.counterMachine.y,depth:world.counterMachine.depth,texture:world.counterMachine.texture.key},steam:world.steam.map(p=>({x:p.x,y:p.y,visible:p.visible}))}:null,
  npcs:world?[...world.sprites].map(([id,s])=>({id,x:Math.round(s.x),y:Math.round(s.y),anim:s.anims?.currentAnim?.key,depth:s.depth})):[]
 })});
}
init();
})();
