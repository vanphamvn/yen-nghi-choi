// LAB-F07 (#131): unit tests for lab/engine.mjs with a manual clock and manual timers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, bindPageLifecycle, STATES } from '../lab/engine.mjs';

function rig(extra = {}) {
  let t = 1000;
  const timers = new Map();
  let id = 0;
  const changes = [];
  const session = createSession({
    steps: [{ id: 'a', ms: 4000 }, { id: 'b', ms: 6000 }], rounds: 3,
    now: () => t,
    schedule: (fn, ms) => { timers.set(++id, { fn, at: t + ms }); return id; },
    cancel: k => timers.delete(k),
    onChange: s => changes.push(s),
    ...extra,
  });
  // Advance the clock, firing due timers in order (late = extra delay before a timer actually runs).
  const advance = (ms, late = 0) => {
    const end = t + ms;
    for (;;) {
      const due = [...timers].filter(([, v]) => v.at + late <= end).sort((x, y) => x[1].at - y[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      t = Math.max(t, due[1].at + late);
      due[1].fn();
    }
    t = end;
  };
  return { session, changes, advance, timers, last: () => changes.at(-1), clock: { set: v => { t = v; }, get: () => t } };
}

test('happy path: idle → running → steps/rounds → complete, one timer at a time', () => {
  const { session, advance, timers, last } = rig();
  assert.equal(session.state, 'idle');
  assert.equal(session.start(), true);
  assert.equal(last().state, 'running');
  assert.equal(last().step, 'a');
  assert.equal(last().round, 1);
  assert.equal(timers.size, 1);
  advance(4000);
  assert.equal(last().step, 'b');
  assert.equal(timers.size, 1, 'never more than one pending timeout');
  advance(6000);
  assert.deepEqual([last().round, last().step], [2, 'a']);
  advance(20000);
  assert.equal(last().state, 'complete');
  assert.equal(last().elapsed, last().total);
  assert.equal(timers.size, 0, 'no timer left after completion');
});

test('double start and multi-tap are ignored; stop is never debounced', () => {
  const { session, advance, timers } = rig();
  assert.equal(session.start(), true);
  assert.equal(session.start(), false, 'second start ignored');
  assert.equal(session.pause(), false, 'tap within guard window ignored (finger still on the start word)');
  assert.equal(timers.size, 1);
  advance(400);
  assert.equal(session.pause(), true);
  assert.equal(session.resume(), false, 'resume right after pause ignored');
  assert.equal(session.stop(), true, 'stop works immediately in paused');
  assert.equal(session.state, 'stopped');
  assert.equal(timers.size, 0);
  assert.equal(session.stop(), false);
});

test('stop works from running and paused at any moment, including inside the guard window', () => {
  const { session, timers, advance } = rig();
  session.start();
  assert.equal(session.stop(), true);
  assert.equal(timers.size, 0);
  session.reset();
  assert.equal(session.start(), false, 'double tap on "làm lại" does not instantly restart');
  advance(400);
  assert.equal(session.start(), true);
  session.pause('hidden');
  assert.equal(session.stop(), true);
});

test('pause freezes progress; time while paused is not counted; nothing resumes by itself', () => {
  const { session, advance, timers, last } = rig();
  session.start();
  advance(3000);
  session.pause();
  const frozen = session.snapshot().elapsed;
  assert.equal(frozen, 3000);
  assert.equal(timers.size, 0, 'no timer while paused');
  advance(60_000);
  assert.equal(session.state, 'paused');
  assert.equal(session.snapshot().elapsed, frozen);
  session.resume();
  assert.equal(last().step, 'a');
  advance(1000);
  assert.equal(last().step, 'b', 'boundary reached after the remaining 1000 ms, not earlier');
});

test('frame-rate independent: late timers (throttled tab) skip to the true position without drift', () => {
  const { session, advance, last } = rig();
  session.start();
  advance(12_000, 1500); // every timer fires 1.5 s late, still under maxLateMs
  assert.equal(session.state, 'running');
  assert.equal(session.snapshot().elapsed, 12_000);
  assert.deepEqual([last().round, last().step], [2, 'a']);
  advance(18_000, 1500);
  assert.equal(session.state, 'running', 'the last boundary timer is still 1.5 s late');
  advance(1500, 1500);
  assert.equal(session.state, 'complete');
  assert.equal(session.snapshot().elapsed, 30_000);
});

test('device sleep (timer fires far too late) rewinds to the planned boundary and pauses', () => {
  const { session, advance, last } = rig();
  session.start();
  advance(1000);
  advance(60_000, 57_000); // the 4 s boundary timer only runs a minute later
  assert.equal(session.state, 'paused');
  assert.equal(last().reason, 'suspended');
  assert.equal(session.snapshot().elapsed, 4000, 'only the time up to the planned boundary counts');
});

test('reset from every state returns to a clean idle; rounds can be chosen only in idle', () => {
  for (const setup of [s => s, s => s.start(), s => (s.start(), s.pause('hidden')), s => (s.start(), s.stop()), s => s.fail(new Error('x'))]) {
    const { session, timers, advance } = rig();
    setup(session);
    advance(500);
    session.reset();
    assert.equal(session.state, 'idle');
    assert.equal(session.snapshot().elapsed, 0);
    assert.equal(timers.size, 0);
  }
  const { session } = rig();
  assert.equal(session.setRounds(5), true);
  assert.equal(session.snapshot().total, 50_000);
  session.start();
  assert.equal(session.setRounds(2), false);
  assert.throws(() => createSession({ steps: [{ id: 'a', ms: 1000 }], rounds: 0 }), RangeError);
  assert.throws(() => createSession({ steps: [] }), TypeError);
});

test('an exception in onChange moves the session to error with timers cleared', () => {
  let throwNow = false;
  const { session, timers, advance, changes } = rig({ onChange: s => { changes.push(s); if (throwNow) throw new Error('render broke'); } });
  session.start();
  throwNow = true;
  advance(4000);
  throwNow = false;
  assert.equal(session.state, 'error');
  assert.equal(timers.size, 0);
  assert.match(session.snapshot().error, /render broke/);
  assert.equal(session.start(), false, 'cannot start from error without reset');
});

test('page lifecycle: hidden pauses (bypassing the tap guard), never resumes; pagehide and bfcache restore reset', () => {
  const { session } = rig();
  const listeners = {};
  const target = () => ({ addEventListener: (n, f) => { listeners[n] = f; }, removeEventListener: n => { delete listeners[n]; } });
  const doc = Object.assign(target(), { visibilityState: 'visible' });
  const win = target();
  const unbind = bindPageLifecycle(session, { doc, win });
  session.start();
  doc.visibilityState = 'hidden';
  listeners.visibilitychange();
  assert.equal(session.state, 'paused', 'pauses even within the guard window');
  doc.visibilityState = 'visible';
  listeners.visibilitychange();
  assert.equal(session.state, 'paused', 'coming back does not resume');
  listeners.pagehide();
  assert.equal(session.state, 'idle');
  session.start();
  listeners.pageshow({ persisted: true });
  assert.equal(session.state, 'idle');
  unbind();
  assert.deepEqual(Object.keys(listeners), []);
});

test('review: a late timer on the final boundary completes instead of suspending', () => {
  const { session, advance, last } = rig({ steps: [{ id: 'a', ms: 1000 }], rounds: 1 });
  session.start();
  advance(6000, 5000);
  assert.equal(session.state, 'complete');
  assert.equal(last().reason, 'finished');
  assert.equal(session.snapshot().elapsed, 1000);
});

test('review: time away is not counted when a pause or stop arrives before the late timer', () => {
  for (const act of [s => s.pause('hidden'), s => s.stop(), s => s.fail(new Error('x'))]) {
    const { session, clock } = rig();
    session.start();
    clock.set(clock.get() + 60_000); // device slept; no timer has run yet
    assert.equal(session.snapshot().elapsed, 4000, 'running snapshot is capped at the planned boundary');
    act(session);
    assert.equal(session.snapshot().elapsed, 4000);
  }
});

test('review: a timer firing a hair early re-arms silently without a fake step', () => {
  const { session, timers, changes, clock } = rig();
  session.start();
  const before = changes.length;
  const [[k, v]] = [...timers];
  timers.delete(k);
  clock.set(v.at - 1); // fires 1 ms before the boundary
  v.fn();
  assert.equal(changes.length, before, 'no emit');
  assert.equal(timers.size, 1, 're-armed for the remaining 1 ms');
});

test('review: calling session methods from inside onChange leaves exactly one timer or none', () => {
  let session;
  const r = rig({ onChange: s => { if (s.reason === 'step') session.stop(); } });
  session = r.session;
  session.start();
  r.advance(4000);
  assert.equal(session.state, 'stopped');
  assert.equal(r.timers.size, 0);
});

test('review: destroy() is final and fail() keeps the running time', () => {
  const a = rig();
  a.session.start();
  a.advance(2500);
  a.session.fail(new Error('x'));
  assert.equal(a.session.snapshot().elapsed, 2500);
  const b = rig();
  b.session.start();
  b.session.destroy();
  b.advance(1000);
  assert.equal(b.session.start(), false);
  assert.equal(b.session.reset(), false);
  assert.equal(b.timers.size, 0);
});

test('lifecycle: freeze pauses too', () => {
  const { session } = rig();
  const listeners = {};
  const target = () => ({ addEventListener: (n, f) => { listeners[n] = f; }, removeEventListener: () => {} });
  bindPageLifecycle(session, { doc: Object.assign(target(), { visibilityState: 'visible' }), win: target() });
  session.start();
  listeners.freeze();
  assert.equal(session.state, 'paused');
});

test('STATES matches the CSS data-state contract', () => {
  assert.deepEqual(STATES, ['idle', 'running', 'paused', 'complete', 'stopped', 'error']);
});

test('G02: skipTo jumps to the start of a later round, keeps running, one timer', () => {
  const { session, advance, timers, last } = rig();
  session.start();
  advance(1500); // round 1, step a
  assert.equal(session.skipTo(2), true);
  assert.deepEqual([last().state, last().reason, last().round, last().step, last().stepElapsed], ['running', 'skip', 2, 'a', 0]);
  assert.equal(last().elapsed, 10000);
  assert.equal(timers.size, 1);
  advance(4000);
  assert.deepEqual([last().round, last().step], [2, 'b'], 'pacing continues from the new round start');
  assert.equal(session.skipTo(2), false, 'never backwards or to the current round');
  assert.equal(session.skipTo(1.5), false);
});

test('G02: skipTo while paused stays paused; past the last round completes', () => {
  const { session, advance, timers, last } = rig();
  session.start();
  advance(500);
  session.pause();
  advance(400);
  assert.equal(session.skipTo(3), true);
  assert.deepEqual([last().state, last().round], ['paused', 3]);
  assert.equal(timers.size, 0, 'no timer while paused');
  advance(60000);
  assert.equal(session.snapshot().elapsed, 20000, 'paused time is not counted after a skip');
  assert.equal(session.snapshot().round, 3);
  advance(400);
  assert.equal(session.skipTo(4), true);
  assert.equal(last().state, 'complete');
  assert.equal(last().elapsed, last().total);
  assert.equal(session.skipTo(5), false, 'nothing to skip once complete');
});

test('G02: skipTo is ignored in idle, double taps are guarded, stop still works right after', () => {
  const { session, advance, timers, last } = rig();
  assert.equal(session.skipTo(2), false, 'idle: nothing to skip');
  session.start();
  advance(400);
  assert.equal(session.skipTo(2), true);
  assert.equal(session.skipTo(3), false, 'second tap within the guard window ignored');
  assert.equal(session.stop(), true, 'stop is never debounced');
  assert.equal(last().state, 'stopped');
  assert.equal(timers.size, 0);
});

test('G02: skipping from the last round while running completes and clears the timer', () => {
  const { session, advance, timers, last } = rig();
  session.start();
  advance(21000); // round 3
  assert.equal(last().round, 3);
  assert.equal(session.skipTo(4), true);
  assert.equal(last().state, 'complete');
  assert.equal(timers.size, 0);
});

test('G02: skipTo after the device slept (late timer pending) counts only up to the planned boundary', () => {
  const { session, timers, last, clock } = rig();
  session.start();
  clock.set(clock.get() + 30_000); // asleep: the 4 s timer never fired, far past maxLateMs
  assert.equal(session.skipTo(2), true);
  assert.equal(last().elapsed, 10000, 'jumped to round 2 start; the time asleep did not push it further');
  assert.equal(last().state, 'running');
  assert.equal(timers.size, 1);
});
