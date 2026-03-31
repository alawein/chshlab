---
type: canonical
source: none
sync: none
sla: none
---

# Academic Fact-Check

Canonical claim trace for the current `v1.3` paper and homepage.

## Core Position

The shipped argument is narrower than "Wang et al. are classical." It is:

> In the ultra-low-efficiency regime, a post-selected CHSH value above 2 is non-exclusionary evidence until the selection rule itself is constrained.

That sentence is the governing claim in both [paper.html](../paper.html) and [arxiv/main.tex](../arxiv/main.tex).

## Claim 1 - The local CHSH bound only transfers under fair sampling

### Canonical source
- Proposition 1 in [arxiv/main.tex](../arxiv/main.tex)
- "Theoretical Background" in [paper.html](../paper.html)

### Shipped statement
- For local hidden-variable models satisfying locality, realism, freedom, and fair sampling, `S_LHV <= 2`.
- The key qualifier is fair sampling. The paper does not claim that every filtered estimator must obey the unconditional bound.

### Supporting evidence
- [paper.html](../paper.html) Figure 1 and Table 1
- [index.html](../index.html) efficiency and proof sections
- [js/demo-efficiency.js](../js/demo-efficiency.js)

### Audit note
- The older docs that reduced this to "eta >= 82.8% or else nothing matters" were too loose. The current paper is more careful: it identifies fair sampling as the bridge between the emitted and retained ensembles.

## Claim 2 - Selection changes the estimator

### Canonical source
- Proposition 3 in [arxiv/main.tex](../arxiv/main.tex)
- Appendix B in [paper.html](../paper.html)

### Shipped statement
- Once trials are filtered, the operational quantity is
  `E_xy^(sel) = E[A_x B_y | x, y, D = 1]`
  rather than the unconditional `E_xy`.
- This is the statistical form of the detection-loophole objection used throughout the site.

### Supporting evidence
- [paper.html](../paper.html) discussion of conditionalization
- [index.html](../index.html) post-selection beat and comparison table
- [js/demo-postselect.js](../js/demo-postselect.js)

### Audit note
- The current site no longer relies on the older approximate slider story as the primary argument. The exact conditional estimator from the paper is the canonical source.

## Claim 3 - The shipped local counterexample is exact at the paper point

### Canonical source
- Proposition 4 and Appendix B in [arxiv/main.tex](../arxiv/main.tex)
- Results and Appendix in [paper.html](../paper.html)

### Shipped statement
- With raw correlations `(1/2, 1/2, 1/2, -1/2)` and the filter `p_hi = 0.9`, `p_lo = 0.1`, the exact selected correlators are `(+13/14, +13/14, +13/14, -13/14)`.
- The exact toy-model value is `S_sel = 26/7 ~= 3.714`.
- The paper-grade Monte Carlo artifact is `S = 3.716` with 95% CI `[3.714, 3.717]` at `70.0%` acceptance.

### Supporting evidence
- [paper.html](../paper.html) Figure 3, Figure 4, Table 2, and Table 3
- [index.html](../index.html) post-selection beat and comparison table
- [scripts/generate_publication_figures.py](../scripts/generate_publication_figures.py)

### Audit note
- The superseded docs that described the main mechanism as `S_post -> 4` via a generic `rho` filter were legacy explanatory material. The shipped paper now centers the exact `26/7` construction and the corresponding Monte Carlo artifact.

## Claim 4 - Wang et al.'s reported statistic is non-diagnostic in this evidentiary regime

### Canonical source
- Results, Discussion, and Conclusion in [paper.html](../paper.html)
- Sections 4 through 6 in [arxiv/main.tex](../arxiv/main.tex)

### Shipped statement
- Wang et al. report `S = 2.275 +- 0.057` at an effective acceptance or post-selection probability around `10^-18`, not an ordinary per-arm detector efficiency.
- The rebuttal does not need to prove their apparatus is classical. It only needs to show that the reported evidence class is still available to local explanations.
- The shipped surfaces now also say that the published critique literature goes further and converges on a stronger artifact diagnosis centered on fourfold post-selection and unconventional normalization.

### Supporting evidence
- [paper.html](../paper.html) Table 2 and conclusion
- [index.html](../index.html) evidence strip, claim beat, comparison table, and conclusion beat
- [js/references.js](../js/references.js) entries for `wang2025`, `wharton2025`, `wojcik2025`, `cieslinski2025`, and `vieira2025`

### Audit note
- The canonical Wang citation is:
  `K. Wang et al., "Violation of Bell inequality with unentangled photons," Science Advances 11(31), eadr1794 (2025).`
  DOI: `https://doi.org/10.1126/sciadv.adr1794`
- The Cieśliński response is now treated as:
  `P. Cieśliński, J.-Å. Larsson, M. Markiewicz, K. Schlichtholz, and M. Żukowski, "Unquestionable Bell theorem for interwoven frustrated down conversion processes," Physical Review Letters 136, 090206 (2026); arXiv:2508.19207.`

## Claim 5 - The experiment-specific dispute is about fourfold post-selection and cross-setting normalization

### Canonical source
- Introduction and Discussion in [paper.html](../paper.html)
- Introduction and Discussion in [arxiv/main.tex](../arxiv/main.tex)
- "What Wang et al. Actually Did" in [index.html](../index.html)

### Shipped statement
- Wang et al. retain only fourfold coincidences in a four-photon frustrated-interference setup.
- The reported `-1` outcomes are inferred by a `pi`-shift of the local phases, and the operational joint probabilities are reconstructed from counts collected at four different settings.
- Three independent critiques treat that fourfold post-selection plus unconventional normalization as the central reason the reported statistic does not count as decisive Bell evidence.

### Supporting evidence
- [paper.html](../paper.html) introduction and discussion
- [arxiv/main.tex](../arxiv/main.tex) introduction and discussion
- [index.html](../index.html) claim beat

### Audit note
- The formal thesis of this repo remains narrower than "Wang et al. are classical."
- The stronger artifact diagnosis is presented as convergent external context, not as a new theorem proved by the site.

## Required diagnostics

The shipped standard for a persuasive low-efficiency Bell claim is the same across the homepage and paper:

| Diagnostic | Why it matters |
|---|---|
| Raw correlations before selection | Shows whether the effect exists prior to filtering. |
| Acceptance rate by setting pair | Tests whether retention is coupled to measurement context. |
| No-signaling checks on raw and selected data | Detects filter-induced distortions in the observed marginals. |
| Independence tests for acceptance vs. outcomes/settings | Directly probes the fair-sampling assumption. |
| Sensitivity analysis for plausible filter bias | Quantifies how much apparent violation could be manufactured by conditioning. |

## Canonical figure mapping

| Paper figure | File | Role in the argument |
|---|---|---|
| Figure 1 | `assets/figures/publication/fig1_bounds.png` | Places the classical bound, Wang et al., Tsirelson, and the local counterexample on one scale. |
| Figure 2 | `assets/figures/publication/fig2_efficiency.png` | Places the claimed efficiency against the benchmark thresholds. |
| Figure 3 | `assets/figures/publication/fig3_postselection_curve.png` | Shows the exact paper filter and the paper point `p_lo = 0.10`. |
| Figure 4 | `assets/figures/publication/fig4_correlators.png` | Shows how selection changes the correlators while the source stays local. |

## Conclusion

The current `v1.3` site and paper make a coherent claim when read together:

- `S > 2` is not being dismissed universally.
- The rebuttal is about inference under severe filtering.
- The critical `~10^-18` number is described as effective acceptance or post-selection probability.
- The exact local counterexample is `S_sel = 26/7 ~= 3.714`, with the shipped Monte Carlo artifact at `S = 3.716`.
- The critique literature now converges on a stronger diagnosis centered on fourfold post-selection and unconventional normalization.
- The correct reading of the reported Wang result at `~10^-18` effective acceptance is caution, not coronation.
