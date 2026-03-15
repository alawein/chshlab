// chshlab/js/main.js
// Entrypoint: render KaTeX math spans, init demo tabs, load modules

function initKaTeX() {
  // KaTeX loaded via defer CDN — render all .math-display spans
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) {
      katex.render(latex, el, { displayMode: true, throwOnError: false });
    }
  });
}

function initTabs() {
  const tabs   = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.demo-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t   => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.panel);
      if (target) target.classList.add('active');
    });
  });
}

window.addEventListener('load', async () => {
  initKaTeX();
  initTabs();

  const { initScroll }         = await import('./scroll.js');
  const { initAnnotations }    = await import('./annotations.js');
  const { initAngleDemo }      = await import('./demo-chsh.js');
  const { initEfficiencyDemo } = await import('./demo-efficiency.js');
  const { initPostSelectDemo } = await import('./demo-postselect.js');

  initScroll();
  initAnnotations();
  initAngleDemo();
  initEfficiencyDemo();
  initPostSelectDemo();
});
