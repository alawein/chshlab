---
type: canonical
source: none
sync: none
sla: none
---

# CHSH Lab — Narrative Upgrade Design Spec

**Date:** 2026-03-16
**Status:** Approved
**Goal:** Transform the CHSH Lab site from a confusing collection of cards/sections into a clear narrative experience with interactive GPU-accelerated figures, a separate formal paper page, proper SEO, and hyperlinked references.

---

## Audience

- **Primary:** Physics-literate academics (grad students, researchers) who know what Bell tests are but haven't seen this specific rebuttal
- **Secondary:** Educated general audience (science-curious, journalists) who need accessible on-ramps
- **Tone:** Rigorous scientific rebuttal with ~1-2% dry wit. Credible but human.

---

## Architecture

Two pages:
1. **index.html** — Narrative scroll experience with interactive demos embedded in the story
2. **paper.html** — Clean distill.pub-style formal article (full paper.tex content as semantic HTML)

Links between them. Same design system (tokens, fonts, dark theme).

---

## Narrative Flow (index.html) — 8 Beats

### Beat 1 — The Hook
Opening statement that frames the entire site in one sentence: "A 2025 paper in Science Advances claimed to violate Bell's inequality without entanglement. The result made waves. There's just one problem."

Author byline: `Meshal Alawein · meshal.ai · UC Berkeley`

No jargon. The reader knows: bold claim, this site examines it.

### Beat 2 — What They Did
Summarize/quote Wang et al.: the experiment, what they measured (S = 2.275 ± 0.057), what they claimed. Link to the paper DOI inline.

**Interactive:** Animated Bell test schematic — source emits particle pairs flying to Alice/Bob detectors. Settings selectable (a/a', b/b'). Outcomes flash (±1). Running correlation tally builds up. Auto-run or tap-to-emit. Replaces static Fig 4.

### Beat 3 — The Number That Matters
"Their detection efficiency was approximately 10^-18." Put in perspective with dry wit. Introduce CHSH S and classical bound S ≤ 2 with minimal explanation.

**Interactive:** Three Regions Gauge — horizontal bar showing S range [0,4] with colored zones: Classical [0,2], Quantum (2, 2.828], Artifact (2.828, 4]. Wang et al.'s S=2.275 pinned. As reader scrolls through later beats, simulation markers (S=2.001, S=3.716) animate onto the gauge.

### Beat 4 — The Detection Loophole
"Below 82.8% efficiency, classical models can fake a Bell violation." Theorem 1 presented inline.

**Interactive:** Upgraded Efficiency Landscape — LHV bound curve, Tsirelson line, classical bound. Draggable "you are here" marker. Wang et al.'s 10^-18 position marked with callout. Ambiguity zone filled with gradient. Replaces static Fig 2 and upgrades current Demo 2.

### Beat 5 — Post-Selection: The Real Issue
"When you discard 99.9999...% of your data, what's left isn't a fair sample." Theorem 3 inline.

**Interactive (new):** Post-Selection Event Stream — horizontal flow of event pairs (canvas dots). Filter gate accepts/rejects based on bias parameter. Accepted pairs continue and contribute to S; rejected fade out. Reader sees filtering warp the statistics visually.

**Interactive (upgraded):** Post-Selection Bias demo — bias slider controls rho. Dual display: particle stream + S value/acceptance rate gauges. Replaces static Fig 3 and upgrades current Demo 3.

### Beat 6 — We Built It
"Don't take our word for it. Here's a classical model that produces S = 3.716." Key result table (full dataset S=2.001 vs post-selected S=3.716). Theorem 2 (Tsirelson bound) presented here.

**Interactive (upgraded):** Angle Sweep — polar correlation diagram with two detector arms rotating on unit circle. Correlation arcs drawn in real time. S value updates as you drag angles. Replaces static Fig 1 and upgrades current Demo 1.

### Beat 7 — What Would Convince Us
The diagnostic protocol (5 items from paper). What a real loophole-free Bell test requires. Brief mention of 2015 experiments.

**Interactive:** Timeline of Bell test history — upgraded from current JS-generated timeline. Nodes for Bell 1964, CHSH 1969, Aspect 1982, Eberhard 1993, Loophole-free 2015, Wang 2025, This Rebuttal 2025. Click/hover for details. Status badges (established/contested/resolved). Replaces static Fig 5.

### Beat 8 — Conclusion + Links
Brief, sharp conclusion. Links to:
- paper.html ("Read the formal paper")
- GitHub repo
- Wang et al. DOI

Author info: `Meshal Alawein · meshal.ai · GitHub · LinkedIn · contact@meshal.ai`
"All simulations run client-side. Source code on GitHub."

---

## Interactive Figures — Complete Inventory

### Upgraded from Existing

| Demo | Current | Upgraded |
|------|---------|----------|
| Angle Sweep | Canvas2D bar chart | Polar correlation diagram, rotating detector arms, real-time arcs |
| Efficiency Landscape | SVG line + slider | Rich chart with ambiguity zone gradient, draggable marker, Wang et al. callout |
| Post-Selection Bias | Canvas2D gauge bars | Dual display: particle stream + gauge. Visual event filtering |

### Replacing Static PNGs

| Static Figure | Replaced By |
|---------------|-------------|
| Fig 1 (CHSH bounds) | Interactive bar chart in Beat 6 (animated transitions, hover for CIs) |
| Fig 2 (Efficiency landscape) | Merged into upgraded Efficiency demo in Beat 4 |
| Fig 3 (Post-selection mechanism) | Merged into upgraded Post-selection demo in Beat 5 |
| Fig 4 (Bell test schematic) | New animated Bell test in Beat 2 |
| Fig 5 (Timeline) | Interactive timeline in Beat 7 |

### Entirely New

| Visualization | Beat | Description |
|---------------|------|-------------|
| Animated Bell Test | 2 | Particle pairs fly from source to detectors. Settings selectable. Outcomes animate. Correlation tally builds. |
| Three Regions Gauge | 3 | Horizontal S range [0,4] with colored zones. Markers animate on as reader progresses. |
| Event Stream Filter | 5 | Flowing particle pairs pass through filter gate. Visual accept/reject. S inflates in real time. |

### GPU Acceleration

- All Canvas2D rendering with `will-change: transform` for layer promotion
- GSAP handles animations with GPU-composited properties (transform, opacity only)
- Particle animations (Bell test, event stream) use requestAnimationFrame + object pooling — pure canvas draws, no DOM per particle
- No WebGL needed — Canvas2D with compositing sufficient for this complexity
- `prefers-reduced-motion` guards on all animations

---

## Paper Page (paper.html)

### Design
- Same design system (tokens.css, fonts) but stripped down — no starfield, no ambient glow, no GSAP scroll animations
- Single column, ~700px max-width, generous line height
- Pure reading experience

### Structure
- Title, Author, Abstract
- Numbered sections: Introduction, Theoretical Background, Methods, Results, Discussion, Conclusion, Appendix
- KaTeX math blocks
- Interactive figures (same modules as main site) inline but smaller
- Sticky sidenotes on wide screens, collapsing inline on mobile

### Content Source
Full paper.tex converted to semantic HTML. All content already written.

### Navigation
- Top banner: "This is the formal paper. For the interactive experience, visit the main site →"
- Sticky table of contents sidebar (desktop)
- Section anchors for deep linking

---

## SEO

### Meta Tags
- Title: "Bell Violations Without Entanglement? A Reproducible Rebuttal — CHSH Lab"
- Description: Hook-first, not conclusion-first
- Open Graph: `article:author`, `article:published_time`
- Schema.org: Expanded ScholarlyArticle with `citation` array, `datePublished`, `isBasedOn`

### Content SEO
- H1 = narrative hook (clear, searchable)
- H2s match search intent: "What is the detection loophole?", "Can classical models fake Bell violations?"
- Canvas elements get descriptive aria-labels
- paper.html gets its own complete meta tags optimized for academic search

---

## References

### Inline Hyperlinks
Every paper mention in prose links to its DOI:
- Bell (1964) → Physics journal
- CHSH / Clauser et al. (1969) → PRL DOI
- Tsirelson (1980) → Lett. Math. Phys. DOI
- Eberhard (1993) → PRA DOI
- Pearle (1970) → PRD DOI
- Aspect et al. (1982) → PRL DOI
- Weihs et al. (1998) → PRL DOI
- Hensen et al. (2015) → Nature DOI
- Giustina et al. (2015) → PRL DOI
- Shalm et al. (2015) → PRL DOI
- Wang et al. (2025) → Science Advances DOI
- Freedman & Clauser (1972) → PRL DOI

### References Section
Full citations with DOI links collected at the bottom of both pages.

---

## Author Presentation

### Top (Beat 1)
Single-line byline: `Meshal Alawein · meshal.ai · UC Berkeley`
Minimal. Establishes credibility without taking space.

### Bottom (Beat 8 / Footer)
Expanded: `Meshal Alawein · meshal.ai · GitHub · LinkedIn · contact@meshal.ai`
Plus: "All simulations run client-side. Source code on GitHub."

---

## Migration from Current Codebase

### HTML Structure
This is a full rewrite of index.html. The current sections (hero, paper, rebuttal, demos, proofs, figures, references, footer) are replaced by the 8-beat narrative structure. No incremental refactor — the old structure does not map cleanly to the new narrative.

### Existing Features — Disposition

| Feature | Status | Notes |
|---------|--------|-------|
| Story Mode (story-mode.js) | **Remove** | The entire site is now a guided narrative; a separate walkthrough overlay is redundant |
| Provenance Drawers (provenance-data.js) | **Remove** | Static PNGs are gone; interactive figures are self-documenting. Provenance metadata moves to paper.html footnotes |
| Sonification (sonification.js) | **Keep** | Attach to new interactive figures via same `chshlab:state` event bus |
| Assumption Toggles | **Remove** | Conceptually absorbed into the narrative flow (Beat 4-5 explain assumptions contextually) |
| Bound Explorer panel | **Remove** | Replaced by the Three Regions Gauge in Beat 3 which serves the same purpose inline |
| Red Pen annotations (redpen.js) | **Remove** | The current annotated-paper-style markup is replaced by narrative prose. No more `data-redpen` marks |
| Export JSON / Permalink | **Keep** | Adapted to new figure IDs. Each interactive figure gets export + permalink support |
| Micro-interactions (animation-config.js) | **Keep** | Reuse card lift, button press presets on new elements |
| Starfield (starfield.js) | **Keep** | Background canvas unchanged |
| Keyboard shortcuts | **Keep** | Update shortcut targets (remove 's' for story mode, keep Escape for overlays) |
| Tab system (demo tabs) | **Remove** | Demos are no longer tabbed; each lives in its own narrative beat |
| Hotspot annotations (annotations.js) | **Remove** | The static paper preview with hotspots is replaced by the animated Bell test |

### Theorem Placement
Theorems 1, 2, 3 move inline into Beats 4, 6, and 5 respectively. The standalone Proofs section is removed. Each theorem is presented with a collapsible proof sketch (same `<details>` pattern) at the narrative moment it is relevant.

---

## Mobile & Responsive Behavior

### Breakpoints
- **≥900px:** Full layout — side-by-side prose and figures, sticky ToC on paper.html
- **600–899px:** Stacked layout — figures below prose, ToC collapses to hamburger
- **<600px:** Mobile — single column, touch-optimized controls, simplified nav

### Touch Interactions
- **Draggable markers** (Efficiency Landscape): Replace drag with tap-to-place or slider input. On touch, tapping the chart area moves the marker to that position.
- **Angle Sweep arms:** Replace drag with slider inputs below the polar diagram (4 angle sliders, same as current but controlling the polar view).
- **Event Stream:** Auto-runs on mobile. Bias parameter controlled by slider, not drag.
- **Bell Test animation:** Auto-runs. Tap to pause/resume. Settings selected via toggle buttons, not drag.

### Canvas Sizing
All canvases use `ResizeObserver` and render at `devicePixelRatio` for crisp display on high-DPI screens. Canvas CSS size is 100% of container width; internal resolution scales with DPR.

### Scroll Animations
On mobile Safari, avoid `position: sticky` combined with ScrollTrigger pinning. The Three Regions Gauge is NOT sticky — it appears in Beat 3 and markers are added via scroll-triggered callbacks as the reader passes Beats 5-6 (the gauge scrolls normally; markers animate when the gauge is in the viewport or re-entered).

---

## Three Regions Gauge — Behavior

The gauge is a static element in Beat 3. It is NOT sticky/fixed.
- **Beat 3:** Gauge appears with Wang et al. marker (S=2.275) and the three colored zones.
- **Beat 6:** When the reader scrolls to Beat 6, a ScrollTrigger callback checks if the gauge is in viewport. If visible, the simulation markers animate on. If the gauge has scrolled out of view, the markers are simply present when the user scrolls back up. No sticky positioning needed.

This avoids layout complexity and mobile scroll issues. The gauge is a "checkpoint" the reader can revisit.

---

## Error Handling & Fallbacks

### CDN Failures
- **GSAP not loaded:** All animation calls are guarded with `if (typeof gsap !== 'undefined')`. Without GSAP, content displays statically (CSS `.reveal` class is overridden with `opacity: 1; transform: none` in a `<noscript>`-adjacent fallback). Interactive figures still function — they use requestAnimationFrame directly, not GSAP for core rendering.
- **KaTeX not loaded:** Math blocks display the raw LaTeX string from `data-latex` attribute as fallback text. Already handled in current code.
- **Google Fonts not loaded:** Font stack falls back to Georgia/Courier New per CSS declarations.

### Canvas Failures
Interactive figures degrade to static descriptions. Each canvas element has a descriptive `aria-label` and a `<noscript>` fallback paragraph inside a wrapper describing what the figure shows.

### Module Import Failures
Dynamic `import()` calls are wrapped in try/catch. If a module fails to load, the corresponding beat section displays its prose content without the interactive figure. An unobtrusive console warning is logged.

---

## Accessibility

### Screen Reader Behavior
- Each interactive figure has a comprehensive `aria-label` describing what it shows and what interactions are available.
- Live regions (`aria-live="polite"`) announce key value changes (S value, acceptance rate) as the user interacts with sliders.
- The Bell Test animation has an `aria-description` explaining the setup: "Animation showing particle pairs emitted from a source to two detectors. Current correlation tally: E(a,b) = [value]."
- The Event Stream has a text summary below it that updates: "X of Y events accepted. Current S = [value]."

### Keyboard
- All slider controls are native `<input type="range">` — keyboard accessible by default.
- Interactive canvases that accept click/tap (Bell Test emit, Efficiency marker) also accept Enter/Space when focused.
- Focus order follows the narrative (top to bottom).
- Draggable interactions always have a slider/button alternative.

### Motion
- `prefers-reduced-motion: reduce` disables: particle animations (show static state), scroll-triggered reveals (elements visible immediately), gauge marker transitions (markers appear instantly).
- Core content and interactivity (sliders, readouts) remain fully functional.

---

## Performance

### Targets
- **First Contentful Paint:** <1.5s on 3G
- **Total JS:** <100KB uncompressed (excluding CDN libs)
- **Frame rate:** 60fps target for all animations; particle systems cap at 200 particles max
- **Canvas count:** Maximum 3 canvases simultaneously active (visible in viewport). Off-screen canvases pause their requestAnimationFrame loops via IntersectionObserver.

### Particle Budgets
- Bell Test: max 50 particle pairs in flight
- Event Stream: max 100 event dots on screen
- Starfield: existing budget (unchanged)

### Lazy Rendering
Interactive figures only start rendering when their section enters the viewport (IntersectionObserver). This prevents all 6 figures from running simultaneously.

---

## Paper Page (paper.html) — Expanded Specification

### Content Source
The file `paper.tex` exists at `../meatheadphysicist/projects/bell-inequality/paper/paper.tex` (310 lines). This is manually converted to semantic HTML during implementation. Sections: Introduction, Theoretical Background (CHSH Inequality, Why Post-Selection Matters, The Detection Loophole), Methods (Simulation Framework, Post-Selection Model), Results (Classical Baseline, Post-Selected Results, Comparison with QM), Discussion (What Makes a Bell Test Convincing, Diagnostic Protocol), Conclusion, Appendix (Efficiency Threshold Derivation).

### Figures in paper.html
Three interactive figures are embedded (smaller, max-width: 500px):
1. Efficiency Landscape (Beat 4 figure, reused module)
2. Post-Selection Mechanism (Beat 5 figure, reused module)
3. CHSH Bounds Comparison (Beat 6 figure, reused module)

The Bell Test schematic (Beat 2) is referenced but not embedded — a static SVG version is used instead for cleaner reading flow. The timeline and gauge are not included (they serve the narrative, not the formal paper).

### Sidenotes
On screens ≥1100px, sidenotes appear in the right margin (absolutely positioned relative to their anchor paragraph, 200px wide). On screens <1100px, they collapse to inline parenthetical text or expandable `<details>` elements.

### Table of Contents
Sticky left sidebar on ≥1100px. Lists section numbers and titles. Active section highlighted via IntersectionObserver scroll-spy. On <1100px, ToC becomes a collapsible dropdown at the top of the page.

---

## References — Actual DOIs

| Citation | DOI |
|----------|-----|
| Bell (1964) | https://doi.org/10.1103/PhysicsPhysique.1.195 |
| Clauser, Horne, Shimony, Holt (1969) | https://doi.org/10.1103/PhysRevLett.23.880 |
| Pearle (1970) | https://doi.org/10.1103/PhysRevD.2.1418 |
| Tsirelson (1980) | https://doi.org/10.1007/BF00417500 |
| Aspect, Grangier, Roger (1982) | https://doi.org/10.1103/PhysRevLett.49.91 |
| Eberhard (1993) | https://doi.org/10.1103/PhysRevA.47.R747 |
| Weihs et al. (1998) | https://doi.org/10.1103/PhysRevLett.81.5039 |
| Freedman & Clauser (1972) | https://doi.org/10.1103/PhysRevLett.28.938 |
| Hensen et al. (2015) | https://doi.org/10.1038/nature15759 |
| Giustina et al. (2015) | https://doi.org/10.1103/PhysRevLett.115.250401 |
| Shalm et al. (2015) | https://doi.org/10.1103/PhysRevLett.115.250402 |
| Wang et al. (2025) | https://doi.org/10.1126/sciadv.ads0058 |

---

## Testing & Acceptance Criteria

### Per-Beat Acceptance
Each beat is considered complete when:
1. Prose content renders correctly with proper typography
2. Interactive figure initializes and responds to input
3. KaTeX math renders without errors
4. Inline reference links resolve to correct DOIs
5. `prefers-reduced-motion` fallback works
6. Mobile layout (375px) is readable and interactive

### Cross-Browser Targets
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Mobile Safari (iOS 17+), Chrome Android

### Verification Method
Playwright snapshot tests for each beat at 1440px and 375px widths. Manual testing of interactive figures on touch devices.

---

## Technical Constraints

- No build step (vanilla HTML/CSS/ES modules)
- No innerHTML with computed data (createElement + textContent only)
- GPU-composited animations only (transform, opacity)
- prefers-reduced-motion guards on all animations
- Keyboard operable (focus traps on modals, tab navigation)
- WCAG 2.1 AA color contrast
- Existing design tokens (tokens.css) and font stack preserved
