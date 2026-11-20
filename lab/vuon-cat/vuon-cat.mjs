// Vườn cát không mục tiêu (G06, #147). Rake grooves in a small sand tray and set a few stones, then smooth it all if you
// like. No goal, no score, no timer (so no pause). The garden lives only in this page's memory as a list of actions:
// undo removes the last one, "làm phẳng" is itself an action (so it can be undone), and stop, reset, leaving and
// back/forward restore wipe it. Nothing is drawn by itself: every mark comes from a finger, the mouse or an ink word.
// idle → running → complete ("xong", the garden stays to look at) | stopped (wiped) → "chơi lại" → idle.

export const MAX_ACTIONS = 400;     // a long play session is a few dozen; the cap only bounds memory
export const MAX_POINTS = 1500;     // per stroke
export const MIN_STEP = 0.004;      // points closer than this (in tray widths) are skipped
const SETTLE_MS = 400;              // taps this soon after the words change under a finger are dropped
const TINES = [-1, 0, 1];           // a three-tine rake
const TINE_GAP = 0.026;             // tine spacing, in tray widths
const ASPECT = 4 / 3;               // tray width / height

// Items cut from the G06 sprite (games/g06-vuon-cat.webp, 295×81, the idle picture): [x, y, w, h] in sprite pixels, and their width on
// the tray as a fraction of the tray width.
export const ITEMS = {
  stones: { crop: [178, 4, 46, 35], width: 0.2, name: 'hai viên đá' },
  pebble: { crop: [191, 41, 27, 17], width: 0.11, name: 'viên sỏi' },
  shell: { crop: [227, 34, 39, 29], width: 0.15, name: 'vỏ sò' },
};

// Where the ink words put things, in turn: calm spots that do not crowd the middle.
export const SPOTS = [[0.32, 0.38], [0.7, 0.62], [0.5, 0.5], [0.24, 0.72], [0.76, 0.3], [0.5, 0.2], [0.5, 0.82]];

/** The actions still in effect: everything after the last "làm phẳng". */
export function visible(actions) {
  const last = actions.map(a => a.type).lastIndexOf('clear');
  return actions.slice(last + 1);
}

/** How many grooves and items are on the tray now, for the canvas description. */
export function describe(actions) {
  const v = visible(actions);
  const marks = v.filter(a => a.paths).length;
  const items = v.filter(a => a.type === 'item').length;
  if (!marks && !items) return 'Khay cát phẳng, chưa có gì.';
  const parts = [];
  if (marks) parts.push(`${marks} đường cào`);
  if (items) parts.push(`${items} thứ đặt lên`);
  return `Khay cát có ${parts.join(' và ')}.`;
}

/** Points of a ring (normalised tray coordinates; y scaled so circles stay round on a 4:3 tray). */
export function ringPoints(cx, cy, r, steps = 64) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * Math.PI * 2;
    return [cx + Math.cos(t) * r, cy + Math.sin(t) * r * ASPECT];
  });
}
/** A gentle wave across the tray at height y. */
export function wavePoints(y, steps = 80) {
  return Array.from({ length: steps + 1 }, (_, i) => [0.04 + (i / steps) * 0.92, y + Math.sin((i / steps) * Math.PI * 4) * 0.035]);
}

const game = document.querySelector('[data-game="vuon-cat"]');
if (game) {
  const $ = id => document.getElementById(id);
  const whisper = $('game-whisper'), reflect = $('game-reflect'), heading = $('game-title'), resultLine = $('vc-result-line');
  const tray = $('vc-tray'), sand = $('vc-sand'), top = $('vc-items');
  const toolButtons = [...game.querySelectorAll('[data-tool]')];

  let actions = [];
  let tool = 'rake';
  let stroke = null;      // the groove being drawn: { type: 'stroke', points }
  let before = null;      // the sand as it was when this groove began, so lifting the finger repaints one groove, not all
  let pointerId = null;   // only one finger draws at a time
  let spotAt = 0;         // next spot for ink-word shapes
  let settledAt = 0;
  let ctx = null, itemCtx = null, grain = null;
  const cutouts = {};     // item key → keyed-out canvas
  let size = { w: 0, h: 0, dpr: 1 };

  const settle = () => { settledAt = performance.now() + SETTLE_MS; };
  function say(text) {
    whisper.textContent = text || '';
    whisper.classList.remove('is-new');
    void whisper.offsetWidth;
    if (text) whisper.classList.add('is-new');
  }
  const setState = state => {
    game.dataset.state = state;
    reflect.hidden = !(state === 'complete' || state === 'stopped');
    tray.setAttribute('aria-label', describe(actions));
  };

  // ── drawing ──
  function sizeCanvases() {
    const box = tray.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1); // ≤ 2: crisp enough, light on small phones
    const w = Math.max(1, Math.round(box.width)), h = Math.max(1, Math.round(box.height));
    if (w === size.w && h === size.h && dpr === size.dpr) return false;
    size = { w, h, dpr };
    for (const c of [sand, top]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    itemCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  // A fixed grain texture (seeded, so the sand looks the same every time).
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 96;
    const g = c.getContext('2d');
    g.fillStyle = '#d8bb96'; g.fillRect(0, 0, 96, 96);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = rnd() < 0.5 ? 'rgba(255,246,228,.35)' : 'rgba(150,112,72,.22)';
      g.fillRect(rnd() * 96, rnd() * 96, 1, 1);
    }
    return ctx.createPattern(c, 'repeat');
  }

  // Offset a polyline sideways (for each rake tine) using each point's local normal.
  function offset(points, d) {
    return points.map((p, i) => {
      const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
      const dx = (b[0] - a[0]) * size.w, dy = (b[1] - a[1]) * size.h;
      const len = Math.hypot(dx, dy) || 1;
      return [p[0] * size.w - (dy / len) * d * size.w, p[1] * size.h + (dx / len) * d * size.w];
    });
  }
  function polyline(line, shift) {
    ctx.beginPath();
    line.forEach(([x, y], i) => (i ? ctx.lineTo(x + shift, y + shift) : ctx.moveTo(x + shift, y + shift)));
    ctx.stroke();
  }
  // A rake mark: a soft trough under three tines, each a shaded groove (dark lower edge, light upper edge).
  function drawGroove(points, { trough = true } = {}) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (points.length < 2) {
      const [x, y] = points[0];
      ctx.fillStyle = 'rgba(115,80,45,.5)';
      for (const t of TINES) { ctx.beginPath(); ctx.arc(x * size.w + t * TINE_GAP * size.w, y * size.h, Math.max(1.6, size.w * 0.006), 0, Math.PI * 2); ctx.fill(); }
      return;
    }
    const lw = Math.max(2, size.w * 0.0095);
    if (trough) {
      ctx.strokeStyle = 'rgba(150,108,66,.13)'; ctx.lineWidth = TINE_GAP * size.w * 2.9;
      polyline(points.map(([x, y]) => [x * size.w, y * size.h]), 0);
    }
    for (const t of TINES) {
      const line = offset(points, t * TINE_GAP);
      ctx.strokeStyle = 'rgba(112,78,44,.5)'; ctx.lineWidth = lw; polyline(line, 0.9);
      ctx.strokeStyle = 'rgba(255,248,234,.72)'; ctx.lineWidth = lw * 0.55; polyline(line, -0.9);
    }
  }
  function drawSand() {
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.fillStyle = grain; ctx.fillRect(0, 0, size.w, size.h);
    for (const a of visible(actions)) if (a.paths) for (const path of a.paths) drawGroove(path);
    if (stroke) drawGroove(stroke.points);
  }
  function drawItems() {
    itemCtx.clearRect(0, 0, size.w, size.h);
    for (const a of visible(actions)) {
      if (a.type !== 'item' || !cutouts[a.item]) continue;
      const c = cutouts[a.item], w = ITEMS[a.item].width * size.w, h = w * (c.height / c.width);
      itemCtx.save();
      itemCtx.shadowColor = 'rgba(80,55,30,.35)'; itemCtx.shadowBlur = 6; itemCtx.shadowOffsetY = 3;
      itemCtx.drawImage(c, a.x * size.w - w / 2, a.y * size.h - h / 2, w, h);
      itemCtx.restore();
    }
  }
  const redraw = () => { drawSand(); drawItems(); tray.setAttribute('aria-label', describe(actions)); };
  function snapshot() {
    const c = document.createElement('canvas'); c.width = sand.width; c.height = sand.height;
    c.getContext('2d').drawImage(sand, 0, 0);
    return c;
  }
  function restore(c) {
    if (c.width !== sand.width || c.height !== sand.height) { drawSand(); return; } // resized mid-groove
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'copy'; ctx.drawImage(c, 0, 0); ctx.restore();
  }

  // Cut each item out of the sprite, keying out its paper background, once. The sprite is the idle picture already on
  // the page, so no new request is made.
  function loadItems() {
    const img = game.querySelector('.vc-stage img');
    const cut = () => {
      for (const [key, { crop: [x, y, w, h] }] of Object.entries(ITEMS)) {
        const c = document.createElement('canvas'); c.width = w * 3; c.height = h * 3;
        const g = c.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
        const data = g.getImageData(0, 0, c.width, c.height), d = data.data;
        for (let i = 0; i < d.length; i += 4) {
          const dist = Math.abs(d[i] - 250) + Math.abs(d[i + 1] - 238) + Math.abs(d[i + 2] - 221);
          d[i + 3] = dist < 32 ? 0 : dist < 58 ? Math.round((255 * (dist - 32)) / 26) : 255;
        }
        g.putImageData(data, 0, 0);
        cutouts[key] = c;
      }
      for (const b of game.querySelectorAll('.vc-needs-items')) b.hidden = false; // offer items only once they can be drawn
      drawItems();
    };
    img.decode().then(cut, () => {}); // if the picture fails, items simply are not drawn; marks and words still work
  }

  // ── actions ──
  function push(action) {
    actions.push(action);
    if (actions.length > MAX_ACTIONS) actions = actions.slice(-MAX_ACTIONS);
  }
  function nextSpot() { const s = SPOTS[spotAt % SPOTS.length]; spotAt++; return s; }
  const placeItem = (item, x, y) => { push({ type: 'item', item, x, y }); drawItems(); tray.setAttribute('aria-label', describe(actions)); };

  // ── pointer: a finger or the mouse rakes, or sets the chosen item ──
  const at = event => {
    const box = sand.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)), Math.min(1, Math.max(0, (event.clientY - box.top) / box.height))];
  };
  function endStroke() {
    if (!stroke) return;
    const done = stroke.points;
    push({ type: 'stroke', paths: [done] });
    stroke = null;
    pointerId = null;
    // Put back the sand from before this groove, then draw the whole groove once with its trough: the same pixels a
    // full redraw would give, at the cost of one groove however long the session.
    if (before) { restore(before); before = null; drawGroove(done); } else drawSand();
    tray.setAttribute('aria-label', describe(actions));
  }
  top.addEventListener('pointerdown', event => {
    if (game.dataset.state !== 'running' || pointerId !== null || event.button > 0) return;
    event.preventDefault();
    if (performance.now() < settledAt) return; // the tray appears where "bắt đầu" was: a double tap must not leave a mark
    const [x, y] = at(event);
    if (tool !== 'rake') { placeItem(tool, x, y); return; }
    pointerId = event.pointerId;
    try { top.setPointerCapture(pointerId); } catch {}
    before = snapshot();
    stroke = { type: 'stroke', points: [[x, y]] };
  });
  top.addEventListener('pointermove', event => {
    if (!stroke || event.pointerId !== pointerId) return;
    const list = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    for (const e of list.length ? list : [event]) {
      const p = at(e), last = stroke.points[stroke.points.length - 1];
      if (Math.hypot(p[0] - last[0], (p[1] - last[1]) / ASPECT) < MIN_STEP || stroke.points.length >= MAX_POINTS) continue;
      stroke.points.push(p);
      drawGroove([last, p], { trough: false }); // the trough is drawn whole when the groove ends
    }
  });
  // Lifting, cancelling (a scroll gesture, a call) or losing capture all just end the groove where it is.
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) top.addEventListener(type, event => { if (event.pointerId === pointerId) endStroke(); });

  function pickTool(button, { quiet = false } = {}) {
    tool = button.dataset.tool;
    for (const b of toolButtons) b.setAttribute('aria-pressed', String(b === button));
    if (!quiet) say(tool === 'rake' ? 'Kéo ngón tay hoặc chuột trên cát để cào.' : `Chạm lên cát để đặt ${ITEMS[tool].name}.`);
  }

  function wipe() {
    actions = []; stroke = null; before = null; pointerId = null; spotAt = 0;
    if (ctx) redraw();
  }

  const act = {
    start: () => {
      if (game.dataset.state !== 'idle') return;
      wipe();
      pickTool(toolButtons[0], { quiet: true }); // every play starts with the rake
      setState('running');
      sizeCanvases(); redraw();
      settle();
      say('Bắt đầu. Kéo trên cát để cào, hoặc chọn đá rồi chạm để đặt.');
      toolButtons.find(b => b.getAttribute('aria-pressed') === 'true')?.focus();
    },
    ring: () => { const [x, y] = nextSpot(); push({ type: 'ring', paths: [0.05, 0.09, 0.13].map(r => ringPoints(x, y, r)) }); redraw(); say('Đã thêm một vòng.'); },
    wave: () => { const [, y] = nextSpot(); push({ type: 'wave', paths: [wavePoints(y)] }); redraw(); say('Đã thêm một đường sóng.'); },
    stone: () => { const [x, y] = nextSpot(); const item = tool === 'rake' ? 'stones' : tool; placeItem(item, x, y); say(`Đã đặt ${ITEMS[item].name}.`); },
    undo: () => {
      // One action each: a groove, a ring (three circles), a wave, an item, or a "làm phẳng".
      if (!actions.length) { say('Chưa có gì để hoàn tác.'); return; }
      actions.pop();
      redraw(); say('Đã hoàn tác.');
    },
    smooth: () => {
      if (!visible(actions).length) { say('Cát đang phẳng rồi.'); return; }
      push({ type: 'clear' }); redraw(); say('Đã làm phẳng cát. Hoàn tác nếu muốn lấy lại.');
    },
    done: () => {
      if (game.dataset.state !== 'running') return;
      endStroke();
      setState('complete'); settle();
      say('Xong rồi.');
      resultLine.focus(); // a stray Enter must not restart
    },
    stop: () => {
      if (game.dataset.state !== 'running') return;
      wipe();
      setState('stopped'); settle();
      say('Đã dừng, cát đã làm phẳng.');
      game.querySelector('[data-act="again"]').focus();
    },
    again: () => { wipe(); setState('idle'); say(''); heading.focus(); },
  };

  game.addEventListener('click', event => {
    const target = event.target.closest('[data-act], [data-tool], a[href], [data-reflect]');
    if (!target) return;
    if (performance.now() < settledAt) { event.preventDefault(); return; }
    if (target.hasAttribute('data-reflect')) {
      reflect.hidden = true; // the answer is not kept anywhere
      settle();
      say(target.textContent.trim() === 'khó chịu hơn' ? 'Cảm ơn bạn đã nói. Cứ nghỉ một chút nhé; không cần làm gì thêm.' : 'Cảm ơn bạn đã tự để ý một chút.');
      game.querySelector('[data-act="again"]').focus();
      return;
    }
    if (target.dataset.act && act[target.dataset.act]) { act[target.dataset.act](); return; }
    if (target.dataset.tool && game.dataset.state === 'running') pickTool(target);
  });
  game.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });

  // The tray follows the page width; redraw from the action list so grooves stay crisp.
  new ResizeObserver(() => { if (ctx && sizeCanvases()) redraw(); }).observe(tray);

  // Leaving or coming back from the back/forward cache flattens the sand; nothing resumes on its own.
  addEventListener('pagehide', () => { wipe(); setState('idle'); say(''); });
  addEventListener('pageshow', event => { if (event.persisted) { wipe(); setState('idle'); say(''); heading.focus(); } });

  try {
    ctx = sand.getContext('2d');
    itemCtx = top.getContext('2d');
    if (!ctx || !itemCtx) throw new Error('no canvas');
    grain = makeGrain();
    sizeCanvases(); redraw();
    loadItems();
    setState('idle');
    game.querySelector('[data-act="start"]').disabled = false; // never a dead word before this module runs
  } catch {
    setState('error');
  }
  game.removeAttribute("data-loading"); // the module runs: no "đang mở ra" note from here on (LAB-F14)
}
