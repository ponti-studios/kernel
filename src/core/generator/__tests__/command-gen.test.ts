import { describe, expect, it } from "bun:test";

import { claudeAdapter, codexAdapter, cursorAdapter } from "../../adapters/index.js";
import type { CommandTemplate } from "../../templates/types.js";
import {
  generateCommandForTool,
  generateCommandsForAllTools,
  generateCommandsForTool,
} from "../command-gen.js";

const testCommand: CommandTemplate = {
  name: "opsx-explore",
  description: "Enter explore mode",
  instructions: "Think deeply before implementing.",
  backedBySkill: "kernel-openspec-explore",
};

const testCommandWithRef: CommandTemplate = {
  name: "gh-pr-errors",
  description: "Check CI errors",
  instructions: "Use the gh-pr-errors skill.",
  references: [{ relativePath: "scripts/check.sh", content: "#!/usr/bin/env bash\n" }],
};

describe("generateCommandForTool", () => {
  it("path comes from adapter.getCommandPath(template.name)", () => {
    const result = generateCommandForTool(testCommand, claudeAdapter, "1.0.0");
    expect(result[0].path).toBe(".claude/commands/kernel/opsx-explore.md");
  });

  it("content comes from adapter.formatCommand(template, version)", () => {
    const result = generateCommandForTool(testCommand, codexAdapter, "1.0.0");
    expect(result[0].content).toBe(codexAdapter.formatCommand!(testCommand, "1.0.0"));
  });

  it("emits sidecar reference files", () => {
    const result = generateCommandForTool(testCommandWithRef, codexAdapter, "1.0.0");
    expect(result).toHaveLength(2);
    expect(result[1].path).toBe(".codex/commands/scripts/check.sh");
  });
});

describe("generateCommandsForTool", () => {
  it("returns one main file per template plus references", () => {
    const results = generateCommandsForTool(
      [testCommand, testCommandWithRef],
      codexAdapter,
      "1.0.0",
    );
    expect(results).toHaveLength(3);
  });
});

describe("generateCommandsForAllTools", () => {
  it("generates command files for all configured adapters", () => {
    const results = generateCommandsForAllTools(
      [testCommand],
      [claudeAdapter, codexAdapter, cursorAdapter],
      "1.0.0",
    );
    expect(results.map((file) => file.path)).toEqual([
      ".claude/commands/kernel/opsx-explore.md",
      ".codex/commands/opsx-explore.md",
      ".cursor/commands/opsx-explore.md",
    ]);
  });
});
