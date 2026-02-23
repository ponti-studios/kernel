# Configuration-Driven Model Architecture

**Status**: ✅ COMPLETED
**Created**: 2026-02-23
**Author**: planner
**Priority**: high
**Estimated Effort**: 3-4 days

---

## Executive Summary

This plan transforms model definitions from hardcoded source files to user-controlled configuration files. The architecture establishes a clear configuration hierarchy with sensible defaults, enabling users to override model assignments at multiple levels (agent, category, system) without modifying source code.

**Key Deliverable**: Users can configure all model assignments in `~/.config/opencode/ghostwire.json` (global) or `.opencode/ghostwire.json` (project), with intelligent defaults set during installation.

---

## Current State Analysis

### Existing Architecture

The current system has model definitions scattered across multiple files:

| File | Purpose | Problem |
|------|---------|---------|
| `src/orchestration/agents/model-requirements.ts` | `AGENT_MODEL_REQUIREMENTS` with fallback chains | Hardcoded, requires code changes |
| `src/execution/tools/delegate-task/constants.ts` | `DEFAULT_CATEGORIES` with model assignments | Duplicates definitions |
| `docs/agents.yml` | Documentation + source of truth | Mixed concerns |
| `src/platform/config/schema.ts` | Validation schema | Already supports config, underutilized |
| `src/orchestration/agents/model-resolver.ts` | Runtime resolution | Good 5-step cascade, but reads from hardcoded sources |

### Current Resolution Flow
```
UI Selection → Config Override → Category Default → Fallback Chain → System Default
```

**Problem**: Steps 3-5 read from hardcoded TypeScript files, not configuration.

---

## Target Architecture

### Configuration Hierarchy (Priority Order)

```
1. Project config (.opencode/ghostwire.json) - agent-specific overrides
         ↓
2. Project config - category defaults
         ↓
3. Global config (~/.config/opencode/ghostwire.json) - agent-specific
         ↓
4. Global config - category defaults
         ↓
5. Built-in fallback (opencode/kimi-k2.5)
```

### Configuration Schema

```json
{
  "models": {
    "defaults": {
      "agent": "opencode/kimi-k2.5",
      "category": "opencode/kimi-k2.5"
    },
    "agents": {
      "operator": "opencode/kimi-k2.5",
      "planner": "opencode/kimi-k2.5",
      "analyzer-media": "google/gemini-3-flash",
      "advisor-plan": "openai/gpt-5.3"
    },
    "categories": {
      "ultrabrain": { "model": "opencode/kimi-k2.5", "variant": "max" },
      "deep": { "model": "opencode/kimi-k2.5", "variant": "medium" },
      "quick": { "model": "opencode/kimi-k2.5" }
    }
  }
}
```

### Design Principles

1. **Configuration over Code**: All model definitions in JSON, not TypeScript
2. **Partial Override**: Users can override one agent without touching others
3. **Sensible Defaults**: Fresh install gets working defaults automatically
4. **Backward Compatibility**: Old config patterns continue working with deprecation warnings
5. **Provider Format**: Models use `provider/model-id` format (e.g., `opencode/kimi-k2.5`)

---

## Files Overview

### New Files (3)

| File | Purpose |
|------|---------|
| `src/platform/config/model-config.ts` | Types, schema, constants for model configuration |
| `src/platform/config/model-config-resolver.ts` | Runtime resolution logic reading from config files |
| `src/cli/commands/sync-models.ts` | Dev command to sync/update global settings |

### Modified Files (6)

| File | Changes |
|------|---------|
| `src/platform/config/schema.ts` | Add `models` section to GhostwireConfigSchema |
| `src/cli/install.ts` | Write default models to global settings during install |
| `src/orchestration/agents/model-resolver.ts` | Refactor to use config instead of hardcoded |
| `src/execution/tools/delegate-task/tools.ts` | Use new resolver for category models |
| `docs/agents.yml` | Convert to documentation-only (remove model source of truth) |
| `src/orchestration/agents/model-requirements.ts` | Deprecate with warnings |

### Deprecated Files (2)

| File | Action |
|------|--------|
| `src/orchestration/agents/model-requirements.ts` | Keep for backward compat, add deprecation warnings |
| `src/execution/tools/delegate-task/constants.ts` `DEFAULT_CATEGORIES` | Remove hardcoded models, keep prompts/descriptions |

---

## Phase 1: Configuration Infrastructure

### Task 1.1: Create model-config.ts

**File**: `src/platform/config/model-config.ts`

**Purpose**: Define types, Zod schema, and constants for model configuration.

```typescript
import { z } from "zod";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Built-in fallback when no config exists anywhere */
export const BUILTIN_FALLBACK_MODEL = "opencode/kimi-k2.5";

/** Valid agent IDs that can have model overrides */
export const CONFIGURABLE_AGENTS = [
  "operator",
  "executor",
  "planner",
  "orchestrator",
  "advisor-plan",
  "advisor-strategy",
  "validator-audit",
  "researcher-codebase",
  "researcher-data",
  "analyzer-media",
] as const;

/** Valid category names */
export const CONFIGURABLE_CATEGORIES = [
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "quick",
  "unspecified-low",
  "unspecified-high",
  "writing",
] as const;

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/** Model ID format: provider/model-name */
const ModelIdSchema = z
  .string()
  .regex(
    /^[a-z0-9-]+\/[a-z0-9-_.]+$/i,
    "Model ID must be in format: provider/model-name"
  );

/** Category model configuration with optional variant */
const CategoryModelConfigSchema = z.union([
  ModelIdSchema,
  z.object({
    model: ModelIdSchema,
    variant: z.enum(["max", "medium", "min"]).optional(),
  }),
]);

/** Default model settings */
const ModelDefaultsSchema = z.object({
  /** Default model for agents without specific config */
  agent: ModelIdSchema.default(BUILTIN_FALLBACK_MODEL),
  /** Default model for categories without specific config */
  category: ModelIdSchema.default(BUILTIN_FALLBACK_MODEL),
});

/** Per-agent model overrides */
const AgentModelsSchema = z.record(
  z.enum(CONFIGURABLE_AGENTS),
  ModelIdSchema
).optional();

/** Per-category model overrides */
const CategoryModelsSchema = z.record(
  z.enum(CONFIGURABLE_CATEGORIES),
  CategoryModelConfigSchema
).optional();

/** Root models configuration schema */
export const ModelsConfigSchema = z.object({
  /** Default model settings */
  defaults: ModelDefaultsSchema.optional(),
  /** Agent-specific model overrides */
  agents: AgentModelsSchema,
  /** Category-specific model overrides */
  categories: CategoryModelsSchema,
});

// =============================================================================
// TYPES
// =============================================================================

export type ModelId = z.infer<typeof ModelIdSchema>;
export type CategoryModelConfig = z.infer<typeof CategoryModelConfigSchema>;
export type ModelDefaults = z.infer<typeof ModelDefaultsSchema>;
export type AgentModels = z.infer<typeof AgentModelsSchema>;
export type CategoryModels = z.infer<typeof CategoryModelsSchema>;
export type ModelsConfig = z.infer<typeof ModelsConfigSchema>;

export type ConfigurableAgent = (typeof CONFIGURABLE_AGENTS)[number];
export type ConfigurableCategory = (typeof CONFIGURABLE_CATEGORIES)[number];

/** Result of model resolution */
export interface ModelResolutionResult {
  model: ModelId;
  variant?: "max" | "medium" | "min";
  source:
    | "project-agent"
    | "project-category"
    | "global-agent"
    | "global-category"
    | "project-default"
    | "global-default"
    | "builtin-fallback";
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/** Default configuration written during installation */
export const DEFAULT_MODELS_CONFIG: ModelsConfig = {
  defaults: {
    agent: "opencode/kimi-k2.5",
    category: "opencode/kimi-k2.5",
  },
  agents: {
    operator: "opencode/kimi-k2.5",
    executor: "opencode/kimi-k2.5",
    planner: "opencode/kimi-k2.5",
    orchestrator: "opencode/kimi-k2.5",
    "advisor-plan": "opencode/kimi-k2.5",
    "advisor-strategy": "opencode/kimi-k2.5",
    "validator-audit": "opencode/kimi-k2.5",
    "researcher-codebase": "opencode/kimi-k2.5",
    "researcher-data": "opencode/kimi-k2.5",
    "analyzer-media": "google/gemini-3-flash",
  },
  categories: {
    ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
    deep: { model: "opencode/kimi-k2.5", variant: "medium" },
    artistry: "opencode/kimi-k2.5",
    quick: "opencode/kimi-k2.5",
    "unspecified-low": "opencode/kimi-k2.5",
    "unspecified-high": { model: "opencode/kimi-k2.5", variant: "max" },
    writing: "opencode/kimi-k2.5",
    "visual-engineering": "opencode/kimi-k2.5",
  },
};
```

**Test File**: `src/platform/config/model-config.test.ts`

```typescript
import { describe, expect, it } from "bun:test";
import {
  ModelsConfigSchema,
  BUILTIN_FALLBACK_MODEL,
  DEFAULT_MODELS_CONFIG,
} from "./model-config";

describe("ModelsConfigSchema", () => {
  //#given valid model ID format
  it("validates provider/model format", () => {
    //#when parsing valid model ID
    const result = ModelsConfigSchema.safeParse({
      agents: { operator: "opencode/kimi-k2.5" },
    });
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given invalid model ID format
  it("rejects model without provider", () => {
    //#when parsing model without slash
    const result = ModelsConfigSchema.safeParse({
      agents: { operator: "kimi-k2.5" },
    });
    //#then fails with format error
    expect(result.success).toBe(false);
  });

  //#given category with variant
  it("validates category with variant object", () => {
    //#when parsing category with variant
    const result = ModelsConfigSchema.safeParse({
      categories: {
        ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
      },
    });
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given category as string
  it("validates category as simple string", () => {
    //#when parsing category as string
    const result = ModelsConfigSchema.safeParse({
      categories: { quick: "opencode/kimi-k2.5" },
    });
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given invalid agent name
  it("rejects unknown agent names", () => {
    //#when parsing with invalid agent
    const result = ModelsConfigSchema.safeParse({
      agents: { "unknown-agent": "opencode/kimi-k2.5" },
    });
    //#then fails
    expect(result.success).toBe(false);
  });
});

describe("DEFAULT_MODELS_CONFIG", () => {
  //#given default configuration
  it("validates against schema", () => {
    //#when parsing default config
    const result = ModelsConfigSchema.safeParse(DEFAULT_MODELS_CONFIG);
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given default config
  it("has all agents configured", () => {
    //#then all agents have models
    expect(DEFAULT_MODELS_CONFIG.agents?.operator).toBeDefined();
    expect(DEFAULT_MODELS_CONFIG.agents?.["analyzer-media"]).toBe(
      "google/gemini-3-flash"
    );
  });
});

describe("BUILTIN_FALLBACK_MODEL", () => {
  //#given builtin fallback
  it("is opencode/kimi-k2.5", () => {
    //#then matches expected value
    expect(BUILTIN_FALLBACK_MODEL).toBe("opencode/kimi-k2.5");
  });
});
```

---

### Task 1.2: Create model-config-resolver.ts

**File**: `src/platform/config/model-config-resolver.ts`

**Purpose**: Runtime resolution logic that reads from configuration files.

```typescript
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import {
  ModelsConfigSchema,
  type ModelsConfig,
  type ModelResolutionResult,
  type ConfigurableAgent,
  type ConfigurableCategory,
  BUILTIN_FALLBACK_MODEL,
} from "./model-config";

// =============================================================================
// CONFIG FILE PATHS
// =============================================================================

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "ghostwire.json"
);

const PROJECT_CONFIG_PATH = join(
  process.cwd(),
  ".opencode",
  "ghostwire.json"
);

// =============================================================================
// CONFIG LOADING
// =============================================================================

interface LoadedConfig {
  config: ModelsConfig | null;
  path: string;
  exists: boolean;
}

function loadConfigFile(path: string): LoadedConfig {
  if (!existsSync(path)) {
    return { config: null, path, exists: false };
  }

  try {
    const content = readFileSync(path, "utf-8");
    const parsed = JSON.parse(content);
    const models = parsed.models ?? {};
    const result = ModelsConfigSchema.safeParse(models);

    if (result.success) {
      return { config: result.data, path, exists: true };
    }

    console.warn(`[model-config] Invalid config at ${path}:`, result.error.message);
    return { config: null, path, exists: true };
  } catch (error) {
    console.warn(`[model-config] Failed to load ${path}:`, error);
    return { config: null, path, exists: true };
  }
}

// Cache loaded configs to avoid repeated file reads
let projectConfigCache: LoadedConfig | null = null;
let globalConfigCache: LoadedConfig | null = null;

export function clearConfigCache(): void {
  projectConfigCache = null;
  globalConfigCache = null;
}

function getProjectConfig(): LoadedConfig {
  if (!projectConfigCache) {
    projectConfigCache = loadConfigFile(PROJECT_CONFIG_PATH);
  }
  return projectConfigCache;
}

function getGlobalConfig(): LoadedConfig {
  if (!globalConfigCache) {
    globalConfigCache = loadConfigFile(GLOBAL_CONFIG_PATH);
  }
  return globalConfigCache;
}

// =============================================================================
// MODEL RESOLUTION
// =============================================================================

/**
 * Resolve model for a specific agent using the configuration hierarchy.
 *
 * Priority:
 * 1. Project config - agent-specific
 * 2. Project config - default agent model
 * 3. Global config - agent-specific
 * 4. Global config - default agent model
 * 5. Built-in fallback
 */
export function resolveAgentModel(
  agentId: ConfigurableAgent
): ModelResolutionResult {
  const project = getProjectConfig();
  const global = getGlobalConfig();

  // 1. Project agent-specific
  const projectAgent = project.config?.agents?.[agentId];
  if (projectAgent) {
    return { model: projectAgent, source: "project-agent" };
  }

  // 2. Project default
  const projectDefault = project.config?.defaults?.agent;
  if (projectDefault) {
    return { model: projectDefault, source: "project-default" };
  }

  // 3. Global agent-specific
  const globalAgent = global.config?.agents?.[agentId];
  if (globalAgent) {
    return { model: globalAgent, source: "global-agent" };
  }

  // 4. Global default
  const globalDefault = global.config?.defaults?.agent;
  if (globalDefault) {
    return { model: globalDefault, source: "global-default" };
  }

  // 5. Built-in fallback
  return { model: BUILTIN_FALLBACK_MODEL, source: "builtin-fallback" };
}

/**
 * Resolve model for a specific category using the configuration hierarchy.
 *
 * Priority:
 * 1. Project config - category-specific
 * 2. Project config - default category model
 * 3. Global config - category-specific
 * 4. Global config - default category model
 * 5. Built-in fallback
 */
export function resolveCategoryModel(
  categoryId: ConfigurableCategory
): ModelResolutionResult {
  const project = getProjectConfig();
  const global = getGlobalConfig();

  // 1. Project category-specific
  const projectCategory = project.config?.categories?.[categoryId];
  if (projectCategory) {
    return normalizeCategoryConfig(projectCategory, "project-category");
  }

  // 2. Project default
  const projectDefault = project.config?.defaults?.category;
  if (projectDefault) {
    return { model: projectDefault, source: "project-default" };
  }

  // 3. Global category-specific
  const globalCategory = global.config?.categories?.[categoryId];
  if (globalCategory) {
    return normalizeCategoryConfig(globalCategory, "global-category");
  }

  // 4. Global default
  const globalDefault = global.config?.defaults?.category;
  if (globalDefault) {
    return { model: globalDefault, source: "global-default" };
  }

  // 5. Built-in fallback
  return { model: BUILTIN_FALLBACK_MODEL, source: "builtin-fallback" };
}

function normalizeCategoryConfig(
  config: string | { model: string; variant?: "max" | "medium" | "min" },
  source: ModelResolutionResult["source"]
): ModelResolutionResult {
  if (typeof config === "string") {
    return { model: config, source };
  }
  return { model: config.model, variant: config.variant, source };
}

// =============================================================================
// DIAGNOSTICS
// =============================================================================

export interface ConfigDiagnostics {
  projectConfig: {
    path: string;
    exists: boolean;
    valid: boolean;
    agentCount: number;
    categoryCount: number;
  };
  globalConfig: {
    path: string;
    exists: boolean;
    valid: boolean;
    agentCount: number;
    categoryCount: number;
  };
  effectiveDefaults: {
    agent: string;
    category: string;
  };
}

export function getConfigDiagnostics(): ConfigDiagnostics {
  const project = getProjectConfig();
  const global = getGlobalConfig();

  return {
    projectConfig: {
      path: PROJECT_CONFIG_PATH,
      exists: project.exists,
      valid: project.config !== null,
      agentCount: Object.keys(project.config?.agents ?? {}).length,
      categoryCount: Object.keys(project.config?.categories ?? {}).length,
    },
    globalConfig: {
      path: GLOBAL_CONFIG_PATH,
      exists: global.exists,
      valid: global.config !== null,
      agentCount: Object.keys(global.config?.agents ?? {}).length,
      categoryCount: Object.keys(global.config?.categories ?? {}).length,
    },
    effectiveDefaults: {
      agent:
        project.config?.defaults?.agent ??
        global.config?.defaults?.agent ??
        BUILTIN_FALLBACK_MODEL,
      category:
        project.config?.defaults?.category ??
        global.config?.defaults?.category ??
        BUILTIN_FALLBACK_MODEL,
    },
  };
}
```

**Test File**: `src/platform/config/model-config-resolver.test.ts`

```typescript
import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import {
  resolveAgentModel,
  resolveCategoryModel,
  clearConfigCache,
  getConfigDiagnostics,
} from "./model-config-resolver";
import { BUILTIN_FALLBACK_MODEL } from "./model-config";

// Note: Tests should mock fs.readFileSync and fs.existsSync
// to test different configuration scenarios

describe("resolveAgentModel", () => {
  beforeEach(() => {
    clearConfigCache();
  });

  //#given no config files exist
  it("returns builtin fallback when no config", () => {
    // Mock: no files exist
    //#when resolving agent model
    const result = resolveAgentModel("operator");
    //#then returns builtin fallback
    expect(result.model).toBe(BUILTIN_FALLBACK_MODEL);
    expect(result.source).toBe("builtin-fallback");
  });

  // Additional tests would mock file system to test:
  // - Project config agent-specific override
  // - Global config agent-specific override
  // - Project default fallback
  // - Global default fallback
  // - Priority order (project > global > builtin)
});

describe("resolveCategoryModel", () => {
  beforeEach(() => {
    clearConfigCache();
  });

  //#given no config files exist
  it("returns builtin fallback when no config", () => {
    //#when resolving category model
    const result = resolveCategoryModel("ultrabrain");
    //#then returns builtin fallback
    expect(result.model).toBe(BUILTIN_FALLBACK_MODEL);
    expect(result.source).toBe("builtin-fallback");
  });

  //#given category with variant
  it("extracts variant from category config", () => {
    // Mock: config with variant
    // { categories: { ultrabrain: { model: "x/y", variant: "max" } } }
    //#when resolving category
    //#then includes variant in result
  });
});

describe("getConfigDiagnostics", () => {
  beforeEach(() => {
    clearConfigCache();
  });

  //#given no config files
  it("reports no configs exist", () => {
    //#when getting diagnostics
    const diag = getConfigDiagnostics();
    //#then shows correct state
    expect(diag.effectiveDefaults.agent).toBe(BUILTIN_FALLBACK_MODEL);
  });
});
```

---

### Task 1.3: Update main schema.ts

**File**: `src/platform/config/schema.ts`

**Changes**: Add `models` section to `GhostwireConfigSchema`.

**Before** (around line 585-612):
```typescript
export const GhostwireConfigSchema = z.object({
  agents: AgentOverridesSchema.optional(),
  categories: CategoriesConfigSchema.optional(),
  // ... other fields
  default_model: z.string().optional(),
});
```

**After**:
```typescript
import { ModelsConfigSchema } from "./model-config";

export const GhostwireConfigSchema = z.object({
  // NEW: Centralized model configuration
  models: ModelsConfigSchema.optional(),
  
  // DEPRECATED: These remain for backward compatibility
  agents: AgentOverridesSchema.optional(),
  categories: CategoriesConfigSchema.optional(),
  default_model: z.string().optional().describe("@deprecated Use models.defaults.agent"),
});
```

**Add deprecation helper** (new export):
```typescript
/**
 * Check for deprecated config patterns and log warnings.
 */
export function checkDeprecatedConfig(config: GhostwireConfig): void {
  if (config.default_model) {
    console.warn(
      "[ghostwire] DEPRECATED: 'default_model' is deprecated. " +
      "Use 'models.defaults.agent' instead."
    );
  }
  
  // Check for agents with direct model assignments
  if (config.agents) {
    for (const [agentId, agentConfig] of Object.entries(config.agents)) {
      if (agentConfig.model) {
        console.warn(
          `[ghostwire] DEPRECATED: 'agents.${agentId}.model' is deprecated. ` +
          `Use 'models.agents.${agentId}' instead.`
        );
      }
    }
  }
}
```

---

## Phase 2: Installation & Sync

### Task 2.1: Update installer to write default models

**File**: `src/cli/install.ts`

**Changes**: Write default models configuration to global settings during installation.

**Add import**:
```typescript
import { DEFAULT_MODELS_CONFIG } from "../platform/config/model-config";
```

**Add new function** (around line 600):
```typescript
/**
 * Write default model configuration to global settings.
 * Only writes if models section doesn't exist.
 */
async function writeDefaultModelsConfig(): Promise<void> {
  const globalConfigPath = join(
    homedir(),
    ".config",
    "opencode",
    "ghostwire.json"
  );

  let existingConfig: Record<string, unknown> = {};

  // Read existing config if present
  if (existsSync(globalConfigPath)) {
    try {
      const content = readFileSync(globalConfigPath, "utf-8");
      existingConfig = JSON.parse(content);
    } catch {
      // If can't parse, start fresh
    }
  }

  // Only add models section if not present
  if (!existingConfig.models) {
    existingConfig.models = DEFAULT_MODELS_CONFIG;
    
    // Ensure directory exists
    const configDir = dirname(globalConfigPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    // Write config
    writeFileSync(
      globalConfigPath,
      JSON.stringify(existingConfig, null, 2),
      "utf-8"
    );
    
    console.log(`[ghostwire] Wrote default model configuration to ${globalConfigPath}`);
  }
}
```

**Update install flow** (in main install function):
```typescript
export async function install(): Promise<void> {
  // ... existing installation steps ...
  
  // NEW: Write default models configuration
  await writeDefaultModelsConfig();
  
  // ... rest of installation ...
}
```

---

### Task 2.2: Create sync-models.ts CLI command

**File**: `src/cli/commands/sync-models.ts`

**Purpose**: Developer command to sync/update global model settings.

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import {
  DEFAULT_MODELS_CONFIG,
  ModelsConfigSchema,
  type ModelsConfig,
} from "../../platform/config/model-config";
import {
  getConfigDiagnostics,
  clearConfigCache,
} from "../../platform/config/model-config-resolver";

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "ghostwire.json"
);

interface SyncOptions {
  /** Force overwrite existing models config */
  force?: boolean;
  /** Show what would change without applying */
  dryRun?: boolean;
  /** Show current configuration */
  show?: boolean;
}

export async function syncModels(options: SyncOptions = {}): Promise<void> {
  clearConfigCache();

  // Show current config
  if (options.show) {
    return showCurrentConfig();
  }

  // Check current state
  const diag = getConfigDiagnostics();

  if (!options.dryRun) {
    console.log("\n[sync-models] Current state:");
    console.log(`  Global config: ${diag.globalConfig.exists ? "exists" : "not found"}`);
    if (diag.globalConfig.exists) {
      console.log(`    Agents configured: ${diag.globalConfig.agentCount}`);
      console.log(`    Categories configured: ${diag.globalConfig.categoryCount}`);
    }
  }

  // Load existing config
  let existingConfig: Record<string, unknown> = {};
  if (existsSync(GLOBAL_CONFIG_PATH)) {
    try {
      existingConfig = JSON.parse(readFileSync(GLOBAL_CONFIG_PATH, "utf-8"));
    } catch {
      console.warn("[sync-models] Could not parse existing config, starting fresh");
    }
  }

  // Check if models section exists
  const hasModels = !!existingConfig.models;

  if (hasModels && !options.force) {
    console.log("\n[sync-models] Models configuration already exists.");
    console.log("  Use --force to overwrite with defaults.");
    return;
  }

  if (options.dryRun) {
    console.log("\n[sync-models] DRY RUN - Would write:");
    console.log(JSON.stringify({ models: DEFAULT_MODELS_CONFIG }, null, 2));
    return;
  }

  // Merge with existing config
  const newConfig = {
    ...existingConfig,
    models: DEFAULT_MODELS_CONFIG,
  };

  // Ensure directory exists
  const configDir = dirname(GLOBAL_CONFIG_PATH);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Write
  writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(newConfig, null, 2), "utf-8");

  console.log(`\n[sync-models] Wrote default models to ${GLOBAL_CONFIG_PATH}`);
  console.log(`  Agents: ${Object.keys(DEFAULT_MODELS_CONFIG.agents ?? {}).length}`);
  console.log(`  Categories: ${Object.keys(DEFAULT_MODELS_CONFIG.categories ?? {}).length}`);
}

function showCurrentConfig(): void {
  const diag = getConfigDiagnostics();

  console.log("\n=== Model Configuration ===\n");

  console.log("Global Config:");
  console.log(`  Path: ${diag.globalConfig.path}`);
  console.log(`  Exists: ${diag.globalConfig.exists}`);
  console.log(`  Valid: ${diag.globalConfig.valid}`);
  console.log(`  Agents: ${diag.globalConfig.agentCount}`);
  console.log(`  Categories: ${diag.globalConfig.categoryCount}`);

  console.log("\nProject Config:");
  console.log(`  Path: ${diag.projectConfig.path}`);
  console.log(`  Exists: ${diag.projectConfig.exists}`);
  console.log(`  Valid: ${diag.projectConfig.valid}`);
  console.log(`  Agents: ${diag.projectConfig.agentCount}`);
  console.log(`  Categories: ${diag.projectConfig.categoryCount}`);

  console.log("\nEffective Defaults:");
  console.log(`  Agent: ${diag.effectiveDefaults.agent}`);
  console.log(`  Category: ${diag.effectiveDefaults.category}`);
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    force: args.includes("--force"),
    dryRun: args.includes("--dry-run"),
    show: args.includes("--show"),
  };
  syncModels(options);
}
```

**Register in CLI** (`src/cli/index.ts` or similar):
```typescript
import { syncModels } from "./commands/sync-models";

// In command registration
program
  .command("sync-models")
  .description("Sync default model configuration to global settings")
  .option("--force", "Force overwrite existing configuration")
  .option("--dry-run", "Show what would change without applying")
  .option("--show", "Show current configuration")
  .action(syncModels);
```

---

## Phase 3: Runtime Integration

### Task 3.1: Refactor model-resolver.ts

**File**: `src/orchestration/agents/model-resolver.ts`

**Goal**: Update to use config-based resolution instead of hardcoded `AGENT_MODEL_REQUIREMENTS`.

**Key Changes**:

1. Import new resolver:
```typescript
import {
  resolveAgentModel,
  resolveCategoryModel,
} from "../../platform/config/model-config-resolver";
import { BUILTIN_FALLBACK_MODEL } from "../../platform/config/model-config";
```

2. Update `resolveModelWithFallback()` function to check config first:
```typescript
export function resolveModelWithFallback(
  input: ExtendedModelResolutionInput,
  agentId?: string,
  categoryId?: string
): ModelResolutionResult {
  const { uiSelectedModel, userModel, availableModels, systemDefaultModel } = input;

  // 1. UI Selection (highest priority - user's live choice)
  if (uiSelectedModel && availableModels.has(uiSelectedModel)) {
    return { model: uiSelectedModel, source: "override", variant: undefined };
  }

  // 2. Config-based agent override
  if (agentId) {
    const configResult = resolveAgentModel(agentId as ConfigurableAgent);
    if (
      configResult.source !== "builtin-fallback" &&
      availableModels.has(configResult.model)
    ) {
      return {
        model: configResult.model,
        source: "override",
        variant: configResult.variant,
      };
    }
  }

  // 3. Config-based category default
  if (categoryId) {
    const configResult = resolveCategoryModel(categoryId as ConfigurableCategory);
    if (
      configResult.source !== "builtin-fallback" &&
      availableModels.has(configResult.model)
    ) {
      return {
        model: configResult.model,
        source: "category-default",
        variant: configResult.variant,
      };
    }
  }

  // 4. Legacy user model config (deprecated path)
  if (userModel && availableModels.has(userModel)) {
    console.warn(
      "[model-resolver] Using deprecated userModel config. Migrate to models.agents.*"
    );
    return { model: userModel, source: "override", variant: undefined };
  }

  // 5. Legacy fallback chain (deprecated - reads from AGENT_MODEL_REQUIREMENTS)
  // Keep for backward compatibility during migration
  const legacyResult = resolveLegacyFallbackChain(input, agentId);
  if (legacyResult) {
    return legacyResult;
  }

  // 6. System default / builtin fallback
  const finalModel = systemDefaultModel ?? BUILTIN_FALLBACK_MODEL;
  if (availableModels.has(finalModel)) {
    return { model: finalModel, source: "system-default", variant: undefined };
  }

  // 7. Last resort - first available model
  const firstAvailable = availableModels.values().next().value;
  if (firstAvailable) {
    return { model: firstAvailable, source: "system-default", variant: undefined };
  }

  return { model: BUILTIN_FALLBACK_MODEL, source: "system-default", variant: undefined };
}

/**
 * @deprecated This function reads from hardcoded AGENT_MODEL_REQUIREMENTS.
 * It will be removed in a future version once all users migrate to config-based models.
 */
function resolveLegacyFallbackChain(
  input: ExtendedModelResolutionInput,
  agentId?: string
): ModelResolutionResult | null {
  // ... existing fallback chain logic, wrapped with deprecation warning ...
  return null; // Return null to fall through to system default
}
```

3. Add deprecation notice to file header:
```typescript
/**
 * Model Resolution for Agents
 *
 * MIGRATION NOTICE:
 * This file is being migrated to configuration-driven model resolution.
 * The legacy AGENT_MODEL_REQUIREMENTS and CATEGORY_MODEL_REQUIREMENTS
 * are deprecated. Configure models in:
 *   - Global: ~/.config/opencode/ghostwire.json
 *   - Project: .opencode/ghostwire.json
 *
 * See docs/configuration/models.md for migration guide.
 */
```

---

### Task 3.2: Update delegate-task constants

**File**: `src/execution/tools/delegate-task/constants.ts`

**Goal**: Remove hardcoded model assignments from `DEFAULT_CATEGORIES`.

**Before** (lines 193-202):
```typescript
export const DEFAULT_CATEGORIES = {
  "visual-engineering": { model: "opencode/kimi-k2.5" },
  ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
  // ...
};
```

**After**:
```typescript
import { resolveCategoryModel } from "../../platform/config/model-config-resolver";
import type { ConfigurableCategory } from "../../platform/config/model-config";

/**
 * Get category configuration with model resolved from config.
 * Models are no longer hardcoded - they come from configuration files.
 */
export function getCategoryConfig(categoryId: ConfigurableCategory): {
  model: string;
  variant?: "max" | "medium" | "min";
} {
  const resolved = resolveCategoryModel(categoryId);
  return {
    model: resolved.model,
    variant: resolved.variant,
  };
}

/**
 * @deprecated Use getCategoryConfig() instead.
 * This constant is kept for backward compatibility only.
 */
export const DEFAULT_CATEGORIES = {
  // No longer contains model assignments - prompts/descriptions only
};
```

**Keep unchanged**:
- `CATEGORY_PROMPT_APPENDS` - these are behavioral, not model-related
- `CATEGORY_DESCRIPTIONS` - documentation
- `PLAN_AGENT_SYSTEM_PREPEND` - system prompts

---

### Task 3.3: Update delegate-task tools.ts

**File**: `src/execution/tools/delegate-task/tools.ts`

**Goal**: Use new `getCategoryConfig()` instead of hardcoded `DEFAULT_CATEGORIES`.

**Find and update** category model resolution (search for `DEFAULT_CATEGORIES`):

**Before**:
```typescript
const categoryConfig = DEFAULT_CATEGORIES[category];
const model = categoryConfig.model;
const variant = categoryConfig.variant;
```

**After**:
```typescript
import { getCategoryConfig } from "./constants";

// In delegate logic
const categoryConfig = getCategoryConfig(category);
const model = categoryConfig.model;
const variant = categoryConfig.variant;
```

---

## Phase 4: Documentation & Cleanup

### Task 4.1: Update agents.yml

**File**: `docs/agents.yml`

**Goal**: Convert to documentation-only. Remove model as source of truth.

**Add header**:
```yaml
# =============================================================================
# AGENTS METADATA (Documentation Only)
# =============================================================================
#
# This file is for DOCUMENTATION purposes only. It does NOT control runtime
# model assignments.
#
# To configure agent models, edit:
#   - Global: ~/.config/opencode/ghostwire.json
#   - Project: .opencode/ghostwire.json
#
# The "default_model" fields below show DEFAULT values that are written during
# installation. They are not read at runtime.
#
# Generated: 2026-02-23
# =============================================================================
```

**Update agent entries** (change `model:` to `default_model:`):
```yaml
agents:
  - id: operator
    display_name: operator
    default_model: opencode/kimi-k2.5  # Documentation only
    purpose: Main task execution and orchestration
    note: Configure via models.agents.operator in ghostwire.json
```

---

### Task 4.2: Deprecate model-requirements.ts

**File**: `src/orchestration/agents/model-requirements.ts`

**Goal**: Add deprecation warnings without breaking existing code.

**Add file header**:
```typescript
/**
 * @deprecated MIGRATION NOTICE
 *
 * This file is DEPRECATED as of v2.x. Model requirements are now configured
 * in JSON configuration files:
 *
 *   - Global: ~/.config/opencode/ghostwire.json
 *   - Project: .opencode/ghostwire.json
 *
 * This file is kept only for backward compatibility with legacy code paths.
 * It will be removed in v3.0.
 *
 * Migration guide: docs/configuration/models.md
 */

/** @deprecated Use configuration files instead */
export const AGENT_MODEL_REQUIREMENTS = { /* ... existing ... */ };

/** @deprecated Use configuration files instead */
export const CATEGORY_MODEL_REQUIREMENTS = { /* ... existing ... */ };
```

---

### Task 4.3: Create migration guide

**File**: `docs/configuration/models.md`

```markdown
# Model Configuration Guide

## Overview

Ghostwire uses a hierarchical configuration system for model assignments.
All model definitions are in JSON configuration files, not hardcoded in source.

## Configuration Hierarchy

Priority order (highest to lowest):

1. **Project config** (`.opencode/ghostwire.json`) - agent-specific
2. **Project config** - category defaults
3. **Global config** (`~/.config/opencode/ghostwire.json`) - agent-specific
4. **Global config** - category defaults
5. **Built-in fallback** (`opencode/kimi-k2.5`)

## Configuration Schema

```json
{
  "models": {
    "defaults": {
      "agent": "opencode/kimi-k2.5",
      "category": "opencode/kimi-k2.5"
    },
    "agents": {
      "operator": "opencode/kimi-k2.5",
      "analyzer-media": "google/gemini-3-flash"
    },
    "categories": {
      "ultrabrain": { "model": "opencode/kimi-k2.5", "variant": "max" },
      "quick": "opencode/kimi-k2.5"
    }
  }
}
```

## Examples

### Override a single agent

```json
{
  "models": {
    "agents": {
      "planner": "openai/gpt-5.3"
    }
  }
}
```

### Override a category

```json
{
  "models": {
    "categories": {
      "ultrabrain": { "model": "anthropic/claude-opus-5", "variant": "max" }
    }
  }
}
```

### Set global default

```json
{
  "models": {
    "defaults": {
      "agent": "openai/gpt-5.2"
    }
  }
}
```

## Migration from v1.x

If you have existing configuration using the old format:

### Old format (deprecated)

```json
{
  "agents": {
    "operator": {
      "model": "opencode/kimi-k2.5"
    }
  },
  "default_model": "opencode/kimi-k2.5"
}
```

### New format

```json
{
  "models": {
    "defaults": {
      "agent": "opencode/kimi-k2.5"
    },
    "agents": {
      "operator": "opencode/kimi-k2.5"
    }
  }
}
```

## CLI Commands

```bash
# Show current configuration
ghostwire sync-models --show

# Reset to defaults (force overwrite)
ghostwire sync-models --force

# Preview changes
ghostwire sync-models --dry-run
```

## Troubleshooting

### Model not being used

1. Check effective configuration:
   ```bash
   ghostwire sync-models --show
   ```

2. Verify model ID format: `provider/model-name`

3. Check if model is available in your OpenCode instance

### Configuration not loading

1. Ensure valid JSON syntax
2. Check file permissions
3. Verify path: `~/.config/opencode/ghostwire.json`
```

---

## Phase 5: Testing

### Task 5.1: Configuration resolution tests

**File**: `src/platform/config/model-config-resolver.test.ts` (expand existing)

**Test scenarios**:
1. No config files - returns builtin fallback
2. Global config only - uses global
3. Project config only - uses project
4. Both configs - project takes priority
5. Partial config - falls through hierarchy correctly
6. Invalid config - warns and falls back
7. Agent not in config - uses default
8. Category with variant - extracts variant correctly

### Task 5.2: Integration tests

**File**: `src/orchestration/agents/model-resolver.test.ts`

**Test scenarios**:
1. Agent model resolution with config
2. Category model resolution with config
3. UI selection overrides config
4. Deprecated config path warns but works
5. Available models filtering works correctly

### Task 5.3: Installer tests

**File**: `src/cli/install.test.ts`

**Test scenarios**:
1. Fresh install writes default models
2. Existing config not overwritten
3. Config directory created if missing

---

## Rollback Plan

### If issues arise during migration:

1. **Immediate rollback**: Revert commits, existing hardcoded paths still work
2. **Feature flag**: Add `GHOSTWIRE_LEGACY_MODELS=true` env var to force old path
3. **Config fallback**: If new config parsing fails, fall through to legacy

### Backward compatibility guarantees:

- Old `agents.*.model` config continues working (with deprecation warning)
- Old `default_model` config continues working (with deprecation warning)
- `AGENT_MODEL_REQUIREMENTS` remains available (deprecated)
- No breaking changes for existing users

---

## Implementation Order

| Order | Task | Depends On | Est. Time |
|-------|------|------------|-----------|
| 1 | Task 1.1: model-config.ts | None | 2h |
| 2 | Task 1.2: model-config-resolver.ts | 1.1 | 3h |
| 3 | Task 1.3: Update schema.ts | 1.1 | 1h |
| 4 | Task 2.1: Update installer | 1.1, 1.2 | 2h |
| 5 | Task 2.2: sync-models CLI | 1.1, 1.2 | 2h |
| 6 | Task 3.1: Refactor model-resolver.ts | 1.2 | 3h |
| 7 | Task 3.2: Update delegate-task constants | 1.2 | 1h |
| 8 | Task 3.3: Update delegate-task tools.ts | 3.2 | 1h |
| 9 | Task 4.1: Update agents.yml | None | 30m |
| 10 | Task 4.2: Deprecate model-requirements.ts | None | 30m |
| 11 | Task 4.3: Create migration guide | All | 1h |
| 12 | Task 5.1-5.3: Testing | All | 4h |

**Total estimated time**: 20-24 hours (3-4 days)

---

## Success Criteria

1. **Configuration works**: Models can be configured in JSON without code changes
2. **Hierarchy works**: Project overrides global overrides builtin
3. **Installation works**: Fresh install gets working defaults
4. **Backward compat**: Existing configs continue working with warnings
5. **Tests pass**: All 594+ existing tests + new tests pass
6. **Documentation**: Migration guide available

---

## TODOs

- [ ] Task 1.1: Create model-config.ts
- [ ] Task 1.2: Create model-config-resolver.ts
- [ ] Task 1.3: Update schema.ts
- [ ] Task 2.1: Update installer
- [ ] Task 2.2: Create sync-models CLI
- [ ] Task 3.1: Refactor model-resolver.ts
- [ ] Task 3.2: Update delegate-task constants
- [ ] Task 3.3: Update delegate-task tools.ts
- [ ] Task 4.1: Update agents.yml
- [ ] Task 4.2: Deprecate model-requirements.ts
- [ ] Task 4.3: Create migration guide
- [ ] Task 5.1: Configuration resolution tests
- [ ] Task 5.2: Integration tests
- [ ] Task 5.3: Installer tests
