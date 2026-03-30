---
type: canonical
source: none
sync: none
sla: none
---

# arXiv submission notes

This folder contains the source-checked arXiv draft that now mirrors the revised `paper.html` argument rather than the older website-first version.

## Contents

- `main.tex` - current arXiv manuscript
- `figures/publication_fig1_bounds.png`
- `figures/publication_fig2_efficiency.png`
- `figures/publication_fig3_postselection_curve.png`
- `figures/publication_fig4_correlators.png`

## Regenerate publication figures

Run from the repository root:

```powershell
python scripts/generate_publication_figures.py
```

That writes the light-background paper figures to both:

- `assets/figures/publication/`
- `arxiv/figures/`

## Compile locally

Run from `arxiv/`:

```powershell
pdflatex main.tex
pdflatex main.tex
```

## Upload surface

For arXiv, include `main.tex` and the four `publication_fig*.png` files from `arxiv/figures/`.
