# Phrase Audit

Find the stock phrases hiding in a body of writing — and their rates. Scans a
corpus of Markdown files and reports top n-grams, sentence openers, a curated
watchlist, and concept rollups (paraphrase variants counted under one master).

## Use it

```bash
cd skills/phrase-audit/scripts/phrase-audit
uv sync --group dev   # once; creates the project-local .venv
uv run phrase-audit <corpus-roots…> [--top N] [--json results.json]
```

Run the test suite with:

```bash
uv run --group dev pytest
```

## Input

One or more corpus root directories of Markdown files. `*-analysis.md` and
`chatgpt-share-index.md` are skipped by design (meta-analysis, not prose).
YAML frontmatter, code fences, and blockquotes are stripped before counting.

## Configuration

Curate [concepts.py](scripts/phrase-audit/src/phrase_audit/concepts.py): each concept is
`{"master": "<canonical phrase>", "variants": ["<alt>", …]}`. Adding a
concept is just appending to the `CONCEPTS` list — no code changes needed.

## Pitfalls

- Literal strings, not semantics: "nearly everyone" only rolls up if it is
  listed as a variant. Unlisted paraphrases are invisible.
- Correlative frames are heuristic: only `either X or Y` (up to 6 words
  between anchors) is detected; `not only … but also` is not yet framed.
- A span may appear under both its watchlist row and its concept — the two
  tables are separate lenses, so do not sum across them.
- Counts are a floor for quoted speech: blockquoted text is excluded as
  someone else's voice, and verbatim-duplicated passages (split/merged
  drafts) inflate the phrases they repeat.

## Definition of done

`uv run --group dev pytest` passes in `scripts/phrase-audit/`, and the repo
validator (`python3 scripts/validate_skills.py`, plus `muse skills validate`
for format) passes from the repo root before committing.
