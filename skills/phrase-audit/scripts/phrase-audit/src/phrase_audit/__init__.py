"""Phrase-rate audit over a personal writing corpus."""

__version__ = "0.3.0"

from phrase_audit.concepts import CONCEPTS
from phrase_audit.corpus import collect_files, load_corpus
from phrase_audit.stats import (
    concept_counts,
    rate,
    sentence_openers,
    top_ngrams,
    watch_counts,
)

__all__ = [
    "__version__",
    "CONCEPTS",
    "collect_files",
    "concept_counts",
    "load_corpus",
    "rate",
    "sentence_openers",
    "top_ngrams",
    "watch_counts",
]
