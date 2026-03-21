import type { SkillTemplate } from "../../../core/templates/types';
import { getSkillInstructions } from "../../.generated/templates';

export function getKernelDeploySkillTemplate(): SkillTemplate {
  return {
    name: "kernel-deploy",
    description:
      "Use when deploying to any environment — staging, production, or otherwise — or when diagnosing a deployment failure.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "kernel",
      version: "1.0",
      category: "Engineering",
      tags: ["deploy", "deployment", "rollback", "environment"],
    },
    when: [
      "deploying to staging, production, or any other environment",
      "diagnosing a deployment failure or regression",
      "choosing a deployment strategy for a high-risk change",
      "verifying a deployment succeeded",
    ],
    applicability: [
      "Use before and during any environment deployment",
      "Use when a deployment failed and needs diagnosis or rollback",
    ],
    termination: [
      "Pre-deployment checklist passed",
      "Deployment completed and post-deployment verification passed",
      "Or: rollback completed and root cause identified",
    ],
    outputs: ["Deployed environment", "Post-deployment verification report", "Or: rollback confirmation + root cause"],
    dependencies: [],
    disableModelInvocation: true,
    instructions: getSkillInstructions("kernel-deploy"),
  };
}
