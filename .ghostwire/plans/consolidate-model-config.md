# Work Plan: Consolidate Model Configuration into agents/categories Schema

**Status:** ✅ COMPLETED  
**Created:** 2026-02-23  
**Author:** planner  

---

## Summary

Remove the duplicate `models` section from ghostwire.json configuration and consolidate model settings into the existing `agents` and `categories` schema properties.

## Context

The ghostwire.json currently has 3 ways to set models:
1. `models.defaults.agent` - NEW (duplicate, remove)
2. `models.agents.operator` - NEW (duplicate, remove)
3. `agents.operator.model` - EXISTING (correct, keep)
4. `categories.ultrabrain.model` - EXISTING (correct, keep)

The `models` section was recently added but duplicates functionality already present in `AgentOverrideConfigSchema.model` and `CategoryConfigSchema.model`.

## Target State

**Single way to configure models:**
```json
{
  "agents": {
    "operator": { "model": "opencode/kimi-k2.5" },
    "planner": { "model": "opencode/kimi-k2.5" },
    "analyzer-media": { "model": "google/gemini-3-flash" }
  },
  "categories": {
    "ultrabrain": { "model": "opencode/kimi-k2.5", "variant": "max" },
    "deep": { "model": "opencode/kimi-k2.5", "variant": "medium" },
    "artistry": { "model": "opencode/kimi-k2.5" },
    "quick": { "model": "opencode/kimi-k2.5" },
    "unspecified-low": { "model": "opencode/kimi-k2.5" },
    "unspecified-high": { "model": "opencode/kimi-k2.5", "variant": "max" },
    "writing": { "model": "opencode/kimi-k2.5" },
    "visual-engineering": { "model": "opencode/kimi-k2.5" }
  }
}
```

---

## TODOs

### Phase 1: Remove models section from schema (schema.ts)

- [ ] **TODO-1.1**: Remove ModelsConfigSchema import from schema.ts
  - **File:** `src/platform/config/schema.ts`
  - **Action:** Delete line 3: `import { ModelsConfigSchema } from "./model-config";`

- [ ] **TODO-1.2**: Remove models field from GhostwireConfigSchema
  - **File:** `src/platform/config/schema.ts`
  - **Action:** Delete line 614: `models: ModelsConfigSchema.optional(),`

- [ ] **TODO-1.3**: Remove ModelsConfig type export from schema.ts
  - **File:** `src/platform/config/schema.ts`
  - **Action:** Delete line 618: `export type ModelsConfig = z.infer<typeof ModelsConfigSchema>;`

### Phase 2: Delete model-config files

- [ ] **TODO-2.1**: Delete model-config.ts
  - **File:** `src/platform/config/model-config.ts`
  - **Command:** `rm src/platform/config/model-config.ts`
  - **Verification:** File no longer exists

- [ ] **TODO-2.2**: Delete model-config.test.ts
  - **File:** `src/platform/config/model-config.test.ts`
  - **Command:** `rm src/platform/config/model-config.test.ts`
  - **Verification:** File no longer exists

- [ ] **TODO-2.3**: Delete model-config-resolver.ts
  - **File:** `src/platform/config/model-config-resolver.ts`
  - **Command:** `rm src/platform/config/model-config-resolver.ts`
  - **Verification:** File no longer exists

- [ ] **TODO-2.4**: Delete model-config-resolver.test.ts
  - **File:** `src/platform/config/model-config-resolver.test.ts`
  - **Command:** `rm src/platform/config/model-config-resolver.test.ts`
  - **Verification:** File no longer exists

### Phase 3: Update config-manager.ts

- [ ] **TODO-3.1**: Remove DEFAULT_MODELS_CONFIG import
  - **File:** `src/cli/config-manager.ts`
  - **Action:** Delete line 12: `import { DEFAULT_MODELS_CONFIG } from "../platform/config/model-config";`

- [ ] **TODO-3.2**: Create new DEFAULT_AGENT_MODEL_OVERRIDES constant
  - **File:** `src/cli/config-manager.ts`
  - **Action:** Add constant at top of file (after imports):
  ```typescript
  /** Default agent model configuration for installation */
  const DEFAULT_AGENT_MODEL_OVERRIDES = {
    operator: { model: "opencode/kimi-k2.5" },
    executor: { model: "opencode/kimi-k2.5" },
    planner: { model: "opencode/kimi-k2.5" },
    orchestrator: { model: "opencode/kimi-k2.5" },
    "advisor-plan": { model: "opencode/kimi-k2.5" },
    "advisor-strategy": { model: "opencode/kimi-k2.5" },
    "validator-audit": { model: "opencode/kimi-k2.5" },
    "researcher-codebase": { model: "opencode/kimi-k2.5" },
    "researcher-data": { model: "opencode/kimi-k2.5" },
    "analyzer-media": { model: "google/gemini-3-flash" },
  };
  ```

- [ ] **TODO-3.3**: Create new DEFAULT_CATEGORY_MODEL_OVERRIDES constant
  - **File:** `src/cli/config-manager.ts`
  - **Action:** Add constant after DEFAULT_AGENT_MODEL_OVERRIDES:
  ```typescript
  /** Default category model configuration for installation */
  const DEFAULT_CATEGORY_MODEL_OVERRIDES = {
    ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
    deep: { model: "opencode/kimi-k2.5", variant: "medium" },
    artistry: { model: "opencode/kimi-k2.5" },
    quick: { model: "opencode/kimi-k2.5" },
    "unspecified-low": { model: "opencode/kimi-k2.5" },
    "unspecified-high": { model: "opencode/kimi-k2.5", variant: "max" },
    writing: { model: "opencode/kimi-k2.5" },
    "visual-engineering": { model: "opencode/kimi-k2.5" },
  };
  ```

- [ ] **TODO-3.4**: Rewrite writeModelConfig() function
  - **File:** `src/cli/config-manager.ts`
  - **Lines:** 739-783
  - **Action:** Replace the function body to write to `agents` and `categories` instead of `models`:
  ```typescript
  export function writeModelConfig(): ConfigMergeResult {
    try {
      ensureConfigDir();
    } catch (err) {
      return {
        success: false,
        configPath: getConfigDir(),
        error: formatErrorWithSuggestion(err, "create config directory"),
      };
    }

    const omoConfigPath = getOmoConfig();

    try {
      let existingConfig: Record<string, unknown> = {};
      if (existsSync(omoConfigPath)) {
        try {
          const content = readFileSync(omoConfigPath, "utf-8");
          const parsed = parseJsonc<Record<string, unknown>>(content);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            existingConfig = parsed;
          }
        } catch {
          // Start fresh if parsing fails
        }
      }

      const newConfig = { ...existingConfig };

      // Write agents config if it doesn't already exist
      // This preserves user customizations on updates
      if (!newConfig.agents) {
        newConfig.agents = DEFAULT_AGENT_MODEL_OVERRIDES;
      }

      // Write categories config if it doesn't already exist
      // This preserves user customizations on updates
      if (!newConfig.categories) {
        newConfig.categories = DEFAULT_CATEGORY_MODEL_OVERRIDES;
      }

      writeFileSync(omoConfigPath, JSON.stringify(newConfig, null, 2) + "\n");
      return { success: true, configPath: omoConfigPath };
    } catch (err) {
      return {
        success: false,
        configPath: omoConfigPath,
        error: formatErrorWithSuggestion(err, "write model config"),
      };
    }
  }
  ```

### Phase 4: Verification

- [ ] **TODO-4.1**: Run typecheck
  - **Command:** `bun run typecheck`
  - **Expected:** No errors related to model-config imports

- [ ] **TODO-4.2**: Run tests
  - **Command:** `bun test`
  - **Expected:** All tests pass (minus deleted test files)

- [ ] **TODO-4.3**: Verify no remaining references to model-config
  - **Command:** `grep -r "model-config" src/`
  - **Expected:** No matches

- [ ] **TODO-4.4**: Build the project
  - **Command:** `bun run build`
  - **Expected:** Build succeeds

---

## Files Summary

### Files to DELETE (4)
| File | Reason |
|------|--------|
| `src/platform/config/model-config.ts` | Duplicate functionality |
| `src/platform/config/model-config.test.ts` | Tests for deleted file |
| `src/platform/config/model-config-resolver.ts` | Duplicate resolution logic |
| `src/platform/config/model-config-resolver.test.ts` | Tests for deleted file |

### Files to MODIFY (2)
| File | Changes |
|------|---------|
| `src/platform/config/schema.ts` | Remove import, models field, ModelsConfig export |
| `src/cli/config-manager.ts` | Remove import, add constants, rewrite writeModelConfig() |

### Files UNCHANGED (correct existing implementation)
| File | Reason |
|------|--------|
| `src/orchestration/agents/model-resolver.ts` | Correct resolver using categories |
| `src/execution/tools/delegate-task/constants.ts` | DEFAULT_CATEGORIES with model property |
| `src/execution/tools/delegate-task/tools.ts` | resolveCategoryConfig() already works |
| `src/cli/commands/sync-models.ts` | Already uses writeModelConfig() generically |

---

## Test Strategy

1. **Type checking**: `bun run typecheck` ensures no broken imports
2. **Unit tests**: `bun test` verifies existing functionality works
3. **Grep verification**: Confirm no dangling references to deleted files
4. **Build verification**: `bun run build` ensures distributable works

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing configs with `models` section | Greenfield - no users have this yet |
| Missing import in obscure file | Grep + typecheck will catch |
| Sync-models command broken | Command already calls writeModelConfig() generically |

---

## Acceptance Criteria

- [ ] No `models` section in GhostwireConfigSchema
- [ ] No model-config.ts or model-config-resolver.ts files
- [ ] writeModelConfig() writes to agents/categories
- [ ] `bun run typecheck` passes
- [ ] `bun test` passes
- [ ] `bun run build` succeeds
