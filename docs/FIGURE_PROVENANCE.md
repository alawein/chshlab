---
type: canonical
source: none
sync: none
sla: none
---

# Figure Provenance

This document records the canonical figure family used by the current `v1.3` paper.

## Canonical outputs

`scripts/generate_publication_figures.py` is the source of truth for the paper figures. It writes the same four figures to both:

- `assets/figures/publication/`
- `arxiv/figures/`

The web outputs use a transparent dark-site theme. The arXiv outputs use a white print theme.

## Figure 1 - Reference scales for the two papers

| Field | Value |
|---|---|
| File | `assets/figures/publication/fig1_bounds.png` |
| Script | `scripts/generate_publication_figures.py` |
| Inputs | Classical bound `2.0`, Wang et al. `2.275`, Tsirelson `2*sqrt(2)`, local toy-model value `26/7` |
| Validation target | Introduction + Figure 1 in `paper.html` and `arxiv/main.tex` |

### Audit notes
- This figure is the canonical social/share image for both `/paper` and the homepage metadata.
- It replaces the older homepage share reference to `assets/figures/fig1_chsh_bounds.png`.

## Figure 2 - Efficiency context

| Field | Value |
|---|---|
| File | `assets/figures/publication/fig2_efficiency.png` |
| Script | `scripts/generate_publication_figures.py` |
| Inputs | Wang marker `1e-18`, Eberhard threshold `2/3`, Garg-Mermin threshold `2/(1+sqrt(2))`, unit efficiency `1.0` |
| Validation target | Theoretical Background + Figure 2 in `paper.html` and `arxiv/main.tex` |

### Audit notes
- The figure is log-scale on the x-axis and explicitly distinguishes the selection-heavy regime from the threshold regime.
- The shipped paper uses this benchmark figure, not the earlier site-only `fig2_efficiency_landscape.png`, as the canonical publication asset.

## Figure 3 - Exact local counterexample

| Field | Value |
|---|---|
| File | `assets/figures/publication/fig3_postselection_curve.png` |
| Script | `scripts/generate_publication_figures.py` |
| Inputs | `p_lo` over `[0, 0.5]`, `S_sel = 4*((1.5 - 2*p_lo)/(1.5 - p_lo))`, `accept = 0.75 - 0.5*p_lo` |
| Paper point | `p_lo = 0.10`, `S_sel = 26/7 ~= 3.714`, acceptance `0.70` |
| Validation target | Results + Figure 3 in `paper.html` and `arxiv/main.tex` |

### Audit notes
- This is the canonical post-selection figure because it matches the exact formula used in `js/demo-postselect.js`.
- The older narrative figure `fig3_postselection_mechanism.png` remains only as legacy collateral; it is not the publication figure family.

## Figure 4 - Correlator inflation without changing locality class

| Field | Value |
|---|---|
| File | `assets/figures/publication/fig4_correlators.png` |
| Script | `scripts/generate_publication_figures.py` |
| Inputs | Raw correlators `(0.5, 0.5, 0.5, -0.5)`, selected correlators `(13/14, 13/14, 13/14, -13/14)` |
| Validation target | Results + Figure 4 in `paper.html` and `arxiv/main.tex` |

### Audit notes
- This figure is the publication replacement for the older site schematic/timeline pair when the goal is paper parity.
- It visualizes the paper's central point directly: the filter changes the retained correlators, not the underlying locality class.

## Legacy assets

The following files remain in `assets/figures/` for backward compatibility and archival context:

- `fig1_chsh_bounds.png`
- `fig2_efficiency_landscape.png`
- `fig3_postselection_mechanism.png`
- `fig4_bell_test_schematic.png`
- `fig5_timeline.png`

They are not the canonical paper figure family. Future documentation should reference them only when discussing early site design history or legacy interactive surfaces.

## Regeneration

Run from the repository root:

```powershell
python scripts/generate_publication_figures.py
```

That refreshes both the website publication figures and the arXiv figures in one step.
