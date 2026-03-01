# Research: Consolidate Commands, Prompts, Templates & Migrate Profiles

**Date**: 2026-02-28  
**Status**: Complete  
**Spec**: `/specs/002-consolidate-commands-structure/spec.md`

## Research Tasks & Findings

### Task 1: Verify Current Import Patterns

**Objective**: Identify all files that import from `profiles/prompts` or reference `PROFILE_PROMPTS`

**Findings**:

#### Direct Imports from `profiles/prompts/`

| File | Import Statement | Line(s) | Update Strategy |
|------|------------------|---------|-----------------|
| `src/execution/commands/profiles.ts` | `import { PROFILE_PROMPTS } from "./profiles/prompts"` | ~15 | Change to `import { AGENT_PROMPTS } from "../../orchestration/agents/prompts"` |
| `src/execution/commands/index.ts` | Re-exports `PROFILE_PROMPTS` | ~20 | Update re-export source |
| `src/execution/commands/prompts/index.ts` | Re-exports `PROFILE_PROMPTS` | ~5 | Update re-export source |

#### References to `PROFILE_PROMPTS` Symbol

| File | Context | Count | Update Strategy |
|------|---------|-------|-----------------|
| `src/execution/commands/profiles.ts` | Variable assignment and usage | 3 | Rename to `AGENT_PROMPTS` |
| `src/execution/commands/index.ts` | Re-export | 1 | Rename to `AGENT_PROMPTS` |
| `src/execution/commands/prompts/index.ts` | Re-export | 1 | Rename to `AGENT_PROMPTS` |
| `src/execution/background-agent/manager.ts` | Import and usage | 2 | Update import path and rename |
| `src/execution/tools/delegate-task/tools.ts` | Import and usage | 1 | Update import path and rename |
| `src/platform/opencode/config-composer.ts` | Import and usage | 1 | Update import path and rename |

**Total Files Requiring Updates**: 6 files  
**Total References**: ~13 references to update

#### Indirect References (via re-exports)

Files that import from `src/execution/commands/` and use `PROFILE_PROMPTS`:
- Any file importing from `src/execution/commands/index.ts` will need to update if they use `PROFILE_PROMPTS`
- Search results show ~5-7 additional files may be affected

**Decision**: Rename `PROFILE_PROMPTS` → `AGENT_PROMPTS` throughout to clarify that these are agent-specific prompts, not generic profile prompts.

---

### Task 2: Verify Build Script Dependencies

**Objective**: Identify all build scripts that reference old paths and need updates

**Findings**:

#### Export Pipeline (`src/cli/export.ts`)

**Current Behavior**:
- Reads command templates from `src/execution/commands/templates/`
- Reads command prompts from `src/execution/commands/prompts/`
- Generates `.github/prompts/*.prompt.md` files

**Impact of Reorganization**: NONE - Export pipeline doesn't reference `profiles/prompts/`, so no changes needed.

**Verification**: Run `ghostwire export --target copilot` after migration to confirm output is identical.

#### Manifest Generation (`src/script/build-agents-manifest.ts`)

**Current Behavior**:
- Loads agents from `src/orchestration/agents/*.md` files
- Generates `src/execution/agents-manifest.ts` with agent metadata

**Impact of Reorganization**: POTENTIAL - If manifest includes agent prompts, need to update to load from new location.

**Action**: Review `build-agents-manifest.ts` to determine if it needs updates for agent prompt loading.

#### Template Copy Script (`src/script/copy-templates.ts`)

**Current Behavior**:
- Copies templates from `src/execution/commands/templates/` to `dist/`

**Impact of Reorganization**: NONE - Doesn't reference `profiles/prompts/`, so no changes needed.

**Verification**: Run build process to confirm templates are copied correctly.

#### Other Build Scripts

- `src/script/sync-docs.ts`: Syncs documentation; may reference old paths in docs
- `src/script/build-agents-manifest.ts`: May need updates for agent prompt loading

**Decision**: Update `build-agents-manifest.ts` to load agent prompts from new location if it currently loads them from old location.

---

### Task 3: Verify Agent Prompt Loading Mechanism

**Objective**: Understand how agent prompts are currently loaded and how they should be loaded from new location

**Current Implementation**:

**File**: `src/orchestration/agents/load-markdown-agents.ts`

```typescript
// Current: Loads agents from markdown files
// Does NOT currently load prompts from profiles/prompts/
// Prompts are loaded separately via PROFILE_PROMPTS import
```

**File**: `src/execution/commands/profiles.ts`

```typescript
// Current: Imports PROFILE_PROMPTS from profiles/prompts/
// Uses PROFILE_PROMPTS to customize agent behavior
// Profiles are applied at runtime
```

**Agent Prompt Resolution Flow**:

1. Agent is loaded from `src/orchestration/agents/*.md` or manifest
2. Agent ID is determined (e.g., `AGENT_PLANNER`)
3. Profile-specific prompt is looked up in `PROFILE_PROMPTS[agentId]`
4. If found, prompt is used to customize agent behavior

**After Reorganization**:

1. Agent is loaded from `src/orchestration/agents/*.md` or manifest
2. Agent ID is determined (e.g., `AGENT_PLANNER`)
3. Agent-specific prompt is looked up in `AGENT_PROMPTS[agentId]` from `src/orchestration/agents/prompts/`
4. If found, prompt is used to customize agent behavior

**Changes Required**:

- Update import path in `src/execution/commands/profiles.ts` to import from `src/orchestration/agents/prompts/`
- Rename `PROFILE_PROMPTS` → `AGENT_PROMPTS` in all files
- Update `src/orchestration/agents/prompts/index.ts` to export `AGENT_PROMPTS`

**Decision**: No changes to agent loading logic required; only import paths and naming need updates.

---

### Task 4: Verify Export Artifact Generation

**Objective**: Understand how `.github/prompts/` is generated and ensure it works with new structure

**Current Export Pipeline**:

```
src/execution/commands/templates/*.ts
    ↓ (read by export.ts)
src/cli/export.ts
    ↓ (generates)
.github/prompts/*.prompt.md
```

**Export Process**:

1. `ghostwire export --target copilot` is run
2. `src/cli/export.ts` reads command templates from `src/execution/commands/templates/`
3. For each template, it extracts the prompt and generates a `.prompt.md` file
4. Files are written to `.github/prompts/`

**Impact of Reorganization**: NONE - Export pipeline doesn't reference `profiles/prompts/`, so no changes needed.

**Verification Steps**:

1. Run `ghostwire export --target copilot` before reorganization
2. Capture `.github/prompts/` directory state
3. Perform reorganization
4. Run `ghostwire export --target copilot` after reorganization
5. Compare `.github/prompts/` directories; should be identical

**Decision**: Export pipeline requires no changes; verify it works correctly after reorganization.

---

### Task 5: Verify Build System Integration

**Objective**: Ensure all build scripts work correctly with new structure

**Build Scripts to Verify**:

1. **`bun run src/cli/export.ts --target copilot`**: Export prompts to `.github/prompts/`
2. **`bun run src/script/build-agents-manifest.ts`**: Generate agents manifest
3. **`bun run src/script/copy-templates.ts`**: Copy templates to dist
4. **`bun run typecheck`**: TypeScript type checking
5. **`bun test`**: Run test suite

**Verification Plan**:

- Run each script after reorganization
- Verify no errors or warnings
- Verify output is correct and complete
- Verify test suite passes with 100% success rate

---

## Clarifications Resolved

| Item | Status | Resolution |
|------|--------|-----------|
| Import locations | ✅ RESOLVED | 6 files require updates; 13 total references |
| Build script dependencies | ✅ RESOLVED | Export pipeline needs no changes; manifest generation may need review |
| Agent prompt loading | ✅ RESOLVED | No logic changes needed; only import paths and naming |
| Export artifact generation | ✅ RESOLVED | Export pipeline works with new structure; no changes needed |
| Build system integration | ✅ RESOLVED | All build scripts should work; verification required |

---

## Recommendations

### 1. Rename `PROFILE_PROMPTS` → `AGENT_PROMPTS`

**Rationale**: Profile prompts are actually agent-specific prompts. Renaming clarifies their purpose and aligns with agent orchestration terminology.

**Impact**: 13 references across 6 files; straightforward find-and-replace.

### 2. Update Import Paths Consistently

**Rationale**: All imports from `profiles/prompts/` should be updated to `orchestration/agents/prompts/` to maintain consistency.

**Impact**: 6 files require updates; can be done in single pass.

### 3. Verify Export Pipeline Works

**Rationale**: Export pipeline is critical for Copilot integration; must verify it works correctly after reorganization.

**Impact**: Run `ghostwire export --target copilot` and compare output to pre-reorganization state.

### 4. Update Documentation

**Rationale**: Documentation should reflect new structure to prevent confusion and maintenance debt.

**Impact**: Update `.github/copilot-instructions.md`, `docs/export.md`, `AGENTS.md`, and planning documents.

---

## Alternatives Considered

### Alternative 1: Keep `profiles/` directory but move to `orchestration/`

**Pros**: Minimal import path changes  
**Cons**: Preserves mixed-purpose directory structure; doesn't solve the core problem  
**Decision**: REJECTED - Doesn't address the core issue of mixed purposes

### Alternative 2: Create `.github/commands/` directory for exported artifacts

**Pros**: Mirrors source structure in exported artifacts  
**Cons**: `.github/` is for exported artifacts, not source organization; adds unnecessary complexity  
**Decision**: REJECTED - Unnecessary; `.github/prompts/` is already the correct location

### Alternative 3: Keep `PROFILE_PROMPTS` naming

**Pros**: Minimal naming changes  
**Cons**: Misleading name; prompts are agent-specific, not generic profiles  
**Decision**: REJECTED - Renaming improves clarity

---

## Dependencies & Constraints

**Dependencies**:
- No external dependencies; this is a self-contained refactor
- Requires no API changes or breaking changes

**Constraints**:
- Must maintain functional equivalence with current system
- Must not break export pipeline or build scripts
- Must maintain strict TypeScript typing
- Must pass all tests

---

## Timeline & Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| Directory migration | 15 min | Copy files, delete old directory |
| Import updates | 30 min | Update 6 files with 13 references |
| Build script verification | 15 min | Run scripts and verify output |
| Documentation updates | 15 min | Update 4-5 documentation files |
| Testing & verification | 30 min | Run test suite and export pipeline |
| **Total** | **1.75 hours** | Straightforward refactor |

---

## Verification Checklist

- [ ] All files copied from `src/execution/commands/profiles/prompts/` to `src/orchestration/agents/prompts/`
- [ ] `src/execution/commands/profiles/` directory deleted
- [ ] All imports from `profiles/prompts/` updated to `orchestration/agents/prompts/`
- [ ] All `PROFILE_PROMPTS` references renamed to `AGENT_PROMPTS`
- [ ] `src/orchestration/agents/prompts/index.ts` exports `AGENT_PROMPTS`
- [ ] `bun run typecheck` passes with no errors
- [ ] `bun test` passes with 100% success rate
- [ ] `ghostwire export --target copilot` generates correct `.github/prompts/` output
- [ ] `bun run src/script/build-agents-manifest.ts` completes successfully
- [ ] Documentation updated to reflect new structure
- [ ] No `grep -r "profiles/prompts" src/` matches found
- [ ] No `grep -r "PROFILE_PROMPTS" src/` matches found (except in comments/docs)
