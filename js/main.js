// chshlab/js/main.js
// Entrypoint: shared page shell orchestration for the interactive narrative.

import { initMicroInteractions } from './animation-config.js';
import { renderKatexDisplays } from './katex-render.js';
import {
  initKeyboardShortcuts,
  initMobileNav,
  initScrollProgress,
  initSectionDots,
  initSmoothScroll,
  restoreHashTargetFocus,
} from './page-navigation.js';
import {
  enhanceSliderA11y,
  initDemoExport,
  initReadoutTick,
  restoreFromPermalink,
} from './page-state.js';
import { initTimeline } from './page-timeline.js';
import { toggle as toggleAmbient } from './ambient-reader.js';

async function safeImport(path, initName) {
  try {
    const mod = await import(path);
    if (mod[initName]) mod[initName]();
  } catch (error) {
    console.warn('Module load failed:', path, error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderKatexDisplays();
  initSmoothScroll();
  initReadoutTick();
  initTimeline();
  initDemoExport();
  enhanceSliderA11y();
  initScrollProgress();
  initSectionDots();

  const { closeNav } = initMobileNav();
  initKeyboardShortcuts(closeNav);

  await safeImport('./starfield.js', 'initStarfield');
  await safeImport('./scroll.js', 'initScroll');
  await safeImport('./dashboard.js', 'initDashboard');
  await safeImport('./fig-bell-test.js', 'initBellTest');
  await safeImport('./fig-gauge.js', 'initGauge');
  await safeImport('./demo-efficiency.js', 'initEfficiencyDemo');
  await safeImport('./fig-event-stream.js', 'initEventStream');
  await safeImport('./demo-postselect.js', 'initPostSelectDemo');
  await safeImport('./demo-chsh.js', 'initAngleDemo');
  // await safeImport('./interference-viz.js', 'initInterference');
  await safeImport('./sonification.js', 'initSonification');
  await safeImport('./references.js', 'initReferences');

  initMicroInteractions();
  restoreFromPermalink();
  restoreHashTargetFocus();

  // Ambient music toggle
  const ambientBtn = document.getElementById('ambientToggle');
  if (ambientBtn) {
    ambientBtn.addEventListener('click', () => {
      const isPlaying = toggleAmbient();
      ambientBtn.classList.toggle('active', isPlaying);
    });
  }

  // ── ENHANCED ANIMATIONS (respect prefers-reduced-motion) ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    // A. Animated number counters on evidence cards
    initEvidenceCounters();

    // B. Red highlighter marks on paper excerpt
    initRedmarkReveal();

    // D. Timeline node reveal with connection lines
    initTimelineNodeReveal();
  }
});

// ── EVIDENCE CARD COUNTER ANIMATION ──
function initEvidenceCounters() {
  const cards = document.querySelectorAll('.evidence-card__value');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  cards.forEach((card) => observer.observe(card));
}

function animateCounter(el) {
  const text = el.textContent.trim();
  // Extract leading numeric value (e.g., "2.275" from "2.275 +/- 0.057" or "3.716")
  const match = text.match(/^([\d.]+)/);
  if (!match) return;

  const target = parseFloat(match[1]);
  if (isNaN(target)) return;

  const suffix = text.slice(match[0].length);
  const decimals = (match[1].split('.')[1] || '').length;
  const duration = 1200;
  const start = performance.now();

  el.classList.add('counting');

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.classList.remove('counting');
    }
  }

  requestAnimationFrame(tick);
}

// ── RED HIGHLIGHTER MARKS REVEAL ──
function initRedmarkReveal() {
  const marks = document.querySelectorAll('.redmark');
  if (!marks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(() => el.classList.add('revealed'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  marks.forEach((mark) => observer.observe(mark));
}

// ── TIMELINE NODE REVEAL (connection lines animate on scroll) ──
function initTimelineNodeReveal() {
  const nodes = document.querySelectorAll('.timeline-node');
  if (!nodes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3, root: document.getElementById('timelineContainer') }
  );

  nodes.forEach((node) => observer.observe(node));
}
