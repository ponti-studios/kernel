---
title: Domain Data Model - Repo Topology Reorganization
date: 2026-02-19
phase: 1
---

# Domain Data Model: Repo Topology Reorganization

## Domain Entities

### 1. Orchestration Domain

**Purpose**: Controls execution flow and lifecycle coordination

- **Components**:
- **agents/** - AI agent implementations (43 files)
-   - Purpose: Implement autonomous reasoning and task orchestration
-   - Examples: zen-planner, coordinator, delegator
-   - Interface: Factory functions returning agent instances
  
- **hooks/** - Lifecycle orchestration (41 directories)
  - Purpose: Intercept and control plugin lifecycle events
  - Examples: pre-tool-use, post-execution, nexus-orchestrator
  - Interface: `createXXXHook()` factory functions

**Relationships**:
- Agents call hooks (e.g., agents call pre-execution hooks)
- Hooks may invoke agents (e.g., orchestrator hook schedules background agents)
- Bidirectional dependency allowed within domain

**Export Contract**:
```typescript
// src/orchestration/index.ts
export * from './agents/index.js'
export * from './hooks/index.js'
```

---

### 2. Execution Domain

**Purpose**: Implements actual functionality and tool execution

**Components**:
- **features/** - Built-in functionality (21 directories)
  - Purpose: Provide extensible features (skills, commands, background agents)
  - Examples: builtin-skills/, builtin-commands/, background-agent/
  - Interface: Feature registration via plugin config
  
- **tools/** - Task execution tools (17 directories)
  - Purpose: Implement delegatable actions (code analysis, file ops, etc.)
  - Examples: delegate-task/, grep-app/, ast-grep/
  - Interface: `createXXXTool()` factory functions returning Tool[]

**Relationships**:
- Features use tools (e.g., background-agent uses tools to work)
- Tools may use features (e.g., code analysis tools may use search features)
- Bidirectional dependency allowed within domain

**Export Contract**:
```typescript
// src/execution/index.ts
export * from './features/index.js'
export * from './tools/index.js'
```

---

### 3. Integration Domain

**Purpose**: Connects systems and provides cross-cutting utilities

**Components**:
- **shared/** - Cross-cutting utilities (43 files)
  - Purpose: Provide utilities used across orchestration + execution
  - Examples: error handling, logging, type utilities, constants
  - Interface: Pure functions, classes, types
  
- **mcp/** - Model Context Protocol (6 files)
  - Purpose: Integrate with external systems via MCP
  - Examples: websearch (Exa), context7 (docs), grep_app (GitHub)
  - Interface: MCP server configurations

**Relationships**:
- Used by orchestration domain (e.g., logging, error handling)
- Used by execution domain (e.g., utilities for tools, type helpers)
- MCP extends external system access
- No dependencies on orchestration or execution (purely connective)

**Export Contract**:
```typescript
// src/integration/index.ts
export * from './shared/index.js'
export * from './mcp/index.js'
```

---

### 4. Platform Domain

**Purpose**: Provides foundation and system configuration

**Components**:
- **config/** - Configuration schema (4 files)
  - Purpose: Define plugin configuration structure and defaults
  - Examples: Zod schema, TypeScript types, config loading
  - Interface: Config types and validation functions

**Relationships**:
- Used by CLI, orchestration, execution during initialization
- No dependencies on other domains

**Export Contract**:
```typescript
// src/platform/index.ts
export * from './config/index.js'
```

---

### 5. CLI Domain (Unchanged)

**Purpose**: User interface for OpenCode plugin installation and management

**Components**:
- Command-line tools for installation, configuration, doctoring
- No change to structure or exports
- Stays at src/cli/ (not reorganized)

---

## Entity Relationships & Dependencies

```
┌─────────────────────────────────────────────────────┐
│                      CLI                            │
│  (User interface - unchanged)                       │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│                 ORCHESTRATION                        │
│  (Controls: agents + hooks)                          │
│  - Defines task flow                                │
│  - Controls lifecycle                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ agents/ + hooks/                            │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
             │
             ▼ (orchestrates)
┌──────────────────────────────────────────────────────┐
│                    EXECUTION                         │
│  (Does work: features + tools)                       │
│  - Implements functionality                         │
│  - Executes actions                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ features/ + tools/                          │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
        ▲       │
        │       │ (use)
        │       ▼
┌──────────────────────────────────────────────────────┐
│                  INTEGRATION                         │
│  (Connects: shared + mcp)                            │
│  - Provides utilities                               │
│  - Integrates external systems                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ shared/ + mcp/                              │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
        ▲
        │ (uses)
        │
┌──────────────────────────────────────────────────────┐
│                  PLATFORM                            │
│  (Foundation: config)                                │
│  - Configuration schema                             │
│  - Type definitions                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ config/                                     │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Import Patterns After Reorganization

### Absolute Imports (Recommended)

```typescript
// Within orchestration domain (e.g., orchestration/hooks/foo.ts)
import { Agent } from '../agents/index.js'        // Sibling within domain
import { AgentTypes } from '../../integration'    // Cross-domain (absolute path)

// Within execution domain (e.g., execution/features/bar.ts)
import { Tool } from '../tools/index.js'          // Sibling within domain
import { Logger } from '../../integration/shared' // Cross-domain

// Root entry point (src/index.ts)
import * as Orchestration from './orchestration/index.js'
import * as Execution from './execution/index.js'
import * as Integration from './integration/index.js'
import * as Platform from './platform/index.js'
import * as CLI from './cli/index.js'
```

### Import Path Changes (Phase by Phase)

**Phase 1 (Orchestration)**:
```
BEFORE: import { Foo } from 'src/agents/foo'
AFTER:  import { Foo } from 'src/orchestration/agents/foo'

BEFORE: import { Bar } from 'src/hooks/bar'
AFTER:  import { Bar } from 'src/orchestration/hooks/bar'
```

**Phase 2 (Execution)**:
```
BEFORE: import { Feature } from 'src/features/bar'
AFTER:  import { Feature } from 'src/execution/features/bar'

BEFORE: import { Tool } from 'src/tools/baz'
AFTER:  import { Tool } from 'src/execution/tools/baz'
```

**Phase 3 (Integration)**:
```
BEFORE: import { Logger } from 'src/shared/logger'
AFTER:  import { Logger } from 'src/integration/shared/logger'

BEFORE: import { WebsearchMCP } from 'src/mcp/websearch'
AFTER:  import { WebsearchMCP } from 'src/integration/mcp/websearch'
```

**Phase 4 (Platform)**:
```
BEFORE: import { Config } from 'src/config/schema'
AFTER:  import { Config } from 'src/platform/config/schema'
```

---

## Circular Dependency Rules

**Allowed** (same domain):
- Orchestration → Orchestration (agents ↔ hooks bidirectional)
- Execution → Execution (features ↔ tools bidirectional)

**Allowed** (downward only):
- Orchestration → Execution (agents orchestrate features)
- Orchestration → Integration (agents use shared utilities)
- Orchestration → Platform (agents read config)
- Execution → Integration (features use shared utilities)
- Execution → Platform (tools read config)
- Integration → Platform (shared utilities use config)

**Forbidden** (upward):
- Execution → Orchestration (features must not call agents)
- Integration → Orchestration or Execution (shared utilities are independent)
- Platform → anything (config is foundational)

**Detection**: After Phase 1, run circular dependency checker:
```bash
# Tool: madge (circular dependency detector)
# npm install -g madge
madge --circular src/
```

---

## Validation Model

After each phase, validate:

1. **File moves succeeded** (git mv preserves files)
2. **Imports updated** (import-mapping script ran)
3. **No circular deps** (madge check)
4. **Types correct** (`bun run typecheck` passes)
5. **Build succeeds** (`bun run build` completes)
6. **Tests pass** (`bun test` runs without errors)

This ensures each domain reorganization is solid before moving to the next.
