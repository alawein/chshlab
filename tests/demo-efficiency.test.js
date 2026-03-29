// tests/demo-efficiency.test.js
// Tests for detection efficiency threshold demo — verifies sLhvMax curve
// and critical threshold behavior through DOM readouts.
import { describe, it, expect, afterEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

afterEach(() => cleanDOM());

function buildEfficiencyDOM(etaValue = '0.83') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'efficiencySvg';
  document.body.appendChild(svg);

  makeEl('input', { type: 'range', id: 'sliderEta', min: '0.5', max: '1', value: etaValue, step: '0.01' });
  makeEl('span', { id: 'valEta' });
  makeEl('span', { id: 'readoutLhvMax' });
}

describe('initEfficiencyDemo', () => {
  it('computes sLhvMax at critical eta (~0.8284)', async () => {
    const ETA_CRIT = 2 / (1 + Math.sqrt(2));
    buildEfficiencyDOM(ETA_CRIT.toFixed(4));

    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    initEfficiencyDemo();

    const readout = document.getElementById('readoutLhvMax');
    const sMax = parseFloat(readout.textContent);
    // At eta_c, sLhvMax = 4/eta_c - 2 = 2*sqrt(2) ≈ 2.828
    expect(sMax).toBeCloseTo(2 * Math.SQRT2, 2);
  });

  it('sLhvMax at eta=1 equals 2 (classical bound)', async () => {
    buildEfficiencyDOM('1');

    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    initEfficiencyDemo();

    const sMax = parseFloat(document.getElementById('readoutLhvMax').textContent);
    expect(sMax).toBeCloseTo(2, 3);
  });

  it('sLhvMax at eta=0.5 equals 6', async () => {
    buildEfficiencyDOM('0.5');

    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    initEfficiencyDemo();

    const sMax = parseFloat(document.getElementById('readoutLhvMax').textContent);
    expect(sMax).toBeCloseTo(6, 3);
  });

  it('displays eta as percentage', async () => {
    buildEfficiencyDOM('0.83');

    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    initEfficiencyDemo();

    const valEta = document.getElementById('valEta');
    expect(valEta.textContent).toBe('83%');
  });

  it('builds SVG elements (axes, curve, markers)', async () => {
    buildEfficiencyDOM('0.83');

    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    initEfficiencyDemo();

    const svg = document.getElementById('efficiencySvg');
    // Should have multiple child SVG elements: lines, paths, text, circle
    expect(svg.children.length).toBeGreaterThan(5);
    // Has the LHV curve path
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
    // Has the marker dot
    const circles = svg.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it('emits chshlab:state with efficiency data', async () => {
    buildEfficiencyDOM('0.83');
    let received = null;
    document.addEventListener('chshlab:state', (e) => { received = e.detail; }, { once: true });

    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    initEfficiencyDemo();

    expect(received).not.toBeNull();
    expect(received.demo).toBe('efficiency');
    expect(received.eta).toBeCloseTo(0.83, 2);
    expect(received.etaCrit).toBeCloseTo(0.8284, 3);
  });

  it('returns silently when SVG is missing', async () => {
    const { initEfficiencyDemo } = await import('../js/demo-efficiency.js');
    expect(() => initEfficiencyDemo()).not.toThrow();
  });
});
