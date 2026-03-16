# CHSH Lab Animation Upgrade — Design Spec

**Date:** 2026-03-15
**Approach:** CSS + GSAP Hybrid (Approach B)
**Goal:** Elevate from basic fade-in reveals to cinematic physics documentary quality

---

## Design Philosophy

The site tells the story of a physics rebuttal. Every animation serves the narrative: a documentary narrator marking up a flawed paper, chapter-like section reveals, figures that draw themselves in, numbers that roll to their values. Premium, elegant, easy on the eye — never flashy or gratuitous.

**Constraints:**
- No WebGL, no heavy frameworks — only CSS animations + GSAP (already loaded)
- Prefer GPU-composited properties (`transform`, `opacity`) for frequent/continuous animations
- `filter` and `clip-path` trigger paint (not just compositing) — acceptable for one-shot animations (scroll reveals AND load animations that fire once), not for continuous/repeating animations
- All animations respect `prefers-reduced-motion: reduce`
- No `innerHTML` with computed data (security hook) — `createElement`/`textContent` only
- Static site, no build step

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Hover states, ambient effects | CSS `@keyframes`, transitions, custom properties | GPU-composited, no JS needed |
| Scroll choreography | GSAP 3.12.5 + ScrollTrigger | Timeline orchestration, staggered sequences |
| Smooth scroll | GSAP ScrollToPlugin | Eased nav link scrolling |
| Mouse-follow glow | Vanilla JS `mousemove` in `js/main.js` | Sets `--mx`/`--my` CSS custom properties |
| SVG path drawing | GSAP + `stroke-dashoffset` | Curves trace themselves on scroll |
| Digit counters | GSAP or CSS `clip-path` | Numbers roll/wipe to values |

---

## Section 1: Hero — Cinematic Opening

**File changes:** `css/components.css`, `js/scroll.js`

### Animation sequence (single GSAP timeline, plays on load):

This **replaces** the existing hero animation code in `scroll.js` (the separate `gsap.from()` calls for hero elements and the word-by-word title code). The new code consolidates everything into one timeline.

1. Film grain overlay starts (CSS `@keyframes grainShift`, `steps(3)`, 150ms, infinite — separate from timeline)
2. Ambient glow fades in — radial gradient behind hero, pulses on 4s CSS cycle (separate from timeline)
3. Eyebrow (`.hero__eyebrow`) fades in (`opacity:0→1, y:16→0`, 0.8s)
4. Title (`.hero__title`) words reveal blur-to-sharp (`yPercent:110→0, filter:blur(4px)→blur(0)`, 0.9s, stagger 0.06s). Uses existing word-split approach with `createElement`/`textContent`.
5. Gold rule (`.hero__rule`) wipes from center (`scaleX:0→1`, 1.2s, `transform-origin: center`). **Note:** The rule is positioned in the DOM between subtitle and badges, but animates before the subtitle in the timeline — this is intentional (the rule "opens the stage" for the subtitle reveal).
6. Subtitle (`.hero__subtitle`) fades in (`opacity:0→1, y:12→0`, 0.8s)
7. Bound badges (`.hero__bounds .badge`) stagger in (`opacity:0→1, y:20→0, scale:0.95→1`, stagger 0.12s)

### New DOM elements (added to `index.html`):
- `<div class="hero__rule"></div>` — between subtitle and `.hero__bounds`
- `<div class="ambient-glow"></div>` — inside `.section--hero`, before `.container`

### CSS additions:
```css
@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.8; transform: translate(-50%, -50%) scale(1.15); }
}

.ambient-glow {
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201,169,77,0.06) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: glowPulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.hero__rule {
  width: 200px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  margin: var(--space-4) auto;
  transform: scaleX(0);
  transform-origin: center;
}
```

### `section--hero` needs `overflow: hidden` for `.ambient-glow` containment (in `css/layout.css`):
`.section--hero` already inherits `position: relative` from `.section`. Only `overflow: hidden` is new:
```css
.section--hero { overflow: hidden; }
```

---

## Section 2: Red-Pen Annotations

**File changes:** `index.html` (add `<mark>` elements + `<link>` for new CSS), new `css/redpen.css`, new `js/redpen.js`

### `index.html` changes:
- Add `<link rel="stylesheet" href="css/redpen.css" />` after the existing component CSS link
- Add `<mark data-redpen="...">` elements inside `.rebuttal-card__critique` and `.rebuttal-card__evidence` paragraphs (see HTML pattern below)

### Concept:
The rebuttal section becomes a "marked-up paper" where a documentary narrator highlights problems. Four annotation types:

| Type | Element | CSS Effect | GSAP Trigger |
|------|---------|-----------|-------------|
| Underline | `<mark data-redpen="underline">` | `border-bottom: 2px solid crimson`, background highlight via `clip-path` wipe L→R | ScrollTrigger per card |
| Circle | `<mark data-redpen="circle">` | `::after` pseudo-element, `border-radius:50%`, `scale(0.8)→scale(1)`, `opacity:0→0.7` | After underlines |
| Strikethrough | `<mark data-redpen="strike">` | `::after` pseudo-element line, `scaleX(0)→scaleX(1)`, `transform-origin: left` | After circles |
| Margin note | `<mark data-redpen="underline" data-note="...">` | Absolutely positioned `<span>` note, slides in from right (`translateX(10px)→0, opacity:0→1`) | After parent underline |

### Implementation:
- `js/redpen.js` exports `initRedPen()`
- Imported in `js/main.js` via: `const { initRedPen } = await import('./redpen.js');` then `initRedPen();`
- Queries all `[data-redpen]` elements
- Groups by parent `.rebuttal-card`
- Creates a GSAP timeline per card, triggered by ScrollTrigger (`start: 'top 75%'`)
- For `data-note` attributes: creates margin note via `document.createElement('span')` with `textContent` (no innerHTML). Note is appended as sibling to the `<mark>`, positioned absolutely.
- On viewports < 900px, margin notes are hidden (insufficient space). CSS: `.redpen-note { display: none; }` inside `@media (max-width: 900px)`.

### HTML pattern:
```html
<p class="rebuttal-card__critique">
  This inference is only valid when detection efficiency
  <mark data-redpen="underline" data-note="Below critical threshold">η ≥ 82.8%</mark>.
  Below this, LHV models can produce <mark data-redpen="circle">S > 2</mark>
  <mark data-redpen="strike">without any quantum entanglement</mark>.
</p>
```

**Note:** The existing `aria-labelledby` attributes on rebuttal cards reference IDs (`rebuttal-1-heading`, etc.) that don't exist in the current HTML. This is a pre-existing accessibility bug, not in scope for this animation spec.

### CSS for `css/redpen.css`:
```css
/* Red-pen annotation base */
[data-redpen] {
  background: none;
  color: inherit;
  position: relative;
}

/* Underline: crimson bottom border with highlight background */
[data-redpen="underline"] {
  border-bottom: 2px solid var(--crimson);
  background: rgba(201, 64, 64, 0.08);
  padding-bottom: 1px;
  /* Initial hidden state — GSAP animates clip-path */
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
  /* GSAP animates opacity and scale */
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
  /* GSAP animates scaleX */
}

/* Margin note (created by JS, appended as sibling) */
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
  /* GSAP animates opacity and translateX */
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

/* Parent paragraphs need position:relative for margin note positioning */
.rebuttal-card__critique,
.rebuttal-card__evidence {
  position: relative;
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

---

## Section 3: Rebuttal Cards — Staggered Depth Reveals

**File changes:** `css/components.css`, `js/scroll.js`, `js/main.js`

### Animations (GSAP ScrollTrigger, `start: 'top 85%'`):
- Cards within `#rebuttal` stagger at 0.15s intervals: `opacity:0→1, y:30→0, scale:0.97→1`
- Left border wipe: `.rebuttal-card::before` starts `scaleY(0)` (origin: bottom), wipes up when `.is-visible` class added by GSAP
- Evidence code blocks: `clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)` over 0.8s (typewriter wipe) — one-shot, paint-only
- Math blocks: `filter:blur(3px)→blur(0), opacity:0→1`, 0.3s after parent card — one-shot, paint-only
- Hover: radial glow follows cursor via `--mx`/`--my` custom props, card lifts 3px with depth shadow

### CSS additions:
```css
.rebuttal-card::before {
  /* existing amber left border — add: */
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.rebuttal-card.is-visible::before {
  transform: scaleY(1);
}

.rebuttal-card {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}
.rebuttal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
.rebuttal-card::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(201,169,77,0.04) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.rebuttal-card:hover::after { opacity: 1; }
```

### Mousemove listener (in `js/main.js`, not `js/scroll.js`):
```js
document.querySelectorAll('.rebuttal-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});
```

---

## Section 4: Demo Panels — Polished Interactions

**File changes:** `css/components.css`, `css/layout.css`, `js/main.js`, `js/demo-chsh.js`, `js/demo-efficiency.js`, `js/demo-postselect.js`

### Tab switching:

The `.demo-tabs` container gets a sliding underline indicator:

**DOM:** Add `<span class="demo-tabs__indicator"></span>` as the last child of `.demo-tabs`.

**CSS (in `css/layout.css`):**
```css
.demo-tabs {
  position: relative;
}
.demo-tabs__indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--amber);
  transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

**JS (in `initTabs()` in `main.js`):** On click and on init, read the active tab's `offsetLeft` and `offsetWidth`, set them as `indicator.style.left` and `indicator.style.width`. CSS transition handles the slide.

**Remove existing tab active border:** The existing `.demo-tab.active` has `border-bottom-color: var(--amber)`. This must be removed — the sliding indicator replaces it. Set `.demo-tab.active { border-bottom-color: transparent; }` and `.demo-tab:hover { border-bottom-color: transparent; }`.

**Panel transitions:**
The existing `.demo-panel` uses `display: none` / `.demo-panel.active { display: block }`. CSS transitions cannot animate from `display: none`. Replace with a visibility/opacity approach:
```css
/* Remove: .demo-panel { display: none; } */
/* Remove: .demo-panel.active { display: block; } */
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
**DOM change in `index.html`:** Wrap all `.demo-panel` divs in a new `<div class="demo-panels-wrap">` container.

**CSS in `css/layout.css`:**
```css
.demo-panels-wrap {
  position: relative;
  overflow: hidden;
}
```
This contains the absolutely-positioned inactive panels. The active panel (`position: relative`) sets the container's natural height.

### Slider polish:
```css
input[type="range"]::-webkit-slider-thumb:hover,
input[type="range"]::-webkit-slider-thumb:active {
  box-shadow: 0 0 0 6px rgba(201,169,77,0.15);
}
```

### Readout animation:
- On value change, readout span gets `.tick` class (JS), removed after 150ms via `setTimeout`
- CSS: `.readout-value { transition: transform 0.15s ease; } .readout-value.tick { transform: translateY(-2px); }`

### Canvas/SVG interpolation:
- Each demo module maintains a `state` object with current values
- On slider input, `gsap.to(state, { value: newVal, duration: 0.15, onUpdate: render })` tweens to the new value
- `render()` reads from `state`, not directly from slider

### Initial draw:
- When `#demos` section enters viewport (ScrollTrigger, `start: 'top 80%'`), trigger initial animation on the active panel:
  - CHSH: angle arms `gsap.from()` with `scale:0→1` from center
  - Efficiency: SVG path `stroke-dashoffset` animation
  - Post-selection: canvas bars `gsap.from()` growing from zero height

---

## Section 5: Theorem Cards — Proof Reveal Choreography

**File changes:** `css/components.css`, `js/scroll.js`

### Animations:
- Cards stagger at 0.2s intervals: `opacity:0→1, y:24→0`
- Theorem number label (`.theorem-card__number`): `clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)` over 0.4s (typewriter wipe) — one-shot
- KaTeX formula: `filter:blur(4px)→blur(0), opacity:0→1`, 0.3s after card enters — one-shot
- `.theorem-math` background: `opacity:0→1` simultaneously with formula

### Details toggle enhancement:

**Approach:** Use CSS `grid-template-rows: 0fr → 1fr` for smooth expand (no layout thrash, unlike `max-height`).

**Remove existing toggle content swap:** The existing CSS uses `content: '+ '` on `summary::before` and `content: '\2212 '` on `details[open] summary::before` (swaps `+` to minus). Remove the `details[open]` content swap. Keep `content: '+ '` on `summary::before` and add rotation:

```css
.theorem-card summary::before {
  content: '+ ';
  display: inline-block;
  transition: transform 0.3s ease;
}
.theorem-card details[open] summary::before {
  /* Remove: content: '\2212 '; */
  transform: rotate(45deg); /* + rotates to × */
}

.theorem-card__proof {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease, opacity 0.3s ease;
  opacity: 0;
  /* Move visual styling (margin, padding, border) to inner element */
}
.theorem-card details[open] .theorem-card__proof {
  grid-template-rows: 1fr;
  opacity: 1;
}
.theorem-card__proof > * {
  overflow: hidden;
}
```

**Proof inner styling:** The existing `.theorem-card__proof` has `margin-top`, `padding-left`, and `border-left`. Move `padding-left` and `border-left` to `.proof-body` so they collapse properly at `0fr`:
```css
/* Remove from .theorem-card__proof: padding-left, border-left */
.theorem-card__proof { margin-top: var(--space-3); } /* keep margin on grid container */
.theorem-card__proof .proof-body {
  padding-left: var(--space-3);
}
```

**Proof left border wipe:** Use a `::before` pseudo-element on `.proof-body` (NOT `scaleY` on the text container, which would squish text):
```css
.theorem-card__proof .proof-body {
  position: relative;
}
.theorem-card__proof .proof-body::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 1px;
  background: var(--blue);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s ease 0.2s; /* 0.2s delay to start after content fades in */
}
.theorem-card details[open] .theorem-card__proof .proof-body::before {
  transform: scaleY(1);
}
```

---

## Section 6: Figure Gallery — Cinematic Reveals

**File changes:** `css/components.css`, `js/scroll.js`

### Animations (GSAP ScrollTrigger, `start: 'top 85%'`):
- Cards stagger at 0.12s intervals across the grid: `opacity:0→1, y:30→0, scale:0.95→1`
- Image curtain reveal: `clip-path` animated on `.figure-card__image-wrap` (the wrapper div, not the `<img>` directly): `clip-path: inset(100% 0 0 0) → inset(0 0 0 0)` over 0.8s — one-shot
- Caption (`.figure-card__caption`) fades in (`opacity:0→1`) 0.2s after image wipe
- Figure label (`.figure-card__label`): `clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)` left-to-right wipe — one-shot

### Hover enhancement:
```css
.figure-card {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}
.figure-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.figure-card:hover .figure-card__label {
  color: var(--amber); /* brighten on hover */
}
```

---

## Section 7: Ambient & Global Effects

**File changes:** `css/base.css`, `css/components.css`, `js/scroll.js`, `js/main.js`, `index.html`

### Film grain animation (in `css/base.css`):
Add animation to existing `body::before` rule. Also change `inset: 0` to `inset: -4px` to prevent edge bleed during the translate animation:
```css
body::before {
  /* existing noise texture properties unchanged, except: */
  inset: -4px; /* was inset: 0 — extended to prevent edge gap during grainShift translate */
  animation: grainShift 0.15s steps(3) infinite;
}
@keyframes grainShift {
  0%   { transform: translate(0, 0); }
  33%  { transform: translate(-2px, 1px); }
  66%  { transform: translate(1px, -1px); }
  100% { transform: translate(0, 0); }
}
```

### Nav scroll effect:
GSAP ScrollTrigger configuration in `js/scroll.js`:
```js
ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom top',
  onEnterBack: () => document.querySelector('.nav').classList.remove('nav--scrolled'),
  onLeave: () => document.querySelector('.nav').classList.add('nav--scrolled'),
});
```

CSS in `css/components.css`:
```css
.nav {
  /* existing properties + add: */
  transition: background 0.3s ease, border-color 0.3s ease;
}
.nav--scrolled {
  background: rgba(14, 15, 20, 0.95);
  border-bottom-color: rgba(201, 169, 77, 0.12);
}
```

### Section dividers:
Add `<hr class="section-rule">` **between** `</section>` closing tags, at these positions:
- Between `#hero` and `#paper`
- Between `#paper` and `#rebuttal`
- Between `#rebuttal` and `#demos`
- Between `#demos` and `#proofs`
- Between `#proofs` and `#figures`
- Between `#figures` and `#references`

The `<hr>` is placed **outside** `<section>` tags (between them). The existing border rule `.section + .section { border-top: 1px solid var(--border); }` in `layout.css` must be removed — replaced by these animated dividers.

CSS in `css/layout.css`:
```css
.section-rule {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  max-width: var(--content-width);
  margin: 0 auto;
  transform: scaleX(0);
  transform-origin: center;
}
```

GSAP in `js/scroll.js`: each `.section-rule` gets a ScrollTrigger that tweens `scaleX: 0 → 1` over 1s.

### Smooth scroll:
**`index.html` change:** Add CDN script tag after the ScrollTrigger script:
```html
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js"></script>
```

**`css/base.css` change:** Remove `scroll-behavior: smooth` from `html` rule (GSAP ScrollToPlugin takes over, avoids double-smooth-scroll).

**`js/main.js` change:** Nav link click handler (covers both `.nav__links a` and `.nav__logo` so the logo also smooth-scrolls after `scroll-behavior: smooth` is removed):
```js
document.querySelectorAll('.nav__links a, .nav__logo').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) gsap.to(window, { scrollTo: { y: target, offsetY: 52 }, duration: 0.8, ease: 'power2.inOut' });
  });
});
```

### Reduced motion:

**Layering with existing code:**
- `base.css` already has a blanket `@media (prefers-reduced-motion: reduce)` that sets `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important` on all elements. This handles all CSS animations/transitions automatically.
- `scroll.js` currently has an early return that sets `opacity:1; transform:none` on `.reveal` elements when reduced motion is preferred. **The rewritten `scroll.js` must expand this early return** to also:
  - Set final visual states on all new animation targets (`.rebuttal-card::before` → `scaleY(1)`, `.hero__rule` → `scaleX(1)`, `.section-rule` → `scaleX(1)`, etc.)
  - Skip all GSAP timeline creation (hero timeline, section timelines, nav scroll trigger, divider triggers)
  - Still add `.is-visible` class to cards (so border wipes show) and still register the nav scroll class toggle (a11y-neutral, just visual)
  - The `initRedPen()` in `redpen.js` must also check `prefers-reduced-motion` and if active, set all `clip-path` to `none`, all `opacity` to final values, and skip timeline creation
- The following CSS additions handle **visual final states** for elements that start hidden/clipped/scaled:

```css
@media (prefers-reduced-motion: reduce) {
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
}
```

---

## File Map

| File | Changes |
|------|---------|
| `css/tokens.css` | No changes |
| `css/base.css` | Film grain `@keyframes grainShift` + animation on `body::before`; remove `scroll-behavior: smooth` from `html`; reduced-motion final states |
| `css/layout.css` | `.section-rule` styles; tab indicator (`.demo-tabs__indicator`); `.section--hero { overflow: hidden }` addition; remove `.section + .section` border-top; `.demo-panels-wrap` container; panel visibility transitions |
| `css/components.css` | Hover interactions (rebuttal, figure cards); border wipes (`.is-visible`); clip-path reveals; detail toggle (`grid-template-rows`); figure hover depth; nav scroll state (`.nav--scrolled`); slider thumb glow; readout tick; panel transitions; `.ambient-glow` + `@keyframes glowPulse`; `.hero__rule` |
| `css/redpen.css` | **New** — all red-pen annotation styles (underline, circle, strike, margin note, responsive hide) |
| `js/scroll.js` | **Major rewrite** — replace existing hero code with single timeline; GSAP timelines per section with staggered reveals; nav scroll class toggle; section divider triggers; figure/theorem scroll choreography |
| `js/redpen.js` | **New** — `initRedPen()` export; creates margin notes via `createElement`/`textContent`; GSAP timeline per `.rebuttal-card` |
| `js/main.js` | Add `import('./redpen.js')` call; init smooth scroll via ScrollToPlugin; mousemove listeners for cursor-follow glow; tab indicator position logic; readout `.tick` class toggle |
| `js/demo-chsh.js` | GSAP-tweened state interpolation (0.15s); initial draw animation (arms extend) |
| `js/demo-efficiency.js` | GSAP-tweened state interpolation; initial SVG path draw via `stroke-dashoffset` |
| `js/demo-postselect.js` | GSAP-tweened state interpolation; initial bar growth animation |
| `index.html` | Add `<link>` for `css/redpen.css`; add ScrollToPlugin `<script>` tag; add `<mark data-redpen>` elements in rebuttal cards; add `.ambient-glow` div in hero; add `.hero__rule` div; add `.demo-tabs__indicator` span; wrap demo panels in `.demo-panels-wrap` div; add 6 `<hr class="section-rule">` between sections |

---

## Performance Budget

- **GPU-composited** (fast, no layout/paint): `transform`, `opacity` — used for all hover effects, continuous animations (grain, glow), and card reveals
- **Paint-triggering** (acceptable for one-shot animations): `filter: blur()`, `clip-path` — used only on elements that animate once (scroll reveals or load animations)
- **No layout-triggering animations**: no `width`/`height`/`top`/`left`/`max-height` animations
- **`will-change: transform`** — add to these specific elements in their CSS rules:
  - `body::before` (film grain, continuous)
  - `.rebuttal-card` (hover lift)
  - `.figure-card` (hover lift)
  - `.ambient-glow` (continuous pulse)
- `clip-path` one-shot reveals are acceptable because they fire once per element on scroll, not continuously
- GSAP ScrollTrigger uses `IntersectionObserver` internally — no scroll listener overhead
- Estimated total JS addition: ~3KB (redpen.js ~1.5KB, scroll.js timeline changes ~1.5KB)
- New CDN: GSAP ScrollToPlugin (`https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js`, ~2KB gzipped)
