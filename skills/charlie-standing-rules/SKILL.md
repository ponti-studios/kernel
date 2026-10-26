---
name: charlie-standing-rules
description: "Charlie Ponti's standing rules for ALL coding and engineering work. Load this skill at the start of every coding task, before writing code, and apply the rules throughout. Distilled from the corrections he has repeatedly had to give coding agents; these are law, not suggestions."
license: MIT
metadata:
  version: "1.0.0"
  author: ponti-studios
  category: Engineering
  tags:
    - standing-rules
    - coding
    - charlie
---

# Charlie's standing rules for coding agents

Ported into Hermes 2026-10-25. Distilled 2026-10-25 from Charlie's sent messages across 63 OpenCode sessions (370 messages, Jul–Oct 2026), ordered by how often he has had to *correct* agents into these — the top of this list is what agents most reliably get wrong. The canonical home of these rules is now this skill; the original distillation lives with the OpenCode usage analysis that produced it.

**How to use this skill:** load it before writing code on any task for Charlie, and keep applying it for the whole task. Where a rule conflicts with a framework default or your own habit, the rule wins. Where a rule conflicts with an explicit instruction in the current task, the task wins — and you flag the conflict rather than silently choosing.

## Before you write code

1. **Plan first, in the open.** State what must be built, in what order, and how each step can be tested. Go deep on the latest docs before using a framework's features. If the task is big, the plan is the first deliverable.
2. **Bounded scope is law.** Do exactly the slice specified — one route, one endpoint, one app. Everything else is explicitly out of scope, including "obvious" improvements. A pilot slice is not a policy: never generalise a pilot decision repo-wide on your own.
3. **Check blast radius.** If a change alters an existing default, endpoint behaviour, or consumer, flag it before handoff — don't let it ride along silently.
4. **Positioning before interface.** If the product's category framing is unsettled ("dashboard" vs "text → LLM → dynamic UI"), settle that first; don't design cards for an undecided product.

## Architecture

5. **The API owns the business logic.** Apps and clients never ping databases directly. Best boundary, always.
6. **Simplify toward the goal.** If the stack is heavier than what the user wants to accomplish, say so and cut. Squash proliferating files into a few canonical ones. One function where one suffices.
7. **Shared code lives together.** Platforms that share code share a repo. Extract reusable units (hooks, input groups, shared UI package imported like a library) instead of duplicating per app.
8. **Isolate state for performance.** Form edits must never re-render the world. Treat visible input delay as an architecture bug.
9. **One standard shape for repeated surfaces.** List endpoints: bounded limit, opaque keyset cursor, deterministic ordering — plus route tests for cursor boundaries, an empty page, and a row inserted between pages.
10. **Offline behaviour and hosting cost are design constraints**, stated upfront, not discovered later. Sync claims require a ground-truth check (e.g. airplane-mode test verified against the server), never an assumption.
11. **Secrets are a designed plan**, explained before implementation — not values pasted into places.

## Design

12. **Results before configuration.** Show users the content first (Airbnb pattern); filters as pills alongside, in a sheet on mobile. Never gate the content behind upfront choices.
13. **Minimal chrome.** The content surface takes the full display; controls live in hideable sheets. Show one representation of a thing, not two (a link OR a status tag, not both).
14. **One design system, single options.** Variation is a defect. If variants proliferate, squash them into the system. Cross-platform drift (wrong icon, wrong styles on one platform) is a bug.
15. **Uniform grids, fixed at the container.** All cards/posters the same height, handled by grid/flex children — don't patch individual cards.
16. **Icons over text labels** where the meaning is conventional.
17. **Micro-typography is specified.** Small, tight, phone-first text and padding; measurements/labels in light weight at exact sizes when given. Components must not be massive.
18. **Motion shows cause and effect.** Tokens appear as the cursor moves; a pen draws the line as it travels. Animation starts when the component is in view. If a rebuild drops a signature effect (e.g. hover mouse-tracking), that's a regression — restore it.
19. **"From scratch" means a new concept**, not a restyle of the last one. Redesigns go back to first principles and may copy a named reference (joinvoy.com, dove.email) — name yours.
20. **In decks, slides do the narrative work.** No machine/overview panels, no weak ledes, controls live inside their cards, slides get URL hashes so links are shareable.
21. **Across a set, frames must match and the story must read from the images alone** — same props, same cases, cause and effect visible in-frame.

## Engineering practice

22. **Decomposition ships with tests.** Breaking a file apart and writing its test file are one instruction. When coverage is demanded (it will be), it means the specified cases, each with a passing test. Run a final code review before committing.
23. **Mock before you integrate.** Mock external providers (MSW-style) against a set of realistic scenarios before calling the real thing.
24. **Price before you pick.** Model and tool choices get a cost comparison first. Hosting and serving costs are part of the design.
25. **Latest tooling, gold-standard scaffolding.** New apps are set up as the reference example: current versions, lint/format tooling (oxlint/oxfmt/ruff as appropriate), modern platform floors (@Observable, current iOS/macOS). Volatile values (tool counts, version numbers that change) never get hardcoded into durable text; metadata stays short but discoverable.
26. **No generated or output assets in the repo.**
27. **Kill dead things completely.** When an idea, app, skill or test dies, remove all of it — including related artefacts and leftovers (dot folders count). A "stupid test" gets deleted, not defended. Present code properly formatted; mangled dumps get sent back.
28. **Ship in logical commits** and commit/push as the cadence, not as an afterthought.
29. **Build variants to be felt.** When he asks for concepts, build them so he can run/see them — "build all three so i can feel them" — rather than describing them.
30. **Explain how it works when asked**, plainly and mechanistically. A fifth of his messages are questions about mechanism or state; answer them as mental-model building, not deflection.

## Working style

31. Think deeply when told to — he can tell the difference. Verify by doing: run it, test it, read it back. Never claim a state you didn't check.
32. When a product decision is genuinely missing, ask **one** focused question and park. Don't invent the decision and don't ask five.

## Ticket routing — Linear → repo

33. **The project names the repo.** When you pick up a Linear ticket, read its project before touching code. The project description opens with a "Repo — agent routing" block; its `github` and `local` values are the only authority for where the work happens. Work only in that repo, in that local checkout, and branch from the issue's `gitBranchName`. Never infer a repo from a ticket's title. Two exceptions: the Incubator project has no repo — its issues are uncommitted ideas, so do not write code against them; and multi-repo projects (e.g. Ponti.io & Infrastructure) carry no single-repo block, so the ticket itself must name the repo in its description — if it doesn't, stop and ask one focused question (rule 32).

34. **Engineering tickets follow the template.** Every engineering issue in a repo project carries Problem / Scope / Acceptance criteria / Tests / Agent notes — canonical text in each repo project's Linear charter. The acceptance criteria are the contract: the ticket is done when every box is true, and only then. If a ticket you pick up has no acceptance criteria, do not guess them — ask one focused question (rule 32) or send the ticket back for shaping.
