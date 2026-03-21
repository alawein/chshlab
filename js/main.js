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
  document.querySelectorAll('.nav__links a, .nav__logo, .evidence-link').forEach(link => {
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

// ── SCROLL PROGRESS + SCROLL-TO-TOP ──
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  const btn = document.getElementById('scrollTopBtn');
  if (!bar && !btn) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (bar) bar.style.width = progress + '%';
    if (btn) btn.classList.toggle('scroll-top--visible', scrollTop > window.innerHeight);

    // Hide scroll hint after scrolling past 100px
    const hint = document.querySelector('.scroll-hint');
    if (hint) hint.classList.toggle('scroll-hint--hidden', scrollTop > 100);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  if (btn) {
    btn.addEventListener('click', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(window, { scrollTo: { y: 0 }, duration: 0.8, ease: 'power2.inOut' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

// ── SECTION DOTS ──
function initSectionDots() {
  const dotsNav = document.getElementById('sectionDots');
  if (!dotsNav) return;
  const dots = dotsNav.querySelectorAll('.section-dot');
  const sections = ['hook', 'claim', 'efficiency', 'loophole', 'postselection', 'proof', 'standards', 'conclusion'];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach(dot => dot.classList.toggle('section-dot--active', dot.dataset.section === id));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // Show dots after scrolling past hero
  window.addEventListener('scroll', () => {
    dotsNav.classList.toggle('section-dots--visible', window.scrollY > window.innerHeight * 0.5);
  }, { passive: true });

  // Smooth scroll on dot click
  dots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(dot.dataset.section);
      if (target && typeof gsap !== 'undefined') {
        gsap.to(window, { scrollTo: { y: target, offsetY: 52 }, duration: 0.8, ease: 'power2.inOut' });
      } else if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ── MOBILE NAV ──
function initMobileNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!nav || !toggle || !menu) return { closeNav: () => {} };

  const closeNav = () => {
    nav.classList.remove('nav--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };

  const openNav = () => {
    nav.classList.add('nav--open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
  };

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('nav--open')) {
      closeNav();
      return;
    }
    openNav();
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('nav--open')) return;
    if (nav.contains(e.target)) return;
    closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) closeNav();
  });

  return { closeNav };
}

// ── KEYBOARD SHORTCUTS ──
function initKeyboardShortcuts(closeNav = () => {}) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNav();
    }
  });
}

// ── MAIN INIT ──
document.addEventListener('DOMContentLoaded', async () => {
  initKaTeX();
  initSmoothScroll();
  initReadoutTick();
  initTimeline();
  initDemoExport();
  enhanceSliderA11y();
  initScrollProgress();
  initSectionDots();
  const { closeNav } = initMobileNav();
  initKeyboardShortcuts(closeNav);

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
