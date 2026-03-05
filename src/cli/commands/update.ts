/**
 * Ghostwire update command
 *
 * Updates/regenerates ghostwire files with beautiful TUI.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { GhostwireConfig } from '../../core/config/schema.js';
import { generateFiles } from '../../core/generator/index.js';
import { startSpinner, successSpinner, errorSpinner } from '../ui/spinner.js';
import { colors } from '../ui/colors.js';
import { simpleTable } from '../ui/table.js';

export interface UpdateOptions {
  force?: boolean;
  tool?: string;
  projectPath?: string;
  yes?: boolean;
}

export async function executeUpdate(options: UpdateOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, '.ghostwire', 'config.yaml');

  console.log(colors.cyan('\n📦 Updating ghostwire...\n'));

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(configContent);

    if (options.tool) {
      config.tools = [options.tool] as any;
    }

    console.log(colors.dim('Tools:'), colors.primary(config.tools.join(', ')));
    console.log(colors.dim('Profile:'), colors.primary(config.profile));
    console.log(colors.dim('Delivery:'), colors.primary(config.delivery));
    console.log('');

    const generateSpinner = startSpinner('Regenerating ghostwire files...');
    const result = await generateFiles(config, projectPath);
    
    const tableData = [
      ['Action', 'Count'],
      [colors.success('Generated'), String(result.generated.length)],
      [colors.warning('Failed'), String(result.failed.length)],
      [colors.dim('Skipped'), String(result.skipped.length)],
      [colors.dim('Removed'), String(result.removed.length)],
    ];
    simpleTable(tableData);
    
    if (result.failed.length > 0) {
      console.log(colors.warning('\nFailed files:'));
      for (const { path: filePath, error } of result.failed) {
        console.log(colors.error(`  - ${filePath}: ${error}`));
      }
    }

    successSpinner(generateSpinner, 'Files regenerated');

    console.log(colors.success('\n✓ Ghostwire updated successfully!'));
  } catch (error) {
    console.error(colors.error('\nError:'), error);
    console.log(colors.dim('\nRun "ghostwire init" first to initialize ghostwire.'));
  }
}

function parseConfig(content: string): GhostwireConfig {
  const lines = content.split('\n');
  const config: any = {
    version: '1.0.0',
    tools: [],
    profile: 'core',
    delivery: 'both',
  };

  let currentKey = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('version:')) {
      config.version = trimmed.split(':')[1].trim().replace(/"/g, '');
    } else if (trimmed.startsWith('tools:')) {
      currentKey = 'tools';
    } else if (trimmed.startsWith('profile:')) {
      config.profile = trimmed.split(':')[1].trim();
    } else if (trimmed.startsWith('delivery:')) {
      config.delivery = trimmed.split(':')[1].trim();
    } else if (currentKey === 'tools' && trimmed.startsWith('-')) {
      config.tools.push(trimmed.replace('-', '').trim());
    }
  }

  return config as GhostwireConfig;
}
