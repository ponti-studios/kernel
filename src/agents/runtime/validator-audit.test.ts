import { describe, test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("research agent prompt", () => {
  test("defines read/search behavior", () => {
    const prompt = readFileSync(join(__dirname, "research.md"), "utf-8");

    expect(prompt.toLowerCase()).toMatch(/research|search|analy/);
    expect(prompt.toLowerCase()).toMatch(/read/);
  });

  test("disallows direct file writes", () => {
    const prompt = readFileSync(join(__dirname, "research.md"), "utf-8");

    expect(prompt.toLowerCase()).toMatch(/do not write|no write|read-only/);
  });
});
