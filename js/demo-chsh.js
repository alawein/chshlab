// chshlab/js/demo-chsh.js
// Demo: CHSH Angle Sweep — Polar correlation diagram
// Beat 6 visualization. Four detector arms on unit circle, correlation arcs.

import { emitState, prefersReducedMotion } from './animation-config.js';
import { eQuantum, eClassical, chshS } from './quantum/chsh.js';

export function initAngleDemo() {
  const canvas = document.getElementById('chshCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const sliders = {
    a: document.getElementById('sliderA'),
    ap: document.getElementById('sliderAp'),
    b: document.getElementById('sliderB'),
    bp: document.getElementById('sliderBp'),
  };
  const valLabels = {
    a: document.getElementById('valA'),
    ap: document.getElementById('valAp'),
    b: document.getElementById('valB'),
    bp: document.getElementById('valBp'),
  };
  const readoutC = document.getElementById('readoutClassical');
  const readoutQ = document.getElementById('readoutQuantum');

  function deg2rad(d) { return d * Math.PI / 180; }

  const ro = new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    render();
  });
  ro.observe(canvas);

  function render() {
    const W = canvas.offsetWidth;
    const H = 400;
    ctx.clearRect(0, 0, W, H);

    const a  = deg2rad(parseFloat(sliders.a?.value || 0));
    const ap = deg2rad(parseFloat(sliders.ap?.value || 90));
    const b  = deg2rad(parseFloat(sliders.b?.value || 45));
    const bp = deg2rad(parseFloat(sliders.bp?.value || 135));

    // Update labels
    if (valLabels.a)  valLabels.a.textContent  = sliders.a.value;
    if (valLabels.ap) valLabels.ap.textContent = sliders.ap.value;
    if (valLabels.b)  valLabels.b.textContent  = sliders.b.value;
    if (valLabels.bp) valLabels.bp.textContent = sliders.bp.value;

    // Quantum CHSH (named locals are reused below for correlation-arc drawing)
    const eAB   = eQuantum(a, b);
    const eABp  = eQuantum(a, bp);
    const eApB  = eQuantum(ap, b);
    const eApBp = eQuantum(ap, bp);
    const sq = chshS(eAB, eABp, eApB, eApBp);

    // Classical CHSH
    const sc = chshS(
      eClassical(a, b),
      eClassical(a, bp),
      eClassical(ap, b),
      eClassical(ap, bp),
    );

    if (readoutC) readoutC.textContent = sc.toFixed(3);
    if (readoutQ) readoutQ.textContent = sq.toFixed(3);

    // Polar diagram
    const cx = W / 2;
    const cy = H / 2 - 20;
    const R = Math.min(W, H) * 0.32;

    // Unit circle
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Draw angle arms
    const arms = [
      { angle: a,  label: 'a',  color: '#C9A94D' },
      { angle: ap, label: 'a\u2032', color: '#C9A94D' },
      { angle: b,  label: 'b',  color: '#4FA3D4' },
      { angle: bp, label: 'b\u2032', color: '#4FA3D4' },
    ];

    arms.forEach(arm => {
      const ex = cx + R * Math.cos(arm.angle);
      const ey = cy - R * Math.sin(arm.angle);
      ctx.strokeStyle = arm.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Label
      const lx = cx + (R + 18) * Math.cos(arm.angle);
      const ly = cy - (R + 18) * Math.sin(arm.angle);
      ctx.fillStyle = arm.color;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(arm.label, lx, ly);
    });

    // Correlation arcs between setting pairs
    const pairs = [
      { a1: a, a2: b, E: eAB, label: 'E(a,b)' },
      { a1: a, a2: bp, E: eABp, label: 'E(a,b\u2032)' },
      { a1: ap, a2: b, E: eApB, label: 'E(a\u2032,b)' },
      { a1: ap, a2: bp, E: eApBp, label: 'E(a\u2032,b\u2032)' },
    ];

    pairs.forEach((p, i) => {
      const arcR = R * 0.4 + i * 12;
      const startAngle = -p.a1;
      const endAngle = -p.a2;

      ctx.strokeStyle = p.E < 0 ? 'rgba(201,64,64,0.4)' : 'rgba(107,143,113,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, startAngle, endAngle, startAngle > endAngle);
      ctx.stroke();
    });

    // S value display
    ctx.fillStyle = sq > 2 ? '#C94040' : '#C9A94D';
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('S(quantum) = ' + sq.toFixed(3), cx, cy + R + 30);

    ctx.fillStyle = '#9A9485';
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillText('S(classical) = ' + sc.toFixed(3), cx, cy + R + 54);

    // Reference lines
    ctx.fillStyle = '#5C5A55';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'right';
    ctx.fillText('S=2 classical bound', W - 10, H - 30);
    ctx.fillText('S=2\u221a2 Tsirelson bound', W - 10, H - 16);

    emitState({ demo: 'angle', s: sq, sClassical: sc, a: sliders.a?.value, ap: sliders.ap?.value, b: sliders.b?.value, bp: sliders.bp?.value });
  }

  Object.values(sliders).forEach(s => {
    if (s) s.addEventListener('input', () => {
      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.to({}, { duration: 0.1, onUpdate: render });
      } else {
        render();
      }
    });
  });

  render();
}
