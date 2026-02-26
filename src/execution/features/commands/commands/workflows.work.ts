import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:workflows:work";
export const DESCRIPTION = "Execute work plans with strict preflight gates and evidence-based completion";
export const TEMPLATE = `<command-instruction>
# Workflows:Work Command (Canonical Executor)

Execute an approved work plan with deterministic gates and phased progression.

## Input Document

<input_document>
#$ARGUMENTS
</input_document>

## Phase 0: Pre-Implementation Checklist Gate (Fail-Fast)

Do not start implementation until all checks pass:

- [ ] Plan path resolved under .ghostwire/plans/*.md
- [ ] Tasks are present (either embedded or generated via /ghostwire:workflows:create --mode tasks)
- [ ] Acceptance criteria are explicit and testable
- [ ] Required checklists (security/performance/data/etc.) are reviewed when applicable
- [ ] Dependencies and blocked tasks are understood
- [ ] Branch strategy selected (feature branch or worktree)

If any gate fails:
1. Stop execution.
2. Report exact missing prerequisite.
3. Provide the minimal recovery command sequence.

## Phase 1: Setup and Branch Safety

1. Determine current and default branch.
2. Require explicit confirmation before committing to default branch.
3. Prefer worktree for parallel/risky work.
4. Create TodoWrite tasks mirroring plan order and dependencies.

## Phase 2: Execution by Explicit Phase Order

Always execute in this order:

1. Setup
2. Foundational
3. User Story Phases (priority order)
4. Polish

Rules:

- Foundational blocks all story work.
- Respect task dependency graph from workflows:create output.
- Mark plan checkboxes as tasks complete (\`- [ ]\` -> \`- [x]\`).
- Keep TodoWrite synchronized with actual state.

## Phase 3: Implementation Loop

For each task:

1. Mark task in progress.
2. Read referenced files and match existing patterns.
3. Implement minimal change required by acceptance criteria.
4. Write/adjust tests with deterministic validation evidence.
5. Run targeted tests immediately.
6. Mark task complete in both TodoWrite and plan.
7. Evaluate incremental commit viability.

## Phase 4: Quality and Evidence Gate

Before finalization:

- [ ] All planned tasks completed or explicitly deferred with rationale
- [ ] Acceptance criteria mapped to passing tests
- [ ] Lint/type checks pass
- [ ] No unresolved critical findings from analyze/checklist modes
- [ ] Performance/security assertions validated where relevant

If evidence is missing, do not claim completion.

## Phase 5: Ship and Report

1. Create clean commits with conventional messages.
2. Prepare PR summary with:
- scope
- acceptance criteria coverage
- tests executed
- residual risks
3. For UI work, include before/after screenshots and URLs.

## Completion Criteria

A feature is complete only when:

- All non-deferred acceptance criteria have objective passing evidence.
- Plan status can transition to completed.
- Remaining risks are explicitly documented.

## Anti-Patterns to Reject

- Starting work with unresolved prerequisites
- Skipping foundational dependencies
- Updating code without updating plan/task state
- Claiming completion without test evidence
</command-instruction>`;
export const ARGUMENT_HINT = "[plan-path-or-name]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
