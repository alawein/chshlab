---
type: canonical
source: none
sync: none
sla: none
---

# Polish Loop

A continuous, low-noise verifier that watches the chshlab paper surfaces
(`paper.html`, `arxiv/main.tex`, `notebooks/chshlab-simulations.ipynb`,
`js/references.js`, `docs/ACADEMIC_FACTCHECK.md`) and surfaces drift as
GitHub issues. **v0.1 is read-only**: it never edits, never commits, and
never opens PRs. Findings are filed as `polish-suggested` issues for the
operator to review and act on by hand.

The loop is invoked via Claude Code's `loop` skill , local to your
terminal, zero infrastructure, stops when the terminal closes.

## How to start the loop

In a terminal at the repo root:

```
/loop 15m /polish-paper
```

This runs the `/polish-paper` slash command every 15 minutes for as long
as the terminal stays open. Each iteration is bounded , at most one
verifier run, one report read, and N GitHub issue creations.

To stop the loop, run `/loop stop` or close the terminal.

## What v0.1 ships

| Component | Path | Role |
|---|---|---|
| Orchestrator | `scripts/verify_paper.py` | Runs all enabled verifiers, emits the JSON + Markdown report, manages the fingerprint cache |
| Common types | `scripts/verifiers/_common.py` | `Issue` and `VerifierResult` dataclasses, ignore list, hash helpers |
| `numbers` verifier | `scripts/verifiers/numbers.py` | Headline-value drift detection + Bell/Tsirelson bound enforcement |
| `citations` verifier | `scripts/verifiers/citations.py` | 3-way bibliography cross-check between `arxiv/main.tex`, `paper.html`, `js/references.js`; dangling `\cite{}` detection |
| Slash command | `.claude/commands/polish-paper.md` | The Claude Code command that consumes the report and files issues |
| Operator doc | `docs/POLISH_LOOP.md` (this file) | What you are reading |
| Self-tests | `tests/verifiers/test_*.py` | Inline-fixture tests run with `python tests/verifiers/test_<name>.py` |

## What each verifier checks

### `numbers.py`

Hardcodes the canonical headline values from the v1.3 paper (taken from
`notebooks/chshlab-simulations.ipynb` at `paper_p_lo = 0.10`):

| Fact | Value | Printed forms watched |
|---|---|---|
| `S_sel` exact rational | `26/7` | `26/7`, `\tfrac{26}{7}`, `\frac{26}{7}` |
| `S_sel` printed decimal | `3.714` | `3.714` |
| `E_xy` exact rational | `13/14` | `13/14`, `\tfrac{13}{14}`, `\frac{13}{14}` |
| Monte Carlo `S` | `3.716` | `3.716` |
| Paper acceptance rate | `0.70` | `70.0%`, `70.0\%`, `70%` |
| Wang reported `S` | `2.275` | `2.275` |
| Wang efficiency exponent | `1e-18` | `10^{-18}`, `10<sup>−18</sup>`, `1e-18` |

Each fact has a list of files that **must** contain at least one of the
printed forms. A missing form is a `warn` issue, not an `error` ,
because legitimate revisions might drop a citation.

It also enforces hard physical bounds with regex on context-tagged
expressions:

- Any `S_LHV ≤ X` or `S_LHV = X` statement: `X` must satisfy `X ≤ 2`
  (Bell). Violations are `error`.
- Any `S_QM ≤ X` or `S_QM = X` statement: `X` must satisfy
  `X ≤ 2√2 ≈ 2.828` (Tsirelson). Violations are `error`.
- `S_sel` is **deliberately exempt** from upper bounds , the paper's
  whole result is that `S_sel = 26/7 ≈ 3.714 > 2√2`, so flagging this
  would defeat the purpose.

### `citations.py`

Three-way cross-check using the regexes:

| File | Pattern |
|---|---|
| `arxiv/main.tex` | `\bibitem{key}` |
| `paper.html` | `id="ref-key"` |
| `js/references.js` | `key: 'value',` |

Computes the union and per-source diffs. Any key that appears in some
sources but not others is a `warn` issue. The verifier also scans
`arxiv/main.tex` for `\cite{key}` usages and flags any key that doesn't
have a matching `\bibitem{}` as an `error` (dangling cite).

This verifier extends the contract that `tests/references.test.js`
already enforces over the JS bibliography (the canonical 21-entry list)
to the other two files.

## The output

Each run writes:

- `output/polish/report-<UTC-timestamp>.json` , full structured report
- `output/polish/report-latest.json` , symlink-style copy of the latest
- `output/polish/report-latest.md` , human-readable markdown
- `.claude/polish-state.json` , fingerprint cache (gitignored)

`output/polish/` is in `.gitignore`. `.claude/polish-state.json` is also
gitignored.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Clean , no issues |
| 1 | At least one issue |
| 2 | A verifier itself crashed (counts as `polish-bug`, not `polish-suggested`) |

## Anti-recursion

`docs/operations/session-log.md` is mutated by the `observability-log.sh`
post-commit hook on every commit. Watching it would create an infinite
loop. The verifier ignores it (along with `output/polish/`,
`.claude/polish-state.json`, `CHANGELOG.md`, `coverage/`,
`node_modules/`, `.vercel/`, `__pycache__/`) via the `POLISH_IGNORE` set
in `scripts/verifiers/_common.py`.

The `drift-detection.sh` hourly hook only watches
`CLAUDE.md`/`AGENTS.md`/`GUIDELINES.md` against `_pkos` templates , it
has zero overlap with the polish loop's watch set.

## Running the verifier directly

```
python scripts/verify_paper.py             # full run
python scripts/verify_paper.py --use-cache # short-circuit if no changes
python scripts/verify_paper.py --quiet     # suppress stdout, still writes report
```

For developing the verifier modules themselves:

```
python -m scripts.verifiers.numbers
python -m scripts.verifiers.citations
```

## Verifier self-tests

Each verifier has an inline-fixture self-test under `tests/verifiers/`
that does NOT depend on the live repo state. Run them with:

```
python tests/verifiers/test_numbers.py
python tests/verifiers/test_citations.py
```

These are intentionally lightweight , no pytest dependency, just `assert`
statements and `__main__` runners. The vitest suite in `tests/` covers
the JS demos, navigation, and references; the polish-loop self-tests
cover the Python verifiers.

## False positive triage

When you see a `polish-suggested` issue:

1. **Read the report**: `cat output/polish/report-latest.md`
2. **Check the file**: open the named file at the named line. Is the
   verifier right?
3. **If true positive**: fix the underlying drift, commit, and close
   the issue.
4. **If false positive**: edit the verifier (e.g. add a missing printed
   form to `HEADLINE_FACTS` in `numbers.py`) and re-run. Close the issue
   with a comment explaining the verifier fix.

Track per-verifier false positive rate manually for one week. Until both
`numbers` and `citations` produce **zero** false positives over 7 days,
do not enable v0.2 write mode.

## v0.2 (designed but not built)

When trust is earned, the slash command grows a write path. The complete
v0.2 control flow is:

1. Run verifiers with the cache short-circuit (same as v0.1)
2. Pick the smallest single `auto_safe=True` issue
3. `git worktree add ../chshlab-polish HEAD`
4. Apply the fix in the worktree (one Edit, ≤3 files)
5. Re-run verifiers in the worktree to confirm the fix and no new drift
6. `npm test -- --run` and `bash build.sh` in the worktree
7. If all green: cherry-pick the commit back to `main`, remove worktree
8. If anything red: `git worktree remove --force`, file an issue instead
9. After commit: sleep 60s, then `gh run list --limit 1 --json conclusion`
 , if `docs-doctrine.yml` failed on the push, auto-revert the commit
   and file an issue
10. STOP

Rate limits enforced in `.claude/polish-state.json`:

- Max 6 polish commits per hour
- Max 20 LLM iterations per day
- Quiet hours: 9am–10pm America/Los_Angeles only
- 30-minute floor between LLM iterations even if work is queued

`auto_safe=True` categories that v0.2 will eventually unlock (in this order):

1. `citations` casing normalization (`Wang2025` → `wang2025`)
2. Dangling whitespace in `.tex` files
3. Missing trailing newlines
4. (Later) figure freshness with SSIM perceptual diff (NEVER raw byte diff)
5. (Later) style normalization for en-dash vs em-dash, smart quotes

`auto_safe=False` is permanent for: numerical drift, proposition statement
divergence, cite-key removal, sign-convention changes, "post-selection"
vs "postselection" terminology (rhetorical choice, not a typo).

## Future verifiers (designed, not built)

| Verifier | Why it matters | Why it's deferred |
|---|---|---|
| `bounds.py` (split from `numbers.py`) | Cleaner separation of presence vs bound checks | Not needed yet , the bound check is simple enough to live inside `numbers.py` |
| `sign_conventions.py` | CHSH `S = ±E ± E ± E ± E` sign agreement across files | Needs symbolic extraction; sign errors are the most embarrassing class of Bell-paper bug |
| `measurement_settings.py` | `{a, a', b, b'}` consistency between paper and notebook | Notebook variable extraction needed |
| `cross_refs.py` | Dangling proposition/figure/equation labels | Adds more LaTeX label parsing |
| `prose_parity.py` | Proposition/definition diff between `paper.html` and `arxiv/main.tex` | High false-positive risk on phrasing variation |
| `figures.py` | Web ↔ arXiv figure parity, freshness, SSIM perceptual diff | Binary diff is risky; needs `scikit-image` |
| `style.py` | en-dash/em-dash, smart quotes, hyphenation, proper-noun case | Low value relative to risk of voice drift |
| `proof_step_lints.py` | `\begin{proof}`/`\end{proof}` balance, "by Proposition N" resolution | Adds more LaTeX parsing |
| `katex_parity.py` | Compile each `$...$` in `paper.html` through headless KaTeX | Needs Node bridge |
