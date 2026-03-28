const NAV_OFFSET = 52;
const MOBILE_BREAKPOINT = 600;
const HASH_LINK_SELECTOR = '.nav__links a, .nav__logo, .evidence-link, .section-dot';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isPlainLeftClick(event) {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey;
}

function registerScrollPlugin() {
  if (typeof gsap === 'undefined' || typeof ScrollToPlugin === 'undefined') return false;
  gsap.registerPlugin(ScrollToPlugin);
  return true;
}

function getTargetFromHash(hash) {
  if (!hash || !hash.startsWith('#') || hash.length === 1) return null;

  const id = decodeURIComponent(hash.slice(1));
  return document.getElementById(id);
}

export function focusTarget(target) {
  if (!target) return;

  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }

  target.focus({ preventScroll: true });
}

function updateHash(hash) {
  if (!hash) return;

  if (window.location.hash === hash) {
    window.history.replaceState(null, '', hash);
    return;
  }

  window.history.pushState(null, '', hash);
}

export function scrollToTarget(target, hash = target?.id ? `#${target.id}` : '') {
  if (!target) return;

  const targetTop = Math.max(
    0,
    window.scrollY + target.getBoundingClientRect().top - NAV_OFFSET,
  );

  if (registerScrollPlugin() && !prefersReducedMotion()) {
    gsap.to(window, {
      scrollTo: { y: target, offsetY: NAV_OFFSET },
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        updateHash(hash);
        focusTarget(target);
      },
    });
    return;
  }

  updateHash(hash);
  window.scrollTo({
    top: targetTop,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });

  window.setTimeout(() => focusTarget(target), prefersReducedMotion() ? 0 : 350);
}

function bindHashLinks(selector) {
  document.querySelectorAll(selector).forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      if (!isPlainLeftClick(event)) return;

      const target = getTargetFromHash(href);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target, href);
    });
  });
}

export function initSmoothScroll() {
  bindHashLinks(HASH_LINK_SELECTOR);
}

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  const button = document.getElementById('scrollTopBtn');
  if (!bar && !button) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (bar) bar.style.width = `${progress}%`;
    if (button) button.classList.toggle('scroll-top--visible', scrollTop > window.innerHeight);

    const hint = document.querySelector('.scroll-hint');
    if (hint) hint.classList.toggle('scroll-hint--hidden', scrollTop > 100);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  if (!button) return;

  button.addEventListener('click', () => {
    if (registerScrollPlugin() && !prefersReducedMotion()) {
      gsap.to(window, {
        scrollTo: { y: 0 },
        duration: 0.8,
        ease: 'power2.inOut',
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}

function setActiveDot(dots, id) {
  dots.forEach((dot) => {
    dot.classList.toggle('section-dot--active', dot.dataset.section === id);
  });
}

export function initSectionDots() {
  const dotsNav = document.getElementById('sectionDots');
  if (!dotsNav) return;

  const dots = Array.from(dotsNav.querySelectorAll('.section-dot'));
  const sections = ['hook', 'claim', 'efficiency', 'loophole', 'postselection', 'proof', 'standards', 'lab-dashboard', 'conclusion'];

  const currentHashTarget = getTargetFromHash(window.location.hash);
  if (currentHashTarget?.id) {
    setActiveDot(dots, currentHashTarget.id);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveDot(dots, entry.target.id);
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  });

  const toggleVisibility = () => {
    dotsNav.classList.toggle('section-dots--visible', window.scrollY > window.innerHeight * 0.5);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

export function initMobileNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (!nav || !toggle || !menu) {
    return { closeNav: () => {} };
  }

  const closeNav = () => {
    nav.classList.remove('nav--open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };

  const openNav = () => {
    nav.classList.add('nav--open');
    document.body.classList.add('nav-open');
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

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeNav());
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('nav--open')) return;
    if (nav.contains(event.target)) return;
    closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) closeNav();
  });

  return { closeNav };
}

export function initKeyboardShortcuts(closeNav = () => {}) {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });
}

export function restoreHashTargetFocus() {
  const target = getTargetFromHash(window.location.hash);
  if (!target) return;

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    window.scrollBy(0, -NAV_OFFSET);
    focusTarget(target);
  });
}
