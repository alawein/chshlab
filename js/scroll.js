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
  const heroSelectors = ['.hero__eyebrow', '.hero__title', '.hero__subtitle', '.hero__bounds'];
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
