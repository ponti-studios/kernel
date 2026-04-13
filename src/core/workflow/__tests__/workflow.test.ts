import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  archiveChange,
  createChange,
  getApplyInstructions,
  getArtifactInstruction,
  getChangeStatus,
  resolveKernelProject,
  specifyFeature,
  planFeature,
  generateTasks,
  analyzeFeature,
} from "../index.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "kernel-workflow-"));
}

describe("kernel workflow runtime", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"workflow-test"}', "utf-8");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("creates a kernel project layout and change scaffold", async () => {
    const project = await resolveKernelProject(tmpDir, { createIfMissing: true });
    const result = await createChange(project, "Add Auth");

    expect(result.change).toBe("add-auth");
    await expect(
      fs.stat(path.join(tmpDir, "kernel", "changes", "add-auth", "change.json")),
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(tmpDir, ".kernel", "templates", "spec-template.md")),
    ).resolves.toBeDefined();
  });

  it("computes change status and artifact instructions", async () => {
    const project = await resolveKernelProject(tmpDir, { createIfMissing: true });
    await createChange(project, "Add Auth");

    const status = await getChangeStatus(project, "add-auth");
    expect(status.applyRequires).toEqual(["tasks"]);
    expect(status.artifacts.map((artifact) => artifact.status)).toEqual([
      "ready",
      "blocked",
      "blocked",
    ]);

    const proposal = await getArtifactInstruction(project, "add-auth", "proposal");
    expect(proposal.outputPath).toBe("kernel/changes/add-auth/proposal.md");
    expect(proposal.template).toContain("# Proposal");
  });

  it("returns apply instructions with progress and task state", async () => {
    const project = await resolveKernelProject(tmpDir, { createIfMissing: true });
    await createChange(project, "Add Auth");
    await fs.writeFile(
      path.join(tmpDir, "kernel", "changes", "add-auth", "proposal.md"),
      "# Proposal\n",
      "utf-8",
    );
    await fs.writeFile(
      path.join(tmpDir, "kernel", "changes", "add-auth", "design.md"),
      "# Design\n",
      "utf-8",
    );
    await fs.writeFile(
      path.join(tmpDir, "kernel", "changes", "add-auth", "tasks.md"),
      "# Tasks\n\n- [x] First task\n- [ ] Second task\n",
      "utf-8",
    );

    const apply = await getApplyInstructions(project, "add-auth");
    expect(apply.state).toBe("in_progress");
    expect(apply.progress).toEqual({ total: 2, complete: 1, remaining: 1 });
    expect(apply.contextFiles).toContain("kernel/changes/add-auth/tasks.md");
  });

  it("archives a change and reports spec sync state", async () => {
    const project = await resolveKernelProject(tmpDir, { createIfMissing: true });
    await createChange(project, "Add Auth");
    await fs.writeFile(
      path.join(tmpDir, "kernel", "changes", "add-auth", "proposal.md"),
      "# Proposal\n",
      "utf-8",
    );
    await fs.writeFile(
      path.join(tmpDir, "kernel", "changes", "add-auth", "design.md"),
      "# Design\n",
      "utf-8",
    );
    await fs.writeFile(
      path.join(tmpDir, "kernel", "changes", "add-auth", "tasks.md"),
      "# Tasks\n\n- [x] First task\n",
      "utf-8",
    );

    const result = await archiveChange(project, "add-auth");
    expect(result.archivedTo).toContain("kernel/changes/archive/");
    await expect(fs.stat(path.join(tmpDir, result.archivedTo))).resolves.toBeDefined();
    expect(result.specsState).toBe("no-delta");
  });

  it("creates and advances a spec workflow under kernel and .kernel", async () => {
    const feature = await specifyFeature("Build analytics dashboard", tmpDir);
    expect(feature.featureDirectory).toContain("kernel/specs/");
    await expect(fs.stat(path.join(tmpDir, ".kernel", "feature.json"))).resolves.toBeDefined();

    const plan = await planFeature(tmpDir);
    const tasks = await generateTasks(tmpDir);
    const analysis = await analyzeFeature(tmpDir);

    expect(plan.outputPath).toContain("plan.md");
    expect(tasks.outputPath).toContain("tasks.md");
    expect(analysis.readyForImplementation).toBe(true);
  });
});
