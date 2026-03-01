# Feature Specification: Consolidate Commands, Prompts, Templates & Migrate Profiles

**Feature Branch**: `002-consolidate-commands-structure`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User observation: "commands has multiple commands, prompts, and templates. This is wrong. We should merge commands, prompts, and templates into the `commands` directory. We should migrate `profiles/prompts` to `orchestration/agents`"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified commands directory structure (Priority: P1)

As a maintainer, I can reason about the commands directory structure without confusion about mixed purposes, so I can quickly locate command templates, prompts, and related artifacts.

**Why this priority**: Current structure has prompts and templates scattered across `src/execution/commands/prompts/`, `src/execution/commands/templates/`, and `src/execution/commands/profiles/prompts/`, creating ambiguity about what belongs where.

**Independent Test**: Can be fully tested by verifying directory structure is clean with only `templates/` and `prompts/` subdirectories under `src/execution/commands/`, and no `profiles/` directory remains.

**Acceptance Scenarios**:

1. **Given** the commands directory, **When** a developer navigates it, **Then** they find only `templates/` and `prompts/` subdirectories with clear purpose.
2. **Given** a command template file, **When** searching for its associated prompt, **Then** they find it in `src/execution/commands/prompts/` with consistent naming.
3. **Given** the export pipeline, **When** it generates `.github/prompts/`, **Then** the source structure is clearly traceable to `src/execution/commands/`.

---

### User Story 2 - Agent-aligned profile prompts (Priority: P1)

As a maintainer, I can locate profile-specific prompts alongside their agent definitions, so agent customization logic is co-located with agent orchestration.

**Why this priority**: Profile prompts are currently in `src/execution/commands/profiles/prompts/`, separated from agent definitions in `src/orchestration/agents/`, creating a split mental model.

**Independent Test**: Can be fully tested by verifying all profile prompts are migrated to `src/orchestration/agents/prompts/` and agent loading logic correctly resolves agent-specific prompts.

**Acceptance Scenarios**:

1. **Given** an agent definition in `src/orchestration/agents/`, **When** looking for its custom prompt, **Then** it's located in `src/orchestration/agents/prompts/` with matching agent ID.
2. **Given** the agent loading system, **When** it initializes an agent, **Then** it correctly loads the agent-specific prompt from the new location.
3. **Given** profile-specific customizations, **When** agents are instantiated, **Then** the customizations still apply correctly.

---

### User Story 3 - Consistent import paths throughout codebase (Priority: P2)

As a developer, I can update code that references commands, prompts, or profiles without encountering broken imports or stale references.

**Why this priority**: Import paths must be updated consistently across ~40+ files to maintain runtime behavior and prevent silent failures.

**Independent Test**: Can be fully tested by running `grep` searches for old import paths and verifying zero matches, and running the full test suite with no import errors.

**Acceptance Scenarios**:

1. **Given** the codebase, **When** searching for imports from `profiles/prompts`, **Then** zero matches are found.
2. **Given** the codebase, **When** searching for `PROFILE_PROMPTS`, **Then** all references are updated to `AGENT_PROMPTS`.
3. **Given** the test suite, **When** running `bun test`, **Then** all tests pass with no import errors.

---

### User Story 4 - Functional export pipeline (Priority: P2)

As a user, I can run `ghostwire export --target copilot` and the `.github/prompts/` directory is correctly generated from the reorganized source structure.

**Why this priority**: The export pipeline is critical for Copilot integration and must continue working after reorganization.

**Independent Test**: Can be fully tested by running the export command and verifying `.github/prompts/` contains all expected prompt files with correct content.

**Acceptance Scenarios**:

1. **Given** the reorganized source structure, **When** running `ghostwire export --target copilot`, **Then** `.github/prompts/` is generated with all command prompts.
2. **Given** the export output, **When** comparing to pre-reorganization output, **Then** the content is semantically identical.
3. **Given** the build pipeline, **When** running `bun run src/script/build-agents-manifest.ts`, **Then** the manifest includes agent prompts from the new location.

---

## Scope & Constraints

**In Scope**:
- Move `src/execution/commands/profiles/prompts/` → `src/orchestration/agents/prompts/`
- Delete `src/execution/commands/profiles/` directory
- Update all imports throughout codebase (~40+ files)
- Update build scripts: `export.ts`, `build-agents-manifest.ts`, `copy-templates.ts`
- Update documentation: `.github/copilot-instructions.md`, `docs/export.md`, `AGENTS.md`
- Rename `PROFILE_PROMPTS` → `AGENT_PROMPTS` throughout codebase
- Verify export pipeline generates correct artifacts
- Run full test suite to verify no regressions

**Out of Scope**:
- Creating `.github/commands/` directory (artifacts stay in `.github/prompts/`)
- Changing command template structure or naming
- Modifying agent orchestration logic beyond prompt loading
- Refactoring profile concept beyond consolidation (profiles are eliminated, not redesigned)

**Constraints**:
- No breaking changes to runtime behavior
- Export pipeline must produce identical artifacts (semantically)
- All imports must be updated consistently
- Build scripts must continue working
- Test suite must pass with 100% success rate
- No `any` or `unknown` types introduced
- Strict TypeScript typing maintained

---

## Success Criteria

1. ✅ Directory structure is clean: `src/execution/commands/` contains only `templates/` and `prompts/` subdirectories
2. ✅ No `src/execution/commands/profiles/` directory exists
3. ✅ All profile prompts are in `src/orchestration/agents/prompts/`
4. ✅ Zero matches for `profiles/prompts` imports in codebase
5. ✅ All `PROFILE_PROMPTS` references renamed to `AGENT_PROMPTS`
6. ✅ `bun test` passes with 100% success rate
7. ✅ `ghostwire export --target copilot` generates correct `.github/prompts/` output
8. ✅ `bun run src/script/build-agents-manifest.ts` completes successfully
9. ✅ Documentation updated to reflect new structure
10. ✅ No TypeScript errors or lint violations

---

## Related Issues & Context

- **Related to**: Simplify Agent Framework (001-simplify-agent-framework)
- **Motivation**: Eliminate mixed purposes in directory structure to improve maintainability
- **Impact**: Affects import paths, build scripts, and documentation
- **Risk Level**: Medium (broad refactor scope, but well-defined changes)
- **Rollback Plan**: Revert commits in reverse order; no data migration required
