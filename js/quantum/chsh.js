// chshlab/js/quantum/chsh.js
// Pure CHSH primitives — no DOM, no side effects. Tested at
// tests/quantum/chsh.test.js without jsdom.
//
// Previously duplicated in demo-chsh.js (eQuantum) and fig-bell-test.js (eQ),
// with S-value aggregation inlined in 3+ locations. Centralizing here
// removes the regression surface (flip a sign in one file, forget the other)
// and lets us unit-test the math directly.

/**
 * Quantum two-point correlator for a singlet-state Bell test with
 * analyzer angles theta_a and theta_b.
 *   E(a, b) = -cos(a - b)
 * Domain: any real radians. Range: [-1, 1].
 */
export function eQuantum(a, b) {
  return -Math.cos(a - b);
}

/**
 * Classical (local hidden-variable) correlator using the piecewise-linear
 * "triangle" envelope that saturates the LHV bound S_LHV = 2.
 * Input angles are in radians; only the |a - b| mod pi matters, reflected
 * through pi/2.
 */
export function eClassical(a, b) {
  let diff = Math.abs(a - b) % Math.PI;
  if (diff > Math.PI / 2) diff = Math.PI - diff;
  return -(2 / Math.PI) * (Math.PI / 2 - diff);
}

/**
 * CHSH S-value from four correlators. The canonical form is
 *   S = |E(a, b) - E(a, b') + E(a', b) + E(a', b')|
 * Classical (LHV) bound:  S <= CLASSICAL_BOUND
 * Quantum (Tsirelson):    S <= TSIRELSON
 */
export function chshS(e_ab, e_abp, e_apb, e_apbp) {
  return Math.abs(e_ab - e_abp + e_apb + e_apbp);
}

/** Classical (LHV) CHSH bound. */
export const CLASSICAL_BOUND = 2;

/** Quantum (Tsirelson) CHSH bound: 2 * sqrt(2). */
export const TSIRELSON = 2 * Math.sqrt(2);
