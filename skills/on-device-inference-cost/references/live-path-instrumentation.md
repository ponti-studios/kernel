# Instrumenting a live path so lag can be attributed

When the output lags and the model is only one candidate, this is the shape that turns "it feels slow" into a
named stage. It applies to any interactive pipeline: audio → model → main thread → animation → pixels.

## The stages, and who owns what

| stage           | what it measures                                | if it is large, the owner is                   |
| --------------- | ----------------------------------------------- | ---------------------------------------------- |
| tick lateness   | scheduled time → actual start                   | the thread that draws, not the model           |
| snapshot        | copying the growing input + fixing its header   | disk, or input length (a 38 MB copy at 20 min) |
| engine          | the inference itself                            | the model, or the length of input              |
| main hop        | model finished → work ran on the drawing thread | the UI drawing too much per frame              |
| behind          | **input on disk − input this pass described**   | how far behind the live edge the output is     |
| absorb          | cost of folding the result into the view model  | per-update work (lookup tables, parsing)       |
| reveal / pacing | time the display will spend catching up         | the animation's own schedule, by design        |
| first word      | input elapsed when the first output appeared    | warm-up, or input that begins with silence     |

**`behind` is the number to report.** Pass cost is the model's problem; `behind` is the person's. Compute it
from the growing file's **size**, never from its duration: a container file being appended to still declares the
duration it had when it was created (often zero). It is quantised by the writer's block size — if the recorder
appends in 0.2 s blocks the reading bottoms out near 0.2 s, so a steady 0.22 s means "in step", not "0.22 s
late". Read the trend across a session, never the floor.

## The log contract

One line per pass, one per absorb, one summary per session, all behind one prefix so a whole session greps out:

```
live: pass 38  late +65ms  snapshot 1ms  engine 322ms  hop 0ms  cover 16.0s  disk 16.1s  behind 0.13s  28w 185c  "…and then i said"
live: hud  28w (0 fresh, 28 settled)  rate 2.0 w/s  absorb 0.0ms  reveal 0.00s
live: first word shown at 3.28s of the take
live: take 16.1s — 51 passes · engine mean 252ms max 640ms · behind mean 0.23s max 0.69s · absorb mean 0.0ms max 0.1ms · reveal mean 0.40s · first word 3.28s
```

- Log the **tail of the text**, not only counts: "18 words" cannot tell you whether the engine heard the right
  thing, and a wrong transcript reads as a lag problem from the outside.
- Write the summary **before** the final authoritative pass is requested, so the log separates "the courtesy
  preview" from "the answer".
- Keep it verbose on by default _while diagnosing_ — a few lines a second is nothing — and silent otherwise.
- Time the whole main-thread block, transformation included. Excluding it credits the app with time it does not
  have and hides exactly the stage you are hunting.
- **Every logged figure must come from the code that decides the outcome.** Deriving `reveal` as _pending items ×
  pacing slot_ reported a twelve-second catch-up the view never spent, because the view shows an overdue item at
  once. Call the same function the renderer calls — the schedule, the progress, the layout pass — and report its
  answer. A re-derived proxy invents a defect that looks like arithmetic and survives review.
- **Order the guards the way the loop means them.** Ask _is it due_ before _is one already running_, or every
  idle tick logs a skip and buries the real ones — dozens per take, all noise.

## Replaying a real run without a microphone

The interactive path usually consumes a file that grows. Make one grow:

0. Confirm the input still exists. Apps routinely delete a take once it is transcribed unless a keep-audio
   setting is on, so check retention _before_ promising a replay — and say plainly when the audio for a bad run
   is already gone rather than substituting a different file's numbers.
1. Stage a copy holding only the container header (44 bytes for a WAV); the pass logic already repairs the size
   fields, because that is what a real in-progress recording needs.
2. Append payload at the **real-world rate** (16 kHz mono 16-bit = 32 000 bytes/s) on a run loop, so wall-clock
   time and input time advance together. Simulating faster distorts every figure you are collecting.
3. Run the **same object** the app runs, with the same log sink, so the output is representative and not a
   re-implementation that agrees with itself.
4. Stop on a quiet gap in the passes rather than a fixed sleep, with a deadline so it cannot hang.
5. Expose it as a flag on the shipping binary (`--replay <file>`), so the user can re-run a bad take
   themselves and paste the result.

## Reading the outcome

- Small `engine` + small `behind` + large `first word` ⇒ fix the start of the session (warm-up, leading
  silence, first-window requirement). Do not touch the model.
- Small `engine` + large `reveal` ⇒ the display is pacing slower than the input arrives; the schedule, not the
  model, is what needs changing.
- Large `hop` ⇒ the drawing thread is saturated; reduce per-frame work.
- Large `late` ⇒ the ticker is starved; nothing about inference is wrong.
- `behind` growing across a session ⇒ the whole-input pass (see the windowing section of SKILL.md).
- Large `reveal` or visible text churn after a **small** revision ⇒ the display is restamping items it should
  have kept. Give each item an arrival time and, when a later update rewrites the middle of the line, keep the
  stamp for every item that survived (compare normalised text) and stamp only the new ones. Restamping the tail
  re-animates content already on screen: it reads as flicker _and_ leaves the view permanently behind, because
  the animation is spent on words nobody was waiting for.

## Warm-up, or silence? The fixture that tells them apart

Real sessions answer this badly, because a person presses the key and then draws breath: measured across three
takes the first output landed at 2.1-2.3 s of take time, which reads as a slow model until the same pipeline runs
on input that has speech from 0.0 s and reports **0.51 s**. The difference was the speaker, not the engine.

Generate that control input instead of waiting for a good take:

```sh
say -v Daniel -r 170 -f sentences.txt -o long.aiff        # ordinary dictation pace, ~170 wpm
afconvert -f WAVE -d LEI16@16000 -c 1 long.aiff long.wav  # the shape the recorder produces
for s in 10 30 90; do ffmpeg -v error -y -i long.wav -t $s -ar 16000 -ac 1 -c:a pcm_s16le speech-$s.wav; done
```

- **Public-domain sentences, not invented ones.** The Harvard sentences are built for speech measurement:
  phonetically varied, intelligible, and nobody has to think of something to say.
- **Cut every length from one read** so the files contain identical words and the lengths are comparable.
- **Keep it in the repo as one script** that takes an output directory, so the control is reproducible and nothing
  is written into the source tree.
- **A synthetic voice is a floor, not a substitute.** It is cleaner than a real one, so treat its timings as the
  best case and say so; for realism prefer a kept real take or a public-domain human recording.
- **Check retention first.** Takes are usually deleted once transcribed, so the audio behind last week's complaint
  is often already gone — the log still carries the numbers, and saying that is better than replaying a
  different file and presenting it as the same evidence.
