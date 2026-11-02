/* Yên Coffee & Tea: promotional wheel preview. No cookies, storage, analytics, or voucher claims. */
(function(){
  'use strict';
  function init(){
    const byId=id=>document.getElementById(id);
    const disc=byId('yen-wheel-disc');
    const spinButton=byId('yen-wheel-spin');
    const wheelButton=byId('yen-wheel-tap');
    const speech=byId('yen-wheel-speech');
    const result=byId('yen-wheel-result');
    const resultName=byId('yen-wheel-reward');
    const resultDescription=byId('yen-wheel-reward-note');
    const host=byId('yen-wheel-clerk');
    const confetti=byId('yen-wheel-confetti');
    if(!disc||!spinButton||!wheelButton||!speech||!result||!resultName||!resultDescription||!host||!confetti)return;
    const prizes=[
      {lines:['GIẢM','5.000Đ'],name:'Giảm 5.000đ',message:'Cục Yên tặng thử một khoản giảm giá nho nhỏ.',color:'#E9B3A1'},
      {lines:['TOPPING','0Đ'],name:'Tặng topping',message:'Thêm topping cho vui. Cục Yên chưa tính tiền.',color:'#DCE9B7'},
      {lines:['GIẢM','10%'],name:'Giảm 10%',message:'Giảm một chút, vui thêm một chút.',color:'#EBD69E'},
      {lines:['UPSIZE','0Đ'],name:'Tặng nâng size',message:'Ly to hơn. Cục Yên bảo: uống từ từ thôi!',color:'#D2E5DF'},
      {lines:['GIẢM','3.000Đ'],name:'Giảm 3.000đ',message:'Ba nghìn cũng là tiền. Cục Yên biết đếm.',color:'#E5D6EC'},
      {lines:['QUÀ','BÍ MẬT'],name:'Quà bí mật',message:'Quà còn nằm trong trí tưởng tượng của Cục Yên.',color:'#F3CCAF'},
      {lines:['GIẢM','5%'],name:'Giảm 5%',message:'Một món quà nhẹ tênh cho chiếc ví.',color:'#D7E3BE'},
      {lines:['GIẢM','8.000Đ'],name:'Giảm 8.000đ',message:'Cục Yên mạnh tay trong phiên bản chơi thử.',color:'#EDC5D2'}
    ];
    const svgNS='http://www.w3.org/2000/svg';
    const make=(tag,attrs={})=>{
      const el=document.createElementNS(svgNS,tag);
      for(const key of Object.keys(attrs))el.setAttribute(key,String(attrs[key]));
      return el;
    };
    const add=(parent,child)=>{parent.appendChild(child);return child;};
    const cx=220,cy=220,step=360/prizes.length;
    const rad=deg=>deg*Math.PI/180;
    const point=(angle,r)=>[cx+Math.cos(rad(angle))*r,cy+Math.sin(rad(angle))*r];
    add(disc,make('circle',{cx,cy,r:209,fill:'#fdf8ea',stroke:'#2d503c','stroke-width':8}));
    prizes.forEach((prize,index)=>{
      const mid=-90+index*step;
      const a=mid-step/2,b=mid+step/2;
      const p1=point(a,193),p2=point(b,193);
      const wedge=make('path',{
        d:'M '+cx+' '+cy+' L '+p1[0].toFixed(3)+' '+p1[1].toFixed(3)+' A 193 193 0 0 1 '+p2[0].toFixed(3)+' '+p2[1].toFixed(3)+' Z',
        fill:prize.color,stroke:'#fff9e9','stroke-width':3.6,'stroke-linejoin':'round'
      });
      add(disc,wedge);
      const xy=point(mid,139);
      const label=make('text',{x:xy[0].toFixed(2),y:(xy[1]-9).toFixed(2),'text-anchor':'middle','font-family':'Noto Sans,Arial,sans-serif','font-size':prize.lines[0].length>6?13:15,'font-weight':900,'letter-spacing':'.2','fill':'#29483a'});
      prize.lines.forEach((line,indexLine)=>{
        const tspan=make('tspan',{x:xy[0].toFixed(2),dy:indexLine===0?'0':'20'});
        tspan.textContent=line;add(label,tspan);
      });
      add(disc,label);
    });
    add(disc,make('circle',{cx,cy,r:203,fill:'none',stroke:'#355444','stroke-width':2}));
    for(let i=0;i<24;i++){
      const p=point(-90+i*15,201);
      add(disc,make('circle',{cx:p[0].toFixed(2),cy:p[1].toFixed(2),r:i%3===0?3.7:2.4,fill:i%2===0?'#E5B979':'#fff6df'}));
    }
    const prefReduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const randomInt=(n)=>{
      if(window.crypto&&window.crypto.getRandomValues){
        const n32=new Uint32Array(1);window.crypto.getRandomValues(n32);return n32[0]%n;
      }
      return Math.floor(Math.random()*n);
    };
    let rotation=0,isSpinning=false,frame=0,spinCount=0;
    function paint(){disc.style.transform='rotate('+rotation+'deg)';}
    function announce(message){speech.textContent=message;}
    function celebrate(){
      if(prefReduce)return;
      confetti.replaceChildren();
      const colors=['#e8b19a','#b0cda8','#e7ce8c','#d4c6ec','#93b9ae'];
      for(let i=0;i<34;i++){
        const el=document.createElement('i');
        el.className='wheel-confetti-piece';
        el.style.left=(4+Math.random()*92)+'%';
        el.style.background=colors[i%colors.length];
        el.style.setProperty('--dx',(Math.random()*160-80)+'px');
        el.style.setProperty('--dy',(280+Math.random()*190)+'px');
        el.style.setProperty('--rot',(220+Math.random()*590)+'deg');
        el.style.setProperty('--d',(1.25+Math.random()*1.1)+'s');
        confetti.appendChild(el);
      }
      window.setTimeout(()=>confetti.replaceChildren(),2600);
    }
    function complete(index){
      rotation=Math.round(rotation*1000)/1000;paint();
      isSpinning=false;
      spinButton.disabled=false;wheelButton.disabled=false;
      spinButton.textContent='Quay thêm lượt nữa ↻';
      host.classList.remove('spinning');
      const gift=prizes[index];
      resultName.textContent=gift.name;
      resultDescription.textContent=gift.message+' Đây chỉ là ưu đãi mô phỏng, chưa dùng để đổi quà tại quán.';
      result.hidden=false;
      announce(['Cục Yên bốc ra '+gift.name+'! Nhưng nhớ nhé, đây vẫn là vòng quay thử.','Trúng thử '+gift.name+'! Cục Yên còn phải xin duyệt ưu đãi thật.','Ra '+gift.name+'! Cục Yên đã quay, còn chương trình thật thì chưa công bố.'][randomInt(3)]);
      celebrate();
    }
    function spin(){
      if(isSpinning)return;
      isSpinning=true;spinCount++;
      result.hidden=true;
      confetti.replaceChildren();
      spinButton.disabled=true;wheelButton.disabled=true;
      spinButton.textContent='Đang quay...';
      host.classList.add('spinning');
      announce(['Cục Yên đang chóng mặt. Bạn giữ hộ cái nón!','Quay đều tay, đừng để Cục Yên bay theo!','Đang tìm phần quà... hay tìm cái ghế ngồi?'][randomInt(3)]);
      const selectedIndex=randomInt(prizes.length);
      const target=(((-selectedIndex*step)%360)+360)%360;
      const present=((rotation%360)+360)%360;
      const extraTurns=360*(5+randomInt(2));
      const diff=(target-present+360)%360;
      const destination=rotation+extraTurns+diff;
      if(prefReduce){rotation=destination;complete(selectedIndex);return;}
      const starting=rotation,startTime=performance.now(),duration=4600;
      let lastTick=-1;
      function animate(now){
        const t=Math.min(1,Math.max(0,(now-startTime)/duration));
        const eased=1-Math.pow(1-t,4);
        rotation=starting+(destination-starting)*eased;
        paint();
        const tick=Math.floor((rotation+step/2)/step);
        if(tick!==lastTick){
          lastTick=tick;
          if(t<.83&&navigator.vibrate&&t>.28&&spinCount%3===0){/* Haptic stays off: no unrequested vibration. */}
        }
        if(t<1){frame=requestAnimationFrame(animate);}
        else{frame=0;rotation=destination;complete(selectedIndex);}
      }
      frame=requestAnimationFrame(animate);
    }
    spinButton.addEventListener('click',spin);
    wheelButton.addEventListener('click',spin);
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}
      else if(!document.hidden&&isSpinning){
        // If a tab was backgrounded, end the spin safely rather than leave disabled controls.
        isSpinning=false;spinButton.disabled=false;wheelButton.disabled=false;
        spinButton.textContent='Quay lại nào ↻';host.classList.remove('spinning');
        announce('Cục Yên đứng đợi bạn về tab. Quay lại một lần nhé!');
      }
    });
    window.YenWheel={reset:()=>{
      if(frame)cancelAnimationFrame(frame);
      frame=0;isSpinning=false;rotation=0;spinCount=0;paint();
      result.hidden=true;spinButton.disabled=false;wheelButton.disabled=false;
      spinButton.textContent='QUAY YÊN!';host.classList.remove('spinning');
      confetti.replaceChildren();announce('Bấm quay đi! Cục Yên đứng đây cổ vũ.');
    }};
    paint();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();