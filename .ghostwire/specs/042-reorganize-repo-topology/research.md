---
title: Research Findings - Repo Topology Reorganization
date: 2026-02-19
phase: 0
---

# Research Findings: Repo Topology Reorganization

## Unknowns Resolved

### 1. Import Mapping Strategy

**Question**: How should we systematically update ~500 import paths without manual errors?

**Decision**: Create reusable `scripts/update-imports.sh` bash script using `find` + `sed` patterns

**Rationale**: 
- Systematic approach reduces manual errors
- Script can be reused for each phase
- Changes logged for review
- Easily reversible with `git diff`

**Alternatives Considered**:
- Manual grep+replace: Too error-prone, easy to miss edge cases
- AST-based rewriting (ts-morph): Over-engineered for simple string updates
- IDE refactor tools: Not reproducible in CI/batch context

**Implementation**:
```bash
#!/usr/bin/env bash
# scripts/update-imports.sh <old-path> <new-path> <target-dir>
# Example: ./scripts/update-imports.sh "src/agents" "src/orchestration/agents" "src"

OLD_PATH=$1
NEW_PATH=$2
TARGET_DIR=$3

find "$TARGET_DIR" -name "*.ts" -o -name "*.tsx" | while read file; do
  # Update absolute imports: from "src/agents/..." -> from "src/orchestration/agents/..."
  sed -i '' "s|from ['\"]${OLD_PATH}/|from '${NEW_PATH}/|g" "$file"
  # Update relative imports (more complex, needs path calculation)
  # ... (implementation in actual script)
done
```

---

### 2. Git History Preservation

**Question**: Does `git mv` preserve full history through directory moves, or do we need special handling?

**Decision**: Use `git mv src/agents/ src/orchestration/agents/` for all moves. Git preserves history by default for directory moves.

**Rationale**:
- `git mv` is the standard git way to move files/directories
- Preserves commit history (git blame still shows original commits)
- No special -M% tracking needed (git detects renames automatically)
- Clean history for `git log --follow`

**Alternatives Considered**:
- Manual `rm` + `add`: Loses history (git sees delete + new file)
- `git mv` with `-M60%`: Unnecessary (default detection is 50%, sufficient for directories)
- `cp` + `git add`: Duplicates code, loses history

**Verification**: Tested locally - `git log --follow` correctly tracks files through directory moves

---

### 3. Domain Layering Model

**Question**: What's the clearest way to conceptually describe the 5 domains?

**Decision**: Responsibility-based layering:
- **Orchestration** = What orchestrates (agents + hooks)
- **Execution** = What executes (features + tools)
- **Integration** = What integrates (shared + mcp)
- **Platform** = What provides foundation (config)
- **CLI** = User interface (unchanged)

**Rationale**:
- Mirrors common software architecture (presentation, business, data, infrastructure)
- Each domain has a single responsibility
- Easy to explain: "Find orchestration code in orchestration/ domain"
- Matches OpenCode's conceptual model (agents orchestrate → features execute)

**Alternatives Considered**:
- Feature-based domains (email, auth, etc.): Doesn't fit monorepo plugin architecture
- Layer-based (frontend, backend): Not applicable for CLI tool
- Type-based (current): Problem we're solving

**Benefits**:
- Developers understand intent immediately from directory name
- Reduces "where do I add X?" confusion
- Supports future modular compilation (each domain could be separate build)

---

### 4. Barrel Export Pattern

**Question**: Should each domain have an index.ts barrel file?

**Decision**: Yes. Each domain needs `index.ts` exporting from subdirectories.

**Rationale**:
- Aligns with existing convention (AGENTS.md: "Barrel pattern via index.ts")
- Provides single entry point for domain (e.g., `import { Orchestrator } from '../orchestration'`)
- Simplifies root imports (use `/orchestration`, not `/orchestration/agents` or `/orchestration/hooks`)
- Enables future tree-shaking and dead code elimination

**Example**:
```typescript
// src/orchestration/index.ts
export * from './agents/index.js'
export * from './hooks/index.js'
```

**Alternatives Considered**:
- No barrel files: Requires specific imports like `from '../orchestration/agents/foo'` (verbose)
- Single root barrel only: Doesn't encapsulate domain internals

---

### 5. Metadata File Updates

**Question**: Which metadata files need updates and in what format?

**Decision**: Update all 4 YAML files (agents.yml, hooks.yml, tools.yml, features.yml) to reflect new paths

**Current Format**:
```yaml
# agents.yml
agents:
  - name: "zen-planner"
    file: "src/orchestration/agents/zen-planner.ts"
    purpose: "Planning & task decomposition"
```

**New Format**:
```yaml
# agents.yml
agents:
  - name: "zen-planner"
    file: "src/orchestration/agents/zen-planner.ts"
    purpose: "Planning & task decomposition"
```

**Rationale**:
- AGENTS.md: "Agent metadata lives in agents.yml" (single source of truth)
- Tools/scripts may depend on these paths
- Documents new structure for future contributors

---

### 6. Validation Strategy Per Phase

**Question**: What's the minimal validation needed after each phase?

**Decision**: Three validation gates (in order):
1. `bun run typecheck` (catches import errors immediately)
2. `bun run build` (ensures ESM output is valid)
3. `bun test` (spot-check: at least one test from moved files)

**Rationale**:
- Typecheck is fastest (syntax/import errors)
- Build validates ESM output + d.ts generation
- Tests confirm no runtime regressions
- Together = confidence that phase is solid

**Alternatives Considered**:
- Just `bun test`: Too slow (unnecessary for import-only changes)
- Just `bun run build`: Might miss import errors not caught by TypeScript
- Complex dependency analysis: Over-complicated

**Timing**: Full `bun test` suite runs once (Phase 5), not after every phase

---

### 7. Rollback Strategy

**Question**: If a phase fails, how quickly can we rollback?

**Decision**: One commit per domain = one `git reset --soft HEAD~1` to rollback

**Rationale**:
- Small, focused commits are easier to revert
- If Phase 2 fails, Phase 1 is already safe (separate commit)
- `git reset --soft` preserves code changes (allows re-attempt)
- Clear commit messages help identify which phase failed

**Alternative**: Try to fix forward (usually faster than rollback + re-do)

---

## Best Practices Research

### TypeScript/ESM Module Reorganization

Researched patterns from successful TypeScript monorepos (Angular, NestJS, Nx):

1. **Use relative imports within same domain** (e.g., orchestration/ refers to sibling hooks/)
2. **Use absolute imports across domains** (e.g., orchestration → integration via `from '../../integration'`)
3. **Centralize cross-domain imports in index.ts** (barrel files)
4. **Avoid circular dependencies** (orchestration → execution → integration, never backwards)

### Build System (Bun) Considerations

- Bun's `bun build` respects directory structure automatically
- ESM output preserves directory nesting (no "flattening")
- Type declarations (d.ts) generated per original structure
- No config changes needed (bun.json unchanged)

---

## Phase 0 Checklist

- [x] Import mapping strategy decided (bash script)
- [x] Git mv verified to preserve history
- [x] Domain layering model defined (5 layers)
- [x] Barrel export pattern confirmed
- [x] Metadata file updates documented
- [x] Validation gates specified (typecheck, build, test)
- [x] Rollback strategy established
- [x] Best practices researched

## Ready for Phase 1

All unknowns resolved. Ready to proceed with:
1. Create `scripts/update-imports.sh`
2. Begin Phase 1: Move orchestration domain
3. Validate with typecheck → build → tests
