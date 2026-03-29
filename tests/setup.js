// tests/setup.js — Shared DOM stubs and test utilities for chshlab
import { vi } from 'vitest';

// ── Canvas 2D context stub ──
const canvasCtxStub = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  setLineDash: vi.fn(),
  scale: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalAlpha: 1,
};

// Patch HTMLCanvasElement.getContext to return stub
HTMLCanvasElement.prototype.getContext = vi.fn(function () {
  return canvasCtxStub;
});

// ── ResizeObserver stub ──
class ResizeObserverStub {
  constructor(callback) {
    this._callback = callback;
  }
  observe(target) {
    // Fire immediately so init code can render
    this._callback([{ target, contentRect: { width: 600, height: 400 } }]);
  }
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

// ── IntersectionObserver stub ──
class IntersectionObserverStub {
  constructor(callback, options) {
    this._callback = callback;
    this._options = options;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IntersectionObserverStub;

// ── MutationObserver stub (jsdom has one, but ensure it works) ──
if (!globalThis.MutationObserver) {
  globalThis.MutationObserver = class {
    constructor() {}
    observe() {}
    disconnect() {}
  };
}

// ── matchMedia stub ──
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Navigator clipboard stub ──
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
});
Object.defineProperty(window, 'isSecureContext', { value: true, writable: true });

// ── window.scrollTo / scrollBy stubs ──
window.scrollTo = vi.fn();
window.scrollBy = vi.fn();

// ── URL.createObjectURL / revokeObjectURL ──
URL.createObjectURL = vi.fn(() => 'blob:mock');
URL.revokeObjectURL = vi.fn();

// ── getComputedStyle stub for CSS custom properties ──
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = vi.fn((el) => {
  const style = originalGetComputedStyle(el);
  const originalGetPropertyValue = style.getPropertyValue.bind(style);
  style.getPropertyValue = (prop) => {
    const tokenMap = {
      '--chart-grid': 'rgba(255,248,230,0.1)',
      '--chart-paper': 'rgba(241,232,209,0.04)',
      '--border': 'rgba(255,255,255,0.08)',
      '--text-faint': '#5C5A55',
      '--text-muted': '#9A9485',
      '--bg': '#0E0F14',
      '--chart-s-stroke': '#C94040',
      '--chart-lhv-stroke': '#C9A94D',
      '--chart-accept-stroke': '#6B8F71',
      '--blue': '#4FA3D4',
    };
    return tokenMap[prop] || originalGetPropertyValue(prop) || '';
  };
  return style;
});

// ── Utility: build a minimal DOM fragment for a demo using safe DOM methods ──
export function createDemoDOM(elements) {
  const container = document.createElement('div');
  if (typeof elements === 'function') {
    elements(container);
  }
  document.body.appendChild(container);
  return container;
}

// ── Utility: create an element with attributes and append to parent ──
export function makeEl(tag, attrs = {}, parent = document.body) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  parent.appendChild(el);
  return el;
}

// ── Utility: clean up all added DOM elements ──
export function cleanDOM() {
  document.body.textContent = '';
}

// ── Utility: wait for CustomEvent ──
export function waitForEvent(eventName, timeout = 500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${eventName}`)), timeout);
    document.addEventListener(eventName, (e) => {
      clearTimeout(timer);
      resolve(e.detail);
    }, { once: true });
  });
}

// ── Canvas context getter for assertions ──
export function getCanvasCtx() {
  return canvasCtxStub;
}
