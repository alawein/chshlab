---
type: canonical
source: none
sync: none
sla: none
---

# Innovation Upgrade Notes

Record of all features implemented, deferred features with reasons, and known limitations.

---

## Features Implemented

### 1. Scientific Explainability

#### 1A :  Equation Term Linking
- KaTeX-rendered equation terms gain `term-linkable` class and mouse/keyboard interaction
- Hovering highlights corresponding demo elements with `.term-highlight` outline
- Implementation: post-render scan of KaTeX spans, `mouseenter`/`mouseleave` toggling CSS class

#### 1B :  Bound Explorer Side Panel
- Fixed right-rail panel (mobile: bottom drawer) showing three live values
- Classical LHV bound (S <= 2), Tsirelson bound (S <= 2sqrt(2)), LHV,max at current eta
- Real-time updates via `chshlab:state` CustomEvent bus
- Toggle: click button or press `b` key
- ARIA `role="complementary"`, keyboard accessible

#### 1C :  Assumption Toggle Matrix
- Three toggle switches (Fair Sampling, eta >= 82.8%, No Post-Selection)
- Each toggle emits `chshlab:assumptions` CustomEvent
- Consequence banner displays one-line description of toggle effect
- Toggle state reflected in URL query params for shareability

### 2. Narrative Innovation

#### 2A :  Guided Rebuttal Mode (Story Mode)
- 6-step walkthrough overlay activated by "Walk me through it" hero button
- Each step: claim card (amber), rebuttal card (crimson), inline quiz (multiple choice)
- Expert Mode toggle reveals full formulas and proof sketches
- Focus trap, Escape to dismiss, `aria-modal="true"`
- Keyboard shortcut: `s` key
- Step counter, back/next navigation

#### 2B :  Timeline of Argument Evolution
- Horizontal scroll section with 6 nodes (Bell 1964 through This Rebuttal 2025)
- Status badges: established (amber), contested (crimson), resolved (blue)
- Inserted between Figures and References sections
- Cards animate in with existing `.reveal` pattern

### 3. Reproducibility & Trust

#### 3A :  Figure Provenance Drawer
- Each figure card gets an info button (top-right corner)
- Click opens drawer beneath card with: source path, generator, parameters, validation status
- All data defined in static `js/provenance-data.js` module (no fetch required)
- `aria-expanded` attribute on button, `aria-hidden` on drawer

#### 3B :  Demo State Export & Permalink
- Export JSON button: downloads current slider values, readouts, and timestamp
- Copy Link button: writes URL with query params to clipboard
- Permalink parsing on load: restores demo tab, slider values, and assumption states
- Uses `URL.createObjectURL` for JSON download (no server needed)

### 4. Visual & Interaction Excellence

#### 4A :  Micro-Interaction System
- Defined in `js/animation-config.js`: cardLift, buttonPress, valueFlash, drawerOpen, tooltipAppear
- Button press animation applied uniformly to all `<button>` elements
- Respects `prefers-reduced-motion`

#### 4B :  Data Sonification
- Web Audio API tone system mapping CHSH S to audio cues
- S < 2: low tone (220 Hz); S = 2: click (440 Hz); S > 2sqrt(2): rising (660 Hz); S ~ 4: alert
- Muted by default, toggle via speaker icon in demos section
- AudioContext created only on first unmute (autoplay policy safe)
- Graceful no-op if AudioContext unavailable

### 5. Accessibility & Performance Hardening

#### 5A :  Accessibility Pass
- All sliders: `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (dynamic)
- Story Mode: focus trap, Escape to dismiss
- Provenance drawers: return focus to trigger on close
- Keyboard shortcuts documented in footer `<details>` element
- High-contrast mode: `@media (forced-colors: active)` block replacing colors with system colors
- `prefers-reduced-motion` guards on all new animations

#### 5B :  Performance Documentation
- `docs/PERFORMANCE_BUDGET.md` with JS payload targets, animation frame budget, asset sizes
- 10-item pre-deploy audit checklist

### 6. Cross-Module Event Bus
- `chshlab:state` CustomEvent on `document` for inter-module communication
- All three demos emit their current state on render
- Bound Explorer and sonification consume these events
- No framework dependency, no global state mutation

---

## Features Deferred

| Feature | Reason |
|---|---|
| GSAP ScrollTrigger horizontal pin for timeline | Adds complexity; horizontal scroll already works well on mobile and desktop. Can be added later without breaking changes. |
| Full assumption toggle effect on demo rendering | Toggles emit events and display banners, but do not yet modify the actual demo computations. This requires deeper integration with each demo's math model and would increase code complexity significantly. Planned for a follow-up iteration. |
| Term linking to specific SVG/Canvas overlay elements | Current implementation highlights the parent container (`.demo-readouts` or `.demo-slider-row`). Precise canvas region highlighting would require an overlay layer per canvas, which is a significant architecture change. |
| Sonification visual speaker animation | The spec mentioned `prefers-reduced-transparency` check; this is a non-standard API. The speaker button has a CSS transition instead. |
| `FIGURE_PROVENANCE.md` auto-generation from provenance-data.js | Currently maintained as separate docs. Could be auto-generated via a build script, but this repo has no build step. |

---

## Known Limitations

1. **Permalink state for angle sweep demo:** The four angle sliders are identified by their HTML IDs (`sliderA`, `sliderAp`, `sliderB`, `sliderBp`), which appear as raw parameter names in the URL.

2. **Term linking coverage:** Only a subset of KaTeX-rendered terms are linked. The heuristic matches rendered text content containing eta or S symbols, which may miss some terms or match unrelated ones.

3. **Story Mode on very small screens (< 320px):** The quiz choices may overflow. Tested down to 375px (iPhone SE) which works correctly.

4. **Sonification threshold debounce:** The sonification only triggers when S changes by more than 0.1. Rapid small changes (e.g., fine slider adjustment) will not produce audio cues.

5. **Provenance drawer max-height:** Uses `max-height: 500px` transition. If provenance content exceeds this, it will be clipped. Current content fits within this limit for all five figures.

6. **Timeline horizontal scroll:** No scroll indicators on desktop. Users must know to scroll horizontally. Mobile touch scrolling works naturally.

---

## Architecture Notes

- All new modules are ES6 modules loaded via dynamic `import()` in `main.js`
- Event bus pattern: `CustomEvent` on `document` , lightweight, no dependencies
- State management remains distributed (each demo owns its state)
- New CSS follows existing token/component/layout separation
- All DOM creation uses `createElement`/`textContent` , no `innerHTML` with computed data
