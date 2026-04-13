import { defineTemplateReferences } from "../../reference-bundle.js";
import milestoneTemplateReference from "./references/milestone-template.md";
import parentIssueTemplateReference from "./references/parent-issue-template.md";
import phaseTemplateReference from "./references/phase-template.md";
import planTemplateReference from "./references/plan-template.md";
import subIssueTemplateReference from "./references/sub-issue-template.md";
import taskTemplateReference from "./references/task-template.md";

export const PROPOSE_SKILL_REFERENCES = defineTemplateReferences(
  ["references/plan-template.md", planTemplateReference],
  ["references/parent-issue-template.md", parentIssueTemplateReference],
  ["references/phase-template.md", phaseTemplateReference],
  ["references/task-template.md", taskTemplateReference],
  ["references/milestone-template.md", milestoneTemplateReference],
  ["references/sub-issue-template.md", subIssueTemplateReference],
);