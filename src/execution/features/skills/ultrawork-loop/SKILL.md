---
name: ultrawork-loop
description: Skill docs for the `ultrawork-loop` drain agent. Documents expected sequence, flags, and completion-handshake semantics.
---

# Ultrawork Loop Skill

## Overview

`ultrawork-loop` is a small orchestration/drain agent used by the harness to ensure work items (PR fixes and file-based todos) are completed before continuing downstream workflows. It runs a predefined, sequential set of steps and emits a completion promise (`DONE`) when finished.

## When to use

- You need a deterministic "drain" step at the end of a workflow
- You want the harness to wait until PR fixes and todos are resolved
- You want an explicit completion handshake (`--completion-promise "DONE"`)

## Sequence (fixed)

1. `/ghostwire:resolve_pr_parallel`
2. `/ghostwire:resolve_todo_parallel --completion-promise "DONE"`

The second step must include `--completion-promise "DONE"` so the harness recognizes completion.

## Expected Output

- On success: the agent or invoked command outputs exactly:

  <promise>DONE</promise>

- On partial failure: surface failing items as todos or PR comments and exit with a non-success status (human follow-up required)

## Implementation notes for integrators

- Keep `ultrawork-loop` narrow and predictable. It should not spawn dynamic plans or long-running creative tasks.
- Preserve the `--completion-promise` semantics: consumers depend on the exact token `DONE` (case-sensitive) wrapped in `<promise>` tags.

## Testing

- Unit test should verify:
  - `agents/ultrawork-loop.md` exists and documents the sequence
  - `skills/ultrawork-loop/SKILL.md` contains the completion-promise guidance
  - `opencode.json` (or the calling workflow) includes the sequential resolvers and the `--completion-promise "DONE"` flag where expected

## Example invocation

- Synchronous run (from workflow):
  1. Start `ultrawork-loop`
  2. Wait for `<promise>DONE</promise>`
  3. Proceed to `workflows:plan` / `workflows:work` etc.

## Troubleshooting

- If the harness never receives `DONE`, inspect logs from `/ghostwire:resolve_todo_parallel` for blocked todos or failing PRs.
- Ensure the `--completion-promise` flag was preserved when invoking the TODO resolver.

## Compatibility

- Designed to be used in the existing `lfg` workflow and any other workflows that require a deterministic drain step.

---

`ultrawork-loop` is intentionally small: orchestration only, no guessing or planning.
