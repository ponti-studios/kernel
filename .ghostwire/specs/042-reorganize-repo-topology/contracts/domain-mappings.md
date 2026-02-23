# Domain Mapping Contracts

## Overview

This directory contains contract files defining the exact directory mappings and file movements for each reorganization phase.

## Phase 1: Orchestration Domain

### Agents Migration
```
Current Path                    → New Path
src/agents/                     → src/orchestration/agents/
src/agents/*.ts                 → src/orchestration/agents/*.ts
src/agents/**/*.ts              → src/orchestration/agents/**/*.ts
src/agents/**/*.test.ts          → src/orchestration/agents/**/*.test.ts
```

**Files Affected**: 43 files

- **Key Files**:
- `src/agents/zen-planner.ts` → `src/orchestration/agents/zen-planner.ts`
- `src/agents/coordinator.ts` → `src/orchestration/agents/coordinator.ts`
- (etc. for all 43 agent files)

### Hooks Migration
```
Current Path                    → New Path
src/hooks/                      → src/orchestration/hooks/
src/hooks/**/                   → src/orchestration/hooks/*/
src/hooks/**/*.ts               → src/orchestration/hooks/**/*.ts
```

**Files Affected**: 41 directories, ~200 files

**Key Directories**:
- `src/hooks/nexus-orchestrator/` → `src/orchestration/hooks/nexus-orchestrator/`
- `src/hooks/pre-tool-use/` → `src/orchestration/hooks/pre-tool-use/`
- (etc. for all hook directories)

### Metadata Updates
```
agents.yml:   Update all paths from "src/agents/" → "src/orchestration/agents/"
hooks.yml:    Update all paths from "src/hooks/" → "src/orchestration/hooks/"
```

### Root-Level Changes
```
src/index.ts:
  - Update: import * as agents from './agents/index.js'
          → import * as agents from './orchestration/agents/index.js'
  - Update: import { hookRegistry } from './hooks/registry'
          → import { hookRegistry } from './orchestration/hooks/registry'

src/plugin-config.ts: (if imports agents/hooks)
  - Update import paths similarly
```

### New Barrel File
```typescript
// src/orchestration/index.ts (NEW)
export * from './agents/index.js'
export * from './hooks/index.js'
```

---

## Phase 2: Execution Domain

### Features Migration
```
Current Path                    → New Path
src/features/                   → src/execution/features/
src/features/*/                 → src/execution/features/*/
src/features/**/*.ts            → src/execution/features/**/*.ts
```

**Files Affected**: 21 directories, ~150 files

**Key Directories**:
- `src/features/builtin-skills/` → `src/execution/features/builtin-skills/`
- `src/features/builtin-commands/` → `src/execution/features/builtin-commands/`
- `src/features/background-agent/` → `src/execution/features/background-agent/`

### Tools Migration
```
Current Path                    → New Path
src/tools/                      → src/execution/tools/
src/tools/*/                    → src/execution/tools/*/
src/tools/**/*.ts               → src/execution/tools/**/*.ts
```

**Files Affected**: 17 directories, ~200 files

**Key Directories**:
- `src/tools/delegate-task/` → `src/execution/tools/delegate-task/`
- `src/tools/grep-app/` → `src/execution/tools/grep-app/`
- `src/tools/ast-grep/` → `src/execution/tools/ast-grep/`

### Cross-Domain Imports (NEW)
Orchestration domain files now import from execution:
```typescript
// Example: src/orchestration/hooks/nexus-orchestrator/index.ts
import { executeTool } from '../../execution/tools/index.js'
```

### Metadata Updates
```
features.yml: Update all paths from "src/features/" → "src/execution/features/"
tools.yml:    Update all paths from "src/tools/" → "src/execution/tools/"
```

### Root-Level Changes
```
src/index.ts:
  - Update: import * as features from './features/index.js'
          → import * as features from './execution/features/index.js'
  - Update: import { createTool } from './tools/index'
          → import { createTool } from './execution/tools/index'
```

### New Barrel File
```typescript
// src/execution/index.ts (NEW)
export * from './features/index.js'
export * from './tools/index.js'
```

---

## Phase 3: Integration Domain

### Shared Migration
```
Current Path                    → New Path
src/shared/                     → src/integration/shared/
src/shared/*.ts                 → src/integration/shared/*.ts
src/shared/**/*.ts              → src/integration/shared/**/*.ts
```

**Files Affected**: 43 files

**Key Files**:
- `src/shared/logger.ts` → `src/integration/shared/logger.ts`
- `src/shared/errors.ts` → `src/integration/shared/errors.ts`
- (etc. for all 43 utility files)

### MCP Migration
```
Current Path                    → New Path
src/mcp/                        → src/integration/mcp/
src/mcp/*.ts                    → src/integration/mcp/*.ts
src/mcp/**/*.ts                 → src/integration/mcp/**/*.ts
```

**Files Affected**: 6 files

**Key Files**:
- `src/mcp/websearch.ts` → `src/integration/mcp/websearch.ts`
- `src/mcp/context7.ts` → `src/integration/mcp/context7.ts`

### Cross-Domain Imports (UPDATED)
All domains now reference integration correctly:
```typescript
// Orchestration imports:
import { Logger } from '../../integration/shared/logger'

// Execution imports:
import { validateInput } from '../../integration/shared/validation'

// Root imports:
import { Logger } from './integration/shared/logger'
```

### Root-Level Changes
```
src/index.ts:
  - Update: import { Logger } from './shared/logger'
          → import { Logger } from './integration/shared/logger'
  - Update: import { MCPServers } from './mcp/registry'
          → import { MCPServers } from './integration/mcp/registry'
```

### New Barrel File
```typescript
// src/integration/index.ts (NEW)
export * from './shared/index.js'
export * from './mcp/index.js'
```

---

## Phase 4: Platform Domain

### Config Migration
```
Current Path                    → New Path
src/config/                     → src/platform/config/
src/config/*.ts                 → src/platform/config/*.ts
src/config/**/*.ts              → src/platform/config/**/*.ts
```

**Files Affected**: 4 files

**Key Files**:
- `src/config/schema.ts` → `src/platform/config/schema.ts`
- `src/config/loader.ts` → `src/platform/config/loader.ts`

### Cross-Domain Imports (ALL UPDATED)
All domains reference config via platform:
```typescript
import { Config } from '../../platform/config/schema'
```

### Root-Level Changes
```
src/index.ts:
  - Update: import { loadConfig } from './config/loader'
          → import { loadConfig } from './platform/config/loader'

src/plugin-config.ts:
  - Update: import ConfigSchema from './config/schema'
          → import ConfigSchema from './platform/config/schema'
```

### New Barrel File
```typescript
// src/platform/index.ts (NEW)
export * from './config/index.js'
```

---

## Phase 5: Documentation Updates

### Files to Update
```
docs/AGENTS.md:
  - Update STRUCTURE section with new directory layout
  - Update WHERE TO LOOK table with new paths
  
agents.yml:  ✓ Updated in Phase 1
hooks.yml:   ✓ Updated in Phase 1
tools.yml:   ✓ Updated in Phase 2
features.yml: ✓ Updated in Phase 2

README.md or similar:
  - Any references to src/agents, src/hooks, etc.
```

---

## Import Mapping Summary

### Phase 1
- agents/ → orchestration/agents/
- hooks/ → orchestration/hooks/

### Phase 2
- features/ → execution/features/
- tools/ → execution/tools/
- Updates orchestration → execution references

### Phase 3
- shared/ → integration/shared/
- mcp/ → integration/mcp/
- Updates orchestration + execution → integration references

### Phase 4
- config/ → platform/config/
- Updates all domains → platform references

### Phase 5-6
- Documentation updates
- PR creation and merge
