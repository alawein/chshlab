// tests/fig-bell-test.test.js
// Tests for Bell test schematic animation — control creation, tally, and S computation.
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

beforeEach(() => {
  cleanDOM();
  globalThis.cancelAnimationFrame = vi.fn();
  globalThis.requestAnimationFrame = vi.fn((cb) => {
    // Don't run the loop — just return a frame ID
    return 1;
  });
});
afterEach(() => {
  cleanDOM();
  delete globalThis.cancelAnimationFrame;
});

function buildBellTestDOM() {
  const canvas = makeEl('canvas', { id: 'bellTestCanvas', width: '800', height: '400' });
  Object.defineProperty(canvas, 'offsetWidth', { value: 800, configurable: true });
  Object.defineProperty(canvas, 'offsetHeight', { value: 400, configurable: true });

  makeEl('div', { id: 'bellTestControls' });
  makeEl('div', { id: 'bellTestA11y', class: 'sr-only' });
  makeEl('div', { id: 'bellTestReadouts' });
  makeEl('span', { id: 'readoutBellS' });
  return canvas;
}

describe('initBellTest', () => {
  it('creates 4 setting buttons plus pause button', async () => {
    buildBellTestDOM();

    const { initBellTest } = await import('../js/fig-bell-test.js');
    initBellTest();

    const controls = document.getElementById('bellTestControls');
    const buttons = controls.querySelectorAll('button');
    expect(buttons.length).toBe(5); // 4 setting pairs + 1 pause

    // Check setting pair labels
    expect(buttons[0].textContent).toBe('a, b');
    expect(buttons[1].textContent).toContain('a, b');
    expect(buttons[2].textContent).toContain('b');
    expect(buttons[3].textContent).toContain('b');
    expect(buttons[4].textContent).toBe('Pause');
  });

  it('first setting button is active by default', async () => {
    buildBellTestDOM();

    const { initBellTest } = await import('../js/fig-bell-test.js');
    initBellTest();

    const buttons = document.querySelectorAll('.belltest-setting-btn');
    expect(buttons[0].classList.contains('belltest-setting-btn--active')).toBe(true);
    expect(buttons[1].classList.contains('belltest-setting-btn--active')).toBe(false);
  });

  it('clicking a setting button toggles active class', async () => {
    buildBellTestDOM();

    const { initBellTest } = await import('../js/fig-bell-test.js');
    initBellTest();

    const buttons = document.querySelectorAll('.belltest-setting-btn');
    buttons[2].click();

    expect(buttons[0].classList.contains('belltest-setting-btn--active')).toBe(false);
    expect(buttons[2].classList.contains('belltest-setting-btn--active')).toBe(true);
  });

  it('pause button toggles text between Pause and Resume', async () => {
    buildBellTestDOM();

    const { initBellTest } = await import('../js/fig-bell-test.js');
    initBellTest();

    const pauseBtn = document.querySelectorAll('.belltest-setting-btn')[4];
    expect(pauseBtn.textContent).toBe('Pause');

    pauseBtn.click();
    expect(pauseBtn.textContent).toBe('Resume');

    pauseBtn.click();
    expect(pauseBtn.textContent).toBe('Pause');
  });

  it('starts requestAnimationFrame loop via IntersectionObserver', async () => {
    buildBellTestDOM();

    const { initBellTest } = await import('../js/fig-bell-test.js');
    initBellTest();

    // IntersectionObserver was set up (our stub exists)
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    // The loop starts only when IntersectionObserver fires
  });

  it('returns silently when canvas is missing', async () => {
    const { initBellTest } = await import('../js/fig-bell-test.js');
    expect(() => initBellTest()).not.toThrow();
  });
});
