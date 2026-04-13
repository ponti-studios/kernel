import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import buildSkillMarkdown from "./instructions.md";

const { body } = parseFrontmatter(buildSkillMarkdown);

export function getBuildSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.BUILD,
    profile: "extended",
    description:
      "Runs and diagnoses the build, type-check, test, and lint pipeline using Bun, Vite, tsgo, and Vitest. Use when a build fails, tests are broken, CI is failing, or when running the full pipeline before a deploy or merge.",
    license: "MIT",
    compatibility: "Bun + Vite + TypeScript 7 projects.",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Engineering",
      tags: ["build", "test", "ci", "debug", "bun", "vite", "vitest", "tsgo", "typescript"],
    },
    when: [
      "running a production build",
      "running tests or debugging a test failure",
      "diagnosing a CI failure that doesn't reproduce locally",
      "debugging a build failure after a dependency or config change",
    ],
    applicability: [
      "Use when building or testing a project",
      "Use when a build or test is failing and the root cause is unknown",
    ],
    termination: [
      "Build succeeds with zero errors and zero suppressed warnings",
      "All tests pass",
      "Root cause of any failure is identified and fixed",
    ],
    outputs: ["Passing build and test suite", "Root cause analysis if a failure was diagnosed"],
    dependencies: [],
    argumentHint: "package name or test filter (optional)",
    instructions: body,
  };
}
