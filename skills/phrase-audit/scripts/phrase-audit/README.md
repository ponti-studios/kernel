# phrase-audit

Find the stock phrases hiding in your writing — and their rates.

Scans a corpus of Markdown files, strips formatting, and reports:

- top 2/3/4-grams with counts and per-10k-word rates
- sentence openers across the corpus
- a curated watchlist of hedging/filler phrases (`most people`, `sort of`,
  `in other words` …) with counts, rates, and file spread
- concept rollup: paraphrase variants counted under a master label
  (`most people` ← `many people`, `nearly everyone`, …), curated in
  `src/phrase_audit/concepts.py`. Concepts are a second lens over the same
  text, independent from the watchlist: a span may appear under both.

## Install

```sh
uv tool install .
# or run in place:
uv run phrase-audit ~/Documents/writing/drafts
```

## Use

```sh
phrase-audit ~/Documents/writing/drafts --json results.json
phrase-audit drafts field-notes --top 20
```

## Test

```sh
uv run --group dev pytest
```

`tests/test_gaps.py` encodes known recall gaps as failing tests — that file
is the roadmap, not a regression. See the test headers for details.
