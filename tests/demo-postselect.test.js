// tests/demo-postselect.test.js
// Tests for post-selection bias simulator — verifies paperSelectedMagnitude formulas
// through DOM readouts after initialization.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

beforeEach(() => {
  globalThis.gsap = { to: (target, opts) => { if (opts.onUpdate) opts.onUpdate(); } };
});
afterEach(() => {
  cleanDOM();
  delete globalThis.gsap;
});

// Slider range is [0, 0.5] — matches index.html max="0.50"
function buildPostSelectDOM(biasValue = '0.10') {
  const canvas = makeEl('canvas', { id: 'postSelectCanvas' });
  Object.defineProperty(canvas, 'offsetWidth', { value: 600, configurable: true });
  Object.defineProperty(canvas, 'offsetHeight', { value: 300, configurable: true });

  makeEl('input', { type: 'range', id: 'sliderBias', min: '0', max: '0.5', value: biasValue, step: '0.01' });
  makeEl('span', { id: 'valBias' });
  makeEl('span', { id: 'readoutPostS' });
  makeEl('span', { id: 'readoutAccept' });

  const verdictContainer = makeEl('div', {});
  const verdict = makeEl('span', { id: 'readoutVerdict' }, verdictContainer);
  return { canvas, verdict, verdictContainer };
}

describe('initPostSelectDemo', () => {
  it('at p=0: S=4 (maximal artifact), acceptance=75%', async () => {
    buildPostSelectDOM('0');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const s = parseFloat(document.getElementById('readoutPostS').textContent);
    const accept = document.getElementById('readoutAccept').textContent;

    // postS(0): numerator = 1.5, denominator = 1.5, E^sel = 1, S = 4
    expect(s).toBeCloseTo(4, 2);
    // acceptRate(0) = 3/4 - 0 = 0.75 → 75.0%
    expect(accept).toBe('75.0%');
  });

  it('at p=0.5 (slider max): S=2 (classical boundary), acceptance=50%', async () => {
    buildPostSelectDOM('0.5');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const s = parseFloat(document.getElementById('readoutPostS').textContent);
    const accept = document.getElementById('readoutAccept').textContent;

    // postS(0.5): numerator = 0.5, denominator = 1.0, E^sel = 0.5, S = 2
    expect(s).toBeCloseTo(2, 2);
    // acceptRate(0.5) = 3/4 - 0.25 = 0.5 → 50.0%
    expect(accept).toBe('50.0%');
  });

  it('at p=0.10 (paper point): S=26/7≈3.714, acceptance=70%', async () => {
    buildPostSelectDOM('0.10');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const s = parseFloat(document.getElementById('readoutPostS').textContent);
    const accept = document.getElementById('readoutAccept').textContent;

    // postS(0.10): numerator = 1.3, denominator = 1.4, E^sel = 13/14, S = 26/7
    expect(s).toBeCloseTo(26 / 7, 2);
    // acceptRate(0.10) = 3/4 - 0.05 = 0.70 → 70.0%
    expect(accept).toBe('70.0%');
  });

  it('shows SUSPECT verdict when S>2.01 and acceptance < eta_c', async () => {
    // p=0.3: S = 4*(0.9/1.2) = 3.0, accept = 0.75 - 0.15 = 0.60 < 0.8284 (ETA_CRIT)
    buildPostSelectDOM('0.3');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const verdict = document.getElementById('readoutVerdict');
    expect(verdict.textContent).toBe('SUSPECT');
  });

  it('shows Classical verdict when S <= 2.01', async () => {
    // p=0.5: S = 2.0 <= 2.01 → Classical
    buildPostSelectDOM('0.5');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const verdict = document.getElementById('readoutVerdict');
    expect(verdict.textContent).toBe('Classical');
  });

  it('emits chshlab:state with postselect data at paper point', async () => {
    buildPostSelectDOM('0.10');
    let received = null;
    document.addEventListener('chshlab:state', (e) => { received = e.detail; }, { once: true });

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    expect(received).not.toBeNull();
    expect(received.demo).toBe('postselect');
    // At the paper point: S = 26/7, accept = 0.70
    expect(received.s).toBeCloseTo(26 / 7, 2);
    expect(received.accept).toBeCloseTo(0.70, 2);
  });

  it('returns silently when canvas is missing', async () => {
    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    expect(() => initPostSelectDemo()).not.toThrow();
  });
});
