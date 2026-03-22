import { afterEach, describe, expect, it } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { importLegacyChanges } from "../importer";

async function writeFixture(root: string): Promise<void> {
  const changeRoot = join(root, "openspec", "changes", "add-linear-migration");
  await mkdir(join(changeRoot, "specs", "planning"), { recursive: true });
  await writeFile(
    join(changeRoot, "proposal.md"),
    `# Proposal

Move planning into Linear.
`,
  );
  await writeFile(
    join(changeRoot, "design.md"),
    `# Design

Use a Linear project with milestone issues.
`,
  );
  await writeFile(
    join(changeRoot, "tasks.md"),
    `## Phase 1

- [ ] Create project
- [x] Import legacy changes
`,
  );
  await writeFile(
    join(changeRoot, "specs", "planning", "spec.md"),
    `# Planning

## Requirements

- Track milestones in Linear
`,
  );
}

describe("importLegacyChanges", () => {
  let root = "";

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("imports active Legacy changes into normalized Linear payloads", async () => {
    root = await mkdtemp(join(tmpdir(), "spec-linear-import-"));
    await writeFixture(root);

    const projects = await importLegacyChanges(root);

    expect(projects).toHaveLength(1);
    expect(projects[0]?.name).toBe("add-linear-migration");
    expect(projects[0]?.externalRef).toBe("legacy:change:add-linear-migration");
    expect(projects[0]?.issues[0]?.title).toBe("planning");
    expect(projects[0]?.issues[0]?.subIssues.map((issue) => issue.title)).toEqual([
      "Create project",
      "Import legacy changes",
    ]);
  });

  it("is idempotent for the same source tree", async () => {
    root = await mkdtemp(join(tmpdir(), "spec-linear-import-"));
    await writeFixture(root);

    const first = await importLegacyChanges(root);
    const second = await importLegacyChanges(root);

    expect(second).toEqual(first);
  });

  it("creates a minimal project when optional files are missing", async () => {
    root = await mkdtemp(join(tmpdir(), "spec-linear-import-"));
    const changeRoot = join(root, "openspec", "changes", "minimal-change");
    await mkdir(changeRoot, { recursive: true });
    await writeFile(join(changeRoot, "proposal.md"), "Minimal import");

    const projects = await importLegacyChanges(root);

    expect(projects).toHaveLength(1);
    expect(projects[0]?.issues).toHaveLength(1);
    expect(projects[0]?.issues[0]?.title).toBe("Implementation");
  });
});
