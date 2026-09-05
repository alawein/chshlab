"""Shared types and helpers for paper-consistency verifiers.

The Issue dataclass and helpers here are deliberately tiny — every
verifier module imports from here so the orchestrator can produce a
uniform JSON report regardless of which check fired.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable, List, Sequence


# Generated and dependency paths excluded from verification inputs.
POLISH_IGNORE: frozenset[str] = frozenset({
    "output/verification/",
    "CHANGELOG.md",
    "coverage/",
    "node_modules/",
    ".vercel/",
    "__pycache__/",
})


def find_repo_root(start: Path | None = None) -> Path:
    """Walk up from ``start`` (or this file's parent) until a ``.git`` dir is found."""
    here = (start or Path(__file__)).resolve()
    for candidate in [here] + list(here.parents):
        if (candidate / ".git").exists():
            return candidate
    raise RuntimeError(f"Could not find repo root from {here}")


REPO_ROOT: Path = find_repo_root()


def read_text(path: Path) -> str:
    """Read a file as UTF-8 with LF line endings, returning empty string if missing."""
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def is_ignored(rel_path: str) -> bool:
    """Return True if a relative path is in POLISH_IGNORE."""
    return any(rel_path == p or rel_path.startswith(p) for p in POLISH_IGNORE)


def idempotency_hash(category: str, file_path: str, line: int, description: str) -> str:
    """Stable hash for de-duplicating GitHub issues across runs.

    Two findings with the same (category, file, line, description) tuple get
    the same id, so the orchestrator can ``gh issue list --search <id>`` and
    skip filing duplicates.
    """
    raw = f"{category}|{file_path}|{line}|{description}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:12]


@dataclass
class Issue:
    """A single finding from a verifier module.

    auto_safe: True means a future v0.2 write-mode loop is allowed to fix
    this category automatically. v0.1 ignores this field — every issue is
    surfaced for human review regardless.
    """
    id: str
    category: str
    severity: str            # "info" | "warn" | "error"
    auto_safe: bool
    file_paths: List[str]
    description: str
    suggested_fix: str | None = None
    verifier: str = ""       # filled in by orchestrator from module name

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class VerifierResult:
    """Output of a single verifier module."""
    name: str
    ok: bool
    issues: List[Issue] = field(default_factory=list)
    error: str | None = None    # set only if the verifier itself crashed

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "ok": self.ok,
            "issues": [i.to_dict() for i in self.issues],
            "error": self.error,
        }


def fingerprint_files(paths: Iterable[Path]) -> str:
    """SHA-256 over the concatenated bytes of each file (sorted)."""
    h = hashlib.sha256()
    for p in sorted(paths):
        h.update(str(p).encode("utf-8"))
        h.update(b"\0")
        if p.exists():
            h.update(p.read_bytes())
        h.update(b"\0")
    return h.hexdigest()
