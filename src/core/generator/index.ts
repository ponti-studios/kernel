/**
 * Generator
 *
 * Main generator that orchestrates file generation across all configured tools.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { Config } from '../config/schema.js';
import type { GenerationResult } from './types.js';
import type { ToolCommandAdapter } from '../adapters/types.js';
import type { CommandTemplate, SkillTemplate, AgentTemplate } from '../templates/types.js';

import { CONFIG_VERSION } from '../config/defaults.js';
import { createPopulatedAdapterRegistry } from '../adapters/index.js';
import { generateCommandsForTool } from './command-gen.js';
import { generateSkillsForAllTools } from './skill-gen.js';
import { generateAgentsForAllTools } from './agent-gen.js';

import {
  getGitSmartCommitCommandTemplate,
  getGitBranchCommandTemplate,
  getGitCleanupCommandTemplate,
  getGitMergeCommandTemplate,
} from '../../templates/commands/git.js';

import {
  getCodeFormatCommandTemplate,
  getCodeRefactorCommandTemplate,
  getCodeReviewCommandTemplate,
  getCodeOptimizeCommandTemplate,
} from '../../templates/commands/code.js';

import {
  getWorkflowsPlanCommandTemplate,
  getWorkflowsExecuteCommandTemplate,
  getWorkflowsReviewCommandTemplate,
  getWorkflowsStatusCommandTemplate,
  getWorkflowsStopCommandTemplate,
  getWorkflowsCompleteCommandTemplate,
  getWorkflowsCreateCommandTemplate,
  getWorkflowsBrainstormCommandTemplate,
  getWorkflowsLearningsCommandTemplate,
} from '../../templates/commands/workflows.js';

import {
  getDocsDeployCommandTemplate,
  getDocsFeatureVideoCommandTemplate,
  getDocsReleaseCommandTemplate,
  getDocsTestBrowserCommandTemplate,
} from '../../templates/commands/docs.js';

import {
  getProjectBuildCommandTemplate,
  getProjectConstitutionCommandTemplate,
  getProjectDeployCommandTemplate,
  getProjectInitCommandTemplate,
  getProjectMapCommandTemplate,
} from '../../templates/commands/project.js';

import {
  getUtilCleanCommandTemplate,
  getUtilDoctorCommandTemplate,
} from '../../templates/commands/util.js';

import {
  getProposeCommandTemplate,
  getExploreCommandTemplate,
  getApplyCommandTemplate,
  getArchiveCommandTemplate,
} from '../../templates/commands/workflows-rich.js';

import {
  getGitMasterSkillTemplate,
  getFrontendDesignSkillTemplate,
} from '../../templates/skills/index.js';

import {
  getProposeSkillTemplate,
  getExploreSkillTemplate,
  getApplySkillTemplate,
  getArchiveSkillTemplate,
  getReadySkillTemplate,
} from '../../templates/skills/skills.js';

import {
  ALL_AGENTS,
} from '../../templates/agents/index.js';

const DEFAULT_COMMAND_TEMPLATES: CommandTemplate[] = [
  // Git
  getGitSmartCommitCommandTemplate(),
  getGitBranchCommandTemplate(),
  getGitCleanupCommandTemplate(),
  getGitMergeCommandTemplate(),
  // Code
  getCodeFormatCommandTemplate(),
  getCodeRefactorCommandTemplate(),
  getCodeReviewCommandTemplate(),
  getCodeOptimizeCommandTemplate(),
  // Workflow
  getWorkflowsPlanCommandTemplate(),
  getWorkflowsExecuteCommandTemplate(),
  getWorkflowsReviewCommandTemplate(),
  getWorkflowsStatusCommandTemplate(),
  getWorkflowsStopCommandTemplate(),
  getWorkflowsCompleteCommandTemplate(),
  getWorkflowsCreateCommandTemplate(),
  getWorkflowsBrainstormCommandTemplate(),
  getWorkflowsLearningsCommandTemplate(),
  getProposeCommandTemplate(),
  getExploreCommandTemplate(),
  getApplyCommandTemplate(),
  getArchiveCommandTemplate(),
  // Docs
  getDocsDeployCommandTemplate(),
  getDocsFeatureVideoCommandTemplate(),
  getDocsReleaseCommandTemplate(),
  getDocsTestBrowserCommandTemplate(),
  // Project
  getProjectBuildCommandTemplate(),
  getProjectConstitutionCommandTemplate(),
  getProjectDeployCommandTemplate(),
  getProjectInitCommandTemplate(),
  getProjectMapCommandTemplate(),
  // Utility
  getUtilCleanCommandTemplate(),
  getUtilDoctorCommandTemplate(),
];

const DEFAULT_SKILL_TEMPLATES: SkillTemplate[] = [
  getGitMasterSkillTemplate(),
  getFrontendDesignSkillTemplate(),
  getProposeSkillTemplate(),
  getExploreSkillTemplate(),
  getApplySkillTemplate(),
  getArchiveSkillTemplate(),
  getReadySkillTemplate(),
];

const DEFAULT_AGENT_TEMPLATES: AgentTemplate[] = ALL_AGENTS.map(fn => fn());

export class Generator {
  private config: Config;
  private adapterRegistry = createPopulatedAdapterRegistry();
  private version = CONFIG_VERSION;

  constructor(config: Config) {
    this.config = config;
  }

  async generateAll(projectPath: string): Promise<GenerationResult> {
    const result: GenerationResult = {
      generated: [],
      failed: [],
      skipped: [],
      removed: [],
    };

    const adapters = this.getAdaptersForTools();

    if (adapters.length === 0) {
      result.failed.push({
        path: 'config',
        error: 'No valid adapters found for configured tools',
      });
      return result;
    }

    if (this.config.delivery !== 'commands') {
      const skillResult = await this.generateSkills(adapters, projectPath);
      this.mergeResults(result, skillResult);
    }

    if (this.config.delivery !== 'skills') {
      const commandResult = await this.generateCommands(adapters, projectPath);
      this.mergeResults(result, commandResult);
    }

    if (this.config.delivery !== 'commands') {
      const agentResult = await this.generateAgents(adapters, projectPath);
      this.mergeResults(result, agentResult);
    }

    return result;
  }

  private getAdaptersForTools(): ToolCommandAdapter[] {
    const adapters: ToolCommandAdapter[] = [];

    for (const toolId of this.config.tools) {
      try {
        const adapter = this.adapterRegistry.get(toolId);
        adapters.push(adapter);
      } catch (error) {
        console.warn(`No adapter found for tool: ${toolId}`);
      }
    }

    return adapters;
  }

  private async generateCommands(
    adapters: ToolCommandAdapter[],
    projectPath: string
  ): Promise<GenerationResult> {
    const result: GenerationResult = {
      generated: [],
      failed: [],
      skipped: [],
      removed: [],
    };

    const filesToWrite: Array<{ path: string; content: string }> = [];

    for (const template of DEFAULT_COMMAND_TEMPLATES) {
      const commandId = template.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      for (const adapter of adapters) {
        const generated = generateCommandsForTool(template, commandId, adapter, this.version);
        filesToWrite.push({ path: generated.path, content: generated.content });
      }
    }

    const batchResult = await this.writeFilesBatch(filesToWrite, projectPath);
    result.generated = batchResult.generated;
    result.failed = batchResult.failed;

    return result;
  }

  private async generateSkills(
    adapters: ToolCommandAdapter[],
    projectPath: string
  ): Promise<GenerationResult> {
    const result: GenerationResult = {
      generated: [],
      failed: [],
      skipped: [],
      removed: [],
    };

    const generated = generateSkillsForAllTools(DEFAULT_SKILL_TEMPLATES, adapters, this.version);
    const filesToWrite = generated.map(f => ({ path: f.path, content: f.content }));
    const batchResult = await this.writeFilesBatch(filesToWrite, projectPath);
    result.generated = batchResult.generated;
    result.failed = batchResult.failed;

    return result;
  }

  private async generateAgents(
    adapters: ToolCommandAdapter[],
    projectPath: string
  ): Promise<GenerationResult> {
    const result: GenerationResult = {
      generated: [],
      failed: [],
      skipped: [],
      removed: [],
    };

    const generated = generateAgentsForAllTools(DEFAULT_AGENT_TEMPLATES, adapters, this.version);
    const filesToWrite = generated.map(f => ({ path: f.path, content: f.content }));
    const batchResult = await this.writeFilesBatch(filesToWrite, projectPath);
    result.generated = batchResult.generated;
    result.failed = batchResult.failed;

    return result;
  }

  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // Directory may already exist
    }
  }

  private async ensureDirsBatch(dirPaths: string[]): Promise<void> {
    const uniqueDirs = [...new Set(dirPaths)];
    await Promise.all(uniqueDirs.map(dir => this.ensureDir(dir)));
  }

  private async writeFilesBatch(
    files: Array<{ path: string; content: string }>,
    projectPath: string,
    skipUnchanged: boolean = false
  ): Promise<{ generated: string[]; failed: Array<{ path: string; error: string }> }> {
    const generated: string[] = [];
    const failed: Array<{ path: string; error: string }> = [];

    const dirsToCreate = [...new Set(files.map(f => path.dirname(path.join(projectPath, f.path))))];
    await this.ensureDirsBatch(dirsToCreate);

    const filesToWrite = skipUnchanged 
      ? await this.filterUnchangedFiles(files, projectPath)
      : files;

    if (filesToWrite.length === 0) {
      return { generated: [], failed: [] };
    }

    const writePromises = filesToWrite.map(async (file) => {
      try {
        const fullPath = path.join(projectPath, file.path);
        await fs.writeFile(fullPath, file.content, 'utf-8');
        generated.push(file.path);
      } catch (error) {
        failed.push({
          path: file.path,
          error: String(error),
        });
      }
    });

    await Promise.all(writePromises);
    return { generated, failed };
  }

  private async filterUnchangedFiles(
    files: Array<{ path: string; content: string }>,
    projectPath: string
  ): Promise<Array<{ path: string; content: string }>> {
    const unchanged: Array<{ path: string; content: string }> = [];
    
    const checkPromises = files.map(async (file) => {
      const fullPath = path.join(projectPath, file.path);
      try {
        const existing = await fs.readFile(fullPath, 'utf-8');
        if (existing === file.content) {
          unchanged.push(file);
        }
      } catch {
        // File doesn't exist, needs to be written
      }
    });
    
    await Promise.all(checkPromises);
    
    return files.filter(f => !unchanged.includes(f));
  }

  private mergeResults(target: GenerationResult, source: GenerationResult): void {
    target.generated.push(...source.generated);
    target.failed.push(...source.failed);
    target.skipped.push(...source.skipped);
    target.removed.push(...source.removed);
  }
}

export async function generateFiles(
  config: Config,
  projectPath: string
): Promise<GenerationResult> {
  const generator = new Generator(config);
  return generator.generateAll(projectPath);
}
