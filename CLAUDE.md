---
type: canonical
source: none
sync: none
sla: none
authority: canonical
audience: [ai-agents, contributors]
last_updated: 2026-04-15
last-verified: 2026-04-15
---

# CLAUDE.md — CHSH Lab

## Workspace identity

CHSH Lab is a static two-page site built around a specific argument: an
interactive public narrative on `index.html` and a formal paper surface on
`paper.html`. Keep that separation visible. Do not drift into SPA assumptions or
generic marketing-site habits.

Shared voice and writing contract:

- <https://github.com/alawein/alawein/blob/main/docs/style/VOICE.md>
- <https://github.com/alawein/alawein/blob/main/prompt-kits/AGENT.md>

## Directory structure

- `index.html`: interactive narrative surface
- `paper.html`: formal paper and print-friendly reference view
- `css/`: styling, tokens, and layout
- `js/`: browser ES modules and demos
- `assets/figures/`: generated figures
- `partials/`: shared head/style fragments
- `scripts/`: figure generation, sync, and visual audit tooling
- `docs/`: planning, provenance, and upgrade history

## Governance rules

1. Keep the site static. Do not add backend services, analytics collectors, or
   framework runtime layers without explicit approval.
2. Preserve the current two-page model: `index.html` for the interactive
   narrative, `paper.html` for the formal paper surface.
3. Use safe DOM APIs. Avoid introducing unsafe HTML injection patterns.
4. When shipped assets change, keep `build.sh` aligned with the deploy output.
5. Regenerate figures through the scripts that own them. Do not hand-edit
   published figure artifacts.
6. Changes to the paper claims, citations, or argument structure require
   cross-checking the documentation evidence trail.
7. Validate visible site changes in a real browser, not just by reading the
   source.

## Code conventions

- Keep JavaScript as browser ES modules.
- Comments explain argument structure, visual behavior, or content integrity
  constraints.
- Prefer explicit, readable HTML/CSS over abstraction layers that hide the page
  model.

## Build and test commands

```bash
python -m http.server 4317
npm test
bash build.sh
python scripts/generate_figures.py
python scripts/run_visual_audit.py
```
