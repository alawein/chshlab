---
type: canonical
source: none
sync: none
sla: none
authority: canonical
last-verified: 2026-03-27
audience: [ai-agents, contributors]
---

# CHSH Lab

CHSH Lab is a static website that presents an interactive rebuttal to claims of Bell inequality violation without entanglement. The repo ships two public pages:

- `index.html` for the narrative and browser-side demos
- `paper.html` for the formal paper artifact and print-friendly reference view

## Repo Layout

- `assets/figures/` generated figures used across the site
- `css/` design tokens and page styling
- `js/` ES-module interactions and demo logic
- `partials/` shared HTML head/style fragments synced into public pages
- `scripts/generate_figures.py` figure regeneration utility
- `scripts/sync_shared_html.py` shared head/style sync step for static pages
- `scripts/run_visual_audit.py` repeatable Playwright screenshot matrix
- `docs/` planning, fact-check, provenance, and upgrade history
- `docs/meta/ai/` non-runtime prompt and agent collateral

## Local Preview

Serve the repo root with a static file server:

```bash
python -m http.server 4317
```

Then open:

- `http://127.0.0.1:4317/index.html`
- `http://127.0.0.1:4317/paper.html`

## Notebook Execution

Run the simulation notebook through the repo-local wrapper:

```powershell
.\scripts\run_chshlab_notebook.ps1
```

This uses the working Python 3.12 interpreter on this machine and writes the executed artifact to `output/jupyter-notebook/chshlab-simulations-executed.ipynb`.

## Build

This repo uses a shell script to produce a Vercel Build Output API bundle:

```bash
bash build.sh
```

Successful output is written to `.vercel/output/`.
The build also runs `python scripts/sync_shared_html.py` so shared head/style fragments stay aligned across `index.html`, `paper.html`, and `404.html`.

## Figure Regeneration

The figure generator is a Python script under `scripts/`:

```bash
python scripts/generate_figures.py
```

It writes figure assets into `assets/figures/`. The script expects the Python scientific stack used in the file itself, including `numpy` and `matplotlib`.

## Quality Gates

- Automated build: `bash build.sh`
- Automated lint: `n/a`
- Automated typecheck: `n/a`
- Automated tests: `npm test`
- Manual verification: local browser pass on `index.html` and `paper.html`

## Visual Audit

Capture the standard breakpoint matrix into `output/playwright/`:

```bash
python scripts/run_visual_audit.py
```

## Documentation

Start with [docs/README.md](docs/README.md) for the documentation index and supporting research/provenance files.

## Ownership

- **Maintainer:** @alawein
- **Support:** GitHub Issues on this repository
