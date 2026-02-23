# Documentation Audit: "Ralph" and "Boulder" References

**Date**: 2026-02-23  
**Purpose**: Identify all references to "Ralph" and "Boulder" for naming unification to "Ultrawork"

---

## Executive Summary

This audit identifies all documentation and code references to "Ralph" and "Boulder" metaphors. The goal is to move towards a single "Ultrawork" brand.

### Key Findings

1. **"Ralph"**: Used primarily for the "Ralph Loop" feature - a self-referential development loop
2. **"Boulder"**: Used as a metaphor for the eternal task that must be rolled (Sisyphus metaphor)
3. **User Exposure**: Both terms are exposed to users in CLI output, help text, and documentation

---

## 1. Documentation Files (.md)

### 1.1 README and Guides

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `README.md` | 46 | "Humans roll their boulder every day" | Replace with Ultrawork metaphor |
| `docs/guides/agents-and-commands-explained.md` | - | "Ralph Loop, overclock mode" | Replace with "Ultrawork mode" |
| `docs/concepts/plugin-architecture.md` | - | "boulder state" | Replace with "ultrawork state" |
| `docs/concepts/agents-commands-skills-unified.md` | - | "ralph-loop" | Replace with "ultrawork-loop" |
| `docs/concepts/system-deep-dive.md` | - | "boulder state" | Replace with "ultrawork state" |
| `docs/concepts/reliability-performance.md` | - | "boulder-state" | Replace with "ultrawork-state" |
| `docs/reference/lifecycle-hooks.md` | - | "Ralph Loop" description | Replace with "Ultrawork Loop" |
| `docs/reference/features.md` | - | "Ralph Loop" feature | Replace with "Ultrawork Loop" |
| `docs/reference/modes.md` | - | "Ralph Loop Mode" section | Replace with "Ultrawork Mode" |
| `system-prompt.md` | 46 | "Humans roll their boulder every day" | Replace with Ultrawork metaphor |

### 1.2 Skill Documentation

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 1 | `name: ralph-loop` | Replace with `ultrawork-loop` |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 5 | `# Ralph Loop Skill` | Replace with `# Ultrawork Loop Skill` |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 6 | `ralph-loop is a small...` | Replace with `ultrawork-loop is a small...` |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 8 | "Keep ralph-loop narrow..." | Replace with "Keep ultrawork-loop narrow..." |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 10 | "agents/ralph-loop.md" | Replace with "agents/ultrawork-loop.md" |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 11 | "skills/ralph-loop/SKILL.md" | Replace with "skills/ultrawork-loop/SKILL.md" |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 12 | "Start ralph-loop" | Replace with "Start ultrawork-loop" |
| `src/execution/features/builtin-skills/ralph-loop/SKILL.md` | 13 | "ralph-loop is intentionally small..." | Replace with "ultrawork-loop is intentionally small..." |

### 1.3 Plugin README

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/plugin/README.md` | - | "ralph-loop" description | Replace with "ultrawork-loop" |

### 1.4 Specification Files

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `specs/043-agent-consolidation-spec/agent-plugin-mapping.md` | - | "workflow/ralph-loop.md" | Replace with "workflow/ultrawork-loop.md" |
| `specs/044-plugin-to-builtin-migration/tasks.md` | - | "Move ralph-loop/" | Replace with "Move ultrawork-loop/" |
| `specs/044-plugin-to-builtin-migration/data-model.md` | - | "ralph-loop/" mapping | Replace with "ultrawork-loop/" |
| `specs/044-plugin-to-builtin-migration/plan.md` | - | "Move ralph-loop/" | Replace with "Move ultrawork-loop/" |
| `specs/044-plugin-to-builtin-migration/spec.md` | - | "ralph-loop" path | Replace with "ultrawork-loop" |

---

## 2. Source Code References

### 2.1 Configuration Schema

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/platform/config/schema.ts` | - | `"ralph-loop"` enum | Replace with `"ultrawork-loop"` |
| `src/platform/config/schema.ts` | - | `RalphLoopConfigSchema` | Rename to `UltraworkLoopConfigSchema` |
| `src/platform/config/schema.ts` | - | `ralph_loop` config key | Replace with `ultrawork_loop` |
| `src/platform/config/schema.ts` | - | `RalphLoopConfig` type | Rename to `UltraworkLoopConfig` |

### 2.2 System Directives

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/integration/shared/system-directive.ts` | - | `RALPH_LOOP: "RALPH LOOP"` | Replace with `ULTRAWORK_LOOP: "ULTRAWORK LOOP"` |
| `src/integration/shared/system-directive.ts` | - | `BOULDER_CONTINUATION: "BOULDER CONTINUATION"` | Replace with `ULTRAWORK_CONTINUATION: "ULTRAWORK CONTINUATION"` |

### 2.3 Boulder State Implementation

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/execution/features/boulder-state/types.ts` | 5 | "Named after the operator boulder" | Replace with Ultrawork metaphor |
| `src/execution/features/boulder-state/constants.ts` | - | `BOULDER_DIR = ".operator"` | Keep (directory name) |
| `src/execution/features/boulder-state/constants.ts` | - | `BOULDER_FILE = "boulder.json"` | Replace with `ULTRAWORK_FILE = "ultrawork.json"` |
| `src/execution/features/boulder-state/constants.ts` | - | `BOULDER_STATE_PATH` | Replace with `ULTRAWORK_STATE_PATH` |
| `src/execution/features/boulder-state/storage.ts` | - | `getBoulderFilePath()` | Rename to `getUltraworkFilePath()` |
| `src/execution/features/boulder-state/storage.ts` | - | `readBoulderState()` | Rename to `readUltraworkState()` |
| `src/execution/features/boulder-state/storage.ts` | - | `writeBoulderState()` | Rename to `writeUltraworkState()` |
| `src/execution/features/boulder-state/storage.ts` | - | `clearBoulderState()` | Rename to `clearUltraworkState()` |
| `src/execution/features/boulder-state/storage.ts` | - | `createBoulderState()` | Rename to `createUltraworkState()` |
| `src/execution/features/boulder-state/types.ts` | - | `BoulderState` interface | Rename to `UltraworkState` |

### 2.4 Ralph Loop Hook

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/orchestration/hooks/ralph-loop/index.ts` | 45 | `RALPH LOOP {{ITERATION}}` | Replace with `ULTRAWORK LOOP {{ITERATION}}` |
| `src/orchestration/hooks/ralph-loop/index.ts` | 58 | `RalphLoopHook` interface | Rename to `UltraworkLoopHook` |
| `src/orchestration/hooks/ralph-loop/index.ts` | 71 | `createRalphLoopHook()` | Rename to `createUltraworkLoopHook()` |
| `src/orchestration/hooks/ralph-loop/index.ts` | 154 | `startLoop()` function | Keep (generic name) |
| `src/orchestration/hooks/ralph-loop/index.ts` | 262 | "Ralph Loop Complete!" | Replace with "Ultrawork Loop Complete!" |
| `src/orchestration/hooks/ralph-loop/index.ts` | 292 | "Ralph Loop Stopped" | Replace with "Ultrawork Loop Stopped" |
| `src/orchestration/hooks/ralph-loop/index.ts` | 330 | "Ralph Loop" toast | Replace with "Ultrawork Loop" |

### 2.5 Orchestrator Hook

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/orchestration/hooks/orchestrator/index.ts` | 67 | `BOULDER_CONTINUATION_PROMPT` | Replace with `ULTRAWORK_CONTINUATION_PROMPT` |
| `src/orchestration/hooks/orchestrator/index.ts` | 212 | "BOULDER STATE:" | Replace with "ULTRAWORK STATE:" |
| `src/orchestration/hooks/orchestrator/index.ts` | 240 | "Keep bouldering." | Replace with "Keep ultraworking." |
| `src/orchestration/hooks/orchestrator/index.ts` | 515 | "Boulder continuation injected" | Replace with "Ultrawork continuation injected" |
| `src/orchestration/hooks/orchestrator/index.ts` | 548 | `readBoulderState()` | Rename to `readUltraworkState()` |
| `src/orchestration/hooks/orchestrator/index.ts` | 549 | `isBoulderSession` | Rename to `isUltraworkSession` |
| `src/orchestration/hooks/orchestrator/index.ts` | 557 | "boulder session" | Replace with "ultrawork session" |
| `src/orchestration/hooks/orchestrator/index.ts` | 580 | "No active boulder" | Replace with "No active ultrawork" |
| `src/orchestration/hooks/orchestrator/index.ts` | 592 | "Boulder complete" | Replace with "Ultrawork complete" |

### 2.6 Built-in Commands

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/execution/features/builtin-commands/templates/ralph-loop.ts` | - | `RALPH_LOOP_TEMPLATE` | Rename to `ULTRAWORK_LOOP_TEMPLATE` |
| `src/execution/features/builtin-commands/templates/ralph-loop.ts` | - | `CANCEL_RALPH_TEMPLATE` | Rename to `CANCEL_ULTRAWORK_TEMPLATE` |
| `src/execution/features/builtin-commands/templates/ralph-loop.ts` | - | "Ralph Loop" references | Replace with "Ultrawork Loop" |
| `src/execution/features/builtin-commands/templates/start-work.ts` | - | "boulder state" references | Replace with "ultrawork state" |
| `src/execution/features/builtin-commands/templates/stop-continuation.ts` | - | "Ralph Loop" references | Replace with "Ultrawork Loop" |
| `src/execution/features/builtin-commands/commands.ts` | - | Template imports | Update imports |

### 2.7 Skills Registry

| File | Line | Context | Action Required |
|------|------|---------|-----------------|
| `src/execution/features/builtin-skills/skills.ts` | - | `"ralph-loop"` skill name | Replace with `"ultrawork-loop"` |

---

## 3. User-Facing Exposure Analysis

### 3.1 CLI Output

**"Ralph" is exposed to users in:**
- Toast notifications: "Ralph Loop Complete!", "Ralph Loop Stopped", "Ralph Loop"
- Command descriptions: "Cancel active Ralph Loop"
- Help text and templates

**"Boulder" is exposed to users in:**
- System directives: "BOULDER CONTINUATION"
- Progress messages: "BOULDER STATE:", "Keep bouldering."
- File references: `.ghostwire/boulder.json`

### 3.2 Documentation

Both terms are extensively documented in:
- User guides
- Feature references
- Mode descriptions
- Hook documentation

---

## 4. Metaphor Usage Analysis

### 4.1 "Boulder" Metaphor

**Origin**: Sisyphus myth - the eternal task that must be rolled

**Usage Contexts:**
1. **State Management**: "boulder state" represents the active work plan
2. **Continuation**: "boulder continuation" forces agents to continue incomplete work
3. **Persistence**: `.ghostwire/boulder.json` stores the active plan state
4. **Progress Tracking**: "BOULDER STATE:" shows plan completion status

**Metaphor Strengths:**
- Clear imagery of continuous work
- Fits the concept of "rolling" through tasks
- Memorable and distinctive

**Metaphor Weaknesses:**
- Confusing for new users (what is a "boulder"?)
- Doesn't align with "Ultrawork" branding
- Sisyphus myth has negative connotations (eternal punishment)

### 4.2 "Ralph" Metaphor

**Origin**: Named after Anthropic's Ralph Wiggum plugin

**Usage Contexts:**
1. **Loop Execution**: "Ralph Loop" is the self-referential development loop
2. **Completion Detection**: Detects when tasks are truly done
3. **Iteration Management**: Tracks loop iterations and max limits

**Metaphor Strengths:**
- Historical reference to Anthropic's work
- Distinctive name

**Metaphor Weaknesses:**
- "Ralph" is a person's name, not descriptive
- Doesn't convey the function (self-referential loop)
- Confusing for users unfamiliar with Anthropic's plugin

---

## 5. Recommended Replacement Strategy

### 5.1 "Ralph" → "Ultrawork"

**Rationale**: "Ultrawork" already exists as the brand and describes the function (ultra-powered work loop)

**Replacement Mapping:**
- `ralph-loop` → `ultrawork-loop`
- `Ralph Loop` → `Ultrawork Loop`
- `RALPH LOOP` → `ULTRAWORK LOOP`
- `RalphLoopHook` → `UltraworkLoopHook`
- `RalphLoopConfig` → `UltraworkLoopConfig`

### 5.2 "Boulder" → "Ultrawork"

**Rationale**: Align with "Ultrawork" brand, maintain continuity metaphor

**Replacement Mapping:**
- `boulder state` → `ultrawork state`
- `boulder continuation` → `ultrawork continuation`
- `boulder.json` → `ultrawork.json`
- `BoulderState` → `UltraworkState`
- `BOULDER_CONTINUATION` → `ULTRAWORK_CONTINUATION`

**Metaphor Preservation**: The "rolling" concept can be preserved with phrases like:
- "Keep ultraworking" (instead of "Keep bouldering")
- "Ultrawork state" (instead of "Boulder state")

---

## 6. Implementation Priority

### Phase 1: Core Infrastructure (High Priority)
1. Rename `BoulderState` → `UltraworkState` (types.ts)
2. Rename `RalphLoopHook` → `UltraworkLoopHook` (hooks)
3. Update system directives (system-directive.ts)
4. Update config schema (schema.ts)

### Phase 2: User-Facing Strings (High Priority)
1. Update all toast notifications
2. Update command descriptions and help text
3. Update documentation files
4. Update skill documentation

### Phase 3: File and Directory Names (Medium Priority)
1. Rename `boulder.json` → `ultrawork.json`
2. Rename `ralph-loop/` directory → `ultrawork-loop/`
3. Update all file path references

### Phase 4: Test Files (Medium Priority)
1. Update test file names
2. Update test assertions
3. Update mock data

### Phase 5: Comments and Logs (Low Priority)
1. Update code comments
2. Update log messages
3. Update inline documentation

---

## 7. Grep Output Summary

### Command Used
```bash
grep -riE "ralph|boulder" . --include="*.md"
```

### Results Summary
- **Total matches**: 40+ occurrences across 15+ files
- **"ralph" matches**: 25+ occurrences
- **"boulder" matches**: 15+ occurrences
- **Documentation files**: 10+ files affected
- **Source files**: 20+ files affected

---

## 8. Risk Assessment

### High Risk Areas
1. **User-facing strings**: Breaking changes for existing users
2. **Configuration schema**: May break existing configs
3. **File paths**: May break scripts or tools referencing these paths

### Medium Risk Areas
1. **Internal APIs**: May break internal tooling
2. **Test files**: May require test updates
3. **Documentation**: May confuse users during transition

### Low Risk Areas
1. **Code comments**: No user impact
2. **Log messages**: Minimal user impact
3. **Internal variable names**: No user impact

---

## 9. Migration Checklist

- [ ] Phase 1: Core Infrastructure
  - [ ] Rename BoulderState → UltraworkState
  - [ ] Rename RalphLoopHook → UltraworkLoopHook
  - [ ] Update system directives
  - [ ] Update config schema
- [ ] Phase 2: User-Facing Strings
  - [ ] Update toast notifications
  - [ ] Update command descriptions
  - [ ] Update documentation
  - [ ] Update skill docs
- [ ] Phase 3: File and Directory Names
  - [ ] Rename boulder.json → ultrawork.json
  - [ ] Rename ralph-loop/ → ultrawork-loop/
  - [ ] Update file path references
- [ ] Phase 4: Test Files
  - [ ] Update test file names
  - [ ] Update test assertions
  - [ ] Update mock data
- [ ] Phase 5: Comments and Logs
  - [ ] Update code comments
  - [ ] Update log messages
  - [ ] Update inline docs

---

## 10. Conclusion

The "Ralph" and "Boulder" metaphors are deeply embedded throughout the codebase, affecting:
- 40+ documentation references
- 20+ source code files
- User-facing CLI output
- Configuration schemas
- File system paths

A phased migration approach is recommended to minimize disruption while achieving the goal of a unified "Ultrawork" brand.

**Next Steps**:
1. Review and approve this audit
2. Create detailed migration plan
3. Begin with Phase 1 (Core Infrastructure)
4. Test thoroughly at each phase
5. Update user documentation during transition
