"""chshlab paper polish verifier modules.

Each module exposes ``check() -> list[Issue]``. The orchestrator
``scripts/verify_paper.py`` runs them all and emits a structured report.

v0.1: read-only observer. No edits, no commits. Findings surface as
GitHub issues tagged ``polish-suggested`` (or ``polish-bug`` for crashes).
See ``docs/POLISH_LOOP.md`` for the operator guide.
"""
