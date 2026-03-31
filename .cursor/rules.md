---
type: canonical
source: none
sync: none
sla: none
---

# Cursor Rules for chshlab

You are working in chshlab.

## Context

[Brief project description and tech stack.]

## Key Files

- Config: [CLAUDE.md](../CLAUDE.md), [AGENTS.md](../AGENTS.md), [SSOT.md](../SSOT.md)
- Documentation: [docs/README.md](../docs/README.md), [docs/INDEX.md](../docs/INDEX.md)

## Work Style

- Execute incrementally. Small, complete changes.
- Read governance docs before structural changes.
- Use `/bootstrap` to load session context.
- No cross-project file access.

## Testing

Before committing:
- Run `npm test` (TypeScript projects)
- Run `pytest` (Python projects)

## Do Not

- Commit unverified changes
- Scope creep (refuse multi-file changes for single-sentence tasks)
- Assume file existence; verify with `ls` first
