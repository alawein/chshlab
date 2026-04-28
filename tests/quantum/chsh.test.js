import { describe, it, expect } from 'vitest';
import {
  eQuantum,
  eClassical,
  chshS,
  CLASSICAL_BOUND,
  TSIRELSON,
} from '../../js/quantum/chsh.js';

describe('eQuantum', () => {
  it('is 0 when angles are orthogonal (diff = pi/2)', () => {
    expect(eQuantum(0, Math.PI / 2)).toBeCloseTo(0, 12);
  });

  it('is -1 when angles coincide (diff = 0)', () => {
    expect(eQuantum(Math.PI / 3, Math.PI / 3)).toBeCloseTo(-1, 12);
  });

  it('is +1 when angles are anti-parallel (diff = pi)', () => {
    expect(eQuantum(0, Math.PI)).toBeCloseTo(1, 12);
  });
});

describe('eClassical', () => {
  it('is -1 at diff = 0 (parallel settings)', () => {
    expect(eClassical(0, 0)).toBeCloseTo(-1, 12);
  });

  it('is 0 at diff = pi/2 (orthogonal)', () => {
    expect(eClassical(0, Math.PI / 2)).toBeCloseTo(0, 12);
  });

  it('reflects through pi/2 so diff = pi yields -1 again', () => {
    expect(eClassical(0, Math.PI)).toBeCloseTo(-1, 12);
  });
});

describe('chshS — CHSH S-value mathematical edge cases', () => {
  it('saturates the Tsirelson bound 2*sqrt(2) at the optimal angle quartet', () => {
    const a = 0;
    const ap = Math.PI / 2;
    const b = Math.PI / 4;
    const bp = 3 * Math.PI / 4;
    const S = chshS(
      eQuantum(a, b),
      eQuantum(a, bp),
      eQuantum(ap, b),
      eQuantum(ap, bp),
    );
    expect(S).toBeCloseTo(TSIRELSON, 10);
  });

  it('saturates the classical bound S = 2 when all four correlators coincide', () => {
    // With any single shared angle t, every E(t, t) = -1, so
    // S = |(-1) - (-1) + (-1) + (-1)| = 2.
    const t = Math.PI / 3;
    const S = chshS(eQuantum(t, t), eQuantum(t, t), eQuantum(t, t), eQuantum(t, t));
    expect(S).toBeCloseTo(CLASSICAL_BOUND, 10);
  });

  it('returns 0 when every correlator is orthogonal (E = 0)', () => {
    // Angles offset by pi/2 give eQuantum = 0, so S = 0.
    const a = 0;
    const ap = Math.PI;
    const b = Math.PI / 2;
    const bp = (3 * Math.PI) / 2;
    const S = chshS(
      eQuantum(a, b),
      eQuantum(a, bp),
      eQuantum(ap, b),
      eQuantum(ap, bp),
    );
    expect(S).toBeCloseTo(0, 10);
  });

  it('is symmetric under global rotation of all four angles', () => {
    // Adding the same offset to a, a', b, b' leaves every pairwise diff
    // unchanged, so S must be invariant.
    const phi = 0.7;
    const a = 0;
    const ap = Math.PI / 2;
    const b = Math.PI / 4;
    const bp = (3 * Math.PI) / 4;
    const S1 = chshS(eQuantum(a, b), eQuantum(a, bp), eQuantum(ap, b), eQuantum(ap, bp));
    const S2 = chshS(
      eQuantum(a + phi, b + phi),
      eQuantum(a + phi, bp + phi),
      eQuantum(ap + phi, b + phi),
      eQuantum(ap + phi, bp + phi),
    );
    expect(S2).toBeCloseTo(S1, 10);
  });
});

describe('Bounds constants', () => {
  it('CLASSICAL_BOUND is exactly 2', () => {
    expect(CLASSICAL_BOUND).toBe(2);
  });

  it('TSIRELSON is 2*sqrt(2)', () => {
    expect(TSIRELSON).toBeCloseTo(2 * Math.sqrt(2), 15);
  });
});
