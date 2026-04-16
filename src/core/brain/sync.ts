import * as fs from "node:fs/promises";
import * as os from "os";
import path from "node:path";
import { getCatalogRoot, getSyncManifestPath, loadBrainConfig } from "./config.js";
import { getHostDescriptor, listKnownHosts } from "./hosts.js";
import { syncBuiltInCatalog } from "./storage.js";
import type {
  HostId,
  SyncHostResult,
  SyncManifest,
  SyncManifestEntry,
  SyncResult,
} from "./types.js";
import { fileExists, writeFile, directoryExists } from "../utils/file-system.js";
import { getBuiltInCatalog } from "./catalog.js";
import { renderHostOutputs } from "../render/index.js";
import { applySyncPlan, planSync } from "../sync/index.js";

async function loadSyncManifest(homePath = os.homedir()): Promise<SyncManifest> {
  const manifestPath = getSyncManifestPath(homePath);
  if (!(await fileExists(manifestPath))) {
    return { version: 2, scopes: {} };
  }
  const parsed = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as
    | Partial<SyncManifest>
    | null;

  if (!parsed || typeof parsed !== "object") {
    return { version: 2, scopes: {} };
  }

  if (!parsed.scopes || typeof parsed.scopes !== "object") {
    return { version: 2, scopes: {} };
  }

  return { version: 2, scopes: parsed.scopes };
}

async function saveSyncManifest(manifest: SyncManifest, homePath = os.homedir()): Promise<void> {
  await writeFile(getSyncManifestPath(homePath), JSON.stringify(manifest, null, 2));
}

async function cleanupCatalogOrphans(homePath: string, tracked: Set<string>): Promise<number> {
  const roots = [
    path.join(getCatalogRoot(homePath), "skills"),
    path.join(getCatalogRoot(homePath), "agents"),
    path.join(getCatalogRoot(homePath), "commands"),
  ];
  let removed = 0;

  async function walk(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        const remaining = await fs.readdir(absolutePath).catch(() => []);
        if (remaining.length === 0) {
          await fs.rmdir(absolutePath).catch(() => undefined);
        }
        continue;
      }
      if (!tracked.has(absolutePath)) {
        await fs.rm(absolutePath, { force: true });
        removed += 1;
      }
    }
  }

  for (const root of roots) {
    if (await directoryExists(root)) {
      await walk(root);
    }
  }

  return removed;
}

async function cleanupHostOrphans(hostId: HostId, homePath: string, tracked: Set<string>): Promise<number> {
  const host = getHostDescriptor(hostId);
  const hostBase = path.join(homePath, host.homeDir);
  let removed = 0;

  for (const relativeDir of ["skills", "agents", "commands", path.join("commands", "kernel")]) {
    const absoluteDir = path.join(hostBase, relativeDir);
    if (!(await directoryExists(absoluteDir))) {
      continue;
    }
    for (const entry of await fs.readdir(absoluteDir, { withFileTypes: true })) {
      const entryPath = path.join(absoluteDir, entry.name);
      if (!tracked.has(entryPath)) {
        await fs.rm(entryPath, { force: true, recursive: true });
        removed += 1;
      }
    }
  }

  return removed;
}

async function syncHost(
  hostId: HostId,
  previous: SyncManifestEntry[],
  homePath: string,
): Promise<{ result: SyncHostResult; tracked: SyncManifestEntry[] }> {
  const catalog = getBuiltInCatalog();
  const outputs = renderHostOutputs(catalog, hostId, homePath, "2.0.0");
  const plan = planSync(hostId, outputs, previous);
  const result = await applySyncPlan(plan);
  result.removed += await cleanupHostOrphans(hostId, homePath, new Set(plan.tracked.map((entry) => entry.path)));
  return { result, tracked: plan.tracked };
}

export async function syncKernelBrain(homePath = os.homedir()): Promise<SyncResult> {
  const config = await loadBrainConfig(homePath);
  if (!config) {
    throw new Error("Kernel is not initialized. Run `kernel init` first.");
  }

  const manifest = await loadSyncManifest(homePath);
  const hosts: SyncHostResult[] = [];
  const nextManifest: SyncManifest = { version: 2, scopes: {} };

  const catalogSync = await syncBuiltInCatalog(homePath, manifest.scopes.catalog ?? []);
  nextManifest.scopes.catalog = catalogSync.tracked;
  const catalogResultRemoved = await cleanupCatalogOrphans(
    homePath,
    new Set(catalogSync.tracked.map((entry) => entry.path)),
  );
  if (catalogResultRemoved > 0) {
    hosts.push({
      host: "catalog",
      created: 0,
      updated: 0,
      removed: catalogResultRemoved,
      unchanged: 0,
      tracked: catalogSync.tracked.map((entry) => entry.path),
    });
  }

  for (const hostId of config.hosts) {
    const { result, tracked } = await syncHost(
      hostId,
      manifest.scopes[hostId] ?? [],
      homePath,
    );
    hosts.push(result);
    nextManifest.scopes[hostId] = tracked;
  }

  for (const hostId of listKnownHosts()) {
    if (!config.hosts.includes(hostId)) {
      const removed = await cleanupHostOrphans(hostId, homePath, new Set());
      if (removed > 0) {
        hosts.push({
          host: hostId,
          created: 0,
          updated: 0,
          removed,
          unchanged: 0,
          tracked: [],
        });
      }
    }
  }

  await saveSyncManifest(nextManifest, homePath);
  return {
    catalogPath: getCatalogRoot(homePath),
    importedLegacySkills: [],
    hosts,
  };
}
