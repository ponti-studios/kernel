import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getProjectInitSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-project-init",
    description: "Use when setting up a new project from scratch or from a template.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Engineering",
      tags: ["project", "init", "setup", "tooling"],
    },
    when: [
      "setting up a new project from scratch or from a template",
      "bootstrapping a new repository",
      "configuring tooling (linter, formatter, type checker, test runner) on a fresh codebase",
    ],
    applicability: [
      "Use when initializing a new project before any application code is written",
      "Use when onboarding a new repo that is missing core tooling configuration",
    ],
    termination: [
      "Dependencies install cleanly with no unresolved peer conflicts",
      "build succeeds with zero errors and zero warnings treated as errors",
      "test runner runs and passes",
      "Linter and formatter run cleanly",
      "Git is initialized with a .gitignore and an initial commit",
    ],
    outputs: ["Initialized project with working build, test, lint, and format pipelines"],
    dependencies: [],
    instructions: getSkillInstructions("jinn-project-init"),
  };
}
