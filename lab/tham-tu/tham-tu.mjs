// Thám tử hiện tại (G05, #146). The 5-4-3-2-1 noticing game: 5 things you see, 4 you can feel, 3 sounds, 2 smells,
// 1 taste. The clues are in the real room, not on the screen: the page only counts taps, so nothing personal is typed
// or kept. Every step can be skipped; smell and taste say outright that "none" is fine (SAFETY.md "Grounding").
// No timer, so no pause: idle → running (steps 1–5) → complete | stopped → "chơi lại" → idle.

export const STEPS = [
  { sense: 'see', goal: 5, cue: 'Tìm 5 thứ bạn nhìn thấy', sub: 'Nhìn quanh thôi, không cần đứng dậy.', found: 'thấy một thứ', skip: 'bỏ qua bước này', noun: 'thứ bạn thấy' },
  { sense: 'feel', goal: 4, cue: 'Để ý 4 thứ bạn đang cảm nhận', sub: 'Như chân chạm sàn, tay trên bàn, hơi mát của quạt.', found: 'cảm nhận một thứ', skip: 'bỏ qua bước này', noun: 'thứ bạn cảm nhận' },
  { sense: 'hear', goal: 3, cue: 'Nghe 3 tiếng quanh bạn', sub: 'Tiếng xa, tiếng gần, tiếng rất nhỏ cũng được.', found: 'nghe một tiếng', skip: 'bỏ qua bước này', noun: 'tiếng bạn nghe' },
  { sense: 'smell', goal: 2, cue: 'Có 2 mùi nào không?', sub: 'Không ngửi thấy gì cũng được, đừng ngửi thứ lạ.', found: 'có một mùi', skip: 'không có mùi nào', noun: 'mùi' },
  { sense: 'taste', goal: 1, cue: 'Có 1 vị nào trong miệng không?', sub: 'Ngụm nước hay trà đang uống, hoặc chẳng có vị gì cũng được. Đừng nếm thứ lạ.', found: 'có một vị', skip: 'không có vị nào', noun: 'vị' },
];

/** How many things were noticed in total, out of how many steps were played (not skipped right away). */
export function summary(counts) {
  const total = counts.reduce((sum, n) => sum + n, 0);
  return { total, possible: STEPS.reduce((sum, s) => sum + s.goal, 0) };
}

const game = document.querySelector('[data-game="tham-tu"]');
if (game) {
  const $ = id => document.getElementById(id);
  const cue = $('game-cue'), sub = $('tt-sub'), count = $('tt-count'), dots = $('game-dots');
  const found = $('tt-found'), skip = $('tt-skip'), whisper = $('game-whisper');
  const resultLine = $('tt-result-line'), after = $('tt-after'), heading = $('game-title');
  let step = 0;
  let counts = STEPS.map(() => 0);

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }
  function setState(state) { game.dataset.state = state; }

  function render() {
    const s = STEPS[step];
    game.dataset.step = String(step + 1);
    game.dataset.sense = s.sense;
    cue.textContent = s.cue;
    sub.textContent = s.sub;
    found.textContent = s.found;
    skip.textContent = s.skip;
    count.textContent = `${counts[step]} / ${s.goal}`;
    dots.replaceChildren(...Array.from({ length: s.goal }, (_, i) => {
      const dot = document.createElement('i');
      if (i < counts[step]) dot.className = 'is-done';
      return dot;
    }));
  }

  function reset() {
    step = 0;
    counts = STEPS.map(() => 0);
    delete game.dataset.sense;
    game.dataset.step = '0';
  }

  function finish() {
    const { total } = summary(counts);
    resultLine.textContent = total ? 'Xong vụ án.' : 'Hôm nay không tìm manh mối nào cũng được.';
    after.textContent = total
      ? `Bạn đã để ý ${total} thứ quanh mình. Không cần làm gì thêm, ngồi chơi một chút rồi đi cũng được.`
      : 'Ngồi đây một chút là đủ rồi.';
    setState('complete');
    say(total ? `Đã xong, để ý được ${total} thứ.` : 'Đã xong.');
    resultLine.focus(); // not "chơi lại": a repeated tap or Enter must not restart the game
  }

  // Next step, or the end. Focus stays on the lead word so a guest using a keyboard or screen reader keeps their place.
  function advance(skipped) {
    const done = STEPS[step];
    if (step === STEPS.length - 1) { finish(); return; }
    step += 1;
    render();
    const next = STEPS[step];
    say(`${skipped ? 'Bỏ qua.' : `Đủ ${done.goal} ${done.noun}.`} Bước ${step + 1} / ${STEPS.length}: ${next.cue}.`);
    found.focus();
  }

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      reset();
      setState('running');
      render();
      say(`Bước 1 / ${STEPS.length}: ${STEPS[0].cue}. Mỗi lần để ý được một thứ thì chạm “${STEPS[0].found}”.`);
      found.focus();
    },
    found: () => {
      if (game.dataset.state !== 'running') return;
      const s = STEPS[step];
      counts[step] = Math.min(s.goal, counts[step] + 1);
      render();
      if (counts[step] >= s.goal) advance(false); else say(`${counts[step]} / ${s.goal}`);
    },
    skip: () => { if (game.dataset.state === 'running') advance(true); },
    stop: () => {
      if (game.dataset.state !== 'running') return;
      reset();
      setState('stopped');
      say('Đã dừng.');
      game.querySelector('[data-act="again"]').focus();
    },
    again: () => { reset(); setState('idle'); say(''); heading.focus(); },
  };

  game.addEventListener('click', event => {
    const word = event.target.closest('[data-act]');
    if (word && act[word.dataset.act]) act[word.dataset.act]();
  });

  // Coming back from the back/forward cache starts fresh; nothing resumes on its own.
  addEventListener('pageshow', event => { if (event.persisted) { reset(); setState('idle'); say(''); } });

  reset();
  setState('idle');
  game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
}
