# Data Model: Consolidate Commands, Prompts, Templates & Migrate Profiles

**Date**: 2026-02-28  
**Spec**: `/specs/002-consolidate-commands-structure/spec.md`

## Entities

### CommandTemplate

**Purpose**: Represents a command template file in the source tree

**Fields**:
- `id: string` - Unique identifier (e.g., `code.review`, `workflows.plan`)
- `path: string` - File path relative to `src/execution/commands/templates/`
- `name: string` - Human-readable name
- `description: string` - What the command does
- `category: string` - Category (e.g., `spec`, `project`, `workflows`)
- `exports: Record<string, unknown>` - Exported symbols from template file

**Relationships**:
- 1:1 with optional CommandPrompt (via agent ID)
- N:1 with Category

**Validation Rules**:
- `id` must be unique within templates
- `path` must exist in `src/execution/commands/templates/`
- `name` must be non-empty
- `category` must be one of: `spec`, `project`, `workflows`, or other defined categories

**Example**:
```typescript
{
  id: "code.review",
  path: "code.review.ts",
  name: "Code Review",
  description: "Review code for quality, security, and best practices",
  category: "spec",
  exports: { PROMPT: "..." }
}
```

---

### CommandPrompt

**Purpose**: Represents a command-specific prompt in the source tree

**Fields**:
- `id: string` - Unique identifier (e.g., `advisor_architecture`, `reviewer_python`)
- `path: string` - File path relative to `src/execution/commands/prompts/`
- `agentId: string` - Associated agent ID (e.g., `AGENT_ADVISOR_ARCHITECTURE`)
- `content: string` - Prompt content
- `exportedAs: string` - Symbol name in index.ts (e.g., `ADVISOR_ARCHITECTURE_PROMPT`)

**Relationships**:
- 1:1 with optional CommandTemplate (via agent ID)
- 1:1 with AgentPrompt (same agent ID)

**Validation Rules**:
- `id` must be unique within command prompts
- `path` must exist in `src/execution/commands/prompts/`
- `agentId` must match an agent ID in `src/orchestration/agents/constants.ts`
- `content` must be non-empty
- `exportedAs` must be a valid TypeScript identifier

**Example**:
```typescript
{
  id: "advisor_architecture",
  path: "advisor_architecture.ts",
  agentId: "AGENT_ADVISOR_ARCHITECTURE",
  content: "You are an architecture advisor...",
  exportedAs: "ADVISOR_ARCHITECTURE_PROMPT"
}
```

---

### AgentPrompt

**Purpose**: Represents an agent-specific prompt in the orchestration layer

**Fields**:
- `agentId: string` - Unique agent identifier (e.g., `AGENT_PLANNER`)
- `path: string` - File path relative to `src/orchestration/agents/prompts/`
- `content: string` - Prompt content
- `customizations: Record<string, unknown>` - Agent-specific customizations
- `exportedAs: string` - Symbol name in index.ts (e.g., `AGENT_PROMPTS`)

**Relationships**:
- 1:1 with Agent definition (via agentId)
- 1:1 with optional CommandPrompt (same agent ID)

**Validation Rules**:
- `agentId` must match an agent ID in `src/orchestration/agents/constants.ts`
- `path` must exist in `src/orchestration/agents/prompts/`
- `content` must be non-empty
- `customizations` must be valid for the agent type

**Example**:
```typescript
{
  agentId: "AGENT_PLANNER",
  path: "agent_planner.ts",
  content: "You are a strategic planning consultant...",
  customizations: { toolRestrictions: [...] },
  exportedAs: "AGENT_PROMPTS"
}
```

---

### ImportReference

**Purpose**: Represents a file that imports from old or new locations

**Fields**:
- `filePath: string` - Absolute path to file
- `importPath: string` - Current import path
- `importedSymbol: string` - Symbol being imported (e.g., `PROFILE_PROMPTS`)
- `updateStrategy: string` - How to update the import
- `status: "pending" | "updated" | "verified"` - Update status

**Relationships**:
- N:1 with UpdateTask

**Validation Rules**:
- `filePath` must exist in repository
- `importPath` must be valid (either old or new location)
- `importedSymbol` must be a valid TypeScript identifier
- `status` must be one of: `pending`, `updated`, `verified`

**Example**:
```typescript
{
  filePath: "src/execution/commands/profiles.ts",
  importPath: "./profiles/prompts",
  importedSymbol: "PROFILE_PROMPTS",
  updateStrategy: "Change to import { AGENT_PROMPTS } from '../../orchestration/agents/prompts'",
  status: "pending"
}
```

---

### UpdateTask

**Purpose**: Represents a single update task during reorganization

**Fields**:
- `id: string` - Unique task identifier
- `type: string` - Type of update (e.g., `directory_move`, `import_update`, `rename_symbol`)
- `description: string` - Human-readable description
- `files: string[]` - Files affected by this task
- `status: "pending" | "in-progress" | "completed" | "failed"` - Task status
- `verification: string` - How to verify the task is complete

**Relationships**:
- 1:N with ImportReference
- 1:N with File

**Validation Rules**:
- `id` must be unique
- `type` must be one of: `directory_move`, `import_update`, `rename_symbol`, `build_script_update`, `documentation_update`
- `files` must not be empty
- `status` must be one of: `pending`, `in-progress`, `completed`, `failed`

**Example**:
```typescript
{
  id: "task-001",
  type: "directory_move",
  description: "Move profiles/prompts/ to orchestration/agents/prompts/",
  files: ["src/execution/commands/profiles/prompts/*"],
  status: "pending",
  verification: "ls -la src/orchestration/agents/prompts/ shows all files"
}
```

---

## State Transitions

### Directory Migration State Machine

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
│ - src/execution/commands/profiles/prompts/ EXISTS           │
│ - src/orchestration/agents/prompts/ DOES NOT EXIST          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Create new directory]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DIRECTORY CREATED STATE                                     │
│ - src/execution/commands/profiles/prompts/ EXISTS           │
│ - src/orchestration/agents/prompts/ EXISTS (empty)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Copy all files]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FILES COPIED STATE                                          │
│ - src/execution/commands/profiles/prompts/ EXISTS (original)│
│ - src/orchestration/agents/prompts/ EXISTS (with files)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Update imports]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ IMPORTS UPDATED STATE                                       │
│ - All files import from new location                        │
│ - No files import from old location                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Delete old directory]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FINAL STATE                                                 │
│ - src/execution/commands/profiles/prompts/ DELETED          │
│ - src/orchestration/agents/prompts/ EXISTS (with files)     │
│ - All imports point to new location                         │
└─────────────────────────────────────────────────────────────┘
```

### Import Reference State Machine

```
┌──────────────────────────────────────────┐
│ PENDING STATE                            │
│ - Import path: ./profiles/prompts        │
│ - Symbol: PROFILE_PROMPTS                │
│ - Status: pending                        │
└──────────────────────────────────────────┘
              ↓
      [Update import path]
              ↓
┌──────────────────────────────────────────┐
│ UPDATED STATE                            │
│ - Import path: ../../orchestration/...   │
│ - Symbol: AGENT_PROMPTS                  │
│ - Status: updated                        │
└──────────────────────────────────────────┘
              ↓
      [Verify import works]
              ↓
┌──────────────────────────────────────────┐
│ VERIFIED STATE                           │
│ - Import resolves correctly              │
│ - Symbol is used correctly               │
│ - Status: verified                       │
└──────────────────────────────────────────┘
```

---

## Relationships & Dependencies

### Directory Structure Relationships

```
src/execution/commands/
├── templates/
│   ├── *.ts (CommandTemplate files)
│   └── index.ts (exports CommandTemplate records)
├── prompts/
│   ├── *.ts (CommandPrompt files)
│   └── index.ts (exports CommandPrompt records)
└── profiles.ts (imports AGENT_PROMPTS from orchestration/agents/prompts)

src/orchestration/agents/
├── prompts/
│   ├── *.ts (AgentPrompt files - MIGRATED)
│   └── index.ts (exports AGENT_PROMPTS record)
├── constants.ts (defines agent IDs)
└── load-markdown-agents.ts (loads agents)
```

### Import Dependency Graph

```
src/execution/commands/profiles.ts
    ↓ imports
src/orchestration/agents/prompts/index.ts
    ↓ exports
AGENT_PROMPTS (Record<string, string>)

src/execution/commands/index.ts
    ↓ re-exports
AGENT_PROMPTS

src/execution/background-agent/manager.ts
    ↓ imports
AGENT_PROMPTS from src/execution/commands/

src/execution/tools/delegate-task/tools.ts
    ↓ imports
AGENT_PROMPTS from src/execution/commands/

src/platform/opencode/config-composer.ts
    ↓ imports
AGENT_PROMPTS from src/execution/commands/
```

---

## Validation Rules

### Directory Validation

1. **No duplicate directories**: `src/execution/commands/profiles/` must not exist after migration
2. **All files migrated**: All `.ts` files from `src/execution/commands/profiles/prompts/` must exist in `src/orchestration/agents/prompts/`
3. **Index file exists**: `src/orchestration/agents/prompts/index.ts` must export `AGENT_PROMPTS`

### Import Validation

1. **No old imports**: `grep -r "profiles/prompts" src/` must return 0 matches
2. **All symbols renamed**: `grep -r "PROFILE_PROMPTS" src/` must return 0 matches (except in comments/docs)
3. **All imports resolve**: TypeScript type checking must pass with no errors

### Functional Validation

1. **Export pipeline works**: `ghostwire export --target copilot` must generate `.github/prompts/` correctly
2. **Manifest generation works**: `bun run src/script/build-agents-manifest.ts` must complete successfully
3. **Tests pass**: `bun test` must pass with 100% success rate
4. **No type errors**: `bun run typecheck` must pass with no errors

---

## Constraints & Assumptions

### Constraints

- No breaking changes to runtime behavior
- Export pipeline must produce identical artifacts (semantically)
- All imports must be updated consistently
- Build scripts must continue working
- Test suite must pass with 100% success rate
- Strict TypeScript typing maintained

### Assumptions

- All profile prompts are agent-specific (not generic profiles)
- Agent IDs in `src/orchestration/agents/constants.ts` are the source of truth
- Import paths can be updated without affecting runtime behavior
- Build scripts don't have hidden dependencies on old paths
- Documentation can be updated independently of code changes

---

## Migration Checklist

- [ ] Create `src/orchestration/agents/prompts/` directory
- [ ] Copy all files from `src/execution/commands/profiles/prompts/` to `src/orchestration/agents/prompts/`
- [ ] Create/update `src/orchestration/agents/prompts/index.ts` to export `AGENT_PROMPTS`
- [ ] Update `src/execution/commands/profiles.ts` to import from new location
- [ ] Update `src/execution/commands/index.ts` to import from new location
- [ ] Update `src/execution/commands/prompts/index.ts` if needed
- [ ] Update all other files that import `PROFILE_PROMPTS`
- [ ] Rename all `PROFILE_PROMPTS` references to `AGENT_PROMPTS`
- [ ] Delete `src/execution/commands/profiles/` directory
- [ ] Run `bun run typecheck` and verify no errors
- [ ] Run `bun test` and verify all tests pass
- [ ] Run `ghostwire export --target copilot` and verify output
- [ ] Run `bun run src/script/build-agents-manifest.ts` and verify success
- [ ] Update documentation
- [ ] Verify no old import paths remain
