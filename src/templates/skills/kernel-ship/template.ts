import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getShipSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.SHIP,
    profile: "extended",
    description:
      "Validate production readiness, confirm with the user, then deploy with the correct strategy for the change. Use when deploying services, releasing a feature, coordinating database migrations, managing mobile builds, or diagnosing a deployment failure.",
    license: "MIT",
    compatibility:
      "Requires access to deployment tooling (Fly.io, EAS) and Linear for verdict comments.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "ship", "deploy", "release", "linear"],
    },
    when: [
      "user wants to deploy a service, release a feature, or ship a build",
      "a PR or branch is ready for production",
      "a deployment needs readiness validation before proceeding",
      "user says 'ship', 'deploy', 'release', or 'push to production'",
    ],
    termination: [
      "Readiness verdict delivered and written to Linear issue",
      "Deployment executed with chosen strategy",
      "Post-deploy verification complete",
    ],
    outputs: [
      "Readiness verdict (PASS / FAIL) written to Linear issue comment",
      "Deployed release in target environment",
      "Post-deploy verification summary",
    ],
    dependencies: [SKILL_NAMES.REVIEW],
    disableModelInvocation: true,
    allowedTools: ["mcp_linear_get_issue", "mcp_linear_save_comment"],
    argumentHint: "branch, PR, feature, or issue to ship",
    instructions: getSkillInstructions(SKILL_NAMES.SHIP),
  };
}
