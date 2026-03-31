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

## 2026-03-30

- Re-audited the canonical paper surface against a newer local `v1.3` source of truth and rejected an older Claude-generated PDF as a regression target.
- Updated [index.html](../index.html) metadata, structured data, citation links, and conclusion copy so the homepage matches the canonical paper argument and publication figure family.
- Replaced the homepage bibliography data in [js/references.js](../js/references.js) with the paper's current 21-entry reference list and corrected the Wang 2025 DOI to `10.1126/sciadv.adr1794`.
- Rewrote [ACADEMIC_FACTCHECK.md](ACADEMIC_FACTCHECK.md), [FIGURE_PROVENANCE.md](FIGURE_PROVENANCE.md), and [CONTENT_MAP.md](CONTENT_MAP.md) around the current four-figure publication pipeline and the exact `26/7` post-selection construction.
- Added print-oriented LaTeX polish in [arxiv/main.tex](../arxiv/main.tex) so the TeX artifact keeps the current `v1.3` content while adopting running headers and denser float/table spacing.
