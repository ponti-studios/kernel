# Implementation Plan: Standardize All Agent Models to opencode/kimi-k2.5

**Status**: ✅ COMPLETED
**Created**: 2026-02-23
**Author**: planner
**Branch**: `feat/standardize-kimi-k2.5-models`

---

## Context

### User Request Summary
Standardize ALL agents and categories to use `opencode/kimi-k2.5` as the primary model with a simplified fallback chain prioritizing `opencode` then `github-copilot` providers.

### Key Decisions
1. **Primary model**: `opencode/kimi-k2.5` for ALL agents (uniform strategy)
2. **Test approach**: Make tests model-agnostic (not hardcoded to specific models)
3. **Fallback chain priority**: `opencode` → `github-copilot`
4. **Exception**: Keep `google/gemini-3-flash` for `analyzer-media` (vision capabilities required)

### Scope Boundaries
- **INCLUDE**: All model references in agents.yml, model-requirements.ts, constants.ts, and documentation
- **INCLUDE**: Test files with hardcoded model assertions
- **EXCLUDE**: Vision-specific agents (analyzer-media uses gemini-3-flash for vision)
- **EXCLUDE**: Any code logic changes beyond model configuration

---

## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| Task 1: Update model-requirements.ts | None | Core source of truth for programmatic requirements |
| Task 2: Update delegate-task constants.ts | None | Category defaults independent of agent requirements |
| Task 3: Update agents.yml | Task 1 | YAML mirrors model-requirements.ts |
| Task 4: Update documentation files | Task 1, Task 2, Task 3 | Docs reference the source of truth |
| Task 5: Refactor test files | Task 1, Task 2 | Tests validate the new model configuration |
| Task 6: Verification | Task 1, Task 2, Task 3, Task 4, Task 5 | Final validation |

---

## Parallel Execution Graph

```
Wave 1 (Start immediately):
├── Task 1: Update model-requirements.ts (no dependencies)
└── Task 2: Update delegate-task constants.ts (no dependencies)

Wave 2 (After Wave 1 completes):
└── Task 3: Update agents.yml (depends: Task 1)

Wave 3 (After Wave 2 completes):
├── Task 4: Update documentation files (depends: Task 1, 2, 3)
└── Task 5: Refactor test files (depends: Task 1, 2)

Wave 4 (After Wave 3 completes):
└── Task 6: Verification (depends: all)

Critical Path: Task 1 → Task 3 → Task 4 → Task 6
Estimated Parallel Speedup: 30% faster than sequential
```

---

## Tasks

### Task 1: Update model-requirements.ts

**Description**: Update `src/orchestration/agents/model-requirements.ts` to standardize all agent and category fallback chains to `opencode/kimi-k2.5`.

**Delegation Recommendation**:
- Category: `quick` - Single file, straightforward text replacement
- Skills: [`git-master`] - For atomic commits

**Skills Evaluation**:
- INCLUDED `git-master`: Atomic commit for this single file change
- OMITTED `frontend-ui-ux`: No UI work
- OMITTED `playwright`: No browser automation

**Depends On**: None

**Acceptance Criteria**:
- All 10 agents use `kimi-k2.5` with `opencode` → `github-copilot` fallback (except `analyzer-media`)
- All 8 categories use `kimi-k2.5` with appropriate variants
- `analyzer-media` retains `gemini-3-flash` for vision
- `bun run typecheck` passes
- `bun test src/orchestration/agents/model-requirements.test.ts` passes (after Task 5)

**Before**:
```typescript
// Example: operator
operator: {
  fallbackChain: [
    {
      providers: ["anthropic", "github-copilot", "opencode"],
      model: "claude-opus-4-5",
      variant: "max",
    },
    { providers: ["kimi-for-coding"], model: "k2p5" },
    { providers: ["opencode"], model: "gpt-5.2-codex" },
    // ... more fallbacks
  ],
},
```

**After**:
```typescript
// Example: operator
operator: {
  fallbackChain: [
    {
      providers: ["opencode", "github-copilot"],
      model: "kimi-k2.5",
    },
  ],
},
```

**Detailed Changes**:

#### AGENT_MODEL_REQUIREMENTS Changes

| Agent | Old Primary | New Primary | Fallback Chain |
|-------|-------------|-------------|----------------|
| `operator` | `claude-opus-4-5` | `kimi-k2.5` | `opencode → github-copilot` |
| `executor` | `claude-sonnet-4-5` | `kimi-k2.5` | `opencode → github-copilot` |
| `advisor-plan` | `gpt-5.2` | `kimi-k2.5` | `opencode → github-copilot` |
| `researcher-data` | `glm-4.7` | `kimi-k2.5` | `opencode → github-copilot` |
| `researcher-codebase` | `claude-haiku-4-5` | `kimi-k2.5` | `opencode → github-copilot` |
| `analyzer-media` | `gemini-3-flash` | **KEEP gemini-3-flash** | `google → github-copilot → opencode` (vision) |
| `planner` | `claude-opus-4-5` | `kimi-k2.5` | `opencode → github-copilot` |
| `advisor-strategy` | `claude-opus-4-5` | `kimi-k2.5` | `opencode → github-copilot` |
| `validator-audit` | `gpt-5.2` | `kimi-k2.5` | `opencode → github-copilot` |
| `orchestrator` | `k2p5` | `kimi-k2.5` | `opencode → github-copilot` |

#### CATEGORY_MODEL_REQUIREMENTS Changes

| Category | Old Primary | New Primary | Variant | Fallback Chain |
|----------|-------------|-------------|---------|----------------|
| `visual-engineering` | `gemini-3-pro` | `kimi-k2.5` | - | `opencode → github-copilot` |
| `ultrabrain` | `gpt-5.2-codex` | `kimi-k2.5` | `max` | `opencode → github-copilot` |
| `deep` | `gpt-5.2-codex` | `kimi-k2.5` | `medium` | `opencode → github-copilot` |
| `artistry` | `gemini-3-pro` | `kimi-k2.5` | - | `opencode → github-copilot` |
| `quick` | `claude-haiku-4-5` | `kimi-k2.5` | - | `opencode → github-copilot` |
| `unspecified-low` | `claude-sonnet-4-5` | `kimi-k2.5` | - | `opencode → github-copilot` |
| `unspecified-high` | `claude-opus-4-5` | `kimi-k2.5` | `max` | `opencode → github-copilot` |
| `writing` | `gemini-3-flash` | `kimi-k2.5` | - | `opencode → github-copilot` |

**Full Replacement Code**:

```typescript
export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  operator: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  executor: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "advisor-plan": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "researcher-data": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "researcher-codebase": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "analyzer-media": {
    // EXCEPTION: Keep gemini-3-flash for vision capabilities
    fallbackChain: [
      {
        providers: ["google", "github-copilot", "opencode"],
        model: "gemini-3-flash",
      },
    ],
  },
  planner: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "advisor-strategy": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "validator-audit": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  orchestrator: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  "visual-engineering": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  ultrabrain: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "max",
      },
    ],
  },
  deep: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "medium",
      },
    ],
  },
  artistry: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  quick: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "unspecified-low": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "unspecified-high": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "max",
      },
    ],
  },
  writing: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};
```

---

### Task 2: Update delegate-task constants.ts

**Description**: Update `src/execution/tools/delegate-task/constants.ts` to update `DEFAULT_CATEGORIES` with `opencode/kimi-k2.5`.

**Delegation Recommendation**:
- Category: `quick` - Single file, straightforward text replacement
- Skills: [`git-master`] - For atomic commits

**Skills Evaluation**:
- INCLUDED `git-master`: Atomic commit for this single file change
- OMITTED `frontend-ui-ux`: No UI work

**Depends On**: None

**Acceptance Criteria**:
- All 8 categories in `DEFAULT_CATEGORIES` use `opencode/kimi-k2.5`
- Preserve existing variants where specified
- `bun run typecheck` passes

**Before** (lines 193-202):
```typescript
export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  "visual-engineering": { model: "google/gemini-3-pro" },
  ultrabrain: { model: "openai/gpt-5.2-codex", variant: "xhigh" },
  deep: { model: "openai/gpt-5.2-codex", variant: "medium" },
  artistry: { model: "google/gemini-3-pro", variant: "max" },
  quick: { model: "anthropic/claude-haiku-4-5" },
  "unspecified-low": { model: "anthropic/claude-sonnet-4-5" },
  "unspecified-high": { model: "anthropic/claude-opus-4-5", variant: "max" },
  writing: { model: "google/gemini-3-flash" },
};
```

**After**:
```typescript
export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  "visual-engineering": { model: "opencode/kimi-k2.5" },
  ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
  deep: { model: "opencode/kimi-k2.5", variant: "medium" },
  artistry: { model: "opencode/kimi-k2.5" },
  quick: { model: "opencode/kimi-k2.5" },
  "unspecified-low": { model: "opencode/kimi-k2.5" },
  "unspecified-high": { model: "opencode/kimi-k2.5", variant: "max" },
  writing: { model: "opencode/kimi-k2.5" },
};
```

**Additional Changes in constants.ts**:

Update `QUICK_CATEGORY_PROMPT_APPEND` warning message (line 72):
```typescript
// Before:
// THIS CATEGORY USES A LESS CAPABLE MODEL (claude-haiku-4-5).

// After:
// THIS CATEGORY USES A LESS CAPABLE MODEL (kimi-k2.5).
```

Update `UNSPECIFIED_LOW_CATEGORY_PROMPT_APPEND` warning (line 123):
```typescript
// Before:
// THIS CATEGORY USES A MID-TIER MODEL (claude-sonnet-4-5).

// After:
// THIS CATEGORY USES A MID-TIER MODEL (kimi-k2.5).
```

---

### Task 3: Update agents.yml

**Description**: Update `docs/agents.yml` to reflect the new model assignments for all agents and categories.

**Delegation Recommendation**:
- Category: `unspecified-low` - Moderate effort, YAML updates
- Skills: [`git-master`] - For atomic commits

**Skills Evaluation**:
- INCLUDED `git-master`: Atomic commit
- OMITTED `frontend-ui-ux`: No UI work

**Depends On**: Task 1 (must mirror model-requirements.ts)

**Acceptance Criteria**:
- All agents (except `analyzer-media`) show `opencode/kimi-k2.5` as primary model
- All fallback chains simplified to `opencode → github-copilot`
- `analyzer-media` retains `google/gemini-3-flash` with vision fallbacks
- All categories updated to match Task 2

**Key Changes**:

For each agent (except `analyzer-media`), update:
```yaml
# Before example (advisor-plan):
- id: advisor-plan
  display_name: advisor-plan
  model: openai/gpt-5.2
  purpose: ...
  fallback_chain:
    - providers: [openai, github-copilot, opencode]
      model: gpt-5.2
      variant: high
    - providers: [google, github-copilot, opencode]
      model: gemini-3-pro
      variant: max
    # ... more

# After:
- id: advisor-plan
  display_name: advisor-plan
  model: opencode/kimi-k2.5
  purpose: ...
  fallback_chain:
    - providers: [opencode, github-copilot]
      model: kimi-k2.5
```

**Full Agent List to Update** (model field + fallback_chain):

1. `advisor-plan` (line 16-37)
2. `advisor-strategy` (line 38-66)
3. `operator` (line 139-170)
4. `orchestrator` (line 174-199)
5. `planner` (line 200-227)
6. `researcher-codebase` (line 228-243)
7. `researcher-data` (line 244-258)
8. `validator-audit` (line 311-333)
9. `executor` (line 127-131, currently no fallback_chain, add one)

**Agents to KEEP unchanged**:
- `analyzer-media` (lines 72-102) - Vision capabilities require gemini-3-flash

**Categories to Update** (lines 350-499):

All 8 categories need their fallback_chain updated to:
```yaml
fallback_chain:
  - providers: [opencode, github-copilot]
    model: kimi-k2.5
```

With variants for:
- `ultrabrain`: `variant: max`
- `unspecified-high`: `variant: max`
- `deep`: `variant: medium`

---

### Task 4: Update Documentation Files

**Description**: Update all documentation files to reflect the new model configuration.

**Delegation Recommendation**:
- Category: `writing` - Documentation updates
- Skills: [`git-master`] - For atomic commits

**Skills Evaluation**:
- INCLUDED `git-master`: Atomic commits
- OMITTED `frontend-ui-ux`: No UI work

**Depends On**: Task 1, Task 2, Task 3

**Acceptance Criteria**:
- All model references in docs updated to `opencode/kimi-k2.5`
- Example configurations use new models
- Agent tables reflect new assignments

**Files to Update**:

#### 4.1. docs/reference/configurations.md

**Lines 23-25** - Quick Start example:
```jsonc
// Before:
"agents": {
  "advisor-plan": { "model": "openai/gpt-5.2" },
  "researcher-data": { "model": "zai-coding-plan/glm-4.7" },
  "researcher-codebase": { "model": "opencode/gpt-5-nano" }
}

// After:
"agents": {
  "advisor-plan": { "model": "opencode/kimi-k2.5" },
  "researcher-data": { "model": "opencode/kimi-k2.5" },
  "researcher-codebase": { "model": "opencode/kimi-k2.5" }
}
```

**Lines 29-32** - Categories example:
```jsonc
// Before:
"categories": {
  "quick": { "model": "opencode/gpt-5-nano" },
  "visual-engineering": { "model": "google/gemini-3-pro" }
}

// After:
"categories": {
  "quick": { "model": "opencode/kimi-k2.5" },
  "visual-engineering": { "model": "opencode/kimi-k2.5" }
}
```

**Lines 726-734** - Built-in Categories table:
Update all model defaults to `opencode/kimi-k2.5` (keep variant notation)

**Lines 766-793** - Recommended Configuration:
Update all models to `opencode/kimi-k2.5`

**Lines 896-906** - Agent Provider Chains table:
Update all models and provider chains

**Lines 912-922** - Category Provider Chains table:
Update all models and provider chains

#### 4.2. docs/reference/agents.md

**Lines 46-60** - Example configuration:
```json
// Before:
{
  "agents": {
    "advisor-plan": {
      "model": "openai/gpt-5.2",
      "temperature": 0.1
    },
    "researcher-codebase": {
      "model": "opencode/gpt-5-nano"
    }
  }
}

// After:
{
  "agents": {
    "advisor-plan": {
      "model": "opencode/kimi-k2.5",
      "temperature": 0.1
    },
    "researcher-codebase": {
      "model": "opencode/kimi-k2.5"
    }
  }
}
```

#### 4.3. docs/getting-started/overview.md

**Line 9** - Update recommendation:
```markdown
// Before:
> **Cipher Operator agent strongly recommends Opus 4.5 model. Using other models may result in significantly degraded experience.**

// After:
> **Cipher Operator agent uses kimi-k2.5 model by default for all agents. Using other models may result in varied experience.**
```

**Lines 116-120** - Example fallback chain:
```markdown
// Before:
google → openai → zai-coding-plan → anthropic → opencode
   ↓        ↓           ↓              ↓           ↓
gemini   gpt-5.2     glm-4.6v       haiku     gpt-5-nano

// After:
opencode → github-copilot
    ↓           ↓
kimi-k2.5   kimi-k2.5
```

**Lines 127-145** - Example config:
Update all models to `opencode/kimi-k2.5`

#### 4.4. README.md

**Lines in "10 Specialized Agents" table** (approximate):
Update the Model column for all agents to show `opencode/kimi-k2.5` (except Gemini for vision)

```markdown
| Agent | Superpower | Model |
|-------|-----------|-------|
| **Cipher Operator** | Main orchestrator, deep analysis | Kimi K2.5 |
| **Seer Advisor** | Architecture decisions, debugging | Kimi K2.5 |
| **Frontend UI/UX** | React, styling, animations | Kimi K2.5 |
| **Archive Researcher** | Docs, open-source patterns, history | Kimi K2.5 |
| **Scout Recon** | Lightning-fast codebase exploration | Kimi K2.5 |
| **Media Analyzer** | Image/PDF analysis, vision | Gemini 3 Flash |
| ... | ... | ... |
```

---

### Task 5: Refactor Test Files

**Description**: Refactor test files to be model-agnostic by removing hardcoded model assertions and using dynamic values or constants.

**Delegation Recommendation**:
- Category: `unspecified-high` - High effort, many files, requires careful refactoring
- Skills: [`git-master`] - For atomic commits per logical group

**Skills Evaluation**:
- INCLUDED `git-master`: Multiple atomic commits for different test file groups
- OMITTED `frontend-ui-ux`: No UI work

**Depends On**: Task 1, Task 2

**Acceptance Criteria**:
- All 38 test files with hardcoded models refactored
- Tests validate structure/behavior, not specific model strings
- `bun test` passes (594 test files)

**Refactoring Strategy**:

The key principle is: **Tests should validate BEHAVIOR, not IMPLEMENTATION DETAILS**.

#### Strategy A: Test Against Constants (Preferred)

Import the actual constants and validate against them:

```typescript
// Before:
test("operator has claude-opus-4-5 as primary", () => {
  const primary = AGENT_MODEL_REQUIREMENTS["operator"].fallbackChain[0];
  expect(primary.model).toBe("claude-opus-4-5");
});

// After:
test("operator has valid primary model", () => {
  const operator = AGENT_MODEL_REQUIREMENTS["operator"];
  expect(operator).toBeDefined();
  expect(operator.fallbackChain).toBeArray();
  expect(operator.fallbackChain.length).toBeGreaterThan(0);
  // Validate structure, not specific model
  const primary = operator.fallbackChain[0];
  expect(primary.providers).toBeArray();
  expect(primary.model).toBeTypeOf("string");
  expect(primary.model.length).toBeGreaterThan(0);
});
```

#### Strategy B: Use Test Constants

Create a test constants file that mirrors source constants:

```typescript
// src/test-utils/model-constants.ts
import { AGENT_MODEL_REQUIREMENTS, CATEGORY_MODEL_REQUIREMENTS } from "../orchestration/agents/model-requirements";

// Re-export for tests that need to validate current config
export const getExpectedAgentModel = (agent: string) => 
  AGENT_MODEL_REQUIREMENTS[agent]?.fallbackChain[0]?.model;

export const getExpectedCategoryModel = (category: string) =>
  CATEGORY_MODEL_REQUIREMENTS[category]?.fallbackChain[0]?.model;
```

#### Strategy C: Structural Validation

Tests should validate:
1. Required fields exist
2. Arrays are non-empty
3. Types are correct
4. Relationships are valid

NOT:
1. Specific model strings
2. Specific provider strings
3. Hardcoded variants

**Files to Refactor**:

| File | Current Issue | Fix |
|------|---------------|-----|
| `model-requirements.test.ts` | 20+ hardcoded model assertions | Use Strategy A - validate structure |
| `tools.test.ts` (delegate-task) | Hardcoded model in DEFAULT_CATEGORIES | Import constants, validate structure |
| `config-composer.test.ts` | Model string comparisons | Use getExpectedModel() helper |
| `model-availability.test.ts` | Mocked model lists | Update mock to include `kimi-k2.5` |
| `model-resolver.test.ts` | Specific model resolution tests | Test resolution logic, not specific models |
| All others | Various hardcoded strings | Apply appropriate strategy |

**Detailed Changes for model-requirements.test.ts**:

```typescript
// Before (lines 10-24):
test("advisor-plan has valid fallbackChain with gpt-5.2 as primary", () => {
  const seerAdvisor = AGENT_MODEL_REQUIREMENTS["advisor-plan"];
  expect(seerAdvisor).toBeDefined();
  expect(seerAdvisor.fallbackChain).toBeArray();
  expect(seerAdvisor.fallbackChain.length).toBeGreaterThan(0);

  const primary = seerAdvisor.fallbackChain[0];
  expect(primary.providers).toContain("openai");
  expect(primary.model).toBe("gpt-5.2");
  expect(primary.variant).toBe("high");
});

// After:
test("advisor-plan has valid fallbackChain structure", () => {
  const advisorPlan = AGENT_MODEL_REQUIREMENTS["advisor-plan"];
  expect(advisorPlan).toBeDefined();
  expect(advisorPlan.fallbackChain).toBeArray();
  expect(advisorPlan.fallbackChain.length).toBeGreaterThan(0);

  const primary = advisorPlan.fallbackChain[0];
  expect(primary.providers).toBeArray();
  expect(primary.providers.length).toBeGreaterThan(0);
  expect(typeof primary.model).toBe("string");
  expect(primary.model.length).toBeGreaterThan(0);
});
```

**Exception - analyzer-media test**:

Keep specific model validation for analyzer-media since vision is a special case:

```typescript
test("analyzer-media uses gemini-3-flash for vision capabilities", () => {
  const analyzerMedia = AGENT_MODEL_REQUIREMENTS["analyzer-media"];
  const primary = analyzerMedia.fallbackChain[0];
  // Vision-specific requirement - intentionally hardcoded
  expect(primary.model).toBe("gemini-3-flash");
  expect(primary.providers).toContain("google");
});
```

---

### Task 6: Verification

**Description**: Run full test suite and type checking to verify all changes.

**Delegation Recommendation**:
- Category: `quick` - Running commands and validation
- Skills: [`git-master`] - For final verification

**Skills Evaluation**:
- INCLUDED `git-master`: Final verification and commit
- OMITTED others: Simple command execution

**Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5

**Acceptance Criteria**:
- `bun run typecheck` passes with 0 errors
- `bun test` passes (594 tests)
- Manual spot-check of agent model resolution via `bunx ghostwire doctor --verbose`

**Verification Commands**:
```bash
# Type checking
bun run typecheck

# Full test suite
bun test

# Specific test files
bun test src/orchestration/agents/model-requirements.test.ts
bun test src/execution/tools/delegate-task/tools.test.ts

# Doctor check for model resolution
bunx ghostwire doctor --verbose
```

---

## Commit Strategy

Follow atomic commit principles per task:

1. **Commit 1**: `refactor(models): standardize agent model requirements to kimi-k2.5`
   - Files: `src/orchestration/agents/model-requirements.ts`

2. **Commit 2**: `refactor(models): standardize category defaults to kimi-k2.5`
   - Files: `src/execution/tools/delegate-task/constants.ts`

3. **Commit 3**: `docs: update agents.yml with kimi-k2.5 model configuration`
   - Files: `docs/agents.yml`

4. **Commit 4**: `docs: update documentation with kimi-k2.5 model references`
   - Files: All docs/*.md files

5. **Commit 5**: `test: make model tests agnostic to specific model strings`
   - Files: All *.test.ts files with model assertions

---

## Success Criteria

1. **Functional**: All agents resolve to `opencode/kimi-k2.5` (except `analyzer-media`)
2. **Tests**: 594 tests pass with 0 failures
3. **Types**: `bun run typecheck` shows 0 errors
4. **Documentation**: All docs reflect new model configuration
5. **Doctor**: `bunx ghostwire doctor --verbose` shows correct model resolution

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate**: Revert to previous commit
   ```bash
   git revert HEAD~5..HEAD
   ```

2. **Partial**: If specific agents have issues, users can override in `ghostwire.json`:
   ```json
   {
     "agents": {
       "operator": { "model": "anthropic/claude-opus-4-5" }
     }
   }
   ```

3. **Branch preservation**: Keep the old branch available:
   ```bash
   git branch backup/pre-kimi-standardization 042-reorganize-repo-topology
   ```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Kimi K2.5 unavailable for some users | Medium | High | Fallback to github-copilot provider |
| Performance regression | Low | Medium | Users can override individual agents |
| Test failures | Medium | Low | Tests refactored to be model-agnostic |
| Documentation inconsistency | Low | Low | Single pass update, cross-reference check |

---

## Notes

- The `analyzer-media` exception is intentional and documented - vision capabilities require `gemini-3-flash`
- All variant assignments (`max`, `medium`) are preserved where semantically meaningful
- The simplified fallback chain (`opencode → github-copilot`) reduces complexity and maintenance burden
- Test refactoring follows TDD principles - tests validate behavior, not implementation
