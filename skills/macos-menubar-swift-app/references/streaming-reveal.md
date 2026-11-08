# Revealing streamed content at the rate it was produced

For any UI showing content from a source that delivers in **bursts** rather than continuously: live
transcription, LLM token streams, log tails, tickers, progress feeds.

The source's delivery rate is an implementation artefact. Polling, buffering, chunking and re-transcription
all bundle work together, so items land in lumps that have nothing to do with the thing being depicted.
**Animating the lump animates your polling** — it reads as the interface stuttering, or as content arriving
faster than a person can talk.

So: **meter the reveal.** Queue what has arrived and release it at the rate the content _represents_.

## Derive the duration, don't choose it

With `R` = items per second of real content, each item's slot is `1/R`. An entrance should occupy about **two
thirds of its slot** — less and consecutive items read as simultaneous, more and two are always mid-motion,
which is a permanent haze rather than a reveal.

```
slot = 1 / R
D    = clamp(0.72 / R, 0.15, 0.40)      # seconds
```

The bounds are perceptual, not stylistic:

- **Floor 0.15 s.** Under about 120–150 ms the eye reads a _cut_: the item is at full strength before anything
  has been resolved. It looks like typing, not like hearing.
- **Ceiling 0.40 s.** Past its own slot the item is still resolving when the next lands, so the stream never
  comes into focus.

Express it as a `clamp`, never as `0.72 × slot` alone, and test **both** ends — because the floor takes over
from the rule at the fast end. With the rate clamped at 2/s, `0.72/R` bottoms out at 0.36 s, so a 0.40
ceiling is unreachable and exists only defensively, while the floor starts binding past roughly 4.8/s. Say
which end actually binds, or the next reader goes hunting for a case that cannot occur.

## Measure the rate; don't assume one

| domain             | rate                                    | result                              |
| ------------------ | --------------------------------------- | ----------------------------------- |
| speech / dictation | ~2.5 items/s (conversational, ~150 wpm) | 400 ms slot → **288 ms**            |
| fast speech        | 3–4/s                                   | 333 / 250 ms slots → 240 / 180 ms   |
| model output       | tokens ÷ stream seconds                 | free from the stream's own metadata |

Clamp the rate to a sane band (~2–6/s for speech) so a mis-estimate cannot make the reveal crawl or blur
past legibility. A measured rate self-corrects: a slow speaker gets slow words, a fast one keeps up.

## Check that a burst can drain

N items arriving together finish at `(N − 1) × slot + D`, which must fit inside the interval they arrived
on — otherwise the queue grows without bound and the reveal falls further behind for the rest of the session.
Assert it as arithmetic: seven items at 2.5/s resolve in 2.688 s. This is what makes the approach safe for
an unbounded stream.

## Three details that make it read as one moving thing

- **Glide the whole line, not just the new item.** A per-item entrance on a static line makes the new item the
  only thing moving, which reads as a jump. Drift the entire line a few points as each item lands so it
  arrives moving and settles. Derive the drift from the same schedule (the newest item's progress) rather than
  restarting an animation — then there is no state to manage.
- **Show the newest item or two as provisional.** When the source **re-delivers and may revise** (a
  re-transcribed tail, a re-ranked stream), the last item can still change. Render it at reduced ink until the
  next delivery agrees, then settle it to full. An item that looks final but moves reads as a mistake; one
  that looks provisional reads as thinking.
- **Reveal wider than you'd think.** A lane long enough to hold a continuing stream (~260 pt for speech at
  12.5 pt) is what makes re-reading possible; a short tail-only window catches "that isn't what I said" but
  cannot be read back.

## Merge, never append

Keep the longest shared prefix between what is shown and what arrived, compared **normalised** (case-folded,
punctuation stripped), then replace everything after the first difference.

- Appending would show a corrected item twice (`"their"` and then `"there"`).
- Re-animating the settled prefix is pure noise: those items are already read.
- A shorter delivery must not delete what is settled — a tail cut mid-word arrives truncated.

This is also what turns "no delivery loses an item an earlier one had" into a testable property of the
stream rather than a hope about the source.

## Make every per-item value a function of elapsed time

The reveal must be **pure in time**: each item's blur, offset, opacity and scale computed from
`t − queueStart`, not driven by a state-change animation.

```
p = clamp((t − index × slot) / D, 0, 1)
blur(radius: 5 × (1 − p));  opacity(p);  offset(y: 7 × (1 − p));  scale(0.96 + 0.04 × p)
```

This is the rule that matters most, and it pays twice: the schedule becomes **testable as arithmetic instead
of watched**, and a still of the animation is **exact** — the same arguments always draw the same frame, so it
can be rendered, measured and attached as evidence. The alternative (re-triggering a keyframe by clearing and
re-applying the animation) makes renders irreproducible and puts the schedule out of reach of a test.

In SwiftUI, compute `t` from the `TimelineView` that already drives the frame and pass it down, so the
revealing view stays a pure function of its inputs alongside the rest of the HUD.

## Pitfalls

- **Never let an entrance outlive its slot.** The ceiling is a correctness property, not taste.
- **Don't couple the reveal rate to the poll interval.** They are different numbers: the interval decides when
  you _learn_ something, the rate decides how fast a human reads it.
- **A blurred item still needs clipping** where the lane has a hard edge, or the blur bleeds past it.
- **Fade the outgoing edge, and judge it in motion.** A still shows a half-faded item that can look like a
  clipping bug; at full speed the same frame reads as sliding.
