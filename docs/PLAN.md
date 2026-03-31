---
type: canonical
source: none
sync: none
sla: none
---

# CHSH Lab — Site Architecture Plan

> Historical planning document from the pre-`v1.3` site buildout. For current publication truth, use [FIGURE_PROVENANCE.md](/Users/mesha/Desktop/GitHub/alawein/chshlab/docs/FIGURE_PROVENANCE.md), [CONTENT_MAP.md](/Users/mesha/Desktop/GitHub/alawein/chshlab/docs/CONTENT_MAP.md), and the current publication surfaces in [paper.html](/Users/mesha/Desktop/GitHub/alawein/chshlab/paper.html) and [arxiv/main.tex](/Users/mesha/Desktop/GitHub/alawein/chshlab/arxiv/main.tex).

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a world-class static site on GitHub Pages that showcases the CHSH/Bell inequality rebuttal with interactive math demos and rigorous academic presentation.

**Architecture:** Single-page scroll experience with five major narrative sections, three interactive JS demos computed in real time with no backend, and a design system built on CSS custom properties. All assets co-located in `chshlab/`.

**Tech Stack:** Vanilla HTML5 + CSS3 + ES modules · KaTeX (math) · GSAP + ScrollTrigger (animation) · Google Fonts (Cormorant Garant + EB Garamond + JetBrains Mono) · GitHub Pages (deploy)

---

## Design System: "Academic Monograph"

Dark charcoal background (not pure black), editorial red-thread annotation style, typewritten/serif typography pairing. Evokes annotated academic paper + physics lab — authority without sterility.

### Color Tokens
| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0E0F14` | Page background |
| `--surface` | `#161820` | Card / panel background |
| `--surface-2` | `#1E2028` | Elevated card |
| `--border` | `rgba(255,255,255,0.08)` | Dividers |
| `--text` | `#EAE6DA` | Body text (warm cream) |
| `--text-muted` | `#9A9485` | Secondary text |
| `--amber` | `#C9A94D` | Classical bound S=2 |
| `--blue` | `#4FA3D4` | Quantum bound 2√2 |
| `--crimson` | `#C94040` | Post-selection artifact |
| `--accent` | `#6B8F71` | Success / confirmed |
| `--rule` | `rgba(201,169,77,0.25)` | Horizontal rules |

### Typography
| Role | Font | Weight | Size |
|------|------|--------|------|
| Display / hero | Cormorant Garant | 300–700 | 64–96px |
| Section headings | Cormorant Garant | 500 | 40–52px |
| Body | EB Garamond | 400 | 18px / 1.75 |
| Labels / UI | JetBrains Mono | 400–500 | 11–13px |
| Math display | KaTeX (auto) | — | 1.15em |

### Layer System
```
z-index: 0    background / noise texture
z-index: 10   content sections
z-index: 20   sticky nav
z-index: 30   demo overlays / tooltips
z-index: 40   modal (paper zoom)
z-index: 100  GSAP scroll pin containers
```

---

## Page Map

```
index.html
│
├── #hero          — Full-viewport intro: title, framing question, scroll cue
├── #paper         — Paper showcase: annotated preview, citation card, PDF link
├── #rebuttal      — Narrative: 3 claim/critique/evidence/implication cards
├── #demos         — Interactive section: 3 demos with tabs
│   ├── #demo-angle      — Angle slider → live CHSH S
│   ├── #demo-efficiency — Efficiency threshold sweep
│   └── #demo-postselect — Post-selection bias simulator
├── #proofs        — Theorem cards: 3 theorems with collapsible math
├── #figures       — Figure gallery: fig1–fig5 with captions
└── #references    — Citation list, links, source repo badge
```

---

## Component Map

| Component | File | Purpose |
|-----------|------|---------|
| `<nav>` | `index.html` | Sticky nav, logo, section links, GitHub link |
| `.hero` | `index.html` | GSAP intro sequence, framing text |
| `.paper-showcase` | `index.html` | Paper image with hotspot annotations |
| `.hotspot` | `css/components.css` + `js/annotations.js` | Clickable annotation circles with tooltips |
| `.paper-zoom` | `js/annotations.js` | Modal for full-res paper view |
| `.rebuttal-card` | `index.html` | Claim / Critique / Evidence / Implication structure |
| `.math-block` | `css/components.css` | KaTeX-rendered math with label |
| `.demo-panel` | `index.html` | Tab container for 3 demos |
| `AngleDemo` | `js/demo-chsh.js` | Canvas + slider → CHSH S value |
| `EfficiencyDemo` | `js/demo-efficiency.js` | SVG line chart, draggable threshold marker |
| `PostSelectDemo` | `js/demo-postselect.js` | Acceptance filter slider → inflated S display |
| `.theorem-card` | `index.html` | Collapsible proof with `<details>` |
| `.figure-card` | `index.html` | Figure image + caption |
| `.citation` | `index.html` | Reference row |

---

## Animation Map

| Element | Trigger | Animation | Library |
|---------|---------|-----------|---------|
| Hero title | Page load | Staggered fade-up by word | GSAP |
| Hero framing question | Load +0.8s | Fade in | GSAP |
| Section `.section-label` | ScrollTrigger enter | Slide in from left | GSAP ScrollTrigger |
| Section headings | ScrollTrigger enter | Fade up | GSAP ScrollTrigger |
| `.rebuttal-card` | ScrollTrigger stagger | Cascade fade-up | GSAP ScrollTrigger |
| `.theorem-card` | ScrollTrigger stagger | Scale-in from 0.96 | GSAP ScrollTrigger |
| `.figure-card` | ScrollTrigger enter | Fade in + subtle lift | GSAP ScrollTrigger |
| Demo panel | ScrollTrigger pin | Pinned during demo interaction | GSAP ScrollTrigger |
| Noise texture overlay | Static | CSS fixed pseudo-element | CSS |
| `prefers-reduced-motion` | Media query | All animations disabled | CSS + JS |

---

## Data / Content Sources

| Content | Source File | Notes |
|---------|-------------|-------|
| Central hypothesis | `../meatheadphysicist/projects/bell-inequality/hypothesis.md` | Pull verbatim claim + assumptions |
| Rebuttal narrative | `../meatheadphysicist/projects/bell-inequality/research/post-selection/paper.md` | Sections 1–4 for claim/critique/evidence |
| Executive summary | `../meatheadphysicist/projects/bell-inequality/docs/professor-packet.md` | Results at a glance table |
| Theorem 1 (LHV bound) | `../meatheadphysicist/projects/bell-inequality/proofs/theorems/bell-theorem.md` | Full proof text + YAML: `01_classical_bound.yaml` |
| Theorem 2 (Tsirelson) | `../meatheadphysicist/projects/bell-inequality/proofs/theorems/bell-theorem.md` | Full proof + YAML: `02_tsirelson_bound.yaml` |
| Theorem 3 (Post-selection) | `../meatheadphysicist/projects/bell-inequality/proofs/theorems/bell-theorem.md` | Full proof + YAML: `03_post_selection.yaml` |
| Efficiency threshold derivation | `../meatheadphysicist/projects/bell-inequality/paper/appendix-detection-loophole-derivation.md` | Complete derivation |
| Figure 1 (CHSH bounds) | `../meatheadphysicist/projects/bell-inequality/figures/rendered/fig1_chsh_bounds.png` | Copy to `assets/figures/` |
| Figure 2 (efficiency landscape) | `../meatheadphysicist/projects/bell-inequality/figures/rendered/fig2_efficiency_landscape.png` | Copy to `assets/figures/` |
| Figure 3 (post-selection) | `../meatheadphysicist/projects/bell-inequality/figures/rendered/fig3_postselection_mechanism.png` | Copy to `assets/figures/` |
| Figure 4 (schematic) | `../meatheadphysicist/projects/bell-inequality/figures/rendered/fig4_bell_test_schematic.png` | Copy to `assets/figures/` |
| Figure 5 (timeline) | `../meatheadphysicist/projects/bell-inequality/figures/rendered/fig5_timeline.png` | Copy to `assets/figures/` |
| Demo math (angle correlation) | Computed in JS — formula: `E(a,b) = -cos(a-b)` | Quantum singlet formula |
| Demo math (classical correlation) | Computed in JS — formula: `E_classical(a,b) = -(2/π)(a-b)` | Piecewise linear LHV approximation |
| Demo math (efficiency threshold) | Computed in JS — formula: `S_LHV_max(η) = 4/η - 2`, threshold at `η_c = 2/(1+√2)` | From appendix |
| CSV data (efficiency sweep) | `../meatheadphysicist/projects/bell-inequality/analysis/results/chsh_vs_efficiency.csv` | Optional: import for demo-efficiency |
| Notebook figures | `../meatheadphysicist/projects/bell-inequality/notebooks/*.png` | Supplementary gallery |
| Paper citation | BibTeX in `paperNotes.bib` | Extract Wang et al. (2025) + Bell (1964) |

---

## Technical Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | None (vanilla) | Static GitHub Pages, no build step required, maintainable |
| Math rendering | KaTeX (CDN) | Faster than MathJax, sufficient for display+inline math |
| Animation | GSAP 3 + ScrollTrigger (CDN) | Best-in-class scroll animations; free for non-commercial |
| Fonts | Google Fonts | Zero dependency, self-hosted subset optional |
| CSS architecture | Custom properties + BEM-lite | No Sass needed at this scale |
| Canvas for demos | HTML5 Canvas 2D | Native, zero-dep, sufficient for correlation circle diagram |
| SVG for charts | Inline SVG + JS | More controllable than Chart.js for custom aesthetic |
| Deployment | GitHub Pages | Matches repo hosting, `chshlab/` is the root |
| `.nojekyll` | Yes | Prevents Jekyll processing conflicts |

---

## File Tree

```
chshlab/
├── index.html                    # Single-page app (all sections)
├── .nojekyll                     # GitHub Pages: disable Jekyll
├── docs/
│   ├── PLAN.md                   # This file
│   ├── CONTENT_MAP.md            # Source → section mapping
│   └── IMPLEMENTATION_STEPS.md  # Day-0/1/2 task breakdown
├── assets/
│   └── figures/
│       ├── fig1_chsh_bounds.png
│       ├── fig2_efficiency_landscape.png
│       ├── fig3_postselection_mechanism.png
│       ├── fig4_bell_test_schematic.png
│       └── fig5_timeline.png
├── css/
│   ├── tokens.css                # All CSS custom properties
│   ├── base.css                  # Reset, body, typography, KaTeX overrides
│   ├── layout.css                # Section spacing, grid, container widths
│   └── components.css            # Nav, cards, demos, hotspots, theorems, figures
└── js/
    ├── main.js                   # Entrypoint: init GSAP, KaTeX, scroll
    ├── scroll.js                 # ScrollTrigger animation declarations
    ├── annotations.js            # Paper hotspot + modal zoom logic
    ├── demo-chsh.js              # Angle slider → live CHSH S computation
    ├── demo-efficiency.js        # Efficiency sweep SVG chart + draggable marker
    └── demo-postselect.js        # Post-selection bias slider → inflated S
```

---

## Risk Register

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Paper PDF preview**: `paper.pdf` may not render neatly as a web image | High | Medium | Use `fig4_bell_test_schematic.png` as paper-preview stand-in; annotate the schematic diagram instead of paper page scan |
| **Missing citation data**: `paperNotes.bib` may not contain Wang et al. (2025) entry | Medium | Medium | Use placeholder citation with known DOI format; mark as `[citation needed]` in content map |
| **Figure quality for web**: PNG figures may have insufficient resolution or white backgrounds incompatible with dark theme | High | Medium | Invert/filter figures in CSS (`filter: invert(1) hue-rotate(180deg)` for simple cases); or re-generate from Python source scripts |
| **KaTeX rendering edge cases**: Long derivations with `\frac` stacks may overflow on mobile | Medium | Low | Test on 375px width early; use `\displaystyle` wrapper and `overflow-x: auto` on `.math-block` |
| **GSAP ScrollTrigger pinning on mobile**: Demo pin can break on iOS Safari | Medium | Medium | Disable pin on `(max-width: 768px)`, fall back to static demo layout |
| **Math correctness**: JS-computed demos must exactly match paper formulas | Critical | Low | Unit-test each formula against known values: `E(π/4) = -cos(π/4) = -0.707`, `S_optimal = 2√2 ≈ 2.828` |
| **GitHub Pages path**: If `chshlab/` is not the repo root, base paths may break | Medium | High | Add `<base href="/chshlab/">` or use root-relative paths with repo name prefix; document in deploy instructions |
| **No backend constraint**: Demo computations must be purely client-side | — | — | All demos use analytical formulas; no fetch calls needed |
