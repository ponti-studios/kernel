import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import assetIntegrationSecuritySkillMarkdown from "./instructions.md";

const { body } = parseFrontmatter(assetIntegrationSecuritySkillMarkdown);

export function getAssetIntegrationSecuritySkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.ASSET_INTEGRATION_SECURITY,
    profile: "extended",
    description:
      "Enforces security requirements for third-party assets and external integrations. Use when adding scripts, fonts, analytics, embeds, CDN resources, or any external dependency to a frontend.",
    license: "MIT",
    compatibility: "Any web frontend project.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Security",
      tags: [
        "security",
        "csp",
        "cors",
        "cdn",
        "third-party",
        "integrity",
        "sri",
        "assets",
        "integrations",
      ],
    },
    when: [
      "user is adding a third-party script, font, or stylesheet from a CDN",
      "user is integrating an analytics, tracking, or marketing tool",
      "user is embedding an iframe or external widget",
      "user is configuring a Content Security Policy",
      "user is adding an API key or integration credential to the frontend",
      "user is loading any external resource not self-hosted",
    ],
    applicability: [
      "Use before adding any external dependency to a frontend bundle or HTML page",
      "Use when reviewing CSP headers or CORS configuration",
      "Use when evaluating whether a third-party tool is safe to integrate",
    ],
    termination: [
      "External resource includes SRI hash or is self-hosted",
      "CSP header configured and tested",
      "No secret API keys embedded in the frontend bundle",
    ],
    outputs: [
      "CSP header configuration",
      "SRI hash for CDN-loaded resource",
      "Security checklist result for the integration",
    ],
    instructions: body,
  };
}
