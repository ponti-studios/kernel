# Programmatic explainer video

Render an approved short script or storyboard as a video. Drafting or revising
its text belongs to writing-workflows. Choose a renderer based on the requested
motion and the tools actually present:

- Pillow plus ffmpeg for simple title cards and deterministic frame sequences.
- Remotion for timed React compositions, transitions and synchronized narration.

Inspect available dependencies and an existing project before scaffolding a new
one. Use the project's pinned versions and current official API documentation.
Historical timing and cost observations are not estimates for a new environment.

## Frame sequence

Render contiguous, zero-padded frames into a dedicated working directory. Use
an existing font, wrap text to the layout, and choose resolution and frame rate
for the requested output. Avoid deleting a shared frame directory.

```sh
ffmpeg -framerate 30 -i frame_%05d.png -c:v libx264 -pix_fmt yuv420p -crf 20 output.mp4
```

Set timing from the approved storyboard or actual narration durations. If audio
is supplied, preserve its full duration rather than trimming speech to fit an
arbitrary scene count. Check scaling, legibility and audio synchronization.

## Remotion composition

Use one sequence per slide, with media placed in the project's served assets.
The reference [composition](references/remotion-composition.tsx) illustrates the
shape; adapt it to the installed Remotion version. Compute each sequence's frame
count from its measured audio duration and accumulate those frame counts for
start offsets. Round consistently so slides neither overlap nor leave gaps.
Confirm whether the installed Sequence component already provides a local frame
before subtracting a start offset; double subtraction breaks later slides.

Render with the project's command and composition identifier. If creating a new
project is needed, use the current official scaffold in a task-specific directory.
Do not install another framework merely because it appears in this procedure.

## Narration

Use an available speech tool or the bundled podcast/media generation procedures.
Check that the configured model supports speech, its current output format,
voice options and cost before a paid request. Do not select a text-only model
for speech based on text-token pricing. Use configured credentials through the
provider's documented environment/configuration path; do not source arbitrary
shell startup files or print credentials.

For raw PCM, obtain the actual sample rate, channel count and encoding from the
provider. Convert with matching ffmpeg flags; guessed parameters change speed
or pitch. Keep source audio until the final file is checked.

## Delivery

Write the finished file to the requested output directory. Inspect it with
ffprobe for codec, duration, frame rate and audio streams; play or render sample
frames where the task calls for visual review. A silent request needs no audio
stream. Present the actual existing absolute file path using the host's supported
media format. Remove temporary frames only after verification.
