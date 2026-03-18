import type { CommandTemplate } from '../../core/templates/types.js';

export function getSpeckitAnalyzeCommandTemplate(): CommandTemplate {
  return {
    name: 'Speckit Analyze',
    description: 'Perform consistency checks across Linear project planning data',
    category: 'Speckit',
    tags: ['speckit', 'analysis', 'linear', 'consistency'],
    content: `## Goal

Analyze a Linear project, its top-level Linear issues, and its sub-issues for gaps and inconsistencies before implementation.

## Steps

1. Read the Linear project summary and description.
2. Read the major Linear issues and their acceptance notes.
3. Read the execution sub-issues and current state.
4. Report duplication, ambiguity, missing coverage, and sequencing risks.
5. Recommend the minimum Linear updates needed before execution.
`,
  };
}

export function getSpeckitPlanCommandTemplate(): CommandTemplate {
  return {
    name: 'Speckit Plan',
    description: 'Create a milestone plan directly in Linear',
    category: 'Speckit',
    tags: ['speckit', 'plan', 'linear', 'milestones'],
    content: `## Goal

Turn requirements into a Linear project plan.

## Steps

1. Clarify goals, constraints, and success criteria.
2. Create or refine the Linear project summary and description.
3. Break the work into top-level Linear issues for milestones or workstreams.
4. Break each milestone into sub-issues representing concrete implementation steps.
5. Order the Linear issues by dependency and delivery value.
6. Report the resulting Linear plan and unresolved risks.
`,
  };
}

export function getSpeckitImplementCommandTemplate(): CommandTemplate {
  return {
    name: 'Speckit Implement',
    description: 'Execute implementation from Linear issue state',
    category: 'Speckit',
    tags: ['speckit', 'implement', 'linear', 'execution'],
    content: `## Goal

Execute implementation work from the current Linear project and Linear issues with verification at each step.

## Steps

1. Read the selected Linear issue and its pending sub-issues.
2. Pick the next unblocked sub-issue.
3. Implement the change and run verification.
4. Update the Linear issue progress notes and completion state.
5. Continue until the selected Linear scope is complete or blocked.
`,
  };
}

export function getSpeckitSpecifyCommandTemplate(): CommandTemplate {
  return {
    name: 'Speckit Specify',
    description: 'Capture detailed requirements in Linear',
    category: 'Speckit',
    tags: ['speckit', 'specify', 'linear', 'requirements'],
    content: `## Goal

Capture detailed, testable requirements in a Linear project and its top-level Linear issues.

## Steps

1. Gather problem context and expected outcomes.
2. Write the canonical summary in the Linear project description.
3. Create top-level Linear issues for each major requirement or milestone.
4. Add acceptance criteria and edge cases to the relevant Linear issues.
5. Confirm the Linear structure is specific enough for planning and execution.
`,
  };
}

export function getSpeckitTasksCommandTemplate(): CommandTemplate {
  return {
    name: 'Speckit Tasks',
    description: 'Break requirements into Linear execution items',
    category: 'Speckit',
    tags: ['speckit', 'tasks', 'linear', 'implementation'],
    content: `## Goal

Break a Linear requirement plan into actionable execution items.

## Steps

1. Review the parent Linear project and top-level Linear issues.
2. Create sub-issues for implementation, testing, and rollout work.
3. Sequence sub-issues by dependency and parallelism.
4. Keep each Linear sub-issue small enough to execute and verify independently.
5. Report the resulting execution queue and any blockers.
`,
  };
}

export function getSpeckitConstitutionCommandTemplate(): CommandTemplate {
  return {
    name: 'Speckit Constitution',
    description: 'Establish project conventions and standards',
    category: 'Speckit',
    tags: ['speckit', 'constitution', 'standards', 'conventions'],
    content: `## Goal

Establish project conventions, coding standards, and operational principles.

## Steps

1. Review existing documentation and tooling.
2. Define coding, testing, and review standards.
3. Make the standards easy to verify.
4. Record the standards in the team’s chosen documentation surface.
`,
  };
}
