/* Yencafeday 2D / Phaser 4.2.1. Isolated vertical slice.
 * Vector character graphics are INTERIM placeholders, not approved anime sprites.
 * No tracking, localStorage, cookies or third-party gameplay data.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (x,min,max) => Math.max(min,Math.min(max,x));
  const ROLES = {
    barista: {
      name:'Pha chế',key:'barista',power:'Bàn tay vàng',
      tasks:[
        {at:'counter',title:'Pha ly cà phê đầu ca',text:'Tới quầy pha chế và chuẩn bị ly đầu tiên.'},
        {at:'plant',title:'Tìm chút hương thơm',text:'Đến góc cây xem những chiếc lá đang làm gì.'},
        {at:'counter',title:'Hoàn thiện ly bí mật',text:'Quay lại quầy và hoàn thành món nước.'}
      ]
    },
    waiter:{
      name:'Phục vụ',key:'waiter',power:'Một tay năm ly',
      tasks:[
        {at:'table',title:'Dọn chiếc bàn khách',text:'Dọn bàn trước khi có khách mới.'},
        {at:'counter',title:'Lấy khay nước',text:'Đến quầy lấy những ly đã xong.'},
        {at:'bench',title:'Mang nước tới chỗ ngồi',text:'Mang nước đến ghế dài.'}
      ]
    },
    guard:{
      name:'Bảo vệ',key:'guard',power:'Ánh mắt bảo vệ',
      tasks:[
        {at:'door',title:'Đón người mới tới',text:'Ra cửa quán, chỉ đường cho khách.'},
        {at:'table',title:'Giúp khách chọn bàn',text:'Đến bàn giúp khách ngồi thoải mái.'},
        {at:'bench',title:'Dọn lối đi',text:'Kiểm tra lối ra ghế dài.'}
      ]
    },
    shipper:{
      name:'Shipper',key:'shipper',power:'Giao nước thần tốc',
      tasks:[
        {at:'counter',title:'Nhận ly nước mang đi',text:'Đến quầy nhận nước.'},
        {at:'bike',title:'Kiểm tra chiếc xe',text:'Kiểm tra xe trước khi xuất phát.'},
        {at:'door',title:'Giao đúng người',text:'Mang nước tới khách đang chờ ở cửa.'}
      ]
    },
    cat:{
      name:'Mèo cổ vũ',key:'cat',power:'Meo chữa lành',
      tasks:[
        {at:'plant',title:'Khởi động bằng một cái vươn vai',text:'Đến chậu cây trước khi vào việc.'},
        {at:'table',title:'Kiểm tra khách còn vui không',text:'Tới bàn khách để cổ vũ.'},
        {at:'bench',title:'Ngồi cạnh người cần nghỉ',text:'Đến ghế dài. Có người cần một con mèo.'}
      ]
    }
  };
  const STATIONS = {
    door:{x:185,y:720,label:'Lối vào'},
    counter:{x:1128,y:609,label:'Quầy pha chế'},
    table:{x:480,y:758,label:'Bàn khách'},
    bike:{x:1305,y:745,label:'Xe giao hàng'},
    bench:{x:950,y:790,label:'Ghế dài'},
    plant:{x:228,y:570,label:'Góc cây'}
  };
  const NPCS = [
    {id:'reader',name:'Khách đọc sách',key:'reader',x:360,y:615,lines:['Mình tính đọc một chương. Mới đọc được tựa đề.','Tới quán cà phê mà quên đem sách. Cũng hay.']},
    {id:'guest',name:'Khách chờ bạn',key:'guest',x:685,y:615,lines:['Bạn mình nói năm phút nữa tới.','Mình gọi nước trước. Bạn tới sau thì tự chịu nhé.']},
    {id:'guard',name:'Chú bảo vệ',key:'guard',x:205,y:665,lines:['Xe để đúng chỗ nhé, còn chuyện phiền cứ để ở ngoài.','Con mèo đang bảo vệ ghế. Chú bảo vệ quán.']},
    {id:'barista',name:'Bạn pha chế',key:'barista',x:1217,y:580,lines:['Hôm nay quán thơm mùi cà phê.','Máy pha dễ bảo hơn con người một chút.']},
    {id:'waiter',name:'Bạn phục vụ',key:'waiter',x:803,y:650,lines:['Bạn muốn ngồi đâu thì ngồi. Trừ chỗ cái ly đang đứng.','Đợi mình dọn bàn nhé.']},
    {id:'cat',name:'Mèo Mướp',key:'cat',x:620,y:796,lines:['Meo. (Mướp chớp mắt.)','Mướp đồng ý cho bạn vuốt ve. Tạm thời.']}
  ];
  const PROP_LINES = {
    door:['Bạn chỉnh lại biển ở cửa. Một ngày có vẻ ngay ngắn hơn.','Biển đã thẳng, nhưng vẫn có người hỏi đây có phải quán cà phê không.'],
    counter:['Máy pha kêu bíp. Hôm nay hợp tác tốt.','Máy pha được nghỉ một nhịp.'],
    table:['Bạn nhấc ly khỏi bàn. Bàn bỗng rộng hẳn ra.','Bạn đặt ly lại chỗ cũ.'],
    bike:['Đèn xe sáng. Chưa ai nhờ giao hàng.','Đèn xe tắt. Xe có vẻ hài lòng.'],
    bench:['Bạn chỉnh lại chiếc gối.','Chiếc gối quay về chỗ cũ.'],
    plant:['Cây được tưới nước, im lặng cảm ơn.','Bạn ngắm cây. Cây vẫn bận làm cây.']
  };
  const state = {
    role:'barista',day:1,phase:'setup',done:0,elapsed:0,
    eff:50,peace:70,active:null,powerCooldown:0,sprint:0,shield:false,
    quick:false,nextEvent:25,messageLeft:0,propState:{}
  };
  let selectedRole='barista';
  let world=null;
  let gameInstance=null;
  const touch={x:0,y:0,pointer:null};
  const keys=new Set();
  let lastUiTick=0;
  const storageForbidden = true; // Never persist identity, positions or reward data.

  function timestamp(seconds){
    const s=Math.floor(Math.max(0,seconds));
    return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  }
  function showSpeech(message,seconds=3.5){
    state.messageLeft=seconds;
    $('speech').textContent=message;
    $('speech').hidden=false;
  }
  function hideSpeech() { $('speech').hidden=true;state.messageLeft=0; }
  function setRole(role) {
    if(!ROLES[role])return;
    selectedRole=role;
    for(const card of document.querySelectorAll('[data-role]')){
      card.setAttribute('aria-pressed',String(card.dataset.role===role));
    }
  }
  function toggleObjective(show){
    $('objective-panel').hidden=!show;
    $('objective-toggle').setAttribute('aria-expanded',String(show));
  }
  function updateObjective(){
    const role=ROLES[state.role];
    const label='NGÀY '+String(state.day).padStart(2,'0');
    $('hud-day').textContent=label;
    $('hud-role').textContent=role.name.toUpperCase();
    $('hud-phase').textContent=state.phase==='explore'?'KHÁM PHÁ':state.phase==='ready'?'ĐÃ XONG VIỆC':state.phase==='result'?'KẾT CA':'TRONG CA';
    $('clock').textContent=timestamp(state.elapsed);
    $('shift').hidden=state.phase==='shift'||state.phase==='result';
    if(state.phase==='explore'){
      $('objective-count').textContent=label+' · KHÁM PHÁ TỰ DO';
      $('objective-title').textContent='Cứ chơi trước, làm sau.';
      $('objective-desc').textContent='Đi quanh quán, gặp khách và mèo. Khi nào thích, mở Objective và bắt đầu ca.';
      $('objective-short').textContent='Khám phá';
      $('shift-state').textContent='CHƯA BẮT ĐẦU';
      $('shift').textContent='Bắt đầu ca ↗';
      $('shift').disabled=false;
    } else if(state.phase==='shift'){
      const task=role.tasks[state.done];
      $('objective-count').textContent=label+' · NHIỆM VỤ '+(state.done+1)+'/3';
      $('objective-title').textContent=task.title;
      $('objective-desc').textContent=task.text;
      $('objective-short').textContent=(state.done+1)+'/3';
      $('shift-state').textContent='ĐANG LÀM VIỆC';
    } else if(state.phase==='ready'){
      $('objective-count').textContent=label+' · XONG 3/3';
      $('objective-title').textContent='Hết việc rồi. Bạn muốn đi đâu?';
      $('objective-desc').textContent='Vẫn có thể khám phá. Khi thích, tự kết thúc ca.';
      $('objective-short').textContent='Xong 3/3';
      $('shift-state').textContent='SẴN SÀNG TAN CA';
      $('shift').textContent='Kết thúc ca ↗';
      $('shift').disabled=false;
    }
    updateMarker();
  }
  function updateMarker(){
    if(!world?.marker)return;
    if(state.phase==='shift'&&!state.active){
      const at=ROLES[state.role].tasks[state.done]?.at;
      const pos=STATIONS[at];
      world.marker.setPosition(pos.x,pos.y+8).setVisible(true);
    }else world.marker.setVisible(false);
  }
  function resetDay(){
    state.elapsed=0;state.done=0;state.active=null;
    state.eff=50;state.peace=70;state.nextEvent=25;
    state.powerCooldown=0;state.sprint=0;state.shield=false;state.quick=false;
    state.propState=Object.fromEntries(Object.keys(STATIONS).map(k=>[k,0]));
    world?.resetWorld();
    hideSpeech();
    $('nearby').hidden=true;
    $('interact').disabled=true;
    $('power').disabled=true;
  }
  function enterGame(){
    if(!world)return;
    state.role=selectedRole;state.day=1;state.phase='explore';
    resetDay();
    world.setPlayerRole(state.role);
    $('setup').hidden=true;$('result').hidden=true;$('hud').hidden=false;
    toggleObjective(false);
    updateObjective();
    showSpeech('Một ngày ở Yên bắt đầu. Đi lại, gặp mọi người rồi hãy chọn lúc vào ca.',5);
  }
  function leaveGame(){
    state.phase='setup';
    hideSpeech();
    $('hud').hidden=true;$('result').hidden=true;$('setup').hidden=false;
    toggleObjective(false);
    keys.clear();resetStick();
    $('nearby').hidden=true;
  }
  function startShift(){
    if(state.phase!=='explore')return;
    state.phase='shift';
    resetDay();
    $('power').disabled=false;
    toggleObjective(false);
    updateObjective();
    showSpeech('Ca làm việc bắt đầu. Không có đồng hồ đếm ngược, bạn cứ từ từ.',4);
  }
  function endShift(){
    if(state.phase!=='ready')return;
    state.phase='result';
    $('result-day').textContent='NGÀY '+String(state.day).padStart(2,'0')+' · BIÊN BẢN CA';
    $('result-summary').textContent='Bạn đã làm xong việc của '+ROLES[state.role].name.toLowerCase()+'. Quán vẫn còn nguyên, và ngày mai lại có việc khác.';
    $('result-tasks').textContent=state.done+' / 3';
    $('result-time').textContent=timestamp(state.elapsed);
    $('result-peace').textContent=Math.round(state.peace)+'%';
    $('result').hidden=false;toggleObjective(false);
    updateObjective();
  }
  function nextDay(){
    if(state.phase!=='result')return;
    state.day++;state.phase='explore';
    resetDay();
    $('result').hidden=true;
    toggleObjective(false);
    updateObjective();
    showSpeech('Chào ngày '+state.day+'. Quán đã mở, nhưng chưa ai bắt bạn làm việc.',4);
  }
  function nearestCandidate(){
    if(!world||!world.player||state.phase==='setup'||state.phase==='result'||state.active)return null;
    const {x,y}=world.player;
    let best=null;
    const add=(type,id,name,px,py,target)=>{
      const dist=Math.hypot(x-px,y-py);
      if(dist>135||best&&best.distance<=dist)return;
      best={type,id,name,x:px,y:py,target,distance:dist};
    };
    for(const npc of NPCS)add('npc',npc.id,npc.name,npc.x,npc.y,npc);
    for(const [id,station]of Object.entries(STATIONS))add('prop',id,station.label,station.x,station.y,station);
    if(state.phase==='shift'&&state.done<3){
      const task=ROLES[state.role].tasks[state.done],pos=STATIONS[task.at];
      const dist=Math.hypot(x-pos.x,y-pos.y);
      if(dist<150&&(!best||dist<=best.distance+30))
        return{type:'task',id:task.at,name:task.title,x:pos.x,y:pos.y,target:pos,distance:dist};
    }
    return best;
  }
  function interact(){
    const candidate=nearestCandidate();
    if(!candidate)return;
    if(candidate.type==='task'){
      const task=ROLES[state.role].tasks[state.done];
      state.active={elapsed:0,duration:state.quick?.55:2.1};
      state.quick=false;
      world?.playInteract();
      updateMarker();
      showSpeech('Đang làm: '+task.title,2);
    }else if(candidate.type==='npc'){
      const npc=candidate.target;
      const idx=world.nextDialogue(npc.id);
      world?.playInteract();
      showSpeech(npc.name+': '+npc.lines[idx%npc.lines.length],4);
      state.peace=clamp(state.peace+1,0,100);
    }else{
      const id=candidate.id,next=1-(state.propState[id]||0);
      state.propState[id]=next;
      world.reactToProp(id,next);
      world.playInteract();
      showSpeech(PROP_LINES[id][next?0:1],3.5);
    }
  }
  function finishAction(){
    if(state.phase!=='shift')return;
    state.active=null;state.done++;
    state.eff=clamp(state.eff+13,0,100);
    state.peace=clamp(state.peace+7,0,100);
    if(state.done>=3){
      state.phase='ready';
      showSpeech('Xong cả ba việc! Tự quyết định khi nào kết thúc ca.',5);
    }else showSpeech('Xong một việc. Quán vẫn còn đang mở cửa.',3);
    updateObjective();
  }
  function usePower(){
    if(state.phase!=='shift'||state.powerCooldown>0)return;
    state.powerCooldown=25;
    switch(state.role){
      case 'barista':state.quick=true;showSpeech('Bàn tay vàng: việc kế tiếp sẽ nhanh hơn.',3);break;
      case 'waiter':state.eff=clamp(state.eff+14,0,100);state.peace=clamp(state.peace+6,0,100);showSpeech('Một tay năm ly: mọi người vừa được đỡ việc.',3);break;
      case 'guard':state.peace=clamp(state.peace+12,0,100);state.shield=true;showSpeech('Ánh mắt bảo vệ: trật tự đã trở lại.',3);break;
      case 'shipper':state.sprint=10;showSpeech('Giao hàng thần tốc: chạy nhanh một chút.',3);break;
      case 'cat':state.peace=clamp(state.peace+18,0,100);showSpeech('Meo! Cả quán bỗng thấy dễ chịu hơn.',3);break;
    }
  }
  function tickState(dt){
    if(state.phase==='shift'||state.phase==='ready')state.elapsed+=dt;
    if(state.phase==='shift'){
      state.powerCooldown=Math.max(0,state.powerCooldown-dt);
      state.sprint=Math.max(0,state.sprint-dt);
      if(state.elapsed>=state.nextEvent){
        state.nextEvent+=25;
        if(state.shield){state.shield=false;showSpeech('Chú bảo vệ đã ngăn một sự cố nhỏ.',3);}
        else{
          state.peace=clamp(state.peace-8,0,100);
          showSpeech('Một khách vừa đổi món. Chuyện thường ngày ở quán.',3);
        }
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
    // Walkable floor lanes around the counter, two-seat table and plant.
    if(x>775&&x<1370&&y<578)return true;
    if(x>335&&x<595&&y>641&&y<725)return true;
    if(x>795&&x<1133&&y>673&&y<737)return true;
    if(x<216&&y<600)return true;
    return false;
  }
  function placeCharacter(key,x,y,width=100,height=142){
    const sprite=world.add.image(x,y,key).setDisplaySize(width,height).setOrigin(.5,1);
    sprite.setDepth(y);
    return sprite;
  }
  class YenScene extends Phaser.Scene {
    constructor(){super('YenCafe2D');this.dialogue=new Map();}
    preload(){
      this.load.svg('cafe','./assets/cafe.svg',{width:1440,height:900});
      for(const key of ['barista','guard','shipper','waiter','guest','reader','cat']){
        this.load.svg(key,'./assets/'+key+'.svg',{width:key==='cat'?220:200,height:key==='cat'?230:290});
      }
    }
    create(){
      world=this;
      this.add.image(720,450,'cafe').setDisplaySize(1440,900).setDepth(-100);
      this.cameras.main.setBounds(0,0,1440,900);
      this.npcSprites=[];
      this.dialogue.clear();
      NPCS.forEach(npc=>{
        const isCat=npc.key==='cat';
        const actor=this.add.image(npc.x,npc.y,npc.key)
          .setDisplaySize(isCat?90:97,isCat?94:138).setOrigin(.5,1).setDepth(npc.y);
        const label=this.add.text(npc.x,npc.y-(isCat?106:145),npc.name,{
          fontFamily:'system-ui,Arial',fontSize:'17px',color:'#4b604f',
          backgroundColor:'#fff7eac9',padding:{left:7,right:7,top:4,bottom:4}
        }).setOrigin(.5,1).setDepth(npc.y+1);
        this.npcSprites.push({npc,actor,label});
        this.tweens.add({targets:actor,y:npc.y-3,duration:1700+this.npcSprites.length*112,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      });
      this.player=this.add.image(690,785,'barista').setDisplaySize(115,161)
        .setOrigin(.5,1).setDepth(790);
      this.marker=this.add.circle(0,0,44,0xffdf9e,.20)
        .setStrokeStyle(5,0xffd37f,1).setDepth(1200).setVisible(false);
      this.tweens.add({targets:this.marker,scale:1.15,alpha:.65,duration:850,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      this.interactHalo=this.add.circle(0,0,40,0xfff2c8,.1)
        .setStrokeStyle(4,0xf8dda3,.85).setVisible(false).setDepth(1200);
      for(let i=0;i<3;i++){
        const steam=this.add.ellipse(1036+i*30,287+i*11,11,28,0xfff3dc,.29).setDepth(300);
        this.tweens.add({targets:steam,y:260+i*8,alpha:0,scaleX:.55,duration:1900+i*230,repeat:-1,yoyo:true,ease:'Sine.inOut'});
      }
      this.cameras.main.startFollow(this.player,true,.08,.08);
      this.input.keyboard?.on('keydown-E',()=>interact());
      this.input.keyboard?.on('keydown-Q',()=>usePower());
      this.keys=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT')||{};
      this.scale.on('resize',()=>this.setZoom());
      this.setZoom();
      this.events.once('shutdown',()=>{world=null;});
      resetDay();
      updateObjective();
      $('enter').disabled=false;
    }
    setZoom(){
      const zoom=clamp(Math.min(this.scale.width/1000,this.scale.height/760),.61,1.05);
      this.cameras.main.setZoom(zoom);
    }
    setPlayerRole(role){
      if(!this.player||!this.textures.exists(ROLES[role].key))return;
      this.player.setTexture(ROLES[role].key);
      this.player.setDisplaySize(role==='cat'?100:116,role==='cat'?112:163);
    }
    resetWorld(){
      if(!this.player)return;
      this.player.setPosition(690,785).setFlipX(false);
      this.player.setDepth(785);
      this.dialogue.clear();
      this.reactToProp('table',0);
      this.reactToProp('counter',0);
      this.marker?.setVisible(false);
      this.interactHalo?.setVisible(false);
    }
    nextDialogue(id){
      const number=this.dialogue.get(id)||0;
      this.dialogue.set(id,number+1);
      return number;
    }
    reactToProp(id,next){
      if(id==='counter')this.cameras.main.shake(125,.001);
      if(id==='table')this.tweens.add({targets:this.npcSprites.find(v=>v.npc.id==='reader')?.actor,angle:next?-3:0,duration:220});
      if(id==='plant')this.cameras.main.flash(100,247,225,171,false);
    }
    playInteract(){
      this.tweens.add({targets:this.player,scaleX:.61,scaleY:.54,duration:130,yoyo:true,ease:'Sine.inOut'});
    }
    update(time,delta){
      if(!this.player||state.phase==='setup'||state.phase==='result')return;
      const dt=Math.min(delta/1000,.05);
      tickState(dt);
      let dx=(this.keys.D?.isDown||this.keys.RIGHT?.isDown?1:0)
        -(this.keys.A?.isDown||this.keys.LEFT?.isDown?1:0)+touch.x;
      let dy=(this.keys.S?.isDown||this.keys.DOWN?.isDown?1:0)
        -(this.keys.W?.isDown||this.keys.UP?.isDown?1:0)+touch.y;
      const length=Math.hypot(dx,dy);
      if(length>.08&&!state.active){
        dx/=Math.max(1,length);dy/=Math.max(1,length);
        const speed=state.sprint>0?340:217;
        const nx=clamp(this.player.x+dx*speed*dt,105,1340);
        const ny=clamp(this.player.y+dy*speed*dt,510,817);
        if(!blocked(nx,this.player.y))this.player.x=nx;
        if(!blocked(this.player.x,ny))this.player.y=ny;
        this.player.setFlipX(dx<-.08);
        this.player.setDepth(this.player.y+4);
        // Interim sway: production sprites need true directional walk cycles.
        this.player.angle=Math.sin(time*.018)*1.4;
      }else{
        this.player.angle*=.85;
      }
      const near=nearestCandidate();
      $('interact').disabled=!near;
      if(near){
        $('nearby').hidden=false;
        $('nearby').textContent=(near.type==='task'?'Làm nhiệm vụ: ':'E · ')+near.name;
        this.interactHalo.setPosition(near.x,near.y+12).setVisible(true);
      }else{
        $('nearby').hidden=true;
        this.interactHalo.setVisible(false);
      }
      if(time-lastUiTick>180){
        $('clock').textContent=timestamp(state.elapsed);
        $('power').disabled=state.phase!=='shift'||state.powerCooldown>0;
        lastUiTick=time;
      }
      if(state.active&&state.messageLeft<=0)showSpeech('Đang thực hiện: '+ROLES[state.role].tasks[state.done].title,1);
    }
  }

  function bindStick(){
    const area=$('stick'),ring=area.querySelector('.ring');
    function move(event){
      const rect=ring.getBoundingClientRect();
      const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
      const dx=event.clientX-cx,dy=event.clientY-cy;
      const ratio=Math.min(1,34/Math.max(1,Math.hypot(dx,dy)));
      touch.x=clamp(dx/34,-1,1)*ratio;
      touch.y=clamp(dy/34,-1,1)*ratio;
      $('thumb').style.transform='translate('+touch.x*33+'px,'+touch.y*33+'px)';
    }
    area.addEventListener('pointerdown',event=>{
      if(state.phase==='setup'||state.phase==='result')return;
      touch.pointer=event.pointerId;area.setPointerCapture(event.pointerId);
      move(event);event.preventDefault();
    });
    area.addEventListener('pointermove',event=>{
      if(touch.pointer===event.pointerId)move(event);
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture']){
      area.addEventListener(type,event=>{if(touch.pointer===event.pointerId)resetStick();});
    }
  }
  function resetStick(){
    touch.x=0;touch.y=0;touch.pointer=null;
    $('thumb').style.transform='translate(0,0)';
  }

  function init(){
    document.querySelectorAll('[data-role]').forEach(button=>{
      button.addEventListener('click',()=>setRole(button.dataset.role));
    });
    $('enter').disabled=true;
    $('enter').addEventListener('click',enterGame);
    $('leave').addEventListener('click',leaveGame);
    $('objective-toggle').addEventListener('click',()=>toggleObjective($('objective-panel').hidden));
    $('shift').addEventListener('click',()=>{
      if(state.phase==='explore')startShift();
      else if(state.phase==='ready')endShift();
    });
    $('next-day').addEventListener('click',nextDay);
    $('interact').addEventListener('click',interact);
    $('power').addEventListener('click',usePower);
    window.addEventListener('blur',()=>{keys.clear();resetStick();});
    bindStick();

    if(!window.Phaser?.Game||!window.Phaser?.Scene){
      $('error').hidden=false;
      return;
    }
    try{
      gameInstance=new Phaser.Game({
        type:Phaser.AUTO,backgroundColor:'#e3c39e',
        parent:'scene',width:1200,height:760,
        scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
        render:{pixelArt:false,antialias:true},
        scene:[YenScene]
      });
    }catch(error){
      console.error('Could not initialize Yên 2D',error);
      $('error').hidden=false;
    }
  }
  init();
})();
