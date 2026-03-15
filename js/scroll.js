// chshlab/js/scroll.js
// GSAP ScrollTrigger reveal animations

export function initScroll() {
  if (typeof gsap === 'undefined') return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero elements: animate immediately on load (no scroll trigger needed)
  const heroSelectors = ['.hero__eyebrow', '.hero__subtitle', '.hero__bounds'];
  heroSelectors.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power2.out',
      delay: i * 0.12,
    });
    el.classList.remove('reveal');
  });

  // Word-by-word title animation
  const titleEl = document.querySelector('.hero__title');
  if (titleEl) {
    const words = titleEl.textContent.trim().split(/\s+/);
    titleEl.textContent = ''; // clear
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
    gsap.from('.hero-word', {
      yPercent: 110,
      stagger: 0.06,
      duration: 0.8,
      ease: 'power3.out',
    });
    titleEl.classList.remove('reveal');
  }

  // All remaining .reveal elements: scroll-triggered
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}
