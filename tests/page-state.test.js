// tests/page-state.test.js
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';
import {
  enhanceSliderA11y,
  initDemoExport,
  restoreFromPermalink,
  initReadoutTick,
} from '../js/page-state.js';

beforeEach(() => cleanDOM());
afterEach(() => cleanDOM());

describe('enhanceSliderA11y', () => {
  it('sets aria-valuemin, aria-valuemax, aria-valuenow on range inputs', () => {
    const slider = makeEl('input', { type: 'range', min: '0', max: '100', value: '50' });

    enhanceSliderA11y();

    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
    expect(slider.getAttribute('aria-valuenow')).toBe('50');
  });

  it('updates aria-valuenow on input event', () => {
    const slider = makeEl('input', { type: 'range', min: '0', max: '100', value: '50' });

    enhanceSliderA11y();

    slider.value = '75';
    slider.dispatchEvent(new Event('input'));

    expect(slider.getAttribute('aria-valuenow')).toBe('75');
  });

  it('derives aria-label from nearby label element', () => {
    const row = makeEl('div', { class: 'demo-slider-row' });
    const label = makeEl('label', {}, row);
    label.textContent = 'Angle A: 45';
    const slider = makeEl('input', { type: 'range', min: '0', max: '360', value: '45' }, row);

    enhanceSliderA11y();

    expect(slider.getAttribute('aria-label')).toBe('Angle A');
  });

  it('does not overwrite existing aria-label', () => {
    const slider = makeEl('input', {
      type: 'range',
      min: '0',
      max: '100',
      value: '50',
      'aria-label': 'Custom Label',
    });

    enhanceSliderA11y();

    expect(slider.getAttribute('aria-label')).toBe('Custom Label');
  });
});

describe('initDemoExport', () => {
  it('adds export and copy link buttons to figure panels', () => {
    const panel = makeEl('div', { class: 'figure-interactive', id: 'demo-angle' });
    const controls = makeEl('div', { class: 'figure-controls' }, panel);
    makeEl('input', { type: 'range', id: 'sliderA', value: '45' }, panel);

    initDemoExport();

    const buttons = panel.querySelectorAll('.demo-export-btn');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent).toBe('Export JSON');
    expect(buttons[1].textContent).toBe('Copy Link');
    expect(buttons[2].textContent).toBe('Share');
  });

  it('Export JSON button triggers a download', () => {
    const panel = makeEl('div', { class: 'figure-interactive', id: 'demo-angle' });
    const controls = makeEl('div', { class: 'figure-controls' }, panel);
    const slider = makeEl('input', { type: 'range', id: 'sliderA', value: '45' }, panel);
    const readout = makeEl('span', { class: 'readout-value', id: 'readoutQ' }, panel);
    readout.textContent = '2.828';

    initDemoExport();

    const exportBtn = panel.querySelectorAll('.demo-export-btn')[0];
    // Clicking should create a blob URL and trigger download
    exportBtn.click();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('Copy Link button copies permalink to clipboard', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://chshlab.online', pathname: '/' },
      writable: true,
    });

    const panel = makeEl('div', { class: 'figure-interactive', id: 'demo-angle' });
    const controls = makeEl('div', { class: 'figure-controls' }, panel);
    makeEl('input', { type: 'range', id: 'sliderA', value: '45' }, panel);

    initDemoExport();

    const linkBtn = panel.querySelectorAll('.demo-export-btn')[1];
    linkBtn.click();

    // Should have called copyText which calls clipboard.writeText
    await vi.waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const copiedUrl = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedUrl).toContain('fig=demo-angle');
    expect(copiedUrl).toContain('sliderA=45');
  });

  it('Copy Link button shows "Copied!" feedback temporarily', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://chshlab.online', pathname: '/' },
      writable: true,
    });

    const panel = makeEl('div', { class: 'figure-interactive', id: 'demo-angle' });
    const controls = makeEl('div', { class: 'figure-controls' }, panel);

    initDemoExport();

    const linkBtn = panel.querySelectorAll('.demo-export-btn')[1];
    linkBtn.click();

    await vi.waitFor(() => {
      expect(linkBtn.textContent).toBe('Copied!');
    });
  });

  it('does nothing when no figure-interactive panels exist', () => {
    expect(() => initDemoExport()).not.toThrow();
  });

  it('skips panels without .figure-controls child', () => {
    makeEl('div', { class: 'figure-interactive', id: 'no-controls' });

    initDemoExport();

    const buttons = document.querySelectorAll('.demo-export-btn');
    expect(buttons.length).toBe(0);
  });
});

describe('restoreFromPermalink', () => {
  it('restores slider values from URL params', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?fig=demo-angle&sliderA=90&sliderB=180'),
      writable: true,
    });

    const sliderA = makeEl('input', { type: 'range', id: 'sliderA', min: '0', max: '360', value: '0' });
    const sliderB = makeEl('input', { type: 'range', id: 'sliderB', min: '0', max: '360', value: '0' });
    const inputSpy = vi.fn();
    sliderA.addEventListener('input', inputSpy);

    restoreFromPermalink();

    expect(sliderA.value).toBe('90');
    expect(sliderB.value).toBe('180');
    expect(inputSpy).toHaveBeenCalled();
  });

  it('does nothing when no fig param is present', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/'),
      writable: true,
    });

    const slider = makeEl('input', { type: 'range', id: 'sliderA', min: '0', max: '360', value: '45' });
    restoreFromPermalink();
    expect(slider.value).toBe('45');
  });

  it('skips non-range elements even if ID matches a param', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?fig=demo&notSlider=99'),
      writable: true,
    });

    const div = makeEl('div', { id: 'notSlider' });
    div.textContent = 'original';

    restoreFromPermalink();

    expect(div.textContent).toBe('original');
  });

  it('skips the fig param itself when restoring sliders', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?fig=demo-angle&sliderA=90'),
      writable: true,
    });

    // Even if there's an element with id="fig" and type="range", it should be skipped
    const figSlider = makeEl('input', { type: 'range', id: 'fig', min: '0', max: '10', value: '0' });
    const sliderA = makeEl('input', { type: 'range', id: 'sliderA', min: '0', max: '360', value: '0' });

    restoreFromPermalink();

    expect(figSlider.value).toBe('0'); // unchanged
    expect(sliderA.value).toBe('90');
  });
});

describe('initReadoutTick', () => {
  it('does not throw when no .readout-value elements exist', () => {
    expect(() => initReadoutTick()).not.toThrow();
  });

  it('sets up mutation observers on readout elements', () => {
    const readout = makeEl('span', { class: 'readout-value' });
    readout.textContent = '2.000';

    initReadoutTick();

    // MutationObserver should be set up without error
    // We can verify the element exists and class can be toggled
    expect(readout.classList.contains('tick')).toBe(false);
  });
});
