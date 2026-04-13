import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import testingStandardsSkillMarkdown from "./instructions.md";

export function getTestingStandardsSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.TESTING_STANDARDS,
    profile: "extended",
    description:
      "Provides testing guidance for test files and test strategy decisions across unit, integration, and end-to-end layers. Use when writing new tests, reviewing test coverage, deciding where a test should live, or when users ask about testing patterns, test structure, or what to test.",
    license: "MIT",
    compatibility: "Any TypeScript project using Vitest, Jest, or a compatible test runner.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Engineering",
      tags: [
        "testing",
        "unit-tests",
        "integration-tests",
        "e2e",
        "vitest",
        "jest",
        "tdd",
        "coverage",
        "factories",
      ],
    },
    when: [
      "user is writing tests for a new feature or bug fix",
      "user is deciding what type of test to write (unit vs integration vs E2E)",
      "user is reviewing tests for correctness, coverage, or naming",
      "user is structuring test files or choosing test tooling",
      "user is investigating a flaky or ineffective test",
    ],
    applicability: [
      "Use when writing any automated test",
      "Use when reviewing tests for behavior coverage vs implementation coverage",
      "Use when establishing the test strategy for a new module or feature",
    ],
    termination: [
      "Tests describe behavior, not implementation",
      "Each test cleans up after itself",
      "Integration tests use a real database, not mocks",
    ],
    outputs: [
      "Unit tests for pure business logic",
      "Integration tests for API routes or service boundaries",
      "Test factory functions for repeatable test data",
    ],
    instructions: parseFrontmatter(testingStandardsSkillMarkdown).body,
  };
}
