/**
 * Generator
 *
 * Main generator that orchestrates file generation across all configured tools.
 */

import type { Config } from "../config/schema.js";
import type { GenerationResult } from "./types.js";
import type { ToolCommandAdapter } from "../adapters/types.js";

import { CONFIG_VERSION } from "../config/defaults.js";
import { createPopulatedAdapterRegistry } from "../adapters/index.js";
import { generateSkillsForAllTools } from "./skill-gen.js";
import { generateAgentsForAllTools } from "./agent-gen.js";
import { generateManifestsForAllTools } from "./manifest-gen.js";

import {
  getDefaultAgentTemplates,
  getDefaultSkillTemplates,
} from "../../templates/catalog.js";
import { writeFilesBatch } from "../utils/batch-writer.js";

export class Generator {
  private config: Config;
  private adapterRegistry = createPopulatedAdapterRegistry();
  private version = CONFIG_VERSION;

  constructor(config: Config) {
    this.config = config;
  }

  async generateAll(projectPath: string): Promise<GenerationResult> {
    const result: GenerationResult = { generated: [], failed: [], skipped: [], removed: [] };

    const adapters = this.getAdaptersForTools();
    if (adapters.length === 0) {
      result.failed.push({ path: "config", error: "No valid adapters found for configured tools" });
      return result;
    }

    const skillTemplates = getDefaultSkillTemplates(this.config.profile);
    const agentTemplates = getDefaultAgentTemplates(this.config.profile);
    const skillFiles = generateSkillsForAllTools(skillTemplates, adapters, this.version);
    const manifestFiles = generateManifestsForAllTools(skillTemplates, adapters, this.version);
    const agentFiles =
      this.config.delivery !== "skills"
        ? generateAgentsForAllTools(agentTemplates, adapters, this.version)
        : [];

    const { written, failed } = await writeFilesBatch(
      [...skillFiles, ...manifestFiles, ...agentFiles],
      projectPath,
    );
    result.generated = written;
    result.failed = failed;

    return result;
  }

  private getAdaptersForTools(): ToolCommandAdapter[] {
    const adapters: ToolCommandAdapter[] = [];
    for (const toolId of this.config.tools) {
      try {
        adapters.push(this.adapterRegistry.get(toolId));
      } catch {
        console.warn(`No adapter found for tool: ${toolId}`);
      }
    }
    return adapters;
  }
}

export async function generateFiles(
  config: Config,
  projectPath: string,
): Promise<GenerationResult> {
  return new Generator(config).generateAll(projectPath);
}
