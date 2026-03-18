---
description: Archive a completed change
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

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

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

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move the change directory to archive

   ```bash
   mv jinn/changes/<name> jinn/changes/archive/YYYY-MM-DD-<name>
   ```

5. **Display summary**

   Show archive completion summary including:
   - Change name
   - Workflow that was used
   - Archive location
   - Note about any warnings (incomplete artifacts/tasks)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Workflow:** <workflow-name>
**Archived to:** jinn/changes/archive/YYYY-MM-DD-<name>/

All artifacts complete. All tasks complete.
```

**Output On Success With Warnings**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Workflow:** <workflow-name>
**Archived to:** jinn/changes/archive/YYYY-MM-DD-<name>/

**Warnings:**
- Archived with 2 incomplete artifacts
- Archived with 3 incomplete tasks

Review the archive if this was not intentional.
```

**Guardrails**
- Always prompt for change selection if not provided
- Use status for completion checking
- Don't block archive on warnings - just inform and confirm
- Show clear summary of what happened
