import { describe, expect, test } from "bun:test";
import { createMcps } from "./index";

describe("createMcps", () => {
  test("should return all MCPs when disabled_mcps is empty", () => {
    //#given
    const disabledMcps: string[] = [];

    //#when
    const result = createMcps(disabledMcps);

    //#then
    expect(result).toHaveProperty("websearch");
    expect(result).toHaveProperty("context7");
    expect(result).toHaveProperty("grep_app");
    expect(Object.keys(result)).toHaveLength(3);
  });

  test("should filter out disabled built-in MCPs", () => {
    //#given
    const disabledMcps = ["context7"];

    //#when
    const result = createMcps(disabledMcps);

    //#then
    expect(result).toHaveProperty("websearch");
    expect(result).not.toHaveProperty("context7");
    expect(result).toHaveProperty("grep_app");
    expect(Object.keys(result)).toHaveLength(2);
  });

  test("should filter out all built-in MCPs when all disabled", () => {
    //#given
    const disabledMcps = ["websearch", "context7", "grep_app"];

    //#when
    const result = createMcps(disabledMcps);

    //#then
    expect(result).not.toHaveProperty("websearch");
    expect(result).not.toHaveProperty("context7");
    expect(result).not.toHaveProperty("grep_app");
    expect(Object.keys(result)).toHaveLength(0);
  });

  test("should ignore custom MCP names in disabled_mcps", () => {
    //#given
    const disabledMcps = ["context7", "playwright", "custom"];

    //#when
    const result = createMcps(disabledMcps);

    //#then
    expect(result).toHaveProperty("websearch");
    expect(result).not.toHaveProperty("context7");
    expect(result).toHaveProperty("grep_app");
    expect(Object.keys(result)).toHaveLength(2);
  });

  test("should handle empty disabled_mcps by default", () => {
    //#given
    //#when
    const result = createMcps();

    //#then
    expect(result).toHaveProperty("websearch");
    expect(result).toHaveProperty("context7");
    expect(result).toHaveProperty("grep_app");
    expect(Object.keys(result)).toHaveLength(3);
  });

  test("should only filter built-in MCPs, ignoring unknown names", () => {
    //#given
    const disabledMcps = ["playwright", "sqlite", "unknown-mcp"];

    //#when
    const result = createMcps(disabledMcps);

    //#then
    expect(result).toHaveProperty("websearch");
    expect(result).toHaveProperty("context7");
    expect(result).toHaveProperty("grep_app");
    expect(Object.keys(result)).toHaveLength(3);
  });
});
