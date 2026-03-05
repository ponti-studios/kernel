#!/usr/bin/env node

import { Command } from 'commander';

const VERSION = '1.0.0';

const program = new Command();

program
  .name('ghostwire')
  .description('AI-native development workflows for any coding assistant')
  .version(VERSION);

program
  .command('init')
  .description('Initialize ghostwire in the current project')
  .option('-t, --tools <tools>', 'Tools to configure (comma-separated or "all")')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (options) => {
    const { executeInit } = await import('./commands/init.js');
    await executeInit(options);
  });

program
  .command('update')
  .description('Update/regenerate ghostwire files')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (options) => {
    const { executeUpdate } = await import('./commands/update.js');
    await executeUpdate(options);
  });

program
  .command('config')
  .description('Manage ghostwire configuration')
  .argument('[action]', 'Action to perform (show, set, get)', 'show')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .action(async (action, key, value) => {
    const { executeConfig } = await import('./commands/config.js');
    await executeConfig({ action, key, value });
  });

program
  .command('detect')
  .description('Detect available AI tools in the project')
  .action(async (options) => {
    const { executeDetect } = await import('./commands/detect.js');
    await executeDetect(options || {});
  });

program.parse();
