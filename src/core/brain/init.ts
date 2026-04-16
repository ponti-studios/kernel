import * as os from "os";
import { ensureBrainConfig, getBrainConfigPath, getCatalogRoot } from "./config.js";
import { detectInstalledHosts } from "./hosts.js";
import { syncBuiltInCatalog } from "./storage.js";
import { syncKernelBrain } from "./sync.js";
import type { HostId, InitResult } from "./types.js";

export async function initializeKernel(homePath = os.homedir()): Promise<InitResult> {
  const detectedHosts = await detectInstalledHosts(homePath);
  const hosts: HostId[] = detectedHosts.length > 0 ? detectedHosts : ["codex"];
  const config = await ensureBrainConfig(homePath, { hosts });
  await syncBuiltInCatalog(homePath);
  await syncKernelBrain(homePath);

  return {
    configPath: getBrainConfigPath(homePath),
    catalogPath: getCatalogRoot(homePath),
    detectedHosts,
    enabledHosts: config.hosts,
    importedLegacySkills: [],
  };
}
