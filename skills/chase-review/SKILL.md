---
name: chase-review
description: "Charles's engineering, product, design and workflow preferences in one place. Use to review a file, diff or PR, to refactor a repo toward his taste, and as the checklist before writing code, a PRD, a screen, a commit or a PR in any of his repos."
license: MIT
compatibility: Any repo. TypeScript, React Native and Swift are covered in depth; the principles carry to other stacks.
metadata:
  author: charlesponti
  version: "3.0"
  category: Engineering
---

# chase-review

Charles's preferences, gathered from how he reviews, corrects and steers work across Thames,
Hominem and his other repos. Most are inferences from his requests, not a style guide he wrote,
so each reference marks where a rule is his exact word (dated) and where it is inferred.

## Precedence

1. What Charles says in the moment wins. Then update the matching reference file right away.
2. A repo's own written rules (`AGENTS.md`, `CLAUDE.md`, a repo-local skill) beat this skill where
   they conflict. They usually add to it.
3. This skill fills every gap the repo leaves open.
4. Charles is the product manager and architect. Never invent product behavior, navigation or
   architecture and present it as decided (`references/workflow.md`, "Decision authority").

## How to run a review

1. Read the file, diff or PR in full before judging it.
2. Find the repo's own checks (type check, lint, format, tests) from its docs or manifests. Use those.
3. Open only the references the change touches (table below). Check each rule.
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

## Top rules (the ones he repeats most)

1. YAGNI. The smallest thing that works, one-liners where they read well, nothing for later.
2. Delete before adding. No unused code, no dead options, no compatibility shims inside an app.
3. Schema-first for anything read from outside the program.
4. One pattern, applied everywhere. Merge duplicates; reuse the existing way.
5. Short domain names. Name what a thing is, not how it is stored.
6. No ternary chains. Lookup table, early returns or an exhaustive `switch`.
7. Tooling enforces style (types, lint, formatter), not comments asking nicely.
8. UI says less: one-line hints, symbols over words, calm wording, red only for real failure.
9. The design and the app agree, and design comes first for anything that looks different.
10. Prove with evidence. Logs and measurements before rebuilds; "done" means verified.
11. Existing failures are yours. Fix what is red even if you did not break it.
12. One branch and PR per body of work. Never merge, delete or deploy before he says done.
13. Never print or commit secrets.
14. Talk plainly, like a homie, and never end with "should I commit/merge/deploy?".

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
