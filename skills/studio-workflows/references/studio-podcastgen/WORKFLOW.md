# Studio Podcastgen — a script becomes one audio file

Takes a script, notes, or editorial draft and produces a single finished audio
file: each segment spoken separately, spliced with silence, tagged, and
documented with a manifest.

## Not this skill

[studio-videogen](../studio-videogen/WORKFLOW.md) speaks **per scene, for video** (`<sceneId>.mp3`, one file
each, no splicing, no tags). This skill produces **one episode file** for
listening. Both use the same speech model and voice routing.

## Commands

```bash
# preflight — binaries, model, price, voices, segment parse. Free.
scripts/check-podcast.sh --source draft.json

# plan and estimate without spending
scripts/podcast.sh --source draft.json --out ep.mp3 --dry-run

# one narrator
scripts/podcast.sh --source draft.json --out ep.mp3 --voice pNInz6obpgDQGcFmaJgB \
                   --title "Why Picture Palaces Still Work" --author "Ponti Studios"

# two hosts, alternating voices per segment
scripts/podcast.sh --source draft.json --out ep.mp3 --voices <voiceA>,<voiceB>
```

| Option                             | Effect                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--source`                         | a draft from another studio writing skill (YouTube script, essay or master script), a markdown file, or a JSON array of `{id, text, voice}` |
| `--voice`                          | one narrator for the whole episode                                                                                                          |
| `--voices a,b`                     | alternate two voices across segments (rejected if the ids are identical)                                                                    |
| `--gap-ms`                         | silence between segments, default 700                                                                                                       |
| `--title` / `--author` / `--album` | ID3 tags; genre is set to `Podcast`                                                                                                         |
| `--work-dir`                       | keep the per-segment mp3s for inspection instead of using a temp dir                                                                        |
| `--dry-run`                        | print the segment plan, voice assignment and cost estimate; spend nothing                                                                   |

## How a source becomes segments

| Source                                | Segmentation                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| YouTube script draft                  | `hook`, each `segments[].script` (labelled with its `heading`), then `callToAction`                                   |
| Master script / essay with `sections` | one segment per section                                                                                               |
| Essay `content` or a markdown file    | split on `#`/`##`/`###` headings; if there are none, paragraphs are grouped so a segment is never a single short line |
| JSON array                            | used as given — `{id?, text, voice?}`                                                                                 |

Voice resolution per segment: an explicit `voice` on the segment wins, then
`--voice`, then the alternating `--voices` slot, then `DEFAULT_VOICE_ID`.

## What comes out

- `<out>.mp3` — one file, re-encoded to 44.1kHz mono 128kbps, so segments that
  arrive with mismatched parameters splice cleanly.
- `<out>.manifest.json` — episode metadata (title, duration, bytes, gap, model)
  plus every segment with its voice, `voice_source` (which rule chose it),
  character count and byte size, and any failures.
- An entry in `$STUDIO_USAGE_DIR` (`<timestamp>-podcastgen.json`). Podcastgen
  writes no ledger event yet.

## Cost

- Speech is priced per model and the response carries no price. The script
  fetches the model's published `pricing.prompt` rate at run time and prints
  `characters × rate` as an **estimate** (`estimated_cost_usd` in the log).
  Characters overcount tokens, so treat it as an upper bound. No published rate
  means no estimate, not free.
- The real per-call figure lives in the provider's generation record, which can
  land after the call ends. The studio-core `reprice-speech` flow
  (`node ../studio-core/scripts/lib/cli.mjs reprice-speech [--dry-run]`) fills it
  in later as repricing events, but only for ledger speech calls made through
  `studio-core/scripts/speak.mjs`. Podcastgen runs stay estimates; the
  per-segment `provider_request_id` in the log is what a later lookup would need.
- Key counters settle late, so a counter bracket around a short episode reads
  nothing for minutes.
- `--dry-run` prints the plan and estimate for nothing — use it before a long
  script.

## Definition of done

- The episode exists, plays as a single stream, and its duration equals the sum
  of the segment durations plus `gap × (segments − 1)`.
- ID3 tags carry the title and author; the manifest matches the segment list.
- No failures in the manifest.

## References

- [assembly.md](references/assembly.md) — the splice command, sample-format handling, verification recipe.

## Configuration

Runtime modules are bundled within this package; no Studio checkout or module-path
overrides are required. Configuration comes from environment variables, then
`~/.pontistudios.studio.yml` (or `STUDIO_CONFIG`).

| Variable                  | Configuration key    | Used for                   |
| ------------------------- | -------------------- | -------------------------- |
| `STUDIO_USAGE_DIR`        | `usage_dir`          | usage JSON output          |
| `OPENROUTER_API_KEY`      | `openrouter_api_key` | authorized synthesis calls |
| `OPENROUTER_SPEECH_MODEL` | `model_speech`       | speech model               |

Use `--voice` or `--voices` for narrator selection. Explicit JSON segment IDs are
retained as labels; generated sequential IDs determine temporary filenames so
user-supplied names cannot escape the working directory or overwrite another segment.

## Pitfalls

- Assembly **re-encodes** (resample to 44.1kHz, `pan` to mono). A stream-copy
  concat breaks when segment mp3s differ, so this trades a little quality for
  not silently producing a corrupt file.
- Segment files are named after segment ids; reusing a source with the same ids
  overwrites them in `--work-dir`, which is handy for comparing two takes.
- Long scripts cost proportional to length — split a 40-minute episode into
  chapters as separate runs rather than one giant segment list, so a mid-run
  failure doesn't discard everything.
- A failure on one segment does not stop the episode: the rest still assemble,
  the failed segment is listed in the manifest, and the script exits 1. Read the
  manifest rather than trusting the file's existence.
- Never label a speech estimate `reported` (see Cost).
