import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import proposeSkillMarkdown from "./instructions.md";
import { PROPOSE_SKILL_REFERENCES } from "./reference-bundle.js";

const { frontmatter, body } =
  parseFrontmatter<Omit<SkillTemplate, "instructions" | "references">>(proposeSkillMarkdown);

export function getProposeSkillTemplate(): SkillTemplate {
  return {
    references: PROPOSE_SKILL_REFERENCES,
    ...frontmatter,
    instructions: body,
  };
}
