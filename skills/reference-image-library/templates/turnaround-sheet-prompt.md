# Turnaround sheet prompt (missing canon art)

Use when a character in the library has no multi-angle sheet — only a photo, a crop, or a
single pose. Fill the brackets, keep the structure, and attach every reference the character
already has.

## Prompt skeleton

> Character turnaround sheet for a 2D animated film: five views of one [species/figure]
> arranged in a single row on a plain warm light-grey background — front view, three-quarter
> view, left profile, back view, and a head close-up as the fifth panel.
>
> [CANON BLOCK VERBATIM — copy the character's own prompt block from the bible. Do not
> paraphrase it: same coat, same markings, same proportions, positive voice only.]
>
> Every panel shows the same individual with identical markings and proportions, standing
> square with all four paws/feet visible and pointing forward. Plain light-grey studio
> background with even light, an empty backdrop and no scenery. Bold clean ink outlines, flat
> colour fills, soft cel shading, classic 2D hand-drawn animated film character reference
> sheet.

## Rules that keep it on-model

- **Attach the canon.** Verbatim prompt plus `--ref` for every existing file: the ground-truth
  source first, then the derived crops. A prompt that describes the character but attaches
  nothing drifts, and the drift becomes canon once adopted.
- **Register words do the work**, not negatives: "flat colour fills, soft cel shading, clean ink
  outlines" for a cel sheet. Keep the universe's positive voice so the sheet matches the frames
  it will condition.
- **Empty background, stated positively.** "Plain light-grey studio background, an empty
  backdrop" — scenery leaks into later frames when a reference has any.
- **Aspect follows the existing sheets** (16:9 for a five-panel row, 2048×1152 on the current
  model) so the library stays uniform.
- **Panel count in the first sentence.** Say "five views" and then name all five; a sheet that
  silently renders four angles is not comparable with the others.

## Render it

```bash
cd ~/.agents/skills/studio-imagegen
scripts/generate-image.sh --prompt @/tmp/<name>-turnaround.txt \
  --ref bibles/<char>/<ground-truth>.jpg \
  --ref bibles/<char>/identity-plate.webp \
  --ref bibles/<char>/full-body-plate.webp \
  --aspect 16:9 --resolution 2K --meta
```

Run it **three times** for three candidates (~$0.055 at ~2¢ each), then rename each to
`<timestamp>_<model>_<char>-turnaround-c<N>.<ext>` so the inbox stays sortable, and keep the
sidecars.

## Hand over, do not choose

Give the user every candidate path and the cost. Adopting one — or picking "the best" — is the
same error as scoring them. Once they name a winner, install it as
`bibles/<char>/turnaround-sheet.webp`, record the prompt and the winner in the character's
generation record, and leave the plates in place until the sheet has been tested.
