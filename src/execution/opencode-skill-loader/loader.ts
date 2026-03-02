import { promises as fs } from "fs";
import { join, basename, dirname } from "path";
import { homedir } from "os";
import yaml from "js-yaml";
import { parseFrontmatter } from "../../integration/shared/frontmatter";
import { sanitizeModelField } from "../../integration/shared/model-sanitizer";
import { resolveSymlinkAsync, isMarkdownFile } from "../../integration/shared/file-utils";
import { getClaudeConfigDir } from "../../platform/claude/config-dir";
import { getOpenCodeConfigDir } from "../../platform/opencode/config-dir";
import type { CommandDefinition } from "../command-loader/types";
import type {
  SkillScope,
  SkillMetadata,
  LoadedSkill,
  LazyContentLoader,
  ScopedSkillSource,
  CanonicalSkillScopeKind,
} from "./types";
import type { SkillMcpConfig } from "../skill-mcp-manager/types";

function parseSkillMcpConfigFromFrontmatter(content: string): SkillMcpConfig | undefined {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return undefined;

  try {
    const parsed = yaml.load(frontmatterMatch[1]) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && "mcp" in parsed && parsed.mcp) {
      return parsed.mcp as SkillMcpConfig;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

async function loadMcpJsonFromDir(skillDir: string): Promise<SkillMcpConfig | undefined> {
  const mcpJsonPath = join(skillDir, "mcp.json");

  try {
    const content = await fs.readFile(mcpJsonPath, "utf-8");
    const parsed = JSON.parse(content) as Record<string, unknown>;

    if (parsed && typeof parsed === "object" && "mcpServers" in parsed && parsed.mcpServers) {
      return parsed.mcpServers as SkillMcpConfig;
    }

    if (parsed && typeof parsed === "object" && !("mcpServers" in parsed)) {
      const hasCommandField = Object.values(parsed).some(
        (v) => v && typeof v === "object" && "command" in (v as Record<string, unknown>),
      );
      if (hasCommandField) {
        return parsed as SkillMcpConfig;
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function parseAllowedTools(allowedTools: string | string[] | undefined): string[] | undefined {
  if (!allowedTools) return undefined;

  // Handle YAML array format: already parsed as string[]
  if (Array.isArray(allowedTools)) {
    return allowedTools.map((t) => t.trim()).filter(Boolean);
  }

  // Handle space-separated string format: "Read Write Edit Bash"
  return allowedTools.split(/\s+/).filter(Boolean);
}

async function loadSkillFromPath(
  skillPath: string,
  resolvedPath: string,
  defaultName: string,
  scope: SkillScope,
  options: {
    requireFrontmatterMetadata?: boolean;
  } = {},
): Promise<LoadedSkill | null> {
  try {
    const content = await fs.readFile(skillPath, "utf-8");
    const { data, body, hadFrontmatter, parseError } = parseFrontmatter<SkillMetadata>(content);

    if (options.requireFrontmatterMetadata) {
      const description = data.description;
      const hasDescription = typeof description === "string" && description.trim().length > 0;
      if (!hadFrontmatter || parseError || !hasDescription) {
        return null;
      }
    }

    const frontmatterMcp = parseSkillMcpConfigFromFrontmatter(content);
    const mcpJsonMcp = await loadMcpJsonFromDir(resolvedPath);
    const mcpConfig = mcpJsonMcp || frontmatterMcp;

    const skillName = data.name || defaultName;
    const originalDescription = data.description || "";
    const isOpencodeSource = scope === "opencode" || scope === "opencode-project";
    const formattedDescription = `(${scope} - Skill) ${originalDescription}`;

    const templateContent = `<skill-instruction>
Base directory for this skill: ${resolvedPath}/
File references (@path) in this skill are relative to this directory.

${body.trim()}
</skill-instruction>

<user-request>
$ARGUMENTS
</user-request>`;

    // RATIONALE: We read the file eagerly to ensure atomic consistency between
    // metadata and body. We maintain the LazyContentLoader interface for
    // compatibility, but the state is effectively eager.
    const eagerLoader: LazyContentLoader = {
      loaded: true,
      content: templateContent,
      load: async () => templateContent,
    };

    const definition: CommandDefinition = {
      name: skillName,
      description: formattedDescription,
      template: templateContent,
      model: sanitizeModelField(data.model, isOpencodeSource ? "opencode" : "claude-code"),
      agent: data.agent,
      subtask: data.subtask,
      argumentHint: data["argument-hint"],
    };

    return {
      name: skillName,
      path: skillPath,
      resolvedPath,
      definition,
      scope,
      license: data.license,
      compatibility: data.compatibility,
      metadata: data.metadata,
      allowedTools: parseAllowedTools(data["allowed-tools"]),
      mcpConfig,
      lazyContent: eagerLoader,
    };
  } catch {
    return null;
  }
}

async function loadSkillsFromDir(skillsDir: string, scope: SkillScope): Promise<LoadedSkill[]> {
  return loadSkillsFromDirWithOptions(skillsDir, scope, {});
}

async function loadSkillsFromDirWithOptions(
  skillsDir: string,
  scope: SkillScope,
  options: {
    strictCanonicalLayout?: boolean;
    requireFrontmatterMetadata?: boolean;
  },
): Promise<LoadedSkill[]> {
  const entries = await fs.readdir(skillsDir, { withFileTypes: true }).catch(() => []);
  const skills: LoadedSkill[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const entryPath = join(skillsDir, entry.name);

    if (entry.isDirectory() || entry.isSymbolicLink()) {
      const resolvedPath = await resolveSymlinkAsync(entryPath);
      const dirName = entry.name;

      const skillMdPath = join(resolvedPath, "SKILL.md");
      try {
        await fs.access(skillMdPath);
        const skill = await loadSkillFromPath(skillMdPath, resolvedPath, dirName, scope, {
          requireFrontmatterMetadata: options.requireFrontmatterMetadata,
        });
        if (skill) skills.push(skill);
        continue;
      } catch {}

      if (options.strictCanonicalLayout) {
        continue;
      }

      const namedSkillMdPath = join(resolvedPath, `${dirName}.md`);
      try {
        await fs.access(namedSkillMdPath);
        const skill = await loadSkillFromPath(namedSkillMdPath, resolvedPath, dirName, scope, {
          requireFrontmatterMetadata: options.requireFrontmatterMetadata,
        });
        if (skill) skills.push(skill);
        continue;
      } catch {}

      continue;
    }

    if (!options.strictCanonicalLayout && isMarkdownFile(entry)) {
      const skillName = basename(entry.name, ".md");
      const skill = await loadSkillFromPath(entryPath, skillsDir, skillName, scope, {
        requireFrontmatterMetadata: options.requireFrontmatterMetadata,
      });
      if (skill) skills.push(skill);
    }
  }

  return skills;
}

function skillsToRecord(skills: LoadedSkill[]): Record<string, CommandDefinition> {
  const result: Record<string, CommandDefinition> = {};
  for (const skill of skills) {
    const { name: _name, argumentHint: _argumentHint, ...openCodeCompatible } = skill.definition;
    result[skill.name] = openCodeCompatible as CommandDefinition;
  }
  return result;
}

export async function loadUserSkills(): Promise<Record<string, CommandDefinition>> {
  const userSkillsDir = join(getClaudeConfigDir(), "skills");
  const skills = await loadSkillsFromDir(userSkillsDir, "user");
  return skillsToRecord(skills);
}

export async function loadProjectSkills(): Promise<Record<string, CommandDefinition>> {
  const projectSkillsDir = join(process.cwd(), ".claude", "skills");
  const skills = await loadSkillsFromDir(projectSkillsDir, "project");
  return skillsToRecord(skills);
}

export async function loadOpencodeGlobalSkills(): Promise<Record<string, CommandDefinition>> {
  const configDir = getOpenCodeConfigDir({ binary: "opencode" });
  const opencodeSkillsDir = join(configDir, "skills");
  const skills = await loadSkillsFromDir(opencodeSkillsDir, "opencode");
  return skillsToRecord(skills);
}

export async function loadOpencodeProjectSkills(): Promise<Record<string, CommandDefinition>> {
  const opencodeProjectDir = join(process.cwd(), ".opencode", "skills");
  const skills = await loadSkillsFromDir(opencodeProjectDir, "opencode-project");
  return skillsToRecord(skills);
}

export interface DiscoverSkillsOptions {
  includeClaudeCodePaths?: boolean;
}

export interface EnumerateScopedSourcesOptions {
  cwd?: string;
  repoRoot?: string;
  includeUserScope?: boolean;
  includeSystemScope?: boolean;
}

function toLoaderScope(sourceKind: CanonicalSkillScopeKind): SkillScope {
  switch (sourceKind) {
    case "project-local-nearest":
    case "parent-scope":
      return "project";
    case "user-scope":
      return "user";
    case "system-scope":
      return "config";
    case "builtin":
      return "plugin";
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveRepositoryRoot(startPath: string): Promise<string> {
  let currentPath = startPath;

  while (true) {
    const gitDir = join(currentPath, ".git");
    if (await pathExists(gitDir)) {
      return currentPath;
    }

    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      return startPath;
    }

    currentPath = parentPath;
  }
}

function getSystemScopeSkillsPath(): string {
  if (process.platform === "win32") {
    return "C:/ProgramData/agents/skills";
  }
  return "/etc/agents/skills";
}

function getCanonicalSkillsPath(rootPath: string): string {
  return join(rootPath, ".agents", "skills");
}

export async function enumerateScopedAgentSkillSources(
  options: EnumerateScopedSourcesOptions = {},
): Promise<ScopedSkillSource[]> {
  const cwd = options.cwd ?? process.cwd();
  const repoRoot = options.repoRoot ?? (await resolveRepositoryRoot(cwd));
  const includeUserScope = options.includeUserScope ?? true;
  const includeSystemScope = options.includeSystemScope ?? true;

  const rootedPaths: string[] = [];
  let currentPath = cwd;

  while (true) {
    rootedPaths.push(currentPath);
    if (currentPath === repoRoot) {
      break;
    }

    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      break;
    }

    currentPath = parentPath;
  }

  const discoveredSources: ScopedSkillSource[] = [];
  let precedenceRank = 1;

  for (let index = 0; index < rootedPaths.length; index++) {
    const rootPath = rootedPaths[index];
    const skillsPath = getCanonicalSkillsPath(rootPath);
    if (!(await pathExists(skillsPath))) {
      continue;
    }

    discoveredSources.push({
      kind: index === 0 ? "project-local-nearest" : "parent-scope",
      rootPath,
      skillsPath,
      precedenceRank,
    });
    precedenceRank += 1;
  }

  if (includeUserScope) {
    const userRoot = homedir();
    const userSkillsPath = getCanonicalSkillsPath(userRoot);
    if (await pathExists(userSkillsPath)) {
      discoveredSources.push({
        kind: "user-scope",
        rootPath: userRoot,
        skillsPath: userSkillsPath,
        precedenceRank,
      });
      precedenceRank += 1;
    }
  }

  if (includeSystemScope) {
    const systemSkillsPath = getSystemScopeSkillsPath();
    if (await pathExists(systemSkillsPath)) {
      discoveredSources.push({
        kind: "system-scope",
        rootPath: dirname(dirname(systemSkillsPath)),
        skillsPath: systemSkillsPath,
        precedenceRank,
      });
    }
  }

  return discoveredSources;
}

export async function discoverScopedAgentSkills(
  options: EnumerateScopedSourcesOptions = {},
): Promise<{ sources: ScopedSkillSource[]; skills: LoadedSkill[] }> {
  const sources = await enumerateScopedAgentSkillSources(options);
  const skillsBySource = await Promise.all(
    sources.map((source) =>
      loadSkillsFromDirWithOptions(source.skillsPath, toLoaderScope(source.kind), {
        strictCanonicalLayout: true,
        requireFrontmatterMetadata: true,
      }),
    ),
  );
  const skills = skillsBySource.flat();

  return { sources, skills };
}

export async function discoverAllSkills(): Promise<LoadedSkill[]> {
  const [opencodeProjectSkills, projectSkills, opencodeGlobalSkills, userSkills] =
    await Promise.all([
      discoverOpencodeProjectSkills(),
      discoverProjectClaudeSkills(),
      discoverOpencodeGlobalSkills(),
      discoverUserClaudeSkills(),
    ]);

  return [...opencodeProjectSkills, ...projectSkills, ...opencodeGlobalSkills, ...userSkills];
}

export async function discoverSkills(options: DiscoverSkillsOptions = {}): Promise<LoadedSkill[]> {
  const { includeClaudeCodePaths = true } = options;

  const [opencodeProjectSkills, opencodeGlobalSkills] = await Promise.all([
    discoverOpencodeProjectSkills(),
    discoverOpencodeGlobalSkills(),
  ]);

  if (!includeClaudeCodePaths) {
    return [...opencodeProjectSkills, ...opencodeGlobalSkills];
  }

  const [projectSkills, userSkills] = await Promise.all([
    discoverProjectClaudeSkills(),
    discoverUserClaudeSkills(),
  ]);

  return [...opencodeProjectSkills, ...projectSkills, ...opencodeGlobalSkills, ...userSkills];
}

export async function discoverUserClaudeSkills(): Promise<LoadedSkill[]> {
  const userSkillsDir = join(getClaudeConfigDir(), "skills");
  return loadSkillsFromDir(userSkillsDir, "user");
}

export async function discoverProjectClaudeSkills(): Promise<LoadedSkill[]> {
  const projectSkillsDir = join(process.cwd(), ".claude", "skills");
  return loadSkillsFromDir(projectSkillsDir, "project");
}

export async function discoverOpencodeGlobalSkills(): Promise<LoadedSkill[]> {
  const configDir = getOpenCodeConfigDir({ binary: "opencode" });
  const opencodeSkillsDir = join(configDir, "skills");
  return loadSkillsFromDir(opencodeSkillsDir, "opencode");
}

export async function discoverOpencodeProjectSkills(): Promise<LoadedSkill[]> {
  const opencodeProjectDir = join(process.cwd(), ".opencode", "skills");
  return loadSkillsFromDir(opencodeProjectDir, "opencode-project");
}
