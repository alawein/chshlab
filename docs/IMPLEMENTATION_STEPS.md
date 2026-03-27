---
type: canonical
source: none
sync: none
sla: none
---

# CHSH Lab — Implementation Steps

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a world-class static CHSH showcase site in three phases: MVP (Day 0), Polish (Day 1), Enhancements (Day 2).

**Architecture:** Vanilla HTML5 + CSS custom properties + ES modules + KaTeX + GSAP. No build step. All assets self-contained in `chshlab/`.

**Tech Stack:** HTML · CSS · JS · KaTeX 0.16 (CDN) · GSAP 3 + ScrollTrigger (CDN) · Google Fonts · GitHub Pages

**Security note:** All JS uses safe DOM APIs (createElement/appendChild/textContent/setAttribute). SVG elements are built programmatically via createElementNS. No innerHTML is used with user-controlled input. Only trusted constant strings are ever set via innerHTML, and those are flagged explicitly in comments.

---

## Chunk 1: Project Scaffold + Design System

### Task 1: Directory Structure and GitHub Pages Config

**Files:**
- Create: `chshlab/.nojekyll`
- Create: `chshlab/assets/figures/` (directory, populated in Task 2)
- Create: `chshlab/css/tokens.css`
- Create: `chshlab/css/base.css`

- [ ] **Step 1: Create `.nojekyll` file**

```bash
touch chshlab/.nojekyll
```
Expected: empty file exists at `chshlab/.nojekyll`

- [ ] **Step 2: Create assets/figures directory**

```bash
mkdir -p chshlab/assets/figures
```

- [ ] **Step 3: Copy rendered PNG figures from meatheadphysicist**

```bash
cp ../meatheadphysicist/projects/bell-inequality/figures/rendered/fig1_chsh_bounds.png chshlab/assets/figures/
cp ../meatheadphysicist/projects/bell-inequality/figures/rendered/fig2_efficiency_landscape.png chshlab/assets/figures/
cp ../meatheadphysicist/projects/bell-inequality/figures/rendered/fig3_postselection_mechanism.png chshlab/assets/figures/
cp ../meatheadphysicist/projects/bell-inequality/figures/rendered/fig4_bell_test_schematic.png chshlab/assets/figures/
cp ../meatheadphysicist/projects/bell-inequality/figures/rendered/fig5_timeline.png chshlab/assets/figures/
```
Expected: 5 PNG files in `chshlab/assets/figures/`

- [ ] **Step 4: Verify figures copied**

```bash
ls -lh chshlab/assets/figures/
```
Expected: 5 files, each > 0 bytes

- [ ] **Step 5: Write `css/tokens.css`**

Full content:
```css
/* chshlab/css/tokens.css */
:root {
  --bg:           #0E0F14;
  --surface:      #161820;
  --surface-2:    #1E2028;
  --surface-3:    #262834;

  --border:       rgba(255, 255, 255, 0.08);
  --border-light: rgba(255, 255, 255, 0.04);

  --text:         #EAE6DA;
  --text-muted:   #9A9485;
  --text-faint:   #5C5A55;

  --amber:        #C9A94D;
  --amber-dim:    #6B5820;
  --blue:         #4FA3D4;
  --blue-dim:     #1E3F54;
  --crimson:      #C94040;
  --crimson-dim:  #4A1010;
  --green:        #6B8F71;
  --green-dim:    #263429;

  --rule:         rgba(201, 169, 77, 0.20);

  --font-display: 'Cormorant Garant', 'Georgia', serif;
  --font-body:    'EB Garamond', 'Georgia', serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
  --space-6: 64px;
  --space-7: 96px;
  --space-8: 128px;

  --content-width: 760px;
  --wide-width:    1100px;

  --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

- [ ] **Step 6: Write `css/base.css`**

Full content (see PLAN.md §Design System for rationale):
```css
/* chshlab/css/base.css */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; font-size: 18px; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  position: relative;
}

/* Noise texture: pure CSS SVG data URI — no user input */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.15;
  color: var(--text);
}

h1 { font-size: clamp(2.5rem, 6vw, 5.5rem); font-weight: 300; }
h2 { font-size: clamp(1.8rem, 3.5vw, 3rem); }
h3 { font-size: clamp(1.3rem, 2.5vw, 2rem); }

p { max-width: 68ch; }

code, .mono {
  font-family: var(--font-mono);
  font-size: 0.78em;
  letter-spacing: 0.03em;
}

a { color: var(--blue); text-decoration: none; }
a:hover { text-decoration: underline; }

.katex { color: var(--text); }
.katex-display { overflow-x: auto; padding: var(--space-2) 0; }

hr { border: none; border-top: 1px solid var(--rule); margin: var(--space-6) 0; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 7: Commit**

```bash
cd chshlab
git add .nojekyll assets/ css/tokens.css css/base.css
git commit -m "chore: scaffold chshlab with design tokens, base typography, figures"
```

---

### Task 2: Layout + Component CSS

**Files:**
- Create: `chshlab/css/layout.css`
- Create: `chshlab/css/components.css`

- [ ] **Step 1: Write `css/layout.css`**

```css
/* chshlab/css/layout.css */

.container { width: 100%; max-width: var(--content-width); margin-inline: auto; padding-inline: var(--space-4); }
.container--wide { max-width: var(--wide-width); }

.section { padding-block: var(--space-8); position: relative; z-index: 10; }
.section + .section { border-top: 1px solid var(--border); }

.section-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: var(--space-3);
  display: block;
}

.hero {
  min-height: 100svh;
  display: grid;
  place-items: center;
  text-align: center;
  padding-block: var(--space-8);
}

.hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: var(--space-4);
}

.hero__title { margin-bottom: var(--space-4); max-width: 20ch; margin-inline: auto; }
.hero__subtitle { font-size: 1.1rem; color: var(--text-muted); max-width: 54ch; margin-inline: auto; margin-bottom: var(--space-5); }

.hero__bounds { display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; margin-bottom: var(--space-6); }

.bound-badge { border: 1px solid; padding: var(--space-2) var(--space-3); font-family: var(--font-mono); font-size: 12px; border-radius: 2px; }
.bound-badge--classical { border-color: var(--amber); color: var(--amber); }
.bound-badge--quantum   { border-color: var(--blue);  color: var(--blue); }
.bound-badge--artifact  { border-color: var(--crimson); color: var(--crimson); }

.rebuttal-grid { display: grid; gap: var(--space-5); }
.figure-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-4); }

.demo-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: var(--space-5); }

.demo-tab {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
  padding: var(--space-2) var(--space-4); background: none; border: none;
  color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.demo-tab.active, .demo-tab:hover { color: var(--text); border-bottom-color: var(--amber); }

.demo-panel { display: none; }
.demo-panel.active { display: block; }

.theorem-grid { display: grid; gap: var(--space-4); }

@media (min-width: 900px) {
  .theorem-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
  .hero { text-align: left; }
  .hero__bounds { justify-content: flex-start; }
  .demo-tabs { overflow-x: auto; }
}
```

- [ ] **Step 2: Write `css/components.css`**

(Nav, rebuttal cards, math blocks, theorem cards, figure cards, paper showcase, hotspots, citation card, demo canvas containers, range inputs, reference list, scroll reveal state.)

Key patterns:
- `.nav`: sticky, backdrop-filter blur, border-bottom
- `.rebuttal-card`: surface background, 3px left amber border, tag/claim/critique/evidence/implication slots
- `.hotspot`: absolute position, pulse animation via `@keyframes pulse`
- `.figure-card img`: `filter: invert(0.88) hue-rotate(180deg) saturate(0.85)` for dark theme adaptation
- `.reveal`: `opacity: 0; transform: translateY(20px)` — GSAP animates to final state
- `.no-js .reveal`: `opacity: 1; transform: none` — fallback if JS unavailable

Write the full component CSS following patterns detailed in PLAN.md §Component Map.

- [ ] **Step 3: Commit**

```bash
git add css/
git commit -m "feat: add layout and component CSS"
```

---

## Chunk 2: HTML Structure (index.html)

### Task 3: Full index.html

**Files:**
- Create: `chshlab/index.html`

Structure (7 sections):
1. `<nav>` — sticky logo + links
2. `#hero` — framing question, three bound badges, scroll cue
3. `#paper` — annotated schematic + citation card
4. `#rebuttal` — 3 rebuttal cards with claim/critique/evidence/implication
5. `#demos` — tab container for 3 demo panels
6. `#proofs` — 3 theorem cards with `<details>` proof collapse
7. `#figures` — 5 figure cards
8. `#references` — ordered citation list
9. `<footer>` — minimal source link

Math formula elements use pattern:
```html
<span class="math-display" data-latex="S \leq 2"></span>
```
KaTeX renders these via `main.js` on page load. All math is in the `data-latex` attribute — never in user-editable content.

CDN script tags (defer order):
1. KaTeX CSS (link)
2. KaTeX JS (defer)
3. KaTeX auto-render (defer)
4. GSAP core (defer)
5. GSAP ScrollTrigger (defer)
6. `js/main.js` (type="module")

- [ ] **Step 1: Write full index.html following the structure above**

- [ ] **Step 2: Validate HTML structure**

Open `chshlab/index.html` in browser. Verify all sections visible and no broken layout.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add full index.html with all sections, KaTeX/GSAP CDN"
```

---

## Chunk 3: JavaScript — Core + Demos

### Task 4: main.js + scroll.js + annotations.js

**Files:**
- Create: `chshlab/js/main.js`
- Create: `chshlab/js/scroll.js`
- Create: `chshlab/js/annotations.js`

- [ ] **Step 1: Write `js/main.js`**

```js
// chshlab/js/main.js
// Entrypoint: render KaTeX, init tabs, import modules

function initKaTeX() {
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) katex.render(latex, el, { displayMode: true, throwOnError: false });
  });
}

function initTabs() {
  document.querySelectorAll('.demo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.panel);
      if (target) target.classList.add('active');
    });
  });
}

window.addEventListener('load', async () => {
  initKaTeX();
  initTabs();

  const { initScroll }         = await import('./scroll.js');
  const { initAnnotations }    = await import('./annotations.js');
  const { initAngleDemo }      = await import('./demo-chsh.js');
  const { initEfficiencyDemo } = await import('./demo-efficiency.js');
  const { initPostSelectDemo } = await import('./demo-postselect.js');

  initScroll();
  initAnnotations();
  initAngleDemo();
  initEfficiencyDemo();
  initPostSelectDemo();
});
```

- [ ] **Step 2: Write `js/scroll.js`**

```js
// chshlab/js/scroll.js
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

  // Hero elements animate on load (no scroll trigger)
  const heroEls = ['.hero__eyebrow', '.hero__title', '.hero__subtitle', '.hero__bounds'];
  heroEls.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.from(el, { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out', delay: i * 0.12 });
    el.classList.remove('reveal');
  });

  // All remaining .reveal elements trigger on scroll
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });
}
```

- [ ] **Step 3: Write `js/annotations.js`**

All hotspot data is from trusted constants — no user input involved.

```js
// chshlab/js/annotations.js
const HOTSPOTS = [
  { id: 'A', x: 52, y: 18, tooltip: 'Detection efficiency not reported. At η < 82.8%, S > 2 is classically achievable.' },
  { id: 'B', x: 28, y: 62, tooltip: 'Post-selection on coincident detection events only — introduces outcome-dependent bias.' },
  { id: 'C', x: 72, y: 62, tooltip: 'Fair sampling assumption unjustified at very low efficiency.' },
  { id: 'D', x: 50, y: 85, tooltip: 'CHSH S claimed without acceptance-rate diagnostics or η-corrected LHV bound.' },
];

export function initAnnotations() {
  const preview = document.getElementById('paperPreview');
  if (!preview) return;

  HOTSPOTS.forEach(h => {
    const spot    = document.createElement('div');
    const label   = document.createElement('span');
    const tooltip = document.createElement('div');

    spot.className    = 'hotspot';
    label.className   = 'hotspot__label';
    tooltip.className = 'hotspot__tooltip';

    spot.setAttribute('role', 'button');
    spot.setAttribute('tabindex', '0');
    spot.setAttribute('aria-label', 'Hotspot ' + h.id + ': ' + h.tooltip);
    spot.style.left = h.x + '%';
    spot.style.top  = h.y + '%';

    // textContent only — no HTML injection
    label.textContent   = h.id;
    tooltip.textContent = h.tooltip;

    spot.appendChild(label);
    spot.appendChild(tooltip);
    preview.appendChild(spot);
  });
}
```

- [ ] **Step 4: Verify in browser: 4 pulsing hotspots appear on diagram with textContent tooltips**

- [ ] **Step 5: Commit**

```bash
git add js/main.js js/scroll.js js/annotations.js
git commit -m "feat: main entrypoint, GSAP scroll reveals, paper hotspot annotations"
```

---

### Task 5: Demo 1 — Angle Slider CHSH

**Files:**
- Create: `chshlab/js/demo-chsh.js`

- [ ] **Step 1: Write `js/demo-chsh.js`**

Formulas:
- Quantum: `E_Q(a,b) = -cos(a - b)` (singlet state, standard QM)
- Classical LHV: `E_C(a,b) = 1 - (2/π)|a-b mod π|` (deterministic LHV)
- CHSH: `S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|`

```js
// chshlab/js/demo-chsh.js

function corrQuantum(a, b)   { return -Math.cos(a - b); }
function corrClassical(a, b) {
  let diff = Math.abs(((a - b) + Math.PI) % (2 * Math.PI) - Math.PI);
  return 1 - (2 / Math.PI) * diff;
}
function computeS(fn, a, ap, b, bp) {
  return Math.abs(fn(a,b) - fn(a,bp) + fn(ap,b) + fn(ap,bp));
}
function deg(d) { return d * Math.PI / 180; }

export function initAngleDemo() {
  const canvas   = document.getElementById('chshCanvas');
  if (!canvas) return;
  const ctx      = canvas.getContext('2d');
  const sliders  = {
    a:  document.getElementById('sliderA'),
    ap: document.getElementById('sliderAp'),
    b:  document.getElementById('sliderB'),
    bp: document.getElementById('sliderBp'),
  };
  const labels   = { a: 'valA', ap: 'valAp', b: 'valB', bp: 'valBp' };
  const readoutQ = document.getElementById('readoutQuantum');
  const readoutC = document.getElementById('readoutClassical');

  function render() {
    const angles = {};
    Object.entries(sliders).forEach(([k, s]) => {
      angles[k] = deg(+s.value);
      document.getElementById(labels[k]).textContent = s.value + '\u00b0';
    });

    const sq = computeS(corrQuantum,   angles.a, angles.ap, angles.b, angles.bp);
    const sc = computeS(corrClassical, angles.a, angles.ap, angles.b, angles.bp);

    readoutQ.textContent = sq.toFixed(3);
    readoutC.textContent = sc.toFixed(3);
    readoutQ.parentElement.style.color = sq > 2.01 ? 'var(--blue)' : 'var(--amber)';

    drawDiagram(ctx, canvas, angles, sq);
  }

  Object.values(sliders).forEach(s => s.addEventListener('input', render));

  const ro = new ResizeObserver(() => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = 300;
    render();
  });
  ro.observe(canvas);
  render();
}

function drawDiagram(ctx, canvas, angles, sq) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const r  = Math.min(cx, cy) * 0.72;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Classical bound ring at r * (2/2√2)
  ctx.beginPath();
  ctx.arc(cx, cy, r * (1 / Math.sqrt(2)), 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(201,169,77,0.25)';
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  const drawAngle = (angle, color, lbl) => {
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(lbl, x + (x > cx ? 6 : -20), y + (y > cy ? 14 : -6));
  };

  drawAngle(angles.a,  '#C9A94D', 'a');
  drawAngle(angles.ap, '#C9A94D', "a'");
  drawAngle(angles.b,  '#4FA3D4', 'b');
  drawAngle(angles.bp, '#4FA3D4', "b'");

  ctx.fillStyle = sq > 2.01 ? '#4FA3D4' : '#C9A94D';
  ctx.font = 'bold ' + Math.floor(r * 0.22) + "px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.fillText('S = ' + sq.toFixed(3), cx, cy + 6);
  ctx.textAlign = 'left';
}
```

- [ ] **Step 2: Verify formula correctness**

In browser console:
```js
// Expected: S ≈ 2.828 (Tsirelson)
// angles: a=0, a'=90°, b=45°, b'=135°
```
Set sliders to those values and confirm quantum readout = 2.828 ± 0.001.
Confirm classical readout = 2.000 ± 0.001.

- [ ] **Step 3: Commit**

```bash
git add js/demo-chsh.js
git commit -m "feat: angle slider CHSH demo with live S computation and canvas diagram"
```

---

### Task 6: Demo 2 — Efficiency Threshold

**Files:**
- Create: `chshlab/js/demo-efficiency.js`

- [ ] **Step 1: Write `js/demo-efficiency.js`**

Builds SVG entirely via `createElementNS` — no innerHTML with external data.

```js
// chshlab/js/demo-efficiency.js

const ETA_CRIT = 2 / (1 + Math.sqrt(2)); // approx 0.8284

function sLhvMax(eta) { return 4 / eta - 2; }

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function svgText(content, attrs) {
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

export function initEfficiencyDemo() {
  const svg     = document.getElementById('efficiencySvg');
  if (!svg) return;
  const slider  = document.getElementById('sliderEta');
  const valEta  = document.getElementById('valEta');
  const readout = document.getElementById('readoutLhvMax');

  const W = 700, H = 350;
  const pad = { top: 30, right: 50, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top  - pad.bottom;

  const etaX = eta => pad.left + (eta - 0.5) / 0.5 * plotW;
  const sY   = s   => pad.top  + plotH - (Math.min(s, 6) / 6) * plotH;

  function rebuild(eta) {
    // Clear all children safely
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // LHV max curve path
    let d = '';
    for (let i = 0; i <= 100; i++) {
      const e = 0.5 + (i / 100) * 0.5;
      const s = sLhvMax(e);
      const x = etaX(e), y = sY(s);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }

    const tsiY   = sY(2 * Math.sqrt(2));
    const classY = sY(2);
    const critX  = etaX(ETA_CRIT);
    const markX  = etaX(eta);
    const markY  = sY(sLhvMax(eta));

    // Grid reference lines
    svg.appendChild(svgEl('line', { x1: pad.left, y1: tsiY,   x2: pad.left+plotW, y2: tsiY,   stroke: 'rgba(79,163,212,0.2)',  'stroke-dasharray': '4,4' }));
    svg.appendChild(svgEl('line', { x1: pad.left, y1: classY, x2: pad.left+plotW, y2: classY, stroke: 'rgba(201,169,77,0.2)', 'stroke-dasharray': '4,4' }));

    // LHV max curve
    svg.appendChild(svgEl('path', { d, fill: 'none', stroke: '#C94040', 'stroke-width': '2' }));

    // Critical threshold vertical
    svg.appendChild(svgEl('line', { x1: critX, y1: pad.top, x2: critX, y2: pad.top+plotH, stroke: 'rgba(201,169,77,0.5)', 'stroke-dasharray': '6,4' }));
    svg.appendChild(svgText('\u03b7_c\u22480.828', { x: critX+4, y: pad.top+14, fill: '#9A9485', 'font-family': 'JetBrains Mono,monospace', 'font-size': '10' }));

    // Current η marker
    svg.appendChild(svgEl('line', { x1: markX, y1: pad.top, x2: markX, y2: pad.top+plotH, stroke: 'rgba(255,255,255,0.12)' }));
    svg.appendChild(svgEl('circle', { cx: markX, cy: markY, r: '6', fill: '#C94040' }));

    // Bound labels
    svg.appendChild(svgText('2\u221a2', { x: pad.left+plotW+4, y: tsiY+4,   fill: '#4FA3D4', 'font-family': 'JetBrains Mono,monospace', 'font-size': '10' }));
    svg.appendChild(svgText('2',       { x: pad.left+plotW+4, y: classY+4, fill: '#C9A94D', 'font-family': 'JetBrains Mono,monospace', 'font-size': '10' }));

    // Axes
    svg.appendChild(svgEl('line', { x1: pad.left, y1: pad.top,         x2: pad.left,         y2: pad.top+plotH, stroke: 'rgba(255,255,255,0.12)' }));
    svg.appendChild(svgEl('line', { x1: pad.left, y1: pad.top+plotH,   x2: pad.left+plotW,   y2: pad.top+plotH, stroke: 'rgba(255,255,255,0.12)' }));

    // Axis labels
    svg.appendChild(svgText('Detection Efficiency \u03b7', { x: W/2, y: H-6, fill: '#5C5A55', 'font-family': 'JetBrains Mono,monospace', 'font-size': '11', 'text-anchor': 'middle' }));
    const yLabel = svgText('CHSH S', { x: 14, y: H/2, fill: '#5C5A55', 'font-family': 'JetBrains Mono,monospace', 'font-size': '11', 'text-anchor': 'middle', transform: 'rotate(-90, 14, ' + (H/2) + ')' });
    svg.appendChild(yLabel);
  }

  function update() {
    const eta = parseFloat(slider.value);
    valEta.textContent  = Math.round(eta * 100) + '%';
    const s = sLhvMax(eta);
    readout.textContent = s.toFixed(3);
    readout.parentElement.style.color = eta < ETA_CRIT ? 'var(--crimson)' : 'var(--green)';
    rebuild(eta);
  }

  slider.addEventListener('input', update);
  update();
}
```

- [ ] **Step 2: Verify formula at η=0.70**

Expected: S_LHV_max = 4/0.70 - 2 = 5.714 - 2 = 3.714. Readout should show 3.714, color crimson.
At η=0.83: 4/0.83 - 2 = 2.819 < 2.828. Color should switch to green.

- [ ] **Step 3: Commit**

```bash
git add js/demo-efficiency.js
git commit -m "feat: efficiency threshold SVG chart with programmatic DOM construction"
```

---

### Task 7: Demo 3 — Post-Selection Simulator

**Files:**
- Create: `chshlab/js/demo-postselect.js`

- [ ] **Step 1: Write `js/demo-postselect.js`**

Bias parameter `p` ∈ [0.01, 1.0]:
- `p=1`: no bias, all pairs kept, S stays near classical S=2
- `p→0`: strong bias toward correlated pairs, S inflates toward 4
- Formulas derived from Theorem 3 constructive example

```js
// chshlab/js/demo-postselect.js

const ETA_CRIT = 2 / (1 + Math.sqrt(2));

// Theorem 3 constructive: keep AB=+1 with prob 1, keep AB=-1 with prob p
// As p→0: inflated S→4; accept→0.5
// As p→1: no selection, S→2; accept→1.0
function postS(p)      { return 2 + (4 - 2) * (1 - p); }
function acceptRate(p) { return 0.5 + 0.5 * p; }

export function initPostSelectDemo() {
  const canvas        = document.getElementById('postSelectCanvas');
  if (!canvas) return;
  const ctx           = canvas.getContext('2d');
  const slider        = document.getElementById('sliderBias');
  const valBias       = document.getElementById('valBias');
  const readoutS      = document.getElementById('readoutPostS');
  const readoutAccept = document.getElementById('readoutAccept');
  const readoutVerdict = document.getElementById('readoutVerdict');

  const ro = new ResizeObserver(() => {
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    render();
  });
  ro.observe(canvas);

  function render() {
    const p      = parseFloat(slider.value);
    const s      = postS(p);
    const accept = acceptRate(p);

    valBias.textContent        = p.toFixed(2);
    readoutS.textContent       = s.toFixed(3);
    readoutAccept.textContent  = (accept * 100).toFixed(1) + '%';

    const suspect = s > 2 && accept < ETA_CRIT;
    readoutVerdict.textContent = suspect ? 'SUSPECT' : (s <= 2.01 ? 'Classical' : 'Check \u03b7');
    readoutVerdict.parentElement.style.color = suspect ? 'var(--crimson)' : 'var(--green)';

    drawGauge(ctx, canvas, s, accept);
  }

  slider.addEventListener('input', render);
  render();
}

function drawGauge(ctx, canvas, s, accept) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const barH   = 28;
  const gap    = 28;
  const startX = W * 0.15;
  const maxW   = W * 0.70;
  const sBarY  = H * 0.32;
  const aBarY  = sBarY + barH + gap;

  // S bar track
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(startX, sBarY, maxW, barH);
  ctx.fillStyle = s > 2.01 ? '#C94040' : '#C9A94D';
  ctx.fillRect(startX, sBarY, maxW * (s / 4), barH);

  // S markers at 2, 2√2, 4
  [[2, '#C9A94D', '2'], [2 * Math.sqrt(2), '#4FA3D4', '2\u221a2'], [4, '#5C5A55', '4']].forEach(([val, color, lbl]) => {
    const x = startX + maxW * (val / 4);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, sBarY - 6); ctx.lineTo(x, sBarY + barH + 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(lbl, x, sBarY - 10);
  });

  // Acceptance bar track (50%–100% range)
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(startX, aBarY, maxW, barH);
  const accFrac = (accept - 0.5) / 0.5;
  ctx.fillStyle = accept >= ETA_CRIT ? '#6B8F71' : '#C94040';
  ctx.fillRect(startX, aBarY, maxW * Math.max(0, accFrac), barH);

  // η_c marker on acceptance bar
  const critX = startX + maxW * ((ETA_CRIT - 0.5) / 0.5);
  ctx.strokeStyle = '#C9A94D'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(critX, aBarY - 8); ctx.lineTo(critX, aBarY + barH + 8); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#C9A94D'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText('\u03b7_c', critX, aBarY - 12);

  // Row labels
  ctx.fillStyle = '#9A9485'; ctx.font = '11px JetBrains Mono, monospace'; ctx.textAlign = 'right';
  ctx.fillText('S', startX - 8, sBarY + barH / 2 + 4);
  ctx.fillText('Accept', startX - 8, aBarY + barH / 2 + 4);
  ctx.textAlign = 'left';
}
```

- [ ] **Step 2: Verify demo 3**

At p=0.01: S ≈ 3.98, accept ≈ 50.5%, verdict SUSPECT (crimson).
At p=1.00: S = 2.00, accept = 100%, verdict Classical (green).

- [ ] **Step 3: Commit**

```bash
git add js/demo-postselect.js
git commit -m "feat: post-selection bias simulator with bar gauge"
```

---

## Chunk 4: Day-1 Polish

### Task 8: Figure Filter Tuning + Mobile QA

- [ ] **Step 1: Check figures on dark background**

Open browser. If figures have harsh white halos or look inverted incorrectly, adjust in `css/components.css`:
```css
/* Option A — matplotlib white-background PNGs: */
filter: invert(0.88) hue-rotate(180deg) saturate(0.85);
/* Option B — transparent background: */
filter: brightness(0.9) saturate(0.85);
```
Pick whichever looks correct after visual inspection.

- [ ] **Step 2: Mobile layout QA at 375px**

Resize browser. Check: hero text wraps, demo sliders usable, nav links hidden, grids collapse to 1 column, no horizontal overflow.

- [ ] **Step 3: Commit**

```bash
git add css/
git commit -m "fix: figure filter, mobile layout polish"
```

---

### Task 9: KaTeX Verification

- [ ] **Step 1: Verify every math formula renders**

Check each `.math-display` in browser dev tools — no `[KaTeX parse error]` in console.

Expected formulas:
- `S \leq 2`
- `S \leq 2\sqrt{2} \approx 2.828`
- `S_{\text{LHV,max}}(\eta) = \frac{4}{\eta} - 2`
- `\eta_c = \frac{2}{1+\sqrt{2}} \approx 0.828`
- `S_{\text{post}} \to 4`

- [ ] **Step 2: Fix any parse errors and commit**

```bash
git add index.html
git commit -m "fix: KaTeX formula escaping"
```

---

## Chunk 5: Day-2 Enhancements

### Task 10: GitHub Pages Deployment

- [ ] **Step 1: Check if `chshlab/` is a standalone repo or subdirectory**

If subdirectory of a larger repo served at `/chshlab/`:
Add to `index.html` `<head>`: `<base href="/chshlab/">`
Verify all asset paths resolve correctly.

- [ ] **Step 2: Push and enable GitHub Pages**

```bash
git push origin main
```
GitHub repo → Settings → Pages → Source: `main` branch, `/` folder.

- [ ] **Step 3: Verify live site**

Navigate to GitHub Pages URL. Confirm: all figures load, KaTeX renders, demos work, no console errors.

---

### Task 11: Hero Intro Animation Enhancement

- [ ] **Step 1: Add word-by-word title animation in `js/scroll.js`**

In `initScroll()`, before the hero loop:

```js
const titleEl = document.querySelector('.hero__title');
if (titleEl) {
  // Split text into word spans using safe DOM methods
  const words = titleEl.textContent.trim().split(/\s+/);
  titleEl.textContent = '';
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
    inner.className = 'hero-word';
    inner.textContent = word;
    outer.appendChild(inner);
    if (i < words.length - 1) {
      outer.appendChild(document.createTextNode('\u00a0'));
    }
    titleEl.appendChild(outer);
  });

  gsap.from('.hero-word', {
    yPercent: 110, stagger: 0.06, duration: 0.8, ease: 'power3.out',
  });
  titleEl.classList.remove('reveal');
}
```

Note: this uses `textContent` and `createTextNode` only — no innerHTML.

- [ ] **Step 2: Commit**

```bash
git add js/scroll.js
git commit -m "feat: word-by-word hero title stagger animation using safe DOM methods"
```

---

## Acceptance Criteria

| Criteria | Test |
|----------|------|
| All 5 figures display on dark background (no white halos) | Visual QA |
| KaTeX renders 5+ formulas without console errors | Dev tools |
| Demo 1: a=0, a'=90, b=45, b'=135 → quantum S = 2.828 ± 0.001 | Manual |
| Demo 2: η=0.70 → S_LHV_max = 3.714 ± 0.001, color crimson | Manual |
| Demo 3: p=0.01 → S ≈ 3.98, verdict SUSPECT | Manual |
| GSAP reveals work, no jarring position jumps | Visual QA |
| `prefers-reduced-motion` disables all animations | Browser override |
| Mobile at 375px: no horizontal overflow | Responsive test |
| No console errors on page load | Dev tools |
| GitHub Pages: all assets load over HTTPS | Live URL |
| `.nojekyll` present (prevents Jekyll) | File check |
| All JS uses textContent / createElement — no innerHTML with user data | Code review |
