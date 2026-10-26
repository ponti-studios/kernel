"""Command-line entry point: `phrase-audit <roots…>`."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from phrase_audit.concepts import CONCEPTS
from phrase_audit.corpus import load_corpus
from phrase_audit.stats import (
    concept_counts,
    rate,
    sentence_openers,
    top_ngrams,
    watch_counts,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="phrase-audit",
        description="Phrase-rate audit over a Markdown writing corpus.",
    )
    parser.add_argument("roots", nargs="+", type=Path, help="corpus roots")
    parser.add_argument("--top", type=int, default=40, help="rows per n-gram table")
    parser.add_argument("--json", type=Path, default=None, help="write JSON results")
    return parser


def report(roots: list[Path], top: int = 40) -> dict:
    """Run the audit; return structured results (also used by tests)."""
    corpus = load_corpus(roots)
    total = corpus.words
    spans = [sent for sents in corpus.sents.values() for sent in sents]
    result: dict = {
        "files": len(corpus.files),
        "words": total,
        "bigrams": top_ngrams(spans, 2, limit=top),
        "trigrams": top_ngrams(spans, 3, limit=top),
        "fourgrams": top_ngrams(spans, 4, limit=top),
        "watch": [],
    }
    opens, total_sents = sentence_openers(corpus.files)
    result["sentences"] = total_sents
    result["openers"] = opens.most_common(30)
    watch = []
    for phrase, hits, in_files in watch_counts(corpus.per_file):
        watch.append(
            {
                "phrase": phrase,
                "count": hits,
                "per10k": rate(hits, total),
                "files": in_files,
            }
        )
    result["watch"] = watch
    concepts = []
    for master, hits, in_files in concept_counts(corpus.per_file, CONCEPTS):
        concepts.append(
            {
                "master": master,
                "count": hits,
                "per10k": rate(hits, total),
                "files": in_files,
            }
        )
    result["concepts"] = concepts
    return result


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    result = report(args.roots, top=args.top)
    total = result["words"]
    print(f"FILES: {result['files']}  WORDS: {total}")
    for label, key in (("2", "bigrams"), ("3", "trigrams"), ("4", "fourgrams")):
        print(f"\n### TOP {label}-GRAMS (per 10k words)")
        for gram, hits in result[key]:
            print(f"{hits:6d}  {rate(hits, total):7.2f}/10k  {gram}")
    print(f"\n### TOP SENTENCE OPENERS ({result['sentences']} sentences)")
    for gram, hits in result["openers"]:
        print(f"{hits:5d}  {hits / result['sentences'] * 100:5.2f}%  {gram}")
    print("\n### WATCHLIST (count, per 10k, % of files)")
    for row in result["watch"][:60]:
        share = row["files"] / result["files"] * 100 if result["files"] else 0
        print(
            f"{row['count']:6d}  {row['per10k']:7.2f}/10k  "
            f"{row['files']:4d} files ({share:4.1f}%)  {row['phrase']}"
        )
    print("\n### CONCEPTS (variants rolled up under master)")
    for row in result["concepts"]:
        share = row["files"] / result["files"] * 100 if result["files"] else 0
        print(
            f"{row['count']:6d}  {row['per10k']:7.2f}/10k  "
            f"{row['files']:4d} files ({share:4.1f}%)  {row['master']}"
        )
    if args.json:
        args.json.write_text(json.dumps(result, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
