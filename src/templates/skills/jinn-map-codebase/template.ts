import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getMapCodebaseSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-map-codebase",
    description:
      "Use when exploring an unfamiliar codebase — to understand its structure, trace how data flows, or answer 'where do I start if I need to change X?'",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Engineering",
      tags: ["codebase", "exploration", "architecture", "mapping"],
    },
    when: [
      "starting work in an unfamiliar codebase",
      "needing to understand where to make a change before making it",
      "tracing data flow through a system end-to-end",
      "producing an architecture summary for onboarding or planning",
    ],
    applicability: [
      "Use before making non-trivial changes in an unfamiliar codebase",
      "Use when a reviewer or new contributor needs a structural orientation",
    ],
    termination: [
      "Entry points identified",
      "Major subsystems mapped with key file references",
      "A representative data flow traced end-to-end",
      "Architecture summary produced",
    ],
    outputs: ["Architecture summary with entry points, subsystems, data flow, and coverage gaps"],
    dependencies: [],
    instructions: getSkillInstructions("jinn-map-codebase"),
  };
}
