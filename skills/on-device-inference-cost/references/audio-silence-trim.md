# Trimming silence before an ASR pass

What you send the model is as much a cost decision as how often you send it. Speech captures carry silence at both
ends: the pause after pressing the key, the second or two of deciding the dictation is over. On a short take that is a
real share of the audio, it is billed at both ends, and leading noise is where an ASR model invents a word nobody said.

The archived take is **never** shortened — the file is the record, the note's duration comes from it, and any clock on
screen must not move. Trim the _transcription input_: write a temporary copy of the speech range, hand that to the
model, delete it. Say so in the log (`keeping 10.15s of 13.00s — 1.85s lead and 2.89s tail skipped`) so a surprising
transcript can be explained after the fact.

## The measurement

- **Windows of ~20 ms** — shorter than the gap inside a word, longer than a click. Take RMS per window.
- **Keep ~0.15 s** beyond the last speech and before the first, so a release or breath is not clipped mid-consonant.
- **All silence is its own answer**, not an engine error: report the existing "nothing was recorded" path rather than
  sending the file.

## Two thresholds, and why one is not enough

**A fixed dBFS floor is right for a silent file and useless in a real room.** A take recorded in a room with an active
microphone reported `speech 0.13–31.89s` — nothing to trim — because the floor sat below the room. Measured on that
file: quietest tenth of windows ≈ 0.0018 RMS, speech ≈ 0.22, so the room was _under_ the floor and a startup transient
was _over_ it.

So:

1. **Relative to the room.** Threshold = `max(absoluteFloor, quietTenth × 4)` — roughly +12 dB over the room, which
   noise rarely clears and speech usually does by a wide margin.
2. **Guard the degenerate case.** A take with nothing appreciably quieter than its loudest window has no room to
   measure — all speech or all noise. Scaling from the quiet tenth there puts the threshold _above the speech_ and
   finds nothing at all. If `peak < quietTenth × 2`, fall back to the absolute floor.
3. **Sustained, not instantaneous.** Require three of the next five windows above the threshold. A one-window click at
   0.13 s otherwise decides where the take starts. This is what turned `0.13–31.89s` into `3.11–31.89s` on the same
   recording.

Both fixes were needed; either alone left the trim silently doing nothing on real audio while looking correct on
synthetic silence.

## Testing it

- pure function over `[Float]` samples — no file I/O, no model: silence alone, sub-floor noise, speech to the very
  end, a pause mid-take, a one-window click, a noisy room with speech inside it, and the short-take case
- a CLI flag that prints the measurement for any file (`--trim <take.wav>`), so a surprising transcript can be
  diagnosed without dictating again
- verify on a real recording, not just a synthetic one: synthetic silence has a noise floor of zero and will pass a
  fixed absolute threshold that a real microphone never sees

## Limits worth stating

- A trim applies to a finished take. A live preview has already shown whatever the model made of the leading room, so a
  trim fixes the pasted text and not the seconds of wrongness on screen. Suppressing that is a separate decision
  (a live pass over pre-speech audio arguably has nothing to say).
- Silence detection is not voice activity detection: a very quiet speaker can fall under a room-relative threshold.
  Prefer trimming too little to eating a word, and log the numbers so a report can be checked.
- Write the temporary copy by keeping the original WAV header and slicing the payload, then correcting the size fields
  — zeroed sizes read as a zero-second file and the engine rejects it.
