import { describe, expect, test } from "bun:test";
import { COMMAND_DEFINITIONS } from "./commands";

describe("workflows:complete learnings enforcement", () => {
  test("requires running workflows:learnings during completion", () => {
    const command = COMMAND_DEFINITIONS["ghostwire:workflows:complete"];
    expect(command.template).toContain("MANDATORY: Trigger /ghostwire:workflows:learnings");
    expect(command.template).toContain("Do not mark workflow complete unless learnings capture has been attempted");
  });

  test("declares automatic handoff to workflows:learnings", () => {
    const command = COMMAND_DEFINITIONS["ghostwire:workflows:complete"];
    expect(command.handoffs).toBeDefined();
    expect(command.handoffs?.[0]?.agent).toBe("ghostwire:workflows:learnings");
    expect(command.handoffs?.[0]?.send).toBe(true);
  });
});
