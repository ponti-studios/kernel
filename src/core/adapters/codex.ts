/**
 * Codex (OpenAI) adapter
 *
 * Formats skills and agents for OpenAI Codex.
 *
 * Directory conventions (Codex-native):
 * - Skills:         .codex/skills/<name>/SKILL.md
 * - Agents:         .codex/agents/<name>.toml  (TOML config file)
 *
 * Agent TOML fields (https://developers.openai.com/codex/subagents):
 * - name                    agent identifier (source of truth; filename is convention)
 * - description             when/why to use this agent
 * - developer_instructions  TOML multiline string (""" ... """)
 * - nickname_candidates     optional display name pool (string array)
 * - model                   model override
 * - model_reasoning_effort  low | medium | high
 * - sandbox_mode            read-only | workspace-write | danger-full-access
 * - [[skills.config]]       TOML array of { path, enabled? } skill references
 *
 * Skills are NOT preloaded at startup — Codex loads full SKILL.md on demand.
 * Only skill metadata (name, description) is always in context.
 *
 * Reference: https://developers.openai.com/codex/subagents
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";
import {
  closeSkillFrontmatter,
  formatBaseSkillFrontmatter,
  formatCompatibilityCommand,
} from "./shared.js";

/** Escape a string value for a TOML basic string (single-line) */
function escapeTomlString(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  return `"${escaped}"`;
}

/** Escape content for a TOML multiline literal string (triple-quote) */
function toTomlMultilineString(value: string): string {
  // TOML multiline basic strings: """ ... """ — escape any \" sequences inside
  const escaped = value.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
  return `"""\n${escaped}\n"""`;
}

export const codexAdapter: ToolCommandAdapter = {
  toolId: "codex",
  toolName: "OpenAI Codex",
  skillsDir: ".codex",

  getAgentPath(agentName: string): string {
    return path.join(".codex", "agents", `${agentName}.toml`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".codex", "skills", skillName, "SKILL.md");
  },

  getCommandPath(commandName: string): string {
    return path.join(".codex", "commands", `${commandName}.md`);
  },

  formatAgent(template: AgentTemplate, version: string): string {
    const lines: string[] = [
      `name = ${escapeTomlString(template.name)}`,
      `description = ${escapeTomlString(template.description)}`,
    ];

    if (template.model) {
      lines.push(`model = ${escapeTomlString(template.model)}`);
    }

    if (template.sandboxMode) {
      lines.push(`sandbox_mode = ${escapeTomlString(template.sandboxMode)}`);
    }

    if (template.reasoningEffort) {
      lines.push(`model_reasoning_effort = ${escapeTomlString(template.reasoningEffort)}`);
    }

    let instructions = template.instructions.trim();
    if (template.acceptanceChecks && template.acceptanceChecks.length > 0) {
      instructions += `\n\n## Acceptance checks\n\nYou are done when all of these are true:\n\n${template.acceptanceChecks.map((c) => `- ${c}`).join("\n")}`;
    }

    lines.push("");
    lines.push(`developer_instructions = ${toTomlMultilineString(instructions)}`);

    if (template.availableSkills && template.availableSkills.length > 0) {
      for (const skill of template.availableSkills) {
        lines.push("");
        lines.push(`[[skills.config]]`);
        lines.push(`path = ${escapeTomlString(path.join(".codex", "skills", skill, "SKILL.md"))}`);
      }
    }

    return lines.join("\n");
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(formatBaseSkillFrontmatter(template, version), template.instructions);
  },

  formatCommand(template: CommandTemplate, version: string): string {
    return formatCompatibilityCommand(template, version, "OpenAI Codex");
  },
};
