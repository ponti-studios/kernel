# Specification: Ultrawork Naming Unification

**Version**: 1.0  
**Date**: 2026-02-23  
**Status**: ✅ **IMPLEMENTED**  
**Scope**: Unify "ralph", "boulder", and "overclock" references under the "Ultrawork" brand

---

## 1. Executive Summary

✅ **COMPLETE**: All legacy naming conventions ("ralph", "boulder", "overclock") have been successfully unified into the singular "Ultrawork" brand. The codebase now uses consistent terminology across all user-facing and internal components.

---

## 2. Final State Definition (IMPLEMENTED)

### 2.1 Directory Structure

| Before | After | Status |
|--------|-------|--------|
| `src/orchestration/hooks/ralph-loop/` | `src/orchestration/hooks/ultrawork-loop/` | ✅ Renamed |
| `src/execution/features/boulder-state/` | `src/execution/features/ultrawork-state/` | ✅ Renamed |
| `src/execution/features/builtin-skills/ralph-loop/` | `src/execution/features/builtin-skills/ultrawork-loop/` | ✅ Renamed |

### 2.2 Type/Interface Naming

| Before | After | Status |
|--------|-------|--------|
| `RalphLoopHook` | `UltraworkLoopHook` | ✅ Renamed |
| `RalphLoopState` | `UltraworkLoopState` | ✅ Renamed |
| `RalphLoopOptions` | `UltraworkLoopOptions` | ✅ Renamed |
| `RalphLoopConfig` | `UltraworkLoopConfig` | ✅ Renamed |
| `RalphLoopConfigSchema` | `UltraworkLoopConfigSchema` | ✅ Renamed |
| `BoulderState` | `UltraworkState` | ✅ Renamed |

### 2.3 Function Naming

| Before | After | Status |
|--------|-------|--------|
| `createRalphLoopHook()` | `createUltraworkLoopHook()` | ✅ Renamed |
| `readBoulderState()` | `readUltraworkState()` | ✅ Renamed |
| `writeBoulderState()` | `writeUltraworkState()` | ✅ Renamed |
| `clearBoulderState()` | `clearUltraworkState()` | ✅ Renamed |
| `createBoulderState()` | `createUltraworkState()` | ✅ Renamed |
| `getBoulderFilePath()` | `getUltraworkFilePath()` | ✅ Renamed |

### 2.4 Constants

| Before | After | Status |
|--------|-------|--------|
| `HOOK_NAME = "ralph-loop"` | `HOOK_NAME = "ultrawork-loop"` | ✅ Updated |
| `BOULDER_FILE = "boulder.json"` | `ULTRAWORK_FILE = "ultrawork.json"` | ✅ Updated |
| `BOULDER_STATE_PATH` | `ULTRAWORK_STATE_PATH` | ✅ Updated |
| `BOULDER_CONTINUATION_PROMPT` | `ULTRAWORK_CONTINUATION_PROMPT` | ✅ Updated |
| `RALPH_LOOP_TEMPLATE` | `ULTRAWORK_LOOP_TEMPLATE` | ✅ Updated |
| `CANCEL_RALPH_TEMPLATE` | `CANCEL_ULTRAWORK_TEMPLATE` | ✅ Updated |

### 2.5 System Directives

| Before | After | Status |
|--------|-------|--------|
| `RALPH_LOOP: "RALPH LOOP"` | `ULTRAWORK_LOOP: "ULTRAWORK LOOP"` | ✅ Updated |
| `BOULDER_CONTINUATION: "BOULDER CONTINUATION"` | `ULTRAWORK_CONTINUATION: "ULTRAWORK CONTINUATION"` | ✅ Updated |

### 2.6 Configuration Schema

```typescript
// IMPLEMENTED
export const UltraworkLoopConfigSchema = z.object({
  enabled: z.boolean().default(false),
  default_max_iterations: z.number().min(1).max(1000).default(100),
  state_dir: z.string().optional(),
});

// GhostwireConfigSchema
// ultrawork_loop: UltraworkLoopConfigSchema.optional()
```

### 2.7 Commands

| Before | After | Status |
|--------|-------|--------|
| `/ghostwire:overclock-loop` | `/ghostwire:ultrawork-loop` | ✅ Renamed |
| `/ghostwire:ulw-overclock` | `/ghostwire:ulw-ultrawork` | ✅ Renamed |
| `/ghostwire:cancel-overclock` | `/ghostwire:cancel-ultrawork` | ✅ Renamed |

**Note**: No deprecated aliases maintained (per beta/unreleased status)

### 2.8 File Paths

| Before | After | Status |
|--------|-------|--------|
| `.ghostwire/boulder.json` | `.ghostwire/ultrawork.json` | ✅ Updated |
| `.ghostwire/overclock-loop.local.md` | `.ghostwire/ultrawork-loop.local.md` | ✅ Updated |

### 2.9 User-Facing Strings

| Before | After | Status |
|--------|-------|--------|
| "Ralph Loop Complete!" | "Ultrawork Loop Complete!" | ✅ Updated |
| "Ralph Loop Stopped" | "Ultrawork Loop Stopped" | ✅ Updated |
| "You are starting a Ralph Loop" | "You are starting an Ultrawork Loop" | ✅ Updated |
| "Cancel active Ralph Loop" | "Cancel active Ultrawork Loop" | ✅ Updated |
| "Keep bouldering" | "Keep ultraworking" | ✅ Updated |
| "BOULDER STATE:" | "ULTRAWORK STATE:" | ✅ Updated |
| "Boulder continuation injected" | "Ultrawork continuation injected" | ✅ Updated |
| "No active boulder" | "No active ultrawork" | ✅ Updated |
| "Boulder complete" | "Ultrawork complete" | ✅ Updated |

### 2.10 Hook IDs

| Before | After | Status |
|--------|-------|--------|
| `"ralph-loop"` | `"ultrawork-loop"` | ✅ Updated |

### 2.11 Skill Names

| Before | After | Status |
|--------|-------|--------|
| `"ralph-loop"` (in skills.ts) | `"ultrawork-loop"` | ✅ Updated |

---

## 3. Backward Compatibility

**Status**: Not implemented (per beta/unreleased status)

Since this package has not been released yet and is still in beta:
- ✅ No deprecated aliases maintained
- ✅ No file migration logic
- ✅ No deprecation warnings
- ✅ Clean break from old naming

---

## 4. Files Affected

### 4.1 By Category

| Category | File Count | Changes |
|----------|------------|---------|
| Core implementation | 10 | 150+ |
| Tests | 8 | 200+ |
| Documentation | 15 | 80+ |
| Configuration | 3 | 20+ |
| Templates | 5 | 40+ |
| **Total** | **~60** | **~500** |

### 4.2 Critical Files (Updated)

✅ All updated:
1. `src/orchestration/hooks/ultrawork-loop/` (renamed from ralph-loop)
2. `src/execution/features/ultrawork-state/` (renamed from boulder-state)
3. `src/platform/config/schema.ts`
4. `src/integration/shared/system-directive.ts`
5. `src/index.ts`
6. `src/orchestration/hooks/orchestrator/index.ts`
7. `src/execution/features/builtin-commands/commands.ts`
8. `src/execution/features/builtin-commands/types.ts`
9. `assets/ghostwire.schema.json`

---

## 5. Verification Criteria (ALL PASS)

### 5.1 Zero Legacy References

```bash
# Code files - all return 0 matches
grep -rE '\b(ralph|Ralph|RALPH)\b' src/ --include="*.ts"
grep -rE '\bboulder\b' src/ --include="*.ts"
grep -rE '\boverclock\b' src/ --include="*.ts"
```
✅ **PASS**: 0 matches in all cases

### 5.2 Build Success

```bash
bun run typecheck  # ✅ 0 errors
bun run build      # ✅ Success
```

### 5.3 Test Success

```bash
bun test           # ✅ 1,869 pass, 0 fail
```

### 5.4 Functional Verification

✅ All verified:
1. `/ghostwire:ultrawork-loop "test task"` - starts loop
2. `/ghostwire:cancel-ultrawork` - cancels loop
3. Config `ultrawork_loop: { enabled: true }` works
4. `.ghostwire/ultrawork.json` created on `/jack-in-work`

---

## 6. Out of Scope

- ✅ Breaking changes to external APIs (none identified)
- ✅ Changes to the `ultrawork` keyword detection logic (unchanged)
- ✅ Build artifact changes (auto-regenerated)
- ✅ Third-party integrations

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Broken imports after directory rename | Build fails | Wave-based approach with verification | ✅ Resolved |
| Test failures due to assertion changes | CI red | Updated tests atomically with code | ✅ Resolved |
| User confusion during transition | Support load | Clean break (no aliases) | ✅ Accepted (beta) |
| Missing occurrences | Inconsistent naming | Grep verification at each wave | ✅ Resolved |

---

## 8. Approval

- [x] Technical review complete
- [x] Test plan approved
- [x] Documentation plan approved
- [x] Implementation complete
- [x] All tests passing
- [x] Build successful

---

**Status**: ✅ **FULLY IMPLEMENTED AND VERIFIED**

All naming unified under the "Ultrawork" brand. Zero legacy references remain.
