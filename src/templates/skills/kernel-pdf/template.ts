import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import pdfSkillMarkdown from "./instructions.md";

export function getPdfSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PDF,
    profile: "extended",
    description:
      "Use when tasks involve reading, creating, or reviewing PDF files where rendering and layout matter.",
    license: "Apache-2.0",
    compatibility: "PDF creation, review, and rendering workflows.",
    metadata: {
      author: "Callstack",
      version: "1.0",
      category: "File Formats",
      tags: ["pdf", "rendering", "layout", "inspection", "poppler"],
    },
    when: [
      "user needs to read, review, or extract text from a PDF",
      "user needs to create or edit a PDF programmatically",
      "user needs to verify PDF rendering or layout fidelity",
      "user needs to compare PDF output against visual expectations",
    ],
    applicability: [
      "Use for PDF generation, inspection, and formatting work",
      "Use when visual fidelity matters and a plain text diff is not enough",
      "Use when dedicated PDF tooling is the most direct path",
    ],
    termination: [
      "PDF renders cleanly with no clipping or layout regressions",
      "Required content is present and verified in the rendered output",
      "Any extracted text matches the source or expected data",
      "Output files are organized in the expected project locations",
    ],
    outputs: [
      "Validated PDF file or PDF review notes",
      "Rendered page images for visual inspection",
      "Extraction or generation commands suitable for repeat use",
    ],
    dependencies: [],
    instructions: parseFrontmatter(pdfSkillMarkdown).body,
  };
}
