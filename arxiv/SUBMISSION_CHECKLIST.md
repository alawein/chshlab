---
type: canonical
source: none
sync: none
sla: none
---

# Submission Checklist

## arXiv

- Confirm title, author name, and abstract match the intended public version.
- Confirm every citation resolves and every bibliography entry is used intentionally.
- Confirm all figures in `arxiv/figures/` are publication variants, not website variants.
- Confirm `main.tex` compiles cleanly with `pdflatex` twice.
- Confirm the upload bundle contains only TeX sources, figures, bibliography assets, and required metadata files.
- Upload bundle: `output/arxiv/chshlab-arxiv-upload.zip`
- Compiled PDF for inspection: `output/arxiv/main.pdf`

## Journal-style package

- Publication figure bundle: `output/arxiv/publication-figures.zip`
- Check that axis labels, legends, and captions are readable in grayscale print.
- Check that figure backgrounds are light and that line weights survive downscaling.
- Check that table wording matches the current paper thesis.

## Notebook and simulation appendix

- Source notebook: `notebooks/chshlab-simulations.ipynb`
- Frozen executed artifact: `output/jupyter-notebook/chshlab-simulations-executed.ipynb`
- Confirm formulas in the notebook match the paper text and website widget exactly.

## Final manual pass

- Read the abstract and conclusion back-to-back for claim discipline.
- Read every figure caption without the body text; each should stand on its own.
- Spot-check the strongest claims against the cited source text before submission.
