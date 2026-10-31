"""Concept rollup: variants count toward their master.

Concepts and the watchlist are two lenses over the same spans: a hit can
appear under both its watchlist row and its concept. Documented, not a bug.
"""

from phrase_audit.stats import concept_counts

PEOPLE = {"master": "most people", "variants": ["many people", "nearly everyone"]}


def _per_file(mapping):
    return {name: text.split() for name, text in mapping.items()}


def test_rollup_sums_variants_under_master():
    per_file = _per_file({"a": "most people agree. nearly everyone nodded."})
    rows = dict((m, (c, f)) for m, c, f in concept_counts(per_file, [PEOPLE]))
    assert rows["most people"] == (2, 1)


def test_overlapping_variants_count_once():
    concept = {"master": "it turns out", "variants": ["turns out"]}
    per_file = _per_file({"a": "it turns out the room was empty"})
    rows = dict((m, (c, f)) for m, c, f in concept_counts(per_file, [concept]))
    assert rows["it turns out"] == (1, 1)


def test_concept_file_spread():
    per_file = _per_file(
        {"a": "most people agree", "b": "nothing here", "c": "many people agree"}
    )
    rows = dict((m, (c, f)) for m, c, f in concept_counts(per_file, [PEOPLE]))
    assert rows["most people"] == (2, 2)


def test_concept_with_no_hits_is_absent():
    per_file = _per_file({"a": "nothing relevant here"})
    assert concept_counts(per_file, [PEOPLE]) == []


def test_concepts_sorted_by_count():
    concepts = [
        PEOPLE,
        {"master": "kind of", "variants": ["sort of"]},
    ]
    per_file = _per_file({"a": "most people. many people. nearly everyone. kind of."})
    rows = concept_counts(per_file, concepts)
    assert [m for m, _, _ in rows] == ["most people", "kind of"]
