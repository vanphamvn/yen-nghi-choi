// Yên Lab · shared game engine (LAB-F07, #131). Plain ES module, no dependencies, no storage, no network.
//
// States: idle → running ⇄ paused → complete | stopped;  any → error;  reset() → idle from anywhere.
// Time is derived from a monotonic clock (performance.now), never by counting ticks, so frame rate, throttled
// timers and reduced motion do not change the pacing. Only ONE timeout is ever pending (to the next step boundary).
// The engine never resumes by itself: hiding the page pauses it, and the person chooses to continue.

export const STATES = Object.freeze(['idle', 'running', 'paused', 'complete', 'stopped', 'error']);

const defaults = {
  now: () => performance.now(),
  schedule: (fn, ms) => setTimeout(fn, ms),
  cancel: id => clearTimeout(id),
  // Taps closer than this to the previous transition are ignored (double-tap on "bắt đầu" must not hit the
  // "tạm dừng" word that appears under the finger). stop() is never debounced.
  guardMs: 350,
  // If a timeout fires this much later than planned (device slept, screen locked without visibilitychange),
  // treat the gap as time away: rewind to the planned moment and pause instead of skipping ahead.
  maxLateMs: 2000,
};

/**
 * @param {{ steps: {id: string, ms: number}[], rounds?: number, onChange?: (snapshot) => void } & Partial<typeof defaults>} options
 */
export function createSession(options) {
  const o = { ...defaults, ...options };
  const steps = validateSteps(o.steps);
  const roundMs = steps.reduce((sum, s) => sum + s.ms, 0);
  let rounds = validateRounds(o.rounds ?? 1);

  let state = 'idle';
  let reason = 'init';
  let elapsedBefore = 0;   // ms accumulated before the current running stretch
  let runningSince = 0;    // clock value when the current running stretch began
  let timer = null;        // the single pending timeout
  let plannedAt = 0;       // clock value that timer is aiming for
  
  let lastTransitionAt = -Infinity;
  let error = null;

  const total = () => rounds * roundMs;
  const elapsed = () => Math.min(total(), elapsedBefore + (state === 'running' ? o.now() - runningSince : 0));

  function position(ms = elapsed()) {
    const done = ms >= total();
    const inRound = done ? roundMs : ms % roundMs;
    const round = done ? rounds : Math.floor(ms / roundMs) + 1;
    let stepIndex = 0, acc = 0;
    while (stepIndex < steps.length - 1 && inRound >= acc + steps[stepIndex].ms) { acc += steps[stepIndex].ms; stepIndex++; }
    return { round, stepIndex, stepElapsed: Math.min(steps[stepIndex].ms, inRound - acc), boundary: acc + steps[stepIndex].ms - inRound };
  }

  function snapshot() {
    const ms = elapsed();
    const p = position(ms);
    return Object.freeze({
      state, reason, rounds, round: p.round, stepIndex: p.stepIndex, step: steps[p.stepIndex].id,
      stepMs: steps[p.stepIndex].ms, stepElapsed: p.stepElapsed, elapsed: ms, total: total(),
      error: error ? String(error.message || error) : null,
    });
  }

  function emit() {
    if (typeof o.onChange !== 'function') return;
    try { o.onChange(snapshot()); } catch (e) { if (state !== 'error') fail(e); }
  }

  function clearTimer() { if (timer !== null) { o.cancel(timer); timer = null; } }

  function arm() {
    clearTimer();
    if (state !== 'running') return;
    const ms = elapsed();
    if (ms >= total()) { finish(); return; }
    const wait = Math.max(0, Math.min(position(ms).boundary, total() - ms));
    plannedAt = o.now() + wait;
    timer = o.schedule(tick, wait);
  }

  function tick() {
    timer = null;
    if (state !== 'running') return;
    const late = o.now() - plannedAt;
    if (late > o.maxLateMs) {
      // Time away, not time practised: keep progress only up to the planned boundary, then wait for the person.
      // (transition() adds now − runningSince, so shift runningSince to count only up to plannedAt.)
      runningSince = o.now() - (plannedAt - runningSince);
      transition('paused', 'suspended');
      return;
    }
    if (elapsed() >= total()) { finish(); return; }
    // The timeout only ever fires at a step boundary, so every tick is a new step (or a new round).
    reason = 'step';
    emit();
    arm();
  }

  function finish() {
    clearTimer();
    elapsedBefore = total();
    transition('complete', 'finished');
  }

  function transition(next, why) {
    if (state === 'running') elapsedBefore = Math.min(total(), elapsedBefore + (o.now() - runningSince));
    state = next;
    reason = why;
    lastTransitionAt = o.now();
    if (next === 'running') runningSince = o.now();
    clearTimer();

    emit();
    if (state === 'running') arm();
  }

  const guarded = () => o.now() - lastTransitionAt < o.guardMs;

  function fail(e) {
    clearTimer();
    error = e instanceof Error ? e : new Error(String(e));
    state = 'error';
    reason = 'error';
    lastTransitionAt = o.now();
    emit();
  }

  return Object.freeze({
    snapshot,
    get state() { return state; },
    /** idle → running. Ignored in any other state (no double start). */
    start() { if (state !== 'idle' || guarded()) return false; elapsedBefore = 0; error = null; transition('running', 'start'); return true; },
    /** running → paused. */
    pause(why = 'pause') { if (state !== 'running' || (why === 'pause' && guarded())) return false; transition('paused', why); return true; },
    /** paused → running. Only ever called by the person; nothing in the engine resumes on its own. */
    resume() { if (state !== 'paused' || guarded()) return false; transition('running', 'resume'); return true; },
    /** running | paused → stopped, immediately, never debounced and never confirmed. */
    stop() { if (state !== 'running' && state !== 'paused') return false; transition('stopped', 'stop'); return true; },
    /** anything → idle; forgets progress. */
    reset(why = 'reset') { clearTimer(); state = 'idle'; reason = why; elapsedBefore = 0; error = null; lastTransitionAt = o.now(); emit(); return true; },
    /** Choose how many rounds before starting (e.g. 3–6). Ignored once started. */
    setRounds(n) { if (state !== 'idle') return false; rounds = validateRounds(n); emit(); return true; },
    fail,
    /** Stop all timers and listeners for good (page teardown). */
    destroy() { clearTimer(); state = 'idle'; },
  });
}

/**
 * Browser lifecycle: pause when the page is hidden (tab switch, screen lock, app switch) and forget everything on
 * pagehide or a back/forward-cache restore. Never resumes. Returns a function that removes the listeners.
 */
export function bindPageLifecycle(session, { doc = document, win = window } = {}) {
  const onVisibility = () => { if (doc.visibilityState === 'hidden') session.pause('hidden'); };
  const onFreeze = () => session.pause('hidden');
  const onPageHide = () => session.reset('pagehide');
  const onPageShow = event => { if (event.persisted) session.reset('restored'); };
  doc.addEventListener('visibilitychange', onVisibility);
  doc.addEventListener('freeze', onFreeze);
  win.addEventListener('pagehide', onPageHide);
  win.addEventListener('pageshow', onPageShow);
  return () => {
    doc.removeEventListener('visibilitychange', onVisibility);
    doc.removeEventListener('freeze', onFreeze);
    win.removeEventListener('pagehide', onPageHide);
    win.removeEventListener('pageshow', onPageShow);
  };
}

function validateSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) throw new TypeError('steps must be a non-empty array');
  return steps.map(({ id, ms }) => {
    if (typeof id !== 'string' || !id) throw new TypeError('step id must be a string');
    if (!Number.isFinite(ms) || ms < 100) throw new RangeError(`step ${id} must last at least 100 ms`);
    return Object.freeze({ id, ms });
  });
}

function validateRounds(n) {
  if (!Number.isInteger(n) || n < 1 || n > 60) throw new RangeError('rounds must be an integer from 1 to 60');
  return n;
}
