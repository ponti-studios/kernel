export const WORKFLOWS_PLAN_TEMPLATE = `
Note: The current year is 2026. Use 2026 for date-sensitive references unless the system date differs.
# Workflows:Plan Command (Canonical)
Transform a feature request, bug report, or refactor idea into one strictly formatted plan document.
## Input
<feature-description>
$ARGUMENTS
</feature-description>
If the feature description is empty, ask:
"What should I plan? Provide the feature, bug, or refactor scope."
Do not continue until scope is explicit.
## Required Execution Pipeline
1. Brainstorm first
- Check for brainstorm artifacts in docs/brainstorms/.
- Use latest relevant brainstorm if present; otherwise run a short AskUserQuestion brainstorm.
- Capture explicit decisions and open questions.
2. Run mandatory local research
- Run in parallel:
  - Task profile.researcher_repo(feature_description)
  - Task profile.researcher_learnings(feature_description)
- Capture file-level evidence with line refs and project conventions.
3. Run mandatory external research
- Run in parallel:
  - Task profile.researcher_practices(feature_description)
  - Task profile.researcher_docs(feature_description)
- Use current authoritative sources and include at least 2 relevant external refs when applicable.
4. Run NEEDS CLARIFICATION scan (mandatory)
- Find unresolved ambiguity and missing acceptance definitions.
- If unresolved items remain, ask user before finalizing.
5. Consolidate research
- Synthesize local patterns, institutional learnings, external guidance, tradeoffs, and risks.
6. Setup issue tracking metadata
- Detect tracker preference from CLAUDE.md (\`github\` or \`linear\`), else ask user.
- Set frontmatter \`issue_tracker\` and \`issue_url\` (\`pending\` if not created).
7. Write plan file
- Write to: .ghostwire/plans/YYYY-MM-DD-descriptive-name-plan.md
- type must be one of: feat, fix, refactor
- Use kebab-case; filename starts with date prefix.
- Never write plan files outside .ghostwire/plans/.
- If additional artifacts are needed, declare intent under .ghostwire/plans/<plan-id>/ (spec.md, research.md, data-model.md, contracts/, quickstart.md, tasks.md, analysis.md, checklists/).
## Output Contract
Use exactly this output format.
~~~markdown
---
title: "<type>: <clear action-oriented title>"
type: feat|fix|refactor
date: YYYY-MM-DD
status: draft|ready|completed|example
issue_tracker: github|linear|other
issue_url: pending|https://...
feature_description: "<original user request, normalized>"
---
# <type>: <clear action-oriented title>
## Problem Statement
[Concise technical statement of the problem or opportunity.]
## User Scenarios & Testing (Mandatory)
### User Story 1 (P1)
- Narrative:
- Independent test:
- Acceptance scenarios:
  - Given ... When ... Then ...
### User Story 2 (P2)
- Narrative:
- Independent test:
- Acceptance scenarios:
  - Given ... When ... Then ...
### Edge Cases
- Edge case 1
- Edge case 2
## Requirements (Mandatory)
### Functional Requirements
- **FR-001**: ...
- **FR-002**: ...
- **FR-003**: ...
### Key Entities
- Entity 1
- Entity 2
## Success Criteria (Mandatory)
- **SC-001**: measurable outcome
- **SC-002**: measurable outcome
- **SC-003**: measurable outcome
## Goals and Non-Goals
### Goals
- [ ] Goal 1
- [ ] Goal 2
### Non-Goals
- [ ] Non-goal 1
## Technical Context
- Language/Version:
- Primary Dependencies:
- Storage:
- Testing:
- Target Platform:
- Constraints:
- Scale/Scope:
## Constitution Gate
- Gate status: PASS|FAIL
- Violations and justifications (if any)
## Brainstorm Decisions
- Decision 1
- Decision 2
## Clarifications
- Open questions discovered:
- Resolutions:
## Research Summary
### Local Findings
- [path/to/file.ts:line] Pattern or constraint
### External Findings
- [Source name](https://example.com): recommendation
### Risks and Unknowns
- Risk 1 and mitigation
## Proposed Approach
[Architecture and execution strategy.]
## Acceptance Criteria
- [ ] Functional criterion 1
- [ ] Functional criterion 2
- [ ] Non-functional criterion (performance/security/reliability)
## Implementation Steps
- [ ] Step with scope and expected artifact
- [ ] Step with validation method
- [ ] Step with rollout or migration considerations
## Testing Strategy
- Unit:
- Integration:
- End-to-end:
## Dependencies and Rollout
- Dependencies:
- Sequencing:
- Rollback:
## Artifact Plan (Optional Detail Directory)
- Detail root: .ghostwire/plans/<plan-id>/
- Optional artifacts: spec.md, research.md, data-model.md, contracts/, quickstart.md, tasks.md, analysis.md, checklists/
## References
- Internal: [path/to/file.ts:line]
- External: [Source](https://example.com)
- Related issue/PR: #123
~~~
## Required Plan Validation (Before Finalizing)
Before finalizing, verify all conditions:
- Frontmatter exists and is the very first block in the file.
- Frontmatter includes exactly these required keys at minimum: title, type, date, status.
- date format is strictly YYYY-MM-DD.
- status is one of: draft, ready, completed, example.
- The first H1 after frontmatter matches frontmatter title semantics.
- The document includes all required sections from the output contract.
- User Scenarios & Testing, Functional Requirements, and Success Criteria are present.
- NEEDS CLARIFICATION scan found no unresolved items.
- Implementation Steps uses checkbox tasks (\`- [ ]\`) and no numbered list.
- Metadata fields belong in frontmatter; do not duplicate status/date/author/priority block lines in the body preamble.
- File path matches \`.ghostwire/plans/YYYY-MM-DD-*.md\`.
- title, type, date, status are valid and coherent.
## Post-Generation Tracking Step
After writing the plan:
1. Ask whether to create an issue now.
2. If yes (GitHub): gh issue create --title "<type>: <title>" --body-file <plan_path>
3. If yes (Linear): linear issue create --title "<type>: <title>" --description "$(cat <plan_path>)"
4. Update \`issue_url\`.
5. Ask whether to continue with /workflows:create.
NEVER implement code in this command. Produce planning output only.
`;
