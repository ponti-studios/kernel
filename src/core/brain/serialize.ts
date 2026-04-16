import * as yaml from "yaml";
import type { AgentTemplate, SkillTemplate, TemplateTag } from "../templates/types.js";
import { parseFrontmatter } from "../templates/frontmatter.js";

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.filter((item): item is string => typeof item === "string");
  return items.length > 0 ? items : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function serializeAgentTemplate(template: AgentTemplate): string {
  const frontmatter = {
    name: template.name,
    kind: template.kind,
    tags: template.tags,
    description: template.description,
    license: template.license,
    compatibility: template.compatibility,
    metadata: template.metadata,
    role: template.role,
    route: template.route,
    capabilities: template.capabilities,
    availableSkills: template.availableSkills,
    defaultTools: template.defaultTools,
    allowedTools: template.allowedTools,
    acceptanceChecks: template.acceptanceChecks,
    argumentHint: template.argumentHint,
    model: template.model,
    permissionMode: template.permissionMode,
    sandboxMode: template.sandboxMode,
    reasoningEffort: template.reasoningEffort,
    disallowedTools: template.disallowedTools,
    maxTurns: template.maxTurns,
    memory: template.memory,
    handoffs: template.handoffs,
  };
  return `---\n${yaml.stringify(frontmatter).trim()}\n---\n\n${template.instructions.trim()}\n`;
}

export function parseAgentDocument(content: string): AgentTemplate {
  const { frontmatter, body } = parseFrontmatter<Record<string, unknown>>(content);
  return {
    name: readString(frontmatter.name) ?? "kernel-agent",
    kind: "agent",
    tags: frontmatter.tags as TemplateTag[] | undefined,
    description: readString(frontmatter.description) ?? "Kernel agent",
    instructions: body,
    license: readString(frontmatter.license),
    compatibility: readString(frontmatter.compatibility),
    role: readString(frontmatter.role),
    route: readString(frontmatter.route),
    capabilities: stringArray(frontmatter.capabilities),
    availableSkills: stringArray(frontmatter.availableSkills),
    defaultTools: stringArray(frontmatter.defaultTools),
    allowedTools: stringArray(frontmatter.allowedTools),
    acceptanceChecks: stringArray(frontmatter.acceptanceChecks),
    argumentHint: readString(frontmatter.argumentHint),
    model: readString(frontmatter.model),
    permissionMode: frontmatter.permissionMode as AgentTemplate["permissionMode"],
    sandboxMode: frontmatter.sandboxMode as AgentTemplate["sandboxMode"],
    reasoningEffort: frontmatter.reasoningEffort as AgentTemplate["reasoningEffort"],
    disallowedTools: stringArray(frontmatter.disallowedTools),
    maxTurns: typeof frontmatter.maxTurns === "number" ? frontmatter.maxTurns : undefined,
    memory: frontmatter.memory as AgentTemplate["memory"],
    handoffs: Array.isArray(frontmatter.handoffs)
      ? (frontmatter.handoffs as AgentTemplate["handoffs"])
      : undefined,
  };
}

export function parseSkillDocument(content: string): SkillTemplate {
  const { frontmatter, body } = parseFrontmatter<Record<string, unknown>>(content);
  return {
    name: readString(frontmatter.name) ?? "kernel-skill",
    kind: "skill",
    tags: frontmatter.tags as TemplateTag[] | undefined,
    description: readString(frontmatter.description) ?? "",
    instructions: body,
    license: readString(frontmatter.license),
    compatibility: readString(frontmatter.compatibility),
    metadata:
      frontmatter.metadata && typeof frontmatter.metadata === "object"
        ? (frontmatter.metadata as SkillTemplate["metadata"])
        : undefined,
    when: stringArray(frontmatter.when),
    applicability: stringArray(frontmatter.applicability),
    termination: stringArray(frontmatter.termination),
    outputs: stringArray(frontmatter.outputs),
    dependencies: stringArray(frontmatter.dependencies),
    role: readString(frontmatter.role),
    capabilities: stringArray(frontmatter.capabilities),
    availableSkills: stringArray(frontmatter.availableSkills),
    route: readString(frontmatter.route),
    disableModelInvocation: frontmatter.disableModelInvocation === true,
    userInvocable:
      typeof frontmatter.userInvocable === "boolean" ? frontmatter.userInvocable : undefined,
    argumentHint: readString(frontmatter.argumentHint),
    allowedTools: stringArray(frontmatter.allowedTools),
  };
}
