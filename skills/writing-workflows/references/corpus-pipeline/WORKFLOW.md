# Corpus Pipeline

Turn a personal writing corpus into structured material: essay maps, theses, claims with verdicts, and topic maps. Used when a writing corpus must be clustered, decided, or re-verified.

## Data location

The corpus and its run outputs live in the user's own corpus location, not in this package:

- `$CORPUS_DATA` (required, no default): the essay-map directory with batch files, clusters, `final-essays.json`, and the generated `core-essays-map.md`.
- Other run outputs (pilots, extracts) go wherever the user keeps pipeline data; pass those locations as arguments.

Never write run data into this package. Ask for the corpus location if it isn't known.

## Tools

| Tool | Purpose | Input | Output |
| --- | --- | --- | --- |
| `scripts/assemble_map.py` | Build the essay map from batch and cluster files | `batch-{A..E}.json`, `clusters-{A..E}.json` in `$CORPUS_DATA` | `final-essays.json`, `core-essays-map.md` |
| `scripts/decide_map.py` | Apply recorded decisions (splits, reassignments, drawer resolution) and regenerate the map | `final-essays.json` | `final-essays.json`, `core-essays-map.md` |
| `scripts/merge_claims.py <claims-dir>` | Merge per-batch claim files into one claims file | claims JSONL in `<claims-dir>` | `claims.merged.jsonl` in `<claims-dir>` |
| `scripts/prep_notes.py --manifest <json> --mirror <dir> --out <dir>` | Prepare exported notes for a pilot | a notes manifest and an export directory | `notes.jsonl`, note bodies |
| `scripts/parse_chatgpt_share.py <files…> --out <dir>` | Extract user turns from ChatGPT share exports | share export markdown files | `turns.jsonl`, `user-turns-only.md` |
| `tools/topic-map/generate.mts` | Generate the topic map from `overlay.json` | `overlay.json` | topic map |

## Procedure

1. **Check the data.** Confirm `$CORPUS_DATA` holds the batch and cluster files you expect. Back up `final-essays.json` before any run that rewrites it.
2. **Assemble.** Run `assemble_map.py` only to build a map from new batch files. It rewrites `final-essays.json`.
3. **Decide.** Record decisions in `decide_map.py`, then run it. Each decision is an explicit edit, so the map never changes silently.
4. **Verify coverage.** The thesis count must equal essays + parked + killed. A mismatch means a thesis was dropped.
5. **Merge claims** when a batch of claims has been verified, then regenerate the topic map.
6. **Record the run** in the corpus's `log.md` with the command and the output paths.

## Verification

- `python3 -m py_compile scripts/*.py` passes.
- Thesis coverage matches (essays + parked + killed).
- `core-essays-map.md` lists every essay in `final-essays.json`.
- No run wrote files into this package.

## Pitfalls

- `decide_map.py` rewrites `final-essays.json`. Running it twice with the same decisions must be idempotent; check that before relying on it.
- The scripts assume numbering in `final-essays.json` is stable. Renumbering breaks references in older maps.
- Claim verdicts are not final until a human has reviewed them. Do not publish verdicts from a pilot run.
