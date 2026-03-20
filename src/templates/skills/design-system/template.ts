import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions, getSkillReferences } from "../../.generated/templates.js";

export function getDesignSystemSkillTemplate(): SkillTemplate {
  return {
    name: "design-system",
    description:
      "Apply when writing, reviewing, or modifying any UI code — components, styles, animations, tokens, or layout. Enforces the Ponti Studios design system: Apple HIG alignment, strict token usage, GSAP-only interactive animations, minimalism, and performance.",
    license: "MIT",
    compatibility: "Any frontend project using React (web or React Native)",
    metadata: {
      author: "Ponti Studios",
      version: "2.1",
      category: "Frontend",
      tags: [
        "design-system",
        "tokens",
        "gsap",
        "animation",
        "typography",
        "color",
        "spacing",
        "components",
        "accessibility",
        "performance",
        "responsive",
        "motion",
      ],
    },
    when: [
      "user is writing or modifying a React component (web or React Native)",
      "user is adding or changing CSS or Tailwind classes",
      "user is adding or changing an animation or transition",
      "user is creating or referencing a design token",
      "user asks about component variants, states, spacing, color, or motion",
      "user asks about breakpoints, layout, grid, or responsive design",
      "user asks about accessibility, color contrast, or touch targets",
      "user asks about loading states, empty states, or error states",
      "user is implementing a form, input, or validation pattern",
      "user is implementing a modal, sheet, drawer, or overlay",
      "user is implementing a toast, notification, or alert",
      "UI code is being reviewed for correctness against the design system",
    ],
    applicability: [
      "Use when implementing any interactive animation — GSAP is mandatory on web",
      "Use when any color, spacing, radius, shadow, duration, or font value is referenced",
      "Use when specifying or reviewing component states (hover, focus, active, disabled, loading, error)",
      "Use when touch target size, icon sizing, or list virtualisation is relevant",
      "Use when implementing responsive layouts, breakpoint-dependent behaviour, or grid systems",
      "Use when writing placeholder text, error messages, or button labels (copy rules apply)",
      "Use when implementing overlay stacking, z-index, or focus trapping",
    ],
    termination: [
      "Component implemented with all required states and correct tokens",
      "Animation implemented using canonical GSAP sequences with reduced-motion guard",
      "Review complete with all checklist items verified",
      "Token added to token files if a value was missing",
    ],
    outputs: [
      "React component code (web or native) aligned to the design system",
      "GSAP animation using canonical sequences",
      "Token additions in the project token files if a value was missing",
      "Review checklist result with pass/fail for each rule",
    ],
    dependencies: [],
    references: getSkillReferences(
      "design-system",
      "references/design-system-foundations.md",
      "references/design-system-motion.md",
      "references/design-system-components.md",
      "references/design-system-patterns.md",
      "references/design-system-chat.md",
    ),
    instructions: getSkillInstructions("design-system"),
  };
}
