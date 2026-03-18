// chshlab/js/scroll.js
// Cinematic scroll choreography — GSAP timelines per beat section

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
    document.querySelectorAll('.section-rule').forEach(r => { r.style.transform = 'scaleX(1)'; });

    // Still register nav scroll toggle (visual, a11y-neutral)
    ScrollTrigger.create({
      trigger: '#hook',
      start: 'bottom top',
      onLeave: () => document.querySelector('.nav')?.classList.add('nav--scrolled'),
      onEnterBack: () => document.querySelector('.nav')?.classList.remove('nav--scrolled'),
    });

    return;
  }

  // ── HERO / HOOK TIMELINE ──
  hookTimeline();

  // ── NAV SCROLL STATE ──
  ScrollTrigger.create({
    trigger: '#hook',
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

  // ── BEAT SECTIONS: PROSE + FIGURES ──
  // Reveal each beat's content as user scrolls into view
  ['claim', 'efficiency', 'loophole', 'postselection', 'proof', 'standards', 'conclusion'].forEach(id => {
    sectionReveal('#' + id, {
      children: '.reveal',
      stagger: 0.1,
    });
  });

  // ── REFERENCES + FOOTER ──
  sectionReveal('#references', {
    children: '.reveal',
    stagger: 0.1,
  });

  // ── REMAINING .reveal ELEMENTS (catch-all) ──
  const remaining = document.querySelectorAll('.reveal');
  remaining.forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
    el.classList.remove('reveal');
  });

  // ── THEOREM CARD STAMPS ──
  initTheoremStamps();

  // ── ATMOSPHERE + NAV ACTIVE ──
  initAtmosphere();
  initNavActive();
}

// ── HOOK: Split title into word spans ──
function splitHookTitle(titleEl) {
  const words = titleEl.textContent.trim().split(/\s+/);
  titleEl.textContent = '';
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
    inner.className = 'hook-word';
    inner.textContent = word;
    outer.appendChild(inner);
    titleEl.appendChild(outer);
    if (i < words.length - 1) titleEl.appendChild(document.createTextNode('\u00a0'));
  });
}

// ── HOOK TIMELINE ──
function hookTimeline() {
  const titleEl = document.querySelector('.beat__title');
  const eyebrow = document.querySelector('.beat__eyebrow');
  const subtitle = document.querySelector('.beat__subtitle');
  const byline = document.querySelector('.beat__byline');

  if (titleEl) splitHookTitle(titleEl);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (eyebrow) {
    eyebrow.classList.remove('reveal');
    tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.8 }, 0.3);
  }
  if (titleEl) {
    titleEl.classList.remove('reveal');
    tl.from('.hook-word', { yPercent: 110, filter: 'blur(4px)', letterSpacing: '0.12em', stagger: 0.06, duration: 0.9 }, 0.5);
  }
  if (subtitle) {
    subtitle.classList.remove('reveal');
    tl.from(subtitle, { opacity: 0, y: 12, duration: 0.8 }, 1.6);
  }
  if (byline) {
    byline.classList.remove('reveal');
    tl.from(byline, { opacity: 0, y: 8, duration: 0.6 }, 2.0);
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

// ── NAV ACTIVE SECTION HIGHLIGHT ──
function initNavActive() {
  const links = document.querySelectorAll('.nav__links a');
  if (!links.length) return;

  ['claim', 'loophole', 'postselection', 'proof', 'standards'].forEach(id => {
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

// ── THEOREM NUMBER STAMP ──
function initTheoremStamps() {
  document.querySelectorAll('.theorem-card__number').forEach(num => {
    gsap.from(num, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: num,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onComplete: () => {
        gsap.to(num, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
      },
    });
  });
}

// ── ATMOSPHERE: gradient map ──
const ATMOSPHERE_GRADIENTS = {
  claim: 'radial-gradient(ellipse at 20% 80%, rgba(79,163,212,0.03) 0%, transparent 60%)',
  loophole: 'radial-gradient(ellipse at 85% 50%, rgba(201,64,64,0.04) 0%, transparent 60%)',
  postselection: 'radial-gradient(ellipse at 50% 80%, rgba(201,64,64,0.04) 0%, transparent 60%)',
  proof: 'radial-gradient(ellipse at 20% 50%, rgba(201,169,77,0.03) 0%, transparent 60%)',
  standards: 'radial-gradient(ellipse at 85% 50%, rgba(100,140,230,0.04) 0%, transparent 60%)',
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
  ['hook', 'claim', 'efficiency', 'loophole', 'postselection', 'proof', 'standards', 'conclusion', 'references'].forEach(id => bindAtmosphereSection(layer, id));
}
