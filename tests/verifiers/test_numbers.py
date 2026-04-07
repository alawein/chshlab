#!/usr/bin/env python3
"""Inline-fixture tests for scripts/verifiers/numbers.py.

These tests construct fake paper.html / arxiv/main.tex / ACADEMIC_FACTCHECK.md
files in a temporary directory, monkey-patch the module's REPO_ROOT, and
assert the verifier's behavior. No pytest dependency — run with:

    python tests/verifiers/test_numbers.py
"""

from __future__ import annotations

import sys
import tempfile
import textwrap
from pathlib import Path

# Make scripts/ importable
HERE = Path(__file__).resolve().parent
REPO_ROOT_REAL = HERE.parent.parent
sys.path.insert(0, str(REPO_ROOT_REAL / "scripts"))

from verifiers import numbers as numbers_module  # noqa: E402
from verifiers import _common as common_module  # noqa: E402


# === Fixture builders ===


def _write_fixture(tmpdir: Path, files: dict[str, str]) -> None:
    for rel, content in files.items():
        full = tmpdir / rel
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(content, encoding="utf-8")


def _patch_repo_root(tmpdir: Path) -> None:
    common_module.REPO_ROOT = tmpdir
    numbers_module.REPO_ROOT = tmpdir


# === Tests ===


def test_clean_repo_passes() -> None:
    """A repo containing all canonical values in their LaTeX/HTML forms is clean."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "paper.html": textwrap.dedent("""
                <p>The exact value is 26/7 ≈ 3.714, which is 13/14 per correlator.</p>
                <p>Monte Carlo: S = 3.716 at 70.0% acceptance.</p>
                <p>Wang reports S = 2.275 at 10<sup>&minus;18</sup> efficiency.</p>
            """).strip(),
            "arxiv/main.tex": textwrap.dedent(r"""
                The exact value is $26/7 \approx 3.714$, which is $13/14$ per correlator.
                Monte Carlo: $S = 3.716$ at \textbf{70.0\%} acceptance.
                Wang reports $S = 2.275$ at $10^{-18}$ efficiency.
            """).strip(),
            "docs/ACADEMIC_FACTCHECK.md": textwrap.dedent("""
                The decimal is 3.714. Monte Carlo: 3.716 at 70.0% acceptance.
                Wang reports S = 2.275 at 10^-18 efficiency.
            """).strip(),
        })
        _patch_repo_root(tmp)
        issues = numbers_module.check()
        assert not issues, f"expected clean, got {len(issues)} issues: {[i.description for i in issues]}"
        print("ok  test_clean_repo_passes")


def test_drift_in_one_file_is_caught() -> None:
    """Removing a canonical value from arxiv/main.tex produces a missing-value warn."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "paper.html": "26/7, 3.714, 13/14, 3.716, 70.0%, 2.275, 10^{-18}",
            "arxiv/main.tex": "26/7, 13/14, 3.716, 70.0\\%, 2.275, $10^{-18}$",
            # ACADEMIC_FACTCHECK.md missing the 3.714 decimal entirely:
            "docs/ACADEMIC_FACTCHECK.md": "Just 3.716 and 70.0% and 2.275 and 10^-18.",
        })
        _patch_repo_root(tmp)
        issues = numbers_module.check()
        # We expect AT LEAST one issue: the missing "3.714" decimal in factcheck
        cats = [i.category for i in issues]
        assert "numbers.missing-value" in cats, f"expected missing-value, got {cats}"
        descrs = [i.description for i in issues]
        assert any("3.714" in d for d in descrs), f"expected drift on 3.714, got {descrs}"
        print(f"ok  test_drift_in_one_file_is_caught (caught {len(issues)} issue(s))")


def test_bell_bound_violation_is_error() -> None:
    """A statement like S_LHV ≤ 3 is flagged as a bound-violation error."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "paper.html": "Bound: $S_{\\rm LHV} \\le 3$ — wrong on purpose.",
            # Need a clean tex file so other facts don't dominate the report:
            "arxiv/main.tex": "26/7 13/14 3.714 3.716 70.0\\% 2.275 $10^{-18}$",
            "docs/ACADEMIC_FACTCHECK.md": "3.714 3.716 70.0% 2.275 10^-18",
        })
        _patch_repo_root(tmp)
        issues = numbers_module.check()
        cats = [i.category for i in issues]
        assert "numbers.bound-violation" in cats, (
            f"expected bound-violation, got {cats}; descriptions: "
            f"{[i.description for i in issues]}"
        )
        bound_issues = [i for i in issues if i.category == "numbers.bound-violation"]
        assert any("S_LHV" in i.description for i in bound_issues), (
            "bound issue should mention S_LHV"
        )
        print(f"ok  test_bell_bound_violation_is_error (caught {len(bound_issues)} bound issue(s))")


def test_tsirelson_bound_violation_is_error() -> None:
    """A statement like S_QM ≤ 3 is flagged because 3 > 2√2."""
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        _write_fixture(tmp, {
            "paper.html": "26/7 13/14 3.714 3.716 70.0% 2.275 10^{-18}",
            "arxiv/main.tex": "Bound: $S_{\\rm QM} \\le 3$ — wrong on purpose. 26/7 13/14 3.714 3.716 70.0\\% 2.275 $10^{-18}$",
            "docs/ACADEMIC_FACTCHECK.md": "3.714 3.716 70.0% 2.275 10^-18",
        })
        _patch_repo_root(tmp)
        issues = numbers_module.check()
        bound_issues = [i for i in issues if i.category == "numbers.bound-violation"]
        assert any("S_QM" in i.description for i in bound_issues), (
            f"expected S_QM bound violation, got {[i.description for i in bound_issues]}"
        )
        print(f"ok  test_tsirelson_bound_violation_is_error (caught {len(bound_issues)} bound issue(s))")


def test_idempotency_hash_stable() -> None:
    """Same inputs produce same hash; different inputs produce different hash."""
    h1 = common_module.idempotency_hash("cat", "f.py", 10, "desc")
    h2 = common_module.idempotency_hash("cat", "f.py", 10, "desc")
    h3 = common_module.idempotency_hash("cat", "f.py", 11, "desc")
    assert h1 == h2, "same inputs must produce same hash"
    assert h1 != h3, "different inputs must produce different hash"
    assert len(h1) == 12, "hash should be 12 chars"
    print("ok  test_idempotency_hash_stable")


# === Runner ===

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
