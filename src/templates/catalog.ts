import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../core/templates/types.js";
import { loadTemplateRegistry } from "../core/registry/index.js";

export function getDefaultSkillTemplates(): SkillTemplate[] {
  return loadTemplateRegistry().skills;
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return loadTemplateRegistry().agents;
}

export function getDefaultCommandTemplates(): CommandTemplate[] {
  return loadTemplateRegistry().commands;
}
