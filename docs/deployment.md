---
type: canonical
owner: platform-engineering
last-reviewed: 2026-06-06
---

# Deployment and Release -- chshlab

CHSH Lab is a research static site. Deployment is through Vercel, configured in `vercel.json`. There is no staging environment and no automated release pipeline beyond what Vercel provides on push.

## Deployment Process

The build command is `bash build.sh`. It assembles a Vercel Build Output API bundle in `.vercel/output/`. Vercel reads this directory directly; `outputDirectory` is set to `.vercel/output` in `vercel.json`.

`build.sh` also runs `python scripts/sync_shared_html.py` to ensure shared head/style fragments are propagated into all public HTML pages before the output is frozen.

To reproduce the build locally:

```bash
bash build.sh
```

Successful output lands in `.vercel/output/`. Serve the repo root with `python -m http.server 4317` for a local preview before pushing.

## Release Strategy

This is a research site, not a product with versioned releases. Changes land on `main` and deploy automatically through the Vercel GitHub integration. There is no semver tagging or changelog requirement for site updates, though significant content changes are logged in `docs/migration_changelog.md`.

## Rollback Procedures

Vercel retains a deployment history. To roll back, redeploy a prior deployment from the Vercel dashboard or via the Vercel CLI. No database or stateful service is involved, so rollback carries no data-migration risk.

## Environment Configuration

No secret environment variables are required. The site is fully static. `vercel.json` configures:

- `cleanUrls: true` and `trailingSlash: false` for URL normalization.
- Permanent redirects from `/paper.html` to `/paper` and from `/index.html` to `/`.
- Security and cache headers on all routes; long-lived immutable caching on `/assets/`.

No `.env` file or Vercel environment variable setup is needed to build or preview this site locally.
