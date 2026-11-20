// Gọi tên cơn bực (G09, #150). Affect labeling, adapted: pick up to two words for what is felt right now (any feeling,
// or "không biết gọi tên"), optionally how strong, then just look at the words. No diagnosis, no interpretation, no
// reading of the choice; the choices live only in this page's memory and are wiped on stop, reset and leaving.
// No timer, so no pause. idle → running (phase choose ⇄ view; "sửa lại" goes back with the choices kept) → complete |
// stopped → "chơi lại" → idle.

export const MAX_FEELINGS = 2;
const SETTLE_MS = 400; // taps this soon after the words change under a finger are dropped (same burst, not a new choice)

/** The line shown when looking at the choices. Never interprets them. */
export function namedLine(feelings, strength) {
  // "không biết gọi tên" is read the same as choosing nothing: a gentle line, never "you don't know".
  const named = feelings.filter(f => f !== 'không biết gọi tên');
  if (!named.length) return strength ? `Chưa gọi được tên, cỡ ${strength}. Vậy cũng được.` : 'Chưa gọi được tên cũng được.';
  const words = named.map(f => (f === 'khác' ? 'một cảm giác khác' : f)).join(' và ');
  return strength ? `Lúc này: ${words}, ${strength}.` : `Lúc này: ${words}.`;
}

const game = document.querySelector('[data-game="goi-ten"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), named = $('gt-named'), heading = $('game-title'), resultLine = $('gt-result-line');
  const feelButtons = [...game.querySelectorAll('[data-feel]')];
  const strengthButtons = [...game.querySelectorAll('[data-strength]')];
  let settledAt = 0;
  const settle = () => { settledAt = performance.now() + SETTLE_MS; };

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }
  const setState = state => { game.dataset.state = state; };
  const setPhase = phase => { game.dataset.phase = phase; };
  const pressed = list => list.filter(b => b.getAttribute('aria-pressed') === 'true');
  const feelings = () => pressed(feelButtons).map(b => b.textContent.trim());
  const strength = () => pressed(strengthButtons).map(b => b.textContent.trim())[0] || '';

  // Forget every choice.
  function wipe() {
    for (const b of [...feelButtons, ...strengthButtons]) b.setAttribute('aria-pressed', 'false');
    named.textContent = '';
    setPhase('choose');
  }

  function toggleFeeling(button) {
    const on = button.getAttribute('aria-pressed') === 'true';
    if (on) { button.setAttribute('aria-pressed', 'false'); say(`Đã bỏ chọn. ${countLine()}`); return; }
    // "không biết gọi tên" stands alone: choosing it clears the words, choosing a word clears it.
    if (button.hasAttribute('data-unknown')) {
      for (const b of feelButtons) b.setAttribute('aria-pressed', 'false');
    } else {
      const unknown = feelButtons.find(b => b.hasAttribute('data-unknown'));
      unknown.setAttribute('aria-pressed', 'false');
      if (pressed(feelButtons).length >= MAX_FEELINGS) { say('Đã có hai chữ rồi. Bỏ một chữ nếu muốn đổi.'); return; }
    }
    button.setAttribute('aria-pressed', 'true');
    say(`Đã chọn. ${countLine()}`);
  }
  function countLine() {
    const n = pressed(feelButtons).length;
    return n ? `${n} / ${MAX_FEELINGS} chữ.` : 'Chưa chọn chữ nào.';
  }

  function toggleStrength(button) {
    const on = button.getAttribute('aria-pressed') === 'true';
    for (const b of strengthButtons) b.setAttribute('aria-pressed', 'false');
    if (!on) button.setAttribute('aria-pressed', 'true');
    say(on ? 'Đã bỏ độ mạnh.' : 'Đã chọn độ mạnh.');
  }

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      wipe();
      setState('running');
      settle();
      say('Bắt đầu. Chọn một hoặc hai chữ gần nhất với điều bạn đang thấy, hoặc “không biết gọi tên”.');
      feelButtons[0].focus();
    },
    look: () => {
      if (game.dataset.state !== 'running' || game.dataset.phase !== 'choose') return;
      named.textContent = namedLine(feelings(), strength());
      setPhase('view');
      settle();
      say(''); // focus reads the line; announcing it too would say the words twice
      named.focus();
    },
    edit: () => {
      if (game.dataset.state !== 'running' || game.dataset.phase !== 'view') return;
      setPhase('choose');
      settle();
      say('Sửa lại lựa chọn. Chạm một chữ để chọn hoặc bỏ chọn.');
      (pressed(feelButtons)[0] || feelButtons[0]).focus();
    },
    done: () => {
      if (game.dataset.state !== 'running' || game.dataset.phase !== 'view') return;
      wipe();
      setState('complete');
      settle();
      say('Đã xong, lựa chọn đã xóa.');
      resultLine.focus(); // not "chơi lại": a stray tap or Enter must not restart
    },
    stop: () => {
      if (game.dataset.state !== 'running') return;
      wipe();
      setState('stopped');
      settle();
      say('Đã dừng, lựa chọn đã xóa.');
      game.querySelector('[data-act="again"]').focus();
    },
    again: () => { wipe(); setState('idle'); say(''); heading.focus(); },
  };

  game.addEventListener('click', event => {
    const target = event.target.closest('[data-act], [data-feel], [data-strength], a[href]');
    if (!target) return;
    if (performance.now() < settledAt) { event.preventDefault(); return; }
    if (target.dataset.act && act[target.dataset.act]) { act[target.dataset.act](); return; }
    if (game.dataset.state !== 'running' || game.dataset.phase !== 'choose') return;
    if (target.hasAttribute('data-feel')) toggleFeeling(target);
    else if (target.hasAttribute('data-strength')) toggleStrength(target);
  });
  // A held Enter/Space repeats clicks on the focused word; only a fresh press counts.
  game.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });

  // Leaving or coming back from the back/forward cache forgets everything; nothing resumes on its own.
  addEventListener('pagehide', () => { wipe(); setState('idle'); say(''); });
  addEventListener('pageshow', event => { if (event.persisted) { wipe(); setState('idle'); say(''); heading.focus(); } });

  try {
    wipe();
    setState('idle');
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  } catch {
    setState('error');
  }
}
