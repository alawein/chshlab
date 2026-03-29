// tests/katex-render.test.js
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';
import { renderKatexDisplays } from '../js/katex-render.js';

beforeEach(() => cleanDOM());
afterEach(() => {
  cleanDOM();
  delete globalThis.katex;
});

describe('renderKatexDisplays', () => {
  it('returns silently when katex is undefined', () => {
    const el = makeEl('div', { class: 'math-display', 'data-latex': 'E = mc^2' });
    expect(() => renderKatexDisplays()).not.toThrow();
  });

  it('calls katex.render for each .math-display element', () => {
    globalThis.katex = { render: vi.fn() };

    const el1 = makeEl('div', { class: 'math-display', 'data-latex': 'S = 2\\sqrt{2}' });
    const el2 = makeEl('div', { class: 'math-display', 'data-latex': '\\eta_c' });

    renderKatexDisplays();

    expect(katex.render).toHaveBeenCalledTimes(2);
    expect(katex.render).toHaveBeenCalledWith('S = 2\\sqrt{2}', el1, {
      displayMode: true,
      throwOnError: false,
    });
    expect(katex.render).toHaveBeenCalledWith('\\eta_c', el2, {
      displayMode: true,
      throwOnError: false,
    });
  });

  it('skips elements without data-latex attribute', () => {
    globalThis.katex = { render: vi.fn() };

    makeEl('div', { class: 'math-display' }); // No data-latex
    makeEl('div', { class: 'math-display', 'data-latex': 'x^2' });

    renderKatexDisplays();

    expect(katex.render).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom root element', () => {
    globalThis.katex = { render: vi.fn() };

    const container = makeEl('div', {});
    const el = makeEl('div', { class: 'math-display', 'data-latex': 'a + b' }, container);

    // Also add one outside the container
    makeEl('div', { class: 'math-display', 'data-latex': 'c + d' });

    renderKatexDisplays(container);

    // Should only render the one inside container
    expect(katex.render).toHaveBeenCalledTimes(1);
    expect(katex.render).toHaveBeenCalledWith('a + b', el, expect.any(Object));
  });
});
