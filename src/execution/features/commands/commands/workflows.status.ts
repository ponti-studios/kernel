import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:workflows:status";
export const DESCRIPTION = "Check status of in-progress workflow or plan";
export const TEMPLATE = `
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
</workflow-reference>`;
export const ARGUMENT_HINT = "[workflow-reference]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
