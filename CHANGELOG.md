---
type: canonical
source: none
sync: none
sla: none
---

# Changelog

All notable changes to **chshlab** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Continuous polish loop v0.1 (read-only observer). New verifier modules
  under `scripts/verifiers/` (`numbers`, `citations`) plus orchestrator
  `scripts/verify_paper.py`, slash command `.claude/commands/polish-paper.md`,
  operator doc `docs/POLISH_LOOP.md`, and self-tests
  `tests/verifiers/test_*.py`. Surfaces drift between `paper.html`,
  `arxiv/main.tex`, `js/references.js`, and `docs/ACADEMIC_FACTCHECK.md`
  as `polish-suggested` GitHub issues; never edits or commits in v0.1.
  Runs as `/loop 15m /polish-paper` from a local terminal.

### Changed

- Renamed paper title to `Is S > 2 Enough Without Entanglement? A
  Reproducible Rebuttal of Wang et al. (2025)` to disambiguate from
  Wharton & Price arXiv:2508.13431. Updated `index.html`, `paper.html`,
  and `arxiv/main.tex` (title, OG, Twitter, JSON-LD, H1, fancy header).

## [1.3] - 2026-03-30

### Changed

- Aligned the homepage, HTML paper, LaTeX paper, bibliography, and provenance docs to the canonical `v1.3` publication source.
- Replaced legacy homepage social metadata and bibliography references with the canonical publication figure family and the corrected Wang DOI `10.1126/sciadv.adr1794`.
- Rebuilt the publication figures and refreshed the arXiv PDF so the shipped artifacts agree on four figures, six tables, twenty-one references, and the canonical conclusion.

### Fixed

- Marked `arxiv/README.md` as derived so doctrine validation no longer treats it as a duplicate canonical README.
