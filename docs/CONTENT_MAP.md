---
type: canonical
source: none
sync: none
sla: none
---

# CHSH Lab — Content Map

Maps source evidence from `../meatheadphysicist` to each site section and rebuttal argument.

---

## Section 1: Hero

**Purpose:** Frame the central question before any mathematics.

| Content | Source | Verbatim? |
|---------|--------|-----------|
| Headline: "Does Low-Efficiency Bell Testing Prove Nonlocality?" | Derived from `hypothesis.md` central question | Adapted |
| Sub-question: "When post-selection meets a detection efficiency < 82%, can CHSH > 2 still rule out classical explanations?" | `hypothesis.md` §Central Question | Adapted |
| Key numbers teaser: S=2 / S=2√2 / S≈3.7 | `professor-packet.md` §Results at a glance | Extracted |
| Scroll cue | Original | — |

---

## Section 2: Paper Showcase

**Purpose:** Ground the critique in the specific experimental claim being examined.

| Content | Source | Notes |
|---------|--------|-------|
| Paper preview image | `figures/rendered/fig4_bell_test_schematic.png` | Used as annotated diagram stand-in |
| Citation card | `paperNotes.bib` + `research/post-selection/paper.md` §References | Extract Wang et al. (2025) entry |
| Hotspot A — "Detection efficiency not reported" | `hypothesis.md` §Key Assumptions bullet 1 | Annotation overlay |
| Hotspot B — "Post-selection on coincident detection only" | `hypothesis.md` §Key Assumptions bullet 3 | Annotation overlay |
| Hotspot C — "Fair sampling assumption not justified" | `hypothesis.md` §Key Assumptions bullet 3 | Annotation overlay |
| Hotspot D — "S > 2 claimed without η diagnostics" | `docs/professor-packet.md` §Feedback question 3 | Annotation overlay |
| PDF download link | `paper/paper.pdf` (hosted in repo or linked to GitHub raw) | External link |

---

## Section 3: Rebuttal Narrative

Three claim/critique/evidence/implication cards.

### Card 1 — Classical Bound and What Violating It Actually Requires

| Slot | Content | Source |
|------|---------|--------|
| Claim | "CHSH S > 2 implies quantum nonlocality" | Standard interpretation being challenged |
| Critique | "This inference holds only under loophole-free conditions, including η ≥ 82.8%" | `proofs/theorems/bell-theorem.md` Theorem 1 proof, §Detection Efficiency Threshold |
| Evidence | Classical baseline: S=2.001 (95% CI [1.998, 2.004]), 100% acceptance | `professor-packet.md` §Results at a glance, paper-grade row |
| Implication | "A sub-threshold experiment cannot serve as a standalone Bell witness" | `hypothesis.md` §Hypothesis statement |
| Math | `S \leq 2` for LHV; threshold derivation `\eta_c = \frac{2}{1+\sqrt{2}} \approx 0.828` | `appendix-detection-loophole-derivation.md` |

### Card 2 — Post-Selection Inflation Mechanism

| Slot | Content | Source |
|------|---------|--------|
| Claim | "Post-selecting on detected coincidences preserves statistical validity" | Implicit assumption in low-efficiency experiments |
| Critique | "Outcome-dependent selection biases the correlation estimator and can inflate CHSH to S→4 even from classical data" | `proofs/theorems/bell-theorem.md` Theorem 3 |
| Evidence | Post-selected classical: S=3.716 (95% CI [3.714, 3.717]), 70.0% acceptance | `professor-packet.md` §Results at a glance, paper-grade row |
| Implication | "An inflated S value combined with low acceptance rate is a red flag, not a confirmation" | `research/post-selection/paper.md` §Discussion |
| Math | Constructive post-selection: preference for coincidences drives `E_\text{post}(a,b) \to \pm 1`, giving `S \to 4` | `bell-theorem.md` Theorem 3 proof |

### Card 3 — Reporting Standards and the Detection Loophole

| Slot | Content | Source |
|------|---------|--------|
| Claim | "Standard Bell inequality tests report CHSH S value as the primary metric" | Conventional practice |
| Critique | "At low efficiency, the relevant bound is `S_\text{LHV,max}(\eta) = 4/\eta - 2`, not S=2; violating the naive bound proves nothing" | `appendix-detection-loophole-derivation.md` |
| Evidence | At η=70%: `S_\text{LHV,max} = 4/0.70 - 2 ≈ 3.71` — matching the post-selected artifact value exactly | Computed from appendix formula |
| Implication | "Correct Bell testing requires either η > 82.8% or explicit diagnostics ruling out selection effects" | `research/post-selection/paper.md` §Discussion §Distinguishing artifacts from genuine violations |
| Math | `S_\text{LHV,max}(\eta) = \frac{4}{\eta} - 2`, threshold at `\eta \geq \frac{2}{1+\sqrt{2}}` | `appendix-detection-loophole-derivation.md` |

---

## Section 4: Interactive Demos

### Demo 1 — Angle Slider (v1 MVP)

**Purpose:** Show how CHSH S depends on measurement angles; show classical vs quantum correlation.

| Element | Formula / Data | Source |
|---------|----------------|--------|
| Quantum correlation | `E_Q(a,b) = -\cos(a-b)` | Standard QM, confirmed in `01_bell_basics.ipynb` |
| Classical LHV correlation (deterministic) | `E_C(a,b) = -(2/\pi)\|a-b\|` for `\|a-b\| \leq \pi/2` | Standard LHV model |
| CHSH S formula | `S = E(a,b) - E(a,b') + E(a',b) + E(a',b')` | `bell-theorem.md` Theorem 1 |
| Optimal quantum angles | a=0, a'=π/2, b=π/4, b'=3π/4 → S=2√2 | `01_bell_basics.ipynb` §Angle Dependence |
| Classical bound line | S=2 | Theorem 1 |
| Tsirelson bound line | S=2√2≈2.828 | Theorem 2 |

### Demo 2 — Efficiency Threshold

**Purpose:** Show how the LHV upper bound grows as detection efficiency falls.

| Element | Formula / Data | Source |
|---------|----------------|--------|
| LHV max as function of η | `S_\text{LHV,max}(\eta) = 4/\eta - 2` | `appendix-detection-loophole-derivation.md` |
| Critical threshold marker | `η_c = 2/(1+√2) ≈ 0.828` | Same |
| Claimed experiment S value (draggable) | Default: S=2.5 (user-adjustable) | Illustrative |
| CSV data overlay (optional) | `analysis/results/chsh_vs_efficiency.csv` | `02_chsh_simulation.ipynb` |
| Quantum bound constant line | S=2√2 | Theorem 2 |
| Classical bound constant line | S=2 | Theorem 1 |

### Demo 3 — Post-Selection Simulator

**Purpose:** Show how acceptance-rate filtering inflates S from a purely classical dataset.

| Element | Formula / Data | Source |
|---------|----------------|--------|
| Bias ratio slider (p) | p ∈ [0,1]: probability of keeping anti-correlated pairs | `bell-theorem.md` Theorem 3 constructive example |
| Post-selected S formula | Analytical: `S_post(p) = 4·(1-p)/(1+p)` (approximate, derived from Theorem 3) | Theorem 3 |
| Acceptance rate formula | `accept(p) = (1+p)/2` | Derived |
| Simulation result reference | Post-selected S=3.716 at 70% acceptance | `professor-packet.md` |
| "Is this a Bell violation?" indicator | Triggered when `S_post > 2` with `accept < η_c` | Decision rule from `research/post-selection/paper.md` §Discussion |

---

## Section 5: Theorems

Three theorem cards, each with KaTeX statement + collapsible full proof.

| Theorem | Source | Key Formula |
|---------|--------|-------------|
| Theorem 1: Classical CHSH Bound | `bell-theorem.md` §Theorem 1 | `S ≤ 2` for LHV |
| Theorem 2: Tsirelson Bound | `bell-theorem.md` §Theorem 2 | `S ≤ 2\sqrt{2}` for QM |
| Theorem 3: Post-Selection Inflation | `bell-theorem.md` §Theorem 3 | `S_\text{post} \to 4` from LHV data |

---

## Section 6: Figures

| Figure | File | Caption Source |
|--------|------|----------------|
| Fig 1: CHSH Bounds Comparison | `fig1_chsh_bounds.png` | `figure-registry.yaml` or notebook caption |
| Fig 2: Efficiency Landscape | `fig2_efficiency_landscape.png` | `figure-registry.yaml` |
| Fig 3: Post-Selection Mechanism | `fig3_postselection_mechanism.png` | `figure-registry.yaml` |
| Fig 4: Bell Test Schematic | `fig4_bell_test_schematic.png` | `figure-registry.yaml` |
| Fig 5: Historical Timeline | `fig5_timeline.png` | `figure-registry.yaml` |

---

## Section 7: References

| Citation | Source |
|----------|--------|
| Bell (1964) — original theorem paper | `paperNotes.bib` |
| Wang et al. (2025) — experiment under examination | `paperNotes.bib` |
| Eberhard (1993) — efficiency threshold | `appendix-detection-loophole-derivation.md` attribution |
| Clauser, Horne, Shimony, Holt (1969) — CHSH inequality | `research/post-selection/paper.md` §References |
| This work — meatheadphysicist repo | GitHub link |

---

## Content Gaps (Risk Items)

| Gap | Impact | Resolution |
|-----|--------|------------|
| `paper/sections/*.md` files are template checklists, not final content | The paper.tex/paper.pdf has the compiled content but is hard to parse in HTML | Use `professor-packet.md` + `hypothesis.md` + `research/post-selection/paper.md` as primary content sources instead |
| `figure-registry.yaml` captions may be terse | Figure captions need editorial polish for web | Write web-adapted captions in implementation step |
| `paperNotes.bib` may lack all references | Some citations may be missing | Parse BibTeX; fill gaps with DOI lookups |
| Paper PDF page scan for hotspot overlay | `paper.pdf` exists but no web-ready page-scan PNG | Use `fig4_bell_test_schematic.png` as the annotated diagram instead of a paper page scan |
