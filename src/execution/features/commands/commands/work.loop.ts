import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:work:loop";
export const DESCRIPTION =
  "Start iterative work loop until completion (ad-hoc, no plan required) [Phase: EXECUTE]";
export const TEMPLATE = `
You are starting an Ultrawork Loop - a self-referential development loop that runs until task completion.
## How
1. You will work on the task continuously
2. When you believe the task is FULLY complete, output: \`<promise>{{COMPLETION_PROMISE}}</promise>\`
3. If you don't output the promise, the loop will automatically inject another prompt to continue
4. Maximum iterations: Configurable (default 100)
## Rules
- Focus on completing the task fully, not partially
- Don't output the completion promise until the task is truly done
- Each iteration should make meaningful progress toward the goal
- If stuck, try different approaches
- Use todos to track your progress
## Exit Conditions
1. **Completion**: Output your completion promise tag when fully complete
2. **Max Iterations**: Loop stops automatically at limit
3. **Cancel**: User runs \`/ghostwire:work:cancel\` command
## Your Task
Parse the arguments below and begin working on the task. The format is:
\`"task description" [--completion-promise=TEXT] [--max-iterations=N]\`
Default completion promise is "DONE" and default max iterations is 100.
<user-task>
$ARGUMENTS
</user-task>`;
export const ARGUMENT_HINT = '"task description" [--completion-promise=TEXT] [--max-iterations=N]';
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
