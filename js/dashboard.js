import { copyText, emitMetric } from './animation-config.js';

const HISTORY_LIMIT = 30;
const histories = new Map();
const latestByDemo = new Map();

const DEMO_ORDER = ['angle', 'efficiency', 'postselect', 'eventstream'];
const DEMO_LABELS = {
  angle: 'Angle sweep',
  efficiency: 'Efficiency threshold',
  postselect: 'Post-selection gauge',
  eventstream: 'Event stream',
};

function formatNumber(value, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : '--';
}

function formatPercent(value, digits = 1) {
  return Number.isFinite(value) ? (value * 100).toFixed(digits) + '%' : '--';
}

function collectSeries(demos, projector) {
  const points = [];

  demos.forEach((demo) => {
    const entries = histories.get(demo) || [];
    entries.forEach((entry) => {
      const value = projector(entry);
      if (Number.isFinite(value)) {
        points.push({ timestamp: entry.timestamp, value });
      }
    });
  });

  points.sort((left, right) => left.timestamp - right.timestamp);
  return points.slice(-HISTORY_LIMIT);
}

function pickLatestEntry(demos, field) {
  let newest = null;

  demos.forEach((demo) => {
    const entry = latestByDemo.get(demo);
    if (!entry || !Number.isFinite(entry[field])) return;
    if (!newest || entry.timestamp > newest.timestamp) {
      newest = { ...entry, demo };
    }
  });

  return newest;
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function createSvgElement(tag, attrs = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

function readColorToken(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function renderChart(svg, points, options) {
  if (!svg) return;

  clearNode(svg);

  const width = 320;
  const height = 120;
  const padX = 14;
  const padY = 16;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;

  const background = createSvgElement('rect', {
    x: '0',
    y: '0',
    width: String(width),
    height: String(height),
    rx: '10',
    fill: 'rgba(255,255,255,0.02)',
  });
  svg.appendChild(background);

  if (!points.length) {
    const label = createSvgElement('text', {
      x: String(width / 2),
      y: String(height / 2 + 4),
      'text-anchor': 'middle',
      fill: readColorToken('--text-muted', '#9A9485'),
      'font-size': '12',
      'font-family': 'JetBrains Mono, monospace',
    });
    label.textContent = 'Waiting for interaction';
    svg.appendChild(label);
    return;
  }

  const values = points.map((point) => point.value);
  const min = options.min !== undefined ? options.min : Math.min(...values);
  const max = options.max !== undefined ? options.max : Math.max(...values);
  const range = max - min || 1;

  const baseline = createSvgElement('line', {
    x1: String(padX),
    y1: String(height - padY),
    x2: String(width - padX),
    y2: String(height - padY),
    stroke: 'rgba(255,255,255,0.08)',
    'stroke-width': '1',
  });
  svg.appendChild(baseline);

  let pathData = '';
  points.forEach((point, index) => {
    const x = padX + (innerWidth * index) / Math.max(points.length - 1, 1);
    const y = padY + innerHeight - ((point.value - min) / range) * innerHeight;
    pathData += (index === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  });

  const path = createSvgElement('path', {
    d: pathData,
    fill: 'none',
    stroke: options.stroke,
    'stroke-width': '3',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.appendChild(path);

  const latest = points[points.length - 1];
  const latestX = padX + (innerWidth * (points.length - 1)) / Math.max(points.length - 1, 1);
  const latestY = padY + innerHeight - ((latest.value - min) / range) * innerHeight;
  const marker = createSvgElement('circle', {
    cx: latestX.toFixed(1),
    cy: latestY.toFixed(1),
    r: '4.5',
    fill: options.stroke,
  });
  svg.appendChild(marker);
}

function interpretationForDemo(demo, entry) {
  if (!entry) return 'Waiting for demo state.';

  if (demo === 'angle') {
    if (Number.isFinite(entry.s) && Number.isFinite(entry.sClassical) && entry.s > 2 && entry.sClassical <= 2.01) {
      return 'Quantum span exceeds the classical ceiling, but threshold diagnostics still matter.';
    }
    return 'Angle sweep is showing the baseline comparison between quantum and classical bounds.';
  }

  if (demo === 'efficiency') {
    if (Number.isFinite(entry.eta) && Number.isFinite(entry.etaCrit) && entry.eta < entry.etaCrit) {
      return 'Below the detector threshold: this S range remains classically admissible.';
    }
    return 'At or above the detector threshold: loophole pressure is reduced.';
  }

  if (demo === 'postselect') {
    if (Number.isFinite(entry.s) && Number.isFinite(entry.accept) && entry.s > 2 && entry.accept < 0.8285) {
      return 'Outcome-dependent filtering can inflate S while acceptance stays sub-threshold.';
    }
    return 'Post-selection is currently not producing the strongest loophole signature.';
  }

  if (demo === 'eventstream') {
    if (Number.isFinite(entry.s) && Number.isFinite(entry.accept) && entry.s > 2 && entry.accept < 0.8285) {
      return 'The stream view is reproducing the same artifact pattern in time order.';
    }
    return 'The stream view is currently showing a less suspect selection regime.';
  }

  return 'Waiting for demo state.';
}

function valuesForDemo(demo, entry) {
  if (!entry) return '--';

  if (demo === 'angle') {
    return 'S_q = ' + formatNumber(entry.s) + ', S_c = ' + formatNumber(entry.sClassical);
  }
  if (demo === 'efficiency') {
    return 'eta = ' + formatPercent(entry.eta, 0) + ', LHV max = ' + formatNumber(entry.sLhvMax);
  }
  if (demo === 'postselect') {
    return 'S = ' + formatNumber(entry.s) + ', accept = ' + formatPercent(entry.accept);
  }
  if (demo === 'eventstream') {
    return 'S = ' + formatNumber(entry.s) + ', accept = ' + formatPercent(entry.accept) + ', rho = ' + formatNumber(entry.rho, 2);
  }

  return '--';
}

function buildPermalink() {
  const params = new URLSearchParams();
  params.set('fig', 'share');

  document.querySelectorAll('input[type="range"]').forEach((slider) => {
    if (slider.id) params.set(slider.id, slider.value);
  });

  return window.location.origin + window.location.pathname + '?' + params.toString();
}

function buildShareText() {
  const currentS = pickLatestEntry(['angle', 'postselect', 'eventstream'], 's');
  const angle = latestByDemo.get('angle');
  const efficiency = latestByDemo.get('efficiency');
  const postselect = latestByDemo.get('postselect');
  const eventstream = latestByDemo.get('eventstream');

  const lines = [
    'CHSH Lab snapshot',
    'Three numbers decide the case: classical S = 2.001, post-selected S = 3.716, Wang et al. report S = 2.275 at eta ~ 1e-18.',
    currentS ? 'Current S (' + DEMO_LABELS[currentS.demo] + '): ' + formatNumber(currentS.s) : 'Current S: --',
    angle ? 'Angle demo: S_q = ' + formatNumber(angle.s) + ', S_c = ' + formatNumber(angle.sClassical) : 'Angle demo: --',
    efficiency ? 'Efficiency demo: eta = ' + formatPercent(efficiency.eta, 0) + ', LHV max = ' + formatNumber(efficiency.sLhvMax) : 'Efficiency demo: --',
    postselect ? 'Post-selection demo: S = ' + formatNumber(postselect.s) + ', accept = ' + formatPercent(postselect.accept) : 'Post-selection demo: --',
    eventstream ? 'Event stream: S = ' + formatNumber(eventstream.s) + ', accept = ' + formatPercent(eventstream.accept) : 'Event stream: --',
    'Permalink: ' + buildPermalink(),
  ];

  return lines.join('\n');
}

function setButtonFeedback(button, label) {
  const original = button.dataset.label || button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

export function initDashboard() {
  const dashboard = document.getElementById('labDashboard');
  if (!dashboard) return;

  const chartColors = {
    s: readColorToken('--chart-s-stroke', '#C94040'),
    lhv: readColorToken('--chart-lhv-stroke', '#C9A94D'),
    accept: readColorToken('--chart-accept-stroke', '#6B8F71'),
  };

  const kpiCards = new Map();
  dashboard.querySelectorAll('[data-kpi]').forEach((card) => {
    kpiCards.set(card.dataset.kpi, {
      value: card.querySelector('.dashboard-kpi__value'),
      note: card.querySelector('.dashboard-kpi__note'),
    });
  });

  const charts = {
    s: dashboard.querySelector('[data-chart="s"]'),
    lhv: dashboard.querySelector('[data-chart="lhv"]'),
    accept: dashboard.querySelector('[data-chart="accept"]'),
  };
  const chartNotes = {
    s: dashboard.querySelector('[data-chart-note="s"]'),
    lhv: dashboard.querySelector('[data-chart-note="lhv"]'),
    accept: dashboard.querySelector('[data-chart-note="accept"]'),
  };

  const rowsTarget = dashboard.querySelector('[data-dashboard-rows]');
  const shareText = document.getElementById('shareSnapshotText');
  const shareSummaryBtn = document.getElementById('shareSummaryBtn');
  const shareLinkBtn = document.getElementById('shareLinkBtn');

  function updateKpis() {
    const currentS = pickLatestEntry(['angle', 'postselect', 'eventstream'], 's');
    const angle = latestByDemo.get('angle');
    const efficiency = latestByDemo.get('efficiency');
    const acceptance = pickLatestEntry(['postselect', 'eventstream'], 'accept');

    const currentCard = kpiCards.get('current-s');
    if (currentCard) {
      currentCard.value.textContent = currentS ? formatNumber(currentS.s) : '--';
      currentCard.note.textContent = currentS ? DEMO_LABELS[currentS.demo] : 'Waiting for demo state';
    }

    const classicalCard = kpiCards.get('classical-s');
    if (classicalCard) {
      classicalCard.value.textContent = angle ? formatNumber(angle.sClassical) : '--';
      classicalCard.note.textContent = angle ? 'Angle sweep baseline' : 'Angle demo not sampled yet';
    }

    const lhvCard = kpiCards.get('lhv-max');
    if (lhvCard) {
      lhvCard.value.textContent = efficiency ? formatNumber(efficiency.sLhvMax) : '--';
      lhvCard.note.textContent = efficiency ? 'At eta = ' + formatPercent(efficiency.eta, 0) : 'Efficiency demo not sampled yet';
    }

    const acceptanceCard = kpiCards.get('acceptance');
    if (acceptanceCard) {
      acceptanceCard.value.textContent = acceptance ? formatPercent(acceptance.accept) : '--';
      acceptanceCard.note.textContent = acceptance ? DEMO_LABELS[acceptance.demo] : 'No acceptance signal yet';
    }

    const efficiencyCard = kpiCards.get('efficiency');
    if (efficiencyCard) {
      efficiencyCard.value.textContent = efficiency ? formatPercent(efficiency.eta, 0) : '--';
      efficiencyCard.note.textContent = efficiency ? 'Critical eta_c = ' + formatPercent(efficiency.etaCrit, 1) : 'Efficiency demo not sampled yet';
    }
  }

  function updateCharts() {
    const sSeries = collectSeries(['angle', 'postselect', 'eventstream'], (entry) => entry.s);
    const lhvSeries = collectSeries(['efficiency'], (entry) => entry.sLhvMax);
    const acceptSeries = collectSeries(['postselect', 'eventstream'], (entry) => Number.isFinite(entry.accept) ? entry.accept * 100 : NaN);

    if (chartNotes.s) {
      chartNotes.s.textContent = sSeries.length ? 'Latest ' + formatNumber(sSeries[sSeries.length - 1].value) : 'No samples yet';
    }
    if (chartNotes.lhv) {
      chartNotes.lhv.textContent = lhvSeries.length ? 'Latest ' + formatNumber(lhvSeries[lhvSeries.length - 1].value) : 'No samples yet';
    }
    if (chartNotes.accept) {
      chartNotes.accept.textContent = acceptSeries.length ? 'Latest ' + acceptSeries[acceptSeries.length - 1].value.toFixed(1) + '%' : 'No samples yet';
    }

    renderChart(charts.s, sSeries, { stroke: chartColors.s, min: 0, max: 4 });
    renderChart(charts.lhv, lhvSeries, { stroke: chartColors.lhv, min: 2, max: 6 });
    renderChart(charts.accept, acceptSeries, { stroke: chartColors.accept, min: 50, max: 100 });
  }

  function updateTable() {
    if (!rowsTarget) return;
    clearNode(rowsTarget);

    DEMO_ORDER.forEach((demo) => {
      const entry = latestByDemo.get(demo);
      const row = document.createElement('tr');

      const demoCell = document.createElement('th');
      demoCell.setAttribute('scope', 'row');
      demoCell.textContent = DEMO_LABELS[demo];

      const valuesCell = document.createElement('td');
      valuesCell.textContent = valuesForDemo(demo, entry);

      const noteCell = document.createElement('td');
      noteCell.textContent = interpretationForDemo(demo, entry);

      row.appendChild(demoCell);
      row.appendChild(valuesCell);
      row.appendChild(noteCell);
      rowsTarget.appendChild(row);
    });
  }

  function updateSharePreview() {
    if (shareText) {
      shareText.textContent = buildShareText();
    }
  }

  function renderAll() {
    updateKpis();
    updateCharts();
    updateTable();
    updateSharePreview();
  }

  function onState(event) {
    const detail = event.detail;
    if (!detail || !detail.demo) return;

    const snapshot = { ...detail, timestamp: Date.now() };
    const history = histories.get(detail.demo) || [];
    history.push(snapshot);
    if (history.length > HISTORY_LIMIT) history.shift();
    histories.set(detail.demo, history);
    latestByDemo.set(detail.demo, snapshot);
    renderAll();
  }

  document.addEventListener('chshlab:state', onState);
  renderAll();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      emitMetric('dashboard_viewed', { source: 'lab-dashboard', fig: 'lab-dashboard' });
      observer.disconnect();
    });
  }, { threshold: 0.35 });
  observer.observe(document.getElementById('lab-dashboard'));

  if (shareSummaryBtn) {
    shareSummaryBtn.dataset.label = shareSummaryBtn.textContent;
    shareSummaryBtn.addEventListener('click', () => {
      copyText(buildShareText()).then(() => {
        emitMetric('share_clicked', { source: 'conclusion-share', fig: 'share' });
        setButtonFeedback(shareSummaryBtn, 'Copied');
      }).catch(() => {
        setButtonFeedback(shareSummaryBtn, 'Copy failed');
      });
    });
  }

  if (shareLinkBtn) {
    shareLinkBtn.dataset.label = shareLinkBtn.textContent;
    shareLinkBtn.addEventListener('click', () => {
      copyText(buildPermalink()).then(() => {
        emitMetric('share_clicked', { source: 'conclusion-share', fig: 'share' });
        setButtonFeedback(shareLinkBtn, 'Copied');
      }).catch(() => {
        setButtonFeedback(shareLinkBtn, 'Copy failed');
      });
    });
  }
}
