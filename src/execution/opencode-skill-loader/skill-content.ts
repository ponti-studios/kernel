import { createSkills } from "../../skills/skills";
import { discoverSkills } from "./loader";
import type { LoadedSkill } from "./types";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../../integration/shared/frontmatter";
import { readFileSync } from "node:fs";
import type { GitMasterConfig } from "../../platform/config/runtime.schema";
import type { BrowserAutomationProvider } from "../../platform/config/names.schema";

export interface SkillResolutionOptions {
  gitMasterConfig?: GitMasterConfig;
  browserProvider?: BrowserAutomationProvider;
}

const cachedSkillsByProvider = new Map<string, LoadedSkill[]>();

export function createSkillResolutionDigest(skills: LoadedSkill[]): string {
  const digestPayload = skills
    .map((skill) => `${skill.name}|${skill.scope}|${skill.resolvedPath ?? ""}|${skill.path ?? ""}`)
    .join("\n");

  return createHash("sha256").update(digestPayload, "utf8").digest("hex");
}

function clearSkillCache(): void {
  cachedSkillsByProvider.clear();
}

async function getAllSkills(options?: SkillResolutionOptions): Promise<LoadedSkill[]> {
  const cacheKey = options?.browserProvider ?? "playwright";
  const cached = cachedSkillsByProvider.get(cacheKey);
  if (cached) return cached;

  const [discoveredSkills, skillDefs] = await Promise.all([
    discoverSkills({ includeClaudeCodePaths: true }),
    Promise.resolve(createSkills({ browserProvider: options?.browserProvider })),
  ]);

  // Always source browser skills from built-ins so provider selection stays deterministic.
  const filteredDiscoveredSkills = discoveredSkills.filter(
    (skill) => skill.name !== "playwright" && skill.name !== "agent-browser",
  );

  const skillsAsLoaded: LoadedSkill[] = skillDefs.map((skill) => ({
    name: skill.name,
    definition: {
      name: skill.name,
      description: skill.description,
      template: skill.template,
      model: skill.model,
      agent: skill.agent,
      subtask: skill.subtask,
    },
    scope: "plugin" as const,
    license: skill.license,
    compatibility: skill.compatibility,
    metadata: skill.metadata as Record<string, string> | undefined,
    allowedTools: skill.allowedTools,
    mcpConfig: skill.mcpConfig,
  }));

  const discoveredNames = new Set(filteredDiscoveredSkills.map((s) => s.name));
  const uniqueSkills = skillsAsLoaded.filter((s) => !discoveredNames.has(s.name));

  const allSkills = [...filteredDiscoveredSkills, ...uniqueSkills];
  cachedSkillsByProvider.set(cacheKey, allSkills);
  return allSkills;
}

async function extractSkillTemplate(skill: LoadedSkill): Promise<string> {
  if (skill.path) {
    const content = readFileSync(skill.path, "utf-8");
    const { body } = parseFrontmatter(content);
    return body.trim();
  }
  return skill.definition.template || "";
}

export { clearSkillCache, getAllSkills, extractSkillTemplate };

export function injectGitMasterConfig(template: string, config?: GitMasterConfig): string {
  const commitFooter = config?.commit_footer ?? true;
  const includeCoAuthoredBy = config?.include_co_authored_by ?? true;

  if (!commitFooter && !includeCoAuthoredBy) {
    return template;
  }

  const sections: string[] = [];

  sections.push(`### 5.5 Commit Footer & Co-Author`);
  sections.push(``);
  sections.push(`Add ghost attribution to EVERY commit:`);
  sections.push(``);

  if (commitFooter) {
    sections.push(`1. **Footer in commit body:**`);
    sections.push("```");
    sections.push(`Ultraworked with [ghost](https://github.com/hackefeller/ghostwire)`);
    sections.push("```");
    sections.push(``);
  }

  if (includeCoAuthoredBy) {
    sections.push(`${commitFooter ? "2" : "1"}. **Co-authored-by trailer:**`);
    sections.push("```");
    sections.push(`Co-authored-by: ghost <clio-agent@ghostwire.ai>`);
    sections.push("```");
    sections.push(``);
  }

  if (commitFooter && includeCoAuthoredBy) {
    sections.push(`**Example (both enabled):**`);
    sections.push("```bash");
    sections.push(
      `git commit -m "{Commit Message}" -m "Ultraworked with [ghost](https://github.com/hackefeller/ghostwire)" -m "Co-authored-by: ghost <clio-agent@ghostwire.ai>"`,
    );
    sections.push("```");
  } else if (commitFooter) {
    sections.push(`**Example:**`);
    sections.push("```bash");
    sections.push(
      `git commit -m "{Commit Message}" -m "Ultraworked with [ghost](https://github.com/hackefeller/ghostwire)"`,
    );
    sections.push("```");
  } else if (includeCoAuthoredBy) {
    sections.push(`**Example:**`);
    sections.push("```bash");
    sections.push(
      `git commit -m "{Commit Message}" -m "Co-authored-by: ghost <clio-agent@ghostwire.ai>"`,
    );
    sections.push("```");
  }

  const injection = sections.join("\n");

  const insertionPoint = template.indexOf("```\n</execution>");
  if (insertionPoint !== -1) {
    return (
      template.slice(0, insertionPoint) +
      "```\n\n" +
      injection +
      "\n</execution>" +
      template.slice(insertionPoint + "```\n</execution>".length)
    );
  }

  return template + "\n\n" + injection;
}

export function resolveMultipleSkills(
  skillNames: string[],
  options?: SkillResolutionOptions,
): {
  resolved: Map<string, string>;
  notFound: string[];
} {
  const skills = createSkills({
    browserProvider: options?.browserProvider,
  });
  const skillMap = new Map(skills.map((s) => [s.name, s.template]));

  const resolved = new Map<string, string>();
  const notFound: string[] = [];

  for (const name of skillNames) {
    const template = skillMap.get(name);
    if (template) {
      if (name === "git-master") {
        resolved.set(name, injectGitMasterConfig(template, options?.gitMasterConfig));
      } else {
        resolved.set(name, template);
      }
    } else {
      notFound.push(name);
    }
  }

  return { resolved, notFound };
}

export async function resolveMultipleSkillsAsync(
  skillNames: string[],
  options?: SkillResolutionOptions,
): Promise<{
  resolved: Map<string, string>;
  notFound: string[];
}> {
  const allSkills = await getAllSkills(options);
  const skillMap = new Map<string, LoadedSkill>();
  for (const skill of allSkills) {
    skillMap.set(skill.name, skill);
  }
  const skillFallbackMap = new Map(
    createSkills({ browserProvider: options?.browserProvider }).map((skill) => [
      skill.name,
      skill.template,
    ]),
  );

  const resolved = new Map<string, string>();
  const notFound: string[] = [];

  for (const name of skillNames) {
    const skill = skillMap.get(name);
    if (skill) {
      const template = await extractSkillTemplate(skill);
      if (name === "git-master") {
        resolved.set(name, injectGitMasterConfig(template, options?.gitMasterConfig));
      } else {
        resolved.set(name, template);
      }
    } else {
      const skillTemplate = skillFallbackMap.get(name);
      if (skillTemplate) {
        if (name === "git-master") {
          resolved.set(name, injectGitMasterConfig(skillTemplate, options?.gitMasterConfig));
        } else {
          resolved.set(name, skillTemplate);
        }
      } else {
        notFound.push(name);
      }
    }
  }

  return { resolved, notFound };
}
