---
type: canonical
source: _devkit/templates
sync: propagated
sla: none
---

# Contributing to chshlab

CHSH Lab is a static two-page site: an interactive CHSH / Bell-inequality rebuttal on `index.html`
and a formal paper surface on `paper.html`.

This project follows the [alawein org contributing standards](https://github.com/alawein/alawein/blob/main/CONTRIBUTING.md).

## Getting Started

```bash
git clone https://github.com/alawein/chshlab.git
cd chshlab
npm ci
```

## Development Workflow

1. Branch off `main` using prefix: `feat/`, `fix/`, `docs/`, `chore/`, `test/`
2. Make your changes and keep PRs focused on a single concern
3. Run `npm test` to validate your changes before committing
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/), as `type(scope): subject`
5. Open a Pull Request to `main`

## Code Standards

- Keep the site static and two-page: `index.html` for the narrative, `paper.html` for the paper
- Use safe DOM APIs and browser ES modules only; no backend, analytics, or framework runtime
- Run `npm test` and `bash build.sh` before committing; add tests for new behavior
- Regenerate figures through `scripts/`; do not hand-edit published figure artifacts

## Pull Request Checklist

- [ ] CI passes (no failing checks)
- [ ] Tests added or updated for new functionality
- [ ] `npm test && bash build.sh` passes
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] No breaking changes without a version bump plan

## Reporting Issues

Open an issue on the [GitHub repository](https://github.com/alawein/chshlab/issues) with steps to reproduce and relevant context.

## License

By contributing, you agree that your contributions will be licensed under [MIT](LICENSE).
