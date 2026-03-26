import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getDocsWorkflowSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.DOCS_WORKFLOW,
    profile: "extended",
    description:
      "Manages Vitepress documentation workflows: deploys docs via Vercel, creates versioned releases, records feature demos, and validates doc sites. Use when publishing or updating documentation, cutting a release with docs, or when users ask how to deploy or validate a doc site.",
    license: "MIT",
    compatibility: "Vitepress documentation sites deployed via Vercel or GitHub Pages",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Documentation",
      tags: ["docs", "documentation", "vitepress", "vercel", "deploy", "release", "video"],
    },
    when: [
      "user needs to publish or deploy documentation",
      "a new version release requires documentation updates",
      "a feature demo or walkthrough video needs to be created",
      "the documentation site needs to be validated or tested",
    ],
    applicability: [
      "Use for documentation publishing, versioning, and release workflows",
      "Use when documentation must stay synchronized with a software release",
    ],
    termination: [
      "Documentation deployed and accessible at the target URL",
      "Versioned documentation release created and published",
      "Feature demo script or recording completed",
    ],
    outputs: [
      "Deployed documentation site",
      "Versioned documentation release",
      "Feature demo video or script",
    ],
    dependencies: [],
    disableModelInvocation: true,
    instructions: getSkillInstructions(SKILL_NAMES.DOCS_WORKFLOW),
  };
}
