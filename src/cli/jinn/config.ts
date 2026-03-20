/**
 * Config command
 *
 * Manages spec configuration.
 */

import * as fs from "fs/promises";
import { loadConfig, saveConfig, getConfigPath } from "../../core/config/loader.js";

export interface ConfigOptions {
  action: "show" | "get" | "set" | "add-tool" | "remove-tool";
  key?: string;
  value?: string;
  projectPath?: string;
}

export async function executeConfig(options: ConfigOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();

  if (options.action === "show") {
    await showConfig(projectPath);
  } else if (options.action === "add-tool" && options.value) {
    await modifyTools(projectPath, "add", options.value);
  } else if (options.action === "remove-tool" && options.value) {
    await modifyTools(projectPath, "remove", options.value);
  } else if (options.action === "set" && options.key && options.value) {
    await setConfig(projectPath, options.key, options.value);
  }
}

async function showConfig(projectPath: string): Promise<void> {
  try {
    const content = await fs.readFile(getConfigPath(projectPath), "utf-8");
    console.log(content);
  } catch {
    console.log("No spec configuration found.");
    console.log('Run "spec init" to initialize.');
  }
}

async function modifyTools(
  projectPath: string,
  action: "add" | "remove",
  tool: string,
): Promise<void> {
  const config = await loadConfig(projectPath);
  if (!config) {
    console.log('No spec configuration found. Run "spec init" to initialize.');
    return;
  }

  const tools = config.tools as string[];

  if (action === "add") {
    if (tools.includes(tool)) {
      console.log(`Tool already configured: ${tool}`);
      return;
    }
    await saveConfig({ ...config, tools: [...tools, tool] as any }, projectPath);
    console.log(`Added tool: ${tool}`);
  } else {
    if (!tools.includes(tool)) {
      console.log(`Tool not found: ${tool}`);
      return;
    }
    await saveConfig({ ...config, tools: tools.filter((t) => t !== tool) as any }, projectPath);
    console.log(`Removed tool: ${tool}`);
  }
}

async function setConfig(projectPath: string, key: string, value: string): Promise<void> {
  const config = await loadConfig(projectPath);
  if (!config) {
    console.log('No spec configuration found. Run "spec init" to initialize.');
    return;
  }

  if (key === "delivery" && value === "commands") {
    console.warn('Warning: delivery "commands" is deprecated and has been removed.');
    console.warn('Use "skills" or "both" instead.');
    return;
  }

  await saveConfig({ ...config, [key]: value }, projectPath);
  console.log(`Set ${key} = ${value}`);
}
