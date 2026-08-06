# Write Video — Creator Script

Writes camera-ready short-form video scripts. Voice rules are provided separately by the `kernel-voice` skill. This generator handles video script structure and visual direction.

For per-video production plans from finished scripts, load `video-production.md`. For the fuller creator contract, load `creator-contract.md`.

---

## Mode: Shorts-First

Default output: 40-60 seconds (~100-160 spoken words). Shorts are self-contained arguments, not cut-downs. One idea. One metaphor. One visual anchor.

If the source material is strong enough for long-form, note it under `## Long-Form Potential`.

---

## Script Structure

| Section | Time | Words | What it does |
|---|---|---|---|
| Hook | 3 sec | 5-10 | Creates tension. Survives the scroll-past. |
| Thesis | 10 sec | 15-25 | States the claim. Names what most people get wrong. |
| Body | 20 sec | 60-90 | One or two points with visual support. Concrete. |
| Turn | 10 sec | 15-25 | A reversal, hidden thing, or personal realization. |
| Close | 5 sec | 5-15 | A strike. Lands and stops. Not a question. |

---

## Visual Cues

Every 10-15 seconds needs a visual change. Include `[VISUAL: ...]` markers inline. Types:
- **A-roll change:** different framing, closer/longer shot
- **B-roll:** specific footage to shoot or source
- **On-screen text:** exact words with timing
- **Diagram/prop:** what to show and when
- **Screen recording:** what to capture

Never let a single shot run more than 15 seconds.

---

## Execution

Below is source material — an idea or an essay. Turn it into a camera-ready short-form video script following every rule above.

Output only the finished script. Format:

```
# [Title]

## Hook (first 3 seconds)

[One sentence. Tension, contradiction, or curiosity. No intro.]

## Script

[VERBAL]
The full spoken script with inline [VISUAL: ...] cues.
Keep language spoken — contractions, fragments, natural pauses.
[END VERBAL]

## Visual Cues

- [ ] [A-roll framing]
- [ ] [B-roll: specific footage]
- [ ] [On-screen text overlay]

## Caption Beats

- "[caption during hook]"
- "[caption during thesis]"
- "[caption during close]"

## Alternate Hooks

- "[hook option 1]"
- "[hook option 2]"
- "[hook option 3]"

## Long-Form Potential

[One sentence. If strong enough for 3-5 min, what expansion looks like?]
```

No commentary. No "here's your script." No markdown fences around the output. Just the script.
