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

      // Theorem number clip-path wipe + stamp
      const num = card.querySelector('.theorem-card__number');
      if (num) {
        tl.from(num, { clipPath: 'inset(0 100% 0 0)', duration: 0.4, ease: 'power2.out' }, '-=0.3');
        tl.to(num, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '-=0.1');
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

    // Scanner line sweep
    figureScanner(tl);

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

  // ── ATMOSPHERE + NAV ACTIVE ──
  initAtmosphere();
  initNavActive();
}

// ── HERO: Split title into word spans ──
function splitHeroTitle(titleEl) {
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
    if (i < words.length - 1) titleEl.appendChild(document.createTextNode('\u00a0'));
  });
}

// ── HERO: Badge stagger with power-on flash ──
function animateBadges(tl) {
  const badges = document.querySelectorAll('.hero__bounds .badge');
  badges.forEach((badge, i) => {
    const t = 2.0 + i * 0.12;
    tl.from(badge, { opacity: 0, y: 20, scale: 0.95, duration: 0.7 }, t);
    tl.to(badge, { borderColor: 'rgba(255,255,255,0.9)', duration: 0.1, yoyo: true, repeat: 1 }, t + 0.3);
  });
}

// ── HERO TIMELINE ──
function heroTimeline() {
  const titleEl = document.querySelector('.hero__title');
  const eyebrow = document.querySelector('.hero__eyebrow');
  const subtitle = document.querySelector('.hero__subtitle');
  const bounds = document.querySelector('.hero__bounds');
  const rule = document.querySelector('.hero__rule');
  const glow = document.querySelector('.ambient-glow');

  if (titleEl) splitHeroTitle(titleEl);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (glow) tl.to(glow, { opacity: 0.15, duration: 0.05, yoyo: true, repeat: 1 }, 0.1);

  if (eyebrow) {
    eyebrow.classList.remove('reveal');
    tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.8 }, 0.3);
  }
  if (titleEl) {
    titleEl.classList.remove('reveal');
    tl.from('.hero-word', { yPercent: 110, filter: 'blur(4px)', letterSpacing: '0.12em', stagger: 0.06, duration: 0.9 }, 0.5);
  }
  if (rule) tl.to(rule, { scaleX: 1, duration: 1.2, ease: 'power2.out' }, 1.2);
  if (subtitle) {
    subtitle.classList.remove('reveal');
    tl.from(subtitle, { opacity: 0, y: 12, duration: 0.8 }, 1.6);
  }
  if (bounds) {
    bounds.classList.remove('reveal');
    animateBadges(tl);
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

// ── FIGURE SCANNER LINE ──
function figureScanner(tl) {
  const figSection = document.getElementById('figures');
  if (!figSection) return;
  const scanner = document.createElement('div');
  scanner.className = 'figures-scanner';
  figSection.appendChild(scanner);
  tl.fromTo(scanner, { top: '0%', opacity: 1 }, { top: '100%', opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.5);
}

// ── NAV ACTIVE SECTION HIGHLIGHT ──
function initNavActive() {
  const links = document.querySelectorAll('.nav__links a');
  if (!links.length) return;

  ['paper', 'rebuttal', 'demos', 'proofs', 'figures', 'references'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveLink(links, id),
      onEnterBack: () => setActiveLink(links, id),
    });
  });
}

function setActiveLink(links, id) {
  links.forEach(a => a.classList.toggle('nav-link--active', a.getAttribute('href') === '#' + id));
}

// ── ATMOSPHERE: gradient map ──
const ATMOSPHERE_GRADIENTS = {
  rebuttal: 'radial-gradient(ellipse at 20% 80%, rgba(192,57,43,0.04) 0%, transparent 60%)',
  demos: 'radial-gradient(ellipse at 85% 50%, rgba(100,140,230,0.04) 0%, transparent 60%)',
  figures: 'radial-gradient(ellipse at 50% 90%, rgba(201,169,77,0.03) 0%, transparent 50%)',
};

// ── ATMOSPHERE: fade layer in/out ──
function fadeAtmosphere(layer, bg, show) {
  layer.style.background = bg;
  gsap.to(layer, {
    opacity: show ? 1 : 0,
    duration: show ? 1.2 : 0.8,
    overwrite: true,
    onComplete: () => { if (!show) layer.style.background = 'transparent'; },
  });
}

// ── ATMOSPHERE: bind ScrollTrigger per section ──
function bindAtmosphereSection(layer, id) {
  const el = document.getElementById(id);
  if (!el) return;
  const bg = ATMOSPHERE_GRADIENTS[id] || 'transparent';
  const hasGradient = bg !== 'transparent';

  ScrollTrigger.create({
    trigger: el,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => fadeAtmosphere(layer, bg, hasGradient),
    onLeaveBack: () => fadeAtmosphere(layer, 'transparent', false),
  });
}

// ── SECTION ATMOSPHERE WASHES ──
function initAtmosphere() {
  const layer = document.querySelector('.atmosphere-layer');
  if (!layer) return;
  ['hero', 'paper', 'rebuttal', 'demos', 'proofs', 'figures', 'references'].forEach(id => bindAtmosphereSection(layer, id));
}
