#!/usr/bin/env python3
"""verify_paper.py — orchestrator for the chshlab polish-loop verifiers.

Reads the watched files, runs each enabled verifier module, and emits a
JSON + Markdown report under ``output/polish/``. Exit codes:

  0 — clean (no issues found)
  1 — at least one issue found
  2 — a verifier itself crashed (counts as ``polish-bug`` not ``polish-suggested``)

The fingerprint short-circuit (``--use-cache``) hashes the watched-file
contents against ``.claude/polish-state.json`` and exits in <1s without
running any verifier if nothing has changed AND the last run was clean.
That makes the loop nearly free when idle.

v0.1: pure observer. Does not edit files, does not commit. The
``.claude/commands/polish-paper.md`` slash command consumes this report
and (in v0.1) only files GitHub issues — never edits.
"""

from __future__ import annotations

import argparse
import importlib
import json
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List

# Make scripts/ importable so we can do "from verifiers import …"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from verifiers._common import (  # noqa: E402
    REPO_ROOT,
    Issue,
    VerifierResult,
    fingerprint_files,
)


# === Configuration ===

ENABLED_VERIFIERS: tuple[str, ...] = (
    "verifiers.numbers",
    "verifiers.citations",
)

# Files whose mtime/contents trigger a polish iteration. Anything not in this
# set is ignored by the fingerprint short-circuit.
WATCHED_FILES: tuple[str, ...] = (
    "paper.html",
    "arxiv/main.tex",
    "notebooks/chshlab-simulations.ipynb",
    "js/references.js",
    "docs/ACADEMIC_FACTCHECK.md",
    "docs/CONTENT_MAP.md",
    "scripts/generate_publication_figures.py",
)

OUTPUT_DIR = REPO_ROOT / "output" / "polish"
STATE_FILE = REPO_ROOT / ".claude" / "polish-state.json"


# === Orchestration ===


def run_verifier(module_name: str) -> VerifierResult:
    """Import and execute one verifier module's ``check()`` function."""
    short = module_name.rsplit(".", 1)[-1]
    try:
        mod = importlib.import_module(module_name)
        issues = mod.check()
        return VerifierResult(name=short, ok=True, issues=list(issues))
    except Exception:  # noqa: BLE001 — verifier crashes are explicitly caught
        return VerifierResult(
            name=short,
            ok=False,
            error=traceback.format_exc(),
        )


def write_report(results: list[VerifierResult]) -> tuple[Path, Path]:
    """Emit the JSON and Markdown reports under output/polish/. Returns paths."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ts_utc = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    json_path = OUTPUT_DIR / f"report-{ts_utc}.json"
    latest_md = OUTPUT_DIR / "report-latest.md"
    latest_json = OUTPUT_DIR / "report-latest.json"

    payload = {
        "schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "verifiers": [r.to_dict() for r in results],
        "totals": _totals(results),
    }
    serialized = json.dumps(payload, indent=2, ensure_ascii=False)
    json_path.write_text(serialized, encoding="utf-8")
    latest_json.write_text(serialized, encoding="utf-8")
    latest_md.write_text(_render_markdown(payload), encoding="utf-8")
    return json_path, latest_md


def _totals(results: list[VerifierResult]) -> dict:
    issues: list[Issue] = [i for r in results for i in r.issues]
    return {
        "verifiers_run": len(results),
        "verifiers_crashed": sum(1 for r in results if not r.ok),
        "issues_total": len(issues),
        "issues_by_severity": {
            "error": sum(1 for i in issues if i.severity == "error"),
            "warn": sum(1 for i in issues if i.severity == "warn"),
            "info": sum(1 for i in issues if i.severity == "info"),
        },
    }


def _render_markdown(payload: dict) -> str:
    lines: list[str] = []
    lines.append("# Polish report")
    lines.append("")
    lines.append(f"_Generated: {payload['generated_at_utc']}_")
    lines.append("")
    totals = payload["totals"]
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Verifiers run: **{totals['verifiers_run']}**")
    lines.append(f"- Verifiers crashed: **{totals['verifiers_crashed']}**")
    lines.append(f"- Issues total: **{totals['issues_total']}**")
    by_sev = totals["issues_by_severity"]
    lines.append(
        f"- By severity: error={by_sev['error']}, warn={by_sev['warn']}, info={by_sev['info']}"
    )
    lines.append("")

    for v in payload["verifiers"]:
        lines.append(f"## verifier: `{v['name']}`")
        lines.append("")
        if not v["ok"]:
            lines.append("**CRASHED** — see traceback below.")
            lines.append("")
            lines.append("```")
            lines.append((v.get("error") or "").strip())
            lines.append("```")
            lines.append("")
            continue
        if not v["issues"]:
            lines.append("_clean_")
            lines.append("")
            continue
        for issue in v["issues"]:
            lines.append(
                f"- **[{issue['severity']}] {issue['category']}** "
                f"`{issue['id']}` — {issue['description']}"
            )
            if issue.get("file_paths"):
                lines.append(f"  - files: {', '.join(issue['file_paths'])}")
            if issue.get("suggested_fix"):
                lines.append(f"  - suggested fix: {issue['suggested_fix']}")
        lines.append("")

    return "\n".join(lines)


# === Fingerprint short-circuit ===


def _load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
    return {}


def _save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _current_fingerprint() -> str:
    return fingerprint_files(REPO_ROOT / p for p in WATCHED_FILES)


# === Entry point ===


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--use-cache",
        action="store_true",
        help="Skip work if watched files haven't changed since the last clean run.",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress per-verifier output (still writes the report files).",
    )
    args = parser.parse_args(list(argv) if argv is not None else None)

    fingerprint = _current_fingerprint()
    state = _load_state()

    if args.use_cache and state.get("fingerprint") == fingerprint and state.get("last_clean"):
        if not args.quiet:
            print(
                f"polish: cached clean ({fingerprint[:12]}); skipping. "
                f"Last run {state.get('last_run_at')}."
            )
        return 0

    results: list[VerifierResult] = []
    for name in ENABLED_VERIFIERS:
        results.append(run_verifier(name))

    json_path, md_path = write_report(results)

    crashed = any(not r.ok for r in results)
    issues_total = sum(len(r.issues) for r in results)

    if not args.quiet:
        print(f"polish: report written to {md_path.relative_to(REPO_ROOT)}")
        print(
            f"polish: {len(results)} verifier(s), "
            f"{sum(1 for r in results if not r.ok)} crashed, "
            f"{issues_total} issue(s)"
        )

    state.update({
        "fingerprint": fingerprint,
        "last_run_at": datetime.now(timezone.utc).isoformat(),
        "last_clean": (issues_total == 0 and not crashed),
        "last_report": str(md_path.relative_to(REPO_ROOT)),
    })
    _save_state(state)

    if crashed:
        return 2
    if issues_total > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
