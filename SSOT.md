---
type: canonical
source: none
sync: none
sla: none
authority: canonical
last-verified: 2026-03-27
audience: [ai-agents, contributors]
---

# SSOT

## Current State

- Repo name: `chshlab`
- Status: active static site
- Site shape: two-page experience
- Primary entrypoints: `index.html`, `paper.html`
- Deploy build: `bash build.sh`
- Deploy output directory: `.vercel/output`
- Hosting config present: `vercel.json`

## Actual Stack

- HTML5 documents with CDN-loaded dependencies
- CSS custom-property design system
- Browser ES modules in `js/`
- Shared static HTML partial sync in `partials/` via `scripts/sync_shared_html.py`
- Python utility script for figure generation: `scripts/generate_figures.py`

As of 2026-03-21 baseline: no package manifest, no test runner, no linter config, no typechecker. Package manifest and vitest were added 2026-04-06 (see current quality gates below).

## Quality Gate Baseline

Before governance creation on 2026-03-21:

- lint: `n/a`
- typecheck: `n/a`
- test: `n/a`
- build: `pass` via `bash build.sh`

Current quality gates (added 2026-04-06 onward):

- vitest: `pass` via `npm test -- --run` (14 files / 142 tests, JS/DOM/demo math)
- polish loop: `pass` via `python scripts/verify_paper.py` (read-only verifier;
  see [docs/POLISH_LOOP.md](docs/POLISH_LOOP.md))

## Canonical Layout

```text
chshlab/
  index.html
  paper.html
  404.html
  build.sh
  vercel.json
  assets/
    figures/
  css/
    tokens.css
    base.css
    layout.css
    components.css
    not-found.css
    paper.css
  js/
    main.js
    katex-render.js
    page-navigation.js
    page-state.js
    page-timeline.js
    paper.js
    scroll.js
    animation-config.js
    fig-bell-test.js
    fig-gauge.js
    fig-event-stream.js
    demo-chsh.js
    demo-efficiency.js
    demo-postselect.js
    references.js
    sonification.js
    starfield.js
  partials/
    head-shared.html
    styles-core.html
  scripts/
    generate_figures.py
    run_visual_audit.py
    sync_shared_html.py
  docs/
    README.md
    INDEX.md
    PLAN.md
    IMPLEMENTATION_STEPS.md
    CONTENT_MAP.md
    ACADEMIC_FACTCHECK.md
    FIGURE_PROVENANCE.md
    PERFORMANCE_BUDGET.md
    INNOVATION_UPGRADE_NOTES.md
    migration_changelog.md
    meta/
      README.md
      ai/
        README.md
        REPO-SWEEP-PROMPT.md
    superpowers/
```

## Content Model

- `index.html` is the public interactive narrative.
- `paper.html` is the formal, print-friendly paper artifact.
- `assets/figures/` stores the figure set used by both pages.
- `docs/` stores planning, provenance, and upgrade history rather than runtime code.
- `docs/meta/ai/` stores prompt collateral and other agent-side reference material that should not clutter the root.
- `partials/` plus `scripts/sync_shared_html.py` are the source of truth for shared head/style fragments across the public HTML pages.

## Notes On Drift

- Some planning documents in `docs/` describe earlier single-page assumptions. The actual shipped site is two-page and must be treated as authoritative unless those plans are explicitly updated.
- `.vercel/output/` is generated build output and should not be treated as a source directory.
