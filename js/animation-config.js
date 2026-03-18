// chshlab/js/animation-config.js
// Shared event bus, micro-interaction presets, and state management

// ── REDUCED MOTION ──
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── EVENT BUS ──
// All demos emit 'chshlab:state' on document with their current values.
// Consumers (Bound Explorer, sonification, etc.) listen for these events.

export function emitState(detail) {
  document.dispatchEvent(new CustomEvent('chshlab:state', { detail }));
}

// ── MICRO-INTERACTION PRESETS ──
export const MICRO = {
  cardLift:      { y: -4, duration: 0.2, ease: 'power1.out' },
  buttonPress:   { scale: 0.96, duration: 0.08, ease: 'power1.in', yoyo: true, repeat: 1 },
  valueFlash:    { color: 'var(--amber)', duration: 0.15, yoyo: true, repeat: 1 },
  drawerOpen:    { duration: 0.25, ease: 'power2.out' },
  tooltipAppear: { opacity: 1, y: 0, duration: 0.15, ease: 'power1.out' },
};

// ── ASSUMPTION TOGGLE STATE ──
// Three assumptions that affect demo computations
const assumptions = {
  fairSampling: true,
  highEfficiency: true,
  noPostSelection: true,
};

export function getAssumptions() {
  return { ...assumptions };
}

export function setAssumption(key, value) {
  if (key in assumptions) {
    assumptions[key] = value;
    document.dispatchEvent(new CustomEvent('chshlab:assumptions', {
      detail: { ...assumptions, changed: key },
    }));
  }
}

// ── PERMALINK STATE ──
export function stateToParams(state) {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v));
  });
  return params.toString();
}

export function paramsToState() {
  const params = new URLSearchParams(window.location.search);
  const state = {};
  for (const [k, v] of params.entries()) {
    const num = parseFloat(v);
    state[k] = isNaN(num) ? v : num;
  }
  return state;
}

// ── MICRO-INTERACTION APPLIERS ──
export function initMicroInteractions() {
  if (typeof gsap === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Button press effect on all buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      gsap.to(btn, { ...MICRO.buttonPress });
    });
  });
}
