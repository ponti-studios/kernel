"""End-to-end report behavior on a tiny corpus."""

from phrase_audit.cli import report


def test_report_runs_and_shapes_results(tmp_path):
    (tmp_path / "a.md").write_text(
        "Most people agree. Most people nod.\n", encoding="utf-8"
    )
    (tmp_path / "b.md").write_text(
        "> quoted most people\nWe can either stay or go.\n", encoding="utf-8"
    )
    result = report([tmp_path], top=10)
    assert result["files"] == 2
    assert result["words"] > 0
    assert result["sentences"] == 3
    watch = {row["phrase"]: row for row in result["watch"]}
    # quoted hit excluded, frame hit included
    assert watch["most people"]["count"] == 2
    assert watch["either or"]["count"] == 1
    assert set(result) >= {"files", "words", "bigrams", "openers", "watch"}
