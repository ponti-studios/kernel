---
name: kernel-write-video
license: MIT
kind: skill
tags:
  - writing
  - video
description: >
  Writes creator-led short-form video scripts from rough ideas or essays.
  Produces camera-ready scripts with hooks, visual cues, captions, and
  expansion notes. Shorts-first, long-form optional.
when:
  - user wants a video script from an idea or essay
  - user needs a shot list, visual cues, or caption beats
  - user asks for shorts cutdowns
  - user invokes /kernel-write-video
outputs:
  - Short-form video script (40-60 seconds, ~100-160 words) with visual cues and captions
  - Production plan or editing checklist
  - Long-form expansion notes
termination:
  - Script is camera-ready with hook, visual cues, captions, and alternate hooks
  - Voice is sharp, spoken, no filler
allowedTools:
  - Read
  - Write
argumentHint: video topic, rough idea, essay file, or existing script
---

# Write Video — Creator Script & Production

Writes camera-ready video scripts. Shorts-first by default. Long-form on request.

---

## Routing

| Task | Reference |
|---|---|
| Script from idea or essay | `references/creator-contract.md` |
| Production plan or editing checklist | `references/producer-contract.md` |

---

## Voice DNA

The spoken voice inherits from the same source as the written voice. The same DNA, delivered differently.

### The Four Rules

**Open on a strike.** The first sentence is a claim, not an introduction. No "today I want to talk about." No "have you ever noticed." The hook lands in the first 3 seconds of speech.

**Say the hard thing plainly.** Don't perform intelligence. Don't gesture at depth. State the observation, name the contradiction, and move on. If a sentence only exists because it sounds clever, cut it.

**No filler. No hedges. No "interesting."** Cut "arguably," "perhaps," "interestingly," "notably," "some might say." Every hedge is a claim you're afraid to make. Make it or cut it.

**In, done, gone.** No wind-down. No "so what do you think." No "in conclusion." The last line lands and stops. The viewer should feel the silence after it.

### What It Never Sounds Like

- Self-help ("You need to...")
- Tech commentary ("The future of AI is...")
- Motivational fluff ("Keep grinding...")
- Creator clichés ("Smash that like...")
- Thought leadership ("As a founder...")
- Lectures ("Let's dive into...")
- Brand decks ("We believe that...")

### What It Sounds Like

A smart person thinking in public. Sharp, opinionated, slightly impatient with bad incentives. Warm when admitting something honest. Direct when naming something false. The viewer should feel like they overheard something true.

---

## Shorts-First Mode (default)

When no length is specified, write for 40-60 seconds (~100-160 spoken words). Shorts are not cut-down longs. They are self-contained arguments with one idea, one metaphor, one visual anchor.

### Structure

| Section | Time | Words | What it does |
|---|---|---|---|
| Hook | 3 sec | 5-10 | Creates tension or contradiction. Must survive the scroll-past. |
| Thesis | 10 sec | 15-25 | States the claim. Names what most people get wrong. |
| Body | 20 sec | 60-90 | One or two quick points with visual support. Concrete, not abstract. |
| Turn | 10 sec | 15-25 | The part that makes the idea feel less obvious. A reversal or hidden thing. |
| Close | 5 sec | 5-15 | A strike. Not a question. Not a summary. Lands and stops. |

### Visual Rule

Every 10-15 seconds of speech needs a visual change. The script must include inline `[VISUAL: ...]` cues. A talking head that stays the same shot for 60 seconds is disrespectful to the viewer. Change the frame, show something, add text — keep the eye moving.

---

## Required Output

```markdown
# [Title]

## Hook (first 3 seconds)

[One sentence. Tension, contradiction, or curiosity. No intro.]

## Script

[VERBAL]
The full spoken script. Mark every visual cue inline: [VISUAL: describe what's on screen].

Keep language spoken — contractions, fragments, natural pauses. Cut anything that wouldn't come out of your mouth.
[END VERBAL]

## Visual Cues

- [ ] [A-roll framing setup]
- [ ] [B-roll: specific footage to shoot or find]
- [ ] [On-screen text overlay]
- [ ] [Prop or diagram]

## Caption Beats

- "[caption during hook]"
- "[caption during thesis]"
- "[caption during close]"

## Alternate Hooks

- "[hook option 1]"
- "[hook option 2]"
- "[hook option 3]"

## Long-Form Potential

Is this idea strong enough for 3-5 minutes? What would the expansion look like? (One sentence — don't write the long script unless asked.)
```
