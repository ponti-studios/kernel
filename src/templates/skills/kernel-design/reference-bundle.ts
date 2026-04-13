import { defineTemplateReferences } from "../../reference-bundle.js";
import chatReference from "./references/chat.md";
import componentsReference from "./references/components.md";
import foundationsReference from "./references/foundations.md";
import motionReference from "./references/motion.md";
import patternsReference from "./references/patterns.md";
import standardsReference from "./references/standards.md";

export const DESIGN_SKILL_REFERENCES = defineTemplateReferences(
  ["references/standards.md", standardsReference],
  ["references/foundations.md", foundationsReference],
  ["references/motion.md", motionReference],
  ["references/components.md", componentsReference],
  ["references/patterns.md", patternsReference],
  ["references/chat.md", chatReference],
);