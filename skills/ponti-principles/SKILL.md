---
name: ponti-principles
description: "Use when writing, reviewing or refactoring Charles's code: the standing engineering laws plus his product, design, data, workflow and communication principles."
license: MIT
compatibility: Any repo. TypeScript, React Native and Swift are covered in depth; the laws carry to other stacks.
metadata:
  author: ponti-studios
  version: "1.0.0"
  category: Engineering
  tags: [principles, standing-rules, review, engineering, product, design, workflow]
---

# Ponti principles

Every rule Charles enforces on his own repos, in one place. Two sources, one authority:

- **The laws** — distilled from his sent messages across 63 OpenCode sessions (370 messages, Jul–Oct
  2026), ordered by how often he has had to *correct* an agent into them. The top of each section is what
  agents most reliably get wrong. Law, not suggestion.
- **The reference tier** — the per-domain detail behind the laws, gathered from how he reviews, corrects
  and steers work across Thames, Hominem and his other repos. Each reference marks where a rule is his
  exact word (dated) and where it is inferred.

Load this before writing code, before reviewing a file/diff/PR, and before a PRD, a screen, a commit or a
PR. Keep applying it for the whole task. Where a law conflicts with a framework default or your own habit,
the law wins.

## Precedence

1. What Charles says in the moment wins. Then update the matching reference file right away.
2. A repo's own written rules (`AGENTS.md`, `CLAUDE.md`, a repo-local skill) beat this skill where they
   conflict. They usually add to it.
3. This skill fills every gap the repo leaves open.
4. Charles is the product manager and architect. Never invent product behavior, navigation or
   architecture and present it as decided (`references/workflow.md`, "Decision authority").

## The laws

### Before you write code

1. **Plan first, in the open.** State what must be built, in what order, and how each step can be tested.
   Go deep on the latest docs before using a framework's features. If the task is big, the plan is the
   first deliverable.
2. **Bounded scope is law.** Do exactly the slice specified — one route, one endpoint, one app.
   Everything else is explicitly out of scope, including "obvious" improvements. A pilot slice is not a
   policy: never generalise a pilot decision repo-wide on your own.
3. **YAGNI.** The smallest thing that works. One-liners where they read well, nothing built for later, no
   options nobody asked for.
4. **Check blast radius.** If a change alters an existing default, endpoint behaviour, or consumer, flag it
   before handoff — don't let it ride along silently.
5. **Positioning before interface.** If the product's category framing is unsettled ("dashboard" vs
   "text → LLM → dynamic UI"), settle that first; don't design cards for an undecided product.

### Architecture

6. **The API owns the business logic.** Apps and clients never ping databases directly. Best boundary,
   always.
7. **Simplify toward the goal.** If the stack is heavier than what the user wants to accomplish, say so and
   cut. Squash proliferating files into a few canonical ones. One function where one suffices.
8. **Shared code lives together.** Platforms that share code share a repo. Extract reusable units (hooks,
   input groups, shared UI package imported like a library) instead of duplicating per app.
9. **One pattern, applied everywhere.** Merge duplicates; reuse the existing way rather than adding a
   parallel one. Two ways to do the same thing is a defect.
10. **Isolate state for performance.** Form edits must never re-render the world. Treat visible input delay
    as an architecture bug.
11. **One standard shape for repeated surfaces.** List endpoints: bounded limit, opaque keyset cursor,
    deterministic ordering — plus route tests for cursor boundaries, an empty page, and a row inserted
    between pages.
12. **Schema-first for anything read from outside the program.** Validate at the boundary; no hand-rolled
    guards scattered through the body.
13. **Offline behaviour and hosting cost are design constraints**, stated upfront, not discovered later.
    Sync claims require a ground-truth check (e.g. airplane-mode test verified against the server), never
    an assumption.

### Data, secrets, trust

14. **Secrets are a designed plan**, explained before implementation — not values pasted into places.
15. **Never print, log or commit a secret.** Not in a report, not in a test, not "temporarily". Rotate
    anything that leaked into a log or a diff.
16. **Nothing about a person is stored that they cannot see, delete and switch off.** Defaults are the
    private ones; telemetry is opt-out, not opt-in by silence.

### Code, review, dependencies

17. **Short domain names.** Name what a thing is, not how it is stored. Units in numeric names. One word per
    concept.
18. **No ternary chains.** A lookup table, early returns, or an exhaustive `switch`.
19. **Tooling enforces style, not comments asking nicely.** Types, lint and formatter are the enforcement;
    a convention nobody checks is a preference.
20. **Delete before adding; kill dead things completely.** No unused code, params, options, exports, files
    or dependencies, no compatibility shims inside an app. When an idea, app, skill or test dies, remove all
    of it — including related artefacts and leftover dot folders. A "stupid test" gets deleted, not
    defended.
21. **Existing failures are yours.** Fix what is red even if you did not break it.
22. **Decomposition ships with tests.** Breaking a file apart and writing its test file are one instruction.
    When coverage is demanded (it will be), it means the specified cases, each with a passing test.
23. **Mock before you integrate.** Mock external providers (MSW-style) against a set of realistic scenarios
    before calling the real thing.
24. **Price before you pick.** Model and tool choices get a cost comparison first. Hosting and serving costs
    are part of the design.
25. **Latest tooling, gold-standard scaffolding.** New apps are set up as the reference example: current
    versions, lint/format tooling (oxlint/oxfmt/ruff as appropriate), modern platform floors (@Observable,
    current iOS/macOS). Volatile values (tool counts, version numbers that change) never get hardcoded into
    durable text; metadata stays short but discoverable.
26. **No generated or output assets in the repo.** Present code properly formatted; mangled dumps get sent
    back.

### Design

27. **Results before configuration.** Show users the content first (Airbnb pattern); filters as pills
    alongside, in a sheet on mobile. Never gate the content behind upfront choices.
28. **Minimal chrome.** The content surface takes the full display; controls live in hideable sheets. Show
    one representation of a thing, not two (a link OR a status tag, not both).
29. **One design system, single options.** Variation is a defect. If variants proliferate, squash them into
    the system. Cross-platform drift (wrong icon, wrong styles on one platform) is a bug.
30. **Uniform grids, fixed at the container.** All cards/posters the same height, handled by grid/flex
    children — don't patch individual cards.
31. **Icons over text labels** where the meaning is conventional.
32. **Micro-typography is specified.** Small, tight, phone-first text and padding; measurements/labels in
    light weight at exact sizes when given. Components must not be massive.
33. **Motion shows cause and effect.** Tokens appear as the cursor moves; a pen draws the line as it
    travels. Animation starts when the component is in view. If a rebuild drops a signature effect (e.g.
    hover mouse-tracking), that's a regression — restore it.
34. **"From scratch" means a new concept**, not a restyle of the last one. Redesigns go back to first
    principles and may copy a named reference (joinvoy.com, dove.email) — name yours.
35. **In decks, slides do the narrative work.** No machine/overview panels, no weak ledes, controls live
    inside their cards, slides get URL hashes so links are shareable.
36. **Across a set, frames must match and the story must read from the images alone** — same props, same
    cases, cause and effect visible in-frame.
37. **UI says less.** One-line hints, symbols over words, calm wording, red only for real failure.
38. **The design and the app agree, and design comes first** for anything that looks different.

### Workflow and shipping

39. **Ship in logical commits**, and commit/push as the cadence, not as an afterthought.
40. **One branch and PR per body of work.** Never merge, delete or deploy before he says done.
41. **Build variants to be felt.** When he asks for concepts, build them so he can run/see them — "build all
    three so i can feel them" — rather than describing them.
42. **Explain how it works when asked**, plainly and mechanistically. A fifth of his messages are questions
    about mechanism or state; answer them as mental-model building, not deflection.
43. **Prove with evidence.** Logs and measurements before rebuilds; run it, test it, read it back. "Done"
    means verified — never claim a state you did not check.
44. **Talk plainly, like a homie**, and never end with "should I commit/merge/deploy?".

### Working style

45. **Think deeply when told to** — he can tell the difference.
46. **Ask exactly one focused question when a product decision is genuinely missing, then park.** Don't
    invent the decision and don't ask five.

### Ticket routing — Linear → repo

47. **The project names the repo.** When you pick up a Linear ticket, read its project before touching code.
    The project description opens with a "Repo — agent routing" block; its `github` and `local` values are
    the only authority for where the work happens. Work only in that repo, in that local checkout, and
    branch from the issue's `gitBranchName`. Never infer a repo from a ticket's title. Two exceptions: the
    Incubator project has no repo — its issues are uncommitted ideas, so do not write code against them;
    and multi-repo projects (e.g. Ponti.io & Infrastructure) carry no single-repo block, so the ticket
    itself must name the repo in its description — if it doesn't, stop and ask one focused question
    (law 46).
48. **Engineering tickets follow the template.** Every engineering issue in a repo project carries Problem
    / Scope / Acceptance criteria / Tests / Agent notes — canonical text in each repo project's Linear
    charter. The acceptance criteria are the contract: the ticket is done when every box is true, and only
    then. If a ticket you pick up has no acceptance criteria, do not guess them — ask one focused question
    (law 46) or send the ticket back for shaping.

## How to run a review

1. Read the file, diff or PR in full before judging it.
2. Find the repo's own checks (type check, lint, format, tests) from its docs or manifests. Use those.
3. Open only the references the change touches (table below). Check each law and each rule.
4. Report only real violations: file, line, the rule it breaks, the fix. No padding, no praise filler.
5. For a refactor, change behaviour never. One rule per pass, a mechanical diff, checks after each pass.
6. Say what was run and what was not (not run on a device, not run live, not run at all).

## Which reference to open

| Touching | Open |
| --- | --- |
| Any code | `references/code.md` |
| TypeScript, React, React Native, Expo | `references/typescript-react-native.md` |
| Swift, SwiftUI, native modules, watchOS | `references/swift.md` |
| Screens, copy, motion, errors, PRDs, design files | `references/product-and-design.md` |
| Secrets, user data, telemetry, auth, databases, APIs | `references/data-and-trust.md` |
| Branches, commits, PRs, merging, deploys, TestFlight, debugging, tests | `references/workflow.md` |
| How to talk to Charles, reports, summaries | `references/communication.md` |

## Final checklist

- [ ] Untrusted data goes through a schema; no hand-rolled guards
- [ ] No nested or multi-way ternaries; no clever one-liner that hides logic
- [ ] Names are short domain nouns; units in numeric names; one word per concept
- [ ] No unused code, params, options, exports, files or dependencies
- [ ] No inline styles; the repo formatter, linter and type check are clean
- [ ] Existing pattern reused; no duplicated helper
- [ ] Copy is one line, calm, and only says what colour or an icon does not
- [ ] Design file and shipped app agree; any new look was designed first
- [ ] Nothing about the person is stored that they cannot see, delete and switch off
- [ ] No secret, key or user content in the repo, build, log or telemetry
- [ ] Full checks ran for every affected package; skipped checks are named
- [ ] Commit, PR and report say plainly what changed, why, and what is unverified

## References

- `references/code.md` — the day-to-day code rules: names, shape, error handling, deletion.
- `references/typescript-react-native.md` — TS/React/Expo specifics.
- `references/swift.md` — Swift, SwiftUI and native module specifics.
- `references/product-and-design.md` — product framing, screens, copy, motion, PRDs.
- `references/data-and-trust.md` — secrets, personal data, telemetry, auth, databases, APIs.
- `references/workflow.md` — branches, commits, PRs, merges, deploys, debugging, tests.
- `references/communication.md` — how to talk to Charles, reports and summaries.
