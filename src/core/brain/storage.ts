import * as fs from "node:fs/promises";
import * as os from "os";
import path from "node:path";
import { getBuiltInCatalog } from "./catalog.js";
import { getCatalogRoot, loadBrainConfig } from "./config.js";
import { renderCatalogOutputs } from "../render/index.js";
import { ensureDir, listDirs, readFile } from "../utils/file-system.js";
import type { SyncManifestEntry } from "./types.js";
import { applySyncPlan, planSync } from "../sync/index.js";

function getSkillsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "skills");
}

function getAgentsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "agents");
}

function getCommandsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "commands");
}

export async function ensureCatalogLayout(homePath = os.homedir()): Promise<void> {
  await ensureDir(getSkillsRoot(homePath));
  await ensureDir(getAgentsRoot(homePath));
  await ensureDir(getCommandsRoot(homePath));
}

async function discoverCatalogPaths(homePath: string): Promise<string[]> {
  const roots = [getSkillsRoot(homePath), getAgentsRoot(homePath), getCommandsRoot(homePath)];
  const paths: string[] = [];

  async function walk(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      paths.push(absolutePath);
    }
  }

  for (const root of roots) {
    await walk(root);
  }

  return paths.sort();
}

export async function syncBuiltInCatalog(
  homePath = os.homedir(),
  previous: SyncManifestEntry[] = [],
): Promise<{ tracked: SyncManifestEntry[] }> {
  await ensureCatalogLayout(homePath);
  const catalog = getBuiltInCatalog();
  const outputs = renderCatalogOutputs(catalog, homePath, "2.0.0");
  const fallback = (await discoverCatalogPaths(homePath)).map((entryPath) => ({
    path: entryPath,
    kind: "file" as const,
    hash: "",
    templateId: "",
    adapterVersion: "2.0.0",
  }));
  const plan = planSync("catalog", outputs, previous.length > 0 ? previous : fallback);
  await applySyncPlan(plan);
  return { tracked: plan.tracked };
}

export async function listCatalogSkillNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getSkillsRoot(homePath))).sort();
}

export async function listCatalogAgentNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getAgentsRoot(homePath))).sort();
}

export async function listCatalogCommandNames(homePath = os.homedir()): Promise<string[]> {
  const entries = await fs.readdir(getCommandsRoot(homePath), { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => entry.name.replace(/\.yaml$/, ""))
    .sort();
}

export async function loadCatalogSkillContent(
  skillName: string,
  homePath = os.homedir(),
): Promise<string> {
  return readFile(path.join(getSkillsRoot(homePath), skillName, "SKILL.md"));
}

export async function loadCatalogAgentContent(
  agentName: string,
  homePath = os.homedir(),
): Promise<string> {
  return readFile(path.join(getAgentsRoot(homePath), agentName, "AGENT.md"));
}

export function getCatalogSkillDir(skillName: string, homePath = os.homedir()): string {
  return path.join(getSkillsRoot(homePath), skillName);
}

export function getCatalogAgentsRoot(homePath = os.homedir()): string {
  return getAgentsRoot(homePath);
}

export function getCatalogCommandsRoot(homePath = os.homedir()): string {
  return getCommandsRoot(homePath);
}
