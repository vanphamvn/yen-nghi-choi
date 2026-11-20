// Ngồi nhìn mây (G08, #149). Watch slow clouds for 1–3 minutes; when attention wanders, notice and look again.
// Wandering is never counted, scored or remembered. Timing comes from the shared engine (lab/engine.mjs): it pauses
// when the page is hidden and never resumes on its own. The clouds are CSS only and follow data-state / data-clouds,
// so pausing the game freezes them and a still sky (chosen, or reduced motion) never moves at all.
import { createSession, bindPageLifecycle } from '/lab/engine.mjs';

export const LENGTHS = [1, 2, 3]; // minutes; product choices, not doses (EVIDENCE.md G08: no research dose exists)
const MINUTE = { id: 'watch', ms: 60_000 };

// Gentle lines for "mình lơ đãng rồi", in turn. None counts, praises or blames.
export const WANDER = [
  'Không sao. Nhìn lại một đám mây nào đó.',
  'Lơ đãng rồi quay lại, vậy là được.',
  'Chọn một đám mây, nhìn mép của nó một chút.',
  'Ý nghĩ cứ trôi như mây. Mình nhìn lại trời.',
];

/** "còn 1:05" for the time left, whole seconds rounded up. */
export const leftText = ms => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  return `còn ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

const game = document.querySelector('[data-game="nhin-may"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), left = $('nm-left'), pausedNote = $('game-paused-note');
  const resultLine = $('nm-result-line');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const choice = { length: 1, clouds: 'drift' };
  let session = null;
  let leftTimer = null; // display-only countdown; the engine owns real timing
  let wanderAt = 0;
  let settledAt = 0; // "mình lơ đãng rồi" appears where "bắt đầu"/"tiếp tục" was: drop a second tap of the same burst
  const SETTLE_MS = 400;

  const SAYS = {
    pause: 'Đang tạm dừng.', hidden: 'Đã tạm dừng khi bạn rời trang.', suspended: 'Đã tạm dừng vì máy vừa ngủ.',
    resume: 'Tiếp tục nhìn mây nhé.', stop: 'Đã dừng.', finished: 'Hết giờ rồi.', error: 'Trò chưa chạy được.',
  };

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }

  function stopLeft() { clearTimeout(leftTimer); leftTimer = null; }
  function drawLeft() {
    stopLeft();
    const s = session && session.snapshot();
    if (!s || (s.state !== 'running' && s.state !== 'paused')) { left.textContent = ''; return; }
    const ms = s.total - s.elapsed;
    left.textContent = leftText(ms);
    if (s.state === 'running') leftTimer = setTimeout(drawLeft, (ms % 1000) || 1000);
  }

  function render(s, { focus = true } = {}) {
    const changedState = game.dataset.state !== s.state;
    game.dataset.state = s.state;
    game.dataset.clouds = choice.clouds;
    pausedNote.textContent = s.reason === 'hidden' || s.reason === 'suspended' ? 'Bấm “tiếp tục” khi bạn sẵn sàng. Mây chờ bạn.' : 'Mây chờ bạn.';
    drawLeft();

    if (changedState) {
      reflect.hidden = !(s.state === 'complete' || s.state === 'stopped');
      say(s.reason === 'start' ? 'Bắt đầu. Cứ nhìn mây, không cần làm gì thêm.' : SAYS[s.reason] || '');
      const active = document.activeElement;
      const stranded = game.contains(active) && active !== document.body && active.offsetParent === null;
      if (s.reason === 'finished' && (stranded || active === document.body)) resultLine.focus(); // a stray Enter must not restart
      else if (focus && (['start', 'pause', 'resume', 'stop', 'reset'].includes(s.reason) || stranded)) {
        const next = [...game.querySelectorAll('#game-controls .ink-word')].find(el => el.offsetParent !== null);
        if (next) next.focus();
      }
    }
  }

  function newSession() {
    if (session) session.destroy();
    session = createSession({ steps: [MINUTE], rounds: choice.length, onChange: s => render(s) });
  }

  // The page lifecycle talks to whichever session is current: hiding the page pauses, leaving resets.
  bindPageLifecycle({ pause: why => session && session.pause(why), reset: why => session && session.reset(why) });

  function pick(group, value) {
    choice[group] = group === 'length' ? Number(value) : value;
    const attr = group === 'length' ? 'length' : 'sky';
    game.querySelectorAll(`button[data-${attr}]`).forEach(el => el.setAttribute('aria-pressed', String(el.dataset[attr] === value)));
    newSession();
    render(session.snapshot(), { focus: false });
  }

  const act = {
    start: () => { if (session.state !== 'idle') return; wanderAt = 0; settledAt = performance.now() + SETTLE_MS; session.start(); },
    wander: () => {
      if (session.state !== 'running' || performance.now() < settledAt) return;
      say(WANDER[wanderAt % WANDER.length]); // not counted: the index only picks the next gentle line
      wanderAt++;
    },
    pause: () => session.pause(),
    resume: () => { settledAt = performance.now() + SETTLE_MS; session.resume(); },
    stop: () => session.stop(),
    again: () => session.reset(),
  };

  game.addEventListener('click', event => {
    const word = event.target.closest('[data-act]');
    if (word && act[word.dataset.act]) { act[word.dataset.act](); return; }
    const opt = event.target.closest('button[data-length], button[data-sky]');
    if (opt && game.dataset.state === 'idle') { pick(opt.dataset.length ? 'length' : 'clouds', opt.dataset.length || opt.dataset.sky); return; }
    const answer = event.target.closest('[data-reflect]');
    if (answer) {
      reflect.hidden = true; // the answer is not kept anywhere
      say(answer.textContent.trim() === 'khó chịu hơn'
        ? 'Cảm ơn bạn đã nói. Cứ nghỉ mắt, nhìn ra xa một chút nhé; không cần làm lại.'
        : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
    }
  });
  // A held Enter/Space repeats clicks on the focused word; only a fresh press counts.
  game.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });

  // Reduced motion: the sky is always still (lab.css stops every animation); say so instead of offering "trôi".
  const syncMotion = () => { game.dataset.motion = reduceMotion.matches ? 'reduce' : 'ok'; };
  reduceMotion.addEventListener?.('change', syncMotion);
  syncMotion();

  try {
    newSession();
    render(session.snapshot(), { focus: false });
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  } catch {
    game.dataset.state = 'error';
  }
  game.removeAttribute("data-loading"); // the module runs: no "đang mở ra" note from here on (LAB-F14)
}
