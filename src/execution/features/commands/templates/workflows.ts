export const WORKFLOWS_PLAN_TEMPLATE = `
# Workflows:Plan Command
Transform feature descriptions, bug reports, or improvement ideas into well-structured implementation plans following project conventions and best practices.
## Process
1. **Idea Refinement** - Clarify requirements through dialogue
2. **Local Research** - Gather context from repo and institutional learnings
3. **External Research** (conditional) - Research best practices if needed
4. **Issue Planning** - Structure the plan with appropriate detail level
5. **SpecFlow Analysis** - Validate feature specification for completeness
6. **Implementation Steps** - Break down into actionable tasks
## Key Agents & Tasks
- Use \`profile.researcher_repo\` for codebase patterns and conventions
- Use \`profile.researcher_learnings\` for institutional knowledge and gotchas
- Use \`profile.researcher_practices\` and \`profile.researcher_docs\` for external guidance
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
<feature-description>
$ARGUMENTS
</feature-description>
`;
export const WORKFLOWS_CREATE_TEMPLATE = `
# Workflows:Create Command
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
<plan-reference>
$ARGUMENTS
</plan-reference>
`;
export const WORKFLOWS_EXECUTE_TEMPLATE = `
You are starting a workflow coordinator work session.
## WHAT TO DO
1. **Find available plans**: Search for workflow coordinator-generated plan files at \`.ghostwire/plans/\`
2. **Check for active ultrawork state**: Read \`.ghostwire/ultrawork.json\` if it exists
3. **Decision logic**:
   - If \`.ghostwire/ultrawork.json\` exists AND plan is NOT complete (has unchecked boxes):
     - **APPEND** current session to session_ids
     - Continue work on existing plan
   - If no active plan OR plan is complete:
     - List available plan files
     - If ONE plan: auto-select it
     - If MULTIPLE plans: show list with timestamps, ask user to select
4. **Create/Update ultrawork.json**:
   \`\`\`json
   {
     "active_plan": "/absolute/path/to/plan.md",
     "started_at": "ISO_TIMESTAMP",
     "session_ids": ["session_id_1", "session_id_2"],
     "plan_name": "plan-name"
   }
   \`\`\`
5. **Read the plan file** and start executing tasks according to do/research workflow
## OUTPUT FORMAT
When listing plans for selection:
\`\`\`
Available Work Plans
Current Time: {ISO timestamp}
Session ID: {current session id}
1. [plan-name-1.md] - Modified: {date} - Progress: 3/10 tasks
2. [plan-name-2.md] - Modified: {date} - Progress: 0/5 tasks
Which plan would you like to work on? (Enter number or plan name)
\`\`\`
When resuming existing work:
\`\`\`
Resuming Work Session
Active Plan: {plan-name}
Progress: {completed}/{total} tasks
Sessions: {count} (appending current session)
Reading plan and continuing from last incomplete task...
\`\`\`
When auto-selecting single plan:
\`\`\`
Starting Work Session
Plan: {plan-name}
Session ID: {session_id}
Started: {timestamp}
Reading plan and beginning execution...
\`\`\`
## CRITICAL
- The session_id is injected by the hook - use it directly
- Always update ultrawork.json BEFORE starting work
- Read the FULL plan file before delegating any tasks
- Follow workflow coordinator delegation protocols and workflow coordinator handoff checklist (7-section format with safety checks)
<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>
<user-request>
$ARGUMENTS
</user-request>`;
export const WORKFLOWS_STATUS_TEMPLATE = `
# Workflows:Status Command
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
<workflow-reference>
$ARGUMENTS
</workflow-reference>
`;
export const WORKFLOWS_COMPLETE_TEMPLATE = `
# Workflows:Complete Command
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
<workflow-reference>
$ARGUMENTS
</workflow-reference>
`;
