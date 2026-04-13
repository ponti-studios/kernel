/**
 * Claude Code adapter
 *
 * Formats skills and agents for Claude Code.
 *
 * Directory conventions (open agent skills standard + Claude-native):
 * - Skills:         .claude/skills/<name>/SKILL.md
 * - Commands:       .claude/commands/kernel/<id>.md  (also creates the matching slash command)
 * - Agents:         .claude/agents/<name>.md  (YAML frontmatter + markdown body)
 *
 * Agent frontmatter fields (https://code.claude.com/docs/en/sub-agents):
 * - name             unique identifier (required)
 * - description      when Claude should delegate (required)
 * - tools            comma-separated allowlist; inherits all if omitted
 * - disallowedTools  tools to deny; removed from inherited or specified list
 * - model            sonnet | opus | haiku | <full-id> | inherit  (default: inherit)
 * - permissionMode   default | acceptEdits | dontAsk | bypassPermissions | plan
 * - maxTurns         max agentic turns before agent stops
 * - skills           skill names to FULLY INJECT into agent context at startup
 * - memory           user | project | local
 * - background       true to always run as background task
 * - mcpServers       MCP servers scoped to this agent
 * - hooks            lifecycle hooks scoped to this agent
 *
 * IMPORTANT: skills listed in the `skills:` frontmatter have their full SKILL.md
 * content injected at startup — they are preloaded, not just made available.
 *
 * Skill frontmatter fields (https://code.claude.com/docs/en/skills):
 * - name                      display name
 * - description               when to use; always in context
 * - disable-model-invocation  true = only user can invoke; removed from model context
 * - user-invocable            false = hide from / menu; model-only
 * - allowed-tools             tools agent can use without per-use approval
 * - model                     model override when skill is active
 * - context                   fork = run in isolated subagent
 * - agent                     which agent to use with context: fork
 * - hooks                     hooks scoped to skill lifecycle
 */

import path from "path";
import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";
import {
  closeSkillFrontmatter,
  closeCommandFrontmatter,
  escapeYamlValue,
  formatCommandFrontmatter,
  formatFullSkillFrontmatter,
  formatManifestContent,
} from "./shared.js";
import type { ToolCommandAdapter } from "./types.js";

/** Maps AgentTemplate.defaultTools values to Claude Code tool names */
function resolveClaudeTools(defaultTools: string[] = []): string {
  const toolMap: Record<string, string[]> = {
    read: ["Read"],
    search: ["Grep", "Glob"],
    edit: ["Edit", "Write"],
    web: ["WebSearch", "WebFetch"],
    task: ["Bash"],
    look_at: ["Read", "Glob"],
    delegate_task: ["Agent"],
  };
  const resolved = new Set<string>();
  for (const tool of defaultTools) {
    for (const mapped of toolMap[tool] ?? []) {
      resolved.add(mapped);
    }
  }
  return [...resolved].join(", ") || "Read, Grep, Glob";
}

export const claudeAdapter: ToolCommandAdapter = {
  toolId: "claude",
  toolName: "Claude Code",
  skillsDir: ".claude",

  getAgentPath(agentName: string): string {
    return path.join(".claude", "agents", `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".claude", "skills", skillName, "SKILL.md");
  },

  getCommandPath(commandName: string): string {
    return path.join(".claude", "commands", "kernel", `${commandName}.md`);
  },

  formatAgent(template: AgentTemplate, version: string): string {
    const tools = resolveClaudeTools(template.defaultTools);
    const frontmatterLines = [
      `name: ${template.name}`,
      `description: ${escapeYamlValue(template.description)}`,
      `tools: ${tools}`,
    ];

    if (template.disallowedTools && template.disallowedTools.length > 0) {
      frontmatterLines.push(`disallowedTools: ${template.disallowedTools.join(", ")}`);
    }
    if (template.model) {
      frontmatterLines.push(`model: ${template.model}`);
    }
    if (template.permissionMode) {
      frontmatterLines.push(`permissionMode: ${template.permissionMode}`);
    }
    if (template.maxTurns !== undefined) {
      frontmatterLines.push(`maxTurns: ${template.maxTurns}`);
    }
    if (template.memory) {
      frontmatterLines.push(`memory: ${template.memory}`);
    }
    if (template.availableSkills && template.availableSkills.length > 0) {
      frontmatterLines.push(`skills:\n  - ${template.availableSkills.join("\n  - ")}`);
    }

    let body = template.instructions;
    if (template.acceptanceChecks && template.acceptanceChecks.length > 0) {
      body += `\n\n## Acceptance checks\n\nYou are done when all of these are true:\n\n${template.acceptanceChecks.map((c) => `- ${c}`).join("\n")}`;
    }

    return `---\n${frontmatterLines.join("\n")}\n---\n\n${body}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return closeSkillFrontmatter(
      formatFullSkillFrontmatter(template, version),
      template.instructions,
    );
  },

  formatCommand(template: CommandTemplate, version: string): string {
    const lines = formatCommandFrontmatter(template, version);
    lines.push("native-command: true");
    return closeCommandFrontmatter(lines, template.instructions);
  },

  getManifestPath(): string {
    return path.join(".claude", "skills-index.md");
  },

  formatManifest(skills: SkillTemplate[], version: string): string {
    return formatManifestContent(skills, version);
  },
};
