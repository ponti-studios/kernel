import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import skillBuilderMarkdown from "./instructions.md";

const { frontmatter, body } =
  parseFrontmatter<Omit<SkillTemplate, "instructions" | "references">>(skillBuilderMarkdown);

export function getSkillBuilderSkillTemplate(): SkillTemplate {
  return {
    ...frontmatter,
    instructions: body,
  };
}
