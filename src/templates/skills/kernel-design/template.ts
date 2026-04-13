import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import designSkillMarkdown from "./instructions.md";
import { DESIGN_SKILL_REFERENCES } from "./reference-bundle.js";

const { frontmatter, body } =
  parseFrontmatter<Omit<SkillTemplate, "instructions" | "references">>(designSkillMarkdown);

export function getDesignSkillTemplate(): SkillTemplate {
  return {
    references: DESIGN_SKILL_REFERENCES,
    ...frontmatter,
    instructions: body,
  };
}
