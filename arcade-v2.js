/* Cục Yên Arcade v2. Canvas mini-game engine, intentionally ephemeral and self-contained. */
(function(){
'use strict';
function boot(){
  const stage=document.getElementById('yarc-stage');
  const panel=document.getElementById('yarc-shell');
  if(!stage||!panel)return;
  const ctx=stage.getContext('2d',{alpha:false});
  if(!ctx){document.getElementById('yarc-message').textContent='Trình duyệt này chưa hỗ trợ trò chơi. Cục Yên xin lỗi nha.';return;}
  const ui={
    title:document.getElementById('yarc-title'),
    guide:document.getElementById('yarc-guide'),
    kicker:document.getElementById('yarc-kicker'),
    msg:document.getElementById('yarc-message'),
    dots:document.getElementById('yarc-dots'),
    score:document.getElementById('yarc-score'),
    action:document.getElementById('yarc-action'),
    swap:document.getElementById('yarc-switch'),
    sound:document.getElementById('yarc-sound'),
    hint:document.getElementById('yarc-legend'),
    flash:document.getElementById('yarc-float')
  };
  const W=720,H=400;
  const PI=Math.PI,TAU=PI*2;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const games=[
    {name:'Búng bay cục phiền',tag:'01 / PHIỀN PHỨC CÓ THỂ BÚNG',guide:'Kéo cục hồng về sau rồi thả. Bắn trúng cả 3 mục tiêu!',button:'Búng hộ tui',hint:'KÉO · THẢ · HOẶC CHẠM ĐỂ BẮN'},
    {name:'Tòa án Cục Yên',tag:'02 / CỐC MỘT CÁI, RA LUẬT',guide:'Nhấn giữ để lấy lực. Thả tay cho búa xử án.',button:'Đập búa!',hint:'GIỮ & THẢ · HOẶC BẤM BÚA'},
    {name:'Máy đổi phiền lấy xàm',tag:'03 / BA CUỘN VÔ DỤNG',guide:'Kéo cần xuống để quay, chạm từng cuộn để dừng.',button:'Kéo cần quay',hint:'KÉO CẦN · CHẠM CUỘN ĐỂ DỪNG'},
    {name:'Thùng rác có thái độ',tag:'04 / RÁC CŨNG BIẾT CÃI',guide:'Kéo giấy vào thùng đang lắc lư. Coi chừng nó cãi.',button:'Ném hộ tui',hint:'KÉO THẢ · HOẶC CHẠM TỜ GIẤY'}
  ];
  const cases=[
    {short:'SẾP DÍ',long:'Sếp dí deadline',verdict:'Deadline bị phạt đi làm thêm. Bạn được nghỉ uống nước.',bin:'Thùng nuốt xong xin nghỉ phép vì quá tải.'},
    {short:'SEEN',long:'Bị seen không rep',verdict:'Dấu đã xem phải đi học lớp trả lời tin nhắn.',bin:'Thùng đã xem. Thùng cũng không trả lời.'},
    {short:'HỌP',long:'Họp dài hai tiếng',verdict:'Phạt cái bàn ngồi họp thêm. Người được về.',bin:'Thùng ngủ quên. Giờ bắt thùng viết biên bản.'},
    {short:'THỨ HAI',long:'Thứ Hai tới quá nhanh',verdict:'Tòa dời thứ Hai sang thứ Tư. Thứ Tư đang kháng cáo.',bin:'Thùng nhai thứ Hai, nghẹn tới thứ Ba.'},
    {short:'TÌNH CŨ',long:'Người yêu cũ thả tim',verdict:'Tội khai quật di tích không giấy phép. Đóng bảo tàng.',bin:'Thùng nhổ ra: “Tình cũ này không tái chế nổi!”'},
    {short:'HẾT TIỀN',long:'Cuối tháng hết tiền',verdict:'Số dư bị yêu cầu xuất hiện. Nó đã bỏ trốn.',bin:'Thùng nói: “Tui cũng không có đồng nào!”'},
    {short:'WI-FI',long:'Wi-Fi giật liên tục',verdict:'Cục Wi-Fi phải đứng góc suy nghĩ về tốc độ.',bin:'Thùng đang xử lý: 1%... 1%... vẫn 1%.'},
    {short:'TIN NHẮN',long:'Nhắn nhầm nhóm chat',verdict:'Cho thu hồi tin. Tiếc là cả nhóm đã chụp màn hình.',bin:'Thùng xóa được tin, không xóa trí nhớ đồng nghiệp.'},
    {short:'KHOAN',long:'Hàng xóm khoan 6 giờ',verdict:'Máy khoan phải nghe nhạc ru ngủ ba ngày.',bin:'Thùng ăn xong cũng phát ra tiếng khoan.'},
    {short:'MẤT NGỦ',long:'Mất ngủ vì nghĩ nhiều',verdict:'Phạt não đóng bớt tab. Não hỏi tab nào?',bin:'Thùng bảo: “Đưa não đây tui xếp lại.” Thôi khỏi!'}
  ];
  const slotThings=['GIẤY PHÉP','HUY CHƯƠNG','THẺ VIP','VÉ MỘT CHIỀU','TEM KIỂM ĐỊNH','BẰNG KHEN','PHIẾU THU'];
  const slotEffects=['LƯỜI HỢP PHÁP','NGỦ GẬT','CHỐNG DRAMA','THỞ PHÀO','NẠP LẠI NÃO','GIẢ VỜ BẬN','MẶC KỆ TẤT CẢ'];
  const slotTerms=['CỤC YÊN KÝ','DÙNG 99 NĂM','0Đ','KHÔNG BẢO HÀNH','KHÔNG AI DUYỆT','TẠM THỜI','HẾT PIN'];
  const colors=['#f0ad99','#c5c6ed','#b5dbb2','#e4c88b','#b2d9e5'];
  const R=n=>Math.random()*n;
  const ri=n=>Math.floor(R(n));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
  let mode=0,round=0,running=false,visible=true,previous=0;
  let particles=[],soundOn=false,audio=null,casePick=0,caseSet=[];
  let blob=null,court=null,slot=null,trash=null;
  let timers=[],floatTimer=0;
  function later(fn,ms){const id=window.setTimeout(fn,ms);timers.push(id);return id;}
  function clearTimers(){timers.forEach(clearTimeout);timers=[];clearTimeout(floatTimer);}
  function shuffleCases(){
    const a=cases.map((_,i)=>i);
    for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function say(str){ui.msg.textContent=str;}
  function float(str){
    const old=ui.flash.querySelector('.yarc-float-label');if(old)old.remove();
    const el=document.createElement('span');el.className='yarc-float-label';el.textContent=str;ui.flash.appendChild(el);
    clearTimeout(floatTimer);floatTimer=window.setTimeout(()=>el.remove(),reduce?1100:1550);
  }
  function shake(){
    panel.classList.remove('yarc-shake');void panel.offsetWidth;panel.classList.add('yarc-shake');
    later(()=>panel.classList.remove('yarc-shake'),320);
    if(!reduce){const el=document.createElement('div');el.className='yarc-flash';ui.flash.appendChild(el);later(()=>el.remove(),410);}
  }
  function sfx(freq=260,duration=.11,wave='triangle',volume=.06){
    if(!soundOn)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      if(!audio)audio=new AC();
      if(audio.state==='suspended')audio.resume();
      const osc=audio.createOscillator(),gain=audio.createGain();
      osc.type=wave;osc.frequency.setValueAtTime(freq,audio.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(65,freq*.63),audio.currentTime+duration);
      gain.gain.setValueAtTime(volume,audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);
      osc.connect(gain);gain.connect(audio.destination);
      osc.start();osc.stop(audio.currentTime+duration+.02);
    }catch(_e){}
  }
  function burst(x,y,color,n=16){
    for(let i=0;i<n;i++){const a=R(TAU),v=95+R(265);
      particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,l:.6+R(.55),life:1,size:3+R(6),rot:R(TAU),spin:R(7)-3.5,color:color||colors[ri(colors.length)]});
    }
    if(particles.length>160)particles.splice(0,particles.length-160);
  }
  function updateParticles(dt){
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];p.l-=dt;p.vy+=370*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;
      if(p.l<=0)particles.splice(i,1);
    }
  }
  function particlePaint(){
    for(const p of particles){
      ctx.save();ctx.globalAlpha=clamp(p.l/.65,0,1);ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.65);ctx.restore();
    }
  }
  function box(x,y,w,h,r,fill,stroke='#0000',sw=1){
    ctx.beginPath();if(typeof ctx.roundRect==='function')ctx.roundRect(x,y,w,h,r);else{const rr=Math.max(0,Math.min(r,Math.abs(w)/2,Math.abs(h)/2));ctx.moveTo(x+rr,y);ctx.lineTo(x+w-rr,y);ctx.quadraticCurveTo(x+w,y,x+w,y+rr);ctx.lineTo(x+w,y+h-rr);ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);ctx.lineTo(x+rr,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-rr);ctx.lineTo(x,y+rr);ctx.quadraticCurveTo(x,y,x+rr,y);ctx.closePath();}ctx.fillStyle=fill;ctx.fill();
    if(stroke!=='#0000'){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function circ(x,y,r,fill,stroke='#0000',sw=1){
    ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=fill;ctx.fill();
    if(stroke!=='#0000'){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function line(x1,y1,x2,y2,color='#42624d',width=3){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineCap='round';ctx.stroke();
  }
  function text(str,x,y,size=18,color='#2e4d3a',weight=800,align='center'){
    ctx.font=weight+' '+size+'px "Noto Sans",Arial,sans-serif';
    ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(String(str),x,y);
  }
  function face(x,y,r,happy=true,base='#e6eec1'){
    circ(x,y,r,base,'#31503f',3);
    circ(x-r*.28,y-r*.09,r*.072,'#2c493d');circ(x+r*.28,y-r*.09,r*.072,'#2c493d');
    circ(x-r*.47,y+r*.19,r*.13,'#eeaca2');circ(x+r*.47,y+r*.19,r*.13,'#eeaca2');
    ctx.beginPath();ctx.arc(x,y+r*.16,r*.2,happy?.05*PI:1.07*PI,happy?.95*PI:1.93*PI,!happy);
    ctx.strokeStyle='#31503f';ctx.lineWidth=3;ctx.stroke();
  }
  function background(a,b){
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,a);g.addColorStop(1,b);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ffffff2c';
    for(let row=0;row<9;row++)for(let col=0;col<16;col++)circ(col*49+22,row*49+22,1.3,'#ffffff55');
  }
  function wiggle(w=1){return reduce?0:Math.sin(performance.now()*.0018)*w;}
  function hud(label,count,max,extra=''){
    ui.dots.innerHTML='<b>'+label+'</b>'+Array.from({length:max},(_,i)=>'<i class="yarc-dot'+(i<count?' done':'')+'"></i>').join('');
    ui.score.textContent=extra;
  }
  function controls(label,replay='Chơi lại'){
    ui.action.textContent=label;
    document.getElementById('yarc-replay').textContent=replay;
  }
  function initGame(which,initial=false){
    round++;clearTimers();particles=[];mode=which;previous=which;caseSet=shuffleCases().slice(0,3);casePick=caseSet[0];
    blob=null;court=null;slot=null;trash=null;
    ui.flash.innerHTML='';ui.kicker.textContent=games[mode].tag;ui.title.textContent=games[mode].name;
    ui.guide.textContent=games[mode].guide;ui.hint.textContent=games[mode].hint;
    ui.action.disabled=false;
    if(mode===0){
      blob={x:116,y:298,ax:116,ay:298,vx:0,vy:0,r:37,phase:'ready',drag:false,id:null,shots:0,hits:0,elapsed:0,rest:0,
        targets:[{x:474,y:96,r:40,label:'SEEN',alive:true},{x:598,y:217,r:43,label:'HỌP',alive:true},{x:428,y:296,r:40,label:'DEADLINE',alive:true}]};
      say('Nhắm ba cục phiền. Cục Yên trông chừng, bạn cứ búng.');
      controls('Búng tự động','Đặt lại 3 cục');hud('TRÚNG',0,3,'0 CÚ BÚNG');
    }else if(mode===1){
      court={cases:caseSet,idx:0,strength:0,hold:0,phase:'ready',impact:0,stamp:0,quality:'',score:0,down:false};
      say('Phiên tòa mở! Nhấn giữ để tích lực, rồi thả búa.');
      controls('Đập búa','Mở phiên mới');hud('ĐÃ XỬ',0,3,'TÒA RẤT NGHIÊM');
    }else if(mode===2){
      slot={reels:[0,0,0].map((_,i)=>({pos:ri(7),spinning:false,value:ri(7),stopped:true,speed:12+i*5})),phase:'ready',spins:0,results:0,lever:0,drag:false,t0:0};
      say('Kéo cần bên phải xuống để quay. Ba cuộn có ba cái nết.');
      controls('Quay cả 3 cuộn','Đổi máy mới');hud('CUỘN DỪNG',0,3,'0 QUÀ XÀM');
    }else{
      trash={items:caseSet.map((id,i)=>({id,x:125+i*185,y:336,homeX:125+i*185,homeY:336,done:false,drag:false,flight:false,vx:0,vy:0})),
        eaten:0,tries:0,binX:510,binY:204,over:false,chew:0,spit:0,phase:'ready',dragId:null};
      say('Thùng tự chọn chỗ đứng. Thả giấy trúng miệng nó xem.');
      controls('Ném hộ tui','Dọn thùng lại');hud('ĐÃ XỬ',0,3,'THÙNG ĐANG ĐÓI');
    }
    if(initial)float('CỤC YÊN BỐC TRÚNG TRÒ NÀY!');
  }
  function paintBlob(time){
    background('#f6eddd','#f2d8cf');
    ctx.fillStyle='#edd3bf';ctx.fillRect(0,352,W,48);
    line(0,352,W,352,'#c6ac94',3);
    box(20,22,228,34,13,'#fff8e8','#bd9a84',2);text('MỤC TIÊU: BÚNG 3 CỤC PHIỀN',134,39,12,'#7a614e',900);
    for(const t of blob.targets){
      if(!t.alive)continue;
      circ(t.x+3,t.y+5,t.r+4,'#bfa99755');
      face(t.x,t.y,t.r,false,t.label==='SEEN'?'#c8b6e6':t.label==='HỌP'?'#b6d5cd':'#f2c999');
      text(t.label,t.x,t.y+t.r+20,13,'#795c50',900);
    }
    box(68,329,98,19,6,'#ad8265','#7f6350',2);
    circ(blob.ax,blob.ay+35,52,'#aa826044');
    const b=blob;
    if(b.phase==='ready'||b.phase==='aim'){
      line(83,313,b.x-18,b.y+4,'#a47c68',6);
      line(148,313,b.x+18,b.y+4,'#a47c68',6);
      if(b.drag){
        const vx=(b.ax-b.x)*5.2+130,vy=(b.ay-b.y)*5.2-110;
        ctx.setLineDash([5,10]);
        for(let i=1;i<9;i++){
          const t=i*.10;const xx=b.ax+vx*t,yy=b.ay+vy*t+300*t*t;
          circ(xx,yy,Math.max(2,6-i*.47),'#4b7d61bb');
        }
        ctx.setLineDash([]);
      }
    }
    ctx.save();ctx.translate(b.x,b.y);
    const stretch=b.phase==='fly'?clamp(Math.abs(b.vx)/600,0,.23):0;
    ctx.rotate(b.phase==='fly'?clamp(b.vy/1000,-.4,.4):0);
    ctx.scale(1+stretch,1-stretch*.6);
    face(0,0,b.r,true,'#efaf9e');
    line(-16,-20,-7,-22,'#60443e',3);line(7,-22,16,-20,'#60443e',3);
    ctx.restore();
    if(b.phase==='ready')text('← KÉO CỤC HỒNG',174,372,12,'#916d5e',900);
    if(b.phase==='done')text('SẠCH BÓNG CỤC PHIỀN!',365,368,22,'#73513f',900);
  }
  function blobShoot(auto){
    if(!blob||blob.phase==='fly'||blob.phase==='done')return;
    const b=blob,alive=b.targets.filter(x=>x.alive);
    if(!alive.length)return;
    if(auto||Math.hypot(b.ax-b.x,b.ay-b.y)<12){
      const target=alive[0],dx=target.x-b.ax,dy=target.y-b.ay;
      b.x=b.ax;b.y=b.ay;
      const travel=.72;
      b.vx=dx/travel;b.vy=(dy-280*travel*travel)/travel;
    }else{
      b.vx=clamp((b.ax-b.x)*5.4+130,230,820);
      b.vy=clamp((b.ay-b.y)*5.4-130,-740,320);
    }
    b.phase='fly';b.drag=false;b.elapsed=0;b.rest=0;b.shots++;
    sfx(370,.09,'sine',.065);say('VÚT! Cục phiền đang có chuyến bay không mua vé.');
    hud('TRÚNG',b.hits,3,b.shots+' CÚ BÚNG');
  }
  function updateBlob(dt){
    if(!blob||blob.phase!=='fly')return;
    const b=blob;b.elapsed+=dt;b.vy+=690*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx)*.55;sfx(130,.07);}
    if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*.53;}
    if(b.y<44){b.y=44;b.vy=Math.abs(b.vy)*.48;}
    if(b.y>350-b.r){b.y=350-b.r;b.vy=-Math.abs(b.vy)*.48;b.vx*=.78;if(Math.abs(b.vy)<35)b.vy=0;}
    for(const t of b.targets){
      if(!t.alive||dist(b.x,b.y,t.x,t.y)>b.r+t.r-10)continue;
      t.alive=false;b.hits++;burst(t.x,t.y,'#ecc37c',24);shake();sfx(170,.2,'sawtooth',.065);
      b.vx*=-.35;b.vy=-260;
      float(['BỤP!','TRÚNG CHỖ NGỨA!','CỤC YÊN VỖ TAY!'][ri(3)]);
      hud('TRÚNG',b.hits,3,b.shots+' CÚ BÚNG');
      if(b.hits===3){b.phase='done';say('ĐẬP SẠCH! Cục Yên quét xong còn tìm thấy một chiếc dép.');controls('Chơi lượt mới','Đặt lại 3 cục');burst(360,158,'#e8a176',55);}
      else {say('Trúng rồi! Còn '+(3-b.hits)+' cục phiền. Bắn tiếp!');later(()=>resetBlob(),680);}
      return;
    }
    if(Math.abs(b.vx)<45&&Math.abs(b.vy)<45&&b.y>300)b.rest+=dt;
    else b.rest=0;
    if(b.elapsed>3.3||b.rest>.38){b.phase='returning';say('Trượt mất rồi. Cục Yên kéo cục phiền về cho búng tiếp.');later(()=>resetBlob(),380);}
  }
  function resetBlob(){
    if(!blob||blob.phase==='done')return;
    Object.assign(blob,{x:blob.ax,y:blob.ay,vx:0,vy:0,phase:'ready',drag:false,id:null});
  }
  function paintCourt(time){
    background('#f4e5c7','#e9c89c');
    for(let i=0;i<7;i++){line(i*118-50,0,i*118+30,120,'#ecd1a8',2);}
    box(42,20,636,58,15,'#fff7dd','#966946',3);
    text('TÒA ÁN CỤC YÊN · XỬ RẤT CHỦ QUAN',360,48,19,'#755239',900);
    face(360,146,49,true,'#d4dfba');
    ctx.fillStyle='#e7d7ae';ctx.beginPath();ctx.moveTo(309,121);ctx.lineTo(336,98);ctx.lineTo(355,113);ctx.lineTo(376,92);ctx.lineTo(411,125);ctx.closePath();ctx.fill();
    box(118,195,485,87,11,'#bf8053','#785036',4);
    box(140,186,441,18,8,'#dda873','#785036',3);
    text('VỤ '+(court.idx+1)+'/3  ·  '+cases[court.cases[court.idx]].short,360,232,19,'#fff5d9',900);
    text('TÒA CÓ THỂ KHÔNG ĐÚNG, NHƯNG ĐẬP BÚA RẤT TO',360,258,11,'#f8deb6',800);
    const strength=court.phase==='charging'?court.strength:court.quality?court.strength:0;
    box(128,310,460,20,10,'#f8e7bd','#9b7854',2);
    box(133,315,450*strength,10,5,strength>.68?'#db9873':'#90b999');
    box(438,308,72,24,7,'#edd7a2aa','#bf8b4d',2);
    text('ĐỦ LỰC',474,298,10,'#8a6346',900);
    const bounce=court.impact>0?Math.sin((1-court.impact)*17)*court.impact*18:0;
    ctx.save();ctx.translate(606,142+bounce);ctx.rotate(court.phase==='charging'?-0.4:0.27);
    box(-12,-12,24,115,10,'#a3704d','#6b4a31',3);
    box(-55,-39,110,39,8,'#ad7c54','#6b4a31',4);
    ctx.restore();
    if(court.phase==='ready'||court.phase==='charging')text('NHẤN GIỮ → THẢ BÚA',360,357,14,'#856446',900);
    if(court.phase==='verdict'){text('CÓ TỘI!',360,365,29,'#af5948',900);}
  }
  function courtDown(){if(!court||court.phase!=='ready')return;court.phase='charging';court.hold=performance.now();court.strength=0;sfx(430,.08,'sine',.035);}
  function courtUp(auto=false){
    if(!court||court.phase==='verdict')return;
    if(court.phase!=='charging'){courtDown();auto=true;}
    const held=performance.now()-court.hold;
    court.strength=auto?(.68+R(.27)):clamp(Math.max(held,160)/1150,0,1);
    court.phase='verdict';court.impact=1;court.stamp=1;court.score++;
    const strong=court.strength>=.67;
    sfx(strong?125:205,.2,'square',.075);shake();burst(350,207,'#e0a35d',25);
    float(strong?'CỐC!! ĐỦ LỰC!':'CỐC... NHẸ QUÁ!');
    say((strong?'CỐC! ':'Cốc nhẹ. ')+'BẢN ÁN: '+cases[court.cases[court.idx]].verdict);
    hud('ĐÃ XỬ',court.score,3,strong?'BÚA RẤT CÓ UY':'BÚA HƠI NGẠI');
    controls(court.idx===2?'Mở phiên mới':'Xử vụ tiếp','Mở phiên mới');
    if(court.idx===2)burst(360,190,'#f6d9a1',38);
  }
  function updateCourt(dt){
    if(!court)return;
    if(court.phase==='charging')court.strength=clamp((performance.now()-court.hold)/1150,0,1);
    court.impact=Math.max(0,court.impact-dt*2.2);
    court.stamp=Math.max(0,court.stamp-dt*.5);
  }
  function nextCourt(){
    if(court.phase==='verdict'&&court.idx<2){court.idx++;court.phase='ready';court.strength=0;court.quality='';say('Vụ kế tiếp! Cục Yên đang lau búa.');controls('Đập búa','Mở phiên mới');}
    else initGame(1);
  }
  function paintSlot(time){
    background('#d5e6da','#bcd4d3');
    box(61,28,573,315,30,'#80ad9a','#3b6356',6);
    box(77,42,525,59,18,'#e4b77e','#52786a',3);
    text('MÁY ĐỔI PHIỀN LẤY XÀM',340,69,26,'#385b4b',900);
    box(79,108,528,171,18,'#e8f4e3','#426c59',4);
    const groups=[slotThings,slotEffects,slotTerms];
    for(let i=0;i<3;i++){
      const x=96+i*163,rec=slot.reels[i],arr=groups[i],pos=rec.pos;
      box(x,124,150,133,14,'#fffdf2','#6b9882',3);
      ctx.save();ctx.beginPath();ctx.rect(x+6,130,138,119);ctx.clip();
      const nearest=Math.round(pos);
      for(let offset=-1;offset<=1;offset++){
        const idx=((nearest+offset)%arr.length+arr.length)%arr.length;
        const y=190+((nearest+offset)-pos)*69;
        text(arr[idx],x+75,y,arr[idx].length>14?11:13,offset===0?'#315746':'#a3b8a8',offset===0?900:700);
      }
      ctx.restore();
      if(rec.spinning){line(x+10,241,x+140,241,'#99b7a8',2);}
      if(rec.stopped&&slot.phase!=='ready')circ(x+130,141,5,'#e4ab79');
    }
    box(625,118,57,180,20,'#dee8ce','#47725b',3);
    line(652,149,652,238,'#426f58',9);
    circ(652,150+slot.lever*85,23,'#efae95','#785548',4);
    text('KÉO',652,295,13,'#3d6651',900);
    box(125,301,470,28,11,'#416b58');
    text(slot.phase==='spinning'?'CHẠM TỪNG CUỘN ĐỂ DỪNG':slot.phase==='ready'?'KÉO CẦN ĐỂ BẮT ĐẦU QUAY':'MÓN QUÀ NÀY KHÔNG CÓ TÁC DỤNG',360,315,13,'#fff9e5',900);
    if(slot.phase==='done'){text('BẠN ĐÃ ĐƯỢC NHẬN QUÀ XÀM!',356,372,17,'#416b58',900);}
  }
  function startSlot(){
    if(!slot||slot.phase==='spinning')return;
    slot.phase='spinning';slot.lever=1;slot.spins++;
    slot.reels.forEach((r,i)=>{r.spinning=true;r.stopped=false;r.speed=12+i*4+R(2);});
    say('RÈ RÈ RÈ! Chạm từng cuộn để dừng, hoặc để máy tự chọn.');
    controls('Dừng cuộn','Đổi máy mới');hud('CUỘN DỪNG',0,3,slot.spins+' LƯỢT QUAY');
    sfx(510,.12,'square',.04);
    for(let i=0;i<3;i++){
      later(()=>{if(slot&&slot.phase==='spinning'&&slot.reels[i].spinning)stopReel(i);},3300+i*500);
    }
  }
  function stopReel(i){
    if(!slot||slot.phase!=='spinning'||!slot.reels[i]||!slot.reels[i].spinning)return;
    const reel=slot.reels[i],arr=[slotThings,slotEffects,slotTerms][i];
    reel.spinning=false;reel.value=((Math.round(reel.pos)%arr.length)+arr.length)%arr.length;reel.pos=reel.value;reel.stopped=true;
    const done=slot.reels.filter(r=>r.stopped).length;
    sfx(230+i*110,.09,'triangle',.055);hud('CUỘN DỪNG',done,3,slot.spins+' LƯỢT QUAY');
    if(done===3){
      slot.phase='done';const final=slotThings[slot.reels[0].value]+' '+slotEffects[slot.reels[1].value]+' · '+slotTerms[slot.reels[2].value];
      say('ĐỔI THÀNH CÔNG! '+final+'. Không nhận trả hàng vì chưa thu tiền.');float('HÀNG XÀM CÓ CHỦ RỒI!');
      burst(355,174,'#e8b875',34);shake();controls('Quay tiếp','Đổi máy mới');
    }else say('CỘC! '+done+'/3 cuộn dừng. Chạm tiếp cho đã!');
  }
  function updateSlot(dt){
    if(!slot)return;
    slot.lever=Math.max(0,slot.lever-dt*.9);
    if(slot.phase==='spinning')slot.reels.forEach(r=>{if(r.spinning)r.pos=(r.pos+r.speed*dt)%7;});
  }
  function paintTrash(time){
    background('#deeadf','#b5d2b5');
    ctx.fillStyle='#adc4a8';ctx.fillRect(0,360,W,40);
    line(0,359,W,359,'#769d81',3);
    for(let i=0;i<9;i++){circ(i*90+20,31,3,'#9ab99f');}
    const t=trash;
    box(26,20,254,33,12,'#fffdf1','#88ac90',2);text('RÁC CŨNG BIẾT CÃI',153,37,13,'#486e50',900);
    ctx.save();ctx.translate(t.binX,t.binY);
    circ(0,104,76,'#618b7155');
    box(-66,-46,132,138,15,t.over?'#dece82':'#9fc3a0','#365a45',5);
    ctx.save();ctx.translate(-65,-49);ctx.rotate(t.chew>0?-.35:(t.over?-.22:0));box(-10,-13,152,23,9,'#4b8060','#335c43',4);ctx.restore();
    circ(-27,4,7,'#2b4c3b');circ(27,4,7,'#2b4c3b');
    box(-20,40,40,t.chew>0?24:10,8,'#2d503c');
    if(t.spit>0){text('PHỤT!',0,-75,22,'#ac654c',900);}
    ctx.restore();
    for(const item of t.items){
      if(item.done)continue;
      ctx.save();ctx.translate(item.x,item.y);
      ctx.rotate(item.drag?Math.sin(time*7)*.06:item.flight?item.vx*.00025:0);
      box(-64,-28,128,53,10,'#fffaea','#a88c6a',3);
      text(cases[item.id].short,0,-5,14,'#5b5644',900);
      line(-40,9,40,9,'#cfbf9f',2);
      ctx.restore();
    }
    text('THÙNG ĐANG NÉ   ↔',t.binX,324,11,'#597f62',900);
  }
  function updateTrash(dt,time){
    if(!trash)return;
    const t=trash;
    if(t.chew>0)t.chew=Math.max(0,t.chew-dt);
    if(t.spit>0)t.spit=Math.max(0,t.spit-dt);
    if(!t.over)t.binX=495+Math.sin(time*1.2)*72;
    for(const item of t.items){
      if(!item.flight||item.done)continue;
      item.vy+=530*dt;item.x+=item.vx*dt;item.y+=item.vy*dt;
      if(dist(item.x,item.y,t.binX,t.binY)<80){feedTrash(item);continue;}
      if(item.y>375||item.x>W+80||item.x< -80){item.flight=false;item.x=item.homeX;item.y=item.homeY; }
    }
  }
  function feedTrash(item){
    if(!trash||item.done)return;
    item.done=true;item.drag=false;item.flight=false;
    trash.eaten++;trash.tries++;
    const reject=ri(4)===0;
    trash.chew=reject?0:.65;trash.spit=reject?.75:0;
    burst(trash.binX,trash.binY,'#f1be8a',24);shake();sfx(reject?190:110,.15,'sawtooth',.065);
    say((reject?'PHỤT! ':'ỘP! ')+cases[item.id].bin);
    float(reject?'THÙNG CHÊ!':'ĂN RỒI!');
    hud('ĐÃ XỬ',trash.eaten,3,trash.eaten+' / 3 CỤC');
    if(trash.eaten>=3){trash.phase='done';controls('Dọn thùng mới','Dọn thùng mới');later(()=>{if(trash&&trash.phase==='done')burst(360,160,'#f2b984',45);},390);}
  }
  function trashAuto(){
    if(!trash||trash.phase==='done')return initGame(3);
    const item=trash.items.find(i=>!i.done);
    if(!item)return;
    item.x=trash.binX;item.y=trash.binY;feedTrash(item);
  }
  function update(dt,time){
    updateParticles(dt);
    if(mode===0)updateBlob(dt);
    else if(mode===1)updateCourt(dt);
    else if(mode===2)updateSlot(dt);
    else updateTrash(dt,time);
  }
  function render(time){
    ctx.setTransform(stage.width/W,0,0,stage.height/H,0,0);
    ctx.clearRect(0,0,W,H);
    if(mode===0&&blob)paintBlob(time);
    else if(mode===1&&court)paintCourt(time);
    else if(mode===2&&slot)paintSlot(time);
    else if(trash)paintTrash(time);
    particlePaint();
  }
  let frameLast=0;
  function loop(ms){
    if(!running||document.hidden||!visible){running=false;return;}
    const dt=frameLast?Math.min(.042,(ms-frameLast)/1000):0;frameLast=ms;
    const time=ms/1000;update(dt,time);render(time);
    requestAnimationFrame(loop);
  }
  function resume(){
    if(running||document.hidden||!visible)return;
    running=true;frameLast=0;requestAnimationFrame(loop);
  }
  function resize(){
    const rect=stage.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    stage.width=Math.round(rect.width*dpr);stage.height=Math.round(rect.height*dpr);
    render(performance.now()/1000);resume();
  }
  const ro=window.ResizeObserver?new ResizeObserver(resize):null;
  if(ro)ro.observe(stage);else window.addEventListener('resize',resize);
  if(window.IntersectionObserver){
    const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){resize();resume();}},{threshold:.03});
    io.observe(panel);
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();});
  function point(e){
    const r=stage.getBoundingClientRect();
    return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};
  }
  let pointer=null;
  function pointerDown(e){
    if(e.button!==undefined&&e.button!==0)return;
    const p=point(e);
    if(mode===0&&blob){
      if(blob.phase!=='ready')return;
      if(dist(p.x,p.y,blob.x,blob.y)<90){
        pointer={id:e.pointerId,type:'blob',start:p,time:performance.now()};blob.drag=true;blob.phase='aim';
        stage.setPointerCapture(e.pointerId);
      }else blobShoot(true);
    }else if(mode===1&&court){
      if(court.phase!=='ready')return;
      pointer={id:e.pointerId,type:'court',start:p};courtDown();stage.setPointerCapture(e.pointerId);
    }else if(mode===2&&slot){
      if(slot.phase==='ready'||slot.phase==='done'){
        pointer={id:e.pointerId,type:'lever',start:p};
        if(p.x<615){startSlot();pointer=null;}
        else stage.setPointerCapture(e.pointerId);
      }else if(slot.phase==='spinning'){
        const col=clamp(Math.floor((p.x-96)/163),0,2);
        if(p.x>=96&&p.x<=598&&p.y>=110&&p.y<=278)stopReel(col);
        else {const next=slot.reels.findIndex(r=>r.spinning);if(next>=0)stopReel(next);}
      }
    }else if(mode===3&&trash){
      if(trash.phase==='done')return;
      const item=trash.items.find(i=>!i.done&&dist(p.x,p.y,i.x,i.y)<88);
      if(item){
        pointer={id:e.pointerId,type:'trash',item,start:p,last:p,time:performance.now(),moved:false};
        item.drag=true;stage.setPointerCapture(e.pointerId);
      }else trashAuto();
    }
    resume();
  }
  function pointerMove(e){
    if(!pointer||pointer.id!==e.pointerId)return;
    const p=point(e);
    if(pointer.type==='blob'&&blob){
      let dx=p.x-pointer.start.x,dy=p.y-pointer.start.y;
      const len=Math.hypot(dx,dy);
      if(len>114){dx*=114/len;dy*=114/len;}
      blob.x=blob.ax+dx;blob.y=clamp(blob.ay+dy,60,350);
    }else if(pointer.type==='lever'&&slot){
      slot.lever=clamp((p.y-pointer.start.y)/110,0,1);
      if(slot.lever>.62){startSlot();pointer=null;}
    }else if(pointer.type==='trash'&&trash){
      const item=pointer.item;item.x=clamp(p.x,55,W-55);item.y=clamp(p.y,70,H-35);
      pointer.moved=pointer.moved||dist(p.x,p.y,pointer.start.x,pointer.start.y)>10;
      pointer.last=p;trash.over=dist(p.x,p.y,trash.binX,trash.binY)<95;
    }
  }
  function pointerUp(e){
    if(!pointer||pointer.id!==e.pointerId)return;
    const p=point(e),job=pointer;pointer=null;
    if(job.type==='blob'&&blob){
      blob.drag=false;blob.phase='ready';blobShoot(dist(p.x,p.y,job.start.x)<12);
    }else if(job.type==='court')courtUp(false);
    else if(job.type==='lever'&&slot){startSlot();}
    else if(job.type==='trash'&&trash){
      const item=job.item;item.drag=false;trash.over=false;
      if(dist(item.x,item.y,trash.binX,trash.binY)<100)feedTrash(item);
      else if(!job.moved){item.x=trash.binX;item.y=trash.binY;feedTrash(item);}
      else{
        const elapsed=Math.max(.08,(performance.now()-job.time)/1000);
        item.flight=true;item.vx=clamp((p.x-job.start.x)/elapsed*.75,-540,700);item.vy=clamp((p.y-job.start.y)/elapsed*.65,-640,490);
        say('VÚT! Thùng đang tính có nhận hàng hay không...');
      }
    }
  }
  function pointerCancel(e){
    if(!pointer||pointer.id!==e.pointerId)return;
    if(pointer.type==='blob'&&blob){blob.drag=false;blob.phase='ready';blob.x=blob.ax;blob.y=blob.ay;}
    if(pointer.type==='court'&&court){court.phase='ready';court.strength=0;}
    if(pointer.type==='trash'&&pointer.item){pointer.item.drag=false;pointer.item.x=pointer.item.homeX;pointer.item.y=pointer.item.homeY;trash.over=false;}
    pointer=null;
  }
  stage.addEventListener('pointerdown',pointerDown);
  stage.addEventListener('pointermove',pointerMove);
  stage.addEventListener('pointerup',pointerUp);
  stage.addEventListener('pointercancel',pointerCancel);
  stage.addEventListener('lostpointercapture',e=>{if(pointer&&pointer.id===e.pointerId)pointerCancel(e);});
  function primary(){
    if(mode===0){
      if(blob.phase==='done')initGame(0);else blobShoot(true);
    }else if(mode===1){
      if(court.phase==='verdict')nextCourt();else courtUp(true);
    }else if(mode===2){
      if(slot.phase==='done')initGame(2);
      else if(slot.phase==='ready')startSlot();
      else{const next=slot.reels.findIndex(r=>r.spinning);if(next>=0)stopReel(next);}
    }else trashAuto();
    resume();
  }
  ui.action.addEventListener('click',primary);
  document.getElementById('yarc-replay').addEventListener('click',()=>initGame(mode));
  ui.swap.addEventListener('click',()=>initGame((mode+1+ri(3))%4,true));
  ui.sound.addEventListener('click',()=>{
    soundOn=!soundOn;ui.sound.setAttribute('aria-pressed',String(soundOn));
    ui.sound.setAttribute('aria-label',soundOn?'Tắt âm thanh trò chơi':'Bật âm thanh trò chơi');
    ui.sound.textContent='Âm';
    if(soundOn)sfx(500,.08);
  });
  stage.addEventListener('keydown',e=>{
    if(e.key===' '||e.key==='Enter'){e.preventDefault();primary();}
    if(e.key==='ArrowRight'&&mode===2&&slot&&slot.phase==='spinning'){e.preventDefault();const idx=slot.reels.findIndex(r=>r.spinning);if(idx>=0)stopReel(idx);}
  });
  window.YenArcade={randomGame:function(){initGame((mode+1+ri(3))%4,true);},reset:function(){initGame(mode);}};
  initGame(ri(4),true);resize();resume();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();