---
type: canonical
last_updated: 2026-06-29
---

# Repository topology

Archetype: `static-site` (fleet topology canon).

On-disk layout as of 2026-06-29. Two public HTML pages, browser ES modules, and offline Python tooling for figures and audits.

## Tree

```text
chshlab/
├── index.html paper.html 404.html   # public pages at repo root
├── css/                             # tokens, layout, components, paper styles
├── js/                              # ES-module demos, figures, navigation
│   └── quantum/                     # browser-side quantum helpers
├── partials/                        # shared head/style fragments
├── assets/figures/                  # committed figure outputs
├── scripts/                         # figure regen, HTML sync, visual audit
├── notebooks/                       # simulation notebook (offline)
├── arxiv/                           # paper export artifacts
├── tests/                           # vitest DOM and module checks
└── docs/                            # planning, fact-check, provenance
```

## Surfaces

| Path | Role |
|------|------|
| `index.html` | Interactive narrative and browser-side CHSH demos |
| `paper.html` | Formal paper view and print-friendly reference |
| `js/` | All runtime interactivity; no SPA framework |
| `partials/` + `scripts/sync_shared_html.py` | Keep shared head/style aligned across pages |
| `assets/figures/` | Offline-generated figures; regen via `scripts/generate_figures.py` |
| `scripts/` | Build (`build.sh` caller), figure regen, Playwright audit matrix |

## Rules

- No server-side runtime; CDN math (KaTeX) is the only external browser dependency.
- Regenerate figures from documented scripts before citing numerical visuals.

## Related docs

- [architecture.md](../architecture.md) for component boundaries and data flow
- [FIGURE_PROVENANCE.md](../FIGURE_PROVENANCE.md) for figure source record
- [CONTENT_MAP.md](../CONTENT_MAP.md) for evidence-to-site mapping
