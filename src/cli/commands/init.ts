/**
 * Ghostwire init command
 *
 * Initializes ghostwire in the current project with beautiful TUI.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { GhostwireConfig } from '../../core/config/schema.js';
import { generateFiles } from '../../core/generator/index.js';
import { detectAvailableTools } from '../../core/discovery/detector.js';
import { displayBanner, displaySubtitle } from '../ui/banner.js';
import { startSpinner, successSpinner, errorSpinner } from '../ui/spinner.js';
import { colors, theme } from '../ui/colors.js';
import { simpleTable } from '../ui/table.js';

export interface InitOptions {
  tools?: string;
  profile?: string;
  delivery?: string;
  yes?: boolean;
  projectPath?: string;
}

export async function executeInit(options: InitOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();

  displayBanner();
  displaySubtitle('Initializing Ghostwire...');

  const detectSpinner = startSpinner('Detecting available AI tools...');
  const availableTools = await detectAvailableTools(projectPath);
  successSpinner(detectSpinner, 'Tools detected');

  let selectedTools: string[];

  if (options.tools) {
    if (options.tools === 'all') {
      selectedTools = availableTools.length > 0 ? availableTools : [];
    } else {
      selectedTools = options.tools.split(',').map((t) => t.trim());
    }
  } else if (availableTools.length === 0) {
    console.log(colors.error('\nNo AI tools detected. Install a tool first (e.g., OpenCode, Cursor).\n'));
    console.log(colors.primary('Ghostwire supports:'));
    console.log(colors.dim('  - OpenCode (.opencode/)'));
    console.log(colors.dim('  - Cursor (.cursor/)'));
    console.log(colors.dim('  - Claude Code (.claude/)'));
    console.log(colors.dim('  - GitHub Copilot (.github/)'));
    console.log(colors.dim('  - And 20+ more tools\n'));
    return;
  } else if (options.yes) {
    selectedTools = availableTools;
  } else {
    console.log(colors.dim('Available tools:'), colors.primary(availableTools.join(', ')));
    console.log(colors.dim('Use --tools to specify or --yes to use all detected.\n'));
    selectedTools = availableTools;
  }

  if (selectedTools.length === 0) {
    console.log(colors.error('No tools specified. Use --tools to specify tools to configure.\n'));
    return;
  }

  console.log(colors.dim('\nConfigured tools:'), colors.success(selectedTools.join(', ')));

  const config: GhostwireConfig = {
    version: '1.0.0',
    tools: selectedTools as any,
    profile: (options.profile as any) || 'core',
    delivery: (options.delivery as any) || 'both',
  };

  const ghostwireDir = path.join(projectPath, '.ghostwire');
  await fs.mkdir(ghostwireDir, { recursive: true });

  const configPath = path.join(ghostwireDir, 'config.yaml');
  const configContent = `version: "${config.version}"
tools:
${config.tools.map((t) => `  - ${t}`).join('\n')}
profile: ${config.profile}
delivery: ${config.delivery}
`;

  const configSpinner = startSpinner('Creating configuration...');
  await fs.writeFile(configPath, configContent, 'utf-8');
  successSpinner(configSpinner, 'Configuration created');

  const generateSpinner = startSpinner('Generating ghostwire files...');
  const result = await generateFiles(config, projectPath);
  
  console.log('');
  const tableData = [
    ['Command', 'Status'],
    ...result.generated.slice(0, 10).map((f) => [colors.dim(f.split('/').pop() || ''), colors.success('✓')]),
    ...(result.generated.length > 10 ? [[colors.dim(`... and ${result.generated.length - 10} more`), colors.dim('')]] : []),
  ];
  simpleTable(tableData);
  
  if (result.failed.length > 0) {
    console.log(colors.warning(`\n${result.failed.length} files failed to generate:`));
    for (const { path: filePath, error } of result.failed) {
      console.log(colors.error(`  - ${filePath}: ${error}`));
    }
  }

  successSpinner(generateSpinner, `${result.generated.length} files generated`);

  console.log('');
  console.log(colors.success('\n✓ Ghostwire initialized successfully!'));
  console.log(colors.dim(`\nConfigured tools: ${selectedTools.join(', ')}`));
  console.log(colors.dim(`Profile: ${config.profile}`));
  console.log('');
  console.log(colors.primary('Try running these commands in your AI tool:'));
  console.log(colors.dim('  /ghostwire:propose'));
  console.log(colors.dim('  /ghostwire:explore'));
  console.log(colors.dim('  /ghostwire:planner'));
  console.log('');
}
