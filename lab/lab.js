// Yên Lab room: poke Cục Yên, open the menu book. No storage, no network, nothing remembered after leaving.
(() => {
  'use strict';
  const room = document.querySelector('[data-room]');
  const buddy = document.getElementById('buddy');
  const says = document.getElementById('buddy-says');
  if (!room || !buddy || !says) return;

  const lines = [
    'Ngồi đi. Thực đơn trên bàn nè.',
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
    says.classList.remove('is-new');
    void says.offsetWidth; // let the new line fade in gently
    says.classList.add('is-new');
    next = (next + 1) % lines.length;
    buddy.classList.remove('is-poked');
    void buddy.offsetWidth; // restart the wobble
    buddy.classList.add('is-poked');
  });
  buddy.addEventListener('animationend', () => buddy.classList.remove('is-poked'));

  // The painted book on the table opens the game menu (native modal dialog: focus trap + Escape for free).
  const book = document.getElementById('menu-open');
  const menu = document.getElementById('lab-menu');
  const close = document.getElementById('menu-close');
  if (book && menu && close && typeof menu.showModal === 'function') {
    book.disabled = false;
    book.addEventListener('click', () => { menu.showModal(); close.focus(); });
    close.addEventListener('click', () => menu.close());
    menu.addEventListener('click', event => { if (event.target === menu) menu.close(); }); // tap outside the book
    menu.addEventListener('close', () => book.focus());
  }

})();
