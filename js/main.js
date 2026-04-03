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
});
