// Lá trôi, nghĩ trôi (G07, #148). Leaves on a stream, adapted: pick a neutral thought or write a few words, place it on a
// leaf, and watch it pass. Nothing is pushed away, judged or kept: the words live only in this page's memory, are never
// put in a URL, storage or request, and are wiped when the leaf has passed, on stop, on reset and on leaving.
// No session timer, so no pause; one leaf drifts for DRIFT_MS and "cho lá trôi luôn" lets it go at once.
// idle → running (phase choose ⇄ drift) → complete | stopped → "chơi lại" → idle.

export const MAX_LEN = 60;
export const DRIFT_MS = 8000; // keep equal to the lt-drift animation duration in la-troi.css
const SETTLE_MS = 400; // taps this soon after the words change under a finger are dropped (same burst, not a new choice)

/** One line, trimmed, at most MAX_LEN characters; empty when there is nothing to place. */
export const cleanThought = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);

const game = document.querySelector('[data-game="la-troi"]');
if (game) {
  const $ = id => document.getElementById(id);
  const slip = $('lt-slip'), input = $('lt-input'), whisper = $('game-whisper');
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
  function setState(state) { game.dataset.state = state; }
  function setPhase(phase) { game.dataset.phase = phase; }

  // Forget every word: the field, the leaf, and nothing in the announcement ever repeated them.
  function wipe() {
    clearTimeout(driftTimer);
    driftTimer = 0;
    input.value = '';
    slip.textContent = '';
    slip.classList.remove('is-drifting', 'is-still');
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
    slip.classList.remove('is-drifting', 'is-still');
    void slip.offsetWidth; // restart the drift animation for a new leaf
    slip.classList.add(reduced.matches ? 'is-still' : 'is-drifting');
    setPhase('drift');
    settle();
    cue.textContent = 'Nhìn lá trôi qua';
    say('Đã đặt ý nghĩ lên lá. Lá đang trôi.'); // never read the words back
    game.querySelector('[data-act="pass"]').focus();
    driftTimer = setTimeout(passLeaf, DRIFT_MS);
  }

  function passLeaf() {
    if (game.dataset.phase !== 'drift') return;
    clearTimeout(driftTimer);
    driftTimer = 0;
    slip.textContent = '';
    slip.classList.remove('is-drifting', 'is-still');
    passed += 1;
    setPhase('choose');
    settle();
    cue.textContent = 'Chọn một ý nghĩ khác, hoặc xong';
    say('Lá đã trôi qua. Chọn ý nghĩ khác, hoặc xong.');
    firstIdea().focus(); // not the text field: that would open the phone keyboard on its own
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
    const target = event.target.closest('[data-act], [data-idea], a[href]');
    if (!target) return;
    if (performance.now() < settledAt) { event.preventDefault(); return; }
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

  // Turning reduced motion on mid-drift stills the leaf; the timer carries on.
  reduced.addEventListener?.('change', () => {
    if (game.dataset.phase === 'drift' && slip.textContent) {
      slip.classList.toggle('is-still', reduced.matches);
      slip.classList.toggle('is-drifting', !reduced.matches);
    }
  });

  // Leaving or coming back from the back/forward cache forgets everything; nothing resumes on its own.
  addEventListener('pagehide', () => { wipe(); passed = 0; setState('idle'); });
  addEventListener('pageshow', event => { if (event.persisted) { wipe(); passed = 0; setState('idle'); say(''); heading.focus(); } });

  try {
    wipe(); // some browsers restore input values on reload; this page never shows old words
    setState('idle');
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  } catch {
    setState('error');
  }
}
