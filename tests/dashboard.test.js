// tests/dashboard.test.js
// Integration test: verifies the dashboard aggregates chshlab:state events correctly.
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';

beforeEach(() => cleanDOM());
afterEach(() => cleanDOM());

function buildDashboardDOM() {
  const dashboard = makeEl('div', { id: 'labDashboard' });

  // KPI cards
  const kpis = ['current-s', 'classical-s', 'lhv-max', 'acceptance', 'efficiency'];
  kpis.forEach((kpi) => {
    const card = makeEl('div', { 'data-kpi': kpi }, dashboard);
    makeEl('span', { class: 'dashboard-kpi__value' }, card);
    makeEl('span', { class: 'dashboard-kpi__note' }, card);
  });

  // Charts
  ['s', 'lhv', 'accept'].forEach((key) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-chart', key);
    dashboard.appendChild(svg);
    makeEl('span', { 'data-chart-note': key }, dashboard);
  });

  // Table rows target
  makeEl('tbody', { 'data-dashboard-rows': '' }, dashboard);

  // Share elements
  makeEl('pre', { id: 'shareSnapshotText' }, dashboard);
  const summaryBtn = makeEl('button', { id: 'shareSummaryBtn' }, dashboard);
  summaryBtn.textContent = 'Copy Summary';
  summaryBtn.dataset.label = 'Copy Summary';
  const linkBtn = makeEl('button', { id: 'shareLinkBtn' }, dashboard);
  linkBtn.textContent = 'Copy Link';
  linkBtn.dataset.label = 'Copy Link';

  // Section element for IntersectionObserver
  makeEl('section', { id: 'lab-dashboard' });

  return dashboard;
}

function emitDemoState(detail) {
  document.dispatchEvent(new CustomEvent('chshlab:state', { detail }));
}

describe('initDashboard', () => {
  it('renders initial table rows for all 4 demo slots', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    const rows = document.querySelectorAll('[data-dashboard-rows] tr');
    expect(rows.length).toBe(4);
  });

  it('shows "Waiting" state in KPI cards before any events', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    const currentS = document.querySelector('[data-kpi="current-s"] .dashboard-kpi__value');
    expect(currentS.textContent).toBe('--');
  });

  it('updates KPI cards after receiving angle demo state', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    emitDemoState({ demo: 'angle', s: 2.828, sClassical: 1.998 });

    const currentS = document.querySelector('[data-kpi="current-s"] .dashboard-kpi__value');
    expect(currentS.textContent).toBe('2.828');

    const classicalS = document.querySelector('[data-kpi="classical-s"] .dashboard-kpi__value');
    expect(classicalS.textContent).toBe('1.998');
  });

  it('updates efficiency KPI after receiving efficiency state', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    emitDemoState({ demo: 'efficiency', eta: 0.83, sLhvMax: 2.819, etaCrit: 0.8284 });

    const lhvMax = document.querySelector('[data-kpi="lhv-max"] .dashboard-kpi__value');
    expect(lhvMax.textContent).toBe('2.819');

    const efficiency = document.querySelector('[data-kpi="efficiency"] .dashboard-kpi__value');
    expect(efficiency.textContent).toBe('83%');
  });

  it('updates acceptance KPI after receiving postselect state', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    emitDemoState({ demo: 'postselect', s: 3.0, accept: 0.75, p: 0.5 });

    const acceptance = document.querySelector('[data-kpi="acceptance"] .dashboard-kpi__value');
    expect(acceptance.textContent).toBe('75.0%');
  });

  it('renders SVG chart elements after receiving data', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    // Send multiple data points for chart rendering
    emitDemoState({ demo: 'angle', s: 2.5, sClassical: 1.8 });
    emitDemoState({ demo: 'angle', s: 2.7, sClassical: 1.9 });
    emitDemoState({ demo: 'angle', s: 2.828, sClassical: 1.998 });

    const chartSvg = document.querySelector('[data-chart="s"]');
    // Should have SVG children (rect, lines, paths, circles)
    expect(chartSvg.children.length).toBeGreaterThan(3);
  });

  it('updates table rows with demo interpretations', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    emitDemoState({ demo: 'angle', s: 2.828, sClassical: 1.998 });

    const rows = document.querySelectorAll('[data-dashboard-rows] tr');
    const angleRow = rows[0]; // angle is first in DEMO_ORDER
    const cells = angleRow.querySelectorAll('td');
    expect(cells[0].textContent).toContain('S_q = 2.828');
    expect(cells[1].textContent).toContain('Quantum span exceeds');
  });

  it('does not crash on events without demo field', async () => {
    buildDashboardDOM();

    const { initDashboard } = await import('../js/dashboard.js');
    initDashboard();

    // Should not throw on malformed events — the guard `if (!detail.demo) return` skips them
    expect(() => emitDemoState({})).not.toThrow();
    expect(() => emitDemoState({ s: 2.5 })).not.toThrow();
  });

  it('returns silently when #labDashboard is missing', async () => {
    const { initDashboard } = await import('../js/dashboard.js');
    expect(() => initDashboard()).not.toThrow();
  });
});
