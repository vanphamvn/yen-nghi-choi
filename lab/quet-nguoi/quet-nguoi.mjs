// Quét người tìm căng thẳng (G03, #144). A short, self-paced body scan: head → shoulders → hands → belly → feet. Each
// zone has a plain text cue (the picture only adds a soft spotlight); "tiếp" moves on, "bỏ qua vùng này" skips, "dừng
// hẳn" stops at any time. Nothing is rated, chosen or scored, so nothing about the body is ever inferred or kept.
// Optional spoken cues are OFF by default and offered only when the browser reports an on-device Vietnamese voice
// (`localService`; network voices are never used); they speak the same fixed cue text, only after the guest turns them
// on, and "tắt đọc to" silences them at any time without ending the scan.
// idle → running (zone 1…5) → complete | stopped → "làm lại" → idle. No timer, so no pause.

export const ZONES = [
  { id: 'head', name: 'Đầu và mặt', cue: 'Để ý trán, quanh mắt, hàm. Ấm, mát, căng, thả lỏng, hay chẳng thấy gì cũng được.' },
  { id: 'shoulders', name: 'Vai và cổ', cue: 'Để ý vai và cổ đang thế nào. Không cần sửa gì.' },
  { id: 'hands', name: 'Hai tay', cue: 'Để ý bàn tay, ngón tay: đang chạm vào gì, ấm hay mát.' },
  { id: 'belly', name: 'Bụng và ngực', cue: 'Để ý bụng và ngực, có thể thấy lên xuống theo hơi thở. Không cần thở khác đi.' },
  { id: 'feet', name: 'Hai chân', cue: 'Để ý bàn chân chạm sàn, sức nặng của hai chân.' },
];
const SETTLE_MS = 400;

/** A Vietnamese voice the browser reports as on-device (`localService`), or nothing. Network voices are never used. */
export function localVietnameseVoice(voices) {
  return (voices || []).find(v => v.localService === true && /^vi([-_]|$)/i.test(v.lang || '')) || null;
}

const game = document.querySelector('[data-game="quet-nguoi"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), heading = $('game-title'), resultLine = $('gq-result-line');
  const zoneName = $('gq-zone'), zoneCue = $('gq-cue'), where = $('gq-where');
  const voiceRow = $('gq-voice-row'), voiceButtons = [...game.querySelectorAll('[data-voice]')], muteWord = $('gq-mute');
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;

  let zone = 0, skipped = 0, voiceOn = false, voice = null, settledAt = 0;
  const settle = () => { settledAt = performance.now() + SETTLE_MS; };

  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }
  const setState = state => { game.dataset.state = state; reflect.hidden = !(state === 'complete' || state === 'stopped'); };

  // ── optional voice: only a local Vietnamese voice, only after the guest turns it on, cancelled on every change ──
  function hush() { if (synth) synth.cancel(); }
  function speak(text) {
    if (!voiceOn || !voice || !synth || game.dataset.state !== 'running') return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = 0.9;
    synth.speak(u);
  }
  function setVoiceOn(on) {
    voiceOn = on && !!voice;
    for (const b of voiceButtons) b.setAttribute('aria-pressed', String((b.dataset.voice === 'on') === voiceOn));
    muteWord.hidden = !voiceOn; // "tắt đọc to" is there exactly while the voice is on
    if (!voiceOn) hush();
  }
  function findVoice() {
    voice = synth ? localVietnameseVoice(synth.getVoices()) : null;
    voiceRow.hidden = !voice; // no on-device voice: the option is simply not there
    if (!voice) setVoiceOn(false);
  }

  function showZone() {
    const z = ZONES[zone];
    game.dataset.zone = z.id;
    zoneName.textContent = z.name;
    zoneCue.textContent = z.cue;
    where.textContent = `${zone + 1} / ${ZONES.length}`;
  }
  function goTo(next, how) {
    if (next >= ZONES.length) { finish(); return; }
    zone = next;
    showZone();
    settle();
    const z = ZONES[zone];
    // The text is the guide; the picture only adds a spotlight. With the voice on, the live region names the zone only,
    // so a screen reader does not read the cue a second time over the voice.
    say(voiceOn ? `${how ? `${how} ` : ''}${z.name}.` : `${how ? `${how} ` : ''}${z.name}. ${z.cue}`);
    speak(`${z.name}. ${z.cue}`);
  }
  function finish() {
    hush();
    setState('complete'); settle();
    say(skipped === ZONES.length ? 'Hôm nay bỏ qua hết cũng được.' : 'Xong một lượt.');
    resultLine.focus(); // a stray Enter must not restart
  }
  function reset() { hush(); zone = 0; skipped = 0; showZone(); delete game.dataset.zone; }

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      reset();
      setState('running');
      goTo(0, 'Bắt đầu.');
      game.querySelector('[data-act="next"]').focus();
    },
    next: () => { if (game.dataset.state === 'running') goTo(zone + 1, 'Tiếp.'); },
    skip: () => { if (game.dataset.state === 'running') { skipped++; goTo(zone + 1, 'Bỏ qua.'); } },
    mute: () => { setVoiceOn(false); say('Đã tắt đọc to.'); game.querySelector('[data-act="next"]').focus(); },
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
    const target = event.target.closest('[data-act], [data-voice], a[href], [data-reflect]');
    if (!target) return;
    if (performance.now() < settledAt) { event.preventDefault(); return; }
    if (target.hasAttribute('data-reflect')) {
      reflect.hidden = true; // the answer is not kept anywhere
      settle();
      say(target.textContent.trim() === 'khó chịu hơn' ? 'Cảm ơn bạn đã nói. Cứ nhìn ra xa, nghỉ một chút nhé; không cần làm lại.' : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
      return;
    }
    if (target.dataset.act && act[target.dataset.act]) { act[target.dataset.act](); return; }
    if (target.dataset.voice && game.dataset.state === 'idle') setVoiceOn(target.dataset.voice === 'on');
  });
  game.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });

  // Hiding the page silences the voice (nothing speaks in the background); leaving or a back/forward restore starts over.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') hush(); });
  addEventListener('pagehide', () => { reset(); setState('idle'); say(''); });
  addEventListener('pageshow', event => { if (event.persisted) { reset(); setState('idle'); say(''); heading.focus(); } });

  try {
    if (synth) { findVoice(); synth.addEventListener?.('voiceschanged', findVoice); } else voiceRow.hidden = true;
    reset();
    setState('idle');
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  } catch {
    setState('error');
  }
  game.removeAttribute("data-loading"); // the module runs: no "đang mở ra" note from here on (LAB-F14)
}
