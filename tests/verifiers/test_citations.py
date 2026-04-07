#!/usr/bin/env python3
"""Inline-fixture tests for scripts/verifiers/citations.py.

Run with:

    python tests/verifiers/test_citations.py
"""

from __future__ import annotations

import sys
import tempfile
import textwrap
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT_REAL = HERE.parent.parent
sys.path.insert(0, str(REPO_ROOT_REAL / "scripts"))

from verifiers import citations as cit  # noqa: E402
from verifiers import _common as common_module  # noqa: E402


def _write_fixture(tmp: Path, files: dict[str, str]) -> None:
    for rel, content in files.items():
        full = tmp / rel
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(content, encoding="utf-8")


def _patch(tmp: Path) -> None:
    common_module.REPO_ROOT = tmp
    cit.REPO_ROOT = tmp


def _make_js_refs(keys) -> str:
    """Build a js/references.js fixture matching the real file's multi-line format."""
    body = ["export const REFS = ["]
    for k in keys:
        body.append("  {")
        body.append(f"    key: '{k}',")
        body.append("    authors: 'X',")
        body.append("    year: 1900,")
        body.append("    title: 'T',")
        body.append("    journal: 'J',")
        body.append("    details: 'd',")
        body.append("    href: 'h',")
        body.append("  },")
    body.append("];")
    return "\n".join(body) + "\n"


def test_three_aligned_sources_pass() -> None:
    """All 3 bibliography sources have the same key set -> clean."""
    keys = ("bell1964", "chsh1969", "wang2025")
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "arxiv/main.tex": "\n".join(
                f"\\bibitem{{{k}}}\nfake bibliography entry for {k}.\n" for k in keys
            ),
            "paper.html": "\n".join(
                f'<li class="reference-item" id="ref-{k}">fake.</li>' for k in keys
            ),
            "js/references.js": _make_js_refs(keys),
        })
        _patch(tmp)
        issues = cit.check()
        assert not issues, f"expected clean, got {[i.description for i in issues]}"
        print("ok  test_three_aligned_sources_pass")


def test_missing_key_in_one_source_caught() -> None:
    """A key present in 2 of 3 sources produces a key-mismatch warning."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "arxiv/main.tex": "\\bibitem{bell1964}\nFoo.\n\\bibitem{wang2025}\nFoo.",
            "paper.html": (
                '<li class="reference-item" id="ref-bell1964">x</li>'
                '<li class="reference-item" id="ref-wang2025">x</li>'
            ),
            # JS missing wang2025:
            "js/references.js": _make_js_refs(("bell1964",)),
        })
        _patch(tmp)
        issues = cit.check()
        cats = [i.category for i in issues]
        assert "citations.key-mismatch" in cats, f"expected key-mismatch, got {cats}"
        mismatch = [i for i in issues if i.category == "citations.key-mismatch"]
        assert any("js/references.js" in i.file_paths[0] for i in mismatch), (
            "the mismatch should be on js/references.js"
        )
        assert any("wang2025" in i.description for i in mismatch), (
            "the description should name the missing key"
        )
        print(f"ok  test_missing_key_in_one_source_caught (filed {len(mismatch)} mismatch(es))")


def test_dangling_cite_is_error() -> None:
    """A \\cite{nonexistent} in the tex file produces a dangling-cite error."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "arxiv/main.tex": (
                "\\bibitem{bell1964}\nFoo.\n"
                "Per Bell's theorem \\cite{bell1964,nonexistent2099}, ...\n"
            ),
            "paper.html": '<li class="reference-item" id="ref-bell1964">x</li>',
            "js/references.js": _make_js_refs(("bell1964",)),
        })
        _patch(tmp)
        issues = cit.check()
        dangling = [i for i in issues if i.category == "citations.dangling-cite"]
        assert dangling, f"expected dangling-cite issue, got {[i.category for i in issues]}"
        assert any("nonexistent2099" in i.description for i in dangling), (
            f"expected dangling-cite to name nonexistent2099, got {[i.description for i in dangling]}"
        )
        print(f"ok  test_dangling_cite_is_error (caught {len(dangling)} dangling cite(s))")


def test_missing_source_file_is_error() -> None:
    """If one of the 3 sources doesn't exist, an error issue is filed."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        # Only create 2 of 3 sources:
        _write_fixture(tmp, {
            "arxiv/main.tex": "\\bibitem{bell1964}\nFoo.",
            "paper.html": '<li class="reference-item" id="ref-bell1964">x</li>',
            # js/references.js absent
        })
        _patch(tmp)
        issues = cit.check()
        missing = [i for i in issues if i.category == "citations.missing-source"]
        assert missing, f"expected missing-source error, got {[i.category for i in issues]}"
        assert any("js/references.js" in i.file_paths[0] for i in missing)
        print("ok  test_missing_source_file_is_error")


if __name__ == "__main__":
    failures = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
            except AssertionError as e:
                failures += 1
                print(f"FAIL {name}: {e}")
            except Exception as e:  # noqa: BLE001
                failures += 1
                print(f"ERROR {name}: {type(e).__name__}: {e}")
    if failures:
        print(f"\n{failures} test(s) failed")
        raise SystemExit(1)
    print("\nall tests passed")
