/* Yencafeday 2D: full gameplay vertical slice based on reference mockup.
 * Phaser 4 rendering; cohesive 2D UI and role/art preview before applying.
 * Assets currently original vector sprite placeholders, not approved handpainted frames.
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
 counter:{x:1118,y:613,label:'Quầy pha chế'},
 table:{x:465,y:763,label:'Bàn khách'},
 bike:{x:1296,y:757,label:'Xe giao hàng'},
 bench:{x:942,y:787,label:'Ghế dài'},
 plant:{x:231,y:569,label:'Chậu cây'}
};
const npcs=[
 {id:'reader',role:'reader',x:382,y:620,name:'Khách đọc sách',lines:['Mình vừa đọc tới chương... cái bìa.','Một trang sách và một ly nước. Tạm đủ.']},
 {id:'guest',role:'guest',x:690,y:605,name:'Khách chờ bạn',lines:['Bạn mình bảo năm phút nữa tới.','Mình gọi trước một ly. Kẻ đến sau tự tính.']},
 {id:'guard',role:'guard',x:210,y:675,name:'Chú bảo vệ',lines:['Để xe ngay ngắn là quán đã yên một nửa.','Mèo Mướp trông ghế, tôi trông cửa.']},
 {id:'barista',role:'barista',x:1216,y:584,name:'Bạn pha chế',lines:['Nước ngon cần chút kiên nhẫn.','Máy pha cà phê hôm nay khá dễ bảo.']},
 {id:'waiter',role:'waiter',x:817,y:647,name:'Bạn phục vụ',lines:['Ngồi đâu cũng được, trừ quầy pha chế.','Để mình dọn lại bàn nhé.']},
 {id:'cat',role:'cat',x:613,y:802,name:'Mèo Mướp',lines:['Meo. (Mướp vừa đồng ý.)','Meo. (Mướp vừa đổi ý.)']}
];
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
let interacting=false;
const assetUrl=(role,view='front')=>'./assets/'+role+(role==='cat'||view==='front'?'':'-'+(view==='back'?'back':'side'))+'.svg';
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
 state.selectedPreview=role;
 for(const btn of document.querySelectorAll('.role-option')){
   const selected=btn.dataset.role===role;
   btn.classList.toggle('selected',selected);
   btn.setAttribute('aria-selected',String(selected));
 }
 const pictures={front:assetUrl(role),right:assetUrl(role,'right'),
                back:assetUrl(role,'back'),left:assetUrl(role,'left')};
 for(const [dir,src] of Object.entries(pictures)){
   const img=$('pose-'+dir);
   img.src=src;
   img.style.transform=role==='cat'?'scale(.87)':'';
   if(dir==='left'&&role!=='cat')img.style.transform='scaleX(-1)';
   img.alt=roles[role].name+' · '+dir;
 }
 const frames=$('animation-film').querySelectorAll('img');
 for(const frame of frames)frame.src=assetUrl(role);
 $('model-turnaround').dataset.animation=state.animation;
 $('animation-film').dataset.animation=state.animation;
 $('model-note').textContent=role==='cat'
   ?'Mèo Mướp đang dùng sprite vector 2D riêng. Hoạt ảnh nhiều khung hình sẽ được hoàn thiện sau bước duyệt concept.'
   :'Bản chơi được dùng sprite vector nhiều hướng. Hình anime màu nước trong concept là mục tiêu hình ảnh, chưa phải atlas hoạt ảnh đã hoàn thiện.';
}
function selectAnimation(animation){
 if(!['idle','walk','interact'].includes(animation))return;
 state.animation=animation;
 $('model-turnaround').dataset.animation=animation;
 $('animation-film').dataset.animation=animation;
 for(const btn of document.querySelectorAll('[data-animation]')){
   const on=btn.dataset.animation===animation;
   btn.classList.toggle('active',on);
   btn.setAttribute('aria-pressed',String(on));
 }
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
   const dist=Math.hypot(x-person.x,y-person.y);
   if(dist<130&&(!best||dist<best.dist))best={kind:'npc',name:person.name,id:person.id,x:person.x,y:person.y,dist};
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
 // Obstacles correspond to paintings of counter, table and sofa.
 return x<195&&y<599||
   (x>763&&x<1350&&y<567)||
   (x>330&&x<594&&y>644&&y<724)||
   (x>800&&x<1134&&y>684&&y<735);
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
 constructor(){super('YenCafe2D');this.sprites=new Map();this.lastDirection='front';}
 preload(){
  this.load.svg('cafe','./assets/cafe.svg',{width:1440,height:900});
  for(const r of ['barista','waiter','shipper','guard','cat','guest','reader']){
    this.load.svg(r+'-front',assetUrl(r),{width:r==='cat'?220:200,height:r==='cat'?230:290});
    if(r!=='cat'){
      this.load.svg(r+'-side',assetUrl(r,'side'),{width:200,height:290});
      this.load.svg(r+'-back',assetUrl(r,'back'),{width:200,height:290});
    }
  }
 }
 create(){
  world=this;
  this.add.image(720,450,'cafe').setDisplaySize(1440,900).setDepth(-50);
  this.cameras.main.setBounds(0,0,1440,900);
  for(const person of npcs){
    const isCat=person.role==='cat';
    const sprite=this.add.image(person.x,person.y,person.role+'-front')
      .setDisplaySize(isCat?90:101,isCat?95:142).setOrigin(.5,1).setDepth(person.y);
    this.sprites.set(person.id,sprite);
    const label=this.add.text(person.x,person.y-(isCat?102:149),person.name,{
      fontFamily:'Trebuchet MS, Arial',fontSize:'15px',fontStyle:'bold',
      color:'#553e32',backgroundColor:'#fff6dfba',
      padding:{left:6,right:6,top:3,bottom:3}
    }).setOrigin(.5,1).setDepth(person.y+2);
    this.tweens.add({targets:sprite,y:person.y-3,duration:1800+(this.sprites.size*70),yoyo:true,repeat:-1,ease:'Sine.inOut'});
  }
  this.player=this.add.image(600,750,'barista-front')
    .setDisplaySize(115,161).setOrigin(.5,1).setDepth(756);
  this.playerRole='barista';
  this.marker=this.add.circle(0,0,42,0xffeab1,.19).setStrokeStyle(5,0xffd17a,.93)
   .setDepth(1200).setVisible(false);
  this.nearHalo=this.add.circle(0,0,43,0xfff2cd,.12).setStrokeStyle(4,0xffd995,.8)
   .setDepth(1200).setVisible(false);
  this.tweens.add({targets:this.marker,scale:1.15,alpha:.62,yoyo:true,repeat:-1,duration:820});
  const smoke=[];
  for(let i=0;i<3;i++){
    const vap=this.add.ellipse(1035+i*29,291+i*12,11,26,0xfff6df,.25).setDepth(350);
    this.tweens.add({targets:vap,y:245+i*10,alpha:0,yoyo:true,repeat:-1,duration:1500+i*200});
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
  this.input.keyboard?.on('keydown-E',()=>interact());
  this.input.keyboard?.on('keydown-Q',()=>usePower());
  this.input.keyboard?.on('keydown-ESC',()=>{if(activeModal&&activeModal!=='result')modal(null);else modal('preview')});
 }
 setZoom(){
  // Cover the viewport with café art; crop beyond the camera rather than exposing blank borders.
  const ratio=Math.max(this.scale.width/1440,this.scale.height/900);
  this.cameras.main.setZoom(clamp(ratio,.60,1.45));
 }
 setPlayerRole(role){
  if(!this.player||!roles[role])return;
  this.playerRole=role;
  this.lastDirection='front';
  this.player.setTexture(role+'-front');
  this.player.setDisplaySize(role==='cat'?103:114,role==='cat'?112:161);
 }
 resetWorld(){
  if(!this.player)return;
  this.player.setPosition(601,753).setDepth(758).setFlipX(false);
  this.player.setAngle(0);
  this.lastDirection='front';
  this.setPlayerRole(state.role);
  this.marker?.setVisible(false);
  this.nearHalo?.setVisible(false);
 }
 react(){
  if(!this.player)return;
  this.tweens.add({targets:this.player,scaleY:state.role==='cat'?.50:.56,duration:135,yoyo:true});
 }
 reactProp(id,next){
  if(id==='counter')this.cameras.main.shake(125,.001);
  if(id==='plant')this.cameras.main.flash(100,252,230,170);
  if(id==='table'){const npc=this.sprites.get('reader');if(npc)this.tweens.add({targets:npc,angle:next?3:0,duration:150});}
 }
 update(t,dtMs){
  if(!this.player)return;
  const dt=Math.min(dtMs/1000,.06);
  tick(dt);
  let dx=Number(Boolean(this.keyboard.D?.isDown||this.keyboard.RIGHT?.isDown))
       -Number(Boolean(this.keyboard.A?.isDown||this.keyboard.LEFT?.isDown))+touch.x;
  let dy=Number(Boolean(this.keyboard.S?.isDown||this.keyboard.DOWN?.isDown))
       -Number(Boolean(this.keyboard.W?.isDown||this.keyboard.UP?.isDown))+touch.y;
  const n=Math.hypot(dx,dy);
  if(!activeModal&&['explore','shift','ready'].includes(state.phase)&&n>.08&&!state.active){
    dx/=Math.max(n,1);dy/=Math.max(n,1);
    const speed=state.sprint>0?332:225;
    const x=clamp(this.player.x+dx*speed*dt,90,1365);
    const y=clamp(this.player.y+dy*speed*dt,507,840);
    if(!blocked(x,this.player.y))this.player.x=x;
    if(!blocked(this.player.x,y))this.player.y=y;
    let direction=Math.abs(dy)>.52?(dy<0?'back':'front'):'side';
    if(state.role==='cat')direction='front';
    if(direction!==this.lastDirection){
      this.player.setTexture(state.role+'-'+direction);
      this.lastDirection=direction;
    }
    this.player.setFlipX(dx<-.1&&direction==='side');
    this.player.angle=Math.sin(t*.024)*2.4;
    this.player.setDepth(this.player.y+3);
  }else this.player.angle*=.88;
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
 window.addEventListener('blur',resetStick);
 bindStick();
 selectAnimation('idle');
 if(!window.Phaser?.Game||!window.Phaser?.Scene){
   $('load-error').hidden=false;return;
 }
 try{
  phaserGame=new Phaser.Game({
    type:Phaser.AUTO,
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
init();
})();
