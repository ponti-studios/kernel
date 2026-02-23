# Quickstart: Plugin to Builtin Migration

## Prerequisites

- Bun installed
- Ghostwire project at `src/`
- No pending changes in working directory

## Migration Steps

### Phase 1: Migrate Commands (21 files)

```bash
# 1. List commands to migrate
ls src/plugin/commands/*.md
ls src/plugin/commands/workflows/*.md

# 2. For each command:
#    a. Read the .md file
#    b. Extract YAML frontmatter and body
#    c. Create TypeScript template in builtin-commands/templates/
#    d. Register in commands.ts

# 3. Example conversion
# Input: src/plugin/commands/plan_review.md
# Output: src/execution/features/builtin-commands/templates/plan-review.ts

# 4. Register in commands.ts
# Add import and entry in BUILTIN_COMMAND_DEFINITIONS
```

### Phase 2: Migrate Skills (14 skills)

```bash
# 1. List skills to migrate
ls src/plugin/skills/

# 2. Move each skill directory
mv src/plugin/skills/file-todos src/execution/features/builtin-skills/

# 3. Update skills.ts import paths
# Change: import { FILE_TODOS_SKILL } from "../../../plugin/skills/file-todos"
# To: import { FILE_TODOS_SKILL } from "./file-todos/SKILL"
```

### Phase 3: Verify and Clean Up

```bash
# 1. Run tests
bun test

# 2. Type check
bun run typecheck

# 3. Remove empty directories
rmdir src/plugin/commands/workflows
rmdir src/plugin/commands
rmdir src/plugin/skills
```

## Commands Reference

After migration, commands are accessible without namespace:

| Before | After |
|--------|-------|
| `/ghostwire:plan_review` | `/plan_review` |
| `/ghostwire:changelog` | `/changelog` |
| `/ghostwire:triage` | `/triage` |

## Skills Reference

After migration, skills are available via skill loader:

```bash
# List available skills
# Skills now load from src/execution/features/builtin-skills/
```

## Rollback

If issues occur:

```bash
# Revert git changes
git checkout -- .

# Remove migrated files
rm src/execution/features/builtin-commands/templates/plan-review.ts
# ... remove other migrated files
```
