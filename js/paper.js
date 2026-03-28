import { renderKatexDisplays } from './katex-render.js';

function focusTarget(target) {
  if (!target) return;

  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }

  target.focus({ preventScroll: true });
}

function initPrintButton() {
  const printButton = document.getElementById('paperPrintBtn');
  if (!printButton) return;

  printButton.addEventListener('click', () => window.print());
}

function initMobileToc() {
  const toc = document.querySelector('.paper-toc-mobile');
  if (!toc) return;

  toc.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toc.open = false;
    });
  });
}

function initTableOfContents() {
  const toc = document.getElementById('paperToc');
  if (!toc) return;

  const links = Array.from(toc.querySelectorAll('a'));
  const sections = Array.from(document.querySelectorAll('.paper-section[id]'));
  if (!links.length || !sections.length) return;

  const setActiveLink = (id) => {
    links.forEach((link) => {
      link.classList.toggle('toc-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const activateHashTarget = () => {
    if (!window.location.hash) return false;

    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return false;

    setActiveLink(target.id);
    focusTarget(target);
    return true;
  };

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      setActiveLink(href.slice(1));
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

  sections.forEach((section) => observer.observe(section));
  window.addEventListener('hashchange', activateHashTarget);

  if (activateHashTarget()) return;

  setActiveLink(sections[0].id);
}

function initPaperPage() {
  renderKatexDisplays();
  initPrintButton();
  initMobileToc();
  initTableOfContents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPaperPage);
} else {
  initPaperPage();
}
