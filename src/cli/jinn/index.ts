#!/usr/bin/env bun

/**
 * Jinn CLI
 *
 * Harness-agnostic AI agent distribution platform.
 */

import { Command } from 'commander';
import { executeInit } from './init.js';
import { executeUpdate } from './update.js';
import { executeConfig } from './config.js';
import { executeDetect } from './detect.js';
import { executeVaultCompile } from './vault.js';

const program = new Command();

program
  .name('jinn')
  .description('AI-native development workflows for any coding assistant')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize jinn in the current project')
  .option('-t, --tools <tools>', 'Comma-separated list of tools (or "all")')
  .option('-p, --profile <profile>', 'Profile to use (core, extended)', 'core')
  .option('-d, --delivery <delivery>', 'What to install (skills, commands, both)', 'both')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (options) => {
    await executeInit({
      tools: options.tools,
      profile: options.profile,
      delivery: options.delivery,
      yes: options.yes,
    });
  });

program
  .command('update')
  .description('Update/regenerate jinn files')
  .option('-f, --force', 'Force regeneration')
  .option('-t, --tool <tool>', 'Update specific tool only')
  .action(async (options) => {
    await executeUpdate({
      force: options.force,
      tool: options.tool,
    });
  });

program
  .command('config')
  .description('Manage jinn configuration')
  .argument('[action]', 'Action: show, add-tool, remove-tool, set')
  .argument('[key]', 'Config key (for set)')
  .argument('[value]', 'Config value (for set)')
  .action(async (action, key, value) => {
    const validActions = ['show', 'add-tool', 'remove-tool', 'set'];
    const actualAction = validActions.includes(action) ? action : 'show';

    await executeConfig({
      action: actualAction as any,
      key,
      value,
    });
  });

program
  .command('detect')
  .description('Detect available AI tools in the project')
  .action(async () => {
    await executeDetect({});
  });

const vault = program
  .command('vault')
  .description('Manage personal knowledge vault skills');

vault
  .command('compile')
  .description('Compile vault skills into each configured AI tool\'s native format')
  .requiredOption('-v, --vault <path>', 'Path to vault root (the directory containing .codex/skills/)')
  .option('-t, --tools <tools>', 'Comma-separated tool IDs to compile for (default: all configured tools)')
  .option('--dry-run', 'Show what would be written without writing any files')
  .action(async (options) => {
    await executeVaultCompile({
      vault: options.vault,
      tools: options.tools,
      dryRun: options.dryRun,
    });
  });

export { program as jinnProgram };
