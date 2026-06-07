---
type: canonical
source: none
sync: none
sla: none
authority: canonical
audience: [agents, contributors, maintainers]
last_updated: 2026-04-15
last-verified: 2026-04-15
---

# AGENTS: CHSH Lab

## Workspace identity

CHSH Lab is a static two-page site for the CHSH rebuttal and paper surface.

## Directory structure

- `index.html`: interactive narrative
- `paper.html`: formal paper surface
- `css/` and `js/`: runtime code
- `assets/figures/`: generated figures
- `scripts/`: build, sync, and audit tooling

## Governance rules

1. Keep the site static.
2. Preserve the two-page structure.
3. Do not add remote analytics or backend data collection.
4. Keep `build.sh` aligned with shipped assets.
5. Rebuild or audit in a browser when visible site behavior changes.

## Code conventions

- Safe DOM APIs only
- Browser ES modules only
- Comments explain content integrity or interaction constraints

## Build and test commands

```bash
python -m http.server 4317
npm test
bash build.sh
python scripts/run_visual_audit.py
```
