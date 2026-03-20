import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getProjectBuildSkillTemplate(): SkillTemplate {
  return {
    name: "spec-build",
    description: "Use when running builds, running tests, or debugging failures in either.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "spec",
      version: "1.0",
      category: "Engineering",
      tags: ["build", "test", "ci", "debug"],
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
    instructions: getSkillInstructions("spec-build"),
  };
}
