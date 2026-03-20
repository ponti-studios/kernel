/**
 * Generator
 *
 * Main generator that orchestrates file generation across all configured tools.
 */

import * as fs from "fs/promises";
import * as path from "path";

import type { Config } from "../config/schema.js";
import type { GenerationResult } from "./types.js";
import type { ToolCommandAdapter } from "../adapters/types.js";
import type { SkillTemplate, AgentTemplate } from "../templates/types.js";

import { CONFIG_VERSION } from "../config/defaults.js";
import { createPopulatedAdapterRegistry } from "../adapters/index.js";
import { generateSkillsForAllTools } from "./skill-gen.js";
import { generateAgentsForAllTools } from "./agent-gen.js";
import { generateManifestsForAllTools } from "./manifest-gen.js";

import { getDefaultSkillTemplates, getDefaultAgentTemplates } from "../../templates/catalog.js";

const DEFAULT_SKILL_TEMPLATES: SkillTemplate[] = getDefaultSkillTemplates();
const DEFAULT_AGENT_TEMPLATES: AgentTemplate[] = getDefaultAgentTemplates();

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

    const skillFiles = generateSkillsForAllTools(DEFAULT_SKILL_TEMPLATES, adapters, this.version);
    const manifestFiles = generateManifestsForAllTools(DEFAULT_SKILL_TEMPLATES, adapters, this.version);
    const agentFiles =
      this.config.delivery !== "skills"
        ? generateAgentsForAllTools(DEFAULT_AGENT_TEMPLATES, adapters, this.version)
        : [];

    const { generated, failed } = await this.writeFilesBatch(
      [...skillFiles, ...manifestFiles, ...agentFiles],
      projectPath,
    );
    result.generated = generated;
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

  private async writeFilesBatch(
    files: Array<{ path: string; content: string }>,
    projectPath: string,
  ): Promise<{ generated: string[]; failed: Array<{ path: string; error: string }> }> {
    if (files.length === 0) return { generated: [], failed: [] };

    // Create all required directories up-front in parallel
    const uniqueDirs = [...new Set(files.map((f) => path.dirname(path.join(projectPath, f.path))))];
    await Promise.all(uniqueDirs.map((dir) => fs.mkdir(dir, { recursive: true }).catch(() => {})));

    const generated: string[] = [];
    const failed: Array<{ path: string; error: string }> = [];

    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.writeFile(path.join(projectPath, file.path), file.content, "utf-8");
          generated.push(file.path);
        } catch (error) {
          failed.push({ path: file.path, error: String(error) });
        }
      }),
    );

    return { generated, failed };
  }
}

export async function generateFiles(
  config: Config,
  projectPath: string,
): Promise<GenerationResult> {
  return new Generator(config).generateAll(projectPath);
}
