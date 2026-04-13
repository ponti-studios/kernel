import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import type { CommandTemplate, SkillTemplate } from "../templates/types.js";
import { ensureDir, fileExists, listDirs, readFile, writeFile } from "../utils/file-system.js";
import { loadBrainConfig, getBrainRoot, getSyncManifestPath } from "./config.js";
import { getBuiltInCatalog } from "./catalog.js";
import { getHostAdapter, getHostDescriptor, listKnownHosts, mapProjectPathToHome } from "./hosts.js";
import { parseAgentDocument, parseSkillDocument } from "./serialize.js";
import {
  ensureBrainLayout,
  importLegacyCodexVault,
  loadBrainAgentContent,
  loadBrainCommandAlias,
  loadBrainSkillContent,
  seedBuiltInBrain,
} from "./storage.js";
import type {
  BrainCommandAlias,
  CommandMaterialization,
  HostId,
  SyncAction,
  SyncHostResult,
  SyncManifest,
  SyncResult,
} from "./types.js";

function getSkillsRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "skills");
}

function getAgentsRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "agents");
}

function getCommandsRoot(homePath = os.homedir()): string {
  return path.join(getBrainRoot(homePath), "commands");
}

async function loadSyncManifest(homePath = os.homedir()): Promise<SyncManifest> {
  const manifestPath = getSyncManifestPath(homePath);
  if (!(await fileExists(manifestPath))) {
    return { version: 1, hosts: {} };
  }
  return JSON.parse(await readFile(manifestPath)) as SyncManifest;
}

async function saveSyncManifest(manifest: SyncManifest, homePath = os.homedir()): Promise<void> {
  await ensureDir(path.dirname(getSyncManifestPath(homePath)));
  await writeFile(getSyncManifestPath(homePath), JSON.stringify(manifest, null, 2));
}

function buildCommandTemplate(alias: BrainCommandAlias): CommandMaterialization {
  const instructions = [
    `Route this request to the Kernel CLI command \`kernel ${alias.target}\`.`,
    alias.description,
    alias.argumentHint ? `Argument hint: ${alias.argumentHint}` : null,
    "Prefer the local Kernel workflow over recreating the process manually when the command fits the user's goal.",
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n\n");

  const template: CommandTemplate = {
    name: alias.name,
    description: alias.description,
    instructions,
    argumentsHint: alias.argumentHint,
  };

  return { alias, template };
}

async function readBrainSkillTemplates(homePath: string): Promise<Array<{ name: string; template: SkillTemplate }>> {
  const names = (await listDirs(getSkillsRoot(homePath))).sort();
  const skills: Array<{ name: string; template: SkillTemplate }> = [];
  for (const name of names) {
    skills.push({
      name,
      template: parseSkillDocument(await loadBrainSkillContent(name, homePath)),
    });
  }
  return skills;
}

async function readBrainAgentTemplates(homePath: string) {
  const names = (await listDirs(getAgentsRoot(homePath))).sort();
  return Promise.all(
    names.map(async (name) => ({
      name,
      template: parseAgentDocument(await loadBrainAgentContent(name, homePath)),
    })),
  );
}

async function readBrainCommandTemplates(homePath: string) {
  const entries = await fs.readdir(getCommandsRoot(homePath), { withFileTypes: true }).catch(() => []);
  const commandFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => entry.name.replace(/\.yaml$/, ""))
    .sort();
  return Promise.all(
    commandFiles.map(async (name) => buildCommandTemplate(await loadBrainCommandAlias(name, homePath))),
  );
}

export async function buildDesiredHostActions(
  hostId: HostId,
  homePath = os.homedir(),
): Promise<SyncAction[]> {
  const adapter = getHostAdapter(hostId);
  const skillTemplates = await readBrainSkillTemplates(homePath);
  const agentTemplates = await readBrainAgentTemplates(homePath);
  const commandTemplates = await readBrainCommandTemplates(homePath);
  const actions: SyncAction[] = [];

  for (const skill of skillTemplates) {
    actions.push({
      kind: "symlink",
      path: path.join(homePath, getHostDescriptor(hostId).homeDir, "skills", skill.name),
      target: path.join(getSkillsRoot(homePath), skill.name),
    });
  }

  if (adapter.getAgentPath && adapter.formatAgent) {
    for (const agent of agentTemplates) {
      const projectRelativePath = adapter.getAgentPath(agent.template.name);
      actions.push({
        kind: "file",
        path: mapProjectPathToHome(hostId, projectRelativePath, homePath),
        content: adapter.formatAgent(agent.template, "2.0.0"),
      });
    }
  }

  if (adapter.getCommandPath && adapter.formatCommand) {
    for (const command of commandTemplates) {
      const projectRelativePath = adapter.getCommandPath(command.alias.name);
      actions.push({
        kind: "file",
        path: mapProjectPathToHome(hostId, projectRelativePath, homePath),
        content: adapter.formatCommand(command.template, "2.0.0"),
      });
    }
  }

  if (adapter.getManifestPath && adapter.formatManifest) {
    const projectRelativePath = adapter.getManifestPath();
    actions.push({
      kind: "file",
      path: mapProjectPathToHome(hostId, projectRelativePath, homePath),
      content: adapter.formatManifest(
        skillTemplates.map((skill) => skill.template),
        "2.0.0",
      ),
    });
  }

  return actions.sort((a, b) => a.path.localeCompare(b.path));
}

async function removeTrackedPath(targetPath: string): Promise<void> {
  await fs.rm(targetPath, { force: true, recursive: true });
}

async function applyAction(action: SyncAction): Promise<"created" | "updated" | "unchanged"> {
  const stat = await fs.lstat(action.path).catch(() => null);
  if (action.kind === "symlink") {
    if (stat?.isSymbolicLink()) {
      const currentTarget = await fs.readlink(action.path).catch(() => "");
      if (currentTarget === action.target) {
        return "unchanged";
      }
    }
    await fs.rm(action.path, { force: true, recursive: true });
    await ensureDir(path.dirname(action.path));
    await fs.symlink(action.target!, action.path, "dir");
    return stat ? "updated" : "created";
  }

  const currentContent =
    stat?.isFile() && action.content !== undefined ? await fs.readFile(action.path, "utf-8") : null;
  if (currentContent === action.content) {
    return "unchanged";
  }
  await ensureDir(path.dirname(action.path));
  await fs.writeFile(action.path, action.content ?? "", "utf-8");
  return stat ? "updated" : "created";
}

async function syncHost(
  hostId: HostId,
  previous: string[],
  homePath: string,
): Promise<SyncHostResult> {
  const desired = await buildDesiredHostActions(hostId, homePath);
  const desiredPaths = new Set(desired.map((action) => action.path));
  let removed = 0;
  for (const tracked of previous) {
    if (!desiredPaths.has(tracked)) {
      await removeTrackedPath(tracked);
      removed += 1;
    }
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  for (const action of desired) {
    const result = await applyAction(action);
    if (result === "created") {
      created += 1;
    } else if (result === "updated") {
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  return {
    host: hostId,
    created,
    updated,
    removed,
    unchanged,
    tracked: desired.map((action) => action.path),
  };
}

export async function syncKernelBrain(homePath = os.homedir()): Promise<SyncResult> {
  await ensureBrainLayout(homePath);
  await seedBuiltInBrain(homePath);
  const importedLegacySkills = await importLegacyCodexVault(homePath);
  const config = await loadBrainConfig(homePath);
  if (!config) {
    throw new Error("Kernel is not initialized. Run `kernel init` first.");
  }

  const manifest = await loadSyncManifest(homePath);
  const results: SyncHostResult[] = [];
  for (const hostId of config.hosts) {
    const previous = manifest.hosts[hostId]?.paths ?? [];
    const result = await syncHost(hostId, previous, homePath);
    manifest.hosts[hostId] = { paths: result.tracked };
    results.push(result);
  }

  for (const hostId of listKnownHosts()) {
    if (!config.hosts.includes(hostId) && manifest.hosts[hostId]?.paths) {
      for (const tracked of manifest.hosts[hostId]!.paths) {
        await removeTrackedPath(tracked);
      }
      delete manifest.hosts[hostId];
    }
  }

  await saveSyncManifest(manifest, homePath);

  return {
    brainPath: getBrainRoot(homePath),
    importedLegacySkills,
    hosts: results,
  };
}
