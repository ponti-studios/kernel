import { describe, expect, it } from "bun:test";
import { isValidCommandName } from "../../../orchestration/agents/constants";
import {
  DELETED_AGENT_COMMAND_COVERAGE,
  DELETED_RUNTIME_AGENT_IDS,
  isValidCoverageEntry,
} from "./deleted-agent-coverage";
import { COMMAND_PROFILE_REGISTRY } from "./profiles";
import { PROFILE_PROMPTS } from "./profiles/prompts";

describe("deleted agent coverage map", () => {
  it("contains exactly one mapping entry per deleted runtime agent", () => {
    const mapped = DELETED_AGENT_COMMAND_COVERAGE.map((entry) => entry.deleted_agent_id);
    const mappedSet = new Set(mapped);

    expect(mapped.length).toBe(DELETED_RUNTIME_AGENT_IDS.length);
    expect(mappedSet.size).toBe(DELETED_RUNTIME_AGENT_IDS.length);
    expect([...mappedSet].sort()).toEqual([...DELETED_RUNTIME_AGENT_IDS].sort());
  });

  it("maps to valid commands and profiles", () => {
    const errors: string[] = [];

    for (const entry of DELETED_AGENT_COMMAND_COVERAGE) {
      if (!isValidCommandName(entry.replacement_command_or_profile)) {
        errors.push(
          `${entry.deleted_agent_id}: invalid command ${entry.replacement_command_or_profile}`,
        );
      }

      if (!(entry.replacement_profile_id in COMMAND_PROFILE_REGISTRY)) {
        errors.push(`${entry.deleted_agent_id}: missing profile ${entry.replacement_profile_id}`);
      }

      if (!isValidCoverageEntry(entry)) {
        errors.push(`${entry.deleted_agent_id}: invalid coverage entry`);
      }
    }

    expect(errors).toEqual([]);
  });

  it("preserves runtime route parity with mapped profile", () => {
    const errors: string[] = [];

    for (const entry of DELETED_AGENT_COMMAND_COVERAGE) {
      const profile = COMMAND_PROFILE_REGISTRY[entry.replacement_profile_id];
      if (!profile) {
        continue;
      }

      if (profile.runtime_route !== entry.runtime_route) {
        errors.push(
          `${entry.deleted_agent_id}: route mismatch coverage=${entry.runtime_route} profile=${profile.runtime_route}`,
        );
      }
    }

    expect(errors).toEqual([]);
  });

  it("contains prompt sources for every mapped profile and no extras", () => {
    const mappedProfiles = DELETED_AGENT_COMMAND_COVERAGE.map((entry) => entry.replacement_profile_id);
    const promptProfiles = Object.keys(PROFILE_PROMPTS);
    expect(promptProfiles.sort()).toEqual([...new Set(mappedProfiles)].sort());
  });

  it("uses exact command-owned prompts for mapped profiles", () => {
    const errors: string[] = [];

    for (const entry of DELETED_AGENT_COMMAND_COVERAGE) {
      const profile = COMMAND_PROFILE_REGISTRY[entry.replacement_profile_id];
      const profilePrompt = PROFILE_PROMPTS[entry.replacement_profile_id];

      if (!profilePrompt) {
        errors.push(`${entry.replacement_profile_id}: missing prompt source`);
        continue;
      }

      if (!profile) {
        errors.push(`${entry.replacement_profile_id}: missing profile`);
        continue;
      }

      if (profile.prompt_append !== profilePrompt) {
        errors.push(`${entry.replacement_profile_id}: prompt mismatch`);
      }
    }

    expect(errors).toEqual([]);
  });
});
