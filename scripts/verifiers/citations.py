"""citations.py — 3-way bibliography cross-check.

Per ``docs/CONTENT_MAP.md``, the canonical bibliography lives in three
files that must stay in lock-step:

  1. ``arxiv/main.tex``        — ``\\bibitem{key}`` entries
  2. ``paper.html``            — ``<li ... id="ref-key">`` entries
  3. ``js/references.js``      — ``key: '<value>'`` exports

A v0.1 verifier can do this with simple regex extraction. The existing
``tests/references.test.js`` already validates the 21-entry canon for the
JS source — this verifier extends the same contract to the other two files
and surfaces any key-set drift as a ``polish-suggested`` issue.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import List

from ._common import REPO_ROOT, Issue, idempotency_hash, read_text


# === Source files and their key-extraction regexes ===

# arxiv/main.tex: \bibitem{key}
_TEX_KEY_RE = re.compile(r"\\bibitem\{([a-zA-Z0-9_]+)\}")

# paper.html: id="ref-key"
_HTML_KEY_RE = re.compile(r'id="ref-([a-zA-Z0-9_]+)"')

# js/references.js: key: '<value>',
# We look for entries inside the REFS array. The structure is
#     {
#       key: 'bell1964',
#       authors: ...
#     },
_JS_KEY_RE = re.compile(r"^\s*key:\s*'([a-zA-Z0-9_]+)'", re.MULTILINE)


SOURCES = (
    ("arxiv/main.tex", _TEX_KEY_RE),
    ("paper.html", _HTML_KEY_RE),
    ("js/references.js", _JS_KEY_RE),
)


def _extract_keys(rel_path: str, pattern: re.Pattern) -> set[str] | None:
    """Return the set of bibliography keys parsed from one source file.

    Returns ``None`` if the file is missing (caller surfaces a separate issue).
    """
    full = REPO_ROOT / rel_path
    if not full.exists():
        return None
    text = read_text(full)
    return set(pattern.findall(text))


def check() -> List[Issue]:
    issues: List[Issue] = []

    # Step 1: extract from each source
    extracted: dict[str, set[str]] = {}
    missing_files: list[str] = []
    for rel_path, pattern in SOURCES:
        keys = _extract_keys(rel_path, pattern)
        if keys is None:
            missing_files.append(rel_path)
            issues.append(Issue(
                id=idempotency_hash(
                    "citations.missing-source", rel_path, 0, "bibliography source missing"
                ),
                category="citations.missing-source",
                severity="error",
                auto_safe=False,
                file_paths=[rel_path],
                description=f"Bibliography source not found: {rel_path}",
                verifier="citations",
            ))
            continue
        if not keys:
            issues.append(Issue(
                id=idempotency_hash(
                    "citations.empty-source", rel_path, 0, "no keys extracted"
                ),
                category="citations.empty-source",
                severity="error",
                auto_safe=False,
                file_paths=[rel_path],
                description=(
                    f"Bibliography source {rel_path} parsed to zero keys — "
                    f"verifier regex may be broken or the file format changed."
                ),
                verifier="citations",
            ))
            continue
        extracted[rel_path] = keys

    # If we couldn't extract from at least 2 sources, we can't cross-check
    if len(extracted) < 2:
        return issues

    # Step 2: union and per-source diffs
    union = set.union(*extracted.values())
    intersection = set.intersection(*extracted.values())

    # Issues for keys that appear in some sources but not others
    for rel_path, keys in extracted.items():
        missing_here = sorted(union - keys)
        if missing_here:
            issues.append(Issue(
                id=idempotency_hash(
                    "citations.key-mismatch",
                    rel_path,
                    0,
                    ",".join(missing_here),
                ),
                category="citations.key-mismatch",
                severity="warn",
                auto_safe=False,
                file_paths=[rel_path],
                description=(
                    f"{rel_path} is missing {len(missing_here)} bibliography "
                    f"key(s) that appear in other sources: "
                    f"{missing_here}. Per docs/CONTENT_MAP.md, paper.html, "
                    f"arxiv/main.tex, and js/references.js must stay in sync."
                ),
                verifier="citations",
            ))

    # Step 3: dangling cite checks (only for arxiv/main.tex \cite{} usage)
    issues.extend(_check_tex_cites(extracted.get("arxiv/main.tex", set())))

    return issues


_TEX_CITE_RE = re.compile(r"\\cite[a-z]*\{([^}]+)\}")


def _check_tex_cites(known_keys: set[str]) -> List[Issue]:
    """Find every \\cite{key,key2,...} usage and check the keys exist."""
    out: List[Issue] = []
    if not known_keys:
        return out
    full = REPO_ROOT / "arxiv/main.tex"
    if not full.exists():
        return out
    text = read_text(full)
    for lineno, line in enumerate(text.splitlines(), start=1):
        for m in _TEX_CITE_RE.finditer(line):
            keys_str = m.group(1)
            for key in (k.strip() for k in keys_str.split(",")):
                if key and key not in known_keys:
                    out.append(Issue(
                        id=idempotency_hash(
                            "citations.dangling-cite",
                            "arxiv/main.tex",
                            lineno,
                            key,
                        ),
                        category="citations.dangling-cite",
                        severity="error",
                        auto_safe=False,
                        file_paths=["arxiv/main.tex"],
                        description=(
                            f"\\cite{{{key}}} at arxiv/main.tex:{lineno} "
                            f"references a bibliography key that does not exist."
                        ),
                        verifier="citations",
                    ))
    return out


if __name__ == "__main__":
    for issue in check():
        print(issue)
