/* Yencafeday 2D: illustrated café game with PNG actors and raster scene art.
 * Phaser 4 renders a painted café backdrop, transparent foreground plants,
 * and real 4x4 character sprite animations, preserving accessible HTML UI.
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
const stations={
 door:{x:195,y:716,label:'Lối vào'},
 counter:{x:990,y:606,label:'Quầy pha chế'},
 table:{x:465,y:763,label:'Bàn khách'},
 bike:{x:1296,y:757,label:'Xe giao hàng'},
 bench:{x:1040,y:762,label:'Ghế dài'},
 plant:{x:160,y:565,label:'Chậu cây'}
};
const npcs=[
 {id:'reader',role:'reader',x:520,y:650,name:'Khách đọc sách',lines:['Mình vừa đọc tới chương... cái bìa.','Một trang sách và một ly nước. Tạm đủ.']},
 {id:'guest',role:'guest',x:690,y:605,name:'Khách chờ bạn',lines:['Bạn mình bảo năm phút nữa tới.','Mình gọi trước một ly. Kẻ đến sau tự tính.']},
 {id:'guard',role:'guard',x:150,y:714,name:'Chú bảo vệ',lines:['Để xe ngay ngắn là quán đã yên một nửa.','Mèo Mướp trông ghế, tôi trông cửa.']},
 {id:'barista',role:'barista',x:995,y:550,name:'Bạn pha chế',lines:['Nước ngon cần chút kiên nhẫn.','Máy pha cà phê hôm nay khá dễ bảo.']},
 {id:'waiter',role:'waiter',x:817,y:647,name:'Bạn phục vụ',lines:['Ngồi đâu cũng được, trừ quầy pha chế.','Để mình dọn lại bàn nhé.']},
 {id:'cat',role:'cat',x:613,y:802,name:'Mèo Mướp',lines:['Meo. (Mướp vừa đồng ý.)','Meo. (Mướp vừa đổi ý.)']}
];
// NPC routes remain on the walkable floor, with deliberate pauses at each stop.
const NPC_ROUTINES={
 reader:[{x:520,y:650,wait:9},{x:618,y:745,wait:5},{x:520,y:650,wait:11}],
 guest:[{x:690,y:605,wait:5},{x:751,y:701,wait:7},{x:690,y:605,wait:4}],
 guard:[{x:150,y:714,wait:6},{x:270,y:760,wait:4},{x:158,y:718,wait:7}],
 barista:[{x:995,y:550,wait:7,action:true}],
 waiter:[{x:817,y:647,wait:4},{x:932,y:729,wait:5},{x:815,y:650,wait:6}],
 cat:[{x:613,y:802,wait:8},{x:714,y:803,wait:5},{x:613,y:802,wait:9}]
};
const NPC_SPEED={reader:66,guest:59,guard:74,barista:0,waiter:82,cat:52};
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
 activeModal=name;
 $('overlay').hidden=!name;
 $('overlay').setAttribute('aria-hidden',String(!name));
 $('model-modal').hidden=name!=='preview';
 $('info-modal').hidden=name!=='info';
 $('result-modal').hidden=name!=='result';
 if(name==='preview'){
   const allowed=state.phase==='explore';
   $('apply-model').disabled=!allowed;
   $('apply-model').textContent=allowed?'✓ Áp dụng model này':'Đổi vai khi đang khám phá';
 }
 // Pause game movement while inspecting menus, keep environment alive.
 if(name==='preview')$('close-modal').focus();
 else if(name==='info')$('close-info').focus();
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
 $('model-note').textContent=
  '16 khung hình PNG nền trong suốt của '+roles[role].name+
  '. Bốn hướng trước, phải, sau, trái; Idle, Walk và Interact là những frame thật.';
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
   state.active={elapsed:0,duration:state.quick?.6:2.1,task:task().title};
   state.quick=false;
   updateMarker();
   speech('Đang làm: '+state.active.task,2);
 }else if(nearby.kind==='npc'){
   world?.reactNPC(nearby.id);
   const npc=npcs.find(n=>n.id===nearby.id);
   const idx=state.dialogues[nearby.id]||0;
   state.dialogues[nearby.id]=idx+1;
   const line=npc.name+': '+npc.lines[idx%npc.lines.length];
   speech(line,4.5);addLog('Nói chuyện với '+npc.name+'.');
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
 // Illustrated background collision map, in native 1440x900 world coordinates.
 // Stations are deliberately reachable from the front/side of each furnishing.
 const inRect=(l,t,r,b)=>x>l&&x<r&&y>t&&y<b;
 const ellipse=(cx,cy,rx,ry)=>((x-cx)/rx)**2+((y-cy)/ry)**2<1;
 return inRect(810,0,1440,578) ||       // Wooden counter and pastry case
        ellipse(342,618,180,107) ||     // Café table and chairs
        inRect(1100,604,1380,746) ||   // Cushioned bench
        inRect(1345,635,1440,804) ||   // Delivery scooter
        inRect(0,0,125,597);           // Potted foreground plants
}
function renderInfo(kind){
 const title={objective:'Objective',journal:'Nhật ký ở Yên',bag:'Túi đồ',settings:'Cài đặt'}[kind];
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
   add('p','Bản này dùng sprite minh họa thử nghiệm, chưa phải sprite atlas anime cuối.');
 }
 modal('info');
}
function resetStick(){touch.x=touch.y=0;touch.pointer=null;$('thumb').style.transform='translate(0,0)';}
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
   if(activeModal)return;
   touch.pointer=e.pointerId;area.setPointerCapture?.(e.pointerId);move(e);e.preventDefault();
 });
 area.addEventListener('pointermove',e=>{if(touch.pointer===e.pointerId)move(e)});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])
   area.addEventListener(event,e=>{if(touch.pointer===e.pointerId)resetStick()});
}
class CafeScene extends Phaser.Scene{
 constructor(){super('YenCafe2D');this.sprites=new Map();this.npcLabels=new Map();this.npcStates=new Map();this.lastDirection='down';}
 preload(){
  this.load.image('cafe','./assets/cafe-painted.webp');
  this.load.image('cafe-foreground','./assets/cafe-foreground.webp');
  for(const role of SPRITE_ROLES)
   this.load.spritesheet(role,sheetUrl(role),{frameWidth:256,frameHeight:320,endFrame:15});
  this.load.on('loaderror',file=>{
   console.error('Yencafeday failed to load sprite asset:',file?.key,file?.src);
   $('load-error').hidden=false;
  });
 }
 create(){
  world=this;
  this.add.image(720,450,'cafe').setDisplaySize(1440,900).setDepth(-50);
  // The background is a painted raster illustration. Typography and depth
  // remain real Phaser elements so they can be localized and occlude actors.
  this.add.text(695,201,'yên',{
    fontFamily:'Georgia,serif',fontSize:'72px',fontStyle:'bold italic',
    color:'#f0d7a6',stroke:'#99754b',strokeThickness:2
  }).setOrigin(.5,.5).setDepth(-30);
  this.add.text(695,266,'C O F F E E   &   T E A',{
    fontFamily:'Arial,sans-serif',fontSize:'14px',fontStyle:'bold',
    color:'#f3dfb7'
  }).setOrigin(.5,.5).setDepth(-30);
  // Soft particles float in the sunlight. No camera-coupled interface effects.
  for(let i=0;i<11;i++){
    const px=125+(i*59)%460, py=347+(i*71)%300;
    const mote=this.add.circle(px,py,1.6+(i%3),0xfff3c9,.22).setDepth(-10);
    this.tweens.add({targets:mote,alpha:.02,y:py-22-(i%4)*5,
      duration:2600+i*173,delay:i*197,repeat:-1,yoyo:true,ease:'Sine.inOut'});
  }
  this.cameras.main.setBounds(0,0,1440,900);
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
   this.npcStates.set(person.id,{stop:0,wait:2+(person.x%5),facing:'down',action:0});
  }
  // Painted foliage in front of the camera hides the lower part of actors
  // who walk behind the plants; the world remains one contiguous painting.
  this.add.image(720,450,'cafe-foreground').setDisplaySize(1440,900).setDepth(950);
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
  for(const person of npcs){
   const sprite=this.sprites.get(person.id),runtime=this.npcStates.get(person.id);
   if(!sprite||!runtime)continue;
   sprite.setPosition(person.x,person.y).setDepth(person.y);
   Object.assign(runtime,{stop:0,wait:2+(person.x%5),facing:'down',action:0});
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
   if(runtime){runtime.action=.8;runtime.wait=Math.max(runtime.wait,1.5);}
   sprite.play(spriteRole(npc.role)+'-interact',true);
  }
 }
 reactProp(id,next){
  if(id==='counter')this.cameras.main.shake(125,.001);
  if(id==='plant')this.cameras.main.flash(100,252,230,170);
  if(id==='table'){const npc=this.sprites.get('reader');if(npc)this.tweens.add({targets:npc,angle:next?3:0,duration:150});}
 }
 updateNPCs(dt){
  for(const person of npcs){
   const sprite=this.sprites.get(person.id),runtime=this.npcStates.get(person.id);
   if(!sprite||!runtime)continue;
   const route=NPC_ROUTINES[person.id],role=spriteRole(person.role);
   if(!route?.length)continue;
   if(runtime.action>0){
    runtime.action=Math.max(0,runtime.action-dt);
   }else if(runtime.wait>0){
    runtime.wait=Math.max(0,runtime.wait-dt);
    playDirectional(sprite,role,runtime.facing,false);
    // A short ambient gesture at longer stops, without interrupting dialogue.
    if(runtime.wait===0&&route[runtime.stop].action){
     runtime.action=.7;sprite.play(role+'-interact',true);
     runtime.wait=route[runtime.stop].wait;
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
    $('world-hint').textContent=(candidate.kind==='task'?'Nhiệm vụ: ':'E · ')+candidate.name;
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
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){
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
 window.addEventListener('blur',()=>{heldKeys.clear();resetStick()});
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
  npcs:world?[...world.sprites].map(([id,s])=>({id,x:Math.round(s.x),y:Math.round(s.y),anim:s.anims?.currentAnim?.key})):[]
 })});
}
init();
})();
