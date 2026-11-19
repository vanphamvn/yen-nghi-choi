(() => {
  const image=document.querySelector('#book-frame'), play=document.querySelector('#book-play'), reset=document.querySelector('#book-reset'), status=document.querySelector('#book-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');const paths=['frames/book-flip-00.webp','frames/book-flip-01.webp','frames/book-flip-02.webp','frames/book-flip-03.webp','frames/book-flip-04.webp','frames/book-flip-05.webp','frames/book-flip-06.webp','frames/book-flip-07.webp'];let timer=null,frame=0;
  function paint(){image.src=paths[frame];status.textContent='Frame '+(frame+1)+' / 8';}
  function stop(){if(timer!==null){clearInterval(timer);timer=null;}play.textContent='Xem lật trang';}
  function start(){if(reduced.matches){stop();status.textContent='Đang dùng hình tĩnh do chế độ giảm chuyển động';return;}stop();play.textContent='Tạm dừng';timer=setInterval(()=>{frame++;if(frame>=8){frame=7;paint();stop();return;}paint();},180);}
  play.addEventListener('click',()=>timer===null?start():stop());
  reset.addEventListener('click',()=>{stop();frame=0;paint()});
  reduced.addEventListener?.('change',()=>{stop();if(reduced.matches){frame=0;paint()}});
})();
