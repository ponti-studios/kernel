"""Concept rollup: variant phrases counted under a master label.

Schema: {"master": "<canonical phrase>", "variants": ["<alt>", ...]}.
Curate freely — add a concept, list its paraphrases, rerun the audit.

Concepts are a second lens over the same text, independent from the
watchlist: a span can appear under both its watchlist row and its concept.
Within one concept, overlapping variants never double-count.
"""

CONCEPTS = [
    {
        "master": "most people",
        "variants": [
            "many people",
            "most of us",
            "nearly everyone",
            "almost everyone",
            "most everyone",
        ],
    },
    {
        "master": "kind of",
        "variants": [
            "sort of",
            "in a sense",
            "more or less",
            "to some extent",
            "in some sense",
        ],
    },
    {
        "master": "rather than",
        "variants": ["instead of", "as opposed to"],
    },
    {
        "master": "the problem is",
        "variants": ["the thing is", "the point is", "the fact is"],
    },
    {
        "master": "it turns out",
        "variants": ["turns out"],
    },
]
