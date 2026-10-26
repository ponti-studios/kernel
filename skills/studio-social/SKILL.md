---
name: studio-social
description: "Use when turning a master script into a tweet thread, five distinct X post options, or a LinkedIn post."
license: MIT
metadata:
  version: "1.0.0"
  author: ponti-studios
  category: Creative
  tags:
    - ponti-studios
    - writing
    - social
---

# Social posts

The five X options are deliberately different angles on the same script, not five rewrites of one tweet — pick one; the point is the choice.

## Use it

```bash
cd ~/.agents/skills/studio-social
scripts/run.sh --stage tweet --script <script>.json
scripts/run.sh --stage x-posts --script <script>.json
scripts/run.sh --stage linkedin --script <script>.json
```

`--dry-run` resolves config and prints what would be sent, with no key and no network:

```bash
scripts/run.sh --brief "x" --dry-run
```

## Input

`--script` — the master script JSON.

A master script looks like `{ "title": "…", "sections": [{ "title": "…", "body": "…" }] }`.
Produce one with the `studio-script` skill.

## Output

`tweet`: `{ tweets: [string] }`
`x-posts`: `{ posts: [{ id, type, text }] }` — exactly five, each ≤280 characters
`linkedin`: `{ content }`

Written to `$STUDIO_DRAFTS_DIR/<stage>-<timestamp>.json`, with one usage log per call beside the
other skills' logs.

## Configuration

| Variable | Default | Used for |
|---|---|---|
| `STUDIO_DRAFTS_DIR` | `~/Documents/studio-drafts` | where drafts are written |
| `STUDIO_USAGE_DIR` | `~/.hominem/ai_usage` | one JSON log per call |
| `OPENROUTER_TEXT_MODEL` | `deepseek/deepseek-chat-v3-0324` | the model, unless `--model` overrides |
| `OPENROUTER_API_KEY` | env → `openrouter_api_key` in `~/.pontistudios.studio.yml` | the call |

All four can be set in `~/.pontistudios.studio.yml` (`drafts_dir`, `usage_dir`, `model_text`,
`openrouter_api_key`); an exported variable wins over the file.

## Pitfalls

- `x-posts` validates exactly five entries and a 280-character ceiling: a sixth post or a long one fails validation, it is not silently trimmed.
- The thread and the X batch are different artefacts. Generating both from one script is normal; publishing both is not.

## Definition of done

- The draft file exists and matches the shape above.
- The usage log was written (it is what the ledger backfills from).
- For a fan-out stage, the draft traces back to the script it was given — never regenerate the
  script to fix a downstream draft.

## Tests

```bash
node --test
```
