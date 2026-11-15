# Corpus Pipeline

Turn a personal writing corpus into structured material: essay maps, theses, claims with verdicts, and topic maps. Used when a writing corpus must be clustered, decided, or re-verified.

## Data location

The corpus and its run outputs live in the personal wiki, not in this package:

- `$CORPUS_DATA` (default `~/Documents/wiki/writing/pipeline/essay-map`): batch files, clusters, `final-essays.json`, and the generated `core-essays-map.md`.
- `~/Documents/wiki/writing/pipeline/`: other run outputs (`nugget-pilot`, `pilot`, `hidden-extracts`).
- `~/Documents/wiki/writing/`: the essays, drafts, and field notes the pipeline reads.

Never write run data into this package. Set `CORPUS_DATA` to point at another corpus when needed.

## Tools

| Tool | Purpose | Input | Output |
| --- | --- | --- | --- |
| `scripts/assemble_map.py` | Build the essay map from batch and cluster files | `batch-{A..E}.json`, `clusters-{A..E}.json` in `$CORPUS_DATA` | `final-essays.json`, `core-essays-map.md` |
| `scripts/decide_map.py` | Apply recorded decisions (splits, reassignments, drawer resolution) and regenerate the map | `final-essays.json` | `final-essays.json`, `core-essays-map.md` |
| `scripts/merge_claims.py` | Merge per-batch claim files into one claims file | claims JSONL | merged claims JSONL |
| `scripts/prep_notes.py` | Prepare exported notes for a pilot | a notes manifest and an export directory | `notes.jsonl`, note bodies |
| `scripts/parse_chatgpt_share.py` | Extract user turns from ChatGPT share exports | share export markdown files | `turns.jsonl`, `user-turns-only.md` |
| `tools/topic-map/generate.mts` | Generate the topic map from `overlay.json` | `overlay.json` | topic map |

`merge_claims.py` and `prep_notes.py` still hardcode their input paths (`claims-all.jsonl`, `/home/...`). Pass real input locations before running them, and update those paths to arguments.

## Procedure

1. **Check the data.** Confirm `$CORPUS_DATA` holds the batch and cluster files you expect. Back up `final-essays.json` before any run that rewrites it.
2. **Assemble.** Run `assemble_map.py` only to build a map from new batch files. It rewrites `final-essays.json`.
3. **Decide.** Record decisions in `decide_map.py`, then run it. Each decision is an explicit edit, so the map never changes silently.
4. **Verify coverage.** The thesis count must equal essays + parked + killed. A mismatch means a thesis was dropped.
5. **Merge claims** when a batch of claims has been verified, then regenerate the topic map.
6. **Record the run** in the wiki's `log.md` with the command and the output paths.

## Verification

- `python3 -m py_compile scripts/*.py` passes.
- Thesis coverage matches (essays + parked + killed).
- `core-essays-map.md` lists every essay in `final-essays.json`.
- No run wrote files into this package.

## Pitfalls

- `decide_map.py` rewrites `final-essays.json`. Running it twice with the same decisions must be idempotent; check that before relying on it.
- The scripts assume numbering in `final-essays.json` is stable. Renumbering breaks references in older maps.
- Claim verdicts are not final until a human has reviewed them. Do not publish verdicts from a pilot run.
