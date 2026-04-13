import * as os from "os";
import * as path from "path";
import * as yaml from "yaml";
import { githubCopilotAdapter } from "../adapters/github-copilot.js";
import { ensureDir, fileExists, listDirs, readFile, writeFile } from "../utils/file-system.js";
import { loadVaultSkills } from "../vault/loader.js";
import type { BrainCommandAlias, BrainPackageManifest } from "./types.js";
import { getBuiltInCatalog } from "./catalog.js";
import { getBrainRoot } from "./config.js";
import { serializeAgentTemplate } from "./serialize.js";

function getSkillsRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "skills");
}

function getAgentsRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "agents");
}

function getPackagesRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "packages");
}

function getCommandsRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "commands");
}

function buildImportedSkillContent(
  frontmatter: Record<string, unknown>,
  body: string,
): string {
  const cleaned = Object.fromEntries(
    Object.entries(frontmatter).filter(([, value]) => value !== undefined && value !== null),
  );
  if (Object.keys(cleaned).length === 0) {
    return body;
  }
  return `---\n${yaml.stringify(cleaned).trim()}\n---\n\n${body}`;
}

export async function ensureBrainLayout(homePath = os.homedir()): Promise<void> {
  await ensureDir(getSkillsRoot(homePath));
  await ensureDir(getAgentsRoot(homePath));
  await ensureDir(getPackagesRoot(homePath));
  await ensureDir(getCommandsRoot(homePath));
}

export async function seedBuiltInBrain(homePath = os.homedir()): Promise<void> {
  await ensureBrainLayout(homePath);
  const catalog = getBuiltInCatalog();

  for (const skill of catalog.skills) {
    const skillDir = path.join(getSkillsRoot(homePath), skill.name);
    const skillPath = path.join(skillDir, "SKILL.md");
    if (!(await fileExists(skillPath))) {
      await writeFile(skillPath, githubCopilotAdapter.formatSkill(skill, "2.0.0"));
    }
    for (const ref of skill.references ?? []) {
      await writeFile(path.join(skillDir, ref.relativePath), ref.content);
    }
  }

  for (const agent of catalog.agents) {
    const agentDir = path.join(getAgentsRoot(homePath), agent.name);
    const agentPath = path.join(agentDir, "AGENT.md");
    if (!(await fileExists(agentPath))) {
      await writeFile(agentPath, serializeAgentTemplate(agent));
    }
    for (const ref of agent.references ?? []) {
      await writeFile(path.join(agentDir, ref.relativePath), ref.content);
    }
  }

  for (const pkg of catalog.packages) {
    const pkgPath = path.join(getPackagesRoot(homePath), `${pkg.id}.yaml`);
    if (!(await fileExists(pkgPath))) {
      await writeFile(pkgPath, yaml.stringify(pkg, { indent: 2, sortMapEntries: true }));
    }
  }

  for (const command of catalog.commands) {
    const commandPath = path.join(getCommandsRoot(homePath), `${command.name}.yaml`);
    if (!(await fileExists(commandPath))) {
      await writeFile(commandPath, yaml.stringify(command, { indent: 2, sortMapEntries: true }));
    }
  }
}

export async function importLegacyCodexVault(homePath = os.homedir()): Promise<string[]> {
  const imported: string[] = [];
  try {
    const skills = await loadVaultSkills(homePath);
    for (const skill of skills) {
      const skillDir = path.join(getSkillsRoot(homePath), skill.name);
      const skillPath = path.join(skillDir, "SKILL.md");
      if (await fileExists(skillPath)) {
        continue;
      }
      await writeFile(skillPath, buildImportedSkillContent(skill.frontmatter, skill.body));
      for (const ref of skill.references) {
        await writeFile(path.join(skillDir, ref.relativePath), ref.content);
      }
      imported.push(skill.name);
    }
  } catch {
    return imported;
  }
  return imported;
}

export async function listBrainSkillNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getSkillsRoot(homePath))).sort();
}

export async function listBrainAgentNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getAgentsRoot(homePath))).sort();
}

export async function listBrainCommandNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getCommandsRoot(homePath))).sort();
}

export async function loadBrainSkillContent(
  skillName: string,
  homePath = os.homedir(),
): Promise<string> {
  return readFile(path.join(getSkillsRoot(homePath), skillName, "SKILL.md"));
}

export async function loadBrainAgentContent(
  agentName: string,
  homePath = os.homedir(),
): Promise<string> {
  return readFile(path.join(getAgentsRoot(homePath), agentName, "AGENT.md"));
}

export async function loadBrainCommandAlias(
  commandName: string,
  homePath = os.homedir(),
): Promise<BrainCommandAlias> {
  return yaml.parse(await readFile(path.join(getCommandsRoot(homePath), `${commandName}.yaml`))) as BrainCommandAlias;
}

export async function listPackageManifests(homePath = os.homedir()): Promise<BrainPackageManifest[]> {
  const packageRoot = getPackagesRoot(homePath);
  const names = (await listDirs(packageRoot)).sort();
  const manifests: BrainPackageManifest[] = [];
  for (const entry of names) {
    const manifestPath = path.join(packageRoot, entry, "package.yaml");
    if (await fileExists(manifestPath)) {
      manifests.push((yaml.parse(await readFile(manifestPath)) ?? {}) as BrainPackageManifest);
    }
  }

  const fileNames = await listDirs(packageRoot);
  void fileNames;
  const catalog = getBuiltInCatalog();
  return catalog.packages;
}

export function getBrainSkillDir(skillName: string, homePath = os.homedir()): string {
  return path.join(getSkillsRoot(homePath), skillName);
}
