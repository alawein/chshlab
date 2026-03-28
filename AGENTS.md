---
type: canonical
source: none
sync: none
sla: none
---

<!-- CUSTOM OVERRIDE: entire file — project-specific agent rules for static CHSH site, no-framework constraint, academic content integrity, build.sh/Vercel deploy. [Task 1.4 audit 2026-03-22] -->
---
type: normative
authority: canonical
last-verified: 2026-03-27
audience: [ai-agents, contributors]
---

# AGENTS

## Purpose

This repository contains CHSH Lab, a static two-page site that presents a rebuttal to Bell-inequality-violation claims with interactive browser-side demos and a formal paper page.

## Always

- Keep the site static. Prefer plain HTML, CSS, ES modules, and generated image assets.
- Preserve the current content model: `index.html` for the interactive narrative and `paper.html` for the canonical paper artifact.
- Keep all interactive behavior client-side. Do not add backend services, API calls, or analytics collectors.
- Keep the live dashboard and share surfaces on `index.html`. They may use local DOM events such as `chshlab:state` and `chshlab:metric`, but they must not post data off-page.
- Verify site changes with a local static server and a browser pass when behavior, layout, or navigation changes.
- Keep `build.sh` and `vercel.json` in sync with the files that must ship in `.vercel/output/static/`.
- Use safe DOM APIs in JavaScript. Prefer `textContent`, `createElement`, `createElementNS`, and explicit attribute setting.
- Maintain accessibility affordances already present in the site, including skip links, ARIA labels, keyboard support, and reduced-motion behavior.
- Treat `docs/` as the planning and evidence archive. Update it only when documentation or governance actually changes.

## Never

- Do not introduce frameworks, bundlers, or package-manager scaffolding unless explicitly requested.
- Do not replace the current static deploy path with a server-rendered or client-routed application.
- Do not add user-input HTML injection patterns or unsafe `innerHTML` flows for dynamic content.
- Do not connect `chshlab:metric` events to remote analytics, telemetry backends, or third-party SDKs.
- Do not commit generated browser state, Playwright output, or other transient local artifacts.
- Do not remove or rewrite academic claims, figures, or references without checking the corresponding files under `docs/`.

## Ask First

- Ask before changing the core argument, citations, author metadata, or paper claims.
- Ask before changing deployment targets or hosting assumptions beyond the current Vercel build-output flow.
- Ask before deleting large documentation sections, archived planning files, or figure assets.
- Ask before regenerating figures if the output would materially change the published visuals.

## Working Boundaries

- Primary editable surface: `index.html`, `paper.html`, `css/`, `js/`, `assets/figures/`, and top-level governance files.
- The current runtime additions are the `#lab-dashboard` section on `index.html`, the conclusion share module, and `js/dashboard.js`.
- Documentation sources of truth for planning and evidence live under `docs/`.
- Figure regeneration is done through `scripts/generate_figures.py` and writes to `assets/figures/`.
