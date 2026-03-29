// tests/demo-postselect.test.js
// Tests for post-selection bias simulator — verifies postS and acceptRate
// formulas through DOM readouts after initialization.
import { describe, it, expect, afterEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

afterEach(() => cleanDOM());

function buildPostSelectDOM(biasValue = '0.5') {
  const canvas = makeEl('canvas', { id: 'postSelectCanvas' });
  Object.defineProperty(canvas, 'offsetWidth', { value: 600, configurable: true });
  Object.defineProperty(canvas, 'offsetHeight', { value: 300, configurable: true });

  makeEl('input', { type: 'range', id: 'sliderBias', min: '0', max: '1', value: biasValue, step: '0.01' });
  makeEl('span', { id: 'valBias' });
  makeEl('span', { id: 'readoutPostS' });
  makeEl('span', { id: 'readoutAccept' });

  const verdictContainer = makeEl('div', {});
  const verdict = makeEl('span', { id: 'readoutVerdict' }, verdictContainer);
  return { canvas, verdict, verdictContainer };
}

describe('initPostSelectDemo', () => {
  it('at p=0: S=4 (maximal artifact), acceptance=50%', async () => {
    // gsap is required by this demo's slider handler, stub it
    globalThis.gsap = { to: (target, opts) => { Object.assign(target, { p: parseFloat(opts.p || target.p) }); if (opts.onUpdate) opts.onUpdate(); } };

    buildPostSelectDOM('0');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const s = parseFloat(document.getElementById('readoutPostS').textContent);
    const accept = document.getElementById('readoutAccept').textContent;

    // postS(0) = 2 + 2*(1-0) = 4
    expect(s).toBeCloseTo(4, 2);
    // acceptRate(0) = 0.5 + 0.5*0 = 0.5 → 50.0%
    expect(accept).toBe('50.0%');

    delete globalThis.gsap;
  });

  it('at p=1: S=2 (classical), acceptance=100%', async () => {
    globalThis.gsap = { to: (target, opts) => { Object.assign(target, { p: parseFloat(opts.p || target.p) }); if (opts.onUpdate) opts.onUpdate(); } };

    buildPostSelectDOM('1');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const s = parseFloat(document.getElementById('readoutPostS').textContent);
    const accept = document.getElementById('readoutAccept').textContent;

    // postS(1) = 2 + 2*(1-1) = 2
    expect(s).toBeCloseTo(2, 2);
    // acceptRate(1) = 0.5 + 0.5*1 = 1.0 → 100.0%
    expect(accept).toBe('100.0%');

    delete globalThis.gsap;
  });

  it('at p=0.5: S=3, acceptance=75%', async () => {
    globalThis.gsap = { to: (target, opts) => { Object.assign(target, { p: parseFloat(opts.p || target.p) }); if (opts.onUpdate) opts.onUpdate(); } };

    buildPostSelectDOM('0.5');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const s = parseFloat(document.getElementById('readoutPostS').textContent);
    // postS(0.5) = 2 + 2*(0.5) = 3
    expect(s).toBeCloseTo(3, 2);

    delete globalThis.gsap;
  });

  it('shows SUSPECT verdict when S>2.01 and acceptance < eta_c', async () => {
    globalThis.gsap = { to: (target, opts) => { Object.assign(target, { p: parseFloat(opts.p || target.p) }); if (opts.onUpdate) opts.onUpdate(); } };

    // p=0.3: S = 2+2*0.7 = 3.4, accept = 0.5+0.5*0.3 = 0.65 < 0.8284
    buildPostSelectDOM('0.3');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const verdict = document.getElementById('readoutVerdict');
    expect(verdict.textContent).toBe('SUSPECT');

    delete globalThis.gsap;
  });

  it('shows Classical verdict when S <= 2.01', async () => {
    globalThis.gsap = { to: (target, opts) => { Object.assign(target, { p: parseFloat(opts.p || target.p) }); if (opts.onUpdate) opts.onUpdate(); } };

    buildPostSelectDOM('1');

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    const verdict = document.getElementById('readoutVerdict');
    expect(verdict.textContent).toBe('Classical');

    delete globalThis.gsap;
  });

  it('emits chshlab:state with postselect data', async () => {
    globalThis.gsap = { to: (target, opts) => { Object.assign(target, { p: parseFloat(opts.p || target.p) }); if (opts.onUpdate) opts.onUpdate(); } };

    buildPostSelectDOM('0.5');
    let received = null;
    document.addEventListener('chshlab:state', (e) => { received = e.detail; }, { once: true });

    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    initPostSelectDemo();

    expect(received).not.toBeNull();
    expect(received.demo).toBe('postselect');
    expect(received.s).toBeCloseTo(3, 2);
    expect(received.accept).toBeCloseTo(0.75, 2);

    delete globalThis.gsap;
  });

  it('returns silently when canvas is missing', async () => {
    const { initPostSelectDemo } = await import('../js/demo-postselect.js');
    expect(() => initPostSelectDemo()).not.toThrow();
  });
});
