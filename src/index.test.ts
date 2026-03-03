import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { includesCaseInsensitive } from "./integration/shared/case-insensitive";
import { createSkills } from "./skills/skills";
import { discoverSharedPipelineSkills, mergeSkills } from "./execution/opencode-skill-loader";
import type { LoadedSkill } from "./execution/opencode-skill-loader/types";

/**
 * Tests for conditional tool registration logic in index.ts
 *
 * The actual plugin initialization is complex to test directly,
 * so we test the underlying logic that determines tool registration.
 */
describe("look_at tool conditional registration", () => {
  describe("isMultimodalLookerEnabled logic", () => {
    // #given opticAnalyst is in disabled_agents
    // #when checking if agent is enabled
    // #then should return false (disabled)
    it("returns false when opticAnalyst is disabled (exact case)", () => {
      const disabledAgents = ["research"];
      const isEnabled = !includesCaseInsensitive(disabledAgents, "research");
      expect(isEnabled).toBe(false);
    });

    // #given opticAnalyst is in disabled_agents with different case
    // #when checking if agent is enabled
    // #then should return false (case-insensitive match)
    it("returns false when opticAnalyst is disabled (case-insensitive)", () => {
      const disabledAgents = ["RESEARCH"];
      const isEnabled = !includesCaseInsensitive(disabledAgents, "research");
      expect(isEnabled).toBe(false);
    });

    // #given opticAnalyst is NOT in disabled_agents
    // #when checking if agent is enabled
    // #then should return true (enabled)
    it("returns true when opticAnalyst is not disabled", () => {
      const disabledAgents = ["do"];
      const isEnabled = !includesCaseInsensitive(disabledAgents, "research");
      expect(isEnabled).toBe(true);
    });

    // #given disabled_agents is empty
    // #when checking if agent is enabled
    // #then should return true (enabled by default)
    it("returns true when disabled_agents is empty", () => {
      const disabledAgents: string[] = [];
      const isEnabled = !includesCaseInsensitive(disabledAgents, "research");
      expect(isEnabled).toBe(true);
    });

    // #given disabled_agents is undefined (simulated as empty array)
    // #when checking if agent is enabled
    // #then should return true (enabled by default)
    it("returns true when disabled_agents is undefined (fallback to empty)", () => {
      const disabledAgents = undefined;
      const isEnabled = !includesCaseInsensitive(disabledAgents ?? [], "research");
      expect(isEnabled).toBe(true);
    });
  });

  describe("conditional tool spread pattern", () => {
    // #given lookAt is not null (agent enabled)
    // #when spreading into tool object
    // #then look_at should be included
    it("includes look_at when lookAt is not null", () => {
      const lookAt = { execute: () => {} }; // mock tool
      const tools = lookAt ? { look_at: lookAt } : {};
      expect(tools).toHaveProperty("look_at");
    });

    // #given lookAt is null (agent disabled)
    // #when spreading into tool object
    // #then look_at should NOT be included
    it("excludes look_at when lookAt is null", () => {
      const lookAt = null;
      const tools = lookAt ? { look_at: lookAt } : {};
      expect(tools).not.toHaveProperty("look_at");
    });
  });
});

describe("shared skill pipeline integration (US3)", () => {
  it("uses one canonical discovery pipeline for merged runtime skills", async () => {
    //#given
    const sandboxRoot = mkdtempSync(join(tmpdir(), "ghostwire-us3-index-"));
    const scopedSkillPath = join(sandboxRoot, ".agents", "skills", "us3-shared-skill", "SKILL.md");
    mkdirSync(dirname(scopedSkillPath), { recursive: true });
    writeFileSync(
      scopedSkillPath,
      `---
name: us3-shared-skill
description: Shared pipeline scoped skill for index integration test.
---
Scoped shared pipeline content.
`,
    );

    try {
      const builtins = createSkills();

      //#when
      const sharedDiscoveredSkills = await discoverSharedPipelineSkills({
        cwd: sandboxRoot,
        includeUserScope: false,
      });
      const merged = mergeSkills(builtins, undefined, sharedDiscoveredSkills);

      //#then
      expect(
        sharedDiscoveredSkills.some((skill: LoadedSkill) => skill.name === "us3-shared-skill"),
      ).toBe(true);
      expect(merged.some((skill: LoadedSkill) => skill.name === "us3-shared-skill")).toBe(true);
    } finally {
      rmSync(sandboxRoot, { recursive: true, force: true });
    }
  });
});
