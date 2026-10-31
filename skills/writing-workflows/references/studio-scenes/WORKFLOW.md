# Shot list

The handoff to video generation: `studio-workflows` and `studio-workflows` both read this shape, so the field names here are a contract.

## Use it

```bash
cd <installed-package>/references/studio-scenes
scripts/run.sh --stage scenes --script <script>.json
```

`--dry-run` resolves config and prints what would be sent, with no key and no network:

```bash
scripts/run.sh --brief "x" --dry-run
```

## Input

`--script` — the master script JSON.

A master script looks like `{ "title": "…", "sections": [{ "title": "…", "body": "…" }] }`.
Produce one with the [studio-script](../studio-script/WORKFLOW.md) skill.

## Output

`[{ id, prompt, duration_seconds?, dog?, voiceover?, voice?, voice_id?, seed? }]` — an array

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

- This is the only stage that runs with `jsonMode: false` — the model is asked for a bare array, and the parser tolerates fenced output.
- `seed` pins a deterministic take; leave it unset unless you are reproducing a specific render.
- Field names are load-bearing: `duration_seconds`, not `duration`.
- `framing` (wide / medium / close) and `camera` (static, slow push in, slow pull out, handheld
  follow, orbit, tilt up, tilt down) are part of the shot, not decoration: the animatic applies the
  move to the still, so the shot's intended motion is judged before any footage is bought.
- Durations are **fitted to the narration**, not taken from the model: a speaking scene
  lasts its line at ~15 characters per second plus half a second of air. On real output the
  model asked 10s for a 5.6s line, which turned a 48s cut into 30s of silence. Silent scenes
  keep the model's number — there the instinct is all there is.

## Definition of done

- The draft file exists and matches the shape above.
- The usage log was written (it is what the ledger backfills from).
- For a fan-out stage, the draft traces back to the script it was given — never regenerate the
  script to fix a downstream draft.

## Tests

```bash
node --test
```
