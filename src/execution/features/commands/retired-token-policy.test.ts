import { describe, expect, it } from "bun:test";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { DELETED_RUNTIME_AGENT_IDS } from "./deleted-agent-coverage";

const EXECUTABLE_SURFACES = [
  join(import.meta.dir, "commands"),
  join(import.meta.dir, "templates"),
  join(import.meta.dir, "..", "task-queue"),
  join(import.meta.dir, "..", "..", "..", "orchestration", "hooks", "keyword-detector"),
  join(import.meta.dir, "..", "..", "..", "orchestration", "hooks", "agent-usage-reminder"),
  join(import.meta.dir, "..", "..", "..", "orchestration", "hooks", "planner-md-only"),
];

const RETIRED_TOKENS = [
  ...DELETED_RUNTIME_AGENT_IDS.filter((id) => id.includes("-")),
  "call_grid_agent",
  "advisor-dhh",
  "security-sentinel",
  "performance-advisor-plan",
];

async function getTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getTsFiles(fullPath)));
      continue;
    }

    if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("retired token policy", () => {
  it("denies retired tokens in executable surfaces", async () => {
    const errors: string[] = [];

    for (const surface of EXECUTABLE_SURFACES) {
      const files = await getTsFiles(surface);
      for (const file of files) {
        const text = await readFile(file, "utf-8");
        const lines = text.split("\n");

        lines.forEach((line, index) => {
          RETIRED_TOKENS.forEach((token) => {
            if (line.includes(token)) {
              errors.push(`${file}:${index + 1}: retired token \"${token}\"`);
            }
          });
        });
      }
    }

    expect(errors).toEqual([]);
  });
});
