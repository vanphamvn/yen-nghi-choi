// Căng rồi thả (G02, #143). A shortened tense-and-release round (progressive muscle relaxation, Bernstein–Borkovec
// four-area order: hands/arms, face, shoulders, legs) with a release-only option. Gentle tension only, never a hold,
// every part can be left out before starting or skipped while playing, no score, nothing stored.
// Timing comes from the shared engine (lab/engine.mjs); the picture follows it, never the other way round.
import { createSession, bindPageLifecycle } from '/lab/engine.mjs';

// Product choices, not prescribed doses (docs/yen-lab/EVIDENCE.md G02): ≤ 5 s light tension, a longer release.
export const MODES = {
  tense: { steps: [{ id: 'tense', ms: 5000 }, { id: 'release', ms: 20000 }], hint: 'căng nhẹ 5 giây · thả 20 giây, mỗi chỗ hai lần', say: 'Căng nhẹ 5 giây rồi thả 20 giây.' },
  release: { steps: [{ id: 'notice', ms: 5000 }, { id: 'release', ms: 20000 }], hint: 'không gồng gì cả · để ý 5 giây, thả lỏng 20 giây', say: 'Không gồng, chỉ để ý rồi thả lỏng.' },
};
export const REPS = 2; // each part twice, as in the abbreviated procedure
// Fixed order (Bernstein–Borkovec 4 areas). No neck rolls, no toe curls, no maximal effort.
export const PARTS = {
  tay: { name: 'tay', tense: 'Nắm nhẹ hai bàn tay', notice: 'Để ý hai bàn tay', release: 'Thả tay ra, để ngón tay mềm' },
  mat: { name: 'mặt', tense: 'Nhíu nhẹ trán, mím nhẹ môi', notice: 'Để ý trán và hàm', release: 'Thả lỏng trán, hàm và môi' },
  vai: { name: 'vai', tense: 'Nhún nhẹ hai vai lên một chút', notice: 'Để ý hai vai', release: 'Thả vai xuống, thật chậm' },
  chan: { name: 'chân', tense: 'Ép nhẹ hai bàn chân xuống sàn', notice: 'Để ý hai bàn chân', release: 'Thả chân ra, để chân nặng xuống' },
};
const ORDER = Object.keys(PARTS);
const SUBS = { tense: 'nhẹ thôi, vẫn thở bình thường', notice: 'không cần gồng', release: 'để ý cảm giác lúc thả' };
// Cục Yên squeezes a little while tensing and settles on release; nothing moves when only noticing.
const SQUEEZE = 'scale(1.05, 0.94)';
const SHAPES = {
  tense: [{ transform: 'scale(1)', offset: 0 }, { transform: SQUEEZE, offset: 0.24 }, { transform: SQUEEZE, offset: 1 }],
  release: [{ transform: SQUEEZE, offset: 0 }, { transform: 'scale(1)', offset: 0.12 }, { transform: 'scale(1)', offset: 1 }],
};

export const roundMs = mode => MODES[mode].steps.reduce((sum, s) => sum + s.ms, 0);
export const durationText = (parts, mode) => {
  const sec = Math.round((parts * REPS * roundMs(mode)) / 1000);
  const m = Math.floor(sec / 60), s = sec % 60;
  return m && s ? `${m} phút ${s} giây` : m ? `${m} phút` : `${s} giây`;
};

const game = document.querySelector('[data-game="cang"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), cue = $('game-cue'), sub = $('cang-sub'), seconds = $('cang-seconds');
  const dots = $('game-dots'), roundText = $('game-round'), pausedNote = $('game-paused-note');
  const buddy = $('cang-buddy'), stage = $('cang-stage'), modeHint = $('cang-mode-hint'), partHint = $('cang-part-hint'), srCue = $('cang-sr-cue');
  const startWord = game.querySelector('[data-act="start"]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const choice = { mode: 'tense', parts: new Set(ORDER) };
  let chosen = ORDER;       // the parts of the current session, in fixed order
  let session = null;
  let squeeze = null;       // the current Web Animation on Cục Yên
  let secondsTimer = null;  // display-only countdown; the engine owns real timing
  let shownKey = '';

  const SAYS = {
    pause: 'Đang tạm dừng.', hidden: 'Đã tạm dừng khi bạn rời trang.', suspended: 'Đã tạm dừng vì máy vừa ngủ.',
    resume: 'Tiếp tục nhé.', stop: 'Đã dừng.', finished: 'Trò đã kết thúc.', error: 'Trò chưa chạy được.',
  };

  const partOf = round => PARTS[chosen[Math.floor((round - 1) / REPS)]];
  const repOf = round => ((round - 1) % REPS) + 1;
  const cueFor = s => partOf(s.round)[s.step];

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }

  // ── picture: one finite animation per phase, positioned at the engine's elapsed time ──
  function stopSqueeze() { if (squeeze) { squeeze.cancel(); squeeze = null; } }
  function drawSqueeze(s) {
    stopSqueeze();
    const shape = choice.mode === 'tense' ? SHAPES[s.step] : null; // release-only mode: Cục Yên never squeezes
    if (!shape || reduceMotion.matches || typeof buddy.animate !== 'function') return; // text guide only
    squeeze = buddy.animate(shape, { duration: s.stepMs, easing: 'ease-in-out', fill: 'forwards' });
    if (s.state !== 'running') squeeze.pause();
    squeeze.currentTime = s.stepElapsed;
  }

  // ── text guide: whole seconds left in this phase ──
  function stopSeconds() { clearTimeout(secondsTimer); secondsTimer = null; }
  function drawSeconds() {
    stopSeconds();
    const s = session && session.snapshot();
    if (!s || s.state !== 'running') { seconds.textContent = ''; return; }
    if (`${s.round}:${s.step}` !== shownKey) { secondsTimer = setTimeout(drawSeconds, 50); return; } // wait for the engine's tick
    const left = Math.max(0, s.stepMs - s.stepElapsed);
    seconds.textContent = `còn ${Math.max(1, Math.ceil(left / 1000))} giây`;
    secondsTimer = setTimeout(drawSeconds, (left % 1000) || 1000);
  }

  function render(s, { focus = true } = {}) {
    const changedState = game.dataset.state !== s.state;
    game.dataset.state = s.state;
    game.dataset.mode = choice.mode;
    const part = partOf(s.round);
    const index = Math.floor((s.round - 1) / REPS);
    cue.textContent = cueFor(s) || '';
    sub.textContent = SUBS[s.step] || '';
    stage.dataset.part = chosen[index];
    roundText.textContent = `${part.name} · lần ${repOf(s.round)} / ${REPS}`;
    if (dots.children.length !== chosen.length) dots.replaceChildren(...chosen.map(() => document.createElement('i')));
    const done = s.state === 'complete' ? chosen.length : index;
    [...dots.children].forEach((dot, i) => dot.classList.toggle('is-done', i < done));
    pausedNote.textContent = s.reason === 'hidden' || s.reason === 'suspended' ? 'Bấm “tiếp tục” khi bạn sẵn sàng. Cứ thả lỏng, thở tự nhiên.' : 'Cứ thả lỏng, thở tự nhiên.';

    if (s.state === 'running') {
      const key = `${s.round}:${s.step}`;
      // Screen readers: one short, polite announcement per phase (every 5–20 s), never every second.
      if (key !== shownKey && ['step', 'start', 'resume', 'skip'].includes(s.reason)) srCue.textContent = cueFor(s);
      shownKey = key;
      drawSqueeze(s); drawSeconds();
    } else if (s.state === 'paused') {
      stopSeconds();
      // Skipped while paused: the next part starts relaxed, and "tiếp tục" must announce its first cue.
      if (s.reason === 'skip') { stopSqueeze(); shownKey = ''; }
      else { if (squeeze) { squeeze.pause(); squeeze.currentTime = s.stepElapsed; } shownKey = `${s.round}:${s.step}`; }
    } else { stopSqueeze(); stopSeconds(); seconds.textContent = ''; srCue.textContent = ''; shownKey = ''; }

    if (changedState) {
      reflect.hidden = false;
      say(s.reason === 'start' ? `Bắt đầu. ${MODES[choice.mode].say}` : SAYS[s.reason] || '');
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
    chosen = ORDER.filter(p => choice.parts.has(p));
    const usable = chosen.length > 0;
    if (!usable) chosen = [ORDER[0]]; // placeholder session; "bắt đầu" stays disabled until a part is chosen
    session = createSession({ steps: MODES[choice.mode].steps, rounds: chosen.length * REPS, onChange: s => render(s) });
    startWord.disabled = !usable;
    partHint.classList.toggle('is-warn', !usable);
    partHint.textContent = usable ? `bỏ chọn chỗ nào đang đau · khoảng ${durationText(chosen.length, choice.mode)}` : 'chọn ít nhất một chỗ nhé';
  }

  bindPageLifecycle({ pause: why => session && session.pause(why), reset: why => session && session.reset(why) });

  function pick(el) {
    if (el.dataset.mode) {
      choice.mode = el.dataset.mode;
      game.querySelectorAll('[data-mode]').forEach(b => b.matches('button') && b.setAttribute('aria-pressed', String(b.dataset.mode === choice.mode)));
      modeHint.textContent = MODES[choice.mode].hint;
    } else {
      const p = el.dataset.part;
      if (choice.parts.has(p)) choice.parts.delete(p); else choice.parts.add(p);
      el.setAttribute('aria-pressed', String(choice.parts.has(p)));
    }
    newSession();
    render(session.snapshot(), { focus: false });
  }

  let skipRetry = null;
  function skip(retried = false) {
    if (skipRetry) return; // one retry already queued for this tap
    const s = session.snapshot();
    if (s.state !== 'running' && s.state !== 'paused') return;
    const index = Math.floor((s.round - 1) / REPS);
    const name = PARTS[chosen[index]].name;
    if (!session.skipTo((index + 1) * REPS + 1)) {
      // Tapped right after "bắt đầu"/"tiếp tục"/another skip: the engine's double-tap guard said no. Try once more
      // just after it, so the tap is not silently lost.
      if (!retried) skipRetry = setTimeout(() => { skipRetry = null; skip(true); }, 360);
      return;
    }
    // Skipping is never a failure: say what happened, plainly, and move on (the last part simply ends the game).
    if (session.state === 'complete') return;
    say(session.state === 'paused'
      ? `Bỏ qua ${name}. Tiếp theo: ${PARTS[chosen[index + 1]].name}, khi bạn bấm “tiếp tục”.`
      : `Bỏ qua ${name}. Không sao cả.`);
  }

  const act = {
    start: () => { if (session.state !== 'idle' || startWord.disabled) return; session.start(); },
    pause: () => session.pause(),
    resume: () => session.resume(),
    skip: () => skip(),
    stop: () => { clearTimeout(skipRetry); skipRetry = null; session.stop(); },
    again: () => { clearTimeout(skipRetry); skipRetry = null; session.reset(); },
  };

  game.addEventListener('click', event => {
    const word = event.target.closest('[data-act]');
    if (word && act[word.dataset.act]) { act[word.dataset.act](); return; }
    const opt = event.target.closest('button[data-mode], button[data-part]');
    if (opt && game.dataset.state === 'idle') { pick(opt); return; }
    const answer = event.target.closest('[data-reflect]');
    if (answer) {
      reflect.hidden = true; // the answer is not kept anywhere
      say(answer.textContent.trim() === 'khó chịu hơn'
        ? 'Cảm ơn bạn đã nói. Cứ nghỉ và thả lỏng nhé; không cần làm lại.'
        : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
    }
  });

  reduceMotion.addEventListener?.('change', () => { if (reduceMotion.matches) stopSqueeze(); else if (session.state === 'running') drawSqueeze(session.snapshot()); });

  newSession();
  render(session.snapshot(), { focus: false });
  game.removeAttribute("data-loading"); // the module runs; "bắt đầu" may still be off on purpose (no part chosen), which is not loading (LAB-F14)
}
