import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:workflows:execute";
export const DESCRIPTION =
  "Execute planned tasks from workflow plan (task-driven, with subagent delegation) [Phase: EXECUTE]";
export const TEMPLATE = `
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
export const ARGUMENT_HINT = "[plan-name]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
