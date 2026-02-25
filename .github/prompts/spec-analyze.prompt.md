# spec-analyze

Source: spec/analyze.ts

<command-instruction>
## Analysis: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Artifacts**: .ghostwire/specs/$BRANCH_NAME/

---

## Artifact Inventory

| Artifact | Status | Issues |
|----------|--------|--------|
| spec.md | $SPEC_STATUS | $SPEC_ISSUES |
| plan.md | $PLAN_STATUS | $PLAN_ISSUES |
| tasks.md | $TASKS_STATUS | $TASKS_ISSUES |
| research.md | $RESEARCH_STATUS | $RESEARCH_ISSUES |
| data-model.md | $DATA_MODEL_STATUS | $DATA_MODEL_ISSUES |
| contracts/ | $CONTRACTS_STATUS | $CONTRACTS_ISSUES |
| quickstart.md | $QUICKSTART_STATUS | $QUICKSTART_ISSUES |

---

## Cross-Artifact Consistency Check

### Spec ↔ Plan Alignment

$SPEC_PLAN_ALIGNMENT

### Plan ↔ Tasks Alignment

$PLAN_TASKS_ALIGNMENT

### Tasks ↔ Implementation Alignment

$TASKS_IMPL_ALIGNMENT

---

## Issues Found

$ISSUES_LIST

---

## Recommendations

$RECOMMENDATIONS

---

## Analysis Summary

**Overall Status**: $OVERALL_STATUS

**Critical Issues**: $CRITICAL_COUNT  
**Warnings**: $WARNING_COUNT  
**Passed**: $PASSED_COUNT

---

**Next**: Address critical issues, then run \`/ghostwire:spec:implement\` if ready
</command-instruction>
