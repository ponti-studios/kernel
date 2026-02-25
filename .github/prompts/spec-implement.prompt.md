# spec-implement

Source: spec/implement.ts

<command-instruction>
## Implementation: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Plan**: [.ghostwire/specs/$BRANCH_NAME/plan.md](../plan.md) | **Tasks**: [.ghostwire/specs/$BRANCH_NAME/tasks.md](../tasks.md)

---

## Pre-Implementation Checklist

### Checklist Status

$CHECKLIST_STATUS_TABLE

$CHECKLIST_WARNING

### Prerequisites Loaded

✅ **tasks.md**: $TASKS_LOADED tasks identified  
✅ **plan.md**: Tech stack: $TECH_STACK  
$OPTIONAL_PREREQS

### Project Setup Verification

$IGNORE_FILES_STATUS

---

## Implementation Execution

### Phase 1: Setup

$PHASE_1_TASKS

### Phase 2: Foundational

$PHASE_2_TASKS

### Phase 3+: User Stories

$USER_STORY_IMPLEMENTATIONS

### Final Phase: Polish

$POLISH_TASKS

---

## Progress Tracking

$PROGRESS_TABLE

---

## Completion Validation

✅ All required tasks completed: $COMPLETED_COUNT/$TOTAL_COUNT  
✅ Features match original specification  
✅ Tests pass: $TESTS_PASSING/$TESTS_TOTAL  
✅ Implementation follows technical plan  

**Status**: $IMPLEMENTATION_STATUS

---

**Next**: Run \`/ghostwire:spec:analyze\` to validate consistency across all artifacts
</command-instruction>

---

## Phase Execution Rules

### Setup Phase
- Initialize project structure
- Install dependencies
- Configure tooling
- **Validation**: Project builds successfully

### Foundational Phase
- Create core infrastructure
- Setup database/schemas
- Implement shared utilities
- **Validation**: Foundation supports user stories
- **CRITICAL**: Must complete before any user story work

### User Story Phase
- **TDD Approach**: Tests first, ensure they FAIL
- Models → Services → Endpoints/UI
- Integration within story
- **Validation**: Story independently testable
- **Checkpoint**: Stop and validate before next story

### Polish Phase
- Documentation
- Code cleanup
- Performance optimization
- Security review
- **Validation**: All tests pass, code quality gates met
