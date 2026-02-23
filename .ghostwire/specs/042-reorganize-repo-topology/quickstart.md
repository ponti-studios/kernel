---
title: Quickstart & Test Scenarios
date: 2026-02-19
phase: 1
---

# Quickstart: Repo Topology Reorganization

## Quick Overview

This refactor reorganizes OpenCode plugin source directories from type-based (agents/, hooks/) to domain-based (orchestration/, execution/, integration/, platform/).

**Target**: 6 phases over 1-2 weeks, one domain per phase

## Phase-by-Phase Test Scenarios

### Phase 0: Preparation

**Test**: Does the import-mapping script work?

```bash
# Test the script on a single file
./scripts/update-imports.sh "src/agents" "src/orchestration/agents" "src/agents"

# Verify output
git diff src/agents/*.test.ts | head -20

# Expected: Imports changed from src/agents/ to src/orchestration/agents/
# Revert test
git restore src/
```

---

### Phase 1: Reorganize Orchestration Domain

**Test Scenario 1**: Directory moves preserve git history
```bash
# After moving src/agents → src/orchestration/agents
git log --oneline --follow src/orchestration/agents/zen-planner.ts | head -5

# Expected: Shows commit history from src/agents/zen-planner.ts
```

**Test Scenario 2**: TypeScript compiles without errors
```bash
bun run typecheck

# Expected: Exit code 0, no "error TS..." messages
# If fail: Check which files have import errors
# Fix: Run import-mapping script on those files
```

**Test Scenario 3**: Build succeeds and generates ESM + d.ts
```bash
bun run build

# Expected:
# ✓ dist/orchestration/agents/zen-planner.js (ESM)
# ✓ dist/orchestration/agents/zen-planner.d.ts (TypeScript)
# ✓ dist/orchestration/index.d.ts (barrel file)
```

**Test Scenario 4**: Existing tests pass
```bash
bun test src/orchestration/agents/*.test.ts

# Expected: All tests in orchestration/agents pass
# Run sampling of tests, not full suite yet (save time)
```

**Test Scenario 5**: Root imports work
```bash
# Test in REPL or temporary test file:
# import * as Orchestration from './src/orchestration/index.js'
# Expect: No import errors, can access agents and hooks

# Quick test:
cat > test-import.mjs << 'EOF'
import * as Orch from './dist/orchestration/index.js'
console.log(Object.keys(Orch))
EOF
node test-import.mjs
rm test-import.mjs

# Expected: Lists agent and hook exports
```

---

### Phase 2: Reorganize Execution Domain

**Test Scenario 1**: Cross-domain imports work (Orchestration → Execution)
```bash
# Example: Orchestrator hook calls execution tools
# src/orchestration/hooks/nexus-orchestrator.ts imports from src/execution/tools

bun run typecheck

# Expected: No "cannot find module" errors for execution/tools imports
```

**Test Scenario 2**: Barrel files export correctly
```typescript
// Test in temporary file:
import * as Execution from './src/execution/index.js'

// Expected exports:
// - Execution.Feature (from features)
// - Execution.Tool (from tools)
// - All skill/command definitions
```

**Test Scenario 3**: Build output maintains structure
```bash
bun run build

# Verify directory structure:
find dist/execution -name "*.js" | wc -l

# Expected: Same count as before (no files lost)
```

---

### Phase 3: Reorganize Integration Domain

**Test Scenario 1**: No circular dependencies detected
```bash
npx madge --circular dist/

# Expected: No "Circular dependency:" warnings
# If found: Check imports in shared/ and mcp/
```

**Test Scenario 2**: Shared utilities accessible to orchestration + execution
```typescript
// Test imports from different domains:

// src/orchestration/hooks/foo.ts
import { Logger } from '../../integration/shared/logger'

// src/execution/tools/bar.ts
import { Logger } from '../../integration/shared/logger'

// Both should work after Phase 3
```

---

### Phase 4: Reorganize Platform Domain

**Test Scenario 1**: Config schema still loads
```typescript
import { loadConfig } from './src/platform/config/loader'

const config = await loadConfig()
// Expected: Config object with all expected properties
```

**Test Scenario 2**: All domains can read config
```typescript
// src/orchestration/hooks/setup.ts
import { Config } from '../../platform/config'

// src/execution/features/background-agent/manager.ts
import { Config } from '../../../platform/config'

// Both should resolve without errors
```

---

### Phase 5: Documentation & Full Test Suite

**Test Scenario 1**: All 100+ tests pass
```bash
bun test

# Expected: All tests pass
# If failures: Likely import path issues in test files
# Fix: Re-run import-mapping script on .test.ts files
```

**Test Scenario 2**: AGENTS.md structure reflects new layout
```bash
# Check that AGENTS.md documents:
# - src/orchestration/ (was src/agents + src/hooks)
# - src/execution/ (was src/features + src/tools)
# - src/integration/ (was src/shared + src/mcp)
# - src/platform/ (was src/config)

grep -A 10 "## STRUCTURE" docs/AGENTS.md
# Expected: New structure documented
```

**Test Scenario 3**: YAML files updated
```bash
# Check that agents.yml paths use new locations:
grep "src/orchestration" agents.yml

# Expected: All agent file paths include src/orchestration/agents/
```

---

### Phase 6: Create & Merge PR

**Test Scenario 1**: GitHub Actions CI passes
```bash
# Push to branch 042-reorganize-repo-topology
# Create PR to dev branch
# GitHub Actions runs:

# Expected CI checks:
# ✓ bun run typecheck
# ✓ bun run build
# ✓ bun test
# ✓ Lint (if configured)
```

**Test Scenario 2**: Code review confirms structure
```bash
# Review PR comments:
# - New directory structure is clearer
# - Import patterns are consistent
# - No regressions in functionality
# - Documentation updated

# Expected: Approval to merge
```

---

## Rollback Test Scenarios

**If Phase N fails**:

```bash
# Quick rollback (preserves staged code, allows re-attempt)
git reset --soft HEAD~1

# Full rollback (discards all changes in phase)
git reset --hard HEAD~1
```

**Example**: Phase 2 fails due to missed imports
```bash
# Roll back Phase 2
git reset --hard HEAD~1  # Undo "refactor: reorganize execution domain"

# Now at end of Phase 1 (orchestration successfully moved)

# Fix imports and try again
# Re-run import-mapping script on execution files with correct paths
# Recommit Phase 2
```

---

## Success Criteria Checklist

- [ ] Phase 0: Import-mapping script created and tested
- [ ] Phase 1: Orchestration domain moved, all tests pass
- [ ] Phase 2: Execution domain moved, cross-domain imports work
- [ ] Phase 3: Integration domain moved, no circular deps
- [ ] Phase 4: Platform domain moved, config loads correctly
- [ ] Phase 5: Full test suite passes, docs updated
- [ ] Phase 6: PR created, CI passes, merged to `dev`

**Final Validation**:
```bash
# After merge to dev, verify:
bun run build       # Build succeeds
bun test            # All tests pass
bun run typecheck   # No type errors

# On fresh clone:
git clone repo && cd repo
git checkout dev
bun install && bun run build

# Expected: Build succeeds, repo is usable
```
