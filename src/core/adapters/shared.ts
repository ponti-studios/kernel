/**
 * Shared adapter utilities
 *
 * Common formatting functions used across multiple tool adapters.
 * Import from here — never reimplement locally in an adapter.
 */

import type { AgentTemplate, CommandTemplate, SkillTemplate } from "../templates/types.js";

// ─── YAML helpers ─────────────────────────────────────────────────────────────

export function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  return value;
}

export function formatYamlList(key: string, items: string[]): string {
  return `${key}:\n${items.map((item) => `  - ${item}`).join("\n")}`;
}

// ─── Skill frontmatter ────────────────────────────────────────────────────────

/**
 * Base skill frontmatter — the 9-line block shared by every adapter.
 * Returns lines without the closing `---` so adapters can append
 * extra fields before finalising.
 */
export function formatBaseSkillFrontmatter(template: SkillTemplate, version: string): string[] {
  const lines = [
    "---",
    `name: ${template.name}`,
    `description: ${escapeYamlValue(template.description)}`,
    `license: ${template.license || "MIT"}`,
    `compatibility: ${template.compatibility || "Requires the CLI."}`,
    "metadata:",
    `  author: ${template.metadata?.author || "project"}`,
    `  version: "${template.metadata?.version || "1.0"}"`,
    `  generatedBy: "${version}"`,
  ];

  if (template.metadata?.category) {
    lines.push(`  category: ${template.metadata.category}`);
  }

  if (template.metadata?.tags && template.metadata.tags.length > 0) {
    lines.push(`  tags: [${template.metadata.tags.join(", ")}]`);
  }

  return lines;
}

/**
 * Full skill frontmatter including lifecycle fields (when, applicability,
 * termination, outputs, dependencies) and the optional Claude-specific
 * disable-model-invocation flag. Used by adapters that surface these fields
 * to the AI (Claude Code).
 */
export function formatFullSkillFrontmatter(template: SkillTemplate, version: string): string[] {
  const lines = formatBaseSkillFrontmatter(template, version);

  if (template.when && template.when.length > 0) {
    lines.push(formatYamlList("when", template.when));
  }
  if (template.applicability && template.applicability.length > 0) {
    lines.push(formatYamlList("applicability", template.applicability));
  }
  if (template.termination && template.termination.length > 0) {
    lines.push(formatYamlList("termination", template.termination));
  }
  if (template.outputs && template.outputs.length > 0) {
    lines.push(formatYamlList("outputs", template.outputs));
  }
  if (template.dependencies && template.dependencies.length > 0) {
    lines.push(formatYamlList("dependencies", template.dependencies));
  }
  if (template.disableModelInvocation) {
    lines.push("disable-model-invocation: true");
  }
  if (template.userInvocable === false) {
    lines.push("user-invocable: false");
  }
  if (template.argumentHint) {
    lines.push(`argument-hint: ${escapeYamlValue(template.argumentHint)}`);
  }
  if (template.allowedTools && template.allowedTools.length > 0) {
    lines.push(`allowed-tools: ${template.allowedTools.join(", ")}`);
  }

  return lines;
}

/**
 * Finalise a frontmatter lines array into a complete skill file string.
 */
export function closeSkillFrontmatter(lines: string[], instructions: string): string {
  return [...lines, "---", "", instructions].join("\n");
}

// ─── Command formatting ───────────────────────────────────────────────────────

export function formatCommandFrontmatter(template: CommandTemplate, version: string): string[] {
  const lines = [
    "---",
    `name: ${template.name}`,
    `description: ${escapeYamlValue(template.description)}`,
    "metadata:",
    "  author: project",
    `  generatedBy: "${version}"`,
  ];

  if (template.backedBySkill) {
    lines.push(`backed-by-skill: ${template.backedBySkill}`);
  }
  if (template.argumentsHint) {
    lines.push(`argument-hint: ${escapeYamlValue(template.argumentsHint)}`);
  }
  if (template.allowedTools && template.allowedTools.length > 0) {
    lines.push(`allowed-tools: ${template.allowedTools.join(", ")}`);
  }

  return lines;
}

export function closeCommandFrontmatter(lines: string[], instructions: string): string {
  return [...lines, "---", "", instructions].join("\n");
}

export function formatCompatibilityCommand(
  template: CommandTemplate,
  version: string,
  toolName: string,
): string {
  const lines = formatCommandFrontmatter(template, version);
  lines.push("native-command: false");
  lines.push(`tool: ${escapeYamlValue(toolName)}`);

  let body = template.instructions.trim();
  if (template.backedBySkill) {
    body += `\n\n## Kernel Routing\n\n- Preferred backing skill: ${template.backedBySkill}\n- Preserve the legacy command name and behavior when invoking this workflow.`;
  }

  return closeCommandFrontmatter(lines, body);
}

// ─── Agent body ───────────────────────────────────────────────────────────────

/**
 * Shared agent body for tools that support an `## Available skills` section
 * (GitHub Copilot, Gemini). Skills are NOT preloaded — the section
 * is informational only.
 */
export function formatAgentBody(template: AgentTemplate): string {
  const sections: string[] = [template.instructions];

  if (template.acceptanceChecks && template.acceptanceChecks.length > 0) {
    sections.push(
      `## Acceptance checks\n\nYou are done when all of these are true:\n\n${template.acceptanceChecks.map((c) => `- ${c}`).join("\n")}`,
    );
  }

  if (template.availableSkills && template.availableSkills.length > 0) {
    sections.push(
      `## Available skills\n\n${template.availableSkills.map((s) => `- ${s}`).join("\n")}`,
    );
  }

  return sections.join("\n\n");
}

// ─── Manifest ─────────────────────────────────────────────────────────────────

/**
 * Shared skills-index manifest body used by adapters that emit a discovery
 * manifest (Claude Code). The path is handled by each adapter's
 * getManifestPath(); only the content is shared here.
 */
export function formatManifestContent(skills: SkillTemplate[], version: string): string {
  const lines = [
    "---",
    "generated: true",
    `version: "${version}"`,
    "---",
    "",
    "# Skills Index",
    "",
    "This file is auto-generated. Agents can read it at session start",
    "to discover available skills and route user goals without slash commands.",
    "",
  ];

  for (const skill of skills) {
    lines.push(`## ${skill.name}`);
    lines.push("");
    lines.push(`**Description**: ${skill.description}`);
    if (skill.role) {
      lines.push(`**Role**: ${skill.role}`);
    }
    if (skill.route) {
      lines.push(`**Route**: ${skill.route}`);
    }
    if (skill.capabilities && skill.capabilities.length > 0) {
      lines.push(`**Capabilities**: ${skill.capabilities.join(", ")}`);
    }
    if (skill.when && skill.when.length > 0) {
      lines.push(`**When**: ${skill.when.join("; ")}`);
    }
    if (skill.applicability && skill.applicability.length > 0) {
      lines.push(`**Applicability**: ${skill.applicability.join("; ")}`);
    }
    if (skill.outputs && skill.outputs.length > 0) {
      lines.push(`**Outputs**: ${skill.outputs.join(", ")}`);
    }
    if (skill.termination && skill.termination.length > 0) {
      lines.push(`**Done when**: ${skill.termination.join("; ")}`);
    }
    if (skill.dependencies && skill.dependencies.length > 0) {
      lines.push(`**Depends on**: ${skill.dependencies.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
