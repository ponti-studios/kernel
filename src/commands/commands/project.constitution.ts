import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:project:constitution";
export const DESCRIPTION = "Create or update project constitution with core principles";
export const TEMPLATE = `
---
description: "Project constitution with core principles and governance rules"
---
# $PROJECT_NAME Constitution
**Version**: $VERSION | **Ratified**: $DATE | **Last Amended**: $DATE
---
## Core Principles
### I. $PRINCIPLE_1_NAME
$PRINCIPLE_1_DESCRIPTION
### II. $PRINCIPLE_2_NAME
$PRINCIPLE_2_DESCRIPTION
### III. $PRINCIPLE_3_NAME
$PRINCIPLE_3_DESCRIPTION
### IV. $PRINCIPLE_4_NAME
$PRINCIPLE_4_DESCRIPTION
### V. $PRINCIPLE_5_NAME
$PRINCIPLE_5_DESCRIPTION
`;
export const ARGUMENT_HINT = "[project name] (optional, defaults to repo name)";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
