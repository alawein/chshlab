---
type: canonical
source: none
sync: none
sla: none
authority: canonical
audience: [agents, contributors, maintainers]
last_updated: 2026-09-06
last-verified: 2026-09-06
---

# AGENTS: chshlab

## Workspace identity

chshlab is a static two-page site: an interactive CHSH / Bell-inequality rebuttal
on `index.html` and a formal paper surface on `paper.html`.

## Boundaries

- Keep the site static and two-page. No backend, analytics, or framework runtime.
- Use safe DOM APIs and browser ES modules only.
- Regenerate figures through `scripts/`. Do not hand-edit published figure artifacts.
- Do not invent a new documentation hierarchy. Prefer editing existing surfaces.

## Simplicity defaults

- Make the smallest change that satisfies the acceptance criteria.
- Prefer direct functions and plain data structures.
- No class when a function suffices. No framework for one implementation.
- No shared abstraction before real duplication exists.
- Prefer the standard library or an existing dependency.
- Avoid factories, registries, adapters, plugins, and config layers without multiple real consumers.
- Keep control flow direct. Use early returns when clearer. Keep errors explicit.
- Comments explain invariants, assumptions, and failure modes. Delete dead code instead of commenting it out.
- Keep pull requests single-purpose. Stop when tests and acceptance criteria pass. Do not rewrite adjacent working code without a stated need.

## Documented checks

```bash
npm ci
npm test
bash build.sh
```
