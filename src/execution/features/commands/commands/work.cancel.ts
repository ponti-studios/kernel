import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:work:cancel";
export const DESCRIPTION = "Cancel active work loop";
export const TEMPLATE = `
Cancel the currently active Ultrawork Loop.
This will:
1. Stop the loop from continuing
2. Clear the loop state file
3. Allow the session to end normally
Check if a loop is active and cancel it. Inform the user of the result.
`;
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
};
