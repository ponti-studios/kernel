import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getFrontendDesignSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-frontend-design",
    description: "Frontend development and UI implementation best practices",
    license: "MIT",
    compatibility: "Works with any frontend project",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Frontend",
      tags: ["frontend", "ui", "css", "html"],
    },
    when: [
      "user is building or reviewing UI components",
      "user asks about CSS, layout, responsiveness, or accessibility",
      "frontend code needs a design or quality review",
    ],
    applicability: [
      "Use when implementing or reviewing frontend components and UI code",
      "Use when applying responsive design, accessibility, or CSS best practices",
    ],
    termination: [
      "Component implemented or reviewed with feedback provided",
      "Design pattern or best practice applied",
    ],
    outputs: ["Frontend component code", "CSS or design recommendations"],
    dependencies: [],
    instructions: getSkillInstructions("jinn-frontend-design"),
  };
}
