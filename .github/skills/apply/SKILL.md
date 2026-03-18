---
name: apply
description: Implement tasks from a Jinn change. Use when user wants to execute the implementation plan.
license: MIT
compatibility: Requires jinn CLI.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, apply, implement, execute]
---

Implement tasks from a Jinn change.

**Input**: Optionally specify a change name (e.g., `/apply add-auth`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `jinn list` to get available changes

   Always announce: "Using change: <name>".

2. **Check status to understand the workflow**
   ```bash
   jinn status --change "<name>" --json
   ```

3. **Get apply instructions**
   ```bash
   jinn instructions apply --change "<name>" --json
   ```

4. **Read context files**

   Read the files listed in context files from the instructions output.

5. **Show current progress**

   Display:
   - Workflow being used
   - Progress: "N/M tasks complete"

6. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete: `- [ ]` → `- [x]`
   - Continue to next task

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance

7. **On completion or pause, show status**

**Guardrails**
- Keep going through tasks until done or blocked
- Always read context files before starting
- If task is ambiguous, pause and ask before implementing
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
