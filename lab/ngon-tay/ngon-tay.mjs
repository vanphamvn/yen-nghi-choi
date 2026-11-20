// Ngón tay biết thở (G04, #145). Trace the outline of a hand: up a finger while breathing in, down while breathing
// out, at your own natural pace. There is no timer: the marker moves only when the guest moves (any direction counts,
// precision is never needed) or presses "tiếp", so slow, shaky or no finger movement never blocks progress.
// Nothing is stored. idle → running (legs 1…10 or 1…20) → complete | stopped → "làm lại" → idle.

// Points on the hand (fractions of the hand picture), little finger to thumb: a start, then tip / gap pairs.
export const POINTS = [
  [0.122, 0.56], [0.067, 0.25], [0.236, 0.49], [0.239, 0.07], [0.364, 0.44], [0.428, 0.03],
  [0.517, 0.43], [0.633, 0.045], [0.678, 0.6], [0.95, 0.445], [0.778, 0.76],
];
export const FINGERS = ['út', 'áp út', 'giữa', 'trỏ', 'cái'];
export const LEGS = POINTS.length - 1; // 10: up and down each of five fingers
const SETTLE_MS = 400;
// Tracing can finish a leg no sooner than this after the leg began: a fast scribble never flips the breath cue faster
// than a calm breath. It is a speed limit on the picture, not a pace to follow (there is still no timer).
export const MIN_LEG_MS = 2000;
const HAND = { w: 75, h: 74 }; // crop of the G04 sprite, in sprite pixels (viewBox units)

/** What leg n (0-based, across rounds) asks for. Up a finger = breathe in, down = breathe out. */
export function legCue(n) {
  const leg = n % LEGS, finger = FINGERS[Math.floor(leg / 2)], up = leg % 2 === 0;
  return { finger, up, breath: up ? 'hít vào nhẹ' : 'thở ra nhẹ', line: `${up ? 'Lên' : 'Xuống'} ngón ${finger}: ${up ? 'hít vào nhẹ' : 'thở ra nhẹ'}` };
}

/** A point part-way along leg (0…LEGS-1), t in 0…1, in viewBox units. */
export function pointOn(leg, t) {
  const [a, b] = [POINTS[leg], POINTS[leg + 1]];
  return [(a[0] + (b[0] - a[0]) * t) * HAND.w, (a[1] + (b[1] - a[1]) * t) * HAND.h];
}

const game = document.querySelector('[data-game="ngon-tay"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), heading = $('game-title'), resultLine = $('nt-result-line');
  const hand = $('nt-hand'), done = $('nt-done'), marker = $('nt-marker'), cue = $('game-cue'), where = $('nt-where'), sr = $('nt-sr');
  const roundButtons = [...game.querySelectorAll('[data-rounds]')];

  let rounds = 1, leg = 0, t = 0;      // progress: leg index across rounds, fraction of the current leg
  let legAt = 0;                       // when the current leg began
  let drag = null;                     // { id, x, y } of the finger that is tracing
  let settledAt = 0;
  const settle = () => { settledAt = performance.now() + SETTLE_MS; };
  const total = () => rounds * LEGS;

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }
  const setState = state => { game.dataset.state = state; reflect.hidden = !(state === 'complete' || state === 'stopped'); };

  // ── picture: the traced part of the path and the marker, from (leg, t) ──
  function draw() {
    const inRound = leg % LEGS;
    const pts = [];
    for (let i = 0; i <= inRound; i++) pts.push(POINTS[i].map((v, k) => v * (k ? HAND.h : HAND.w)));
    const here = pointOn(inRound, Math.min(1, t));
    pts.push(here);
    done.setAttribute('points', pts.map(p => p.join(',')).join(' '));
    marker.setAttribute('cx', here[0]); marker.setAttribute('cy', here[1]);
  }
  function showCue({ announce = true } = {}) {
    const c = legCue(leg);
    cue.textContent = c.breath;
    where.textContent = `ngón ${c.finger} · ${c.up ? 'lên' : 'xuống'} · ${Math.floor((leg % LEGS) / 2) + 1} / 5${rounds > 1 ? ` · lượt ${Math.floor(leg / LEGS) + 1} / ${rounds}` : ''}`;
    if (announce) sr.textContent = `${c.line}.`; // one polite line per leg, never per pixel
    game.dataset.up = String(c.up);
  }

  // Move along the current leg. Tracing (fromPointer) waits just short of the leg's end until MIN_LEG_MS has passed;
  // either way at most one leg is completed per call and extra movement is not carried into the next leg.
  function advance(by, { fromPointer = false } = {}) {
    if (game.dataset.state !== 'running') return;
    t = Math.min(1, t + by);
    if (fromPointer && t >= 1 && performance.now() - legAt < MIN_LEG_MS) t = 0.97;
    if (t >= 1) {
      t = 0; leg++; legAt = performance.now();
      if (leg >= total()) { finish(); return; }
      showCue();
    }
    draw();
  }
  function finish() {
    drag = null;
    t = 1; leg = total() - 1; draw();
    setState('complete'); settle();
    sr.textContent = '';
    say('Xong một bàn tay rồi.');
    resultLine.focus(); // a stray Enter must not restart
  }
  function reset() { leg = 0; t = 0; legAt = performance.now(); drag = null; sr.textContent = ''; draw(); showCue({ announce: false }); }

  // ── tracing: any movement on the hand moves the marker on; about one leg's length of movement per leg ──
  const legLengthPx = () => {
    const box = hand.getBoundingClientRect(), [a, b] = [POINTS[leg % LEGS], POINTS[leg % LEGS + 1]];
    return Math.max(40, Math.hypot((b[0] - a[0]) * box.width, (b[1] - a[1]) * box.height));
  };
  hand.addEventListener('pointerdown', event => {
    if (game.dataset.state !== 'running' || drag || event.button > 0) return;
    event.preventDefault();
    if (performance.now() < settledAt) return; // the hand appears where "bắt đầu" was: a double tap is not a trace
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { hand.setPointerCapture(event.pointerId); } catch {}
  });
  hand.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dist = Math.hypot(event.clientX - drag.x, event.clientY - drag.y);
    drag.x = event.clientX; drag.y = event.clientY;
    if (dist > 0) advance(dist / legLengthPx(), { fromPointer: true });
  });
  // Lifting, a cancelled touch (scroll, call) or lost capture just stop tracing; progress stays where it is.
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) hand.addEventListener(type, event => { if (drag && event.pointerId === drag.id) drag = null; });

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      reset();
      setState('running'); settle();
      legAt = performance.now();
      showCue({ announce: false }); // one live update on start: the whisper carries the first cue too
      say(`Bắt đầu. Thở theo nhịp của bạn. ${legCue(0).line}.`);
      game.querySelector('[data-act="next"]').focus();
    },
    next: () => { if (game.dataset.state === 'running') { advance(1); settle(); } }, // a quick burst of taps moves one leg
    stop: () => {
      if (game.dataset.state !== 'running') return;
      reset();
      setState('stopped'); settle();
      say('Đã dừng.');
      game.querySelector('[data-act="again"]').focus();
    },
    again: () => { reset(); setState('idle'); say(''); heading.focus(); },
  };

  game.addEventListener('click', event => {
    const target = event.target.closest('[data-act], [data-rounds], a[href], [data-reflect]');
    if (!target) return;
    if (performance.now() < settledAt) { event.preventDefault(); return; }
    if (target.hasAttribute('data-reflect')) {
      reflect.hidden = true; // the answer is not kept anywhere
      settle();
      say(target.textContent.trim() === 'khó chịu hơn' ? 'Cảm ơn bạn đã nói. Cứ nghỉ và thở tự nhiên nhé; không cần làm lại.' : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
      return;
    }
    if (target.dataset.act && act[target.dataset.act]) { act[target.dataset.act](); return; }
    if (target.dataset.rounds && game.dataset.state === 'idle') {
      rounds = Number(target.dataset.rounds);
      for (const b of roundButtons) b.setAttribute('aria-pressed', String(b === target));
    }
  });
  game.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });

  // Leaving or coming back from the back/forward cache starts over; nothing resumes on its own.
  addEventListener('pagehide', () => { reset(); setState('idle'); say(''); });
  addEventListener('pageshow', event => { if (event.persisted) { reset(); setState('idle'); say(''); heading.focus(); } });

  try {
    $('nt-path').setAttribute('points', POINTS.map(([x, y]) => `${x * HAND.w},${y * HAND.h}`).join(' '));
    reset();
    setState('idle');
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  } catch {
    setState('error');
  }
  game.removeAttribute("data-loading"); // the module runs: no "đang mở ra" note from here on (LAB-F14)
}
