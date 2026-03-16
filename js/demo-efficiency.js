// chshlab/js/demo-efficiency.js
// Demo 2: Detection efficiency threshold SVG chart

const ETA_CRIT = 2 / (1 + Math.sqrt(2)); // ≈ 0.8284

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
  const svg    = document.getElementById('efficiencySvg');
  if (!svg) return;
  const slider  = document.getElementById('sliderEta');
  const valEta  = document.getElementById('valEta');
  const readout = document.getElementById('readoutLhvMax');

  const state = { eta: parseFloat(slider.value) };
  let firstDraw = true;

  const W   = 700;
  const H   = 350;
  const pad = { top: 30, right: 50, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top  - pad.bottom;

  const etaX = eta => pad.left + (eta - 0.5) / 0.5 * plotW;
  const sY   = s   => pad.top  + plotH - (Math.min(s, 6) / 6) * plotH;

  function rebuild(eta) {
    // Remove all children safely
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const tsiY   = sY(2 * Math.sqrt(2));
    const classY = sY(2);
    const critX  = etaX(ETA_CRIT);
    const markX  = etaX(eta);
    const markY  = sY(sLhvMax(eta));

    // Build LHV max curve path string
    let d = '';
    for (let i = 0; i <= 100; i++) {
      const e = 0.5 + (i / 100) * 0.5;
      const s = Math.min(sLhvMax(e), 6);
      const x = etaX(e).toFixed(1);
      const y = sY(s).toFixed(1);
      d += (i === 0 ? 'M' : 'L') + x + ',' + y;
    }

    // Grid reference lines
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: tsiY, x2: pad.left + plotW, y2: tsiY,
      stroke: 'rgba(79,163,212,0.2)', 'stroke-dasharray': '4,4',
    }));
    svg.appendChild(svgEl('line', {
      x1: pad.left, y1: classY, x2: pad.left + plotW, y2: classY,
      stroke: 'rgba(201,169,77,0.2)', 'stroke-dasharray': '4,4',
    }));

    // LHV max curve
    svg.appendChild(svgEl('path', {
      d,
      fill: 'none',
      stroke: '#C94040',
      'stroke-width': '2',
    }));

    if (firstDraw) {
      const pathEl = svg.querySelector('path');
      if (pathEl) {
        const length = pathEl.getTotalLength();
        pathEl.setAttribute('stroke-dasharray', length);
        pathEl.setAttribute('stroke-dashoffset', length);
        gsap.to(pathEl, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' });
      }
      firstDraw = false;
    }

    // Critical threshold vertical
    svg.appendChild(svgEl('line', {
      x1: critX, y1: pad.top, x2: critX, y2: pad.top + plotH,
      stroke: 'rgba(201,169,77,0.5)', 'stroke-dasharray': '6,4',
    }));
    svg.appendChild(svgText('\u03b7_c\u22480.828', {
      x: critX + 4, y: pad.top + 14,
      fill: '#9A9485',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '10',
    }));

    // Current η marker
    svg.appendChild(svgEl('line', {
      x1: markX, y1: pad.top, x2: markX, y2: pad.top + plotH,
      stroke: 'rgba(255,255,255,0.12)',
    }));
    svg.appendChild(svgEl('circle', {
      cx: markX, cy: markY, r: '6', fill: '#C94040',
    }));

    // Bound labels (right edge)
    svg.appendChild(svgText('2\u221a2', {
      x: pad.left + plotW + 4, y: tsiY + 4,
      fill: '#4FA3D4',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '10',
    }));
    svg.appendChild(svgText('2', {
      x: pad.left + plotW + 4, y: classY + 4,
      fill: '#C9A94D',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '10',
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
      fill: '#5C5A55',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '11',
      'text-anchor': 'middle',
    }));
    svg.appendChild(svgText('CHSH S', {
      x: 14, y: H / 2,
      fill: '#5C5A55',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '11',
      'text-anchor': 'middle',
      transform: 'rotate(-90, 14, ' + (H / 2) + ')',
    }));
  }

  if (slider) slider.addEventListener('input', () => {
    gsap.to(state, {
      eta: parseFloat(slider.value),
      duration: 0.15,
      ease: 'power1.out',
      onUpdate: () => {
        if (valEta) valEta.textContent = Math.round(state.eta * 100) + '%';
        const s = sLhvMax(state.eta);
        if (readout) readout.textContent = s.toFixed(3);
        if (readout && readout.parentElement) {
          readout.parentElement.style.color = state.eta < ETA_CRIT ? 'var(--crimson)' : 'var(--green)';
        }
        rebuild(state.eta);
      },
    });
  });

  // Initial render
  if (valEta) valEta.textContent = Math.round(state.eta * 100) + '%';
  const s = sLhvMax(state.eta);
  if (readout) readout.textContent = s.toFixed(3);
  if (readout && readout.parentElement) {
    readout.parentElement.style.color = state.eta < ETA_CRIT ? 'var(--crimson)' : 'var(--green)';
  }
  rebuild(state.eta);
}
