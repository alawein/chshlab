---
type: derived
source: arxiv/main.tex
sync: manual
sla: manual
---

# Paper manuscript notes

This folder contains the source-checked manuscript draft that mirrors the canonical `paper.html` argument in TeX form.

## Contents

- `main.tex` - current manuscript
- `figures/fig1_bounds.png`
- `figures/fig2_efficiency.png`
- `figures/fig3_postselection_curve.png`
- `figures/fig4_correlators.png`

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

For a submission package, include `main.tex` and the four canonical `fig*.png` files from `arxiv/figures/`.
