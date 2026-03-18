// chshlab/js/fig-event-stream.js
// Post-Selection Event Stream — particles flow through a filter gate
// Beat 5 visualization. Canvas2D with object pooling.

import { emitState, prefersReducedMotion } from './animation-config.js';

export function initEventStream() {
  const canvas = document.getElementById('eventStreamCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('sliderStreamBias');
  const valLabel = document.getElementById('valStreamBias');
  const readoutAccepted = document.getElementById('readoutStreamAccepted');
  const readoutS = document.getElementById('readoutStreamS');

  let rho = slider ? parseFloat(slider.value) : 0.5;
  const events = [];
  const MAX_EVENTS = 100;
  let accepted = 0, total = 0;
  let frameId = null;

  let W, H, dpr;
  const ro = new ResizeObserver(() => {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = 250;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  });
  ro.observe(canvas);

  const gateX = () => W * 0.5;

  function postS(p) { return 2 + 2 * (1 - p); }
  function acceptRate(p) { return 0.5 + 0.5 * p; }

  function emitEvent() {
    if (events.length >= MAX_EVENTS) return;
    const correlated = Math.random() < 0.5;
    const keepProb = correlated ? 1.0 : rho;
    const kept = Math.random() < keepProb;

    events.push({
      x: 0,
      y: H * 0.2 + Math.random() * H * 0.6,
      speed: 1.5 + Math.random() * 1.5,
      correlated,
      kept,
      alpha: 1,
      phase: 'pre', // pre -> gate -> post
    });
    total++;
    if (kept) accepted++;
  }

  function loop() {
    frameId = requestAnimationFrame(loop);
    if (!W) return;

    ctx.clearRect(0, 0, W, H);
    const gx = gateX();

    // Draw filter gate
    ctx.fillStyle = 'rgba(201, 169, 77, 0.1)';
    ctx.fillRect(gx - 3, 0, 6, H);
    ctx.strokeStyle = '#C9A94D';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gate label
    ctx.fillStyle = '#C9A94D';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('FILTER', gx, 16);

    // Emit
    if (Math.random() < 0.15) emitEvent();

    // Update and draw events
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      e.x += e.speed;

      // Phase transitions
      if (e.phase === 'pre' && e.x >= gx) {
        e.phase = e.kept ? 'post' : 'rejected';
      }

      if (e.phase === 'rejected') {
        e.alpha -= 0.04;
        e.y += 1.5; // drift down
        if (e.alpha <= 0) { events.splice(i, 1); continue; }
      }

      if (e.x > W + 20) { events.splice(i, 1); continue; }

      // Draw
      ctx.globalAlpha = e.alpha;
      if (e.phase === 'rejected') {
        ctx.fillStyle = 'rgba(201, 64, 64, 0.6)';
      } else if (e.correlated) {
        ctx.fillStyle = '#6B8F71';
      } else {
        ctx.fillStyle = '#C94040';
      }
      ctx.beginPath();
      ctx.arc(e.x, e.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Readouts
    const s = postS(rho);
    const rate = acceptRate(rho);
    if (readoutAccepted) readoutAccepted.textContent = (rate * 100).toFixed(1) + '%';
    if (readoutS) readoutS.textContent = s.toFixed(3);

    // Labels
    ctx.fillStyle = '#5C5A55';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText('Incoming pairs', 10, H - 10);
    ctx.textAlign = 'right';
    ctx.fillText('Accepted \u2192 S = ' + s.toFixed(2), W - 10, H - 10);

    emitState({ demo: 'eventstream', s, accept: rate, rho });
  }

  if (slider) {
    slider.addEventListener('input', () => {
      rho = parseFloat(slider.value);
      if (valLabel) valLabel.textContent = rho.toFixed(2);
    });
  }

  // Visibility-based start/stop
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!frameId) loop();
      } else {
        if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
      }
    });
  }, { threshold: 0.1 });
  io.observe(canvas);
}
