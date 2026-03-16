// chshlab/js/scroll.js
// Cinematic scroll choreography — GSAP timelines per section

export function initScroll() {
  if (typeof gsap === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    // Show everything immediately — no animations
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.rebuttal-card').forEach(c => c.classList.add('is-visible'));
    document.querySelectorAll('.section-rule').forEach(r => { r.style.transform = 'scaleX(1)'; });
    document.querySelector('.hero__rule')?.style.setProperty('transform', 'scaleX(1)');

    // Still register nav scroll toggle (visual, a11y-neutral)
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom top',
      onLeave: () => document.querySelector('.nav')?.classList.add('nav--scrolled'),
      onEnterBack: () => document.querySelector('.nav')?.classList.remove('nav--scrolled'),
    });

    return;
  }

  // ── HERO TIMELINE (plays on load) ──
  heroTimeline();

  // ── NAV SCROLL STATE ──
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom top',
    onLeave: () => document.querySelector('.nav')?.classList.add('nav--scrolled'),
    onEnterBack: () => document.querySelector('.nav')?.classList.remove('nav--scrolled'),
  });

  // ── SECTION DIVIDERS ──
  document.querySelectorAll('.section-rule').forEach(rule => {
    gsap.to(rule, {
      scaleX: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: rule,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  // ── PAPER SECTION ──
  sectionReveal('#paper', {
    children: '.reveal',
    stagger: 0.12,
  });

  // ── REBUTTAL CARDS ──
  const rebuttalCards = document.querySelectorAll('#rebuttal .rebuttal-card');
  if (rebuttalCards.length) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#rebuttal',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Section label + heading first
    tl.from('#rebuttal .section-label, #rebuttal .section-heading', {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', stagger: 0.1,
    });

    // Cards stagger
    rebuttalCards.forEach((card, i) => {
      tl.from(card, {
        opacity: 0, y: 30, scale: 0.97, duration: 0.7,
        ease: 'power2.out',
        onStart: () => card.classList.add('is-visible'),
      }, `-=0.55`);
    });

    // Evidence blocks clip-path wipe
    tl.from('#rebuttal .rebuttal-card__evidence', {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.15,
    }, '-=0.3');

    // Math blocks blur reveal
    tl.from('#rebuttal .math-block', {
      opacity: 0, filter: 'blur(3px)',
      duration: 0.6, ease: 'power2.out',
      stagger: 0.1,
    }, '-=0.4');

    // Mark reveal elements as handled
    document.querySelectorAll('#rebuttal .reveal').forEach(el => el.classList.remove('reveal'));
  }

  // ── DEMOS SECTION ──
  sectionReveal('#demos', {
    children: '.section-label, .section-heading, .section-intro, .demo-tabs',
    stagger: 0.1,
  });

  // ── THEOREM CARDS ──
  const theoremCards = document.querySelectorAll('#proofs .theorem-card');
  if (theoremCards.length) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#proofs',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    tl.from('#proofs .section-label, #proofs .section-heading, #proofs .section-intro', {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', stagger: 0.1,
    });

    theoremCards.forEach((card) => {
      // Card entry
      tl.from(card, {
        opacity: 0, y: 24, duration: 0.7, ease: 'power2.out',
      }, '-=0.5');

      // Theorem number clip-path wipe
      const num = card.querySelector('.theorem-card__number');
      if (num) {
        tl.from(num, {
          clipPath: 'inset(0 100% 0 0)', duration: 0.4, ease: 'power2.out',
        }, '-=0.3');
      }

      // Math blur reveal
      const math = card.querySelector('.theorem-math');
      if (math) {
        tl.from(math, {
          opacity: 0, filter: 'blur(4px)', duration: 0.5, ease: 'power2.out',
        }, '-=0.2');
      }
    });

    document.querySelectorAll('#proofs .reveal').forEach(el => el.classList.remove('reveal'));
  }

  // ── FIGURE GALLERY ──
  const figureCards = document.querySelectorAll('#figures .figure-card');
  if (figureCards.length) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#figures',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    tl.from('#figures .section-label, #figures .section-heading', {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', stagger: 0.1,
    });

    figureCards.forEach((card) => {
      const imgWrap = card.querySelector('.figure-card__image-wrap');
      const caption = card.querySelector('.figure-card__caption');
      const label = card.querySelector('.figure-card__label');

      // Card entry
      tl.from(card, {
        opacity: 0, y: 30, scale: 0.95, duration: 0.7, ease: 'power2.out',
      }, '-=0.58');

      // Image curtain reveal
      if (imgWrap) {
        tl.from(imgWrap, {
          clipPath: 'inset(100% 0 0 0)', duration: 0.8, ease: 'power2.out',
        }, '-=0.5');
      }

      // Label clip-path wipe
      if (label) {
        tl.from(label, {
          clipPath: 'inset(0 100% 0 0)', duration: 0.4, ease: 'power2.out',
        }, '-=0.4');
      }

      // Caption fade
      if (caption) {
        tl.from(caption, {
          opacity: 0, duration: 0.5, ease: 'power2.out',
        }, '-=0.3');
      }
    });

    document.querySelectorAll('#figures .reveal').forEach(el => el.classList.remove('reveal'));
  }

  // ── REFERENCES + FOOTER ──
  sectionReveal('#references', {
    children: '.reveal',
    stagger: 0.1,
  });

  // ── REMAINING .reveal ELEMENTS (catch-all) ──
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}

// ── HERO TIMELINE ──
function heroTimeline() {
  const titleEl = document.querySelector('.hero__title');
  const eyebrow = document.querySelector('.hero__eyebrow');
  const subtitle = document.querySelector('.hero__subtitle');
  const bounds = document.querySelector('.hero__bounds');
  const rule = document.querySelector('.hero__rule');

  // Word-split the title
  if (titleEl) {
    const words = titleEl.textContent.trim().split(/\s+/);
    titleEl.textContent = '';
    words.forEach((word, i) => {
      const outer = document.createElement('span');
      const inner = document.createElement('span');
      outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
      inner.className = 'hero-word';
      inner.textContent = word;
      outer.appendChild(inner);
      titleEl.appendChild(outer);
      if (i < words.length - 1) {
        titleEl.appendChild(document.createTextNode('\u00a0'));
      }
    });
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Eyebrow
  if (eyebrow) {
    eyebrow.classList.remove('reveal');
    tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.8 }, 0.3);
  }

  // Title words (blur-to-sharp)
  if (titleEl) {
    titleEl.classList.remove('reveal');
    tl.from('.hero-word', {
      yPercent: 110, filter: 'blur(4px)', stagger: 0.06, duration: 0.9,
    }, 0.5);
  }

  // Rule wipe
  if (rule) {
    tl.to(rule, { scaleX: 1, duration: 1.2, ease: 'power2.out' }, 1.2);
  }

  // Subtitle
  if (subtitle) {
    subtitle.classList.remove('reveal');
    tl.from(subtitle, { opacity: 0, y: 12, duration: 0.8 }, 1.6);
  }

  // Badges stagger
  if (bounds) {
    bounds.classList.remove('reveal');
    tl.from('.hero__bounds .badge', {
      opacity: 0, y: 20, scale: 0.95, stagger: 0.12, duration: 0.7,
    }, 2.0);
  }
}

// ── UTILITY: Simple section reveal ──
function sectionReveal(sectionSelector, { children, stagger = 0.1 }) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const els = section.querySelectorAll(children);
  if (!els.length) return;

  gsap.from(els, {
    opacity: 0,
    y: 20,
    duration: 0.7,
    ease: 'power2.out',
    stagger,
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });

  els.forEach(el => el.classList.remove('reveal'));
}
