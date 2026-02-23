import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { existsSync } from "node:fs";
import { readFile, writeFile, unlink, readdir, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { getOpenCodeConfigDir } from "../../../platform/opencode/config-dir";
import type { SkillScope } from "../../features/opencode-skill-loader/types";
import { discoverSkills } from "../../features/opencode-skill-loader/loader";
import { clearSkillCache } from "../../features/opencode-skill-loader/skill-content";
import { parseFrontmatter } from "../../../integration/shared/frontmatter";
import type {
  SkillCreateArgs,
  SkillUpdateArgs,
  SkillDeleteArgs,
  SkillListArgs,
  SkillInfo,
} from "./types";

const BUILTIN_PREFIX = "builtin";

function isBuiltinSkill(name: string): boolean {
  return (
    name.startsWith(BUILTIN_PREFIX) ||
    name === "playwright" ||
    name === "agent-browser" ||
    name === "git-master"
  );
}

function getSkillDirs(): { project: string; user: string } {
  const configDir = getOpenCodeConfigDir({ binary: "opencode" });
  return {
    project: join(process.cwd(), ".opencode", "skills"),
    user: join(configDir, "skills"),
  };
}

async function findSkillFile(name: string): Promise<{ path: string; scope: SkillScope } | null> {
  const dirs = getSkillDirs();

  // Check project skills
  if (existsSync(dirs.project)) {
    try {
      const files = await readdir(dirs.project);
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const skillPath = join(dirs.project, file);
        try {
          const content = await readFile(skillPath, "utf-8");
          const { data } = parseFrontmatter<Record<string, string>>(content);
          if (data.name === name) {
            return { path: skillPath, scope: "opencode-project" };
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Ignore
    }
  }

  // Check user skills
  if (existsSync(dirs.user)) {
    try {
      const files = await readdir(dirs.user);
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const skillPath = join(dirs.user, file);
        try {
          const content = await readFile(skillPath, "utf-8");
          const { data } = parseFrontmatter<Record<string, string>>(content);
          if (data.name === name) {
            return { path: skillPath, scope: "user" };
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

function formatSkillList(skills: SkillInfo[]): string {
  if (skills.length === 0) {
    return "No skills found";
  }

  let result = "Available Skills:\n\n";

  const builtin = skills.filter((s) => s.scope === "builtin");
  const project = skills.filter((s) => s.scope === "opencode-project");
  const user = skills.filter((s) => s.scope === "user");

  if (builtin.length > 0) {
    result += "### Built-in\n";
    for (const skill of builtin) {
      result += `- **${skill.name}**: ${skill.description}\n`;
    }
    result += "\n";
  }

  if (project.length > 0) {
    result += "### Project\n";
    for (const skill of project) {
      result += `- **${skill.name}**: ${skill.description}\n`;
    }
    result += "\n";
  }

  if (user.length > 0) {
    result += "### User\n";
    for (const skill of user) {
      result += `- **${skill.name}**: ${skill.description}\n`;
    }
  }

  return result;
}

function generateSkillTemplate(name: string, description: string, templateType: string): string {
  const templates: Record<string, string> = {
    agent: `---
name: ${name}
description: ${description}
agent: 
model:
---

# ${name} Agent

## Role

## Capabilities

## Instructions

## Output Format
`,
    tool: `---
name: ${name}
description: ${description}
---

# ${name} Tool

## Purpose

## Input Schema

## Output Schema

## Examples
`,
    analysis: `---
name: ${name}
description: ${description}
---

# ${name} Analysis

## Focus Areas

## Methodology

## Findings Format
`,
    hook: `---
name: ${name}
description: ${description}
---

# ${name} Hook

## Trigger

## Behavior

## Configuration
`,
  };

  return templates[templateType] || templates.agent;
}

export const skill_list: ToolDefinition = tool({
  description: `List all available skills with their metadata.

Shows builtin skills, project skills, and user skills. Use to discover available capabilities.

Arguments:
- scope (optional): Filter by scope - "builtin", "project", "user", "all" (default: "all")

Example:
skill_list()
Lists all available skills`,
  args: {
    scope: tool.schema
      .enum(["builtin", "project", "user", "all"])
      .optional()
      .describe("Filter by scope"),
  },
  execute: async (args: SkillListArgs) => {
    try {
      const loadedSkills = await discoverSkills({ includeClaudeCodePaths: true });

      // Also get builtin skills
      const { createBuiltinSkills } = await import("../../features/skills/skills");
      const builtinDefs = createBuiltinSkills({});
      const builtinSkills: SkillInfo[] = builtinDefs.map((s) => ({
        name: s.name,
        description: s.description,
        scope: "builtin" as SkillScope,
        metadata: s.metadata as Record<string, string> | undefined,
      }));

      // Convert loaded skills to SkillInfo
      const discoveredSkills: SkillInfo[] = loadedSkills.map((s) => ({
        name: s.name,
        description: s.definition.description || "",
        scope: s.scope,
        metadata: s.metadata as Record<string, string> | undefined,
      }));

      // Combine and filter
      let allSkills = [...builtinSkills, ...discoveredSkills];

      // Remove duplicates (discovered overrides builtin with same name)
      const seen = new Set<string>();
      allSkills = allSkills.filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      });

      // Filter by scope
      if (args.scope && args.scope !== "all") {
        const scopeMap: Record<string, SkillScope[]> = {
          builtin: ["builtin"],
          project: ["opencode-project"],
          user: ["user", "opencode"],
        };
        const allowed = scopeMap[args.scope] || [];
        allSkills = allSkills.filter((s) => allowed.includes(s.scope));
      }

      return formatSkillList(allSkills);
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});

export const skill_create: ToolDefinition = tool({
  description: `Create a new skill from a template.

Creates a new SKILL.md file in the project's .opencode/skills/ directory or user's ~/.config/opencode/skills/ directory.

Arguments:
- name (required): Skill name (kebab-case, alphanumeric + hyphens)
- description (required): Skill description (10-200 chars)
- template (optional): Template type - "agent", "tool", "analysis", "hook" (default: "agent")
- scope (optional): "project" or "user" (default: "project")
- content (optional): Full SKILL.md content (replaces template)

Example:
skill_create(name="security-audit", description="Analyze code for security issues", template="analysis")`,
  args: {
    name: tool.schema.string().describe("Skill name (kebab-case)"),
    description: tool.schema.string().describe("Skill description (10-200 chars)"),
    template: tool.schema
      .enum(["agent", "tool", "analysis", "hook"])
      .optional()
      .describe("Template type (default: agent)"),
    scope: tool.schema.enum(["project", "user"]).optional().describe("Scope (default: project)"),
    content: tool.schema.string().optional().describe("Full SKILL.md content (replaces template)"),
  },
  execute: async (args: SkillCreateArgs) => {
    try {
      // Validate name
      if (!/^[a-z0-9-]+$/.test(args.name)) {
        return "Error: Name must be kebab-case (lowercase alphanumeric with hyphens)";
      }

      if (isBuiltinSkill(args.name)) {
        return `Error: Cannot create skill with reserved name "${args.name}"`;
      }

      // Validate description
      if (args.description.length < 10 || args.description.length > 200) {
        return "Error: Description must be 10-200 characters";
      }

      // Determine directory
      const dirs = getSkillDirs();
      const targetDir = args.scope === "user" ? dirs.user : dirs.project;

      // Create directory if needed
      if (!existsSync(targetDir)) {
        await mkdir(targetDir, { recursive: true });
      }

      // Check if skill already exists
      const existing = await findSkillFile(args.name);
      if (existing) {
        return `Error: Skill "${args.name}" already exists at ${existing.path}`;
      }

      // Generate content
      const content =
        args.content ||
        generateSkillTemplate(args.name, args.description, args.template || "agent");

      // Write file
      const filePath = join(targetDir, `${args.name}.md`);
      await writeFile(filePath, content);

      // Invalidate cache
      clearSkillCache();

      return `Created skill "${args.name}" at ${filePath}`;
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});

export const skill_update: ToolDefinition = tool({
  description: `Update an existing skill's metadata or content.

Modifies skill name, description, or full content. Cannot modify builtin skills.

Arguments:
- skill_name (required): Skill name to update
- name (optional): New name (must be kebab-case)
- description (optional): New description
- content (optional): Full SKILL.md content
- append (optional): Text to append to existing content

Example:
skill_update(skill_name="security-audit", description="Enhanced security analysis with more checks")`,
  args: {
    skill_name: tool.schema.string().describe("Skill name to update"),
    name: tool.schema.string().optional().describe("New skill name"),
    description: tool.schema.string().optional().describe("New description"),
    content: tool.schema.string().optional().describe("Full SKILL.md content"),
    append: tool.schema.string().optional().describe("Text to append to content"),
  },
  execute: async (args: SkillUpdateArgs) => {
    try {
      // Find skill
      const skillInfo = await findSkillFile(args.skill_name);
      if (!skillInfo) {
        return `Error: Skill "${args.skill_name}" not found in project or user skills`;
      }

      // Check if renaming
      const newName = args.name || args.skill_name;

      // Validate new name
      if (args.name && args.name !== args.skill_name) {
        if (!/^[a-z0-9-]+$/.test(args.name)) {
          return "Error: Name must be kebab-case (lowercase alphanumeric with hyphens)";
        }

        if (isBuiltinSkill(args.name)) {
          return `Error: Cannot rename to reserved name "${args.name}"`;
        }

        const existing = await findSkillFile(args.name);
        if (existing) {
          return `Error: Skill "${args.name}" already exists`;
        }
      }

      // Read current content
      let content = await readFile(skillInfo.path, "utf-8");
      const { data: frontmatter, body } = parseFrontmatter<Record<string, string>>(content);

      // Update frontmatter
      if (args.name) {
        frontmatter.name = args.name;
      }
      if (args.description) {
        if (args.description.length < 10 || args.description.length > 200) {
          return "Error: Description must be 10-200 characters";
        }
        frontmatter.description = args.description;
      }

      // Rebuild content
      let newContent: string;
      if (args.content) {
        newContent = args.content;
      } else if (args.append) {
        newContent = content + "\n\n" + args.append;
      } else {
        // Just update frontmatter
        const frontmatterStr = Object.entries(frontmatter)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
        newContent = `---\n${frontmatterStr}\n---\n\n${body}`;
      }

      // Handle rename
      if (args.name && args.name !== args.skill_name) {
        // Delete old file
        await unlink(skillInfo.path);
        // Write new file
        const newPath = join(dirname(skillInfo.path), `${args.name}.md`);
        await writeFile(newPath, newContent);
      } else {
        // Write to same file
        await writeFile(skillInfo.path, newContent);
      }

      // Invalidate cache
      clearSkillCache();

      return `Updated skill "${args.skill_name}"`;
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});

export const skill_delete: ToolDefinition = tool({
  description: `Delete a custom skill.

Permanently removes a skill file. Cannot delete builtin skills.

Arguments:
- skill_name (required): Skill name to delete
- force (optional): Skip confirmation (default: false)

Example:
skill_delete(skill_name="security-audit")`,
  args: {
    skill_name: tool.schema.string().describe("Skill name to delete"),
    force: tool.schema.boolean().optional().describe("Skip confirmation"),
  },
  execute: async (args: SkillDeleteArgs) => {
    try {
      // Check builtin
      if (isBuiltinSkill(args.skill_name)) {
        return `Error: Cannot delete builtin skill "${args.skill_name}"`;
      }

      // Find skill
      const skillInfo = await findSkillFile(args.skill_name);
      if (!skillInfo) {
        return `Error: Skill "${args.skill_name}" not found in project or user skills`;
      }

      // Delete file
      await unlink(skillInfo.path);

      // Invalidate cache
      clearSkillCache();

      return `Deleted skill "${args.skill_name}" from ${skillInfo.scope}`;
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});
