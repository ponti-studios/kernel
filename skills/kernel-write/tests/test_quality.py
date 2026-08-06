"""Qualitative gate: does the draft actually sound like the Monotone voice?

Rule-based checks in gates/draft.py catch mechanical violations (banned
openers, emphasis, paragraph shape). They can't tell a plainspoken, concrete
essay from a hedgy, abstract one that happens to avoid the banned words. This
file asks an LLM judge instead.
"""

import pytest
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

from conftest import load_fixture

VOICE_CRITERIA = (
    "Judge whether the TEXT is written in a plainspoken, concrete, direct essay "
    "voice, in the style of a sharp studio memo rather than an academic essay. "
    "Score it DOWN for each of these, even if the underlying idea is good: "
    "(1) it opens with throat-clearing like 'In recent years', 'Today,', or "
    "'Let's' instead of starting on the claim itself; "
    "(2) it uses academic connector words such as 'Therefore,', 'However,', "
    "'Furthermore,', or 'In addition,' to link sentences instead of just "
    "placing the sentences next to each other; "
    "(3) it closes with a summarizing wind-down like 'In conclusion,' or ends "
    "on a rhetorical question directed at the reader ('So what do you "
    "think?') instead of stopping on a flat declarative statement; "
    "(4) it hedges with words like 'perhaps', 'arguably', or 'some might "
    "say' instead of committing to the claim. "
    "Score it UP only if the piece states a claim early, argues it with "
    "specific concrete detail, and ends on a flat statement with no wind-down "
    "or question. A text can use a concrete metaphor and still score LOW if "
    "it also does (1)-(4) — those are disqualifying regardless of how vivid "
    "the imagery is."
)


# Small local judges (the Ollama fallback) score on a coarse, noisy scale — a
# response can nail the reasoning ("opens with throat-clearing, uses academic
# connectors, ends on a question") and still land the score right at the
# threshold boundary. Absolute bounds here are intentionally loose; the
# relative test below (good must outscore bad on the same rubric) is the
# noise-tolerant signal and should be trusted first if the two disagree.
HIGH_BAR = 0.5
LOW_BAR = 0.6


@pytest.mark.judge
@pytest.mark.parametrize(
    "fixture_name,expect_high",
    [
        ("good-draft.md", True),
        ("weak-draft.md", False),
        ("rough-draft.md", False),
    ],
)
def test_voice_adherence(judge_model, fixture_name, expect_high):
    metric = GEval(
        name="Monotone Voice Adherence",
        criteria=VOICE_CRITERIA,
        evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT],
        model=judge_model,
        threshold=0.5,
    )
    text = load_fixture(fixture_name)
    case = LLMTestCase(input="Write a Monotone-voice essay.", actual_output=text)

    metric.measure(case)

    if expect_high:
        assert metric.score >= HIGH_BAR, f"{fixture_name} scored {metric.score}: {metric.reason}"
    else:
        assert metric.score < LOW_BAR, f"{fixture_name} scored {metric.score}: {metric.reason}"


@pytest.mark.judge
@pytest.mark.parametrize("bad_fixture", ["weak-draft.md", "rough-draft.md"])
def test_good_draft_outscores_bad_draft(judge_model, bad_fixture):
    """Relative check: even if absolute thresholds drift with judge models, the
    good fixture must always beat a known-bad one on the same rubric."""
    metric = GEval(
        name="Monotone Voice Adherence",
        criteria=VOICE_CRITERIA,
        evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT],
        model=judge_model,
        threshold=0.5,
    )

    good_case = LLMTestCase(input="essay", actual_output=load_fixture("good-draft.md"))
    bad_case = LLMTestCase(input="essay", actual_output=load_fixture(bad_fixture))

    metric.measure(good_case)
    good_score = metric.score
    metric.measure(bad_case)
    bad_score = metric.score

    assert good_score > bad_score, (
        f"good-draft ({good_score}) did not outscore {bad_fixture} ({bad_score})"
    )
