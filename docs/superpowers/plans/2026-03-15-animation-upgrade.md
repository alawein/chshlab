# Animation Upgrade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate CHSH Lab from basic fade-in reveals to cinematic physics documentary quality with red-pen annotations, orchestrated scroll sequences, hover micro-interactions, and polished demo transitions.

**Architecture:** CSS handles hover states, ambient effects, and GPU-composited transitions. GSAP handles scroll-triggered timeline orchestration. Two new files (`css/redpen.css`, `js/redpen.js`) for the red-pen annotation system. `js/scroll.js` gets a major rewrite consolidating all scroll choreography.

**Tech Stack:** CSS `@keyframes` + transitions (GPU-accelerated), GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin (CDN), vanilla JS for mousemove tracking.

**Spec:** `docs/superpowers/specs/2026-03-15-animation-upgrade-design.md`

**Verification:** This is a static site with no test framework. Each task's verification is visual — open `http://127.0.0.1:8081/` and confirm the animation works. A Python dev server is already running on port 8081.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `css/base.css` | Modify | Film grain animation, remove `scroll-behavior`, reduced-motion states |
| `css/layout.css` | Modify | Section rules, tab indicator, panels-wrap, hero overflow, remove section border |
| `css/components.css` | Modify | Hover interactions, border wipes, nav scroll, detail toggle, ambient glow, hero rule, slider glow, readout tick, panel transitions, will-change |
| `css/redpen.css` | **Create** | Red-pen annotation styles (underline, circle, strike, margin note) |
| `js/scroll.js` | **Rewrite** | Single GSAP timeline per section, hero sequence, nav scroll, dividers |
| `js/redpen.js` | **Create** | Red-pen annotation init, margin note creation, per-card GSAP timelines |
| `js/main.js` | Modify | Import redpen, smooth scroll, mousemove listeners, tab indicator, readout tick |
| `js/demo-chsh.js` | Modify | GSAP-tweened state interpolation, initial draw |
| `js/demo-efficiency.js` | Modify | GSAP-tweened state interpolation, initial SVG draw |
| `js/demo-postselect.js` | Modify | GSAP-tweened state interpolation, initial draw |
| `index.html` | Modify | DOM additions (ambient glow, hero rule, section dividers, tab indicator, panels-wrap, mark elements, ScrollToPlugin script, redpen.css link) |

---

## Chunk 1: CSS + HTML Foundations

### Task 1: CSS Animation Foundations

**Files:**
- Modify: `css/base.css`
- Modify: `css/layout.css`
- Modify: `css/components.css`
- Create: `css/redpen.css`

- [ ] **Step 1: Edit `css/base.css` — grain animation + reduced motion**

Add animation to existing `body::before` rule and extend `inset`. Remove `scroll-behavior: smooth` from `html`. Add reduced-motion final states.

Changes to `body::before` — add these properties to the existing rule:
```css
inset: -4px; /* was inset: 0 — prevents edge gap during grainShift */
animation: grainShift 0.15s steps(3) infinite;
will-change: transform;
```

Add after `body::before`:
```css
@keyframes grainShift {
  0%   { transform: translate(0, 0); }
  33%  { transform: translate(-2px, 1px); }
  66%  { transform: translate(1px, -1px); }
  100% { transform: translate(0, 0); }
}
```

In `html` rule: remove `scroll-behavior: smooth;`

In existing `@media (prefers-reduced-motion: reduce)` block, add inside:
```css
body::before { animation: none; }
.ambient-glow { animation: none; opacity: 0.5; }
.rebuttal-card::before { transform: scaleY(1); }
.hero__rule { transform: scaleX(1); }
.section-rule { transform: scaleX(1); }
[data-redpen="underline"],
[data-redpen="circle"],
[data-redpen="strike"] { clip-path: none; }
.figure-card__image-wrap { clip-path: none; }
.theorem-card__number { clip-path: none; }
.figure-card__label { clip-path: none; }
```

- [ ] **Step 2: Edit `css/layout.css` — structural additions**

Remove the `.section + .section` border-top rule (lines 22-24):
```css
/* DELETE: */
.section + .section {
  border-top: 1px solid var(--border);
}
```

Add `overflow: hidden` to `.section--hero`:
```css
.section--hero {
  min-height: 100svh;
  display: grid;
  place-items: center;
  text-align: center;
  overflow: hidden; /* ADD */
}
```

Add `position: relative` to existing `.demo-tabs` rule (required for the absolutely-positioned indicator):
```css
.demo-tabs {
  /* existing styles + add: */
  position: relative;
}
```

Remove `border-bottom-color: var(--amber)` from `.demo-tab.active, .demo-tab:hover`:
```css
.demo-tab.active,
.demo-tab:hover {
  color: var(--text);
  border-bottom-color: transparent; /* was var(--amber) */
}
```

Replace `.demo-panel` / `.demo-panel.active` (lines 129-130):
```css
/* DELETE: .demo-panel { display: none; } */
/* DELETE: .demo-panel.active { display: block; } */
.demo-panel {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  width: 100%;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0s 0.3s;
  pointer-events: none;
}
.demo-panel.active {
  visibility: visible;
  opacity: 1;
  position: relative;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0s 0s;
  pointer-events: auto;
}
```

Add at end of file:
```css
/* ── SECTION RULE (animated divider) ── */
.section-rule {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  max-width: var(--content-width);
  margin: 0 auto;
  transform: scaleX(0);
  transform-origin: center;
}

/* ── TAB SLIDING INDICATOR ── */
.demo-tabs__indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--amber);
  transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── DEMO PANELS WRAPPER ── */
.demo-panels-wrap {
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 3: Edit `css/components.css` — animation classes**

Add `will-change: transform` to existing `.rebuttal-card` rule.

Add to existing `.rebuttal-card::before` rule (the amber left border):
```css
transform: scaleY(0);
transform-origin: bottom;
transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
```

Add new rule:
```css
.rebuttal-card.is-visible::before {
  transform: scaleY(1);
}
```

Add hover interaction rules for `.rebuttal-card`:
```css
.rebuttal-card {
  /* existing styles + add: */
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  will-change: transform;
}
.rebuttal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
.rebuttal-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(201,169,77,0.04) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.rebuttal-card:hover::after { opacity: 1; }
```

Add figure card hover enhancement (update existing `.figure-card:hover .figure-card__image-wrap img` and add):
```css
.figure-card {
  /* existing styles + add: */
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  will-change: transform;
}
.figure-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.figure-card:hover .figure-card__label {
  color: var(--amber);
}
```

Add nav scroll state:
```css
.nav {
  /* existing styles + add: */
  transition: background 0.3s ease, border-color 0.3s ease;
}
.nav--scrolled {
  background: rgba(14, 15, 20, 0.95);
  border-bottom-color: rgba(201, 169, 77, 0.12);
}
```

Add slider thumb glow:
```css
input[type="range"]::-webkit-slider-thumb:hover,
input[type="range"]::-webkit-slider-thumb:active {
  box-shadow: 0 0 0 6px rgba(201,169,77,0.15);
}
input[type="range"]::-moz-range-thumb:hover,
input[type="range"]::-moz-range-thumb:active {
  box-shadow: 0 0 0 6px rgba(201,169,77,0.15);
}
```

Add readout tick animation:
```css
.readout-value {
  /* existing styles + add: */
  transition: transform 0.15s ease;
}
.readout-value.tick {
  transform: translateY(-2px);
}
```

Add ambient glow and hero rule:
```css
/* ── AMBIENT GLOW ── */
@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.8; transform: translate(-50%, -50%) scale(1.15); }
}

.ambient-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201,169,77,0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: glowPulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
}

/* ── HERO RULE ── */
.hero__rule {
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  margin: var(--space-4) auto;
  transform: scaleX(0);
  transform-origin: center;
}
```

Update theorem card details toggle. Replace the existing `summary::before` rules:
```css
.theorem-card summary::before {
  content: '+ ';
  display: inline-block;
  transition: transform 0.3s ease;
}
.theorem-card details[open] summary::before {
  transform: rotate(45deg);
}
```

Replace the existing `.theorem-card__proof` styles:
```css
.theorem-card__proof {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease, opacity 0.3s ease;
  opacity: 0;
  margin-top: var(--space-3);
}
.theorem-card details[open] .theorem-card__proof {
  grid-template-rows: 1fr;
  opacity: 1;
}
.theorem-card__proof > * {
  overflow: hidden;
}
.theorem-card__proof .proof-body {
  padding-left: var(--space-3);
  position: relative;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.theorem-card__proof .proof-body::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--blue);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s ease 0.2s;
}
.theorem-card details[open] .theorem-card__proof .proof-body::before {
  transform: scaleY(1);
}
```

- [ ] **Step 4: Create `css/redpen.css`**

```css
/* chshlab/css/redpen.css — Red-pen annotation system */

/* Base: all redpen marks */
[data-redpen] {
  background: none;
  color: inherit;
  position: relative;
}

/* Parent paragraphs need position:relative for margin note positioning */
.rebuttal-card__critique,
.rebuttal-card__evidence {
  position: relative;
}

/* Underline: crimson bottom border with highlight */
[data-redpen="underline"] {
  border-bottom: 2px solid var(--crimson);
  background: rgba(201, 64, 64, 0.08);
  padding-bottom: 1px;
  clip-path: inset(0 100% 0 0);
}

/* Circle: drawn around key terms */
[data-redpen="circle"] {
  position: relative;
}
[data-redpen="circle"]::after {
  content: '';
  position: absolute;
  top: -6px;
  left: -8px;
  right: -8px;
  bottom: -4px;
  border: 2px solid var(--crimson);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}

/* Strikethrough: line across refuted text */
[data-redpen="strike"] {
  position: relative;
}
[data-redpen="strike"]::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  background: var(--crimson);
  transform: scaleX(0);
  transform-origin: left;
}

/* Margin note (created by JS) */
.redpen-note {
  position: absolute;
  right: -220px;
  top: 0;
  width: 200px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--crimson);
  border-left: 2px solid var(--crimson);
  padding-left: 12px;
  line-height: 1.5;
  opacity: 0;
  transform: translateX(10px);
  pointer-events: none;
}
.redpen-note::before {
  content: '';
  position: absolute;
  left: -22px;
  top: 6px;
  width: 20px;
  height: 1px;
  background: rgba(201, 64, 64, 0.4);
}

/* Hover: brighten underline highlight */
[data-redpen="underline"]:hover {
  background: rgba(201, 64, 64, 0.15);
  cursor: pointer;
  transition: background 0.3s;
}

/* Responsive: hide margin notes on narrow viewports */
@media (max-width: 900px) {
  .redpen-note { display: none; }
}
```

- [ ] **Step 5: Verify CSS loads correctly**

Open `http://127.0.0.1:8081/` — page should render without errors. Film grain should shimmer subtly. Rebuttal card left borders should be invisible (scaleY:0). Hovering rebuttal/figure cards should lift with shadow. The `redpen.css` link isn't in HTML yet (that's Task 2), so no redpen styles visible yet.

- [ ] **Step 6: Commit**

```bash
git add css/base.css css/layout.css css/components.css css/redpen.css
git commit -m "feat(css): animation foundations — grain, hover, border wipes, redpen styles"
```

---

### Task 2: HTML Structure Updates

**Files:**
- Modify: `index.html`

All DOM additions required by the animation system.

- [ ] **Step 1: Add `css/redpen.css` link and ScrollToPlugin script**

In `<head>`, after the `components.css` link:
```html
<link rel="stylesheet" href="css/redpen.css" />
```

After the ScrollTrigger script tag:
```html
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js"></script>
```

- [ ] **Step 2: Add ambient glow and hero rule to hero section**

Inside `<section id="hero" class="section section--hero">`, before `<div class="container">`:
```html
<div class="ambient-glow"></div>
```

Inside the hero `.container`, between `.hero__subtitle` and `.hero__bounds`:
```html
<div class="hero__rule"></div>
```

- [ ] **Step 3: Add `<hr class="section-rule">` between all sections**

Add `<hr class="section-rule">` between each pair of `</section>` and `<section>` tags:
- After `</section>` closing `#hero`, before `<section id="paper">`
- After `</section>` closing `#paper`, before `<section id="rebuttal">`
- After `</section>` closing `#rebuttal`, before `<section id="demos">`
- After `</section>` closing `#demos`, before `<section id="proofs">`
- After `</section>` closing `#proofs`, before `<section id="figures">`
- After `</section>` closing `#figures`, before `<section id="references">`

- [ ] **Step 4: Add tab indicator and panels wrap**

In the `.demo-tabs` div, add as last child:
```html
<span class="demo-tabs__indicator"></span>
```

Wrap all three `.demo-panel` divs in:
```html
<div class="demo-panels-wrap">
  <!-- existing .demo-panel divs go here -->
</div>
```

- [ ] **Step 5: Add `<mark data-redpen>` elements to rebuttal cards**

**Card 1** — in `.rebuttal-card__critique` (the paragraph text):
```html
<p class="rebuttal-card__critique">
  This inference is only valid under loophole-free conditions &mdash; specifically, when detection efficiency
  <mark data-redpen="underline" data-note="Below critical &eta;c &asymp; 0.828 &mdash; loophole OPEN">&eta; &ge; 82.8%</mark>. Below this threshold, local hidden variable (LHV) models can produce <mark data-redpen="circle">S &gt; 2</mark>
  <mark data-redpen="strike">without any quantum entanglement</mark>.
</p>
```

**Card 2** — in `.rebuttal-card__critique`:
```html
<p class="rebuttal-card__critique">
  Outcome-dependent post-selection biases the correlation estimator. By preferentially retaining
  correlated event pairs, a purely classical LHV dataset can be filtered to produce <mark data-redpen="underline" data-note="Exceeds even quantum Tsirelson bound of 2&radic;2">S approaching 4</mark>
  &mdash; exceeding even the quantum Tsirelson bound.
</p>
```

**Card 3** — in `.rebuttal-card__critique`:
```html
<p class="rebuttal-card__critique">
  At detection efficiency <mark data-redpen="circle">&eta; = 70%</mark>, the LHV upper bound is S<sub>LHV,max</sub> = 4/0.70 &minus; 2 &approx; 3.71.
  A post-selected S &approx; 3.7 <mark data-redpen="underline" data-note="Matches classical artifact exactly &mdash; indistinguishable">exactly matches the classical artifact regime</mark> &mdash; making it
  <mark data-redpen="strike">indistinguishable from a purely classical source</mark> without additional diagnostics.
</p>
```

- [ ] **Step 6: Verify HTML structure**

Open `http://127.0.0.1:8081/` — check that:
- Ambient glow div is present (may not be visible yet without scroll.js changes)
- Section dividers render as invisible (scaleX:0)
- Tab indicator span exists (won't be positioned yet)
- Mark elements show with crimson underlines (redpen.css is now linked)
- Demo panels still switch correctly (visibility-based now)

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat(html): add animation DOM — glow, rule, dividers, tabs indicator, redpen marks"
```

---

## Chunk 2: JavaScript — Scroll + Redpen

### Task 3: scroll.js Major Rewrite

**Files:**
- Rewrite: `js/scroll.js`

Complete rewrite. The new file replaces ALL existing code.

- [ ] **Step 1: Write the new `js/scroll.js`**

```js
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
```

- [ ] **Step 2: Verify hero animation**

Open `http://127.0.0.1:8081/` — on load, watch hero sequence: eyebrow fades, title words blur-to-sharp with stagger, gold rule wipes from center, subtitle fades, badges stagger in. Grain should shimmer in background. Ambient glow should pulse behind hero.

- [ ] **Step 3: Verify scroll animations**

Scroll down through the page:
- Section dividers wipe from center as they enter viewport
- Nav gets `nav--scrolled` class (slightly darker) after scrolling past hero
- Rebuttal cards stagger in with depth, left borders wipe up, evidence blocks clip-in
- Theorem cards stagger with number label clip-path wipe and math blur reveal
- Figure cards cascade in with image curtain wipe from bottom

- [ ] **Step 4: Commit**

```bash
git add js/scroll.js
git commit -m "feat(scroll): cinematic scroll choreography — hero timeline, section reveals, nav state"
```

---

### Task 4: Red-Pen Annotations Module

**Files:**
- Create: `js/redpen.js`

- [ ] **Step 1: Write `js/redpen.js`**

```js
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
        // Scale + fade the circle pseudo-element via GSAP class
        tl.to(mark, {
          '--circle-opacity': 0.7,
          '--circle-scale': 1,
          duration: 0.4,
          ease: 'power2.out',
        }, delay);
        // Since we can't animate pseudo-elements directly with GSAP,
        // use a class toggle instead
        tl.call(() => mark.classList.add('redpen-visible'), null, delay);
      }

      if (type === 'strike') {
        // Scale the strikethrough line
        tl.call(() => mark.classList.add('redpen-visible'), null, delay);
      }
    });
  });
}
```

- [ ] **Step 2: Add CSS for `.redpen-visible` state**

Add to `css/redpen.css` at end:
```css
/* Visible states (toggled by JS) */
[data-redpen="circle"].redpen-visible::after {
  opacity: 0.7;
  transform: scale(1);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

[data-redpen="strike"].redpen-visible::after {
  transform: scaleX(1);
  transition: transform 0.6s ease;
}
```

- [ ] **Step 3: Verify red-pen annotations**

Open `http://127.0.0.1:8081/` and scroll to rebuttal section. Watch:
- Underline highlights wipe in from left with crimson border
- Circles draw around key numbers
- Strikethroughs animate across refuted claims
- Margin notes slide in from right (desktop only, hidden on <900px)

- [ ] **Step 4: Commit**

```bash
git add js/redpen.js css/redpen.css
git commit -m "feat: red-pen annotation system — underline, circle, strike, margin notes"
```

---

## Chunk 3: Demo Polish + Integration

### Task 5: main.js Updates + Demo Module Polish

**Files:**
- Modify: `js/main.js`
- Modify: `js/demo-chsh.js`
- Modify: `js/demo-efficiency.js`
- Modify: `js/demo-postselect.js`

- [ ] **Step 1: Rewrite `js/main.js`**

```js
// chshlab/js/main.js
// Entrypoint: KaTeX, tabs, smooth scroll, mousemove, module loading

function initKaTeX() {
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) {
      katex.render(latex, el, { displayMode: true, throwOnError: false });
    }
  });
}

function initTabs() {
  const tabs      = document.querySelectorAll('.demo-tab');
  const panels    = document.querySelectorAll('.demo-panel');
  const indicator = document.querySelector('.demo-tabs__indicator');

  function updateIndicator(tab) {
    if (!indicator || !tab) return;
    indicator.style.left  = tab.offsetLeft + 'px';
    indicator.style.width = tab.offsetWidth + 'px';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t   => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(tab.dataset.panel);
      if (target) target.classList.add('active');
      updateIndicator(tab);
    });
  });

  // Position indicator on the initially active tab
  const activeTab = document.querySelector('.demo-tab.active');
  if (activeTab) updateIndicator(activeTab);

  // Reposition on resize
  window.addEventListener('resize', () => {
    const active = document.querySelector('.demo-tab.active');
    if (active) updateIndicator(active);
  });
}

function initSmoothScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollToPlugin === 'undefined') return;
  gsap.registerPlugin(ScrollToPlugin);

  document.querySelectorAll('.nav__links a, .nav__logo').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 52 },
          duration: 0.8,
          ease: 'power2.inOut',
        });
      }
    });
  });
}

function initMouseGlow() {
  document.querySelectorAll('.rebuttal-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });
}

function initReadoutTick() {
  // Observe readout value changes and trigger tick animation
  document.querySelectorAll('.readout-value').forEach(el => {
    const observer = new MutationObserver(() => {
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 150);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  });
}

window.addEventListener('load', async () => {
  initKaTeX();
  initTabs();
  initSmoothScroll();
  initMouseGlow();
  initReadoutTick();

  const { initScroll }         = await import('./scroll.js');
  const { initAnnotations }    = await import('./annotations.js');
  const { initRedPen }         = await import('./redpen.js');
  const { initAngleDemo }      = await import('./demo-chsh.js');
  const { initEfficiencyDemo } = await import('./demo-efficiency.js');
  const { initPostSelectDemo } = await import('./demo-postselect.js');

  initScroll();
  initAnnotations();
  initRedPen();
  initAngleDemo();
  initEfficiencyDemo();
  initPostSelectDemo();
});
```

- [ ] **Step 2: Update `js/demo-chsh.js` with GSAP-tweened interpolation**

Replace the render-on-input approach with tweened state. Key changes to `initAngleDemo()`:

After the slider declarations, add a state object:
```js
const state = { a: deg(+sliders.a.value), ap: deg(+sliders.ap.value), b: deg(+sliders.b.value), bp: deg(+sliders.bp.value) };
```

Replace each slider's `input` listener to tween instead of calling render directly:
```js
Object.entries(sliders).forEach(([key, slider]) => {
  if (!slider) return;
  slider.addEventListener('input', () => {
    gsap.to(state, {
      [key]: deg(+slider.value),
      duration: 0.15,
      ease: 'power1.out',
      onUpdate: () => render(state),
    });
    if (valSpans[key]) valSpans[key].textContent = slider.value + '\u00b0';
  });
});
```

Refactor `render()` to use the `state` object directly. Remove the `Object.entries(sliders).forEach(...)` loop that reads raw slider values and updates valSpans — that's now handled by the slider listener above. The function becomes:

```js
function render() {
  const sq = computeS(corrQuantum, state.a, state.ap, state.b, state.bp);
  const sc = computeS(corrClassical, state.a, state.ap, state.b, state.bp);

  if (readoutQ) readoutQ.textContent = sq.toFixed(3);
  if (readoutC) readoutC.textContent = sc.toFixed(3);

  if (readoutQ && readoutQ.parentElement) {
    readoutQ.parentElement.style.color = sq > 2.01 ? 'var(--blue)' : 'var(--amber)';
  }

  drawDiagram(ctx, canvas, state, sq);
}
```

The `drawDiagram` call passes `state` which has `.a`, `.ap`, `.b`, `.bp` — same shape as the old `angles` object. The ResizeObserver callback should also call `render()` (no arguments needed now).

- [ ] **Step 3: Update `js/demo-efficiency.js` with GSAP-tweened interpolation**

Add state object:
```js
const state = { eta: parseFloat(slider.value) };
```

Replace slider listener:
```js
slider.addEventListener('input', () => {
  gsap.to(state, {
    eta: parseFloat(slider.value),
    duration: 0.15,
    ease: 'power1.out',
    onUpdate: () => {
      if (valEta) valEta.textContent = Math.round(state.eta * 100) + '%';
      const s = sLhvMax(state.eta);
      if (readout) readout.textContent = s.toFixed(3);
      if (readout && readout.parentElement) {
        readout.parentElement.style.color = state.eta < ETA_CRIT ? 'var(--crimson)' : 'var(--green)';
      }
      rebuild(state.eta);
    },
  });
});
```

- [ ] **Step 4: Update `js/demo-postselect.js` with GSAP-tweened interpolation**

Add state object:
```js
const state = { p: parseFloat(slider.value) };
```

Replace slider listener:
```js
slider.addEventListener('input', () => {
  gsap.to(state, {
    p: parseFloat(slider.value),
    duration: 0.15,
    ease: 'power1.out',
    onUpdate: () => render(),
  });
});
```

Update `render()` to use `state.p` instead of `slider.value`:
```js
function render() {
  const p = state.p;
  // ... rest uses p
}
```

- [ ] **Step 5: Add initial draw animations for demo panels**

In `js/main.js`, after all demo modules are initialized, add a ScrollTrigger for the demos section that triggers initial animations on the active panel:

```js
// Initial demo draw animation when section enters viewport
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  ScrollTrigger.create({
    trigger: '#demos',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      // Trigger initial draw on whichever panel is active
      const activePanel = document.querySelector('.demo-panel.active');
      if (!activePanel) return;
      const id = activePanel.id;

      if (id === 'demo-angle') {
        // Angle arms scale from center
        const canvas = document.getElementById('chshCanvas');
        if (canvas) {
          gsap.from(canvas, { scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out', transformOrigin: 'center center' });
        }
      }
      if (id === 'demo-efficiency') {
        // SVG path draws itself via stroke-dashoffset
        const svg = document.getElementById('efficiencySvg');
        if (svg) {
          gsap.from(svg, { opacity: 0, duration: 0.5, ease: 'power2.out' });
          // Path stroke-dashoffset animation handled by the rebuild() call
        }
      }
      if (id === 'demo-postselect') {
        const canvas = document.getElementById('postSelectCanvas');
        if (canvas) {
          gsap.from(canvas, { scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out', transformOrigin: 'center center' });
        }
      }
    },
  });
}
```

In `js/demo-efficiency.js`, update the `rebuild()` function to animate the LHV curve path on first call. Add a module-level flag:

```js
let firstDraw = true;
```

After the path element is appended in `rebuild()`, add:
```js
if (firstDraw) {
  const path = svg.querySelector('path');
  if (path) {
    const length = path.getTotalLength();
    path.setAttribute('stroke-dasharray', length);
    path.setAttribute('stroke-dashoffset', length);
    gsap.to(path, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' });
  }
  firstDraw = false;
}
```

- [ ] **Step 7: Verify demo polish**

Open the local dev server and test:
- Tab indicator slides smoothly between tabs (amber underline)
- Panel transitions fade in/out (not instant toggle)
- Slider thumbs have amber glow on hover
- Readout values tick up/down briefly when changing
- Dragging sliders produces smooth eased animation (angle arms sweep, bars fill fluidly)
- Nav links smooth-scroll with GSAP easing
- Hovering rebuttal cards shows cursor-following radial glow
- When demos section first scrolls into view, active panel animates in
- Efficiency SVG curve draws itself via stroke-dashoffset

- [ ] **Step 8: Commit**

```bash
git add js/main.js js/demo-chsh.js js/demo-efficiency.js js/demo-postselect.js
git commit -m "feat: demo polish — tab indicator, smooth scroll, tweened values, initial draw"
```

---

### Task 6: Visual Verification + Deploy

**Files:** None (verification only)

- [ ] **Step 1: Full page walkthrough**

Open `http://127.0.0.1:8081/` and perform complete scroll-through:

1. **Hero:** Film grain shimmers. Ambient glow pulses. Eyebrow → title (blur-to-sharp word stagger) → rule wipe → subtitle → badges stagger. All in sequence.
2. **Paper:** Schematic image reveals on scroll. Hotspots stagger in with pulse.
3. **Rebuttal:** Cards stagger with depth + scale. Left borders wipe up. Red-pen marks animate: underlines wipe, circles draw, strikethroughs cross out, margin notes slide in.
4. **Demos:** Tab indicator slides. Panel transitions fade. Sliders have glow. Values animate smoothly. Canvas/SVG interpolation is fluid.
5. **Theorems:** Cards stagger. "THEOREM N" clips in. Math blurs-to-sharp. Proof toggle rotates `+` to `x`, proof slides open with grid-rows, left border wipes down.
6. **Figures:** Cards cascade. Images curtain-reveal from bottom. Labels clip in. Hover lifts with depth shadow.
7. **References/Footer:** Simple fade reveals.
8. **Nav:** Darkens after hero. Links smooth-scroll. Logo smooth-scrolls to hero.
9. **Section dividers:** Gold rules wipe from center between all sections.

- [ ] **Step 2: Test reduced motion**

In browser devtools, emulate `prefers-reduced-motion: reduce`. Reload. All content should be visible immediately — no animations, no transitions, no grain shimmer. All elements at their final visual state.

- [ ] **Step 3: Test mobile (600px)**

Resize to 600px width. Check:
- Margin notes hidden (<900px)
- Tab bar scrollable
- Hero text left-aligned
- Cards stack vertically
- No horizontal overflow

- [ ] **Step 4: Fix any issues found**

Address any visual bugs or broken animations.

- [ ] **Step 5: Deploy to Vercel**

```bash
cd C:/Users/mesha/Desktop/GitHub/github.com/alawein/chshlab
vercel --prod
```

- [ ] **Step 6: Push to GitHub**

```bash
git push origin main
```
