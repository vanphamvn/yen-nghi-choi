// Yên Lab room: two tiny playthings. No storage, no network, nothing remembered after leaving.
(() => {
  'use strict';
  const room = document.querySelector('[data-room]');
  const buddy = document.getElementById('buddy');
  const says = document.getElementById('buddy-says');
  const lamp = document.getElementById('lamp-switch');
  if (!room || !buddy || !says || !lamp) return;

  const lines = [
    'Ghế này trống nè. Ngồi đi.',
    'Mình đang giả vờ bận đó. Đừng nói ai nha.',
    'Trà còn nóng. Không cần uống, ngửi thôi cũng được.',
    'Hôm nay quầy không có hạn chót. Mai cũng không.',
    'Chọc nữa là mình đổ trà đó. Đùa thôi, ngồi tiếp đi.',
    'Món mới đang pha. Pha chậm cho ngon.',
  ];
  let next = 1;

  buddy.disabled = false;
  buddy.addEventListener('click', () => {
    says.textContent = lines[next];
    next = (next + 1) % lines.length;
    buddy.classList.remove('is-poked');
    void buddy.offsetWidth; // restart the wobble
    buddy.classList.add('is-poked');
  });
  buddy.addEventListener('animationend', () => buddy.classList.remove('is-poked'));

  lamp.hidden = false;
  lamp.addEventListener('click', () => {
    const on = room.classList.contains('is-dim');
    lamp.textContent = on ? 'Tắt đèn' : 'Bật đèn';
    room.classList.toggle('is-dim', !on);
  });
})();
