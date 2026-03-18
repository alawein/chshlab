// chshlab/js/fig-gauge.js
// Three Regions Gauge — horizontal S range [0,4] with colored zones
// Beat 3 visualization. Markers animate on via ScrollTrigger callbacks.

import { emitState, prefersReducedMotion } from './animation-config.js';

export function initGauge() {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const markers = [
    { s: 2.275, label: 'Wang et al.', color: '#9A9485', visible: true },
  ];

  const ro = new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 160 * dpr;
    ctx.scale(dpr, dpr);
    render();
  });
  ro.observe(canvas);

  function render() {
    const W = canvas.offsetWidth;
    const H = 160;
    ctx.clearRect(0, 0, W, H);

    const pad = 40;
    const barY = 50;
    const barH = 36;
    const barW = W - pad * 2;

    // Three zones
    const zones = [
      { start: 0, end: 2, color: 'rgba(201,169,77,0.15)', border: '#C9A94D', label: 'Classical' },
      { start: 2, end: 2 * Math.SQRT2, color: 'rgba(79,163,212,0.15)', border: '#4FA3D4', label: 'Quantum' },
      { start: 2 * Math.SQRT2, end: 4, color: 'rgba(201,64,64,0.15)', border: '#C94040', label: 'Artifact' },
    ];

    zones.forEach(z => {
      const x1 = pad + (z.start / 4) * barW;
      const x2 = pad + (z.end / 4) * barW;
      ctx.fillStyle = z.color;
      ctx.fillRect(x1, barY, x2 - x1, barH);

      // Zone label
      ctx.fillStyle = z.border;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(z.label, (x1 + x2) / 2, barY - 8);
    });

    // Border lines at S=2 and S=2sqrt2
    [2, 2 * Math.SQRT2].forEach(val => {
      const x = pad + (val / 4) * barW;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, barY - 4);
      ctx.lineTo(x, barY + barH + 4);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // S axis labels
    ctx.fillStyle = '#5C5A55';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    [0, 1, 2, 3, 4].forEach(val => {
      const x = pad + (val / 4) * barW;
      ctx.fillText(String(val), x, barY + barH + 20);
    });
    const tsX = pad + (2 * Math.SQRT2 / 4) * barW;
    ctx.fillText('2\u221a2', tsX, barY + barH + 32);

    // Markers
    markers.forEach(m => {
      if (!m.visible) return;
      const x = pad + (m.s / 4) * barW;

      // Pin
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.moveTo(x, barY - 2);
      ctx.lineTo(x - 5, barY - 14);
      ctx.lineTo(x + 5, barY - 14);
      ctx.closePath();
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(x, barY + barH / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(m.label, x, barY - 18);
      ctx.fillText('S=' + m.s.toFixed(3), x, barY + barH + 46);
    });
  }

  // Public API: add markers from other beats via ScrollTrigger
  function addMarker(s, label, color) {
    const existing = markers.find(m => m.label === label);
    if (existing) {
      existing.visible = true;
      render();
      return;
    }
    markers.push({ s, label, color, visible: true });
    render();
  }

  // Expose for scroll callbacks
  window.__gaugeAddMarker = addMarker;

  // ScrollTrigger callbacks for Beat 6 markers
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#proof',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        addMarker(2.001, 'Classical sim', '#C9A94D');
        setTimeout(() => addMarker(3.716, 'Post-selected', '#C94040'), 400);
      },
    });
  }

  render();
}
