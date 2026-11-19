// Design kit for the shared game screen (LAB-F06) driven by the shared engine (LAB-F07).
// Neutral demo steps (look at the cup / look out of the window), not an exercise. No storage, no network.
import { createSession, bindPageLifecycle, STATES } from '/lab/engine.mjs';

const game = document.querySelector('[data-kit]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), cue = $('game-cue');
  const dots = $('game-dots'), roundText = $('game-round'), pausedNote = $('game-paused-note');
  const CUES = { cup: 'Nhìn ly trà', window: 'Nhìn ra cửa sổ' };
  const SAYS = {
    start: 'Bắt đầu rồi.', pause: 'Đang tạm dừng.', hidden: 'Đã tạm dừng khi bạn rời trang.',
    suspended: 'Đã tạm dừng vì máy vừa ngủ.', resume: 'Tiếp tục nhé.', stop: 'Đã dừng.',
    finished: 'Trò đã kết thúc.', error: 'Trò chưa chạy được.',
  };
  let lastRound = 0;

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }

  function render(s, { focus = true } = {}) {
    const changedState = game.dataset.state !== s.state;
    game.dataset.state = s.state;
    cue.textContent = CUES[s.step] || '';
    roundText.textContent = `vòng ${s.round} / ${s.rounds}`;
    if (dots.children.length !== s.rounds) dots.replaceChildren(...Array.from({ length: s.rounds }, () => document.createElement('i')));
    [...dots.children].forEach((dot, i) => dot.classList.toggle('is-done', i < s.round - (s.state === 'complete' ? 0 : 1)));
    pausedNote.textContent = s.reason === 'hidden' || s.reason === 'suspended' ? 'Bấm “tiếp tục” khi bạn sẵn sàng.' : 'Cứ ngồi đó, không vội.';
    if (changedState) {
      reflect.hidden = false;
      say(SAYS[s.reason] || '');
      // The pressed word disappears in the new state: move focus to the new main word, never to <body>.
      // Automatic changes (hidden/suspended/finished) only move focus if it sat on a word that just disappeared.
      const active = document.activeElement;
      const stranded = game.contains(active) && active !== document.body && active.offsetParent === null;
      if (focus && (['start', 'pause', 'resume', 'stop', 'reset'].includes(s.reason) || stranded)) {
        const next = [...game.querySelectorAll('#game-controls .ink-word')].find(el => el.offsetParent !== null);
        if (next) next.focus();
      }
    } else if (s.state === 'running' && s.round !== lastRound && s.round > 1) {
      say(`Vòng ${s.round}.`); // main milestones only, never every second
    }
    lastRound = s.round;
  }

  const session = createSession({ steps: [{ id: 'cup', ms: 5000 }, { id: 'window', ms: 5000 }], rounds: 3, onChange: s => render(s) });
  bindPageLifecycle(session);

  const act = { start: () => session.start(), pause: () => session.pause(), resume: () => session.resume(), stop: () => session.stop(), again: () => session.reset() };
  game.addEventListener('click', event => {
    const word = event.target.closest('[data-act]');
    if (word && act[word.dataset.act]) { act[word.dataset.act](); return; }
    if (event.target.closest('[data-reflect]')) {
      // The answer is not kept anywhere: hide the question and say thanks.
      reflect.hidden = true;
      say('Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
    }
  });

  // Review of a single state for screenshots: ?state=complete renders that state statically (engine stays idle).
  const wanted = new URLSearchParams(location.search).get('state');
  const base = session.snapshot();
  if (STATES.includes(wanted) && wanted !== 'idle') {
    const reasons = { running: 'start', paused: 'pause', complete: 'finished', stopped: 'stop', error: 'error' };
    render({ ...base, state: wanted, reason: reasons[wanted], round: 2, step: 'cup' }, { focus: false });
  } else {
    render(base, { focus: false });
  }
}
