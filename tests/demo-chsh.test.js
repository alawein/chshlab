// tests/demo-chsh.test.js
// Tests for CHSH angle sweep demo — verifies quantum/classical correlation math
// through DOM readout values after initialization.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

afterEach(() => cleanDOM());

function buildAngleDemoDOM() {
  const canvas = makeEl('canvas', { id: 'chshCanvas' });
  // Give canvas a layout size for ResizeObserver
  Object.defineProperty(canvas, 'offsetWidth', { value: 600, configurable: true });
  Object.defineProperty(canvas, 'offsetHeight', { value: 400, configurable: true });

  makeEl('input', { type: 'range', id: 'sliderA', min: '0', max: '360', value: '0', step: '1' });
  makeEl('input', { type: 'range', id: 'sliderAp', min: '0', max: '360', value: '90', step: '1' });
  makeEl('input', { type: 'range', id: 'sliderB', min: '0', max: '360', value: '45', step: '1' });
  makeEl('input', { type: 'range', id: 'sliderBp', min: '0', max: '360', value: '135', step: '1' });

  makeEl('span', { id: 'valA' });
  makeEl('span', { id: 'valAp' });
  makeEl('span', { id: 'valB' });
  makeEl('span', { id: 'valBp' });
  makeEl('span', { id: 'readoutClassical' });
  makeEl('span', { id: 'readoutQuantum' });
}

describe('initAngleDemo', () => {
  it('renders quantum S value for default optimal angles (0, 90, 45, 135)', async () => {
    buildAngleDemoDOM();
    const { initAngleDemo } = await import('../js/demo-chsh.js');
    initAngleDemo();

    const readoutQ = document.getElementById('readoutQuantum');
    const sq = parseFloat(readoutQ.textContent);
    // Optimal angles give S = 2*sqrt(2) ≈ 2.828
    expect(sq).toBeCloseTo(2.828, 2);
  });

  it('renders classical S value below 2 for default angles', async () => {
    buildAngleDemoDOM();
    const { initAngleDemo } = await import('../js/demo-chsh.js');
    initAngleDemo();

    const readoutC = document.getElementById('readoutClassical');
    const sc = parseFloat(readoutC.textContent);
    expect(sc).toBeLessThanOrEqual(2.001);
  });

  it('updates angle labels', async () => {
    buildAngleDemoDOM();
    const { initAngleDemo } = await import('../js/demo-chsh.js');
    initAngleDemo();

    expect(document.getElementById('valA').textContent).toBe('0');
    expect(document.getElementById('valAp').textContent).toBe('90');
    expect(document.getElementById('valB').textContent).toBe('45');
    expect(document.getElementById('valBp').textContent).toBe('135');
  });

  it('emits chshlab:state event with demo name', async () => {
    buildAngleDemoDOM();
    let received = null;
    document.addEventListener('chshlab:state', (e) => { received = e.detail; }, { once: true });

    const { initAngleDemo } = await import('../js/demo-chsh.js');
    initAngleDemo();

    expect(received).not.toBeNull();
    expect(received.demo).toBe('angle');
    expect(received.s).toBeCloseTo(2.828, 2);
  });

  it('returns silently when canvas is missing', async () => {
    // No DOM setup
    const { initAngleDemo } = await import('../js/demo-chsh.js');
    expect(() => initAngleDemo()).not.toThrow();
  });

  it('produces S=2 when all angles are equal (degenerate case)', async () => {
    buildAngleDemoDOM();
    // When all angles equal: eQuantum(a,a)=-cos(0)=-1 for all pairs
    // S = |(-1)-(-1)+(-1)+(-1)| = |-2| = 2
    document.getElementById('sliderA').value = '45';
    document.getElementById('sliderAp').value = '45';
    document.getElementById('sliderB').value = '45';
    document.getElementById('sliderBp').value = '45';

    const { initAngleDemo } = await import('../js/demo-chsh.js');
    initAngleDemo();

    const sq = parseFloat(document.getElementById('readoutQuantum').textContent);
    expect(sq).toBeCloseTo(2, 2);
  });
});
