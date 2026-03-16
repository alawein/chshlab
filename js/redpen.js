// chshlab/js/redpen.js
// Red-pen annotation system — documentary-style paper markup

export function initRedPen() {
  if (typeof gsap === 'undefined') return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Show all annotations immediately
    document.querySelectorAll('[data-redpen="underline"]').forEach(el => {
      el.style.clipPath = 'none';
    });
    document.querySelectorAll('[data-redpen="circle"]').forEach(el => {
      el.classList.add('redpen-visible');
    });
    document.querySelectorAll('[data-redpen="strike"]').forEach(el => {
      el.classList.add('redpen-visible');
    });
    return;
  }

  // Group marks by parent .rebuttal-card
  const cards = document.querySelectorAll('.rebuttal-card');

  cards.forEach(card => {
    const marks = card.querySelectorAll('[data-redpen]');
    if (!marks.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    marks.forEach((mark, i) => {
      const type = mark.dataset.redpen;
      const delay = i * 0.3;

      if (type === 'underline') {
        // Wipe underline highlight L→R
        tl.to(mark, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.6,
          ease: 'power2.out',
        }, delay);

        // Create margin note if data-note exists
        const noteText = mark.dataset.note;
        if (noteText) {
          const note = document.createElement('span');
          note.className = 'redpen-note';
          note.textContent = noteText;
          mark.parentElement.appendChild(note);

          // Position note vertically aligned with the mark
          const noteDelay = delay + 0.4;
          tl.to(note, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
          }, noteDelay);
        }
      }

      if (type === 'circle') {
        // Use class toggle for pseudo-element animation
        tl.call(() => mark.classList.add('redpen-visible'), null, delay);
      }

      if (type === 'strike') {
        // Use class toggle for pseudo-element animation
        tl.call(() => mark.classList.add('redpen-visible'), null, delay);
      }
    });
  });
}
