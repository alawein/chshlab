# CHSH Lab

Status:      active
Category:    research
Owner:       alawein
Visibility:  private
Purpose:     Quantum foundations education site for CHSH and Bell inequality experiments.
Next action: continue

## Abstract

CHSH Lab is a static website that presents an interactive rebuttal to claims of
Bell inequality violation without entanglement. Two public pages ship at the repo
root: `index.html` for narrative and browser-side demos, and `paper.html` for
the formal paper view. Offline Python scripts regenerate figures and keep shared
HTML fragments aligned.

## Status

- Lifecycle: active
- Verification date: 2026-06-29
- Scope: static HTML/CSS/JS site, figure pipeline, vitest checks, research docs
- Non-runtime: `docs/meta/ai/` prompt collateral (review before public provenance)

## Runtime requirements

- Static file server for local preview (no backend runtime)
- Python 3.12 with NumPy and Matplotlib for `scripts/generate_figures.py`
- Node.js for `npm test` (vitest DOM and module checks)
- Playwright for `scripts/run_visual_audit.py` screenshot matrix

## Reproducibility

Local preview:

```bash
git clone https://github.com/alawein/chshlab.git
cd chshlab
python -m http.server 4317
```

Open `http://127.0.0.1:4317/index.html` and `http://127.0.0.1:4317/paper.html`.

Build and verify:

```bash
bash build.sh
npm test
python scripts/generate_figures.py
python scripts/run_visual_audit.py
```

Notebook execution (Windows):

```powershell
.\scripts\run_chshlab_notebook.ps1
```

## Datasets

- No external dataset downloads; figures are generated into `assets/figures/`
- Provenance record: [docs/FIGURE_PROVENANCE.md](docs/FIGURE_PROVENANCE.md)
- Regenerate figures from `scripts/generate_figures.py` before citing visuals

## Architecture

```text
chshlab/
├── index.html paper.html 404.html  # public pages
├── css/ js/ partials/              # styles, ES modules, shared fragments
├── assets/figures/                 # committed figure outputs
├── scripts/                        # build, figure regen, visual audit
├── tests/                          # vitest checks
└── docs/                           # planning, fact-check, provenance
```

Detail: [docs/architecture/topology.md](docs/architecture/topology.md) and [docs/architecture.md](docs/architecture.md).

## Docs map

- [docs/README.md](docs/README.md)
- [SSOT.md](SSOT.md)
- [LESSONS.md](LESSONS.md)
