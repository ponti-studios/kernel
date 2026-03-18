import type { CommandTemplate } from '../../core/templates/types.js';

export function getJinnProposeCommandTemplate(): CommandTemplate {
  return {
    name: 'Propose',
    description: 'Create or update a Linear project and seed execution issues',
    category: 'Workflow',
    tags: ['workflow', 'proposal', 'linear', 'planning'],
    content: `Propose

Create a new Linear-backed change. Linear is the source of truth.

## Steps

1. Clarify the goal, success criteria, and scope.
2. Create or update a Linear project for the change.
3. Write the proposal summary and design context into the Linear project description.
4. Seed top-level Linear issues for major workstreams.
5. Seed sub-issues for immediately known implementation work.
6. Report the created Linear project, issue links, and open decisions.

## Guardrails

- Do not create local artifact files as the primary workflow record.
- Prefer one Linear project per change.
- Keep top-level Linear issues outcome-oriented and sub-issues execution-oriented.
- If a matching Linear project already exists, update it instead of duplicating it.
`,
  };
}

export function getJinnExploreCommandTemplate(): CommandTemplate {
  return {
    name: 'Explore',
    description: 'Explore ideas using current Linear project and issue context',
    category: 'Workflow',
    tags: ['workflow', 'explore', 'linear', 'investigation'],
    content: `Enter explore mode with Linear context.

## Steps

1. Identify the relevant Linear project or Linear issue from the conversation.
2. Read the existing Linear description, issue hierarchy, and status.
3. Explore options, risks, dependencies, and edge cases.
4. Offer to capture new decisions back into the relevant Linear project or Linear issue.

## Guardrails

- Explore and reason before implementation.
- Use Linear as the context source when work has already been captured.
- Keep recommendations grounded in the current codebase and current Linear state.
`,
  };
}

export function getJinnApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'Apply',
    description: 'Implement work from Linear issues and sub-issues',
    category: 'Workflow',
    tags: ['workflow', 'apply', 'linear', 'execution'],
    content: `Implement work from Linear.

## Steps

1. Select the Linear project or Linear issue to execute.
2. Read the active top-level Linear issues and pending sub-issues.
3. Choose the next unblocked sub-issue.
4. Implement the change, run verification, and summarize progress.
5. Update the Linear issue state, assignee, or notes through the available workflow.
6. Continue until the selected Linear scope is complete or blocked.

## Guardrails

- Treat Linear sub-issues as the execution queue.
- Pause when the next Linear issue is ambiguous or blocked.
- Keep code changes scoped to the selected Linear work item.
`,
  };
}

export function getJinnArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'Archive',
    description: 'Close out completed Linear work',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'linear', 'completion'],
    content: `Archive completed Linear work.

## Steps

1. Select the Linear project to close.
2. Review open top-level Linear issues and sub-issues.
3. Confirm whether any remaining items should stay open or be deferred.
4. Mark the Linear project complete and transition finished Linear issues to done.
5. Summarize remaining follow-ups, if any.

## Guardrails

- Do not move local folders as the completion mechanism.
- Use Linear project and Linear issue state transitions as the archive step.
- Surface incomplete items before closing the Linear project.
`,
  };
}

export function getWorkflowsBrainstormCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Brainstorm',
    description: 'Generate ideas and explore solutions',
    category: 'Workflow',
    tags: ['brainstorm', 'ideas', 'exploration'],
    content: `# Workflows Brainstorm

Generate ideas and explore solutions.

## Process

1. Define Problem
   - What challenge to solve
   - Constraints to consider
   - Success criteria

2. Generate Ideas
   - Go wide first
   - No bad ideas
   - Build on others

3. Evaluate Options
   - Pros and cons
   - Feasibility
   - Tradeoffs

4. Select Approach
   - Recommend solution
   - Explain reasoning
   - Note risks
`,
  };
}

export function getWorkflowsCompleteCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Complete',
    description: 'Complete ongoing work items',
    category: 'Workflow',
    tags: ['complete', 'finish', 'done'],
    content: `# Workflows Complete

Complete ongoing work items.

## Process

1. Review Remaining Work
   - Check pending items
   - Prioritize
   - Estimate effort

2. Execute Completion
   - Work through items
   - Verify each one
   - Document results

3. Finalize
   - Run tests
   - Update documentation
   - Clean up

4. Report
   - What completed
   - What remains
   - Lessons learned
`,
  };
}

export function getWorkflowsCreateCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Create',
    description: 'Create new work item or project',
    category: 'Workflow',
    tags: ['create', 'new', 'initiate'],
    content: `# Workflows Create

Create new work item or project.

## Process

1. Define Scope
   - What to create
   - Purpose
   - Success criteria

2. Plan Structure
   - Files needed
   - Dependencies
   - Organization

3. Execute Creation
   - Scaffold files
   - Setup configuration
   - Add initial content

4. Verify
   - Build works
   - Tests pass
   - Ready for use
`,
  };
}

export function getWorkflowsExecuteCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Execute',
    description: 'Execute planned work',
    category: 'Workflow',
    tags: ['execute', 'run', 'do'],
    content: `# Workflows Execute

Execute planned work.

## Process

1. Review Plan
   - Understand tasks
   - Know success criteria
   - Identify dependencies

2. Execute Tasks
   - Work through plan
   - Verify each step
   - Handle issues

3. Monitor Progress
   - Track completion
   - Note blockers
   - Adjust as needed

4. Complete
   - Verify all done
   - Run tests
   - Document results
`,
  };
}

export function getWorkflowsLearningsCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Learnings',
    description: 'Document and share project learnings',
    category: 'Workflow',
    tags: ['learnings', 'knowledge', 'documentation'],
    content: `# Workflows Learnings

Document and share project learnings.

## Process

1. Identify Learnings
   - What worked well
   - What didn't
   - Unexpected issues

2. Document
   - Context
   - Discovery
   - Recommendation

3. Share
   - Team communication
   - Documentation
   - Process updates
`,
  };
}

export function getWorkflowsPlanCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Plan',
    description: 'Create detailed work plan',
    category: 'Workflow',
    tags: ['plan', 'planning', 'roadmap'],
    content: `# Workflows Plan

Create detailed work plan.

## Process

1. Understand Goal
   - What to achieve
   - Constraints
   - Timeline

2. Break Down Work
   - Major tasks
   - Subtasks
   - Dependencies

3. Estimate
   - Effort per task
   - Timeline
   - Resources needed

4. Document Plan
   - Task list
   - Milestones
   - Success criteria
`,
  };
}

export function getWorkflowsReviewCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Review',
    description: 'Review completed or in-progress work',
    category: 'Workflow',
    tags: ['review', 'feedback', 'assessment'],
    content: `# Workflows Review

Review completed or in-progress work.

## Process

1. Gather Context
   - What was done
   - Current state
   - Goals

2. Evaluate
   - Quality
   - Completeness
   - Standards

3. Provide Feedback
   - Strengths
   - Issues
   - Suggestions

4. Recommend
   - Approve as-is
   - Request changes
   - Needs discussion
`,
  };
}

export function getWorkflowsStatusCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Status',
    description: 'Check status of ongoing work',
    category: 'Workflow',
    tags: ['status', 'progress', 'check'],
    content: `# Workflows Status

Check status of ongoing work.

## Process

1. Identify Work Items
   - Current tasks
   - Recent completions
   - Blockers

2. Check Progress
   - What done
   - What remaining
   - Timeline status

3. Report
   - Summary
   - Issues
   - Next steps
`,
  };
}

export function getWorkflowsStopCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Stop',
    description: 'Stop ongoing work',
    category: 'Workflow',
    tags: ['stop', 'halt', 'pause'],
    content: `# Workflows Stop

Stop ongoing work.

## Process

1. Stop Execution
   - Cancel running processes
   - Save state
   - Clean up

2. Document
   - Why stopped
   - What done
   - What remains

3. Plan Next Steps
   - Resume later
   - Re-prioritize
   - Get help
`,
  };
}

export function getWorkflowsWorkCommandTemplate(): CommandTemplate {
  return {
    name: 'Workflows Work',
    description: 'Perform work tasks',
    category: 'Workflow',
    tags: ['work', 'task', 'do'],
    content: `# Workflows Work

Perform work tasks.

## Process

1. Understand Task
   - What to do
   - How to verify
   - Dependencies

2. Execute
   - Complete task
   - Verify result
   - Handle issues

3. Report
   - What done
   - Results
   - Any blockers
`,
  };
}
