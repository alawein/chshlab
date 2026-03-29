// tests/animation-config.test.js
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cleanDOM, waitForEvent } from './setup.js';
import {
  emitState,
  emitMetric,
  copyText,
  MICRO,
  getAssumptions,
  setAssumption,
  stateToParams,
  paramsToState,
  prefersReducedMotion,
  initMicroInteractions,
} from '../js/animation-config.js';

afterEach(() => cleanDOM());

// ── Event bus ──

describe('emitState', () => {
  it('dispatches chshlab:state CustomEvent with detail', async () => {
    const promise = waitForEvent('chshlab:state');
    emitState({ demo: 'angle', s: 2.828 });
    const detail = await promise;
    expect(detail.demo).toBe('angle');
    expect(detail.s).toBe(2.828);
  });

  it('handles empty detail object', async () => {
    const promise = waitForEvent('chshlab:state');
    emitState({});
    const detail = await promise;
    expect(detail).toEqual({});
  });
});

describe('emitMetric', () => {
  it('dispatches chshlab:metric with name, source, fig, and timestamp', async () => {
    const promise = waitForEvent('chshlab:metric');
    emitMetric('dashboard_viewed', { source: 'lab-dashboard', fig: 'lab-dashboard' });
    const detail = await promise;
    expect(detail.name).toBe('dashboard_viewed');
    expect(detail.source).toBe('lab-dashboard');
    expect(detail.fig).toBe('lab-dashboard');
    expect(detail.timestamp).toBeTruthy();
    // Verify ISO timestamp format
    expect(new Date(detail.timestamp).toISOString()).toBe(detail.timestamp);
  });

  it('handles missing options gracefully', async () => {
    const promise = waitForEvent('chshlab:metric');
    emitMetric('test_metric');
    const detail = await promise;
    expect(detail.name).toBe('test_metric');
    expect(detail.source).toBeUndefined();
    expect(detail.fig).toBeUndefined();
  });
});

// ── Clipboard ──

describe('copyText', () => {
  it('uses navigator.clipboard.writeText when available', async () => {
    await copyText('hello world');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world');
  });

  it('falls back to execCommand when clipboard API fails', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('denied'));
    document.execCommand = vi.fn(() => true);
    await copyText('fallback text');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});

// ── Micro-interaction presets ──

describe('MICRO', () => {
  it('has all five preset keys', () => {
    expect(Object.keys(MICRO)).toEqual([
      'cardLift', 'buttonPress', 'valueFlash', 'drawerOpen', 'tooltipAppear',
    ]);
  });

  it('buttonPress has yoyo and repeat for snap-back', () => {
    expect(MICRO.buttonPress.yoyo).toBe(true);
    expect(MICRO.buttonPress.repeat).toBe(1);
  });
});

// ── Assumptions state ──

describe('getAssumptions / setAssumption', () => {
  it('returns default assumptions', () => {
    const a = getAssumptions();
    expect(a.fairSampling).toBe(true);
    expect(a.highEfficiency).toBe(true);
    expect(a.noPostSelection).toBe(true);
  });

  it('returns a copy — mutations do not leak', () => {
    const a = getAssumptions();
    a.fairSampling = false;
    expect(getAssumptions().fairSampling).toBe(true);
  });

  it('setAssumption updates state and dispatches event', async () => {
    const promise = waitForEvent('chshlab:assumptions');
    setAssumption('fairSampling', false);
    const detail = await promise;
    expect(detail.fairSampling).toBe(false);
    expect(detail.changed).toBe('fairSampling');
    expect(getAssumptions().fairSampling).toBe(false);

    // Restore for other tests
    setAssumption('fairSampling', true);
  });

  it('ignores unknown assumption keys', () => {
    setAssumption('unknownKey', true);
    expect(getAssumptions()).not.toHaveProperty('unknownKey');
  });
});

// ── Permalink state serialization ──

describe('stateToParams', () => {
  it('serializes object to query string', () => {
    const result = stateToParams({ a: 45, b: 90, demo: 'angle' });
    const params = new URLSearchParams(result);
    expect(params.get('a')).toBe('45');
    expect(params.get('b')).toBe('90');
    expect(params.get('demo')).toBe('angle');
  });

  it('omits null and undefined values', () => {
    const result = stateToParams({ a: 45, b: null, c: undefined });
    const params = new URLSearchParams(result);
    expect(params.has('a')).toBe(true);
    expect(params.has('b')).toBe(false);
    expect(params.has('c')).toBe(false);
  });

  it('returns empty string for empty object', () => {
    expect(stateToParams({})).toBe('');
  });
});

describe('paramsToState', () => {
  it('parses numeric values from URL search params', () => {
    // jsdom allows setting location.search
    const url = new URL('http://localhost/?a=45&b=90.5&demo=angle');
    Object.defineProperty(window, 'location', {
      value: url,
      writable: true,
    });
    const state = paramsToState();
    expect(state.a).toBe(45);
    expect(state.b).toBe(90.5);
    expect(state.demo).toBe('angle');
  });

  it('returns empty object when no params', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/'),
      writable: true,
    });
    expect(paramsToState()).toEqual({});
  });
});

// ── prefersReducedMotion ──

describe('prefersReducedMotion', () => {
  it('is a boolean', () => {
    expect(typeof prefersReducedMotion).toBe('boolean');
  });
});

// ── initMicroInteractions ──

describe('initMicroInteractions', () => {
  it('returns without error when gsap is undefined', () => {
    expect(() => initMicroInteractions()).not.toThrow();
  });
});
