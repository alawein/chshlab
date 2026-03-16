// chshlab/js/main.js
// Entrypoint: KaTeX, tabs, smooth scroll, mousemove, module loading

function initKaTeX() {
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) {
      katex.render(latex, el, { displayMode: true, throwOnError: false });
    }
  });
}

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

  // Position indicator on the initially active tab (defer past KaTeX reflow)
  const activeTab = document.querySelector('.demo-tab.active');
  if (activeTab) {
    requestAnimationFrame(() => requestAnimationFrame(() => updateIndicator(activeTab)));
  }

  // Reposition on resize
  window.addEventListener('resize', () => {
    const active = document.querySelector('.demo-tab.active');
    if (active) updateIndicator(active);
  });
}

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

function initMouseGlow() {
  document.querySelectorAll('.rebuttal-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });
}

function initReadoutTick() {
  // Observe readout value changes and trigger tick animation
  document.querySelectorAll('.readout-value').forEach(el => {
    const observer = new MutationObserver(() => {
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 150);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  });
}

window.addEventListener('load', async () => {
  // Fade in body (prevents flash of unstyled content)
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

  const { initStarfield }      = await import('./starfield.js');
  const { initScroll }         = await import('./scroll.js');
  const { initAnnotations }    = await import('./annotations.js');
  const { initRedPen }         = await import('./redpen.js');
  const { initAngleDemo }      = await import('./demo-chsh.js');
  const { initEfficiencyDemo } = await import('./demo-efficiency.js');
  const { initPostSelectDemo } = await import('./demo-postselect.js');

  initStarfield();
  initScroll();
  initAnnotations();
  initRedPen();
  initAngleDemo();
  initEfficiencyDemo();
  initPostSelectDemo();

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
