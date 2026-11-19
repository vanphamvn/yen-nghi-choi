// LAB-F06 (#130) design kit: walks the shared game screen through its states. No timer, no storage, no network.
// The real engine (LAB-F07, #131) owns timing; this only shows what each state looks like and how focus moves.
(() => {
  'use strict';
  const game = document.querySelector('[data-kit]');
  if (!game) return;
  const whisper = document.getElementById('game-whisper');
  const reflect = document.getElementById('game-reflect');
  const STATES = ['idle', 'running', 'paused', 'complete', 'stopped', 'error'];
  const says = { running: 'Bắt đầu rồi.', paused: 'Đang tạm dừng.', stopped: 'Đã dừng.', complete: 'Trò đã kết thúc.', idle: '', error: 'Trò chưa chạy được.' };

  function say(text) {
    whisper.textContent = text;
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }

  function set(state, { focus = true } = {}) {
    game.dataset.state = state;
    reflect.hidden = false;
    say(says[state]);
    if (!focus) return;
    // The pressed word disappears in the new state, so move focus to the new main word (never lose it to <body>).
    const next = [...game.querySelectorAll('#game-controls .ink-word')].find(el => el.offsetParent !== null);
    if (next) next.focus();
  }

  const go = { start: 'running', pause: 'paused', resume: 'running', stop: 'stopped', again: 'idle' };
  game.addEventListener('click', event => {
    const act = event.target.closest('[data-act]');
    if (act && go[act.dataset.act]) { set(go[act.dataset.act]); return; }
    if (event.target.closest('[data-reflect]')) {
      // The answer is not kept anywhere: hide the question and say thanks.
      reflect.hidden = true;
      say('Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
    }
  });

  // Screenshots / review of a single state: ?state=complete (only known state names are accepted).
  const wanted = new URLSearchParams(location.search).get('state');
  set(STATES.includes(wanted) ? wanted : 'idle', { focus: false });

  // Back/forward cache: never resume a game silently.
  window.addEventListener('pageshow', event => { if (event.persisted) set('idle', { focus: false }); });
})();
