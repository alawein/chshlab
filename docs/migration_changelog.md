---
type: canonical
source: none
sync: none
sla: none
---

# Migration Changelog

## 2026-03-21

- Ran the documentation audit manually because `ops/consolidation_toolbox.py` is not present in this repository.
- Confirmed there are no `TODO` or `TBD` markers under `docs/`.
- Confirmed there are no Markdown links under `docs/` that require target repair.
- Added `README.md` files for `docs/`, `docs/superpowers/`, `docs/superpowers/plans/`, and `docs/superpowers/specs/`.
- Added [INDEX.md](INDEX.md) as the directory map for the documentation tree.
- Added top-level governance and overview files: `AGENTS.md`, `CLAUDE.md`, `SSOT.md`, `LESSONS.md`, and root `README.md`.

## 2026-03-27

- Moved non-runtime prompt collateral out of the repository root into `docs/meta/ai/`.
- Added `README.md` files for `docs/meta/` and `docs/meta/ai/`.
- Updated [docs/INDEX.md](INDEX.md), [docs/README.md](README.md), [README.md](../README.md), and [SSOT.md](../SSOT.md) to reflect the cleaned repository layout.
- Switched [docs/INDEX.md](INDEX.md) from a nonexistent script sync assumption to manual maintenance.
- Added `partials/` plus `scripts/sync_shared_html.py` so shared head/style fragments stay consistent across `index.html`, `paper.html`, and `404.html`.
- Added `scripts/run_visual_audit.py` to capture the standard breakpoint-and-route screenshot matrix into `output/playwright/`.
