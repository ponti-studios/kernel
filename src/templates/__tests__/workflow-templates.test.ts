import { describe, expect, it } from "bun:test";

import { getBuiltInCatalog } from "../../core/brain/catalog.js";
import { getReviewSkillTemplate } from "../skills/kernel-review/template.js";

describe("workflow skill templates", () => {
  it("v2 built-in packages expose the local-first default set", () => {
    const packageIds = getBuiltInCatalog().packages.map((pkg) => pkg.id);
    expect(packageIds).toContain("core-brain");
    expect(packageIds).toContain("workflow-local");
    expect(packageIds).toContain("git");
    expect(packageIds).toContain("review");
  });

  it("local review skill has non-empty instructions", () => {
    const review = getReviewSkillTemplate();
    expect(review.instructions.length).toBeGreaterThan(0);
  });

  it("local review skill allows the core inspection toolchain", () => {
    const review = getReviewSkillTemplate();
    expect(review.allowedTools).toEqual(["Read", "Grep", "Glob", "Bash"]);
  });

  it("local review skill no longer depends on Linear language", () => {
    const review = getReviewSkillTemplate();
    expect(review.instructions.toLowerCase()).not.toContain("linear");
  });
});
