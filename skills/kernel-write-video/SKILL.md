---
name: kernel-write-video
license: MIT
kind: skill
tags:
  - writing
  - video
description: >
  Writes camera-ready short-form video scripts from rough ideas or essays.
  Voice rules come from kernel-voice. This skill handles video script structure
  and visual direction only.
when:
  - user wants a video script from an idea or essay
  - user needs visual cues, captions, or production guidance
  - user invokes /kernel-write-video
outputs:
  - Short-form video script (40-60 seconds) with visual cues and captions
  - Long-form expansion notes if applicable
termination:
  - Script is camera-ready with hook, visual cues, captions, and alternate hooks
allowedTools:
  - Read
  - Write
argumentHint: video topic, rough idea, or essay file
---

# Write Video — Creator Script

Writes camera-ready video scripts. Voice rules are provided separately by the kernel-voice skill. This skill handles video script structure and visual direction only.

---

## Mode: Shorts-First (default)

Default output: 40-60 seconds (~100-160 spoken words). Shorts are self-contained arguments, not cut-downs. One idea. One metaphor. One visual anchor.

If the source material is strong enough for long-form, note it under `## Long-Form Potential` — but don't write the long script unless asked.

---

## Script Structure

| Section | Time | Words | What it does |
|---|---|---|---|
| Hook | 3 sec | 5-10 | Creates tension or contradiction. Must survive the scroll-past. |
| Thesis | 10 sec | 15-25 | States the claim. Names what most people get wrong. |
| Body | 20 sec | 60-90 | One or two points with visual support. Concrete, not abstract. |
| Turn | 10 sec | 15-25 | A reversal, hidden incentive, or personal realization. |
| Close | 5 sec | 5-15 | A strike. Lands and stops. Not a question. |

---

## Visual Cues

Every 10-15 seconds of speech needs a visual change. Include `[VISUAL: ...]` markers inline in the script. Types:
- **A-roll change:** different framing, closer/longer shot, move position
- **B-roll:** specific footage to shoot or source
- **On-screen text:** exact words to overlay with timing
- **Diagram/prop:** what to show and when
- **Screen recording:** what to capture

Never let a single shot run more than 15 seconds. Even a slight push-in counts.

---

## Required Output

```markdown
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
