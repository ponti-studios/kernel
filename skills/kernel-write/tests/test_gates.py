"""Gate-correctness sanity checks. No LLM calls, no subprocess — pure text.

These don't judge writing quality (see test_quality.py for that); they lock
in that the rule-based checkers in gates/*.py behave correctly against known
fixtures, including regressions found by exercising the pipeline for real.
"""

from conftest import load_fixture
from gates import check as gate_check


def test_approve_gate_does_not_crash_on_frozen_essay():
    """Regression test for a bug where gates/approve.py called
    draft.split_title(text), but split_title lives in _helpers.py, not
    draft.py — this crashed every real call to the approve gate, including
    any baseline/frozen-essay comparison. Caught by running the real
    kernel-write pipeline end to end, not by the fixture-only test suite."""
    text = load_fixture("preservation-essay.md")

    results = gate_check("approve", text, baseline=text)

    failures = [(name, detail) for name, ok, detail in results if not ok]
    assert not failures, f"approve gate failed on a known-good essay: {failures}"

    frozen = dict((name, ok) for name, ok, _ in results).get("essay frozen")
    assert frozen is True


def test_good_draft_passes_draft_gate():
    text = load_fixture("good-draft.md")
    failures = [(name, detail) for name, ok, detail in gate_check("draft", text) if not ok]
    assert not failures, f"good-draft.md failed the draft gate: {failures}"


def test_weak_and_rough_drafts_fail_draft_gate():
    for fixture_name in ("weak-draft.md", "rough-draft.md"):
        text = load_fixture(fixture_name)
        failures = [name for name, ok, _ in gate_check("draft", text) if not ok]
        assert failures, f"{fixture_name} was expected to fail at least one draft rule"
