// chshlab/js/annotations.js
// Paper diagram hotspot annotations

const HOTSPOTS = [
  {
    id: 'A',
    x: 52,
    y: 18,
    tooltip: 'Detection efficiency not reported. At η < 82.8%, S > 2 is classically achievable.',
  },
  {
    id: 'B',
    x: 28,
    y: 62,
    tooltip: 'Post-selection on coincident detection events only — introduces outcome-dependent bias.',
  },
  {
    id: 'C',
    x: 72,
    y: 62,
    tooltip: 'Fair sampling assumption unjustified at very low efficiency; not stated or verified.',
  },
  {
    id: 'D',
    x: 50,
    y: 85,
    tooltip: 'CHSH S claimed without acceptance-rate diagnostics or η-corrected LHV bound comparison.',
  },
];

export function initAnnotations() {
  const preview = document.getElementById('paperPreview');
  if (!preview) return;

  HOTSPOTS.forEach(h => {
    const spot    = document.createElement('div');
    const label   = document.createElement('span');
    const tooltip = document.createElement('div');

    spot.className    = 'hotspot';
    label.className   = 'hotspot__label';
    tooltip.className = 'hotspot__tooltip';

    spot.setAttribute('role', 'button');
    spot.setAttribute('tabindex', '0');
    spot.setAttribute('aria-label', 'Hotspot ' + h.id + ': ' + h.tooltip);
    spot.style.left = h.x + '%';
    spot.style.top  = h.y + '%';

    // Safe text assignment — no HTML injection
    label.textContent   = h.id;
    tooltip.textContent = h.tooltip;

    spot.appendChild(label);
    spot.appendChild(tooltip);
    preview.appendChild(spot);
  });
}
