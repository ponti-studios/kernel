export const WORKFLOWS_PLAN_TEMPLATE = `# Workflows:Plan Command

Transform feature descriptions, bug reports, or improvement ideas into well-structured implementation plans following project conventions and best practices.

## Process

1. **Idea Refinement** - Clarify requirements through dialogue
2. **Local Research** - Gather context from repo and institutional learnings
3. **External Research** (conditional) - Research best practices if needed
4. **Issue Planning** - Structure the plan with appropriate detail level
5. **SpecFlow Analysis** - Validate feature specification for completeness
6. **Implementation Steps** - Break down into actionable tasks

## Key Agents & Tasks

- Use \`repo-research-analyst\` for codebase patterns and conventions
- Use \`learnings-researcher\` for institutional knowledge and gotchas
- Use \`best-practices-researcher\` and \`framework-docs-researcher\` for external guidance
- Use \`spec-flow-analyzer\` to validate the specification
- Use AskUserQuestion for refinement and decision points

## Output

Creates a markdown plan file in \`docs/plans/\` with:
- YAML frontmatter (title, type, date)
- Clear problem statement or feature description
- Technical approach and considerations
- Acceptance criteria
- Implementation steps
- Relevant context and references
`;

export const WORKFLOWS_CREATE_TEMPLATE = `# Workflows:Create Command

Execute a plan by breaking it into concrete development tasks and coordinating implementation.

## Process

1. **Load Plan** - Read the implementation plan
2. **Task Breakdown** - Decompose into specific, implementable tasks
3. **Dependency Analysis** - Identify task dependencies and parallelizable work
4. **Assign Agents** - Route tasks to appropriate specialist agents
5. **Coordinate Execution** - Monitor progress and handle blockers

## Key Agents & Tasks

- Use \`delegate_task\` with appropriate specialized agents
- Track task completion and dependencies
- Surface blockers and ask for user guidance when needed
- Provide progress feedback

## Integration

- Can be invoked manually after \`workflows:plan\`
- Can be chained automatically from \`workflows:plan\` with user approval
- Integrates with background task system for long-running work
`;

export const WORKFLOWS_STATUS_TEMPLATE = `# Workflows:Status Command

Check the status of an in-progress workflow or plan.

## Features

- Shows current task progress
- Lists completed vs pending tasks
- Identifies blockers and open questions
- Estimates time to completion
- Suggests next steps

## Integration

- Works with \`workflows:create\` to track implementation progress
- Shows background agent status
- Provides context for \`workflows:work\` continuation
`;

export const WORKFLOWS_COMPLETE_TEMPLATE = `# Workflows:Complete Command

Finalize and archive a completed workflow.

## Process

1. **Verify Completion** - Confirm all acceptance criteria met
2. **Collect Results** - Gather outputs and artifacts
3. **Document Learnings** - Extract insights for future reference
4. **Archive Plan** - Move to completed state
5. **Generate Summary** - Create completion report

## Output

- Completion summary document
- Artifacts and references
- Institutional learning record (if applicable)
- Next steps or follow-up items
`;
