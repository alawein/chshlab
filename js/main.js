// chshlab/js/main.js
// Entrypoint: KaTeX, tabs, smooth scroll, mousemove, module loading,
// Bound Explorer, assumption toggles, permalink, keyboard shortcuts

import { paramsToState, initMicroInteractions } from './animation-config.js';

// ── KATEX ──
function initKaTeX() {
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) {
      katex.render(latex, el, { displayMode: true, throwOnError: false });
    }
  });
}

// ── TABS ──
function initTabs() {
  const tabs      = document.querySelectorAll('.demo-tab');
  const panels    = document.querySelectorAll('.demo-panel');
  const indicator = document.querySelector('.demo-tabs__indicator');

  function updateIndicator(tab) {
    if (!indicator || !tab) return;
    indicator.style.left  = tab.offsetLeft + 'px';
    indicator.style.width = tab.offsetWidth + 'px';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t   => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(tab.dataset.panel);
      if (target) target.classList.add('active');
      updateIndicator(tab);
    });
  });

  const activeTab = document.querySelector('.demo-tab.active');
  if (activeTab) {
    requestAnimationFrame(() => requestAnimationFrame(() => updateIndicator(activeTab)));
  }

  window.addEventListener('resize', () => {
    const active = document.querySelector('.demo-tab.active');
    if (active) updateIndicator(active);
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
      if (target) {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 52 },
          duration: 0.8,
          ease: 'power2.inOut',
        });
      }
    });
  });
}

// ── MOUSE GLOW ──
function initMouseGlow() {
  document.querySelectorAll('.rebuttal-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
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

// ── BOUND EXPLORER PANEL ──
function initBoundExplorer() {
  const ETA_CRIT = 2 / (1 + Math.sqrt(2));

  const panel = document.createElement('aside');
  panel.id = 'bound-explorer';
  panel.className = 'bound-explorer';
  panel.setAttribute('role', 'complementary');
  panel.setAttribute('aria-label', 'Live bound comparison');

  const toggle = document.createElement('button');
  toggle.className = 'bound-explorer__toggle';
  toggle.setAttribute('aria-label', 'Toggle bound explorer panel');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Bounds';

  const content = document.createElement('div');
  content.className = 'bound-explorer__content';

  function makeRow(label, id, note) {
    const row = document.createElement('div');
    row.className = 'bound-explorer__row';

    const lbl = document.createElement('span');
    lbl.className = 'bound-explorer__label';
    lbl.textContent = label;

    const val = document.createElement('span');
    val.className = 'bound-explorer__value';
    val.id = id;
    val.textContent = '\u2014';

    const desc = document.createElement('span');
    desc.className = 'bound-explorer__note';
    desc.textContent = note;

    row.appendChild(lbl);
    row.appendChild(val);
    row.appendChild(desc);
    return row;
  }

  content.appendChild(makeRow('Classical LHV', 'be-classical', 'S \u2264 2'));
  content.appendChild(makeRow('Tsirelson', 'be-tsirelson', 'S \u2264 2\u221a2 \u2248 2.828'));
  content.appendChild(makeRow('LHV,max at \u03b7', 'be-lhv-eta', 'Exceed only if \u03b7 > 82.8%'));

  panel.appendChild(toggle);
  panel.appendChild(content);
  document.body.appendChild(panel);

  // Set static values
  const beClassical = document.getElementById('be-classical');
  const beTsirelson = document.getElementById('be-tsirelson');
  const beLhvEta = document.getElementById('be-lhv-eta');

  if (beClassical) beClassical.textContent = '2.000';
  if (beTsirelson) beTsirelson.textContent = (2 * Math.SQRT2).toFixed(3);

  // Listen for state changes from demos
  document.addEventListener('chshlab:state', (e) => {
    const d = e.detail;
    if (d.demo === 'efficiency' && beLhvEta) {
      beLhvEta.textContent = d.sLhvMax !== undefined ? d.sLhvMax.toFixed(3) : '\u2014';
      const note = panel.querySelector('#be-lhv-eta')?.parentElement?.querySelector('.bound-explorer__note');
      if (note && d.eta !== undefined) {
        note.textContent = d.eta >= ETA_CRIT
          ? 'Loophole closed at \u03b7=' + (d.eta * 100).toFixed(0) + '%'
          : 'Loophole OPEN at \u03b7=' + (d.eta * 100).toFixed(0) + '%';
      }
    }
  });

  // Toggle
  let open = false;
  toggle.addEventListener('click', () => {
    open = !open;
    panel.classList.toggle('bound-explorer--open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Keyboard: 'b' to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Don't toggle if story mode is open
      if (document.querySelector('.story-overlay--open')) return;
      e.preventDefault();
      open = !open;
      panel.classList.toggle('bound-explorer--open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }
  });

  // Initial LHV value
  if (beLhvEta) beLhvEta.textContent = (4 / 0.70 - 2).toFixed(3);
}

// ── ASSUMPTION TOGGLES ──
function initAssumptionToggles() {
  const demosSection = document.getElementById('demos');
  if (!demosSection) return;
  const container = demosSection.querySelector('.container');
  if (!container) return;

  const wrap = document.createElement('div');
  wrap.className = 'assumption-toggles reveal';

  const banner = document.createElement('div');
  banner.className = 'assumption-banner';
  banner.id = 'assumption-banner';
  banner.setAttribute('aria-live', 'polite');

  const toggles = [
    { key: 'fairSampling', label: 'Fair Sampling', onMsg: 'Fair sampling assumed', offMsg: 'Fair sampling OFF: LHV models can now reproduce any S \u2264 4' },
    { key: 'highEfficiency', label: '\u03b7 \u2265 82.8%', onMsg: 'High efficiency assumed', offMsg: '\u03b7 < 82.8%: classical-mimicry zone active' },
    { key: 'noPostSelection', label: 'No Post-Selection', onMsg: 'No post-selection bias', offMsg: 'Post-selection ON: artifact trajectory visible in demos' },
  ];

  toggles.forEach(t => {
    const row = document.createElement('label');
    row.className = 'assumption-toggle';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.setAttribute('aria-label', t.label);

    const slider = document.createElement('span');
    slider.className = 'assumption-toggle__slider';

    const text = document.createElement('span');
    text.className = 'assumption-toggle__text';
    text.textContent = t.label;

    input.addEventListener('change', () => {
      banner.textContent = input.checked ? t.onMsg : t.offMsg;
      document.dispatchEvent(new CustomEvent('chshlab:assumptions', {
        detail: { key: t.key, value: input.checked },
      }));
      // Update URL params
      updateAssumptionParams();
    });

    row.appendChild(input);
    row.appendChild(slider);
    row.appendChild(text);
    wrap.appendChild(row);
  });

  wrap.appendChild(banner);

  // Insert after the section intro
  const intro = container.querySelector('.section-intro');
  if (intro) {
    intro.after(wrap);
  }

  function updateAssumptionParams() {
    const params = new URLSearchParams(window.location.search);
    const checks = wrap.querySelectorAll('input[type="checkbox"]');
    const active = [];
    checks.forEach((cb, i) => {
      if (cb.checked) active.push(toggles[i].key);
    });
    if (active.length === 3) {
      params.delete('assumptions');
    } else {
      params.set('assumptions', active.join(','));
    }
    const qs = params.toString();
    history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
  }
}

// ── TIMELINE SECTION ──
function initTimeline() {
  const figuresSection = document.getElementById('figures');
  if (!figuresSection) return;

  const section = document.createElement('section');
  section.id = 'timeline';
  section.className = 'section section--timeline';

  const container = document.createElement('div');
  container.className = 'container container--wide';

  const label = document.createElement('p');
  label.className = 'section-label reveal';
  label.textContent = 'Historical Context';

  const heading = document.createElement('h2');
  heading.className = 'section-heading reveal';
  heading.textContent = 'Argument Evolution';

  const track = document.createElement('div');
  track.className = 'timeline-track';

  const line = document.createElement('div');
  line.className = 'timeline-line';
  track.appendChild(line);

  const nodes = [
    { year: '1964', title: 'Bell', note: 'Inequality derived; all detectors assumed perfect.', status: 'established' },
    { year: '1969', title: 'CHSH', note: 'Testable form of Bell inequality; \u03b7 issue implicit.', status: 'established' },
    { year: '1993', title: 'Eberhard', note: '\u03b7_c \u2248 82.8% proven necessary for loophole closure.', status: 'established' },
    { year: '2015', title: 'Loophole-free', note: 'Delft, NIST, Vienna achieve high-\u03b7 + spacelike separation.', status: 'resolved' },
    { year: '2025', title: 'Wang et al.', note: 'Experiment under examination; \u03b7 flagged as sub-threshold.', status: 'contested' },
    { year: '2025', title: 'This rebuttal', note: 'Post-selection artifact characterised; diagnostics required.', status: 'resolved' },
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
    track.appendChild(node);
  });

  container.appendChild(label);
  container.appendChild(heading);
  container.appendChild(track);
  section.appendChild(container);

  // Insert rule + section before figures
  const rule = document.createElement('hr');
  rule.className = 'section-rule';

  figuresSection.before(section);
  figuresSection.before(rule);
}

// ── DEMO STATE EXPORT & PERMALINK ──
function initDemoExport() {
  const panels = document.querySelectorAll('.demo-panel');

  panels.forEach(panel => {
    const controls = panel.querySelector('.demo-controls');
    if (!controls) return;

    const wrap = document.createElement('div');
    wrap.className = 'demo-export-btns';

    // Export JSON
    const exportBtn = document.createElement('button');
    exportBtn.className = 'demo-export-btn';
    exportBtn.textContent = 'Export JSON';
    exportBtn.setAttribute('aria-label', 'Export current demo state as JSON');
    exportBtn.addEventListener('click', () => {
      const state = collectDemoState(panel);
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chsh-demo-state.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Copy permalink
    const linkBtn = document.createElement('button');
    linkBtn.className = 'demo-export-btn';
    linkBtn.textContent = 'Copy Link';
    linkBtn.setAttribute('aria-label', 'Copy permalink with current demo state');
    linkBtn.addEventListener('click', () => {
      const state = collectDemoState(panel);
      const params = new URLSearchParams();
      params.set('demo', panel.id.replace('demo-', ''));
      Object.entries(state.sliders || {}).forEach(([k, v]) => params.set(k, v));
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

function collectDemoState(panel) {
  const sliders = {};
  panel.querySelectorAll('input[type="range"]').forEach(s => {
    sliders[s.id] = s.value;
  });
  const readouts = {};
  panel.querySelectorAll('.readout-value').forEach(r => {
    readouts[r.id] = r.textContent;
  });
  return {
    demo: panel.id,
    timestamp: new Date().toISOString(),
    sliders,
    readouts,
  };
}

// ── PERMALINK RESTORE ──
function restoreFromPermalink() {
  const state = paramsToState();
  if (!state.demo) return;

  // Activate the right tab
  const tabBtn = document.querySelector('.demo-tab[data-panel="demo-' + state.demo + '"]');
  if (tabBtn) tabBtn.click();

  // Restore slider values
  Object.entries(state).forEach(([key, val]) => {
    if (key === 'demo' || key === 'assumptions') return;
    const slider = document.getElementById(key);
    if (slider && slider.type === 'range') {
      slider.value = val;
      slider.dispatchEvent(new Event('input'));
    }
  });

  // Restore assumption toggles
  if (state.assumptions) {
    const active = String(state.assumptions).split(',');
    const toggles = document.querySelectorAll('.assumption-toggle input');
    toggles.forEach((cb, i) => {
      const keys = ['fairSampling', 'highEfficiency', 'noPostSelection'];
      cb.checked = active.includes(keys[i]);
      cb.dispatchEvent(new Event('change'));
    });
  }
}

// ── ACCESSIBILITY: SLIDER ARIA ──
function enhanceSliderA11y() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    if (!slider.getAttribute('aria-label')) {
      const label = slider.closest('.demo-slider-row')?.querySelector('label');
      if (label) slider.setAttribute('aria-label', label.textContent.replace(/:\s*\d.*$/, ''));
    }
    slider.setAttribute('aria-valuemin', slider.min);
    slider.setAttribute('aria-valuemax', slider.max);
    slider.setAttribute('aria-valuenow', slider.value);
    slider.addEventListener('input', () => {
      slider.setAttribute('aria-valuenow', slider.value);
    });
  });
}

// ── KEYBOARD SHORTCUTS ──
function initKeyboardShortcuts() {
  // Escape closes any overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close provenance drawers
      document.querySelectorAll('.provenance-drawer--open').forEach(d => {
        d.classList.remove('provenance-drawer--open');
        d.setAttribute('aria-hidden', 'true');
        const btn = d.parentElement?.querySelector('.provenance-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// ── KEYBOARD SHORTCUTS HELP ──
function initShortcutsHelp() {
  const footer = document.querySelector('.site-footer .container');
  if (!footer) return;

  const details = document.createElement('details');
  details.className = 'shortcuts-help';

  const summary = document.createElement('summary');
  summary.textContent = 'Keyboard Shortcuts';

  const list = document.createElement('dl');
  list.className = 'shortcuts-list';

  const shortcuts = [
    ['b', 'Toggle Bound Explorer panel'],
    ['s', 'Open Story Mode'],
    ['Escape', 'Close any overlay or drawer'],
  ];

  shortcuts.forEach(([key, desc]) => {
    const dt = document.createElement('dt');
    const kbd = document.createElement('kbd');
    kbd.textContent = key;
    dt.appendChild(kbd);
    const dd = document.createElement('dd');
    dd.textContent = desc;
    list.appendChild(dt);
    list.appendChild(dd);
  });

  details.appendChild(summary);
  details.appendChild(list);
  footer.appendChild(details);
}

// ── EQUATION TERM LINKING ──
function initTermLinking() {
  const termMap = {
    'eta': { target: '#demo-efficiency', highlight: '.demo-slider-row' },
    'S_{\\text{post}}': { target: '#demo-postselect', highlight: '.demo-readouts' },
    'E(a,b)': { target: '#demo-angle', highlight: '.demo-readouts' },
  };

  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex || '';
    Object.entries(termMap).forEach(([term, config]) => {
      if (!latex.includes(term.replace(/\\/g, '\\'))) return;
      // Find rendered KaTeX spans containing the term
      const spans = el.querySelectorAll('.katex .mord, .katex .minner');
      spans.forEach(span => {
        if (span.textContent.includes('\u03b7') || span.textContent.includes('S')) {
          span.classList.add('term-linkable');
          span.setAttribute('data-term-target', config.target);
          span.tabIndex = 0;
          span.setAttribute('role', 'button');
          span.setAttribute('aria-label', 'Highlight related demo element');

          span.addEventListener('mouseenter', () => {
            const targetEl = document.querySelector(config.target + ' ' + config.highlight);
            if (targetEl) targetEl.classList.add('term-highlight');
          });
          span.addEventListener('mouseleave', () => {
            document.querySelectorAll('.term-highlight').forEach(h => h.classList.remove('term-highlight'));
          });
        }
      });
    });
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
  initTabs();
  initSmoothScroll();
  initMouseGlow();
  initReadoutTick();
  initTimeline();
  initAssumptionToggles();
  initBoundExplorer();
  initDemoExport();
  enhanceSliderA11y();
  initKeyboardShortcuts();
  initShortcutsHelp();

  const { initStarfield }      = await import('./starfield.js');
  const { initScroll }         = await import('./scroll.js');
  const { initAnnotations }    = await import('./annotations.js');
  const { initRedPen }         = await import('./redpen.js');
  const { initAngleDemo }      = await import('./demo-chsh.js');
  const { initEfficiencyDemo } = await import('./demo-efficiency.js');
  const { initPostSelectDemo } = await import('./demo-postselect.js');
  const { initStoryMode }      = await import('./story-mode.js');
  const { initProvenanceDrawers } = await import('./provenance-data.js');
  const { initSonification }   = await import('./sonification.js');

  initStarfield();
  initScroll();
  initAnnotations();
  initRedPen();
  initAngleDemo();
  initEfficiencyDemo();
  initPostSelectDemo();
  initStoryMode();
  initProvenanceDrawers();
  initSonification();
  initMicroInteractions();
  initTermLinking();

  // Restore permalink state after demos are initialized
  restoreFromPermalink();

  // Initial demo draw animation when section enters viewport
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#demos',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const activePanel = document.querySelector('.demo-panel.active');
        if (!activePanel) return;
        const id = activePanel.id;

        if (id === 'demo-angle') {
          const canvas = document.getElementById('chshCanvas');
          if (canvas) {
            gsap.from(canvas, { scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out', transformOrigin: 'center center' });
          }
        }
        if (id === 'demo-efficiency') {
          const svg = document.getElementById('efficiencySvg');
          if (svg) {
            gsap.from(svg, { opacity: 0, duration: 0.5, ease: 'power2.out' });
          }
        }
        if (id === 'demo-postselect') {
          const canvas = document.getElementById('postSelectCanvas');
          if (canvas) {
            gsap.from(canvas, { scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out', transformOrigin: 'center center' });
          }
        }
      },
    });
  }
});
