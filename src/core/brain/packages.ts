import * as os from "os";
import { getBuiltInPackage } from "./catalog.js";
import { getBrainConfigPath, loadBrainConfig, saveBrainConfig } from "./config.js";
import { seedBuiltInBrain } from "./storage.js";
import type { PackageMutationResult } from "./types.js";

export async function listEnabledPackages(homePath = os.homedir()): Promise<PackageMutationResult> {
  const config = await loadBrainConfig(homePath);
  if (!config) {
    throw new Error("Kernel is not initialized. Run `kernel init` first.");
  }
  return {
    configPath: getBrainConfigPath(homePath),
    packages: [...config.packages].sort(),
  };
}

export async function addPackage(packageId: string, homePath = os.homedir()): Promise<PackageMutationResult> {
  const config = await loadBrainConfig(homePath);
  if (!config) {
    throw new Error("Kernel is not initialized. Run `kernel init` first.");
  }
  if (!getBuiltInPackage(packageId)) {
    throw new Error(`Unknown package: ${packageId}`);
  }
  if (!config.packages.includes(packageId)) {
    config.packages.push(packageId);
    config.packages.sort();
    await saveBrainConfig(config, homePath);
  }
  await seedBuiltInBrain(homePath);
  return {
    configPath: getBrainConfigPath(homePath),
    packages: config.packages,
  };
}

export async function removePackage(
  packageId: string,
  homePath = os.homedir(),
): Promise<PackageMutationResult> {
  const config = await loadBrainConfig(homePath);
  if (!config) {
    throw new Error("Kernel is not initialized. Run `kernel init` first.");
  }
  config.packages = config.packages.filter((entry) => entry !== packageId);
  await saveBrainConfig(config, homePath);
  return {
    configPath: getBrainConfigPath(homePath),
    packages: config.packages,
  };
}
