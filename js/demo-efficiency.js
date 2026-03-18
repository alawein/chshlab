// chshlab/js/demo-efficiency.js
// Demo 2: Detection efficiency threshold SVG chart
// Optimized: static elements built once, only marker updates on slider input

import { emitState } from './animation-config.js';

const ETA_CRIT = 2 / (1 + Math.sqrt(2)); // ~0.8284

function sLhvMax(eta) {
  return 4 / eta - 2;
}

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function svgText(content, attrs) {
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

export function initEfficiencyDemo() {
  const svg = document.getElementById('efficiencySvg');
  if (!svg) return;
  const slider = document.getElementById('sliderEta');
  const valEta = document.getElementById('valEta');
  const readout = document.getElementById('readoutLhvMax');

  const state = { eta: parseFloat(slider.value) };

  const W = 700;
  const H = 350;
  const pad = { top: 30, right: 50, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const etaX = eta => pad.left + (eta - 0.5) / 0.5 * plotW;
  const sY = s => pad.top + plotH - (Math.min(s, 6) / 6) * plotH;

  // Dynamic elements — updated on each slider tick
  let markerLine = null;
  let markerDot = null;

  // ── Build static chart once ──
  function buildStatic() {
    const tsiY = sY(2 * Math.sqrt(2));
    const classY = sY(2);
    const critX = etaX(ETA_CRIT);

    // Ambiguity zone fill
    const zonePoints = [];
    for (let eta = 0.5; eta <= 1.0; eta += 0.005) {
      const sMax = 4 / eta - 2;
      if (sMax > 2) zonePoints.push({ eta, s: Math.min(sMax, 6) });
    }
    if (zonePoints.length > 0) {
      let zonePath = 'M' + etaX(zonePoints[0].eta).toFixed(1) + ',' + sY(2).toFixed(1);
      zonePoints.forEach(p => { zonePath += 'L' + etaX(p.eta).toFixed(1) + ',' + sY(p.s).toFixed(1); });
      zonePath += 'L' + etaX(zonePoints[zonePoints.length - 1].eta).toFixed(1) + ',' + sY(2).toFixed(1) + 'Z';
      svg.appendChild(svgEl('path', { d: zonePath, fill: 'rgba(201,64,64,0.08)', stroke: 'none' }));
    }

    // Reference lines
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: tsiY, x2: pad.left + plotW, y2: tsiY,
      stroke: 'rgba(79,163,212,0.2)', 'stroke-dasharray': '4,4',
    }));
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: classY, x2: pad.left + plotW, y2: classY,
      stroke: 'rgba(201,169,77,0.2)', 'stroke-dasharray': '4,4',
    }));

    // LHV max curve
    let d = '';
    for (let i = 0; i <= 100; i++) {
      const e = 0.5 + (i / 100) * 0.5;
      const s = Math.min(sLhvMax(e), 6);
      d += (i === 0 ? 'M' : 'L') + etaX(e).toFixed(1) + ',' + sY(s).toFixed(1);
    }
    const curvePath = svgEl('path', { d, fill: 'none', stroke: '#C94040', 'stroke-width': '2' });
    svg.appendChild(curvePath);

    // Animate curve on first draw
    if (typeof gsap !== 'undefined') {
      const length = curvePath.getTotalLength();
      curvePath.setAttribute('stroke-dasharray', length);
      curvePath.setAttribute('stroke-dashoffset', length);
      gsap.to(curvePath, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' });
    }

    // Critical threshold vertical
    svg.appendChild(svgEl('line', {
      x1: critX, y1: pad.top, x2: critX, y2: pad.top + plotH,
      stroke: 'rgba(201,169,77,0.5)', 'stroke-dasharray': '6,4',
    }));
    svg.appendChild(svgText('\u03b7_c\u22480.828', {
      x: critX + 4, y: pad.top + 14,
      fill: '#9A9485', 'font-family': 'JetBrains Mono, monospace', 'font-size': '10',
    }));

    // Bound labels
    svg.appendChild(svgText('2\u221a2', {
      x: pad.left + plotW + 4, y: tsiY + 4,
      fill: '#4FA3D4', 'font-family': 'JetBrains Mono, monospace', 'font-size': '10',
    }));
    svg.appendChild(svgText('2', {
      x: pad.left + plotW + 4, y: classY + 4,
      fill: '#C9A94D', 'font-family': 'JetBrains Mono, monospace', 'font-size': '10',
    }));

    // Axes
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: pad.top, x2: pad.left, y2: pad.top + plotH,
      stroke: 'rgba(255,255,255,0.12)',
    }));
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: pad.top + plotH, x2: pad.left + plotW, y2: pad.top + plotH,
      stroke: 'rgba(255,255,255,0.12)',
    }));

    // Axis labels
    svg.appendChild(svgText('Detection Efficiency \u03b7', {
      x: W / 2, y: H - 6,
      fill: '#5C5A55', 'font-family': 'JetBrains Mono, monospace', 'font-size': '11', 'text-anchor': 'middle',
    }));
    svg.appendChild(svgText('CHSH S', {
      x: 14, y: H / 2,
      fill: '#5C5A55', 'font-family': 'JetBrains Mono, monospace', 'font-size': '11',
      'text-anchor': 'middle', transform: 'rotate(-90, 14, ' + (H / 2) + ')',
    }));

    // Wang et al. callout
    svg.appendChild(svgText('Wang et al. \u03b7\u224810\u207b\xb9\u2078 \u2192', {
      x: etaX(0.5) + 8, y: sY(4) + 14,
      fill: '#9A9485', 'font-size': '10', 'font-family': "'JetBrains Mono', monospace",
    }));

    // Create dynamic marker elements (appended last so they're on top)
    markerLine = svgEl('line', {
      x1: 0, y1: pad.top, x2: 0, y2: pad.top + plotH,
      stroke: 'rgba(255,255,255,0.12)',
    });
    markerDot = svgEl('circle', { cx: 0, cy: 0, r: '6', fill: '#C94040' });
    svg.appendChild(markerLine);
    svg.appendChild(markerDot);
  }

  // ── Update only the dynamic marker position ──
  function updateMarker(eta) {
    const markX = etaX(eta);
    const markY = sY(Math.min(sLhvMax(eta), 6));
    markerLine.setAttribute('x1', markX);
    markerLine.setAttribute('x2', markX);
    markerDot.setAttribute('cx', markX);
    markerDot.setAttribute('cy', markY);
  }

  function updateReadouts(eta) {
    if (valEta) valEta.textContent = Math.round(eta * 100) + '%';
    const s = sLhvMax(eta);
    if (readout) readout.textContent = s.toFixed(3);
    if (readout && readout.parentElement) {
      readout.parentElement.style.color = eta < ETA_CRIT ? 'var(--crimson)' : 'var(--green)';
    }
    return s;
  }

  // Build static chart
  buildStatic();

  // Initial state
  const s = updateReadouts(state.eta);
  updateMarker(state.eta);
  emitState({ demo: 'efficiency', eta: state.eta, sLhvMax: s, etaCrit: ETA_CRIT });

  // Slider interaction — only updates marker + readouts (no DOM rebuild)
  if (slider) slider.addEventListener('input', () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(state, {
        eta: parseFloat(slider.value),
        duration: 0.15,
        ease: 'power1.out',
        onUpdate: () => {
          const s = updateReadouts(state.eta);
          updateMarker(state.eta);
          emitState({ demo: 'efficiency', eta: state.eta, sLhvMax: s, etaCrit: ETA_CRIT });
        },
      });
    } else {
      state.eta = parseFloat(slider.value);
      const s = updateReadouts(state.eta);
      updateMarker(state.eta);
      emitState({ demo: 'efficiency', eta: state.eta, sLhvMax: s, etaCrit: ETA_CRIT });
    }
  });
}
