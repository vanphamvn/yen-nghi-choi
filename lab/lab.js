// Yên Lab room: poke Cục Yên, open the menu book. No storage, no network, nothing remembered after leaving.
(() => {
  'use strict';
  const room = document.querySelector('[data-room]');
  const buddy = document.getElementById('buddy');
  const says = document.getElementById('buddy-says');
  if (!room || !buddy || !says) return;

  // Cục Yên's chat. Every other poke it suggests one released game (LAB-F12 #136): a static, hand-written mapping, no
  // tracking, no question about the guest, never automatic. Suggestions rotate across three loose groups (body, head,
  // heart) so consecutive ones differ; poking again offers another, and the book on the table is always the full list.
  const chat = [
    'Ngồi đi. Thực đơn trên bàn nè.',
    'Mình đang giả vờ bận đó. Đừng nói ai nha.',
    'Trà còn nóng. Không cần uống, ngửi thôi cũng được.',
    'Hôm nay quầy không có hạn chót. Mai cũng không.',
    'Chọc nữa là mình đổ trà đó. Đùa thôi, ngồi tiếp đi.',
    'Món mới đang pha. Pha chậm cho ngon.',
  ];
  // Cục Yên talks about itself ("mình hay…"), it does not guess how the guest feels.
  const suggestions = [
    { group: 'body', before: 'Mình hay thở chậm vài nhịp với ', name: 'Thở cùng Yên', href: '/lab/tho/', after: '.' },
    { group: 'head', before: 'Đầu mình nhiều chữ quá thì chơi ', name: 'Lá trôi, nghĩ trôi', href: '/lab/la-troi/', after: '.' },
    { group: 'heart', before: 'Hôm nào bực bực, mình chơi ', name: 'Gọi tên cơn bực', href: '/lab/goi-ten/', after: '.' },
    { group: 'body', before: 'Ngồi lâu mỏi lưng, mình chơi ', name: 'Căng rồi thả', href: '/lab/cang/', after: '.' },
    { group: 'head', before: 'Muốn rời màn hình một chút? Chơi ', name: 'Thám tử hiện tại', href: '/lab/tham-tu/', after: '.' },
    { group: 'heart', before: 'Mình hay ghi vài điều vui vui ở ', name: 'Ba điều nhỏ xíu', href: '/lab/ba-dieu/', after: '.' },
    { group: 'head', before: 'Không muốn làm gì hết thì mình qua ', name: 'Ngồi nhìn mây', href: '/lab/nhin-may/', after: ' một lát.' },
    { group: 'heart', before: 'Rảnh tay thì mình ra ', name: 'Vườn cát không mục tiêu', href: '/lab/vuon-cat/', after: ' cào vài đường.' },
  ];
  let next = 1; // poke count; the first chat line is already in the bubble

  function show(line) {
    if (typeof line === 'string') {
      says.textContent = line;
    } else {
      const link = document.createElement('a');
      link.href = line.href;
      link.textContent = line.name;
      link.dataset.suggest = line.group;
      says.replaceChildren(line.before, link, line.after);
    }
    says.classList.remove('is-new');
    void says.offsetWidth; // let the new line fade in gently
    says.classList.add('is-new');
  }

  buddy.disabled = false;
  buddy.addEventListener('click', () => {
    // odd pokes: a suggestion; even pokes: a chat line
    const line = next % 2 === 1
      ? suggestions[((next - 1) / 2) % suggestions.length]
      : chat[(next / 2) % chat.length];
    show(line);
    next += 1;
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
    // Keyboard open (click.detail === 0): focus the close control with its visible ring. Tap/mouse open: focus the dialog
    // itself, because WebKit (iPhone Safari) draws the focus ring on programmatic focus even after a tap.
    let byPointer = false;
    book.addEventListener('click', event => { byPointer = event.detail !== 0; menu.showModal(); (byPointer ? menu : close).focus(); });
    close.addEventListener('click', () => menu.close());
    menu.addEventListener('click', event => { if (event.target === menu) menu.close(); }); // tap outside the book
    // Focus always returns to the book. After a tap, mark it so no ring is drawn (WebKit shows :focus-visible after
    // programmatic focus); the mark is dropped as soon as a key is pressed or focus leaves.
    const unmark = () => book.classList.remove('is-pointer-focus');
    book.addEventListener('blur', unmark);
    document.addEventListener('keydown', unmark, true);
    menu.addEventListener('close', () => { if (byPointer) book.classList.add('is-pointer-focus'); book.focus(); });

    // Optional raster page-turn menu. Image decoding failure leaves the original static book intact.
    // The spread and its links remain HTML, not text painted into sprite frames.
    const prevPage = document.getElementById('menu-prev');
    const nextPage = document.getElementById('menu-next');
    const pageNumber = document.getElementById('menu-page-number');
    const flipFrame = document.getElementById('menu-flip-frame');
    const spreads = [...menu.querySelectorAll('.menu-page[data-spread]')];
    if (prevPage && nextPage && pageNumber && flipFrame && spreads.length === 4) {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)');
      let currentPage = 1;
      let turnTarget = 1;
      let turning = false;
      let assetReady = false;
      let frameTimer = null;

      function showSpread(page) {
        currentPage = page;
        menu.dataset.page = String(page);
        for (const spread of spreads) {
          const hidden = spread.dataset.spread !== String(page);
          spread.inert = hidden;
          spread.setAttribute('aria-hidden', String(hidden));
        }
        pageNumber.textContent = 'Trang ' + page + ' / 2';
        prevPage.disabled = page === 1;
        nextPage.disabled = page === 2;
      }
      function drawFrame(frame) {
        flipFrame.style.backgroundPosition = (frame * 100 / 7).toFixed(4) + '% 0%';
      }
      function cancelTurn() {
        clearTimeout(frameTimer);
        frameTimer = null;
        turning = false;
        menu.classList.remove('is-turning');
        drawFrame(0);
      }
      function finishTurn(page, keyboard) {
        cancelTurn();
        showSpread(page);
        if (keyboard) (page === 2 ? prevPage : nextPage).focus();
      }
      function turnTo(page, keyboard) {
        if (turning || page === currentPage || !menu.open) return;
        turnTarget = page;
        if (reduce.matches || !assetReady) { finishTurn(page, keyboard); return; }
        turning = true;
        menu.classList.add('is-turning');
        prevPage.disabled = true;
        nextPage.disabled = true;
        const direction = page === 2 ? 1 : -1;
        let frame = page === 2 ? 0 : 7;
        drawFrame(frame);
        const tick = () => {
          if (!menu.open) { cancelTurn(); return; }
          frame += direction;
          drawFrame(frame);
          if (frame === (direction > 0 ? 7 : 0)) finishTurn(page, keyboard);
          else frameTimer = setTimeout(tick, 75);
        };
        frameTimer = setTimeout(tick, 75);
      }
      nextPage.addEventListener('click', event => turnTo(2, event.detail === 0));
      prevPage.addEventListener('click', event => turnTo(1, event.detail === 0));
      menu.addEventListener('close', () => { cancelTurn(); showSpread(1); });
      reduce.addEventListener?.('change', () => {
        if (reduce.matches && turning) finishTurn(turnTarget, false);
      });

      // The original painted image remains visible on unsupported browsers or failed asset requests.
      const image = document.getElementById('menu-sprite-probe');
      if (image) {
        const ready = () => { assetReady = true; close.classList.add('is-enhanced'); };
        const failed = () => { assetReady = false; close.classList.remove('is-enhanced'); };
        image.addEventListener('load', ready);
        image.addEventListener('error', failed);
        if (image.complete) (image.naturalWidth > 0 ? ready : failed)();
      }
      showSpread(1);
    }

  }

})();
