---
name: kernel-animate
description: "Build, audit, and review UI motion: animations, gestures, transitions, and fix plans. Use when adding motion or fixing stutter, jank, or missing animation."
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Design
  tags:
    - design
    - motion
    - animation
    - ui
allowed-tools: Read Write
---

# Kernel Animate — consolidated motion skill

One skill routing across ten references: build, review, audit-and-plan,
discovery, and language. Invoke with the animation task or motion question.
Pick the reference that matches the task and follow it end-to-end.

## When to use

- Animating a component, adding motion, or building a transition
- Naming a motion effect from a vague description
- Finding places in a UI that don't animate but should
- Auditing a codebase's motion or producing prioritized fix plans
- Reviewing a diff's animation code against a high craft bar
- Looking up ready-made implementations (press, dropdown, toast, drawer, ...)

## Outputs

- Implementation, findings, plans, or verdicts per the loaded reference's workflow

## Definition of done

- The applicable reference's definition-of-done checks pass for the task

## References

| Task | Reference |
| --- | --- |
| Build an animation from scratch (gate → purpose → tool → properties → curve) | `references/build.md` |
| Ready-to-build implementations (press, dropdown, tooltip, modal, drawer, toast, stagger, drag) | `references/recipes.md` |
| Emil Kowalski's design-engineering philosophy — the bar behind everything | `references/craft.md` |
| Name a motion effect from a vague description | `references/vocabulary.md` |
| Find places that don't animate but should | `references/opportunities.md` |
| Audit a codebase's motion and write self-contained fix plans | `references/improve.md` |
| The eight audit categories and exact target values | `references/audit.md` |
| Plan format for improvement plans | `references/plan-template.md` |
| Review a diff's animation code | `references/review.md` |
| Precise review values (curves, durations, springs, performance) | `references/standards.md` |

## Cross-cutting rules

- **Boundary with `kernel-design`.** This skill implements and audits animation
  code; `kernel-design` decides motion values, tokens, brand, and
  reduced-motion behavior. Motion values resolve to the project's shared token
  source — extend it, don't fork a parallel system.

- **Frequency gates everything.** Keyboard-initiated and 100+/day actions never
  animate; delight is reserved for rare/first-time moments.
- **`transform` and `opacity` only**, origin-aware entrances, never `scale(0)`.
- **UI stays under 300ms** with strong custom easing tokens — never built-in
  curves or `ease-in`.
- **Transitions and springs over keyframes** for anything triggered rapidly or
  reversible mid-motion.
- **Reduced motion and hover gating ship with the animation**, not as a
  follow-up.
