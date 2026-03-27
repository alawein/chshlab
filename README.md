---
type: canonical
source: none
sync: none
sla: none
authority: canonical
last-verified: 2026-03-21
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
- `scripts/generate_figures.py` figure regeneration utility
- `docs/` planning, fact-check, provenance, and upgrade history

## Local Preview

Serve the repo root with a static file server:

```bash
python -m http.server 4317
```

Then open:

- `http://127.0.0.1:4317/index.html`
- `http://127.0.0.1:4317/paper.html`

## Build

This repo uses a shell script to produce a Vercel Build Output API bundle:

```bash
bash build.sh
```

Successful output is written to `.vercel/output/`.

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
- Automated tests: `n/a`
- Manual verification: local browser pass on `index.html` and `paper.html`

## Documentation

Start with [docs/README.md](docs/README.md) for the documentation index and supporting research/provenance files.
