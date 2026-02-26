/**
 * Template for ghostwire:workflows:create command
 *
 * Cross-artifact consistency check.
 * Replaces: speckit.analyze.md logic
 */

export const SPEC_ANALYZE_TEMPLATE = `<command-instruction>
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

**Next**: Address critical issues, then run \`/ghostwire:workflows:work\` if ready
</command-instruction>
`;

/**
 * Artifact status types
 */
export type ArtifactStatus = "present" | "missing" | "incomplete" | "outdated";

/**
 * Issue severity
 */
export type IssueSeverity = "critical" | "warning" | "info";

/**
 * Analysis issue
 */
export interface AnalysisIssue {
  artifact: string;
  severity: IssueSeverity;
  description: string;
  recommendation: string;
}

/**
 * Generate issues list
 */
export function generateIssuesList(issues: AnalysisIssue[]): string {
  if (issues.length === 0) {
    return "✅ No issues found. All artifacts are consistent.";
  }

  const critical = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");
  const info = issues.filter((i) => i.severity === "info");

  let result = "";

  if (critical.length > 0) {
    result += "### 🔴 Critical Issues\n\n";
    result += critical
      .map((i) => `- **${i.artifact}**: ${i.description}\n  - Recommendation: ${i.recommendation}`)
      .join("\n\n");
    result += "\n\n";
  }

  if (warnings.length > 0) {
    result += "### ⚠️ Warnings\n\n";
    result += warnings
      .map((i) => `- **${i.artifact}**: ${i.description}\n  - Recommendation: ${i.recommendation}`)
      .join("\n\n");
    result += "\n\n";
  }

  if (info.length > 0) {
    result += "### ℹ️ Information\n\n";
    result += info.map((i) => `- **${i.artifact}**: ${i.description}`).join("\n\n");
  }

  return result;
}

/**
 * Check spec-plan alignment
 */
export function checkSpecPlanAlignment(
  spec: string,
  plan: string,
): { aligned: boolean; issues: string[] } {
  const issues: string[] = [];

  // Extract user stories from spec
  const specStories = spec.match(/### User Story \d+/g) || [];

  // Check if plan references all stories
  for (const story of specStories) {
    const storyNum = story.match(/\d+/)?.[0];
    if (storyNum && !plan.includes(`US${storyNum}`)) {
      issues.push(`User Story ${storyNum} from spec not referenced in plan`);
    }
  }

  // Check tech stack consistency
  const specTech = spec.match(/\*\*Language\/Version\*\*: ([^\n]+)/)?.[1];
  const planTech = plan.match(/\*\*Language\/Version\*\*: ([^\n]+)/)?.[1];
  if (specTech && planTech && specTech !== planTech) {
    issues.push(`Tech stack mismatch: spec says "${specTech}", plan says "${planTech}"`);
  }

  return {
    aligned: issues.length === 0,
    issues,
  };
}

/**
 * Check plan-tasks alignment
 */
export function checkPlanTasksAlignment(
  plan: string,
  tasks: string,
): { aligned: boolean; issues: string[] } {
  const issues: string[] = [];

  // Extract phases from plan
  const planPhases = plan.match(/Phase \d+: ([^\n]+)/g) || [];

  // Check if tasks follow phase structure
  const taskPhases = tasks.match(/## Phase \d+/g) || [];

  if (planPhases.length !== taskPhases.length) {
    issues.push(
      `Phase count mismatch: plan has ${planPhases.length} phases, tasks has ${taskPhases.length}`,
    );
  }

  // Check if all plan requirements have corresponding tasks
  const planReqs = plan.match(/- \*\*FR-\d+\*\*: ([^\n]+)/g) || [];
  for (const req of planReqs) {
    const reqText = req.replace(/- \*\*FR-\d+\*\*:\s*/, "");
    if (!tasks.toLowerCase().includes(reqText.toLowerCase().substring(0, 30))) {
      issues.push(`Requirement "${reqText.substring(0, 50)}..." may not have corresponding task`);
    }
  }

  return {
    aligned: issues.length === 0,
    issues,
  };
}
