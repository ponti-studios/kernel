import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:workflows:create";
export const DESCRIPTION =
  "Generate lifecycle artifacts in strict submodes: tasks|analyze|checklist|issues [Phase: BREAKDOWN]";
export const TEMPLATE = `
# Workflows:Create Command (Canonical Multi-Mode)
Create deterministic lifecycle artifacts from an approved plan.
## Invocation
- Default: /ghostwire:workflows:create <plan-reference> => tasks
- Explicit: /ghostwire:workflows:create --mode <tasks|analyze|checklist|issues> <plan-reference>
## Input
<plan-reference>
$ARGUMENTS
</plan-reference>
## Mode Resolution Rules
1. If --mode is provided, use it.
2. If no mode is provided, default to \`tasks\`.
## Shared Preconditions (All Modes)
- Plan file must be readable and located under .ghostwire/plans/*.md
- Plan must include acceptance criteria and implementation steps
- If required data is missing, fail-fast and report exact missing fields
## --mode tasks (default)
### Output Contract
- Phases: Setup (1), Foundational (2, blocking), User Story phases (3+), Polish (final)
- Format each task as: \`[ID] [P?] [Story?] Description\`
- [P] indicates parallelizable tasks
- Include exact repository file paths in each task description
- Enforce dependencies: Foundational blocks stories; tests-before-implementation where applicable; models -> services -> endpoints -> integration
- Output phase dependencies, story dependencies, and parallel opportunities
## --mode analyze
### Output Contract
- Artifact inventory matrix (plan, tasks, research, data model, contracts, quickstart, checklists)
- Plan-to-task alignment checks
- Requirement coverage checks (FR/SC traceability)
- Severity-tagged findings (critical/high/medium/low)
- Deterministic remediation checklist
- Every finding must include evidence location
- Every critical finding must include a concrete remediation step
- If no issues, explicitly state "No critical inconsistencies detected"
## --mode checklist
### Output Contract
- Generate a checklist for one domain: security, performance, data-integrity, accessibility, deployment, or testing
- Checkboxes only (\`- [ ]\`)
- Each item includes pass/fail criterion
- Include completion rule set
- Do not include implementation prose beyond checklist items and criteria
- Must be directly actionable by executor without interpretation
## --mode issues
### Output Contract
- Mapping table: task ID -> issue title -> dependencies -> labels
- Ready-to-run GH CLI command set
- Batch sequencing strategy for dependency-safe issue creation
- Commands must reference deterministic titles
- Include dependency notes for blocked tasks
- Include total counts by phase
## Integration and Handoff
- tasks mode feeds /ghostwire:workflows:work
- analyze/checklist modes gate execution readiness
- issues mode prepares tracker synchronization
## Final Validation (All Modes)
Before finalizing output:
- Confirm selected mode explicitly in output header
- Confirm plan reference path
- Confirm deterministic format constraints were met
- If constraints fail, regenerate
<plan-reference>
$ARGUMENTS
</plan-reference>`;
export const ARGUMENT_HINT = "[--mode tasks|analyze|checklist|issues] [plan-name-or-path]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
