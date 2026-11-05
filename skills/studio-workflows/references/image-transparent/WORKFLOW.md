# Image Transparent — image to transparent-background PNG

Remove the background from an existing image locally with **rembg**, producing a
full-frame RGBA PNG whose foreground pixels are the source's own pixels. This is
a mask operation, not a generation: nothing is redrawn, no provider is called,
and there is no spend.

## When to use it

- A reference plate must stop carrying its scene with it. A photographed
  background inside a reference anchors generated scenes — a street, phone box
  or room from the reference reappears in outputs that never asked for it.
  Cutting the subject out is how a reference becomes about the subject only.
- A subject needs compositing onto another background, a product shot needs a
  clean cutout, or a logo/render baked onto a solid background needs a
  transparent master.

## Hard rules

- **Never overwrite the source.** The default output is
  `<stem>-transparent.png` beside the input; an output path equal to the input
  is refused.
- **Full frame by default.** The output keeps the source's dimensions and the
  subject's position in frame, so coordinates and compositions that refer to
  the original still line up. Trimming to the subject's bounding box is an
  explicit `--trim` decision, not a default.
- **Verify numerically, every time.** Client previews render transparency
  unreliably (blurred backdrops, checkerboards, black). The script prints the
  alpha facts — corners, centre, transparent and opaque fractions — and those
  numbers, plus a contrast-composite check, are the evidence. Never declare a
  cutout from the preview alone.

## Command

```bash
# one-time setup: one shared venv for every project, manifest beside it
python3 -m venv .venv-rembg
.venv-rembg/bin/pip install -r scripts/requirements-rembg.txt

# the cutout (run from this procedure's folder)
.venv-rembg/bin/python scripts/remove_background.py photo.jpg
# -> photo-transparent.png beside the input, with the verification line

.venv-rembg/bin/python scripts/remove_background.py photo.jpg --out cutout.png
.venv-rembg/bin/python scripts/remove_background.py photo.jpg --model u2net
.venv-rembg/bin/python scripts/remove_background.py photo.jpg --trim --check check.png
```

rembg downloads its model weights on first use; after that the run is fully
local (a 1640×2048 portrait takes ~25 s on CPU).

## Models and settings

| Choice | Use |
|---|---|
| `isnet-general-use` (default) | People, products, general subjects — the proven default, with alpha matting |
| `u2net` | Fallback when isnet is unavailable or too heavy for the machine |
| `u2net_cloth_seg` | Garments: returns clothing segments rather than one silhouette |

Alpha matting is on by default with the settings proven on portraits and
logos: foreground threshold 240, background threshold 10, erode size 10.
`--no-alpha-matting` turns it off for hard-edged subjects (logos, graphics)
where matting can fringe the edges.

## Verification

A good cutout of a subject that does not touch the frame edge reads:

- corners alpha **0** (all four),
- centre alpha **255** when the subject covers the centre,
- a transparent fraction that matches the subject's share of the frame
  (a centred full-body figure in a wide street frame measured 84.8%).

`--check <path>` also writes the cutout composited on magenta. A person
reviews that composite for eaten edges — hair, fur, thin straps and
translucent fabric are where masks fail — the numbers cannot see a nibbled
hemline.

## Downstream staging

The transparent PNG is the master. Pipelines that flatten reference images
to JPEG (the studio imagegen staging does) destroy alpha by converting to
RGB — composite the cutout on plain white (or the target pipeline's neutral)
for that staged copy and keep the transparent PNG as the source of truth.
Keep both under plain ASCII filenames: staged references with spaces or
punctuation in the name are a proven upload-failure mode.

## Definition of done

- The transparent PNG exists at the stated path, same dimensions as the
  source (or the trimmed size, when `--trim` was chosen).
- The verification line was printed and its corner/centre values are as
  expected for the subject's placement.
- The source file is untouched.

## Files

- [scripts/remove_background.py](scripts/remove_background.py) — the CLI.
- [scripts/requirements-rembg.txt](scripts/requirements-rembg.txt) — the venv manifest.
- [tests/test_remove_background.py](tests/test_remove_background.py) — no-download tests: naming, overwrite refusal and the alpha verification math, with the rembg call faked.
