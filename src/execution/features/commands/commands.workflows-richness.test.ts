import { describe, expect, test } from "bun:test";
import { COMMAND_DEFINITIONS } from "./commands";

describe("workflows prompt richness", () => {
  test("workflows:plan includes mandatory spec-derived planning contracts", () => {
    const template = COMMAND_DEFINITIONS["ghostwire:workflows:plan"].template;
    expect(template).toContain("## User Scenarios & Testing (Mandatory)");
    expect(template).toContain("## Requirements (Mandatory)");
    expect(template).toContain("## Success Criteria (Mandatory)");
    expect(template).toContain("## Technical Context");
    expect(template).toContain("## Constitution Gate");
    expect(template).toContain("Run NEEDS CLARIFICATION scan (mandatory)");
  });

  test("workflows:create exposes deterministic mode contracts", () => {
    const template = COMMAND_DEFINITIONS["ghostwire:workflows:create"].template;
    expect(template).toContain("--mode <tasks|analyze|checklist|issues>");
    expect(template).toContain("## --mode tasks (default)");
    expect(template).toContain("## --mode analyze");
    expect(template).toContain("## --mode checklist");
    expect(template).toContain("## --mode issues");
  });

  test("workflows:work includes pre-implementation gate and explicit phase order", () => {
    const template = COMMAND_DEFINITIONS["ghostwire:workflows:work"].template;
    expect(template).toContain("## Phase 0: Pre-Implementation Checklist Gate (Fail-Fast)");
    expect(template).toContain("## Phase 2: Execution by Explicit Phase Order");
    expect(template).toContain("Setup");
    expect(template).toContain("Foundational");
    expect(template).toContain("User Story Phases");
    expect(template).toContain("Polish");
  });
});
