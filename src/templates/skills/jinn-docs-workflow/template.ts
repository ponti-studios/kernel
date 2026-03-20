import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getDocsWorkflowSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-docs-workflow",
    description:
      "Documentation publishing: deploy docs, create versioned releases, record feature demos, and validate doc sites.",
    license: "MIT",
    compatibility: "Works with any documentation platform",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Documentation",
      tags: ["docs", "documentation", "deploy", "release", "video"],
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
    instructions: getSkillInstructions("jinn-docs-workflow"),
  };
}
