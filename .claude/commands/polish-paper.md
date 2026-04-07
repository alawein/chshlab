---
description: Run the chshlab paper polish verifier loop (v0.1 read-only). Files GitHub issues for any drift; never edits or commits.
allowed-tools:
  - Read
  - Bash(python scripts/verify_paper.py:*)
  - Bash(gh issue list:*)
  - Bash(gh issue create:*)
---

# /polish-paper — chshlab paper polish loop (v0.1, read-only)

You are the operator of the chshlab continuous polish loop. This is **v0.1
read-only mode**: you may file GitHub issues, but you must **NOT** edit
any file, run `git commit`, or modify the working tree in any way.
That privilege is reserved for v0.2 once trust is earned.

Your job each iteration is to run the verifier orchestrator, read its
report, and surface every new issue exactly once as a GitHub issue.

## Control flow

Execute these steps in order. If any step fails, stop and report.

### 1. Run the verifier orchestrator with the cache short-circuit

```
python scripts/verify_paper.py --use-cache
```

Capture the exit code. The orchestrator writes
`output/polish/report-latest.md` and `.claude/polish-state.json`.

- **Exit 0** — clean. Print `polish: nothing to polish, sleeping.` and STOP.
  Do not file any issues. Do not run any other tools.
- **Exit 2** — a verifier itself crashed. Skip to step 5.
- **Exit 1** — issues found. Continue to step 2.

### 2. Read the report

```
Read: output/polish/report-latest.md
```

Note every issue's `id` (12-char idempotency hash), `category`,
`severity`, `file_paths`, and `description`.

### 3. Skip duplicates

For each issue, check whether a GitHub issue already exists with the
same `id` in its body or title:

```
gh issue list --label polish-suggested --search "<id>" --json number,title
```

If a match exists, **skip** that issue — do not file again.

### 4. File new issues (one per finding)

For each unmatched issue, create a GitHub issue:

```
gh issue create \
  --title "polish: <category> — <one-line description>" \
  --label polish-suggested \
  --body "<markdown body>"
```

The body must include:

- The idempotency `id` on its own line (so the next iteration can grep it)
- The verifier name
- The severity
- The file paths
- The full description text from the report
- A footer noting this was filed automatically by `/polish-paper`

After all issues are filed, print a one-line summary (`polish: filed N
new issue(s).`) and STOP. Do not chain into any other action.

### 5. Verifier crash path (only if step 1 returned exit 2)

The verifier itself broke — this is a `polish-bug`, not a finding about
the paper. File a single issue:

```
gh issue create \
  --title "polish: verifier crash — <verifier-name>" \
  --label polish-bug \
  --body "<traceback from report-latest.md, plus the report path>"
```

Then STOP.

## Hard constraints (never violate)

- Do **NOT** call Edit, Write, or any tool that modifies a file.
- Do **NOT** run `git commit`, `git add`, `git restore`, or `git push`.
- Do **NOT** chain into other slash commands.
- Do **NOT** read more files than the report itself names — no
  speculative exploration.
- Each invocation does **at most**: 1 verifier run + 1 report read +
  N idempotency lookups + N issue creations. Nothing else.

## After v0.1 (do not implement now)

Once `numbers` and `citations` have run for ~1 week with zero false
positives, the v0.2 spec in `docs/POLISH_LOOP.md` describes how to add
auto-commit for trivially safe categories. Until then this command stays
read-only.
