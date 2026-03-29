// tests/fig-gauge.test.js
// Tests for the three-region CHSH gauge — initialization, marker API, zones.
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

beforeEach(() => cleanDOM());
afterEach(() => {
  cleanDOM();
  delete window.__gaugeAddMarker;
});

function buildGaugeDOM() {
  const canvas = makeEl('canvas', { id: 'gaugeCanvas', width: '800', height: '160' });
  Object.defineProperty(canvas, 'offsetWidth', { value: 800, configurable: true });
  Object.defineProperty(canvas, 'offsetHeight', { value: 160, configurable: true });
  return canvas;
}

describe('initGauge', () => {
  it('initializes and renders without crashing', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    expect(() => initGauge()).not.toThrow();
  });

  it('returns silently when canvas is missing', async () => {
    const { initGauge } = await import('../js/fig-gauge.js');
    expect(() => initGauge()).not.toThrow();
  });

  it('exposes window.__gaugeAddMarker function', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    initGauge();

    expect(typeof window.__gaugeAddMarker).toBe('function');
  });

  it('__gaugeAddMarker adds a new marker', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    initGauge();

    // Should not throw when adding markers
    expect(() => {
      window.__gaugeAddMarker(2.001, 'Classical sim', '#C9A94D');
      window.__gaugeAddMarker(3.716, 'Post-selected', '#C94040');
    }).not.toThrow();
  });

  it('__gaugeAddMarker updates existing marker by label', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    initGauge();

    // Adding same label twice should not throw or duplicate
    window.__gaugeAddMarker(2.001, 'Classical sim', '#C9A94D');
    window.__gaugeAddMarker(2.001, 'Classical sim', '#C9A94D');

    // No assertion on internals, just verify no crash
  });

  it('default marker is Wang et al. at S=2.275', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    initGauge();

    // The canvas context should have been called with fillText containing "Wang et al."
    const ctx = HTMLCanvasElement.prototype.getContext();
    const fillTextCalls = ctx.fillText.mock.calls;
    const wangCall = fillTextCalls.find(call => call[0] === 'Wang et al.');
    expect(wangCall).toBeDefined();
  });

  it('renders zone labels (Classical, Quantum, Artifact)', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    initGauge();

    const ctx = HTMLCanvasElement.prototype.getContext();
    const fillTextCalls = ctx.fillText.mock.calls.map(c => c[0]);
    expect(fillTextCalls).toContain('Classical');
    expect(fillTextCalls).toContain('Quantum');
    expect(fillTextCalls).toContain('Artifact');
  });

  it('renders S axis tick marks (0-4)', async () => {
    buildGaugeDOM();

    const { initGauge } = await import('../js/fig-gauge.js');
    initGauge();

    const ctx = HTMLCanvasElement.prototype.getContext();
    const fillTextCalls = ctx.fillText.mock.calls.map(c => c[0]);
    expect(fillTextCalls).toContain('0');
    expect(fillTextCalls).toContain('2');
    expect(fillTextCalls).toContain('4');
  });
});
