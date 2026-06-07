---
type: canonical
owner: platform-engineering
last-reviewed: 2026-06-06
---

# Troubleshooting -- chshlab

This document records known failure modes and diagnostic steps for local development and build issues. No persistent operational failures are currently tracked; if you encounter a new issue worth recording, add it here.

## Common Issues

**Figure generation fails**

`python scripts/generate_figures.py` requires numpy and matplotlib. If these are not installed in the active Python environment, the script will error on import. Install with:

```bash
pip install numpy matplotlib
```

The script targets Python 3.12. Use `py -3.12` on Windows if multiple Python versions are present.

**Shared HTML partials drift out of sync**

If `index.html`, `paper.html`, or `404.html` shows stale head or style content after editing a partial, run:

```bash
python scripts/sync_shared_html.py
```

Do not hand-edit the shared fragments in each page; `partials/` is the source of truth.

**`npm test` fails with module resolution errors**

The test suite uses vitest and browser DOM simulation. Ensure dependencies are installed:

```bash
npm install
npm test
```

Running tests requires Node.js with access to the project's `package.json`. The test suite covers JS/DOM behavior and demo math across 14 files (142 tests as of the 2026-04-06 baseline).

**`bash build.sh` fails on Windows**

`build.sh` is a POSIX shell script. Run it from Git Bash or WSL, not from Command Prompt or PowerShell directly. Alternatively, trace through the script steps manually to identify the failing command.

**Local preview shows cached assets**

Vercel sets `Cache-Control: public, max-age=0, must-revalidate` on all routes and `max-age=31536000, immutable` on `/assets/`. These headers apply on Vercel only. Locally, hard-refresh the browser or clear the browser cache if assets appear stale after regeneration.

## Diagnostic Steps

1. Confirm the failing command and its error output.
2. For Python scripts: verify `py -3.12 --version` and that required packages are installed in that interpreter.
3. For the build: run `bash build.sh` from Git Bash and read the full output; the script exits on the first failing step.
4. For the test suite: run `npm install` first, then `npm test -- --run`.
5. For visual regressions: run `python scripts/run_visual_audit.py` to capture a screenshot matrix and compare manually.

## Known Failure Modes

No persistent failure modes are currently recorded. The Python 3.11 repair history is documented in `docs/PYTHON311_REPAIR_NOTE.md`.

## FAQ

**Is the site deployed somewhere I can reference?**

The site is configured for Vercel deployment via `vercel.json`. Whether it is currently publicly accessible depends on the Vercel project settings, which are not tracked in this repository. To reproduce any result locally, serve the repo root with `python -m http.server 4317`.
