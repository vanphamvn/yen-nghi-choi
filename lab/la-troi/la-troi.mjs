// Lá trôi, nghĩ trôi (G07, #148). Leaves on a stream, adapted: pick a neutral thought or write a few words, place it on a
// leaf, and watch it pass. Nothing is pushed away, judged or kept: the words live only in this page's memory, are never
// put in a URL, storage or request, and are wiped when the leaf has passed, on stop, on reset and on leaving.
// No session timer, so no pause; one leaf drifts for DRIFT_MS and "cho lá trôi luôn" lets it go at once. With reduced
// motion the leaf rests still and stays until the guest lets it go (no time limit on reading it).
// idle → running (phase choose ⇄ drift) → complete | stopped → "chơi lại" → idle.

export const MAX_LEN = 60;
export const DRIFT_MS = 8000; // keep equal to the lt-drift animation duration in la-troi.css
const SETTLE_MS = 400; // taps this soon after the words change under a finger are dropped (same burst, not a new choice)

/** One line, trimmed, at most MAX_LEN characters; empty when there is nothing to place. */
export const cleanThought = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);

const game = document.querySelector('[data-game="la-troi"]');
if (game) {
  const $ = id => document.getElementById(id);
  const reflect = $('game-reflect'); // optional "lúc này bạn thấy sao?" after the game; the answer is never kept
  const lane = $('lt-lane'), slip = $('lt-slip'), input = $('lt-input'), whisper = $('game-whisper');
  const cue = $('game-cue'), heading = $('game-title'), resultLine = $('lt-result-line');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let driftTimer = 0;
  let settledAt = 0;
  let passed = 0;
  const settle = () => { settledAt = performance.now() + SETTLE_MS; };

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }
  function setState(state) { game.dataset.state = state; if (state === 'complete' || state === 'stopped') reflect.hidden = false; }
  function setPhase(phase) { game.dataset.phase = phase; }

  // Forget every word: the field, the leaf, and nothing in the announcement ever repeated them.
  function wipe() {
    clearTimeout(driftTimer);
    driftTimer = 0;
    input.value = '';
    slip.textContent = '';
    lane.classList.remove('is-drifting', 'is-still');
    setPhase('choose');
    cue.textContent = 'Chọn một ý nghĩ, hoặc viết vài chữ';
  }

  function firstIdea() { return game.querySelector('[data-idea]'); }

  function place(text) {
    const thought = cleanThought(text);
    if (!thought) { say('Chọn một ý nghĩ có sẵn, hoặc viết vài chữ trước.'); input.focus(); return; }
    input.value = '';
    input.blur(); // close the phone keyboard so the stream can be seen
    slip.textContent = thought;
    lane.classList.remove('is-drifting', 'is-still');
    void lane.offsetWidth; // restart the drift animation for a new leaf
    setPhase('drift');
    settle();
    game.querySelector('[data-act="pass"]').focus();
    // never read the words back
    if (reduced.matches) {
      lane.classList.add('is-still');
      cue.textContent = 'Nhìn lá trên dòng suối';
      say('Đã đặt ý nghĩ lên lá. Lá nằm yên đến khi bạn chạm “cho lá trôi luôn”.');
    } else {
      lane.classList.add('is-drifting');
      cue.textContent = 'Nhìn lá trôi qua';
      say('Đã đặt ý nghĩ lên lá. Lá đang trôi.');
      driftTimer = setTimeout(passLeaf, DRIFT_MS);
    }
  }

  function passLeaf() {
    if (game.dataset.phase !== 'drift') return;
    clearTimeout(driftTimer);
    driftTimer = 0;
    slip.textContent = '';
    lane.classList.remove('is-drifting', 'is-still');
    passed += 1;
    setPhase('choose');
    settle();
    cue.textContent = 'Chọn một ý nghĩ khác, hoặc xong';
    say('Lá đã trôi qua. Chọn ý nghĩ khác, hoặc xong.');
    // Only move focus if it was on "cho lá trôi luôn" (now hidden) or lost: never pull a guest away from where they are.
    // Not the text field either: that would open the phone keyboard on its own.
    const here = document.activeElement;
    if (!here || here === document.body || here.dataset.act === 'pass') firstIdea().focus();
  }

  function finish() {
    wipe();
    resultLine.textContent = passed ? 'Ngồi xem lá trôi xong rồi.' : 'Hôm nay chỉ ngồi nhìn suối cũng được.';
    setState('complete');
    settle();
    say('Đã xong.');
    resultLine.focus(); // not "chơi lại": a stray tap or Enter must not restart
  }

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      wipe();
      passed = 0;
      setState('running');
      settle();
      say('Bắt đầu. Chọn một ý nghĩ có sẵn, hoặc viết vài chữ rồi đặt lên lá.');
      firstIdea().focus();
    },
    place: () => { if (game.dataset.state === 'running' && game.dataset.phase === 'choose') place(input.value); },
    pass: () => { if (game.dataset.state === 'running') passLeaf(); },
    done: () => { if (game.dataset.state === 'running' && game.dataset.phase === 'choose') finish(); },
    stop: () => {
      if (game.dataset.state !== 'running') return;
      wipe();
      setState('stopped');
      settle();
      say('Đã dừng, chữ đã xóa.');
      game.querySelector('[data-act="again"]').focus();
    },
    again: () => { wipe(); passed = 0; setState('idle'); say(''); heading.focus(); },
  };

  game.addEventListener('click', event => {
    const target = event.target.closest('[data-act], [data-idea], a[href], [data-reflect]');
    if (!target) return;
    if (performance.now() < settledAt) { event.preventDefault(); return; }
    if (target.hasAttribute('data-reflect')) {
      reflect.hidden = true; // the answer is not kept anywhere
      settle(); // the block collapses and the words below move up under the finger: drop a leftover tap
      say(target.textContent.trim() === 'khó chịu hơn' ? 'Cảm ơn bạn đã nói. Nghỉ một chút nhé; không cần nghĩ tiếp hay làm lại.' : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
      return;
    }
    if (target.dataset.act && act[target.dataset.act]) { act[target.dataset.act](); return; }
    if (target.hasAttribute('data-idea') && game.dataset.state === 'running' && game.dataset.phase === 'choose') place(target.textContent);
  });
  // A held Enter/Space repeats clicks on the focused word; only a fresh press counts.
  game.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });

  // Enter in the field places the thought (there is no <form>, so nothing is ever submitted).
  input.addEventListener('keydown', event => {
    // Vietnamese IME composition uses Enter too (Safari reports keyCode 229); a held Enter must not run on.
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229 || event.repeat) return;
    event.preventDefault();
    act.place();
  });
  // Phone keyboards cover the lower half: keep the field and "đặt lên lá" visible once it opens.
  input.addEventListener('focus', () => {
    setTimeout(() => { if (document.activeElement === input) input.closest('.lt-write').scrollIntoView({ block: 'nearest', behavior: 'instant' }); }, 250);
  });

  // Turning reduced motion on mid-drift stills the leaf and stops its timer: it then waits to be let go. Turning it off
  // mid-drift leaves a resting leaf resting (restarting the drift would make it vanish mid-stream).
  reduced.addEventListener?.('change', () => {
    if (reduced.matches && game.dataset.phase === 'drift' && slip.textContent) {
      clearTimeout(driftTimer);
      driftTimer = 0;
      lane.classList.replace('is-drifting', 'is-still');
    }
  });

  // Leaving or coming back from the back/forward cache forgets everything; nothing resumes on its own.
  addEventListener('pagehide', () => { wipe(); passed = 0; setState('idle'); });
  addEventListener('pageshow', event => { if (event.persisted) { wipe(); passed = 0; setState('idle'); say(''); heading.focus(); } });

  try {
    wipe(); // some browsers restore input values on reload; this page never shows old words
    setState('idle');
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
    game.removeAttribute("data-loading"); // the module runs: no "đang mở ra" note from here on (LAB-F14)
  } catch {
    setState('error');
  }
}
