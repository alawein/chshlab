---
type: canonical
owner: platform-engineering
last-reviewed: 2026-06-06
---

# Architecture Overview -- chshlab

CHSH Lab is a static two-page website. There is no build-time framework, no server-side runtime, and no database. The repository ships HTML, CSS, and browser JavaScript directly, with Python utility scripts for offline figure generation and site maintenance.

## Components

**Public pages**

- `index.html` -- interactive narrative surface presenting the CHSH/Bell inequality argument and browser-side demos.
- `paper.html` -- formal paper artifact and print-friendly reference view.
- `404.html` -- not-found fallback page.

**Styling**

- `css/tokens.css` -- CSS custom properties for the design system.
- `css/base.css`, `css/layout.css`, `css/components.css`, `css/paper.css`, `css/not-found.css` -- page-level stylesheets.

**JavaScript (browser ES modules)**

- `js/main.js` -- entry point and page initialization.
- `js/demo-chsh.js`, `js/demo-efficiency.js`, `js/demo-postselect.js` -- interactive demos for the CHSH inequality, detection efficiency, and post-selection constructions.
- `js/fig-bell-test.js`, `js/fig-gauge.js`, `js/fig-event-stream.js` -- figure rendering utilities.
- `js/references.js` -- bibliography data (21-entry reference list).
- Additional ES modules for animation, navigation, scroll behavior, sonification, and starfield rendering.

**Shared partials**

- `partials/head-shared.html`, `partials/styles-core.html` -- HTML fragments shared across public pages, kept in sync by `scripts/sync_shared_html.py`.

**Offline utilities (Python)**

- `scripts/generate_figures.py` -- generates figure assets into `assets/figures/` using numpy and matplotlib.
- `scripts/sync_shared_html.py` -- propagates shared head/style partials into `index.html`, `paper.html`, and `404.html`.
- `scripts/run_visual_audit.py` -- captures a screenshot matrix via Playwright into `output/playwright/`.

## Data Flow

All content is static. The browser loads HTML, CSS, and JavaScript directly from the CDN/edge. No API calls are made at runtime. Interactive demos compute results in-browser using JavaScript math. CDN-loaded dependencies (KaTeX for math rendering) are declared in the HTML `<head>`.

Figure assets under `assets/figures/` are generated offline and committed. They are not regenerated at deploy time.

## Dependencies

**Runtime (browser, CDN-loaded)**

- KaTeX -- math formula rendering.
- No other runtime framework dependencies; the site uses vanilla HTML, CSS, and ES modules.

**Offline tooling**

- Python 3.12 with numpy and matplotlib -- figure generation.
- Playwright -- visual audit script.
- vitest (via `package.json`) -- JS/DOM test suite (14 files, 142 tests as of 2026-04-06 baseline).

**Deploy infrastructure**

- `build.sh` -- assembles the Vercel Build Output API bundle into `.vercel/output/`.
- `vercel.json` -- routing, redirect, cache, and security header configuration.

## Constraints

- The site must remain static: no backend services, analytics collectors, or server-side runtimes without explicit approval.
- The two-page model (`index.html` for narrative, `paper.html` for the formal paper) must be preserved.
- All published figures must be traceable to their source generation script.
- Shared head/style fragments are owned by `partials/` and must be propagated through `scripts/sync_shared_html.py`, not hand-edited in individual pages.
