// chshlab/js/redpen.js
// Red-pen annotation system — documentary-style paper markup

export function initRedPen() {
  if (typeof gsap === 'undefined') return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showAllAnnotations();
    return;
  }

  document.querySelectorAll('.rebuttal-card').forEach(card => animateCard(card));
}

function showAllAnnotations() {
  document.querySelectorAll('[data-redpen="underline"]').forEach(el => { el.style.clipPath = 'none'; });
  document.querySelectorAll('[data-redpen="circle"]').forEach(el => el.classList.add('redpen-visible'));
  document.querySelectorAll('[data-redpen="strike"]').forEach(el => el.classList.add('redpen-visible'));
}

function animateCard(card) {
  const marks = card.querySelectorAll('[data-redpen]');
  if (!marks.length) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: card,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  // Card entrance bloom
  tl.fromTo(card,
    { boxShadow: '0 0 0 0 rgba(201,169,77,0)' },
    { boxShadow: '0 0 40px 0 rgba(201,169,77,0.07)', duration: 0.6, ease: 'power2.out' },
    0
  );
  tl.to(card, { boxShadow: 'none', duration: 0.8, ease: 'power2.in' }, 0.8);

  marks.forEach((mark, i) => animateMark(tl, mark, i * 0.3));
}

function animateMark(tl, mark, delay) {
  const type = mark.dataset.redpen;

  if (type === 'underline') {
    tl.to(mark, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power2.out' }, delay);
    createMarginNote(tl, mark, delay + 0.4);
  }

  if (type === 'circle') {
    tl.call(() => mark.classList.add('redpen-visible'), null, delay);
  }

  if (type === 'strike') {
    tl.call(() => mark.classList.add('redpen-visible'), null, delay);
    // Ink dry — opacity settles after stroke draws
    tl.to(mark, { opacity: 0.65, duration: 0.2, delay: 0.1 }, delay + 0.6);
  }
}

function createMarginNote(tl, mark, delay) {
  const noteText = mark.dataset.note;
  if (!noteText) return;

  const note = document.createElement('span');
  note.className = 'redpen-note';
  note.textContent = noteText;
  mark.parentElement.appendChild(note);

  // Settle with slight tilt rotation
  tl.to(note, { opacity: 1, x: 0, rotation: 0, duration: 0.5, ease: 'power2.out' }, delay);
}
