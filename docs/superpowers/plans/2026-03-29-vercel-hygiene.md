---
type: canonical
source: none
sync: none
sla: none
---

# Vercel Platform Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all Vercel platform issues: missing domains, name mismatches, orphan projects, canonical URL drift, and stale references.

**Architecture:** Five independent workstreams executed sequentially per-repo. Domain additions use the Vercel CLI (`vercel domains add`). Name mismatches are resolved by updating the Vercel project name to match the GitHub repo. Orphan projects on the morphism-systems team are deleted. Canonical URLs in HTML are updated to match actual production domains.

**Tech Stack:** Vercel CLI, git, bash, Vercel API

**Scope note:** This plan covers the `alawein` Vercel team (17 projects). The `morphism-systems` team has 2 orphan projects to clean up. Each task is one repo or one cleanup action.

---

## Issue Inventory

| # | Issue | Severity | Repo(s) |
|---|---|---|---|
| 1 | chshlab canonical URL says `chshlab.meshal.ai` but no such domain exists | High | chshlab |
| 2 | qmlab canonical URL says `qmlab.online` but no such domain exists | High | qmlab |
| 3 | gymboy/gainboy name mismatch (local=gymboy, vercel=gainboy) | Medium | gymboy |
| 4 | atelier-rounaq / rounaq-atelier name flip (vercel=rounaq-atelier, repo=atelier-rounaq) | Low | atelier-rounaq |
| 5 | 2 orphan projects on morphism-systems team (unlinked) | Low | n/a |
| 6 | 8 deployed sites have no custom domain | Info | see below |

### Sites without custom domains

| Vercel Project | Likely desired domain | Decision needed |
|---|---|---|
| chshlab | chshlab.meshal.ai (subdomain) | Add subdomain |
| qmlab | qmlab.online (standalone) | Buy/verify domain, or use subdomain |
| blackmalejournal | ? | User decision |
| loopholelab | ? | User decision |
| meatheadphysicist | ? | User decision |
| qaplibria | ? | User decision |
| repz | ? | User decision |
| simcore | ? | User decision |

---

### Task 1: Add chshlab.meshal.ai subdomain

**Context:** chshlab's HTML references `chshlab.meshal.ai` in canonical URLs, OG tags, Twitter cards, and structured data. The domain `meshal.ai` is already on the meshal-web project. We need to add a subdomain pointing to the chshlab project.

**Files:**
- No file changes needed (HTML already has the correct URLs)

- [ ] **Step 1: Add the subdomain to the chshlab Vercel project**

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/chshlab
vercel domains add chshlab.meshal.ai
```

Expected: Vercel prompts to configure DNS. Since `meshal.ai` is already on Vercel, it may auto-configure or require a CNAME record.

- [ ] **Step 2: Verify DNS propagation**

```bash
# Check that the domain resolves
curl -sI https://chshlab.meshal.ai | head -5
```

Expected: HTTP 200 or 308 redirect (Vercel's clean URLs).

- [ ] **Step 3: Verify canonical URLs match**

```bash
curl -s https://chshlab.meshal.ai | grep 'rel="canonical"'
curl -s https://chshlab.meshal.ai/paper | grep 'rel="canonical"'
```

Expected:
- `<link rel="canonical" href="https://chshlab.meshal.ai" />`
- `<link rel="canonical" href="https://chshlab.meshal.ai/paper" />`

- [ ] **Step 4: Verify OG image URLs resolve**

```bash
curl -sI https://chshlab.meshal.ai/assets/figures/fig1_chsh_bounds.png | head -3
```

Expected: HTTP 200, `content-type: image/png`.

---

### Task 2: Fix qmlab canonical URL or add domain

**Context:** qmlab's `index.html` has `<link rel="canonical" href="https://qmlab.online/" />` but Vercel shows no custom domain for qmlab. Two options:

**Option A (preferred if domain is owned):** Add `qmlab.online` to the Vercel project.
**Option B (if domain is not owned):** Update canonical URL to `qmlab-alawein.vercel.app`.

- [ ] **Step 1: Check if qmlab.online is a registered domain**

```bash
# Check DNS
dig qmlab.online +short 2>/dev/null || nslookup qmlab.online
```

If it resolves to Vercel IPs (76.76.21.21) or has a CNAME to vercel, proceed with Option A. If NXDOMAIN, proceed with Option B.

- [ ] **Step 2a (Option A): Add qmlab.online to Vercel**

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/qmlab
vercel domains add qmlab.online
```

- [ ] **Step 2b (Option B): Update canonical URL in qmlab**

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/qmlab
# Find and replace canonical URL in index.html
# Change: https://qmlab.online/
# To: https://qmlab-alawein.vercel.app/
```

Then commit and push the change.

- [ ] **Step 3: Verify the chosen URL resolves**

```bash
curl -sI https://qmlab.online/ | head -3
# or
curl -sI https://qmlab-alawein.vercel.app/ | head -3
```

Expected: HTTP 200.

---

### Task 3: Rename Vercel project gainboy -> gymboy

**Context:** Local directory is `gymboy`, GitHub repo is `alawein/gymboy`, but Vercel project is `gainboy`. The custom domain `gymboy.coach` is correct. The project name mismatch causes confusion.

- [ ] **Step 1: Rename project in Vercel dashboard or CLI**

```bash
# Vercel CLI doesn't support project rename directly.
# Use the Vercel API:
TOKEN=$(python -c "import json; print(json.load(open('C:/Users/mesha/AppData/Roaming/com.vercel.cli/Data/auth.json'))['token'])")
TEAM_ID="team_cGFXe2xrRySciNomITsbHNPE"
PROJECT_ID="prj_hxIzXUUNwVFAc2I9hIqcMpFw6Um3"

curl -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "gymboy"}'
```

Expected: JSON response with `"name": "gymboy"`.

- [ ] **Step 2: Update local .vercel/project.json**

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/gymboy
# Update projectName in .vercel/project.json from "gainboy" to "gymboy"
```

- [ ] **Step 3: Verify deployment still works**

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/gymboy
vercel --prod
```

- [ ] **Step 4: Verify gymboy.coach still resolves**

```bash
curl -sI https://gymboy.coach | head -3
```

Expected: HTTP 200.

---

### Task 4: Rename Vercel project rounaq-atelier -> atelier-rounaq

**Context:** GitHub repo is `alawein/atelier-rounaq`, local dir is `atelier-rounaq`, but Vercel project name is `rounaq-atelier`. Custom domain `atelier-rounaq.com` is correct.

- [ ] **Step 1: Rename project via Vercel API**

```bash
TOKEN=$(python -c "import json; print(json.load(open('C:/Users/mesha/AppData/Roaming/com.vercel.cli/Data/auth.json'))['token'])")
TEAM_ID="team_cGFXe2xrRySciNomITsbHNPE"
PROJECT_ID="prj_0vb92GtBH8dRaDDQzzkap8AkUim5"

curl -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "atelier-rounaq"}'
```

Expected: JSON response with `"name": "atelier-rounaq"`.

- [ ] **Step 2: Update local .vercel/project.json**

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/atelier-rounaq
# Update projectName from "atelier-rounaq" (check current value) to match new name
```

- [ ] **Step 3: Verify atelier-rounaq.com still resolves**

```bash
curl -sI https://atelier-rounaq.com | head -3
```

Expected: HTTP 200.

---

### Task 5: Delete orphan projects on morphism-systems team

**Context:** The morphism-systems team (`team_QMHsBAJnn7KIZyUUi4A0hleM`) has two projects not linked to any repo: `alawein` and `website-app`. These are stale artifacts.

- [ ] **Step 1: Confirm projects are truly orphaned**

```bash
TOKEN=$(python -c "import json; print(json.load(open('C:/Users/mesha/AppData/Roaming/com.vercel.cli/Data/auth.json'))['token'])")
MS_TEAM="team_QMHsBAJnn7KIZyUUi4A0hleM"

# List projects with details
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects?teamId=$MS_TEAM&limit=50" | python -c "
import sys, json
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(sys.stdin)
for p in data.get('projects', []):
    name = p.get('name')
    link = p.get('link')
    targets = p.get('targets', {})
    has_prod = bool(targets.get('production'))
    print(f'{name}: linked={bool(link)}, has_production={has_prod}, id={p[\"id\"]}')
"
```

Expected: Both show `linked=False`.

- [ ] **Step 2: Delete the orphan projects**

```bash
TOKEN=$(python -c "import json; print(json.load(open('C:/Users/mesha/AppData/Roaming/com.vercel.cli/Data/auth.json'))['token'])")
MS_TEAM="team_QMHsBAJnn7KIZyUUi4A0hleM"

# Delete "alawein" project from morphism-systems team
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/alawein?teamId=$MS_TEAM"

# Delete "website-app" project from morphism-systems team
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/website-app?teamId=$MS_TEAM"
```

Expected: HTTP 204 (no content) for each.

- [ ] **Step 3: Verify team is clean**

```bash
vercel project ls --scope morphism-systems
```

Expected: Only the `morphism` project remains (which is on the alawein team, not morphism-systems).

---

### Task 6: Decision checkpoint — remaining domainless projects

**Context:** 6 deployed sites have no custom domain and no canonical URL claiming one. These are functional on `*.vercel.app` subdomains. Each needs a decision:

| Project | Current URL | Suggested action |
|---|---|---|
| blackmalejournal | blackmalejournal.vercel.app | User decision: buy domain or add `*.meshal.ai` subdomain |
| loopholelab | loopholelab.vercel.app | User decision: keep as-is (FastAPI backend) or add subdomain |
| meatheadphysicist | meatheadphysicist.vercel.app | User decision: buy domain or add subdomain |
| qaplibria | qaplibria-rho.vercel.app | User decision: buy domain or add subdomain |
| repz | repz-alawein.vercel.app | User decision: buy domain or add subdomain |
| simcore | simcore-alawein.vercel.app | User decision: buy domain or add subdomain |

- [ ] **Step 1: Review the list above and decide per-project**

For each project, choose one of:
- **Add `<name>.meshal.ai` subdomain** (free, fast, uses existing DNS)
- **Buy/register a standalone domain** (costs money, requires DNS setup)
- **Keep as-is on `*.vercel.app`** (no action, works fine for non-public projects)

- [ ] **Step 2: Execute domain additions for chosen projects**

For each project that gets a `*.meshal.ai` subdomain:

```bash
cd C:/Users/mesha/Desktop/GitHub/alawein/<project>
vercel domains add <project>.meshal.ai
```

Then update canonical URLs in the project's HTML if any exist.

---

## Execution Summary

| Task | Type | Risk | Time est. |
|---|---|---|---|
| 1. chshlab subdomain | DNS + Vercel | Low (domain already on Vercel) | 5 min |
| 2. qmlab domain fix | DNS or code change | Medium (depends on domain ownership) | 10 min |
| 3. Rename gainboy -> gymboy | Vercel API | Low (just a name change) | 5 min |
| 4. Rename rounaq-atelier -> atelier-rounaq | Vercel API | Low | 5 min |
| 5. Delete orphan projects | Vercel API | Low (confirmed unlinked) | 5 min |
| 6. Domain decisions for 6 projects | User decision | None (decision only) | User-paced |

Tasks 1-5 are independent and can be executed in any order. Task 6 requires user input.
