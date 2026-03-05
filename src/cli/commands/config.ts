/**
 * Ghostwire config command
 *
 * Manages ghostwire configuration with beautiful TUI.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { GhostwireConfig } from '../../core/config/schema.js';
import { colors } from '../ui/colors.js';
import { simpleTable } from '../ui/table.js';

export interface ConfigOptions {
  action?: string;
  key?: string;
  value?: string;
  projectPath?: string;
}

export async function executeConfig(options: ConfigOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, '.ghostwire', 'config.yaml');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(configContent);

    if (options.action === 'get' && options.key) {
      const value = (config as any)[options.key];
      if (value !== undefined) {
        console.log(colors.success(value));
      } else {
        console.log(colors.error(`Key "${options.key}" not found`));
      }
      return;
    }

    if (options.action === 'set' && options.key && options.value !== undefined) {
      (config as any)[options.key] = options.value;
      const newContent = serializeConfig(config);
      await fs.writeFile(configPath, newContent, 'utf-8');
      console.log(colors.success(`\n✓ Set ${options.key} = ${options.value}`));
      return;
    }

    console.log(colors.cyan('\n⚙️  Ghostwire Configuration\n'));
    
    const tableData = [
      [colors.dim('Key'), colors.dim('Value')],
      [colors.primary('version'), colors.success(config.version)],
      [colors.primary('tools'), colors.success(config.tools.join(', '))],
      [colors.primary('profile'), colors.success(config.profile)],
      [colors.primary('delivery'), colors.success(config.delivery)],
    ];
    simpleTable(tableData);
    
    console.log(colors.dim('\nUsage:'));
    console.log(colors.dim('  ghostwire config show        # Show configuration'));
    console.log(colors.dim('  ghostwire config get <key>   # Get a value'));
    console.log(colors.dim('  ghostwire config set <key> <value>  # Set a value'));
    console.log('');
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

function serializeConfig(config: GhostwireConfig): string {
  return `version: "${config.version}"
tools:
${config.tools.map((t) => `  - ${t}`).join('\n')}
profile: ${config.profile}
delivery: ${config.delivery}
`;
}
