/**
 * Config command
 *
 * Manages global kernel configuration.
 */

import * as fs from "fs/promises";
import { loadConfig, saveConfig, getConfigPath } from "../core/config/loader.js";

export interface ConfigOptions {
  action: "show" | "get" | "set" | "add-tool" | "remove-tool";
  key?: string;
  value?: string;
  configRootPath?: string;
}

export async function executeConfig(options: ConfigOptions): Promise<void> {
  if (options.action === "show") {
    await showConfig(options.configRootPath);
  } else if (options.action === "add-tool" && options.value) {
    await modifyTools(options.configRootPath, "add", options.value);
  } else if (options.action === "remove-tool" && options.value) {
    await modifyTools(options.configRootPath, "remove", options.value);
  } else if (options.action === "set" && options.key && options.value) {
    await setConfig(options.configRootPath, options.key, options.value);
  }
}

async function showConfig(configRootPath?: string): Promise<void> {
  try {
    const content = await fs.readFile(getConfigPath(configRootPath), "utf-8");
    console.log(content);
  } catch {
    console.log("No kernel configuration found.");
    console.log('Run "kernel init" to initialize kernel.');
  }
}

async function modifyTools(
  configRootPath: string | undefined,
  action: "add" | "remove",
  tool: string,
): Promise<void> {
  const config = await loadConfig(configRootPath);
  if (!config) {
    console.log('No kernel configuration found. Run "kernel init" to initialize kernel.');
    return;
  }

  const tools = config.tools as string[];

  if (action === "add") {
    if (tools.includes(tool)) {
      console.log(`Tool already configured: ${tool}`);
      return;
    }
    await saveConfig({ ...config, tools: [...tools, tool] as any }, configRootPath);
    console.log(`Added tool: ${tool}`);
  } else {
    if (!tools.includes(tool)) {
      console.log(`Tool not found: ${tool}`);
      return;
    }
    await saveConfig({ ...config, tools: tools.filter((t) => t !== tool) as any }, configRootPath);
    console.log(`Removed tool: ${tool}`);
  }
}

async function setConfig(configRootPath: string | undefined, key: string, value: string): Promise<void> {
  const config = await loadConfig(configRootPath);
  if (!config) {
    console.log('No kernel configuration found. Run "kernel init" to initialize kernel.');
    return;
  }

  if (key === "delivery" && value === "commands") {
    console.warn('Warning: delivery "commands" is deprecated and has been removed.');
    console.warn('Use "skills" or "both" instead.');
    return;
  }

  await saveConfig({ ...config, [key]: value }, configRootPath);
  console.log(`Set ${key} = ${value}`);
}
