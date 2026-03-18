import type { CommandTemplate } from '../../core/templates/types.js';

export function getWorkflowsBrainstormCommandTemplate(): CommandTemplate {
  return {
    name: 'Jinn: Workflows Brainstorm',
    description: 'Generate ideas and explore solutions',
    category: 'Workflow',
    tags: ['brainstorm', 'ideas', 'exploration'],
    content: `# Jinn: Workflows Brainstorm

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
    name: 'Jinn: Workflows Complete',
    description: 'Complete ongoing work items',
    category: 'Workflow',
    tags: ['complete', 'finish', 'done'],
    content: `# Jinn: Workflows Complete

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
    name: 'Jinn: Workflows Create',
    description: 'Create new work item or project',
    category: 'Workflow',
    tags: ['create', 'new', 'initiate'],
    content: `# Jinn: Workflows Create

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
    name: 'Jinn: Workflows Execute',
    description: 'Execute planned work',
    category: 'Workflow',
    tags: ['execute', 'run', 'do'],
    content: `# Jinn: Workflows Execute

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
    name: 'Jinn: Workflows Learnings',
    description: 'Document and share project learnings',
    category: 'Workflow',
    tags: ['learnings', 'knowledge', 'documentation'],
    content: `# Jinn: Workflows Learnings

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
    name: 'Jinn: Workflows Plan',
    description: 'Create detailed work plan',
    category: 'Workflow',
    tags: ['plan', 'planning', 'roadmap'],
    content: `# Jinn: Workflows Plan

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
    name: 'Jinn: Workflows Review',
    description: 'Review completed or in-progress work',
    category: 'Workflow',
    tags: ['review', 'feedback', 'assessment'],
    content: `# Jinn: Workflows Review

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
    name: 'Jinn: Workflows Status',
    description: 'Check status of ongoing work',
    category: 'Workflow',
    tags: ['status', 'progress', 'check'],
    content: `# Jinn: Workflows Status

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
    name: 'Jinn: Workflows Stop',
    description: 'Stop ongoing work',
    category: 'Workflow',
    tags: ['stop', 'halt', 'pause'],
    content: `# Jinn: Workflows Stop

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
    name: 'Jinn: Workflows Work',
    description: 'Perform work tasks',
    category: 'Workflow',
    tags: ['work', 'task', 'do'],
    content: `# Jinn: Workflows Work

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
