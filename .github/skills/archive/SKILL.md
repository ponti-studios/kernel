---
name: archive
description: Archive a completed change. Use when work is done and ready to be moved to archive.
license: MIT
compatibility: Requires jinn CLI.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, archive, complete, done]
---

Archive a completed change.

**Input**: Optionally specify a change name (e.g., `/archive add-auth`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `jinn list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `jinn status --change "<name>" --json` to check artifact completion.

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file to check for incomplete tasks.

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

4. **Perform the archive**

   Create the archive directory if it doesn't exist:
   ```bash
   mkdir -p jinn/changes/archive
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   Move the change directory to archive:
   ```bash
   mv jinn/changes/<name> jinn/changes/archive/YYYY-MM-DD-<name>
   ```

5. **Display summary**

   Show archive completion summary including:
   - Change name
   - Workflow that was used
   - Archive location
   - Note about any warnings

**Guardrails**
- Always prompt for change selection if not provided
- Use status for completion checking
- Don't block archive on warnings - just inform and confirm
