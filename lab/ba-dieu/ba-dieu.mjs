// Ba điều nhỏ xíu (G14, #155). Write up to three small things from today, or pick a suggestion, or none at all.
// Nothing is required and nothing is kept: the words live only in this page's memory and the inputs, are never put
// in a URL, storage, request or share card, and are wiped on stop, reset, leaving the page and back/forward restore.
// No timer, so no pause: idle → running (writing) → complete (reading the notes) | stopped → reset → idle.

export const MAX_LEN = 60;
export const IDEAS = ['ly trà ấm', 'một câu chào', 'được ngồi yên', 'trời hôm nay', 'bữa ăn ngon', 'một bài hát'];

/** Trimmed, non-empty entries in slip order. Exported for tests. */
export const keptFrom = values => values.map(v => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN)).filter(Boolean);

const game = document.querySelector('[data-game="ba-dieu"]');
if (game) {
  const $ = id => document.getElementById(id);
  const inputs = [$('ba-1'), $('ba-2'), $('ba-3')];
  const whisper = $('game-whisper'), notes = $('ba-notes'), resultLine = $('ba-result-line'), after = $('ba-after');
  const heading = $('game-title');

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }

  // Forget everything the person wrote: inputs, rendered notes, and the announcement line.
  function wipe() {
    inputs.forEach(input => { input.value = ''; });
    notes.replaceChildren();
    whisper.textContent = '';
  }

  function focusLead() {
    const next = [...game.querySelectorAll('#game-controls .ink-word')].find(el => el.offsetParent !== null);
    if (next) next.focus();
  }

  function setState(state) { game.dataset.state = state; }

  function finish(kept) {
    notes.replaceChildren(...kept.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    resultLine.textContent = kept.length ? (kept.length === 1 ? 'Đây là điều nhỏ của bạn.' : 'Đây là những điều nhỏ của bạn.') : 'Hôm nay chưa có điều gì cũng được.';
    after.textContent = kept.length
      ? 'Không cần làm gì thêm với chúng. Bấm “xóa và làm lại” hoặc rời đi là chúng biến mất.'
      : 'Không cần nghĩ thêm. Ngồi chơi một chút rồi đi cũng được.';
    inputs.forEach(input => { input.value = ''; }); // the notes are now the only copy, until reset or leaving
    setState('complete');
    say(kept.length ? `Đã xong, ${kept.length} điều nhỏ.` : 'Đã xong.');
    focusLead();
  }

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      setState('running');
      say('Bắt đầu. Viết vài chữ vào mẩu giấy, hoặc chọn một gợi ý.');
      inputs[0].focus({ preventScroll: true });
      inputs[0].scrollIntoView({ block: 'center' });
    },
    done: () => { if (game.dataset.state === 'running') finish(keptFrom(inputs.map(i => i.value))); },
    none: () => { if (game.dataset.state === 'running') finish([]); },
    stop: () => { if (game.dataset.state !== 'running') return; wipe(); setState('stopped'); say('Đã dừng, chữ đã xóa.'); focusLead(); },
    again: () => { wipe(); setState('idle'); say('Đã xóa.'); heading.focus(); },
  };

  game.addEventListener('click', event => {
    const word = event.target.closest('[data-act]');
    if (word && act[word.dataset.act]) { act[word.dataset.act](); return; }
    const idea = event.target.closest('[data-idea]');
    if (idea && game.dataset.state === 'running') {
      // A suggestion fills the next empty slip; it does not move focus (so the phone keyboard stays closed).
      const slot = inputs.findIndex(input => !input.value.trim());
      if (slot === -1) { say('Ba mẩu giấy đã có chữ rồi. Sửa một mẩu nếu muốn.'); return; }
      inputs[slot].value = idea.textContent.trim();
      say(`Đã ghi “${inputs[slot].value}” vào mẩu giấy ${slot + 1}.`);
    }
  });

  // Enter moves to the next slip, and on the last one finishes (there is no <form>, so nothing is ever submitted).
  inputs.forEach((input, i) => input.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return; // Vietnamese IME composition uses Enter too
    event.preventDefault();
    if (i < inputs.length - 1) inputs[i + 1].focus(); else act.done();
  }));

  // Phone keyboards cover the lower half: keep the slip being typed in (and "xong" under it) in view.
  inputs.forEach(input => input.addEventListener('focus', () => {
    setTimeout(() => { if (document.activeElement === input) input.scrollIntoView({ block: 'center' }); }, 250);
  }));

  // Leaving or coming back from the back/forward cache forgets everything; nothing resumes on its own.
  addEventListener('pagehide', () => { wipe(); setState('idle'); });
  addEventListener('pageshow', event => { if (event.persisted) { wipe(); setState('idle'); } });

  wipe(); // some browsers restore input values on reload; this page never shows old words
  setState('idle');
  game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
}
