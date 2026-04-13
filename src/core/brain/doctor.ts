import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { getBrainConfigPath, getBrainRoot, loadBrainConfig } from "./config.js";
import { buildDesiredHostActions } from "./sync.js";
import { getBuiltInPackageIds } from "./catalog.js";
import { listKnownHosts } from "./hosts.js";
import type { DoctorIssue, DoctorResult } from "./types.js";

export async function doctorKernel(homePath = os.homedir()): Promise<DoctorResult> {
  const issues: DoctorIssue[] = [];
  const config = await loadBrainConfig(homePath);
  if (!config) {
    return {
      configPath: getBrainConfigPath(homePath),
      brainPath: getBrainRoot(homePath),
      hosts: [],
      packages: [],
      issues: [{ level: "error", message: "Kernel is not initialized. Run `kernel init` first." }],
    };
  }

  for (const packageId of config.packages) {
    if (!getBuiltInPackageIds().includes(packageId)) {
      issues.push({ level: "warning", message: `Unknown package enabled in config: ${packageId}` });
    }
  }

  for (const hostId of config.hosts) {
    const desired = await buildDesiredHostActions(hostId, homePath);
    for (const action of desired) {
      const stat = await fs.lstat(action.path).catch(() => null);
      if (!stat) {
        issues.push({ level: "warning", message: `${hostId}: missing generated path ${action.path}` });
        continue;
      }
      if (action.kind === "symlink") {
        if (!stat.isSymbolicLink()) {
          issues.push({
            level: "error",
            message: `${hostId}: expected symlink at ${action.path}`,
          });
          continue;
        }
        const target = await fs.readlink(action.path).catch(() => "");
        if (target !== action.target) {
          issues.push({
            level: "error",
            message: `${hostId}: broken skill link at ${action.path}`,
          });
        }
      } else if (!stat.isFile()) {
        issues.push({
          level: "error",
          message: `${hostId}: expected file at ${action.path}`,
        });
      }
    }
  }

  for (const hostId of listKnownHosts()) {
    if (!config.hosts.includes(hostId)) {
      continue;
    }
  }

  return {
    configPath: getBrainConfigPath(homePath),
    brainPath: getBrainRoot(homePath),
    hosts: config.hosts,
    packages: config.packages,
    issues,
  };
}
