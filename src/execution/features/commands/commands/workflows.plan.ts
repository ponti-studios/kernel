import type { CommandDefinition } from "../../claude-code-command-loader";
import { WORKFLOWS_PLAN_TEMPLATE } from "../templates/workflows/plan";

export const NAME = "ghostwire:workflows:plan";
export const DESCRIPTION =
  "Transform feature descriptions into implementation plans with strict story+requirements contracts [Phase: PLAN]";
export const TEMPLATE = WORKFLOWS_PLAN_TEMPLATE;
export const ARGUMENT_HINT = "[feature description, bug report, or improvement idea]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
