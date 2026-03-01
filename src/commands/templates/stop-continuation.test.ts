import { describe, expect, test } from "bun:test";
import { WORKFLOWS_STOP_TEMPLATE } from "./stop-continuation";

describe("stop-continuation template", () => {
  test("should export a non-empty template string", () => {
    // #given - the stop-continuation template

    // #when - we access the template

    // #then - it should be a non-empty string
    expect(typeof WORKFLOWS_STOP_TEMPLATE).toBe("string");
    expect(WORKFLOWS_STOP_TEMPLATE.length).toBeGreaterThan(0);
  });

  test("should describe the stop-continuation behavior", () => {
    // #given - the stop-continuation template

    // #when - we check the content

    // #then - it should mention key behaviors
    expect(WORKFLOWS_STOP_TEMPLATE).toContain("grid-todo-continuation-enforcer");
    expect(WORKFLOWS_STOP_TEMPLATE).toContain("Ultrawork Loop");
    expect(WORKFLOWS_STOP_TEMPLATE).toContain("ultrawork state");
  });
});
