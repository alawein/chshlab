"""numbers.py — headline numerical claim drift + Bell/Tsirelson bound check.

v0.1 strategy: deterministic, no notebook execution. The canonical values
below are derived from ``notebooks/chshlab-simulations.ipynb`` at
``paper_p_lo = 0.10``. If the notebook formulas change, update the
HEADLINE_FACTS table here in the same commit and bump v0.2.

Two checks:
  1. Presence — every headline value should appear (in at least one of its
     printed forms) in every file in ``must_be_in``. A missing form is a
     ``warn`` issue, not an ``error``, because legitimate revisions might
     drop a citation.
  2. Bounds — any line stating ``S_LHV ≤ X`` or ``S_QM ≤ X`` is checked
     against the canonical bounds (Bell ≤ 2, Tsirelson ≤ 2√2 ≈ 2.828).
     ``S_sel`` is allowed to exceed Tsirelson — that's the paper's whole
     result — so it has no upper bound check.
"""

from __future__ import annotations

import math
import re
from typing import List

from ._common import REPO_ROOT, Issue, idempotency_hash, read_text


# === Canonical numerical values (v1.3 paper) ===
TOLERANCE_FLOAT = 5e-4
CLASSICAL_BOUND = 2.0                    # Bell, |S_LHV| ≤ 2
TSIRELSON_BOUND = 2 * math.sqrt(2)       # Quantum, ≈ 2.8284271
ALGEBRAIC_BOUND = 4.0                    # Trivial, |S| ≤ 4

# Headline facts to verify across the watched files.
# Each fact: a numerical value the v1.3 paper depends on, plus the printed
# forms it might appear as, plus the files that must contain at least one form.
HEADLINE_FACTS: list[dict] = [
    {
        "name": "S_sel exact rational",
        "value": 26 / 7,
        "printed": ("26/7", "26 / 7", "\\tfrac{26}{7}", "\\frac{26}{7}"),
        "must_be_in": ("paper.html", "arxiv/main.tex"),
    },
    {
        "name": "S_sel printed decimal",
        "value": 26 / 7,
        "printed": ("3.714",),
        "must_be_in": ("paper.html", "arxiv/main.tex", "docs/ACADEMIC_FACTCHECK.md"),
    },
    {
        "name": "E_xy exact rational (selected correlator)",
        "value": 13 / 14,
        "printed": ("13/14", "13 / 14", "\\tfrac{13}{14}", "\\frac{13}{14}"),
        "must_be_in": ("paper.html", "arxiv/main.tex"),
    },
    {
        "name": "Monte Carlo S",
        "value": 3.716,
        "printed": ("3.716",),
        "must_be_in": ("paper.html", "arxiv/main.tex", "docs/ACADEMIC_FACTCHECK.md"),
    },
    {
        "name": "Paper acceptance rate",
        "value": 0.70,
        "printed": ("70.0%", "70.0\\%", "70 \\%", "70%", "70.0\\,\\%"),
        "must_be_in": ("paper.html", "arxiv/main.tex", "docs/ACADEMIC_FACTCHECK.md"),
    },
    {
        "name": "Wang reported S",
        "value": 2.275,
        "printed": ("2.275",),
        "must_be_in": ("paper.html", "arxiv/main.tex", "docs/ACADEMIC_FACTCHECK.md"),
    },
    {
        "name": "Wang efficiency exponent (10^-18)",
        "value": 1e-18,
        "printed": (
            "10^{-18}",
            "10^-18",
            "10<sup>&minus;18</sup>",
            "10<sup>-18</sup>",
            "10\\^{-18}",
            "1e-18",
            "10^{\\,-18}",
            "$10^{-18}$",
        ),
        "must_be_in": ("paper.html", "arxiv/main.tex", "docs/ACADEMIC_FACTCHECK.md"),
    },
]


# === Bound regexes — context-aware ===
# Match "S" + a label-bearing subscript (LHV or QM) + a comparison + a number.
# Handles LaTeX subscript variants: S_LHV, S_{LHV}, S_{\rm LHV},
# S_{\mathrm{LHV}}, S_{\operatorname{LHV}}.
def _make_bound_regex(label: str) -> re.Pattern:
    return re.compile(
        r"S_(?:"
        + label + r"|"
        r"\{" + label + r"\}|"
        r"\{\\rm\s+" + label + r"\}|"
        r"\{\\mathrm\{" + label + r"\}\}|"
        r"\{\\operatorname\{" + label + r"\}\}"
        r")"
        r"\s*(?:[<≤=]|&le;|&lt;|\\le|\\leq)+\s*"
        r"([0-9]+(?:\.[0-9]+)?)"
    )


_BOUND_PATTERNS = [
    (
        _make_bound_regex("LHV"),
        CLASSICAL_BOUND + TOLERANCE_FLOAT,
        "S_LHV must satisfy Bell bound (<= 2)",
    ),
    (
        _make_bound_regex("QM"),
        TSIRELSON_BOUND + TOLERANCE_FLOAT,
        f"S_QM must satisfy Tsirelson bound (<= {TSIRELSON_BOUND:.4f})",
    ),
]


def check() -> List[Issue]:
    issues: List[Issue] = []
    issues.extend(_check_presence())
    issues.extend(_check_bounds())
    return issues


def _check_presence() -> List[Issue]:
    out: List[Issue] = []
    for fact in HEADLINE_FACTS:
        for rel_path in fact["must_be_in"]:
            full = REPO_ROOT / rel_path
            if not full.exists():
                out.append(Issue(
                    id=idempotency_hash(
                        "numbers.missing-file", rel_path, 0, fact["name"]
                    ),
                    category="numbers.missing-file",
                    severity="error",
                    auto_safe=False,
                    file_paths=[rel_path],
                    description=f"Watched file does not exist: {rel_path}",
                    verifier="numbers",
                ))
                continue
            text = read_text(full)
            if not any(form in text for form in fact["printed"]):
                out.append(Issue(
                    id=idempotency_hash(
                        "numbers.missing-value", rel_path, 0, fact["name"]
                    ),
                    category="numbers.missing-value",
                    severity="warn",
                    auto_safe=False,
                    file_paths=[rel_path],
                    description=(
                        f"Headline fact '{fact['name']}' "
                        f"(canonical {fact['value']!r}, expected one of "
                        f"{list(fact['printed'])!r}) "
                        f"not found in {rel_path}. Possible drift from v1.3 — "
                        f"verify whether this file should still cite the value."
                    ),
                    verifier="numbers",
                ))
    return out


def _check_bounds() -> List[Issue]:
    out: List[Issue] = []
    for rel_path in ("paper.html", "arxiv/main.tex"):
        full = REPO_ROOT / rel_path
        if not full.exists():
            continue
        text = read_text(full)
        for lineno, line in enumerate(text.splitlines(), start=1):
            for pattern, max_val, descr in _BOUND_PATTERNS:
                for m in pattern.finditer(line):
                    try:
                        val = float(m.group(1))
                    except ValueError:
                        continue
                    if val > max_val:
                        out.append(Issue(
                            id=idempotency_hash(
                                "numbers.bound-violation",
                                rel_path,
                                lineno,
                                m.group(0),
                            ),
                            category="numbers.bound-violation",
                            severity="error",
                            auto_safe=False,
                            file_paths=[rel_path],
                            description=(
                                f"{descr}. {rel_path}:{lineno} states "
                                f"{m.group(0)!r} (value {val})."
                            ),
                            verifier="numbers",
                        ))
    return out


if __name__ == "__main__":
    for issue in check():
        print(issue)
