/* Yên Tarot 1.0. Rider-Waite-Smith conventions: 78 unique cards, three positions,
   optional reversals. Reflective interpretations, never a factual forecast. */
(function(){
  'use strict';
  function boot(){
    const $=id=>document.getElementById(id);
    const moodTab=$('mode-mood'),tarotTab=$('mode-tarot');
    const moodPane=$('mood-classic-pane'),tarotPane=$('tarot-pane');
    if(!moodTab||!tarotTab||!moodPane||!tarotPane)return;
    const heading=$('mood-title'),eyebrow=$('mood-eyebrow'),aside=$('mood-aside');
    const headerText={
      mood:['01 / Bói tâm trạng (không có bằng)','Hôm nay bạn<br>giống <i>thứ gì?</i>','Có 52 thẻ hơi ngốc. Mỗi ngày bày ra 7 thẻ. Chọn một thẻ, Cục Yên sẽ đoán mò tâm trạng của bạn.'],
      tarot:['01 / Tarot cùng Cục Yên','Ba lá bài. <i>Một góc nhìn khác.</i>','78 lá Tarot đúng cấu trúc truyền thống. Chọn ba lá để nhìn lại gốc rễ, hiện tại và hướng có thể thử tiếp.']
    };
    function setMode(mode,focus){
      const tarot=mode==='tarot';
      moodPane.hidden=tarot;tarotPane.hidden=!tarot;
      moodTab.setAttribute('aria-selected',String(!tarot));
      tarotTab.setAttribute('aria-selected',String(tarot));
      moodTab.tabIndex=tarot?-1:0;tarotTab.tabIndex=tarot?0:-1;
      eyebrow.textContent=headerText[mode][0];
      heading.innerHTML=headerText[mode][1];
      aside.textContent=headerText[mode][2];
      if(focus)(tarot?tarotTab:moodTab).focus();
      if(!tarot)window.dispatchEvent(new Event('resize'));
    }
    moodTab.addEventListener('click',()=>setMode('mood'));
    tarotTab.addEventListener('click',()=>setMode('tarot'));
    [moodTab,tarotTab].forEach(el=>el.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='Home'&&e.key!=='End')return;
      e.preventDefault();
      const to=(e.key==='Home'||e.key==='ArrowLeft')?'mood':'tarot';
      setMode(to,true);
    }));
    const majorRaw=[
      ['Kẻ Khờ','Khởi đầu mở ra cơ hội khám phá, hãy thử bước nhỏ.','Đang ngại bắt đầu hoặc vội đi mà thiếu chuẩn bị.','✧'],
      ['Nhà Ảo Thuật','Bạn có công cụ và khả năng để biến ý tưởng thành hành động.','Khả năng chưa được sử dụng đúng chỗ hoặc thiếu tập trung.','✦'],
      ['Nữ Tư Tế','Lắng nghe trực giác và điều chưa thể gọi tên.','Đang lờ đi cảm nhận hoặc chưa muốn nhìn sự thật bên trong.','☽'],
      ['Hoàng Hậu','Nuôi dưỡng, chăm sóc và tạo điều kiện cho điều tốt lớn lên.','Chăm người khác quá mức mà quên chăm bản thân.','❀'],
      ['Hoàng Đế','Cần cấu trúc, ranh giới và trách nhiệm rõ ràng.','Kỷ luật có thể đang thành cứng nhắc hoặc kiểm soát quá nhiều.','♜'],
      ['Giáo Hoàng','Học hỏi truyền thống, người hướng dẫn và giá trị chung.','Một khuôn phép không còn phù hợp, hãy tự xét lại.','✥'],
      ['Đôi Tình Nhân','Sự kết nối và một lựa chọn phù hợp với giá trị của mình.','Có sự lệch nhịp hoặc quyết định chưa thật lòng.','♡'],
      ['Chiến Xa','Tập trung và điều hướng các lực đang kéo bạn nhiều phía.','Quá vội giành quyền kiểm soát hoặc thiếu hướng đi.','➤'],
      ['Sức Mạnh','Kiên nhẫn, dịu dàng và can đảm đi cùng nhau.','Đang nghi ngờ sức mình hoặc dồn ép cảm xúc.','♌'],
      ['Ẩn Sĩ','Khoảng lặng giúp tìm được câu trả lời từ bên trong.','Thu mình quá lâu hoặc tránh một cuộc đối thoại cần thiết.','✺'],
      ['Bánh Xe Số Phận','Hoàn cảnh có chu kỳ; hãy linh hoạt khi mọi thứ chuyển động.','Đang chống lại thay đổi hoặc trông chờ vận may giải quyết hết.','◉'],
      ['Công Lý','Xem xét sự thật, trách nhiệm và hệ quả một cách công bằng.','Cần kiểm tra thiên kiến, sự mất cân bằng hoặc điều chưa rõ.','⚖'],
      ['Người Treo Ngược','Tạm dừng để thấy góc nhìn mới thay vì cố vùng vẫy.','Đang mắc kẹt trong trì hoãn hay hy sinh không cần thiết.','⌛'],
      ['Cái Chết','Một giai đoạn khép lại để nhường chỗ cho chuyển đổi.','Khó buông điều đã hết vai trò; không phải cái chết theo nghĩa đen.','✹'],
      ['Tiết Chế','Pha trộn những khác biệt với sự điều độ và kiên nhẫn.','Mất nhịp, quá đà hoặc thiếu sự phối hợp.','⚗'],
      ['Ác Quỷ','Nhìn thẳng thói quen hay ràng buộc đang giữ chân mình.','Đã thấy đường thoát nhưng còn sợ thay đổi hoặc tự trách.','⛓'],
      ['Tòa Tháp','Một cấu trúc cũ có thể cần được nhìn lại và làm mới.','Đang né một sự thật khó chịu hoặc sợ xáo trộn.','⚡'],
      ['Ngôi Sao','Có chỗ cho hy vọng, sự hồi phục và cảm hứng.','Niềm tin đang mệt; hãy bắt đầu từ điều có thể chăm sóc.','✶'],
      ['Mặt Trăng','Chưa đủ sáng tỏ; quan sát cảm xúc và điều mơ hồ.','Lo âu hoặc hiểu lầm có thể làm lệch cách nhìn.','☾'],
      ['Mặt Trời','Niềm vui, rõ ràng và sự tự tin đang có cơ hội lớn lên.','Khó đón nhận niềm vui hoặc kỳ vọng quá hoàn hảo.','☼'],
      ['Phán Xét','Đánh giá lại hành trình và lắng nghe lời gọi đổi mới.','Đang xét nét bản thân quá nghiêm hoặc né quyết định.','♬'],
      ['Thế Giới','Nhìn nhận thành quả và sự trọn vẹn của một chu kỳ.','Còn một việc dang dở cần khép lại cho tử tế.','◎']
    ];
    const ranks=['Át','2','3','4','5','6','7','8','9','10','Tiểu đồng','Kỵ sĩ','Hoàng hậu','Quốc vương'];
    const suits=[
      ['Gậy','✺','#A46B37',[
        ['Một ý tưởng hoặc nguồn năng lượng mới đang nhen lên.','Thiếu lửa hoặc hướng dùng năng lượng chưa rõ.'],
        ['Đứng trước kế hoạch và cơ hội mở rộng tầm nhìn.','Có dự định nhưng ngại bước khỏi chỗ quen.'],
        ['Chờ đợi tín hiệu từ những nỗ lực đã gieo.','Kỳ vọng đang lệch thực tế hoặc tiến độ chậm.'],
        ['Cột mốc đáng mừng, cảm giác thuộc về một nơi.','Niềm vui hay sự ổn định chưa thật sự vững.'],
        ['Nhiều quan điểm cạnh tranh, cần phối hợp hơn là hơn thua.','Xung đột âm ỉ hoặc né trao đổi cần thiết.'],
        ['Được ghi nhận sau cố gắng; hãy nhận thành quả.','Thiếu sự công nhận hoặc quá lệ thuộc lời khen.'],
        ['Giữ lập trường trước áp lực, chọn điều đáng bảo vệ.','Phòng thủ đến kiệt sức hoặc dễ buông quá sớm.'],
        ['Đà tiến nhanh, tin tức và hành động đang tăng tốc.','Sự chậm trễ hoặc vội vã gây rối nhịp.'],
        ['Bền bỉ dù mệt; ranh giới giúp bạn không cạn sức.','Cảnh giác quá mức hoặc mệt tới mức muốn bỏ.'],
        ['Đang gánh nhiều trách nhiệm, đã đến lúc chia bớt.','Quá tải và cần học cách nhờ hỗ trợ.'],
        ['Tò mò khám phá và sẵn sàng thử điều chưa biết.','Nhiệt tình nhưng thiếu hướng hoặc ngại bắt đầu.'],
        ['Hành động táo bạo, sôi nổi và thích trải nghiệm.','Bốc đồng, hấp tấp hoặc khởi đầu rồi bỏ dở.'],
        ['Tự tin, nồng nhiệt và khích lệ người xung quanh.','Sự tự tin hụt hơi hoặc muốn kiểm soát ánh nhìn.'],
        ['Tầm nhìn, lãnh đạo và khả năng truyền cảm hứng.','Quyết đoán quá mức hoặc thiếu trách nhiệm với tầm nhìn.']
      ]],
      ['Cốc','♡','#5E779A',[
        ['Một cảm xúc hay kết nối mới có thể bắt đầu.','Cảm xúc bị nén lại hoặc cần chăm lại lòng mình.'],
        ['Tương tác qua lại, sự đồng điệu và tin cậy.','Cán cân cho nhận chưa đều hoặc thiếu trò chuyện.'],
        ['Bạn bè, chia sẻ và niềm vui cùng nhau.','Cảm giác đứng ngoài cuộc hoặc mối quan hệ quá ồn.'],
        ['Cần nhìn lại cảm xúc thay vì bỏ lỡ điều đang có.','Một chút cởi mở giúp thoát khỏi trạng thái thờ ơ.'],
        ['Nỗi buồn vì điều mất đi cần được nhìn nhận.','Bắt đầu buông nỗi thất vọng để thấy phần còn lại.'],
        ['Ký ức, sự ấm áp và những kết nối thân quen.','Đang lý tưởng hóa quá khứ hoặc khó bước khỏi nó.'],
        ['Nhiều lựa chọn hấp dẫn; phân biệt ước mơ với thực tế.','Dần nhìn rõ lựa chọn hoặc bỏ bớt ảo tưởng.'],
        ['Rời một điều đã hết ý nghĩa để đi tìm điều phù hợp.','Sợ rời vùng quen hoặc cứ quay lại lối cũ.'],
        ['Cảm giác đủ đầy từ điều mình thật sự mong.','Bên ngoài ổn nhưng bên trong có điều chưa thỏa.'],
        ['Sự gắn bó, hòa thuận và niềm vui chia sẻ.','Kỳ vọng hoàn hảo đang làm mối quan hệ căng.'],
        ['Một lời nhắn từ cảm xúc hoặc cảm hứng sáng tạo.','Dễ mơ mộng quá nhiều hoặc ngại bộc lộ.'],
        ['Bước theo điều trái tim coi trọng, với sự tinh tế.','Lý tưởng hóa hoặc hành động theo cảm xúc quá mức.'],
        ['Biết lắng nghe, nâng đỡ và giữ lòng trắc ẩn.','Cảm xúc tràn bờ; cần đặt ranh giới.'],
        ['Điềm tĩnh trước sóng cảm xúc, phản hồi khôn ngoan.','Kìm nén hoặc để cảm xúc dẫn dắt người khác.']
      ]],
      ['Kiếm','✦','#7B7294',[
        ['Một sự thật hoặc ý tưởng trở nên rõ ràng.','Tư duy rối và khó gọi đúng vấn đề.'],
        ['Đứng trước quyết định, cần tháo tấm bịt mắt.','Trì hoãn lựa chọn hoặc tránh nhìn thông tin mới.'],
        ['Tổn thương và điều không như ý cần được chữa lành.','Nỗi đau đang dần dịu hoặc chưa được gọi tên.'],
        ['Nghỉ để phục hồi suy nghĩ trước khi hành động.','Đầu óc không chịu ngơi hoặc đã tới lúc trở lại.'],
        ['Tranh cãi thắng mà vẫn mất; cân nhắc cái giá.','Học cách hạ vũ khí hoặc thoát xung đột vô ích.'],
        ['Rời giai đoạn khó khăn, tiến từng đoạn nhỏ.','Sợ thay đổi hoặc chưa muốn nhận giúp đỡ.'],
        ['Cần chiến lược và tỉnh táo trước chuyện chưa minh bạch.','Một bí mật hay đường tắt cần được xem lại.'],
        ['Cảm giác bị kẹt có thể đến từ niềm tin giới hạn mình.','Bắt đầu nhận ra lựa chọn vẫn còn.'],
        ['Nỗi lo đang lớn trong đầu; cần tìm hỗ trợ thực tế.','Sự lo lắng đang bớt hoặc cần nói ra điều sợ.'],
        ['Một kết thúc đau nhưng cũng là lúc khép chu kỳ.','Đang hồi phục, hoặc níu một chuyện đã tới hạn.'],
        ['Tinh thần học hỏi, đặt câu hỏi và kiểm chứng.','Nói vội, suy diễn hoặc bị nhiễu thông tin.'],
        ['Hành động mau lẹ với một lập trường rõ.','Vội vàng, lời nói sắc quá hoặc mất hướng.'],
        ['Rạch ròi, độc lập và nói sự thật có chừng mực.','Quá lạnh lùng hoặc phê bình không cần thiết.'],
        ['Lý trí sáng suốt, cân nhắc công bằng.','Khắt khe, áp đặt hoặc dùng lý lẽ để kiểm soát.']
      ]],
      ['Tiền','◇','#638269',[
        ['Một cơ hội thực tế đáng để gieo hạt.','Cơ hội bị bỏ lỡ hoặc thiếu kế hoạch khả thi.'],
        ['Xoay xở nhiều việc, tìm thế cân bằng.','Lịch trình và nguồn lực đang vượt sức.'],
        ['Hợp tác, trau tay nghề và ghi nhận đóng góp.','Phối hợp chưa ăn ý hoặc ngại học từ người khác.'],
        ['Giữ gìn nguồn lực, cần cảm giác an toàn.','Bám quá chặt hoặc lo mất đến mức không dám dùng.'],
        ['Khó khăn vật chất hoặc cảm giác đơn độc cần được giúp đỡ.','Có cơ hội nhận hỗ trợ và bước ra khỏi thiếu thốn.'],
        ['Cho và nhận công bằng, giúp đúng lúc.','Trao đổi không cân xứng hoặc sự giúp đỡ có điều kiện.'],
        ['Kiên nhẫn nhìn lại kết quả đầu tư công sức.','Nóng lòng hoặc thiếu kế hoạch dài hạn.'],
        ['Luyện tập đều đặn, sự tỉ mỉ tạo tay nghề.','Mải làm máy móc hoặc thiếu tập trung học hỏi.'],
        ['Tự chủ, tận hưởng thành quả mình gây dựng.','Đang khó hưởng thụ hoặc phụ thuộc đánh giá bên ngoài.'],
        ['Nền tảng bền vững, gia đình và giá trị lâu dài.','Mâu thuẫn về tài sản hay kỳ vọng an toàn.'],
        ['Tinh thần học việc, cơ hội học từ thực tiễn.','Dễ phân tán hoặc chưa biến kế hoạch thành việc.'],
        ['Đi chậm mà chắc, giữ trách nhiệm và nhịp làm.','Cố chấp hoặc mắc kẹt trong thói quen.'],
        ['Chăm sóc bằng sự thực tế, chu đáo và đủ đầy.','Chăm người khác mà bỏ quên nhu cầu mình.'],
        ['Quản lý tài nguyên vững vàng và có trách nhiệm.','Quá coi trọng vật chất hoặc kiểm soát cứng nhắc.']
      ]]
    ];
    const roman=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
    const cards=majorRaw.map((r,i)=>({id:'M'+i,name:r[0],up:r[1],down:r[2],symbol:r[3],number:roman[i],major:true,ink:'#9C7B4C'}));
    suits.forEach(([suit,symbol,ink,rows])=>rows.forEach((r,i)=>cards.push({id:suit+i,name:ranks[i]+' '+suit,up:r[0],down:r[1],symbol,number:ranks[i].toUpperCase(),major:false,ink})));
    if(cards.length!==78||new Set(cards.map(c=>c.id)).size!==78||suits.some(x=>x[3].length!==14))throw Error('Tarot deck must contain 22+56 distinct cards');
    const topics={
      general:{label:'Tổng quan',question:'Mình cần hiểu rõ điều gì ở hiện tại?',end:'Nếu chỉ làm một việc nhỏ sau trải bài, bạn muốn bắt đầu bằng điều nào?'},
      love:{label:'Tình cảm',question:'Trong mối quan hệ này, điều gì đáng lắng nghe?',end:'Một cuộc trò chuyện chân thành hoặc ranh giới rõ ràng có giúp gì cho bạn không?'},
      work:{label:'Công việc',question:'Ở công việc, mình có thể điều chỉnh điều gì?',end:'Điều gì nằm trong khả năng bạn thay đổi ngay tuần này?'},
      self:{label:'Bản thân',question:'Mình cần chăm sóc điều gì ở chính mình?',end:'Bạn có thể dành cho bản thân một việc tử tế nào hôm nay?'}
    };
    const fan=$('tarot-fan'),slots=$('tarot-slots'),reading=$('tarot-reading'),progress=$('tarot-progress-label'),note=$('tarot-prompt');
    const reversedToggle=$('tarot-reversed'),reshuffle=$('tarot-reshuffle');
    let topic='general',deck=[],hand=[],picked=[];
    function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    function rand(n){
      if(window.crypto&&typeof window.crypto.getRandomValues==='function'){
        const buf=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;
        do{window.crypto.getRandomValues(buf);}while(buf[0]>=lim);
        return buf[0]%n;
      }
      return Math.floor(Math.random()*n);
    }
    function shuffle(source){
      const arr=source.slice();
      for(let i=arr.length-1;i>0;i--){const j=rand(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
      return arr;
    }
    function cardFace(draw){
      const c=draw.card,reverse=draw.reversed;
      return '<div class="tarot-card '+(c.major?'is-major ':'')+(reverse?'is-reversed':'')+'" style="--tarot-ink:'+c.ink+'">'+
        '<span class="tarot-card-no">'+escapeText(c.major?'ẨN CHÍNH · '+c.number:'ẨN PHỤ · '+c.number)+'</span>'+
        '<span class="tarot-symbol" aria-hidden="true">'+escapeText(c.symbol)+'</span>'+
        '<span class="tarot-card-name">'+escapeText(c.name)+'</span>'+
        '<span class="tarot-card-state">'+(reverse?'LÁ NGƯỢC':'LÁ XUÔI')+'</span>'+
      '</div>';
    }
    const positions=[
      {label:'01 · Gốc rễ',prompt:'Điều đã góp phần tạo nên tình huống.'},
      {label:'02 · Hiện tại',prompt:'Điều đang ảnh hưởng đến bạn.'},
      {label:'03 · Hướng tiếp theo',prompt:'Điều có thể cân nhắc, không phải số phận cố định.'}
    ];
    function renderSlots(){
      slots.innerHTML=positions.map((p,i)=>{
        const d=picked[i];
        return '<div class="tarot-slot '+(d?'has-card':'')+'"><span class="tarot-slot-title">'+p.label+'</span>'+
          (d?cardFace(d):'<div class="tarot-card" aria-hidden="true"><span class="tarot-card-no">YÊN TAROT</span><span class="tarot-symbol">✧</span><span class="tarot-card-name">Chờ rút bài</span></div>')+
          '<span class="tarot-slot-desc">'+(d?escapeText(d.card.name+(d.reversed?' · Ngược':' · Xuôi')):escapeText(p.prompt))+'</span></div>';
      }).join('');
      progress.textContent=picked.length===3?'Đã đủ 3 lá · Xem lời giải':'Đã rút '+picked.length+' / 3 lá';
      note.textContent=picked.length===3?'Cục Yên đang ghép ba câu chuyện lại...':'Chọn một lá úp để đặt vào vị trí '+positions[picked.length].label+'.';
    }
    function paintHand(){
      fan.innerHTML=hand.map((d,i)=>
        '<button type="button" class="tarot-card-back '+(d.picked?'is-picked':'')+'" data-tarot-index="'+i+'" style="--tilt:'+((i-3)*1.8)+'deg"'+
        (d.picked||picked.length===3?' disabled':'')+
        ' aria-label="Rút lá úp số '+(i+1)+'" title="Rút một lá bài"></button>'
      ).join('');
    }
    function readCard(d,i){
      const mood=d.reversed?d.card.down:d.card.up;
      const intro=['Nhìn lại điều đã đặt nền cho chuyện này: ','Ở thời điểm hiện tại, lá bài gợi ra: ','Về hướng có thể đi tiếp, hãy cân nhắc: '][i];
      return intro+mood;
    }
    function paintReading(){
      if(picked.length!==3){reading.hidden=true;reading.innerHTML='';return;}
      const majors=picked.filter(d=>d.card.major).length;
      const c=topics[topic];
      reading.innerHTML='<span class="tarot-reading-kicker">TRẢI BÀI 3 LÁ · '+escapeText(c.label.toUpperCase())+'</span>'+
        '<h3>'+escapeText(c.question)+'</h3>'+
        '<div class="tarot-reading-list">'+picked.map((d,i)=>
          '<article><strong>'+escapeText(positions[i].label+' · '+d.card.name+(d.reversed?' (ngược)':''))+'</strong><p>'+escapeText(readCard(d,i))+'</p></article>'
        ).join('')+'</div>'+
        '<p class="tarot-summary">'+escapeText((majors>=2?'Có nhiều lá Ẩn chính trong trải bài, nên có thể dành thêm thời gian nhìn vào những chủ đề lớn đang lặp lại. ':'Các lá Ẩn phụ nhắc nhiều đến nhịp sống, lựa chọn và việc nhỏ mỗi ngày. ')+c.end)+'</p>'+
        '<p class="tarot-disclaimer">Tarot ở Yên là một trò suy ngẫm, không phải lời tiên tri hay căn cứ cho quyết định sức khỏe, tài chính và pháp lý.</p>';
      reading.hidden=false;
      reading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    }
    function newSpread(){
      deck=shuffle(cards).map(card=>({card,reversed:reversedToggle.checked&&rand(2)===1}));
      hand=deck.slice(0,7).map(d=>({...d,picked:false}));
      picked=[];
      paintHand();renderSlots();paintReading();
      reshuffle.textContent='Xào bài lại ↻';
    }
    fan.addEventListener('click',e=>{
      const button=e.target.closest('button[data-tarot-index]');
      if(!button||button.disabled||picked.length>=3)return;
      const i=Number(button.dataset.tarotIndex),d=hand[i];
      if(!d||d.picked)return;
      d.picked=true;picked.push(d);
      paintHand();renderSlots();
      if(picked.length===3){reshuffle.textContent='Trải bài mới ↻';paintReading();}
    });
    document.querySelectorAll('[data-tarot-topic]').forEach(btn=>btn.addEventListener('click',()=>{
      topic=btn.dataset.tarotTopic;
      document.querySelectorAll('[data-tarot-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      newSpread();
    }));
    reshuffle.addEventListener('click',newSpread);
    reversedToggle.addEventListener('change',newSpread);
    setMode('mood');
    newSpread();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
