import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import reactNativeSkillMarkdown from "./instructions.md";
import { REACT_NATIVE_SKILL_REFERENCES } from "./reference-bundle.js";

export function getReactNativeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.REACT_NATIVE,
    profile: "extended",
    description:
      "Guides React Native and Expo development across UI patterns, Expo Router conventions, styling, navigation, performance, animations, and state management. Use when building React Native screens, implementing mobile navigation, optimizing list performance, or when users ask about mobile UI, animations, or Expo configuration.",
    license: "MIT",
    compatibility: "React Native with Expo Router and Expo SDK.",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Mobile",
      tags: [
        "react-native",
        "expo",
        "expo-router",
        "mobile",
        "performance",
        "animations",
        "reanimated",
        "lists",
        "navigation",
        "ios",
        "apple-hig",
      ],
    },
    when: [
      "user is building any React Native or Expo component, screen, or feature",
      "user is implementing Expo Router navigation, routes, tabs, or stacks",
      "user is styling a mobile UI following Apple HIG",
      "user is optimizing list, scroll, or rendering performance",
      "user is implementing animations with Reanimated or gestures",
      "user is working with native controls, media, storage, or device APIs",
      "user is configuring native modules, fonts, or Expo plugins",
      "user is structuring native dependencies in a monorepo",
    ],
    applicability: [
      "Use for all React Native and Expo app development",
      "Use when implementing any mobile UI, navigation pattern, or screen layout",
      "Use when reviewing mobile code for performance, correctness, or platform conventions",
    ],
    termination: [
      "Component or screen implemented following Expo Router and Apple HIG conventions",
      "Performance rules applied: FlashList, memoized items, stable callbacks",
      "Animations run on UI thread using transform/opacity only",
      "Native navigation stack used instead of JS navigators",
    ],
    outputs: [
      "React Native component or screen following Expo Router conventions",
      "Navigation layout with correct Stack, NativeTabs, and route structure",
      "Performance-optimized list implementation",
      "Animation using Reanimated on GPU-friendly properties",
    ],
    dependencies: [],
    references: REACT_NATIVE_SKILL_REFERENCES,
    instructions: parseFrontmatter(reactNativeSkillMarkdown).body,
  };
}
