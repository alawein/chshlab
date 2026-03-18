// chshlab/js/demo-postselect.js
// Demo 3: Post-selection bias simulator
// Shows how outcome-dependent selection inflates CHSH S from classical LHV data

import { emitState } from './animation-config.js';

const ETA_CRIT = 2 / (1 + Math.sqrt(2)); // ≈ 0.8284

// Theorem 3 constructive example formulas
function postS(p)      { return 2 + 2 * (1 - p); }       // 2 at p=1, 4 at p=0
function acceptRate(p) { return 0.5 + 0.5 * p; }         // 100% at p=1, 50% at p=0

export function initPostSelectDemo() {
  const canvas         = document.getElementById('postSelectCanvas');
  if (!canvas) return;
  const ctx            = canvas.getContext('2d');
  const slider         = document.getElementById('sliderBias');
  const valBias        = document.getElementById('valBias');
  const readoutS       = document.getElementById('readoutPostS');
  const readoutAccept  = document.getElementById('readoutAccept');
  const readoutVerdict = document.getElementById('readoutVerdict');

  const state = { p: parseFloat(slider.value) };

  const ro = new ResizeObserver(() => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = 300;
    render();
  });
  ro.observe(canvas);

  function render() {
    const p      = state.p;
    const s      = postS(p);
    const accept = acceptRate(p);

    if (valBias)        valBias.textContent        = p.toFixed(2);
    if (readoutS)       readoutS.textContent       = s.toFixed(3);
    if (readoutAccept)  readoutAccept.textContent  = (accept * 100).toFixed(1) + '%';

    const suspect = s > 2.01 && accept < ETA_CRIT;

    if (readoutVerdict) {
      if (suspect) {
        readoutVerdict.textContent = 'SUSPECT';
      } else if (s <= 2.01) {
        readoutVerdict.textContent = 'Classical';
      } else {
        readoutVerdict.textContent = 'Check \u03b7';  // 'Check η'
      }
    }

    if (readoutVerdict && readoutVerdict.parentElement) {
      readoutVerdict.parentElement.style.color = suspect ? 'var(--crimson)' : 'var(--green)';
    }

    drawGauge(ctx, canvas, s, accept);
    emitState({ demo: 'postselect', s, accept, p: state.p });
  }

  if (slider) slider.addEventListener('input', () => {
    gsap.to(state, {
      p: parseFloat(slider.value),
      duration: 0.15,
      ease: 'power1.out',
      onUpdate: () => render(),
    });
  });
  render();
}

function drawGauge(ctx, canvas, s, accept) {
  const W      = canvas.width;
  const H      = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const barH   = 28;
  const gap    = 28;
  const startX = W * 0.18;
  const maxW   = W * 0.68;
  const sBarY  = H * 0.30;
  const aBarY  = sBarY + barH + gap;

  // ── S bar ──
  // Track
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(startX, sBarY, maxW, barH);
  // Fill — color transitions through three zones
  if (s <= 2.01) {
    ctx.fillStyle = '#C9A94D'; // classical zone — amber
  } else if (s <= 2 * Math.SQRT2) {
    ctx.fillStyle = '#4FA3D4'; // quantum zone — blue
  } else {
    ctx.fillStyle = '#C94040'; // artifact zone — crimson
  }
  ctx.fillRect(startX, sBarY, maxW * (s / 4), barH);

  // S=2 marker with zone label
  const s2x = startX + maxW * (2 / 4);
  ctx.strokeStyle = '#C9A94D';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(s2x, sBarY - 8);
  ctx.lineTo(s2x, sBarY + barH + 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#C9A94D';
  ctx.font = '9px \'JetBrains Mono\', monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Classical', s2x, sBarY - 12);

  // S=2√2 marker with zone label
  const tsX = startX + maxW * (2 * Math.SQRT2 / 4);
  ctx.strokeStyle = '#4FA3D4';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(tsX, sBarY - 8);
  ctx.lineTo(tsX, sBarY + barH + 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#4FA3D4';
  ctx.fillText('Tsirelson', tsX, sBarY - 12);

  // S=4 marker
  const s4x = startX + maxW;
  ctx.fillStyle = '#5C5A55';
  ctx.fillText('4', s4x, sBarY - 10);

  // ── Acceptance bar ──
  // Track
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(startX, aBarY, maxW, barH);
  // Fill (normalized: 50%–100% maps to 0–maxW)
  const accFrac = Math.max(0, (accept - 0.5) / 0.5);
  ctx.fillStyle = accept >= ETA_CRIT ? '#6B8F71' : '#C94040';
  ctx.fillRect(startX, aBarY, maxW * accFrac, barH);

  // η_c marker
  const critFrac = (ETA_CRIT - 0.5) / 0.5;
  const critX    = startX + maxW * critFrac;
  ctx.strokeStyle = '#C9A94D';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(critX, aBarY - 8);
  ctx.lineTo(critX, aBarY + barH + 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle  = '#C9A94D';
  ctx.font       = '10px \'JetBrains Mono\', monospace';
  ctx.textAlign  = 'center';
  ctx.fillText('\u03b7_c', critX, aBarY - 12);  // 'η_c'

  // Row labels (left)
  ctx.fillStyle  = '#9A9485';
  ctx.font       = '11px \'JetBrains Mono\', monospace';
  ctx.textAlign  = 'right';
  ctx.fillText('S',      startX - 8, sBarY + barH / 2 + 4);
  ctx.fillText('Accept', startX - 8, aBarY + barH / 2 + 4);
  ctx.textAlign = 'left';
}
