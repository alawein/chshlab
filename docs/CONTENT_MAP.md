---
type: canonical
source: none
sync: none
sla: none
---

# CHSH Lab Content Map

This map identifies the current source-of-truth relationships for the shipped site and paper.

## Canonical text sources

| Surface | Source of truth | Notes |
|---|---|---|
| `paper.html` | `paper.html` + `arxiv/main.tex` | These two artifacts must stay argument-level identical, including the hybrid thesis and experiment-specific critique framing. |
| `index.html` narrative | `paper.html` | The homepage is a guided presentation layer, not an independent argument source. |
| Homepage bibliography | `paper.html` references rendered via `js/references.js` | The homepage list should mirror the paper's current bibliography, even if the rendering format is lighter. |
| Publication figures | `scripts/generate_publication_figures.py` | Writes the four canonical figures to both website and arXiv directories. |

## Homepage mapping

| Homepage surface | Canonical source | Current implementation |
|---|---|---|
| Hero / evidence strip | `paper.html` abstract + findings + thesis | `index.html` hero and evidence cards |
| "What Wang et al. Actually Did" | Introduction in `paper.html` | `index.html` claim beat |
| Efficiency beat | Figure 2, Appendix A, and Discussion in `paper.html` | `index.html` efficiency section + `js/demo-efficiency.js` |
| Post-selection beat | Methods, Results, Appendix B in `paper.html` | `index.html` post-selection section + `js/demo-postselect.js` |
| Comparison table | Table 2 and Table 3 in `paper.html` | `index.html` proof section |
| Conclusion beat | Conclusion in `paper.html` | `index.html` conclusion section and share module |
| References section | References in `paper.html` | `js/references.js` populates `#referencesList` |

## Paper mapping

| Paper surface | Canonical source | Notes |
|---|---|---|
| `paper.html` content | `paper.html` | Reader-facing HTML artifact |
| `arxiv/main.tex` content | `paper.html` | TeX version should preserve the same claims, citations, figure order, and conclusion |
| `arxiv/main.pdf` | `arxiv/main.tex` + `arxiv/figures/` | Regenerate after figure or print-style changes |

## Canonical figures

| Figure | Website file | arXiv file | Role |
|---|---|---|---|
| Figure 1 | `assets/figures/publication/fig1_bounds.png` | `arxiv/figures/fig1_bounds.png` | Reference scales for the two papers |
| Figure 2 | `assets/figures/publication/fig2_efficiency.png` | `arxiv/figures/fig2_efficiency.png` | Efficiency context and benchmark thresholds |
| Figure 3 | `assets/figures/publication/fig3_postselection_curve.png` | `arxiv/figures/fig3_postselection_curve.png` | Exact local counterexample and paper point |
| Figure 4 | `assets/figures/publication/fig4_correlators.png` | `arxiv/figures/fig4_correlators.png` | Raw vs selected correlators |

## Legacy figure family

The older five-file set under `assets/figures/` is retained for archival context:

- `fig1_chsh_bounds.png`
- `fig2_efficiency_landscape.png`
- `fig3_postselection_mechanism.png`
- `fig4_bell_test_schematic.png`
- `fig5_timeline.png`

These are not the canonical paper figures. They should not drive metadata, provenance, or academic claims unless a future runtime surface explicitly revives them.

## Citation cluster in scope

The current rebuttal depends on the following paper-era cluster:

- `wang2025`
- `wharton2025`
- `wojcik2025`
- `cieslinski2025` (legacy key name; published as PRL 136, 090206 (2026))
- `vieira2025`

Any change to the argument or bibliography should be reflected in all three places:

1. `paper.html`
2. `arxiv/main.tex`
3. `js/references.js`

## Drift checks

When revising content, verify these invariants:

- Homepage metadata uses the publication figure family, not the legacy figure family.
- The Wang citation uses DOI `10.1126/sciadv.adr1794`.
- When mentioning `~10^-18`, describe it as effective acceptance or post-selection probability, or explicitly as a CHSH benchmark proxy for the retained-event rate.
- The paper point remains `p_lo = 0.10`, `S_sel = 26/7 ~= 3.714`, and Monte Carlo `S = 3.716` at `70.0%` acceptance.
- `paper.html` and `arxiv/main.tex` keep the same title block, figure count, bibliography, and conclusion.
