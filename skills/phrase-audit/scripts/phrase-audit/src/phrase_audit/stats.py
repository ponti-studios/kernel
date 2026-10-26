"""Corpus statistics: rates, n-grams, openers, watchlist counts."""

from __future__ import annotations

import re
from collections import Counter
from collections.abc import Iterable
from pathlib import Path

from phrase_audit.text import STOP, sentences

WATCH = [
    "most people", "many people", "most of us", "in other words",
    "that is to say", "sort of", "kind of", "really", "very", "just",
    "actually", "basically", "literally", "of course", "it turns out",
    "as it turns out", "in fact", "for example", "for instance",
    "on the other hand", "at the end of the day", "when it comes to",
    "the fact that", "the idea that", "a lot of", "tend to", "seems to",
    "seem to", "in a sense", "more or less", "to some extent", "deep down",
    "at its core", "the problem is", "the thing is", "here's the thing",
    "to be honest", "let's be honest", "clearly", "obviously", "no doubt",
    "without a doubt", "time and time again", "over and over",
    "nothing more than", "just another", "even more", "more and more",
    "rather than", "instead of", "despite the fact", "due to the fact",
    "in order to", "such as", "what if", "i think", "i believe", "i mean",
    "you know", "one of the", "some of the", "most of the", "part of the",
    "end of the", "rest of the", "every single", "each and every", "as if",
    "as though", "at least", "at most", "in particular", "in general",
    "in short", "in sum", "in conclusion", "for better or worse",
    "whether or not", "the more", "the less", "not only", "but also",
    "neither", "either or", "all too", "all but", "anything but",
    "nothing but", "something like", "things like", "stuff like",
    "kind of a", "sort of a", "bit of a", "be able to", "have to", "has to",
    "need to", "needs to", "want to", "wants to", "going to", "used to",
    "supposed to", "turns out", "point is", "the point is", "matter of",
    "question of", "sense of", "issue is", "problem with", "trouble with",
    "deal with", "cope with",
]


def rate(count: int, total: int) -> float:
    """Occurrences per 10,000 words."""
    return round(count / total * 10000, 2) if total else 0


def _ngrams(tokens: list[str], n: int):
    return (" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1))


def top_ngrams(
    docs: Iterable[list[str]], n: int, minimum: int = 5, limit: int = 40
) -> list[tuple[str, int]]:
    """Most common n-grams with at least one non-stopword, by raw count.

    Each doc is an independent span (one sentence): grams never cross
    sentence or file boundaries, and every span meeting the minimum is
    ranked — no pre-truncation by frequency rank.
    """
    counts: Counter = Counter()
    for doc in docs:
        counts.update(_ngrams(doc, n))
    ranked = [
        (gram, hits)
        for gram, hits in counts.most_common()
        if hits >= minimum
        and not all(w in STOP for w in gram.split())
        and not any(w.isdigit() for w in gram.split())
    ]
    return ranked[:limit]


def sentence_openers(paths: list[str]) -> tuple[Counter, int]:
    """Bigram openers per sentence across files; returns (counts, sentences)."""
    opens: Counter = Counter()
    total = 0
    for path in paths:
        try:
            raw = Path(path).read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for words in sentences(raw):
            opens[" ".join(words[:2])] += 1
            total += 1
    return opens, total


BOUND = r"[a-z0-9'\-]"

# Correlative frames: (left anchor, right anchor, max words between).
# "either or" never occurs adjacently, so it is only matched as a frame.
FRAMES = {"either or": ("either", "or", 6)}


def _phrase_regex(phrase: str) -> re.Pattern:
    return re.compile(r"(?<!%s)%s(?!%s)" % (BOUND, re.escape(phrase), BOUND))


def _frame_regex(left: str, right: str, gap: int) -> re.Pattern:
    return re.compile(
        r"(?<!%s)%s(?:\s+%s+){1,%d}\s+%s(?!%s)"
        % (BOUND, re.escape(left), BOUND, gap, re.escape(right), BOUND)
    )


def _match_entries(
    text: str, entries: list[tuple[str, re.Pattern]]
) -> dict[str, int]:
    """Longest-pattern-wins span masking over (label, pattern) entries.

    A character span belongs to exactly one label, so overlapping entries
    never double-count and rows can be summed.
    """
    occupied: list[tuple[int, int]] = []
    counts: dict[str, int] = {}
    for label, pattern in sorted(entries, key=lambda e: len(e[0]), reverse=True):
        for match in pattern.finditer(text):
            span = (match.start(), match.end())
            if any(start < span[1] and span[0] < end for start, end in occupied):
                continue
            occupied.append(span)
            counts[label] = counts.get(label, 0) + 1
    return counts


def _masked_counts(text: str) -> dict[str, int]:
    """Watchlist hits with longest-match-wins span masking."""
    entries = []
    for phrase in WATCH:
        if phrase in FRAMES:
            left, right, gap = FRAMES[phrase]
            entries.append((phrase, _frame_regex(left, right, gap)))
        else:
            entries.append((phrase, _phrase_regex(phrase)))
    return _match_entries(text, entries)


def concept_counts(
    per_file: dict[str, list[str]], concepts: list[dict]
) -> list[tuple[str, int, int]]:
    """(master, total hits, files containing it), most hits first.

    Each concept is masked independently: variants of one master never
    double-count each other. Concepts are a separate lens from the
    watchlist — a span may appear under both.
    """
    totals: Counter = Counter()
    in_files: Counter = Counter()
    for tokens in per_file.values():
        text = " ".join(tokens)
        for concept in concepts:
            entries = [(concept["master"], _phrase_regex(concept["master"]))]
            entries += [
                (concept["master"], _phrase_regex(v))
                for v in concept.get("variants", [])
            ]
            hits = _match_entries(text, entries).get(concept["master"], 0)
            if hits:
                totals[concept["master"]] += hits
                in_files[concept["master"]] += 1
    rows = [(master, totals[master], in_files[master]) for master in totals]
    return sorted(rows, key=lambda row: row[1], reverse=True)


def watch_counts(
    per_file: dict[str, list[str]],
) -> list[tuple[str, int, int]]:
    """(phrase, total hits, files containing it), most hits first.

    Counted per file and summed, so no phrase spans a file boundary.
    """
    totals: Counter = Counter()
    in_files: Counter = Counter()
    for tokens in per_file.values():
        for phrase, hits in _masked_counts(" ".join(tokens)).items():
            totals[phrase] += hits
            in_files[phrase] += 1
    rows = [(phrase, totals[phrase], in_files[phrase]) for phrase in totals]
    return sorted(rows, key=lambda row: row[1], reverse=True)

