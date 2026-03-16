// chshlab/js/story-mode.js
// Guided Rebuttal Mode — 6-step walkthrough overlay with focus trap

const STEPS = [
  {
    step: 1,
    claim: '"CHSH S > 2 means quantum nonlocality has been proven."',
    rebuttal: 'The CHSH inequality S <= 2 holds for any local hidden variable (LHV) model — but only when all particle pairs are detected. This is the starting point: understand what S > 2 would mean under ideal conditions.',
    expertNote: 'Theorem 1 (Classical CHSH Bound): For any LHV theory satisfying Locality, Realism, and Freedom, S <= 2. Proof follows from |A|, |B| <= 1 and the algebraic structure of the CHSH combination.',
    quiz: {
      question: 'Under ideal conditions (100% detection), what is the maximum CHSH S for a local hidden variable model?',
      choices: ['S = 1', 'S = 2', 'S = 2.828', 'S = 4'],
      answer: 1,
      explanation: 'The classical bound is S <= 2, proved by Clauser, Horne, Shimony, and Holt (1969).',
    },
    highlightSection: 'proofs',
  },
  {
    step: 2,
    claim: '"Detection efficiency doesn\'t affect the validity of Bell tests."',
    rebuttal: 'When detection efficiency eta falls below the critical threshold eta_c ~ 82.8%, LHV models can produce S > 2 by exploiting the detection loophole. The applicable bound becomes S_LHV,max(eta) = 4/eta - 2, not S = 2.',
    expertNote: 'At eta = 70%, S_LHV,max = 4/0.70 - 2 = 3.71. This exceeds even the Tsirelson bound of 2sqrt(2) ~ 2.828, meaning classical models can mimic "super-quantum" correlations when detection is poor.',
    quiz: {
      question: 'At detection efficiency eta = 70%, what is the maximum S achievable by a classical LHV model?',
      choices: ['S = 2.00', 'S = 2.83', 'S = 3.71', 'S = 4.00'],
      answer: 2,
      explanation: 'S_LHV,max(0.70) = 4/0.70 - 2 = 3.714. Classical models can exceed even the quantum Tsirelson bound when efficiency is low.',
    },
    highlightSection: 'rebuttal',
  },
  {
    step: 3,
    claim: '"Selecting on detected coincidences preserves statistical validity."',
    rebuttal: 'Outcome-dependent post-selection biases the correlation estimator. By preferentially retaining correlated event pairs, a purely classical LHV dataset can be filtered to produce S approaching 4 — far exceeding quantum limits.',
    expertNote: 'Theorem 3 (Post-Selection Inflation): Define selection function f(A,B) = 1 when AB = +1, f = rho when AB = -1. As rho -> 0, the post-selected correlator E_post(a,b) -> +/-1, giving S -> 4 from classical data.',
    quiz: {
      question: 'What is the theoretical maximum S achievable via post-selection on classical data?',
      choices: ['S = 2', 'S = 2.828', 'S = 3', 'S = 4'],
      answer: 3,
      explanation: 'Post-selection can drive S all the way to 4, the algebraic maximum, from purely classical data (Theorem 3).',
    },
    highlightSection: 'rebuttal',
  },
  {
    step: 4,
    claim: '"Reporting CHSH S is sufficient for a Bell claim."',
    rebuttal: 'At eta = 70%, a post-selected S ~ 3.7 exactly matches the classical artifact regime — making it indistinguishable from a purely classical source. Without additional diagnostics (full-dataset S, acceptance rate, no-signaling check), the result is uninterpretable.',
    expertNote: 'Required diagnostics: S_full (all events), S_selected (coincidences only), eta_eff (effective detection efficiency), r_accept(a,b) (acceptance rate per setting pair). Only S_selected is typically reported — the other three are needed to rule out artifacts.',
    quiz: {
      question: 'Which additional diagnostic is most critical for validating a Bell test result?',
      choices: ['The color of the laser', 'Acceptance rate per setting pair', 'The brand of detector', 'Room temperature'],
      answer: 1,
      explanation: 'The acceptance rate per setting pair reveals whether post-selection bias is inflating S. A low, setting-dependent acceptance rate is a red flag.',
    },
    highlightSection: 'rebuttal',
  },
  {
    step: 5,
    claim: 'Synthesis: the three theorems together',
    rebuttal: 'Theorem 1 gives the ideal bound (S <= 2). Theorem 2 gives the quantum maximum (S <= 2sqrt(2)). Theorem 3 shows post-selection can reach S = 4 classically. Together, they establish that S > 2 alone is insufficient — efficiency and post-selection must be controlled.',
    expertNote: 'The three theorems form a complete characterization: the classical region [0, 2], the quantum region (2, 2sqrt(2)], and the post-selection artifact region (2sqrt(2), 4]. Without knowing eta and the selection protocol, any observed S is ambiguous.',
    quiz: {
      question: 'In which range does a CHSH S value become ambiguous between quantum and classical explanations?',
      choices: ['S < 1', 'S between 2 and 2sqrt(2)', 'S between 2 and 4/eta - 2', 'S > 4'],
      answer: 2,
      explanation: 'When S is between the classical bound (2) and the LHV maximum at the actual efficiency (4/eta - 2), the result is ambiguous — it could be quantum or a classical artifact.',
    },
    highlightSection: 'proofs',
  },
  {
    step: 6,
    claim: 'What rigorous Bell testing requires',
    rebuttal: 'A genuine Bell violation requires either (a) detection efficiency above 82.8% (closing the detection loophole), or (b) explicit reporting of full-dataset S, acceptance rate per setting, effective detection efficiency, and a no-signaling consistency check.',
    expertNote: 'The 2015 loophole-free experiments (Delft, NIST, Vienna) achieved both high efficiency and spacelike separation. Wang et al. (2025) did not meet these standards — and this rebuttal explains precisely why their reported S values are inconclusive.',
    quiz: {
      question: 'What minimum detection efficiency closes the detection loophole for CHSH?',
      choices: ['50%', '70%', '82.8%', '100%'],
      answer: 2,
      explanation: 'eta_c = 2/(1+sqrt(2)) ~ 82.8%. Below this threshold, LHV models can produce S > 2 via the detection loophole (Eberhard 1993).',
    },
    highlightSection: 'proofs',
  },
];

let currentStep = 0;
let expertMode = false;
let overlay = null;
let previousFocus = null;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'story-mode';
  overlay.className = 'story-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Guided Rebuttal Mode');

  const inner = document.createElement('div');
  inner.className = 'story-inner';

  // Header
  const header = document.createElement('div');
  header.className = 'story-header';

  const title = document.createElement('h2');
  title.className = 'story-title';
  title.textContent = 'Guided Rebuttal';

  const controls = document.createElement('div');
  controls.className = 'story-header-controls';

  const expertBtn = document.createElement('button');
  expertBtn.className = 'story-expert-btn';
  expertBtn.textContent = 'Expert Mode';
  expertBtn.setAttribute('aria-pressed', 'false');
  expertBtn.addEventListener('click', () => {
    expertMode = !expertMode;
    expertBtn.setAttribute('aria-pressed', String(expertMode));
    expertBtn.classList.toggle('story-expert-btn--active', expertMode);
    renderStep();
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'story-close-btn';
  closeBtn.setAttribute('aria-label', 'Close story mode');
  closeBtn.textContent = '\u00d7';
  closeBtn.addEventListener('click', closeOverlay);

  controls.appendChild(expertBtn);
  controls.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(controls);

  // Content area
  const content = document.createElement('div');
  content.className = 'story-content';
  content.id = 'story-content';

  // Navigation
  const nav = document.createElement('div');
  nav.className = 'story-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'story-nav-btn story-nav-btn--prev';
  prevBtn.textContent = '\u2190 Back';
  prevBtn.addEventListener('click', () => { if (currentStep > 0) { currentStep--; renderStep(); } });

  const counter = document.createElement('span');
  counter.className = 'story-counter';
  counter.id = 'story-counter';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'story-nav-btn story-nav-btn--next';
  nextBtn.textContent = 'Next \u2192';
  nextBtn.addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) { currentStep++; renderStep(); }
    else closeOverlay();
  });

  nav.appendChild(prevBtn);
  nav.appendChild(counter);
  nav.appendChild(nextBtn);

  inner.appendChild(header);
  inner.appendChild(content);
  inner.appendChild(nav);
  overlay.appendChild(inner);

  document.body.appendChild(overlay);

  // Focus trap
  overlay.addEventListener('keydown', trapFocus);

  return overlay;
}

function renderStep() {
  const step = STEPS[currentStep];
  const content = document.getElementById('story-content');
  const counter = document.getElementById('story-counter');
  if (!content || !counter) return;

  // Clear
  while (content.firstChild) content.removeChild(content.firstChild);

  counter.textContent = 'Step ' + step.step + ' of ' + STEPS.length;

  // Step number
  const stepTag = document.createElement('span');
  stepTag.className = 'story-step-tag';
  stepTag.textContent = 'Step ' + step.step;
  content.appendChild(stepTag);

  // Claim card
  const claimCard = document.createElement('div');
  claimCard.className = 'story-claim';
  const claimText = document.createElement('p');
  claimText.textContent = step.claim;
  claimCard.appendChild(claimText);
  content.appendChild(claimCard);

  // Rebuttal card
  const rebuttalCard = document.createElement('div');
  rebuttalCard.className = 'story-rebuttal';
  const rebuttalText = document.createElement('p');
  rebuttalText.textContent = step.rebuttal;
  rebuttalCard.appendChild(rebuttalText);
  content.appendChild(rebuttalCard);

  // Expert mode content
  if (expertMode && step.expertNote) {
    const expertCard = document.createElement('div');
    expertCard.className = 'story-expert';
    const expertLabel = document.createElement('span');
    expertLabel.className = 'story-expert-label';
    expertLabel.textContent = 'Expert Detail';
    const expertText = document.createElement('p');
    expertText.textContent = step.expertNote;
    expertCard.appendChild(expertLabel);
    expertCard.appendChild(expertText);
    content.appendChild(expertCard);
  }

  // Quiz
  if (step.quiz) {
    const quizWrap = document.createElement('div');
    quizWrap.className = 'story-quiz';

    const qLabel = document.createElement('span');
    qLabel.className = 'story-quiz-label';
    qLabel.textContent = 'Quick Check';
    quizWrap.appendChild(qLabel);

    const qText = document.createElement('p');
    qText.className = 'story-quiz-question';
    qText.textContent = step.quiz.question;
    quizWrap.appendChild(qText);

    const choicesWrap = document.createElement('div');
    choicesWrap.className = 'story-quiz-choices';

    step.quiz.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'story-quiz-choice';
      btn.textContent = choice;
      btn.addEventListener('click', () => {
        // Disable all
        choicesWrap.querySelectorAll('button').forEach(b => {
          b.disabled = true;
          b.classList.add('story-quiz-choice--disabled');
        });
        if (idx === step.quiz.answer) {
          btn.classList.add('story-quiz-choice--correct');
        } else {
          btn.classList.add('story-quiz-choice--wrong');
          choicesWrap.children[step.quiz.answer].classList.add('story-quiz-choice--correct');
        }
        // Show explanation
        const expl = document.createElement('p');
        expl.className = 'story-quiz-explanation';
        expl.textContent = step.quiz.explanation;
        quizWrap.appendChild(expl);
      });
      choicesWrap.appendChild(btn);
    });

    quizWrap.appendChild(choicesWrap);
    content.appendChild(quizWrap);
  }

  // Update nav button states
  const prevBtn = overlay.querySelector('.story-nav-btn--prev');
  const nextBtn = overlay.querySelector('.story-nav-btn--next');
  if (prevBtn) prevBtn.disabled = currentStep === 0;
  if (nextBtn) nextBtn.textContent = currentStep === STEPS.length - 1 ? 'Finish' : 'Next \u2192';

  // Scroll content to top
  content.scrollTop = 0;
}

function trapFocus(e) {
  if (e.key === 'Escape') {
    closeOverlay();
    return;
  }
  if (e.key !== 'Tab') return;

  const focusable = overlay.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function openOverlay() {
  previousFocus = document.activeElement;
  currentStep = 0;
  expertMode = false;

  if (!overlay) createOverlay();
  overlay.classList.add('story-overlay--open');
  document.body.style.overflow = 'hidden';
  renderStep();

  // Focus the close button
  requestAnimationFrame(() => {
    const closeBtn = overlay.querySelector('.story-close-btn');
    if (closeBtn) closeBtn.focus();
  });
}

function closeOverlay() {
  if (!overlay) return;
  overlay.classList.remove('story-overlay--open');
  document.body.style.overflow = '';
  if (previousFocus) previousFocus.focus();
}

export function initStoryMode() {
  // Create "Walk me through it" button in hero
  const hero = document.querySelector('#hero .container');
  if (!hero) return;

  const btn = document.createElement('button');
  btn.className = 'story-trigger-btn';
  btn.textContent = 'Walk me through it \u2192';
  btn.addEventListener('click', openOverlay);

  // Insert after the bounds badges
  const bounds = hero.querySelector('.hero__bounds');
  if (bounds) {
    bounds.after(btn);
  } else {
    hero.appendChild(btn);
  }

  // Animate in (created after initScroll, so no ScrollTrigger catch-all)
  if (typeof gsap !== 'undefined') {
    gsap.from(btn, { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out', delay: 0.3 });
  }

  // Keyboard shortcut: 's' opens story mode
  document.addEventListener('keydown', (e) => {
    if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (overlay?.classList.contains('story-overlay--open')) return;
      e.preventDefault();
      openOverlay();
    }
  });
}
