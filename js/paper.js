// chshlab/js/paper.js
// Entrypoint for the paper page — ES module loaded via <script type="module">

import { renderKatexDisplays } from './katex-render.js';
import { toggle as toggleAmbient } from './ambient-reader.js';

// ── PRINT BUTTON ──
function initPrintButton() {
  const printButton = document.getElementById('paperPrintBtn');
  if (!printButton) return;
  printButton.addEventListener('click', () => window.print());
}

// ── CITATION COPY BUTTONS ──
function initCiteButtons() {
  const bibtex = `@article{alawein2026chshlab,
  title   = {Bell Violations Without Entanglement? A Reproducible Rebuttal},
  author  = {Alawein, Meshal},
  year    = {2026},
  url     = {https://chshlab.online/paper},
  note    = {Interactive simulations at https://chshlab.online}
}`;

  const apa = 'Alawein, M. (2026). Bell violations without entanglement? A reproducible rebuttal. CHSH Lab. https://chshlab.online/paper';

  function copyAndFeedback(btn, text) {
    const original = btn.textContent;
    navigator.clipboard.writeText(text).then(
      () => { btn.textContent = 'Copied!'; },
      () => { btn.textContent = 'Copy failed'; }
    );
    setTimeout(() => { btn.textContent = original; }, 1400);
  }

  const bibtexBtn = document.getElementById('citeBibtexBtn');
  if (bibtexBtn) bibtexBtn.addEventListener('click', () => copyAndFeedback(bibtexBtn, bibtex));

  const apaBtn = document.getElementById('citeApaBtn');
  if (apaBtn) apaBtn.addEventListener('click', () => copyAndFeedback(apaBtn, apa));
}

// ── MOBILE TOC ──
function initMobileToc() {
  const toc = document.querySelector('.paper-toc-mobile');
  if (!toc) return;
  toc.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => { toc.open = false; });
  });
}

// ── TABLE OF CONTENTS ACTIVE STATE ──
function initTableOfContents() {
  const toc = document.getElementById('paperToc');
  if (!toc || !('IntersectionObserver' in window)) return;

  const links = new Map(
    Array.from(toc.querySelectorAll('a')).map((link) => [
      link.getAttribute('href').slice(1),
      link,
    ])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((value) => value.classList.remove('toc-active'));
          link.classList.add('toc-active');
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0.01 }
  );

  document.querySelectorAll('.paper-section').forEach((section) => observer.observe(section));
}

// ── READING PROGRESS BAR ──
function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(progress, 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ── RED HIGHLIGHTER MARKS ──
function initHighlightMarks() {
  const marks = document.querySelectorAll('.highlight-mark');
  if (!marks.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  marks.forEach((mark) => observer.observe(mark));
}

// ── AMBIENT MUSIC TOGGLE ──
function initAmbientToggle() {
  const btn = document.getElementById('ambientToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isPlaying = toggleAmbient();
    btn.classList.toggle('active', isPlaying);
  });
}

// ── GSAP SCROLL REVEAL ANIMATIONS ──
function initScrollReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // Fade-in .paper-section elements
  document.querySelectorAll('.paper-section').forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Subtle scale-up on .paper-figure elements
  document.querySelectorAll('.paper-figure').forEach((figure) => {
    gsap.from(figure, {
      opacity: 0,
      scale: 0.98,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: figure,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Stagger .paper-formal blocks
  const formals = document.querySelectorAll('.paper-formal');
  if (formals.length) {
    formals.forEach((formal, i) => {
      gsap.from(formal, {
        opacity: 0,
        y: 12,
        duration: 0.6,
        delay: i * 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: formal,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });
  }
}

// ── KATEX RENDERING ──
function initKatex() {
  renderKatexDisplays();
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    });
  }
}

// ── SMOOTH SECTION FADE ON SCROLL OUT ──
function initSectionFade() {
  if (!('IntersectionObserver' in window)) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const sections = document.querySelectorAll('.paper-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('section-faded', !entry.isIntersecting);
      });
    },
    { rootMargin: '-5% 0px -5% 0px', threshold: 0.01 }
  );

  sections.forEach((section) => observer.observe(section));
}

// ── SIDENOTE ENTRANCE ANIMATION ──
function initSidenoteEntrance() {
  if (!('IntersectionObserver' in window)) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  if (window.innerWidth < 1100) return;

  const sidenotes = document.querySelectorAll('.sidenote');
  if (!sidenotes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sidenote-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
  );

  sidenotes.forEach((note) => observer.observe(note));
}

// ── INIT ──
function initPaperPage() {
  initKatex();
  initPrintButton();
  initCiteButtons();
  initMobileToc();
  initTableOfContents();
  initReadingProgress();
  initHighlightMarks();
  initAmbientToggle();
  initScrollReveal();
  initSectionFade();
  initSidenoteEntrance();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPaperPage);
} else {
  initPaperPage();
}
