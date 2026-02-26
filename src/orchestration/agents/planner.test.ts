import { describe, test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("do agent prompt", () => {
  test("defines implementation-oriented behavior", () => {
    const prompt = readFileSync(join(__dirname, "do.md"), "utf-8");

    expect(prompt.toLowerCase()).toContain("implement");
    expect(prompt.toLowerCase()).toContain("verify");
  });

  test("supports code edits", () => {
    const prompt = readFileSync(join(__dirname, "do.md"), "utf-8");

    expect(prompt.toLowerCase()).toMatch(/write|edit|modify/);
  });
});
