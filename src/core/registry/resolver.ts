import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";
import type { TemplateRegistry } from "./index.js";

export interface ResolvedCatalog {
  skills: SkillTemplate[];
  agents: AgentTemplate[];
  commands: CommandTemplate[];
}

export function resolveCatalog(registry: TemplateRegistry): ResolvedCatalog {
  const skillNames = new Set(registry.skills.map((template) => template.name));

  const skills = registry.skills;
  const agents = registry.agents.filter((template) =>
    (template.availableSkills ?? []).every((skillName) => skillNames.has(skillName)),
  );
  const commands = registry.commands.filter(
    (template) => !template.backedBySkill || skillNames.has(template.backedBySkill),
  );

  return { skills, agents, commands };
}
