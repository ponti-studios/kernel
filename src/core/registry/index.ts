import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  AgentTemplate,
  CommandTemplate,
  SkillTemplate,
  TemplateTag,
} from "../templates/types.js";
import { VALID_TAGS } from "../templates/types.js";
import { parseFrontmatter } from "../templates/frontmatter.js";

type GlobResult = Record<string, unknown>;

declare global {
  interface ImportMeta {
    glob(pattern: string, options?: { query?: string; import?: string; eager?: boolean }): GlobResult;
  }
}

export interface TemplateRegistry {
  skills: SkillTemplate[];
  agents: AgentTemplate[];
  commands: CommandTemplate[];
}

const DEFAULT_COMMAND_TARGETS = new Set([
  "init",
  "sync",
  "doctor",
  "initiative new",
  "initiative plan",
  "initiative status",
  "initiative list",
  "initiative done",
  "project new",
  "project plan",
  "project status",
  "project list",
  "project done",
  "milestone new",
  "milestone plan",
  "milestone status",
  "milestone list",
  "milestone done",
  "work new",
  "work plan",
  "work next",
  "work done",
  "work status",
  "work archive",
]);

const registryCache = new Map<string, TemplateRegistry>();

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return items.length > 0 ? items : undefined;
}

function validateTags(tags: unknown, filePath: string): TemplateTag[] | undefined {
  if (!Array.isArray(tags)) {
    return undefined;
  }
  const validTags: TemplateTag[] = [];
  for (const tag of tags) {
    if (typeof tag !== "string") {
      continue;
    }
    if (VALID_TAGS.includes(tag as TemplateTag)) {
      validTags.push(tag as TemplateTag);
    } else {
      console.warn(`Unknown tag '${tag}' in ${filePath}. Valid tags: ${VALID_TAGS.join(", ")}`);
    }
  }
  return validTags.length > 0 ? validTags : undefined;
}

function parseSkillTemplate(filePath: string, content: string): SkillTemplate {
  const { frontmatter, body } = parseFrontmatter<Record<string, unknown>>(content);
  const name = readString(frontmatter.name);
  const description = readString(frontmatter.description);
  if (!name || !description) {
    throw new Error(`Invalid skill template: missing name or description in ${filePath}`);
  }
  return {
    name,
    kind: "skill",
    tags: validateTags(frontmatter.tags, filePath),
    profile: frontmatter.profile as SkillTemplate["profile"],
    description,
    instructions: body,
    license: readString(frontmatter.license),
    compatibility: readString(frontmatter.compatibility),
    metadata:
      frontmatter.metadata && typeof frontmatter.metadata === "object"
        ? (frontmatter.metadata as SkillTemplate["metadata"])
        : undefined,
    when: readStringArray(frontmatter.when),
    applicability: readStringArray(frontmatter.applicability),
    termination: readStringArray(frontmatter.termination),
    outputs: readStringArray(frontmatter.outputs),
    dependencies: readStringArray(frontmatter.dependencies),
    role: readString(frontmatter.role),
    capabilities: readStringArray(frontmatter.capabilities),
    availableSkills: readStringArray(frontmatter.availableSkills),
    route: readString(frontmatter.route),
    references: undefined,
    disableModelInvocation: frontmatter.disableModelInvocation === true,
    userInvocable:
      typeof frontmatter.userInvocable === "boolean" ? frontmatter.userInvocable : undefined,
    argumentHint: readString(frontmatter.argumentHint),
    allowedTools: readStringArray(frontmatter.allowedTools),
  };
}

function parseAgentTemplate(filePath: string, content: string): AgentTemplate {
  const { frontmatter, body } = parseFrontmatter<Record<string, unknown>>(content);
  const name = readString(frontmatter.name);
  const description = readString(frontmatter.description);
  if (!name || !description) {
    throw new Error(`Invalid agent template: missing name or description in ${filePath}`);
  }
  return {
    name,
    kind: "agent",
    tags: validateTags(frontmatter.tags, filePath),
    profile: frontmatter.profile as AgentTemplate["profile"],
    description,
    instructions: body,
    license: readString(frontmatter.license),
    compatibility: readString(frontmatter.compatibility),
    metadata:
      frontmatter.metadata && typeof frontmatter.metadata === "object"
        ? (frontmatter.metadata as AgentTemplate["metadata"])
        : undefined,
    when: readStringArray(frontmatter.when),
    applicability: readStringArray(frontmatter.applicability),
    termination: readStringArray(frontmatter.termination),
    outputs: readStringArray(frontmatter.outputs),
    dependencies: readStringArray(frontmatter.dependencies),
    role: readString(frontmatter.role),
    capabilities: readStringArray(frontmatter.capabilities),
    availableSkills: readStringArray(frontmatter.availableSkills),
    route: readString(frontmatter.route),
    references: undefined,
    disableModelInvocation: frontmatter.disableModelInvocation === true,
    userInvocable:
      typeof frontmatter.userInvocable === "boolean" ? frontmatter.userInvocable : undefined,
    argumentHint: readString(frontmatter.argumentHint),
    allowedTools: readStringArray(frontmatter.allowedTools),
    defaultTools: readStringArray(frontmatter.defaultTools),
    acceptanceChecks: readStringArray(frontmatter.acceptanceChecks),
    model: readString(frontmatter.model),
    permissionMode: frontmatter.permissionMode as AgentTemplate["permissionMode"],
    sandboxMode: frontmatter.sandboxMode as AgentTemplate["sandboxMode"],
    reasoningEffort: frontmatter.reasoningEffort as AgentTemplate["reasoningEffort"],
    disallowedTools: readStringArray(frontmatter.disallowedTools),
    maxTurns: typeof frontmatter.maxTurns === "number" ? frontmatter.maxTurns : undefined,
    memory: frontmatter.memory as AgentTemplate["memory"],
    handoffs: Array.isArray(frontmatter.handoffs)
      ? (frontmatter.handoffs as AgentTemplate["handoffs"])
      : undefined,
  };
}

function parseCommandTemplate(filePath: string, content: string): CommandTemplate {
  const { frontmatter, body } = parseFrontmatter<Record<string, unknown>>(content);
  const name = readString(frontmatter.name);
  const description = readString(frontmatter.description);
  if (!name || !description) {
    throw new Error(`Invalid command template: missing name or description in ${filePath}`);
  }
  return {
    name,
    kind: "command",
    tags: validateTags(frontmatter.tags, filePath),
    description,
    instructions: body,
    argumentsHint: readString(frontmatter.argumentHint),
    target: readString(frontmatter.target),
    group: frontmatter.group as CommandTemplate["group"],
    allowedTools: readStringArray(frontmatter.allowedTools),
    backedBySkill: readString(frontmatter.backedBySkill),
    nativeOnly: frontmatter.nativeOnly === true,
  };
}

function validateRegistry(registry: TemplateRegistry): TemplateRegistry {
  const skillNames = new Set(registry.skills.map((template) => template.name));
  const agentNames = new Set(registry.agents.map((template) => template.name));

  for (const group of [registry.skills, registry.agents, registry.commands]) {
    const seen = new Set<string>();
    for (const template of group) {
      if (seen.has(template.name)) {
        throw new Error(`Duplicate ${template.kind} template name: ${template.name}`);
      }
      seen.add(template.name);
    }
  }

  for (const skill of registry.skills) {
    for (const dependency of skill.dependencies ?? []) {
      if (!skillNames.has(dependency)) {
        throw new Error(`Unknown skill dependency '${dependency}' in ${skill.name}`);
      }
    }
  }

  for (const agent of registry.agents) {
    for (const skillName of agent.availableSkills ?? []) {
      if (!skillNames.has(skillName)) {
        throw new Error(`Unknown available skill '${skillName}' in agent ${agent.name}`);
      }
    }
    for (const handoff of agent.handoffs ?? []) {
      if (!agentNames.has(handoff.agent)) {
        throw new Error(`Unknown handoff agent '${handoff.agent}' in agent ${agent.name}`);
      }
    }
  }

  for (const command of registry.commands) {
    if (command.backedBySkill && !skillNames.has(command.backedBySkill)) {
      throw new Error(`Unknown backedBySkill '${command.backedBySkill}' in command ${command.name}`);
    }
    if (command.target && !DEFAULT_COMMAND_TARGETS.has(command.target)) {
      throw new Error(`Unsupported command target '${command.target}' in command ${command.name}`);
    }
  }

  return registry;
}

export function resetTemplateRegistryCache(): void {
  registryCache.clear();
}

function loadFromFilesystem(): TemplateRegistry {
  const root = path.resolve(process.cwd(), "src/templates");
  const skillsDir = path.join(root, "skills");
  const agentsDir = path.join(root, "agents");
  const commandsDir = path.join(root, "commands");

  const skills: SkillTemplate[] = [];
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const filePath = path.join(skillsDir, entry.name, "SKILL.md");
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, "utf-8");
          const template = parseSkillTemplate(filePath, content);
          template.name = entry.name;
          skills.push(template);
        }
      }
    }
  }

  const agents: AgentTemplate[] = [];
  if (existsSync(agentsDir)) {
    for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const filePath = path.join(agentsDir, entry.name, "AGENT.md");
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, "utf-8");
          const template = parseAgentTemplate(filePath, content);
          template.name = entry.name;
          agents.push(template);
        }
      }
    }
  }

  const commands: CommandTemplate[] = [];
  if (existsSync(commandsDir)) {
    for (const entry of readdirSync(commandsDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const filePath = path.join(commandsDir, entry.name);
        const content = readFileSync(filePath, "utf-8");
        const template = parseCommandTemplate(filePath, content);
        template.name = entry.name.replace(".md", "");
        commands.push(template);
      }
    }
  }

  return validateRegistry({
    skills: skills.sort((left, right) => left.name.localeCompare(right.name)),
    agents: agents.sort((left, right) => left.name.localeCompare(right.name)),
    commands: commands.sort((left, right) => left.name.localeCompare(right.name)),
  });
}

function loadBundled(): TemplateRegistry {
  const skillFiles = import.meta.glob("../templates/skills/*/SKILL.md", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const agentFiles = import.meta.glob("../templates/agents/*/AGENT.md", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const commandFiles = import.meta.glob("../templates/commands/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const skills: SkillTemplate[] = [];
  for (const [filePath, content] of Object.entries(skillFiles)) {
    const dirName = filePath.split("/").slice(-2, -1)[0];
    try {
      const template = parseSkillTemplate(filePath, content as string);
      template.name = dirName;
      skills.push(template);
    } catch (error) {
      console.error(`Failed to parse skill ${filePath}:`, error);
    }
  }

  const agents: AgentTemplate[] = [];
  for (const [filePath, content] of Object.entries(agentFiles)) {
    const dirName = filePath.split("/").slice(-2, -1)[0];
    try {
      const template = parseAgentTemplate(filePath, content as string);
      template.name = dirName;
      agents.push(template);
    } catch (error) {
      console.error(`Failed to parse agent ${filePath}:`, error);
    }
  }

  const commands: CommandTemplate[] = [];
  for (const [filePath, content] of Object.entries(commandFiles)) {
    const fileName = filePath.split("/").pop()!.replace(".md", "");
    try {
      const template = parseCommandTemplate(filePath, content as string);
      template.name = fileName;
      commands.push(template);
    } catch (error) {
      console.error(`Failed to parse command ${filePath}:`, error);
    }
  }

  return validateRegistry({
    skills: skills.sort((left, right) => left.name.localeCompare(right.name)),
    agents: agents.sort((left, right) => left.name.localeCompare(right.name)),
    commands: commands.sort((left, right) => left.name.localeCompare(right.name)),
  });
}

export function loadTemplateRegistry(): TemplateRegistry {
  const cacheKey = "bundled";
  const cached = registryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let registry: TemplateRegistry;

  try {
    const skillFiles = import.meta.glob("../templates/skills/*/SKILL.md", {
      query: "?raw",
      import: "default",
      eager: true,
    });
    const hasBundled = skillFiles && Object.keys(skillFiles).length > 0;
    registry = hasBundled ? loadBundled() : loadFromFilesystem();
  } catch {
    registry = loadFromFilesystem();
  }

  registryCache.set(cacheKey, registry);
  return registry;
}

export function getTemplateRootStat(): number {
  return Date.now();
}
