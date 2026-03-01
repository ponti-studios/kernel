# Quickstart: Consolidate Commands, Prompts, Templates & Migrate Profiles

**Date**: 2026-02-28  
**Spec**: `/specs/002-consolidate-commands-structure/spec.md`

## For Developers: Understanding the New Structure

### Before Reorganization

```
src/execution/commands/
├── templates/          ← Command templates
├── prompts/            ← Command prompts
└── profiles/
    └── prompts/        ← Profile prompts (DUPLICATE)

src/orchestration/agents/
├── constants.ts        ← Agent IDs
└── (no prompts/)
```

### After Reorganization

```
src/execution/commands/
├── templates/          ← Command templates
└── prompts/            ← Command prompts

src/orchestration/agents/
├── constants.ts        ← Agent IDs
└── prompts/            ← Agent-specific prompts (MIGRATED)
```

---

## Common Tasks

### Task 1: Locate a Command Template

**Goal**: Find the implementation of a command

**Steps**:
1. Open `src/execution/commands/templates/`
2. Find the file matching the command name (e.g., `code.review.ts`)
3. Open the file to see the command implementation

**Example**:
```bash
# Find code review command
ls src/execution/commands/templates/code.review.ts
cat src/execution/commands/templates/code.review.ts
```

---

### Task 2: Find a Command Prompt

**Goal**: Find the prompt used by a command

**Steps**:
1. Open `src/execution/commands/prompts/`
2. Find the file matching the agent ID (e.g., `reviewer_python.ts`)
3. Open the file to see the prompt content

**Example**:
```bash
# Find Python reviewer prompt
ls src/execution/commands/prompts/reviewer_python.ts
cat src/execution/commands/prompts/reviewer_python.ts
```

---

### Task 3: Find an Agent-Specific Prompt

**Goal**: Find the custom prompt for an agent

**Steps**:
1. Open `src/orchestration/agents/prompts/`
2. Find the file matching the agent ID (e.g., `agent_planner.ts`)
3. Open the file to see the agent-specific prompt

**Example**:
```bash
# Find planner agent prompt
ls src/orchestration/agents/prompts/agent_planner.ts
cat src/orchestration/agents/prompts/agent_planner.ts
```

---

### Task 4: Update an Import After Migration

**Goal**: Update code that imports from old locations

**Steps**:
1. Find the import statement (e.g., `import { PROFILE_PROMPTS } from "./profiles/prompts"`)
2. Change it to import from new location (e.g., `import { AGENT_PROMPTS } from "../../orchestration/agents/prompts"`)
3. Rename the symbol from `PROFILE_PROMPTS` to `AGENT_PROMPTS`
4. Update all usages of the symbol

**Example**:
```typescript
// Before
import { PROFILE_PROMPTS } from "./profiles/prompts";
const prompt = PROFILE_PROMPTS[agentId];

// After
import { AGENT_PROMPTS } from "../../orchestration/agents/prompts";
const prompt = AGENT_PROMPTS[agentId];
```

---

### Task 5: Verify the Export Pipeline

**Goal**: Ensure `.github/prompts/` is generated correctly

**Steps**:
1. Run the export command: `ghostwire export --target copilot`
2. Check that `.github/prompts/` directory is populated
3. Verify that prompt files are generated correctly

**Example**:
```bash
# Run export
ghostwire export --target copilot

# Verify output
ls .github/prompts/ | head -10
cat .github/prompts/code.review.prompt.md
```

---

## For Maintainers: Verification Checklist

### Pre-Migration Verification

- [ ] Backup current state: `git stash` or create a backup branch
- [ ] Verify current structure: `ls -la src/execution/commands/`
- [ ] Count files: `find src/execution/commands/profiles/prompts -type f | wc -l`
- [ ] Verify imports: `grep -r "profiles/prompts" src/ | wc -l`

### Post-Migration Verification

#### 1. Directory Structure

```bash
# Verify old directory is deleted
ls src/execution/commands/profiles/ 2>&1 | grep "No such file"

# Verify new directory exists
ls -la src/orchestration/agents/prompts/

# Verify files are present
find src/orchestration/agents/prompts -type f | wc -l
```

#### 2. Import Paths

```bash
# Verify no old imports remain
grep -r "profiles/prompts" src/ | wc -l
# Expected: 0

# Verify all symbols renamed
grep -r "PROFILE_PROMPTS" src/ | grep -v "^Binary" | wc -l
# Expected: 0 (or only in comments/docs)
```

#### 3. TypeScript Compilation

```bash
# Run type checking
bun run typecheck

# Expected: No errors
```

#### 4. Test Suite

```bash
# Run all tests
bun test

# Expected: All tests pass
```

#### 5. Export Pipeline

```bash
# Run export
ghostwire export --target copilot

# Verify output
ls .github/prompts/ | wc -l
# Expected: Same number as before migration

# Compare with pre-migration state
diff -r .github/prompts/ <backup-path>/.github/prompts/
# Expected: No differences (or only whitespace)
```

#### 6. Manifest Generation

```bash
# Run manifest generation
bun run src/script/build-agents-manifest.ts

# Verify output
cat src/execution/agents-manifest.ts | head -20
# Expected: Manifest includes agent prompts
```

---

## Troubleshooting

### Issue: Import Error After Migration

**Symptom**: `Cannot find module` error when running code

**Solution**:
1. Verify the import path is correct: `../../orchestration/agents/prompts`
2. Verify the file exists: `ls src/orchestration/agents/prompts/<filename>.ts`
3. Verify the symbol is exported: `grep "export" src/orchestration/agents/prompts/index.ts`

### Issue: Export Pipeline Fails

**Symptom**: `ghostwire export --target copilot` fails with error

**Solution**:
1. Check that `src/execution/commands/templates/` still exists
2. Check that `src/execution/commands/prompts/` still exists
3. Run with verbose logging: `ghostwire export --target copilot --verbose`
4. Check `src/cli/export.ts` for any hardcoded paths

### Issue: Tests Fail After Migration

**Symptom**: `bun test` fails with import errors

**Solution**:
1. Run `bun run typecheck` to identify type errors
2. Check for any test files that import from old locations
3. Update test imports to use new paths
4. Run tests again: `bun test`

### Issue: Type Errors After Migration

**Symptom**: `bun run typecheck` reports errors

**Solution**:
1. Check the error message for the file and line number
2. Verify the import path is correct
3. Verify the symbol is exported from the new location
4. Check for any type mismatches

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/execution/commands/templates/` | Command template implementations |
| `src/execution/commands/prompts/` | Command-specific prompts |
| `src/orchestration/agents/prompts/` | Agent-specific prompts (NEW) |
| `src/orchestration/agents/constants.ts` | Agent ID definitions |
| `src/execution/commands/profiles.ts` | Profile definitions (updated) |
| `src/cli/export.ts` | Export pipeline |
| `src/script/build-agents-manifest.ts` | Manifest generation |
| `.github/prompts/` | Exported prompt artifacts |

---

## Related Documentation

- **Spec**: `/specs/002-consolidate-commands-structure/spec.md`
- **Plan**: `/specs/002-consolidate-commands-structure/plan.md`
- **Research**: `/specs/002-consolidate-commands-structure/research.md`
- **Data Model**: `/specs/002-consolidate-commands-structure/data-model.md`
- **Export Documentation**: `docs/export.md`
- **Agent Documentation**: `AGENTS.md`

---

## Questions?

If you have questions about the reorganization:

1. Check the **Spec** for requirements and acceptance criteria
2. Check the **Plan** for implementation steps
3. Check the **Research** for technical details
4. Check the **Data Model** for entity relationships
5. Check this **Quickstart** for common tasks and troubleshooting

If you still have questions, refer to the related documentation or ask a maintainer.
