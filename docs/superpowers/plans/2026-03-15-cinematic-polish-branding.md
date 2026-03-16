# Cinematic Polish, Figure Regeneration & Branding — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix audit bugs, layer cinematic animation upgrades (starfield, atmosphere, textile, hero drama, red-pen drama, figure scanner, theorem polish, nav active), regenerate all 5 figures with native dark-theme backgrounds, replace "meatheadphysicist" branding with Meshal Alawein identity + SEO, and prepare for deployment.

**Architecture:** Vanilla HTML/CSS/JS static site (no build step). GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin via CDN. KaTeX for math. CSS handles hover/ambient/texture overlays; GSAP handles scroll-triggered timeline choreography. Animation layers stacked by z-index: starfield canvas (-2) < atmosphere div (-1) < grain/textile pseudo-elements (0) < content sections (10) < nav (20).

**Tech Stack:** HTML5, CSS3 (custom properties, grid, clip-path, SVG filters), ES modules, GSAP 3.12.5 (CDN), KaTeX 0.16.9 (CDN), matplotlib 3.10+ (figure generation only, not shipped). Deployed on Vercel as static site.

**Hard Constraints:**
- GPU-composited properties only for continuous animations: `transform`, `opacity`
- `filter` and `clip-path` permitted for one-shot scroll reveals only
- No `innerHTML` with computed data -- `createElement`/`textContent` only
- Every new JS module exports a named `init*()` function, called from `main.js`
- Every animation has a `prefers-reduced-motion: reduce` guard
- No npm dependencies -- CDN only, `defer` on all scripts
- Static site: no build step, no bundler

---

## File Map

### Files Modified

| File | Responsibility | Changes |
|------|---------------|---------|
| `index.html` | Document structure | Add `<canvas#starfield>`, `<div.atmosphere-layer>`, SEO meta tags (OG, Twitter, JSON-LD), replace meatheadphysicist footer/references with Meshal Alawein branding + social links |
| `css/base.css` | Reset, typography, overlays | Add `#starfield` + `.atmosphere-layer` CSS, textile weave `body::after` overlay with `textileBreath` animation, `body { opacity: 0 }` for FOUC prevention, reduced-motion guards |
| `css/components.css` | Component styles | Remove dead `.reference-list` selector, remove `filter: invert()/hue-rotate()` from figure images + paper preview, add `.nav-link--active`, `.figures-scanner`, `.footer-socials`, theorem `details[open]` glow |
| `css/redpen.css` | Red-pen annotations | Change margin note initial transform from `translateX(10px)` to `translateX(20px) rotate(1deg)` |
| `js/main.js` | Entrypoint | Add body fade-in via GSAP, import `starfield.js`, double-rAF tab indicator timing fix |
| `js/scroll.js` | Scroll choreography | Extract `splitHeroTitle()` + `animateBadges()` helpers, add projector pre-flash + letter-spacing + badge power-on to hero timeline, add theorem number stamp, add `figureScanner()`, `initNavActive()`, `initAtmosphere()` with helper functions |
| `js/redpen.js` | Red-pen annotations | Refactor into `animateCard()` + `animateMark()` + `createMarginNote()`, add card entrance bloom, strikethrough ink-dry effect |
| `assets/figures/*.png` | 5 publication figures | Regenerate all with native `#0E0F14` dark backgrounds and site color system |

### Files Created

| File | Responsibility |
|------|---------------|
| `js/starfield.js` | Canvas starfield background with scroll parallax, vignette, particle drift |
| `scripts/generate_figures.py` | Matplotlib script generating all 5 dark-theme figures |

---

## Chunk 1: Bug Fixes + Dead Code Cleanup

### Task 1: Remove dead `.reference-list` CSS selector

**Files:**
- Modify: `css/components.css` (lines 514-534 in original, now removed)

- [ ] **Step 1: Identify the dead code**

The HTML uses `class="references-list"` (with 's') at `index.html:561`. CSS has both `.reference-list` (old, dead -- no HTML matches) and `.references-list` (active, matches HTML). The old selector at lines 514-534 is dead code.

- [ ] **Step 2: Remove the dead selector**

Delete the `.reference-list`, `.reference-list li`, and `.reference-list__num` rules (3 rule blocks, ~20 lines). The active `.references-list` and `.reference-item` rules at lines 612+ remain.

- [ ] **Step 3: Verify no HTML uses the old selector**

```bash
grep -r "reference-list[^s]" index.html
grep -r "references-list" index.html
```
First should find 0 matches, second should find 1 match (line 561).

### Task 2: Fix tab indicator timing (A5 bug)

**Files:**
- Modify: `js/main.js` (line 37-40)

- [ ] **Step 1: Wrap initial `updateIndicator` in double rAF**

Replace:
```js
const activeTab = document.querySelector('.demo-tab.active');
if (activeTab) updateIndicator(activeTab);
```

With:
```js
const activeTab = document.querySelector('.demo-tab.active');
if (activeTab) {
  requestAnimationFrame(() => requestAnimationFrame(() => updateIndicator(activeTab)));
}
```

**Why:** KaTeX renders asynchronously after `load` event. Adjacent math elements may still be expanding when `updateIndicator` measures `offsetLeft`/`offsetWidth`. The double-rAF defers measurement past the next two paint frames, ensuring KaTeX layout is settled.

- [ ] **Step 2: Verify tab indicator positions correctly**

Open browser, navigate to Demos section. Verify the amber indicator bar aligns exactly under the active "Angle Sweep" tab. Click other tabs -- indicator should slide smoothly to the new tab.

- [ ] **Step 3: Commit**

```bash
git add css/components.css js/main.js
git commit -m "fix: remove dead reference-list CSS, double-rAF tab indicator timing"
```

---

## Chunk 2: Starfield Canvas + Textile Overlay

### Task 3: Create starfield.js module

**Files:**
- Create: `js/starfield.js`

- [ ] **Step 1: Write the starfield module**

Export `initStarfield()`. Requirements:
- Grab existing `<canvas id="starfield">` (no DOM creation)
- Reduced motion: set `canvas.style.display = 'none'`, return immediately
- Spawn 120 particles on desktop (`innerWidth >= 600`), 40 on mobile
- Each particle: random `x, y`, `radius` 0.3-1.2px, `vx`/`vy` in [-0.04, 0.04]
- Color tints: randomly pick from amber `rgba(201,169,77,a)`, blue `rgba(100,140,230,a)`, white `rgba(255,255,255,a)` at 8-25% opacity
- Continuous drift with edge wraparound (wrap at -2/+2 px past bounds)
- Scroll parallax: track `lastScrollY`, compute delta per frame, apply `scrollDelta * 0.02 * (scrollDecay / 60)` as vertical boost, decay over 60 frames
- Canvas opacity lerps from 1.0 (hero, `scrollY < innerHeight`) to 0.3 (below hero)
- Draw radial vignette each frame: transparent center to `rgba(14,15,20,0.75)` edges
- `requestAnimationFrame` loop; skip draw when `document.visibilityState === 'hidden'`
- Handle `window.resize`: update `canvas.width`/`canvas.height`

- [ ] **Step 2: Add canvas and atmosphere div to index.html**

Insert as first children of `<body>`, before the NAV comment:
```html
<canvas id="starfield" aria-hidden="true"></canvas>
<div class="atmosphere-layer" aria-hidden="true"></div>
```

- [ ] **Step 3: Add CSS for starfield canvas**

In `css/base.css`, add:
```css
#starfield {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
}
```

- [ ] **Step 4: Import and call in main.js**

Add import before `initScroll`:
```js
const { initStarfield } = await import('./starfield.js');
```
Call `initStarfield()` before `initScroll()`.

- [ ] **Step 5: Add reduced-motion CSS guard**

In `base.css` `@media (prefers-reduced-motion: reduce)` block, add:
```css
#starfield { display: none; }
```

- [ ] **Step 6: Verify in browser**

- Desktop: ~120 faint particles drifting slowly, amber/blue/white tints
- Scroll: particles briefly accelerate in scroll direction, then ease back
- Below hero: canvas fades to 30% opacity
- Dark vignette visible at viewport edges
- Tab hidden: no CPU usage (check DevTools Performance)

### Task 4: Add textile weave overlay

**Files:**
- Modify: `css/base.css`

- [ ] **Step 1: Add body::after textile layer**

After the existing `body::before` (film grain) block, add a `body::after` with:
- SVG `feTurbulence` with asymmetric `baseFrequency='0.015,0.08'` (low horizontal + high vertical = linen weave texture)
- `opacity: 0.025` on the SVG rect, `opacity: 0.6` on the pseudo-element
- `animation: textileBreath 8s ease-in-out infinite alternate` (pulses between 0.5 and 0.7 opacity)
- `z-index: 0`, `pointer-events: none`, `position: fixed`, `inset: 0`

- [ ] **Step 2: Add reduced-motion guard**

```css
body::after { animation: none; opacity: 0.5; }
```

- [ ] **Step 3: Verify in browser**

A very subtle directional texture should be visible over the background, especially on dark uniform areas. It should gently pulse in opacity. Must not interfere with text readability.

- [ ] **Step 4: Commit**

```bash
git add js/starfield.js css/base.css index.html js/main.js
git commit -m "feat: starfield canvas background with scroll parallax, textile weave overlay"
```

---

## Chunk 3: Hero Cinematic + Section Atmosphere

### Task 5: Enhance hero timeline

**Files:**
- Modify: `js/scroll.js`

- [ ] **Step 1: Extract splitHeroTitle() helper**

Move the word-split logic (creating outer/inner spans) into a standalone function `splitHeroTitle(titleEl)` to keep `heroTimeline()` under 50 lines.

- [ ] **Step 2: Extract animateBadges() helper**

Move badge animation into `animateBadges(tl)`. Each badge gets:
- Standard entry: `tl.from(badge, { opacity: 0, y: 20, scale: 0.95, duration: 0.7 }, t)`
- Power-on flash: `tl.to(badge, { borderColor: 'rgba(255,255,255,0.9)', duration: 0.1, yoyo: true, repeat: 1 }, t + 0.3)`

- [ ] **Step 3: Add projector pre-flash**

At timeline position 0.1, before eyebrow:
```js
const glow = document.querySelector('.ambient-glow');
if (glow) tl.to(glow, { opacity: 0.15, duration: 0.05, yoyo: true, repeat: 1 }, 0.1);
```

- [ ] **Step 4: Add letter-spacing compression**

In the `.hero-word` from-tween, add `letterSpacing: '0.12em'` to the from values. Words will animate from wide (0.12em) to normal (0em) spacing alongside the blur-to-sharp reveal.

- [ ] **Step 5: Verify hero sequence**

Load page. Sequence should be: brief ambient flash > eyebrow fade > title words sweep in with blur+letter-spacing compression > rule wipe > subtitle fade > badges stagger with border flash.

### Task 6: Section atmosphere washes

**Files:**
- Modify: `js/scroll.js`, `css/base.css`

- [ ] **Step 1: Add atmosphere CSS**

```css
.atmosphere-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0;
}
```
Reduced-motion: `.atmosphere-layer { display: none; }`

- [ ] **Step 2: Define gradient map constant**

```js
const ATMOSPHERE_GRADIENTS = {
  rebuttal: 'radial-gradient(ellipse at 20% 80%, rgba(192,57,43,0.04) 0%, transparent 60%)',
  demos: 'radial-gradient(ellipse at 85% 50%, rgba(100,140,230,0.04) 0%, transparent 60%)',
  figures: 'radial-gradient(ellipse at 50% 90%, rgba(201,169,77,0.03) 0%, transparent 50%)',
};
```

Other sections map to `'transparent'` (no gradient).

- [ ] **Step 3: Write fadeAtmosphere() helper**

```js
function fadeAtmosphere(layer, bg, show) {
  layer.style.background = bg;
  gsap.to(layer, {
    opacity: show ? 1 : 0,
    duration: show ? 1.2 : 0.8,
    overwrite: true,
    onComplete: () => { if (!show) layer.style.background = 'transparent'; },
  });
}
```

`overwrite: true` prevents competing tweens when user scrolls quickly between sections.

- [ ] **Step 4: Write bindAtmosphereSection() + initAtmosphere()**

Each section gets a `ScrollTrigger.create()` with `onEnter` (fade in gradient) and `onLeaveBack` (fade out). Called from `initScroll()`.

- [ ] **Step 5: Verify**

Scroll through site. Rebuttal section should have faint crimson bleed from bottom-left. Demos section should have faint blue from right. Figures section should have warm amber from bottom-center. Other sections: clean dark background.

- [ ] **Step 6: Commit**

```bash
git add js/scroll.js css/base.css
git commit -m "feat: hero projector flash, letter-spacing, badge power-on; section atmosphere washes"
```

---

## Chunk 4: Red-Pen Drama + Figure Scanner + Theorem Polish + Nav Active

### Task 7: Red-pen sequential drama

**Files:**
- Modify: `js/redpen.js`, `css/redpen.css`

- [ ] **Step 1: Refactor redpen.js into focused functions**

Extract: `showAllAnnotations()` (reduced motion), `animateCard(card)`, `animateMark(tl, mark, delay)`, `createMarginNote(tl, mark, delay)`.

- [ ] **Step 2: Add card entrance bloom**

In `animateCard()`, before mark animations:
```js
tl.fromTo(card,
  { boxShadow: '0 0 0 0 rgba(201,169,77,0)' },
  { boxShadow: '0 0 40px 0 rgba(201,169,77,0.07)', duration: 0.6, ease: 'power2.out' },
  0
);
tl.to(card, { boxShadow: 'none', duration: 0.8, ease: 'power2.in' }, 0.8);
```

- [ ] **Step 3: Add strikethrough ink-dry effect**

After the strike class toggle, add:
```js
tl.to(mark, { opacity: 0.65, duration: 0.2, delay: 0.1 }, delay + 0.6);
```

- [ ] **Step 4: Update margin note CSS initial state**

In `css/redpen.css`, change `.redpen-note` transform from `translateX(10px)` to `translateX(20px) rotate(1deg)`. The GSAP tween to `x: 0, rotation: 0` creates a "note being placed" settling effect.

### Task 8: Figure gallery scanner line

**Files:**
- Modify: `js/scroll.js`, `css/components.css`

- [ ] **Step 1: Add scanner CSS**

```css
.figures-scanner {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  pointer-events: none;
  z-index: 5;
}
```

- [ ] **Step 2: Write figureScanner() function**

Creates a `<div class="figures-scanner">` via `createElement`, appends to `#figures`, GSAP `fromTo` sweeps it `top: 0% -> 100%` with `opacity: 1 -> 0` over 0.6s. Called from the figure gallery timeline before card stagger.

Reduced-motion CSS: `.figures-scanner { display: none; }`

### Task 9: Theorem number stamp + proof glow

**Files:**
- Modify: `js/scroll.js`, `css/components.css`

- [ ] **Step 1: Add stamp after clip-path wipe**

After `tl.from(num, { clipPath: ... })`, add:
```js
tl.to(num, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '-=0.1');
```

- [ ] **Step 2: Add proof open glow CSS**

```css
.theorem-card details[open] {
  box-shadow: 0 0 0 1px rgba(100,140,230,0.2);
  transition: box-shadow 0.4s ease;
}
```

### Task 10: Nav active section highlight

**Files:**
- Modify: `js/scroll.js`, `css/components.css`

- [ ] **Step 1: Write initNavActive() + setActiveLink()**

`ScrollTrigger.create()` per section (`start: 'top center'`, `end: 'bottom center'`). On enter/enterBack, toggle `.nav-link--active` on matching nav link.

- [ ] **Step 2: Add CSS**

```css
.nav-link--active { color: var(--amber) !important; }
```

- [ ] **Step 3: Call from initScroll()**

Add `initNavActive()` at end of `initScroll()`.

- [ ] **Step 4: Commit**

```bash
git add js/redpen.js css/redpen.css js/scroll.js css/components.css
git commit -m "feat: red-pen drama, figure scanner, theorem stamp+glow, nav active section"
```

---

## Chunk 5: Body Fade-In + Dark-Theme Figures

### Task 11: Body fade-in (FOUC prevention)

**Files:**
- Modify: `css/base.css`, `js/main.js`

- [ ] **Step 1: Set body opacity to 0 in CSS**

```css
body { opacity: 0; }
.no-js body { opacity: 1; }
```

- [ ] **Step 2: Fade in on load in main.js**

At top of `window.addEventListener('load')` callback:
```js
if (typeof gsap !== 'undefined') {
  gsap.to(document.body, { opacity: 1, duration: 0.4, ease: 'power1.out' });
} else {
  document.body.style.opacity = '1';
}
```

- [ ] **Step 3: Add reduced-motion CSS**

```css
@media (prefers-reduced-motion: reduce) { body { opacity: 1; } }
```

### Task 12: Regenerate dark-theme figures

**Files:**
- Create: `scripts/generate_figures.py`
- Modify: `assets/figures/fig1_chsh_bounds.png` through `fig5_timeline.png`
- Modify: `css/components.css`

- [ ] **Step 1: Write the generation script**

Python script using matplotlib. Dark theme config:
- Background: `#0E0F14` (facecolor on fig + axes)
- Grid: `rgba(255,255,255,0.06)`
- Labels: `rgba(255,255,255,0.7)`, monospace font
- Titles: `rgba(255,255,255,0.85)`, serif font
- Colors: amber `#C9A94D`, blue `#648CE6`, crimson `#C0392B`, green `#6B8F71`
- DPI: 150, `bbox_inches='tight'`, `facecolor='#0E0F14'`, `edgecolor='none'`

5 figures:
1. **fig1_chsh_bounds.png** -- Bar chart: Classical LHV (2.001), Quantum (2.828), Post-Selected (3.716)
2. **fig2_efficiency_landscape.png** -- S_LHV_max(eta) = 4/eta - 2 curve with threshold annotation
3. **fig3_postselection_mechanism.png** -- Dual-axis: S_post(p) + acceptance_rate(p)
4. **fig4_bell_test_schematic.png** -- matplotlib.patches diagram (source, detectors, coincidence)
5. **fig5_timeline.png** -- Horizontal timeline 1964-2025 with zigzag layout

- [ ] **Step 2: Run the script**

```bash
cd chshlab && python scripts/generate_figures.py
```

Expected output: 5 PNG files written to `assets/figures/`.

- [ ] **Step 3: Remove CSS invert filter**

In `css/components.css`, delete from `.figure-card__image-wrap img`:
```css
filter: invert(0.88) hue-rotate(180deg) saturate(0.85);
```

Also remove the filter from `.paper-preview img`:
```css
filter: invert(0.88) hue-rotate(180deg) saturate(0.7);
```

- [ ] **Step 4: Verify figures in browser**

All 5 figures should display with native dark backgrounds matching the site. No color distortion. Amber/blue/crimson lines should match the site's design tokens.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate_figures.py assets/figures/ css/base.css css/components.css js/main.js
git commit -m "feat: dark-theme figures, body fade-in, remove CSS invert filters"
```

---

## Chunk 6: Branding and SEO

### Task 13: Remove meatheadphysicist, add Meshal Alawein branding

**Files:**
- Modify: `index.html`, `css/components.css`

- [ ] **Step 1: Add SEO meta tags to head**

After existing `<meta name="description">`, add:
- `<meta name="author" content="Meshal Alawein" />`
- `<meta name="keywords" content="Bell inequality, CHSH, detection loophole, ..." />`
- `<link rel="canonical" href="https://chshlab.meshal.ai" />`
- Open Graph tags (`og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:image`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- Schema.org JSON-LD `ScholarlyArticle` structured data with author `Meshal Alawein` and url `https://www.meshal.ai`

- [ ] **Step 2: Update references section**

Replace reference 5 (meatheadphysicist):
```html
<li class="reference-item">
  Alawein, M. (2025). CHSH Lab: Detection loophole analysis and post-selection bias in Bell tests.
  <a href="https://github.com/alawein/chshlab">github.com/alawein/chshlab</a>
</li>
```

- [ ] **Step 3: Replace footer**

Replace meatheadphysicist footer with:
- "CHSH Lab -- by Meshal Alawein" (linked to meshal.ai)
- Social links nav: meshal.ai, LinkedIn (/alawein), GitHub (/alawein), contact@meshal.ai
- "All simulations run client-side. No data is collected or transmitted."

- [ ] **Step 4: Add footer socials CSS**

```css
.footer-socials {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}
.footer-socials a {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border);
  transition: color 0.2s, border-color 0.2s;
}
.footer-socials a:hover {
  color: var(--amber);
  border-color: var(--amber-dim);
  text-decoration: none;
}
```

- [ ] **Step 5: Verify zero meatheadphysicist references remain**

```bash
grep -ri "meatheadphysicist" index.html css/ js/
```
Should find 0 matches.

- [ ] **Step 6: Commit**

```bash
git add index.html css/components.css
git commit -m "feat: Meshal Alawein branding, SEO meta tags, social footer, remove meatheadphysicist"
```

---

## Chunk 7: Verification and Deploy

### Task 14: Full visual verification

- [ ] **Step 1: Start local server**

```bash
cd chshlab && python -m http.server 8082
```

- [ ] **Step 2: Walk the visual audit checklist**

| Check | Expected |
|-------|----------|
| Film grain shimmer | Subtle, no frame drops |
| Textile weave | Faint directional texture, breathing opacity |
| Starfield particles | ~120 dots drifting, scroll parallax, fades below hero |
| Vignette | Dark edges visible in hero |
| Hero sequence | Flash > eyebrow > title(blur+spacing) > rule > subtitle > badges(flash) |
| Nav scroll | Darkens + amber border after hero |
| Nav active | Amber highlight on current section link |
| Section dividers | Gold wipe from center |
| Atmosphere | Crimson/blue/amber subtle washes per section |
| Rebuttal cards | Stagger + border wipe + cursor glow + red-pen annotations |
| Red-pen underlines | L-R clip wipe |
| Margin notes | Slide in with tilt, connector line |
| Circles/strikes | Class-toggled pseudo-element animations |
| Card bloom | Brief amber glow on card enter |
| Ink dry | Strikethrough settles to 65% opacity |
| Demo tabs | Indicator slides, panels cross-fade |
| Sliders | GSAP-eased, thumb glow |
| Readout tick | Brief bounce on value change |
| Theorem cards | Stagger + number stamp + math blur |
| Proof toggle | Grid expand + blue border wipe + card glow |
| Figure scanner | Amber line sweeps down before cards |
| Figure cards | Cascade + curtain + label wipe + caption fade |
| Figure images | Native dark backgrounds, correct colors, no CSS filter |
| Figure hover | Lift + shadow + scale + label amber |
| References | Fade reveal, correct citations |
| Footer | "by Meshal Alawein" + 4 social links |
| Reduced motion | Everything visible immediately, no animations |
| Mobile (600px) | No overflow, nav links hidden, notes hidden |

- [ ] **Step 3: Verify JS files parse cleanly**

Check each JS module for syntax errors by loading the page and verifying zero console errors in DevTools.

### Task 15: Push to GitHub

- [ ] **Step 1: Stage all changes**

```bash
git add index.html css/ js/ assets/figures/ scripts/
git status
```

- [ ] **Step 2: Commit (if not already committed per-task)**

```bash
git commit -m "feat: cinematic polish -- starfield, atmosphere, textile, hero drama, red-pen drama, figure scanner, theorem polish, dark-theme figures, Meshal Alawein branding + SEO"
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Verify Vercel deploy**

Check Vercel dashboard for successful build. Visit deployed URL and spot-check hero, figures, footer.
