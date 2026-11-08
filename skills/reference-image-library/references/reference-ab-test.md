# Reference A/B harness

Mechanics for answering "does reference strategy X beat Y" with renders the user judges. Design rules live
in SKILL.md; this file is the plumbing that makes a run survive timeouts and stay blind.

## Plan and mapping

Two files in the run directory: `plan.json` (what to render) and `results.json` (what happened), the
second appended after every render so a killed cell loses one image, not the batch.

```json
// plan.json
{
  "scenes": [
    {
      "scene": "s1-akane",
      "kind": "single",
      "chars": ["akane"],
      "prompt": "...",
      "arm": "turnaround",
      "code": "s1-akane__X",
      "refs": ["bibles/akane/turnaround-sheet.webp"]
    }
  ],
  "mapping": { "s1-akane": { "s1-akane__X": "turnaround", "s1-akane__Y": "plates" } }
}
```

`results.json` keeps `{code, scene, arm, path, cost, ok, tail}` — `tail` holds the last 300 chars of a
failure so a 400 can be diagnosed without re-running.

**Balance the draw.** A per-scene coin flip is not enough:

```python
arms = ["plates", "turnaround"]; rng.shuffle(arms)      # then CHECK
left = sum(1 for p in plan if p["arm"] == plan_arm_of_first)
assert abs(left - len(plan) / 2) <= 1, "position is collinear with arm; re-draw"
```

## Render loop

One render per call through the image skill, verbatim prompt plus explicit references, aspect from the
scene kind (4:5 singles, 16:9 groups), 2K, output named by code:

```bash
scripts/generate-image.sh --prompt @plan.prompt.txt \
  --ref bibles/akane/turnaround-sheet.webp \
  --aspect 4:5 --resolution 2K --out "$OUT/s1-akane__X.png"
```

Parse `wrote:` and `cost:` from stdout rather than assuming success — a 400 surfaces as
`image failed (http)` with no `wrote:` line. Run the batch in chunks of 5–7 renders per call so no single
call approaches a timeout; each render is 20–40 s at 2K.

Cap references before planning a group scene. qwen-image-2.1-turbo accepts **4**; six returns 400.
Two characters at two crops each is already at the limit.

## The judging page

Build one HTML page, one row per scene, two images side by side, radio per row, submit button that
composes `reftest picks: s1=X, s2=Y, ...` and sends it.

**Inline the images as data URIs.** A `::preview` frame does not resolve relative `src` paths —
`<img src="code.jpg">` renders as alt text and the user reports "I can't see your images". Encode each
thumbnail:

```bash
magick "$png" -resize 760x -quality 80 -strip thumb.jpg   # ~30 KB each
```

```python
b64 = base64.b64encode(thumb.read_bytes()).decode()
img = f'<img src="data:image/jpeg;base64,{b64}">'
```

14 thumbnails inline ≈ 580 KB of HTML — fine. Verify before handing it over: every `<img>` is a data URI
and its base64 decodes to a JPEG (`bytes[:2] == b'\xff\xd8'`).

**Assume the submit may not arrive.** A widget send can fail silently and leave the user saying "done"
with no payload. The recovery is to reveal the sealed mapping in chat and ask for the letters per row
(`s1 X, s2 Y, ...`) — post-judgement, revealing costs nothing, and re-judging would cost the user's
patience rather than accuracy.

## Reporting

Compute the tally in code, never in your head. Call each side a **variant** when you report it — `arm`
is a field name in the plan file, not vocabulary for a person, and "what do you mean by arms?" costs
more than the shorthand saves. Then report three things:

1. The tally by arm.
2. The position split (how many picks were left-hand, and how the right-hand picks fell) — the check
   that the verdict is not a side artefact.
3. The limits: one render per scene, the reference-count confound if it existed, and any scene re-run at
   a different count.

Then act on the verdict in one pass: registry/manifest to the winning strategy, docs rewritten to the
policy with the result and its limits, losing files deleted only after every path holder is repointed,
and the existence test run last. Keep a crop recipe in the docs so the flexibility the losing strategy
provided is still reachable on demand.
