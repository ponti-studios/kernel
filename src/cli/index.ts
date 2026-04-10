#!/usr/bin/env bun

/**
 * Command-line interface
 *
 * Harness-agnostic AI agent distribution platform.
 */

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { executeSync } from "./sync.js";

function getVersion(): string {
  const metaPath = fileURLToPath(import.meta.url);
  let baseDir = dirname(metaPath);
  if (baseDir.startsWith("/$bunfs")) {
    baseDir = dirname(process.execPath);
  }
  try {
    const pkg = JSON.parse(readFileSync(join(baseDir, "package.json"), "utf-8"));
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

const program = new Command();

program
  .name("kernel")
  .description("AI-native development workflows for any coding assistant")
  .version(getVersion());

program
  .command("sync")
  .description("Install agents, skills, and commands globally")
  .action(async () => {
    await executeSync({});
  });

export { program };
