import { describe, expect, test } from "bun:test";
import { COMMAND_DEFINITIONS } from "./commands";
import { WORKFLOWS_PLAN_TEMPLATE as LEGACY_WORKFLOWS_PLAN_TEMPLATE } from "./templates/workflows";
import { WORKFLOWS_PLAN_TEMPLATE as CANONICAL_WORKFLOWS_PLAN_TEMPLATE } from "./templates/workflows/plan";

describe("workflows:plan command template selection", () => {
  test("binds ghostwire:workflows:plan to canonical workflows/plan template", () => {
    //#given
    const command = COMMAND_DEFINITIONS["ghostwire:workflows:plan"];

    //#when
    const template = command.template;

    //#then - templates are now auto-wrapped with command-instruction tags
    expect(template).toContain(CANONICAL_WORKFLOWS_PLAN_TEMPLATE);
    expect(template).toContain("<command-instruction>");
    expect(template).toContain("</command-instruction>");
  });
});

describe("canonical workflows plan template policy", () => {
  test("enforces brainstorm-first and mandatory research before planning", () => {
    //#given
    const template = CANONICAL_WORKFLOWS_PLAN_TEMPLATE;

    //#when + #then
    expect(template).toContain("Brainstorm first");
    expect(template).toContain("Run mandatory local research");
    expect(template).toContain("Run mandatory external research");
  });

  test("enforces a single strict plan output schema with frontmatter and issue tracking", () => {
    //#given
    const template = CANONICAL_WORKFLOWS_PLAN_TEMPLATE;

    //#when + #then
    expect(template).toContain("Use exactly this output format");
    expect(template).toContain("issue_tracker:");
    expect(template).toContain("issue_url:");
    expect(template).toContain("## Implementation Steps");
    expect(template).toContain("docs/plans/YYYY-MM-DD-descriptive-name-plan.md");
    expect(template).toContain("status: draft|ready|completed|example");
    expect(template).toContain("title, type, date, status");
    expect(template).toContain("Implementation Steps uses checkbox tasks (`- [ ]`)");
    expect(template).toContain("- [ ] Step with scope and expected artifact");
  });
});
