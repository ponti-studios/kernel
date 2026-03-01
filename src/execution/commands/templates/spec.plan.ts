/**
 * Template for ghostwire:workflows:plan command
 *
 * Creates an implementation plan from a feature specification.
 * Replaces: .specify/templates/plan-template.md + speckit.plan.md logic
 */
export const SPEC_PLAN_TEMPLATE = `
# Implementation Plan: $FEATURE_NAME
**Branch**: \`[$FEATURE_NUM-$FEATURE_SHORT_NAME]\` | **Date**: $TIMESTAMP | **Spec**: [docs/specs/$BRANCH_NAME/spec.md](../spec.md)
**Input**: Feature specification from \`/ghostwire/specs/$BRANCH_NAME/spec.md\`
---
## Summary
$SUMMARY
## Technical Context
**Language/Version**: $TECH_LANGUAGE  
**Primary Dependencies**: $TECH_DEPENDENCIES  
**Storage**: $TECH_STORAGE  
**Testing**: $TECH_TESTING  
**Target Platform**: $TECH_PLATFORM  
**Project Type**: $TECH_PROJECT_TYPE  
**Performance Goals**: $TECH_PERFORMANCE  
**Constraints**: $TECH_CONSTRAINTS  
**Scale/Scope**: $TECH_SCALE
## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
$CONSTITUTION_GATES
## Project Structure
### Documentation (this feature)
\`\`\`text
docs/specs/$BRANCH_NAME/
├── plan.md              # This file (/ghostwire:workflows:plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/ghostwire:workflows:create)
\`\`\`
### Source Code (repository root)
$SOURCE_STRUCTURE
**Structure Decision**: $STRUCTURE_DECISION
## Complexity Tracking
> **Fill ONLY if Constitution Check has violations that must be justified**
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| $COMPLEXITY_VIOLATION_1 | $VIOLATION_REASON_1 | $ALTERNATIVE_REJECTED_1 |
## Phases
### Phase 0: Research
**Goal**: Resolve all NEEDS CLARIFICATION from Technical Context
**Tasks**:
- [ ] Research $RESEARCH_TOPIC_1
- [ ] Research $RESEARCH_TOPIC_2
- [ ] Document decisions in research.md
**Output**: research.md with all clarifications resolved
### Phase 1: Design & Contracts
**Prerequisites**: research.md complete
**Tasks**:
- [ ] Extract entities → data-model.md
- [ ] Generate API contracts → contracts/
- [ ] Create quickstart.md
- [ ] Update agent context
**Output**: data-model.md, contracts/, quickstart.md
### Phase 2: Task Generation
**Prerequisites**: All design artifacts complete
**Tasks**:
- [ ] Run \`/ghostwire:workflows:create\` to generate tasks.md
**Output**: tasks.md with executable task breakdown
---
**Next**: Run \`/ghostwire:workflows:create\` to create executable task list
`;
/**
 * Research topic extraction
 * Identifies unknowns from technical context
 */
export function extractResearchTopics(techContext: string): string[] {
  const topics: string[] = [];
  const unknownPattern = /NEEDS CLARIFICATION:\s*([^\n]+)/gi;
  let match;
  while ((match = unknownPattern.exec(techContext)) !== null) {
    topics.push(match[1].trim());
  }
  return topics;
}
/**
 * Constitution gate validation
 * Checks against project constitution principles
 */
export function validateConstitutionGates(
  constitution: string,
  plan: string,
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  // Extract principles from constitution
  const principlePattern = /###\s+([^.]+)\n+([^#]+)/g;
  let match;
  while ((match = principlePattern.exec(constitution)) !== null) {
    const principle = match[1].trim();
    const description = match[2].trim();
    // Check if plan violates this principle
    // This is a simplified check - real implementation would be more sophisticated
    if (description.includes("test") && !plan.toLowerCase().includes("test")) {
      violations.push(`Missing test coverage for principle: ${principle}`);
    }
  }
  return {
    passed: violations.length === 0,
    violations,
  };
}
/**
 * Project structure templates
 */
export const PROJECT_STRUCTURE_TEMPLATES = {
  single: `\`\`\`text
src/
├── models/
├── services/
├── cli/
└── lib/
tests/
├── contract/
├── integration/
└── unit/
\`\`\``,
  web: `\`\`\`text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
\`\`\``,
  mobile: `\`\`\`text
api/
└── [same as backend above]
ios/ or android/
└── [platform-specific structure]
\`\`\``,
};
