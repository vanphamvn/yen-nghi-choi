// Thở cùng Yên (G01, #142). Paced slow breathing with an own-pace option; no holds, no score, nothing stored.
// Timing comes from the shared engine (lab/engine.mjs); the picture follows it, never the other way round.
import { createSession, bindPageLifecycle } from '/lab/engine.mjs';

// Product choices, not prescribed doses (docs/yen-lab/SAFETY.md). Exhale ≥ inhale, never a hold.
export const PACES = {
  slow: { steps: [{ id: 'in', ms: 4000 }, { id: 'out', ms: 6000 }], hint: 'vào 4 giây · ra 6 giây', say: 'Hít vào nhẹ 4 giây, thở ra nhẹ 6 giây.' },
  mid: { steps: [{ id: 'in', ms: 3000 }, { id: 'out', ms: 4000 }], hint: 'vào 3 giây · ra 4 giây', say: 'Hít vào nhẹ 3 giây, thở ra nhẹ 4 giây.' },
  own: { steps: [{ id: 'own', ms: 10000 }], hint: 'không theo nhịp nào, chỉ ngồi thở', say: 'Cứ thở theo nhịp của bạn.' },
};
export const LENGTHS = [1, 3, 5]; // minutes
export const roundsFor = (minutes, pace) => {
  const roundMs = PACES[pace].steps.reduce((sum, s) => sum + s.ms, 0);
  return Math.max(1, Math.round((minutes * 60_000) / roundMs));
};

const CUES = { in: 'Hít vào nhẹ', out: 'Thở ra nhẹ', own: 'Cứ thở theo nhịp của bạn' };
const SCALE = { in: [0.9, 1.06], out: [1.06, 0.9] };

const game = document.querySelector('[data-game="tho"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), cue = $('game-cue'), seconds = $('tho-seconds');
  const dots = $('game-dots'), roundText = $('game-round'), pausedNote = $('game-paused-note');
  const buddy = $('tho-buddy'), paceHint = $('tho-pace-hint'), srCue = $('tho-sr-cue');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const choice = { length: 1, pace: 'slow' };
  let session = null;
  let breath = null;        // the current Web Animation on Cục Yên
  let secondsTimer = null;  // display-only countdown; the engine owns real timing
  let shownKey = '';        // round:step currently on screen, so the countdown never runs ahead of the cue

  const SAYS = {
    pause: 'Đang tạm dừng.', hidden: 'Đã tạm dừng khi bạn rời trang.', suspended: 'Đã tạm dừng vì máy vừa ngủ.',
    resume: 'Tiếp tục nhé.', stop: 'Đã dừng.', finished: 'Trò đã kết thúc.', error: 'Trò chưa chạy được.',
  };

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }

  // ── picture: one finite animation per phase, positioned at the engine's elapsed time ──
  function stopBreath() { if (breath) { breath.cancel(); breath = null; } }
  function drawBreath(s) {
    stopBreath();
    const range = SCALE[s.step];
    if (!range || reduceMotion.matches || typeof buddy.animate !== 'function') return; // text guide only
    breath = buddy.animate([{ transform: `scale(${range[0]})` }, { transform: `scale(${range[1]})` }], { duration: s.stepMs, easing: 'ease-in-out', fill: 'forwards' });
    if (s.state !== 'running') breath.pause();
    breath.currentTime = s.stepElapsed;
  }

  // ── text guide: whole seconds left in this phase ──
  function stopSeconds() { clearTimeout(secondsTimer); secondsTimer = null; }
  function drawSeconds() {
    stopSeconds();
    const s = session && session.snapshot();
    if (!s || s.state !== 'running') { seconds.textContent = ''; return; }
    // The engine's step tick may land a moment after this timer: wait for it rather than show the next phase early.
    if (`${s.round}:${s.step}` !== shownKey) { secondsTimer = setTimeout(drawSeconds, 50); return; }
    if (s.step === 'own') {
      // Own pace: no breath count, only the time left overall (updated each second).
      const left = Math.max(0, s.total - s.elapsed);
      const sec = Math.ceil(left / 1000);
      seconds.textContent = `còn ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      secondsTimer = setTimeout(drawSeconds, (left % 1000) || 1000);
      return;
    }
    const left = Math.max(0, s.stepMs - s.stepElapsed);
    seconds.textContent = `còn ${Math.max(1, Math.ceil(left / 1000))} giây`;
    secondsTimer = setTimeout(drawSeconds, (left % 1000) || 1000);
  }

  function render(s, { focus = true } = {}) {
    const changedState = game.dataset.state !== s.state;
    game.dataset.state = s.state;
    cue.textContent = CUES[s.step] || '';
    roundText.textContent = `vòng ${s.round} / ${s.rounds}`;
    if (dots.children.length !== Math.min(s.rounds, 12)) dots.replaceChildren(...Array.from({ length: Math.min(s.rounds, 12) }, () => document.createElement('i')));
    const done = Math.round(((s.round - (s.state === 'complete' ? 0 : 1)) / s.rounds) * dots.children.length);
    [...dots.children].forEach((dot, i) => dot.classList.toggle('is-done', i < done));
    pausedNote.textContent = s.reason === 'hidden' || s.reason === 'suspended' ? 'Bấm “tiếp tục” khi bạn sẵn sàng. Cứ thở theo nhịp của bạn.' : 'Cứ thở theo nhịp của bạn.';

    game.dataset.pace = choice.pace;
    if (s.state === 'running') {
      const key = `${s.round}:${s.step}`;
      // Screen readers: one short, polite announcement per phase (every 3–6 s), never every second.
      if (key !== shownKey && s.step !== 'own' && s.reason === 'step') srCue.textContent = CUES[s.step];
      shownKey = key;
      drawBreath(s); drawSeconds();
    }
    // pause() only takes effect on the next frame; pinning currentTime freezes the picture exactly where the engine stopped
    else if (s.state === 'paused') { if (breath) { breath.pause(); breath.currentTime = s.stepElapsed; } stopSeconds(); }
    else { stopBreath(); stopSeconds(); seconds.textContent = ''; srCue.textContent = ''; shownKey = ''; }

    if (changedState) {
      reflect.hidden = false;
      say(s.reason === 'start' ? `Bắt đầu. ${PACES[choice.pace].say}` : SAYS[s.reason] || '');
      const active = document.activeElement;
      const stranded = game.contains(active) && active !== document.body && active.offsetParent === null;
      if (focus && (['start', 'pause', 'resume', 'stop', 'reset'].includes(s.reason) || stranded)) {
        const next = [...game.querySelectorAll('#game-controls .ink-word')].find(el => el.offsetParent !== null);
        if (next) next.focus();
      }
    }
  }

  function newSession() {
    if (session) session.destroy();
    session = createSession({ steps: PACES[choice.pace].steps, rounds: roundsFor(choice.length, choice.pace), onChange: s => render(s) });
  }

  // The page lifecycle talks to whichever session is current.
  bindPageLifecycle({ pause: why => session && session.pause(why), reset: why => session && session.reset(why) });

  function pick(group, value) {
    choice[group] = group === 'length' ? Number(value) : value;
    game.querySelectorAll(`[data-${group}]`).forEach(el => el.setAttribute('aria-pressed', String(el.dataset[group] === value)));
    paceHint.textContent = PACES[choice.pace].hint;
    newSession();
    render(session.snapshot(), { focus: false });
  }

  const act = {
    start: () => { if (session.state !== 'idle') return; session.start(); },
    pause: () => session.pause(),
    resume: () => session.resume(),
    stop: () => session.stop(),
    again: () => session.reset(),
  };

  game.addEventListener('click', event => {
    const word = event.target.closest('[data-act]');
    if (word && act[word.dataset.act]) { act[word.dataset.act](); return; }
    const opt = event.target.closest('[data-length], [data-pace]');
    if (opt && game.dataset.state === 'idle') { pick(opt.dataset.length ? 'length' : 'pace', opt.dataset.length || opt.dataset.pace); return; }
    const answer = event.target.closest('[data-reflect]');
    if (answer) {
      reflect.hidden = true; // the answer is not kept anywhere
      say(answer.textContent.trim() === 'khó chịu hơn'
        ? 'Cảm ơn bạn đã nói. Cứ nghỉ và thở tự nhiên nhé; không cần làm lại.'
        : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
    }
  });

  // If motion is turned off mid-game, drop the animation at once; the text guide carries on.
  reduceMotion.addEventListener?.('change', () => { if (reduceMotion.matches) stopBreath(); else if (session.state === 'running') drawBreath(session.snapshot()); });

  newSession();
  render(session.snapshot(), { focus: false });
  game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  game.removeAttribute("data-loading"); // the module runs: no "đang mở ra" note from here on (LAB-F14)
}
