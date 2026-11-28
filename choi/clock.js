'use strict';

window.createPlayClock = (display) => {
  let startTime = 0;
  let frame = null;

  const render = (elapsed) => {
    const ms = Math.max(0, Math.floor(elapsed));
    display.textContent = `${Math.floor(ms / 1000)}.${String(ms % 1000).padStart(3, '0')} s`;
  };

  const tick = (now) => {
    render(now - startTime);
    frame = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelAnimationFrame(frame);
    frame = null;
    render(0);
  };

  return {
    reset,
    start() {
      reset();
      startTime = performance.now();
      frame = requestAnimationFrame(tick);
    },
    stop() {
      if (frame === null) return;
      cancelAnimationFrame(frame);
      frame = null;
      render(performance.now() - startTime);
    }
  };
};
