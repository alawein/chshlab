// chshlab/js/main.js
// Entrypoint: KaTeX, smooth scroll, module loading, timeline, permalink restore

import { paramsToState, initMicroInteractions } from './animation-config.js';

// ── KATEX ──
function initKaTeX() {
  if (typeof katex === 'undefined') return;
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) katex.render(latex, el, { displayMode: true, throwOnError: false });
  });
}

// ── SMOOTH SCROLL ──
function initSmoothScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollToPlugin === 'undefined') return;
  gsap.registerPlugin(ScrollToPlugin);
  document.querySelectorAll('.nav__links a, .nav__logo').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) gsap.to(window, { scrollTo: { y: target, offsetY: 52 }, duration: 0.8, ease: 'power2.inOut' });
    });
  });
}

// ── READOUT TICK ──
function initReadoutTick() {
  document.querySelectorAll('.readout-value').forEach(el => {
    const observer = new MutationObserver(() => {
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 150);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  });
}

// ── SLIDER A11Y ──
function enhanceSliderA11y() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    if (!slider.getAttribute('aria-label')) {
      const label = slider.closest('.demo-slider-row')?.querySelector('label');
      if (label) slider.setAttribute('aria-label', label.textContent.replace(/:\s*\d.*$/, ''));
    }
    slider.setAttribute('aria-valuemin', slider.min);
    slider.setAttribute('aria-valuemax', slider.max);
    slider.setAttribute('aria-valuenow', slider.value);
    slider.addEventListener('input', () => slider.setAttribute('aria-valuenow', slider.value));
  });
}

// ── TIMELINE (Beat 7) ──
function initTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  const line = document.createElement('div');
  line.className = 'timeline-line';
  container.appendChild(line);

  const nodes = [
    { year: '1964', title: 'Bell', note: 'Inequality derived; all detectors assumed perfect.', status: 'established' },
    { year: '1969', title: 'CHSH', note: 'Testable form; \u03b7 issue implicit.', status: 'established' },
    { year: '1982', title: 'Aspect', note: 'First convincing test; locality loophole addressed.', status: 'established' },
    { year: '1993', title: 'Eberhard', note: '\u03b7_c \u2248 82.8% proven necessary.', status: 'established' },
    { year: '2015', title: 'Loophole-free', note: 'Delft, NIST, Vienna: high-\u03b7 + spacelike separation.', status: 'resolved' },
    { year: '2025', title: 'Wang et al.', note: 'S=2.275 claimed at \u03b7\u224810\u207b\xb9\u2078.', status: 'contested' },
    { year: '2025', title: 'This rebuttal', note: 'Post-selection artifact characterised.', status: 'resolved' },
  ];

  nodes.forEach(n => {
    const node = document.createElement('div');
    node.className = 'timeline-node reveal';

    const year = document.createElement('span');
    year.className = 'timeline-node__year';
    year.textContent = n.year;

    const title = document.createElement('span');
    title.className = 'timeline-node__title';
    title.textContent = n.title;

    const note = document.createElement('p');
    note.className = 'timeline-node__note';
    note.textContent = n.note;

    const badge = document.createElement('span');
    badge.className = 'timeline-node__badge timeline-node__badge--' + n.status;
    badge.textContent = n.status;

    node.appendChild(year);
    node.appendChild(title);
    node.appendChild(note);
    node.appendChild(badge);
    container.appendChild(node);
  });
}

// ── DEMO EXPORT (kept feature) ──
function initDemoExport() {
  document.querySelectorAll('.figure-interactive').forEach(panel => {
    const controls = panel.querySelector('.figure-controls');
    if (!controls) return;

    const wrap = document.createElement('div');
    wrap.className = 'demo-export-btns';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'demo-export-btn';
    exportBtn.textContent = 'Export JSON';
    exportBtn.addEventListener('click', () => {
      const sliders = {};
      panel.querySelectorAll('input[type="range"]').forEach(s => { sliders[s.id] = s.value; });
      const readouts = {};
      panel.querySelectorAll('.readout-value').forEach(r => { readouts[r.id] = r.textContent; });
      const blob = new Blob([JSON.stringify({ demo: panel.id, timestamp: new Date().toISOString(), sliders, readouts }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'chsh-state.json'; a.click();
      URL.revokeObjectURL(url);
    });

    const linkBtn = document.createElement('button');
    linkBtn.className = 'demo-export-btn';
    linkBtn.textContent = 'Copy Link';
    linkBtn.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.set('fig', panel.id);
      panel.querySelectorAll('input[type="range"]').forEach(s => params.set(s.id, s.value));
      const url = window.location.origin + window.location.pathname + '?' + params.toString();
      navigator.clipboard.writeText(url).then(() => {
        linkBtn.textContent = 'Copied!';
        setTimeout(() => { linkBtn.textContent = 'Copy Link'; }, 1500);
      });
    });

    wrap.appendChild(exportBtn);
    wrap.appendChild(linkBtn);
    controls.appendChild(wrap);
  });
}

// ── PERMALINK RESTORE ──
function restoreFromPermalink() {
  const state = paramsToState();
  if (!state.fig) return;
  Object.entries(state).forEach(([key, val]) => {
    if (key === 'fig') return;
    const slider = document.getElementById(key);
    if (slider && slider.type === 'range') {
      slider.value = val;
      slider.dispatchEvent(new Event('input'));
    }
  });
}

// ── KEYBOARD SHORTCUTS ──
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close any open drawers/overlays
      document.querySelectorAll('[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// ── MAIN INIT ──
window.addEventListener('load', async () => {
  if (typeof gsap !== 'undefined') {
    gsap.to(document.body, { opacity: 1, duration: 0.4, ease: 'power1.out' });
  } else {
    document.body.style.opacity = '1';
  }

  initKaTeX();
  initSmoothScroll();
  initReadoutTick();
  initTimeline();
  initDemoExport();
  enhanceSliderA11y();
  initKeyboardShortcuts();

  // Dynamic imports with error handling
  async function safeImport(path, initName) {
    try {
      const mod = await import(path);
      if (mod[initName]) mod[initName]();
    } catch (e) {
      console.warn('Module load failed:', path, e);
    }
  }

  const { initStarfield } = await import('./starfield.js').catch(() => ({ initStarfield: null }));
  if (initStarfield) initStarfield();

  const { initScroll } = await import('./scroll.js').catch(() => ({ initScroll: null }));
  if (initScroll) initScroll();

  await safeImport('./fig-bell-test.js', 'initBellTest');
  await safeImport('./fig-gauge.js', 'initGauge');
  await safeImport('./demo-efficiency.js', 'initEfficiencyDemo');
  await safeImport('./fig-event-stream.js', 'initEventStream');
  await safeImport('./demo-postselect.js', 'initPostSelectDemo');
  await safeImport('./demo-chsh.js', 'initAngleDemo');
  await safeImport('./sonification.js', 'initSonification');
  await safeImport('./references.js', 'initReferences');

  initMicroInteractions();
  restoreFromPermalink();
});
