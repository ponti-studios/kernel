import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { AgentTemplate } from "../../../core/templates/types.js";
import designerAgentMarkdown from "./AGENT.md";

const { frontmatter, body } =
  parseFrontmatter<Omit<AgentTemplate, "instructions" | "references">>(designerAgentMarkdown);

export function getDesignerAgentTemplate(): AgentTemplate {
  return {
    ...frontmatter,
    instructions: body,
  };
}
