---
type: canonical
source: none
sync: none
sla: none
authority: observed
last-verified: 2026-03-21
audience: [ai-agents, contributors]
---

# LESSONS

## 2026-03-21

- This repo has no package-manager or test-runner scaffold; assume a static-site workflow unless new tooling is explicitly added.
- `build.sh` is the only automated quality gate currently available and produces Vercel Build Output API files successfully.
- Browser verification matters here because navigation, anchor behavior, print actions, and interactive demos are runtime behaviors not covered by automated tests.
- Older planning documents can lag behind the actual shipped structure; verify current HTML and JS before relying on a plan file.
