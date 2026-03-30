---
type: canonical
source: none
sync: none
sla: none
---

<!-- CUSTOM OVERRIDE: entire file — static two-page site for CHSH Bell inequality rebuttal, build.sh deploy, no framework, browser ES modules. [Task 1.4 audit 2026-03-22] -->
---
type: guide
authority: canonical
last-verified: 2026-03-21
audience: [ai-agents, contributors]
---

# CLAUDE

## Repo Summary

CHSH Lab is a static site with:

- `index.html`: interactive narrative experience
- `paper.html`: formal paper presentation
- `css/`: tokens, base styles, layout, components, and paper-specific styles
- `js/`: ES-module interactions and visual demos
- `assets/figures/`: generated figures used by the site
- `docs/`: planning, provenance, fact-check, and upgrade history

## Workflow

1. Read `AGENTS.md`, `SSOT.md`, and `LESSONS.md` before making structural changes.
2. Inspect the exact files you intend to modify; this repo has no framework conventions to infer behavior for you.
3. For UI or behavior changes, run a local static server and validate in a browser.
4. If deploy output could change, run the build script and confirm `.vercel/output/` is produced successfully.
5. Keep changes small and directly tied to the site or governance.

## Quality Gates

Current repo-supported checks:

- Build: `bash build.sh`
- Tests: `npm test` (Vitest + jsdom, 142 tests across 14 files)
- Manual preview: `python -m http.server 4317` from the repo root
- Browser validation: open `http://127.0.0.1:4317/index.html` and `http://127.0.0.1:4317/paper.html`

Unavailable: lint, typecheck.

## Implementation Notes

- Production domain: `chshlab.online` (GoDaddy -> Cloudflare -> Vercel). Canonical URLs in both HTML files must match.
- JavaScript is loaded as browser ES modules from `js/main.js`.
- Third-party runtime dependencies are CDN-loaded in the HTML documents, not installed through a package manager.
- `build.sh` creates a Vercel Build Output API v3 layout under `.vercel/output/`.
- `vercel.json` mirrors the build command and response headers.
- The site currently uses a two-page structure; avoid reintroducing stale single-page assumptions from older planning docs.

## Test Infrastructure

- Framework: Vitest 3.x with jsdom environment
- Setup: `tests/setup.js` stubs Canvas2D, ResizeObserver, IntersectionObserver, matchMedia, clipboard, and CSS custom properties
- Coverage: `npm run test:coverage` (v8 provider, excludes scroll/starfield/sonification/paper modules)
- Canvas-heavy modules (fig-bell-test, fig-event-stream) are tested for initialization and controls but not rendering (needs Playwright)
- Demo math is tested indirectly through DOM readouts after calling init functions, not by exporting private functions

## Editing Conventions

- Paper math was audited 2026-03-29: all derivations verified correct. Tsirelson proof uses S^2 = 4I - [A,A']⊗[B,B'] (minus, not plus).
- Keep files UTF-8 with LF endings per `.editorconfig`.
- Use root-relative or document-relative links consistently with the current static structure.
- When you add a new top-level shipped asset, make sure `build.sh` copies it.
- When you change citation or evidence text, cross-check `docs/CONTENT_MAP.md`, `docs/ACADEMIC_FACTCHECK.md`, and `docs/FIGURE_PROVENANCE.md`.
