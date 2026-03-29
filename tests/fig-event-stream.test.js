// tests/fig-event-stream.test.js
// Tests for event stream visualization — readout updates, state emission, slider interaction.
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

beforeEach(() => {
  cleanDOM();
  globalThis.cancelAnimationFrame = vi.fn();
  globalThis.requestAnimationFrame = vi.fn(() => 1);
});
afterEach(() => {
  cleanDOM();
  delete globalThis.cancelAnimationFrame;
});

function buildEventStreamDOM(rhoValue = '0.50') {
  const canvas = makeEl('canvas', { id: 'eventStreamCanvas', width: '800', height: '250' });
  Object.defineProperty(canvas, 'offsetWidth', { value: 800, configurable: true });
  Object.defineProperty(canvas, 'offsetHeight', { value: 250, configurable: true });

  makeEl('input', { type: 'range', id: 'sliderStreamBias', min: '0.01', max: '1.0', value: rhoValue, step: '0.01' });
  makeEl('span', { id: 'valStreamBias' });
  makeEl('span', { id: 'readoutStreamAccepted' });
  makeEl('span', { id: 'readoutStreamS' });
  makeEl('div', { id: 'eventStreamA11y', class: 'sr-only' });
  return canvas;
}

describe('initEventStream', () => {
  it('initializes without crashing', async () => {
    buildEventStreamDOM();

    const { initEventStream } = await import('../js/fig-event-stream.js');
    expect(() => initEventStream()).not.toThrow();
  });

  it('returns silently when canvas is missing', async () => {
    const { initEventStream } = await import('../js/fig-event-stream.js');
    expect(() => initEventStream()).not.toThrow();
  });

  it('updates slider label on input event', async () => {
    buildEventStreamDOM('0.50');

    const { initEventStream } = await import('../js/fig-event-stream.js');
    initEventStream();

    const slider = document.getElementById('sliderStreamBias');
    const label = document.getElementById('valStreamBias');

    slider.value = '0.30';
    slider.dispatchEvent(new Event('input'));

    expect(label.textContent).toBe('0.30');
  });

  it('updates a11y description on slider input', async () => {
    buildEventStreamDOM('0.50');

    const { initEventStream } = await import('../js/fig-event-stream.js');
    initEventStream();

    const slider = document.getElementById('sliderStreamBias');
    const a11y = document.getElementById('eventStreamA11y');

    slider.value = '0.25';
    slider.dispatchEvent(new Event('input'));

    expect(a11y.textContent).toContain('rho: 0.25');
    expect(a11y.textContent).toContain('S: 3.500');
    expect(a11y.textContent).toContain('62.5%');
  });

  it('uses postS and acceptRate formulas consistent with demo-postselect', async () => {
    // postS(0.5) = 2 + 2*(1-0.5) = 3, acceptRate(0.5) = 0.5 + 0.25 = 0.75
    buildEventStreamDOM('0.50');

    const { initEventStream } = await import('../js/fig-event-stream.js');
    initEventStream();

    const slider = document.getElementById('sliderStreamBias');
    const a11y = document.getElementById('eventStreamA11y');

    slider.value = '0.50';
    slider.dispatchEvent(new Event('input'));

    expect(a11y.textContent).toContain('S: 3.000');
    expect(a11y.textContent).toContain('75.0%');
  });
});
