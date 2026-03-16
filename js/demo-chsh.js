// chshlab/js/demo-chsh.js
// Demo 1: Angle slider → live CHSH S computation (quantum singlet + classical LHV)

import { emitState } from './animation-config.js';

// Quantum singlet correlation: E_Q(a,b) = -cos(a - b)
function corrQuantum(a, b) {
  return -Math.cos(a - b);
}

// Classical LHV (piecewise linear deterministic)
function corrClassical(a, b) {
  const diff = Math.abs(((a - b) + Math.PI) % (2 * Math.PI) - Math.PI);
  return 1 - (2 / Math.PI) * diff;
}

// CHSH: S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|
function computeS(corrFn, a, ap, b, bp) {
  return Math.abs(corrFn(a, b) - corrFn(a, bp) + corrFn(ap, b) + corrFn(ap, bp));
}

function deg(d) {
  return d * Math.PI / 180;
}

export function initAngleDemo() {
  const canvas = document.getElementById('chshCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const sliders = {
    a:  document.getElementById('sliderA'),
    ap: document.getElementById('sliderAp'),
    b:  document.getElementById('sliderB'),
    bp: document.getElementById('sliderBp'),
  };
  const valSpans = {
    a:  document.getElementById('valA'),
    ap: document.getElementById('valAp'),
    b:  document.getElementById('valB'),
    bp: document.getElementById('valBp'),
  };
  const readoutQ = document.getElementById('readoutQuantum');
  const readoutC = document.getElementById('readoutClassical');

  const state = { a: deg(+sliders.a.value), ap: deg(+sliders.ap.value), b: deg(+sliders.b.value), bp: deg(+sliders.bp.value) };

  function render() {
    const sq = computeS(corrQuantum,   state.a, state.ap, state.b, state.bp);
    const sc = computeS(corrClassical, state.a, state.ap, state.b, state.bp);

    if (readoutQ) readoutQ.textContent = sq.toFixed(3);
    if (readoutC) readoutC.textContent = sc.toFixed(3);

    // Emit state for Bound Explorer and sonification
    emitState({ demo: 'angle', s: sq, sClassical: sc, a: state.a, ap: state.ap, b: state.b, bp: state.bp });

    // Color quantum readout: blue if violating classical bound, amber otherwise
    if (readoutQ && readoutQ.parentElement) {
      readoutQ.parentElement.style.color = sq > 2.01 ? 'var(--blue)' : 'var(--amber)';
    }

    drawDiagram(ctx, canvas, state, sq);
  }

  // Attach input listeners to all sliders with GSAP-tweened interpolation
  Object.entries(sliders).forEach(([key, slider]) => {
    if (!slider) return;
    slider.addEventListener('input', () => {
      gsap.to(state, {
        [key]: deg(+slider.value),
        duration: 0.15,
        ease: 'power1.out',
        onUpdate: () => render(),
      });
      if (valSpans[key]) valSpans[key].textContent = slider.value + '\u00b0';
    });
  });

  // Resize canvas to match CSS width
  const ro = new ResizeObserver(() => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = 300;
    render();
  });
  ro.observe(canvas);
  render();
}

function drawDiagram(ctx, canvas, angles, sq) {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const r  = Math.min(cx, cy) * 0.72;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Classical bound ring at normalized radius
  ctx.beginPath();
  ctx.arc(cx, cy, r * (1 / Math.sqrt(2)), 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(201,169,77,0.25)';
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw angle arms
  function drawArm(angle, color, lbl) {
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '11px \'JetBrains Mono\', monospace';
    const offsetX = x > cx ? 6 : -20;
    const offsetY = y > cy ? 14 : -6;
    ctx.fillText(lbl, x + offsetX, y + offsetY);
  }

  drawArm(angles.a,  '#C9A94D', 'a');
  drawArm(angles.ap, '#C9A94D', "a'");
  drawArm(angles.b,  '#4FA3D4', 'b');
  drawArm(angles.bp, '#4FA3D4', "b'");

  // S value in center
  ctx.fillStyle = sq > 2.01 ? '#4FA3D4' : '#C9A94D';
  ctx.font = 'bold ' + Math.floor(r * 0.22) + 'px \'JetBrains Mono\', monospace';
  ctx.textAlign = 'center';
  ctx.fillText('S = ' + sq.toFixed(3), cx, cy + 6);
  ctx.textAlign = 'left';
}
