import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  archiveWork,
  completeWorkTask,
  createWork,
  nextWorkTask,
  planWork,
  workStatus,
} from "../index.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "work-test-"));
}

describe("work lifecycle", () => {
  let tmpDir = "";

  afterEach(async () => {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
      tmpDir = "";
    }
  });

  it("creates, plans, advances, and archives local work", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Build analytics dashboard", tmpDir);
    expect(created.workId).toBe("build-analytics-dashboard");

    const planned = await planWork(undefined, tmpDir);
    expect(planned.workId).toBe(created.workId);

    const next = await nextWorkTask(undefined, tmpDir);
    expect(next.nextTask).toBe("Clarify scope and success criteria");

    const completed = await completeWorkTask("clarify-scope", undefined, tmpDir);
    expect(completed.remaining).toBe(3);

    const status = await workStatus(undefined, tmpDir);
    expect(status.progress.complete).toBe(1);
    expect(status.nextTask).toBe("Implement the core path");

    const archived = await archiveWork(undefined, tmpDir);
    expect(archived.archivedTo).toContain("kernel/work/archive/");
  });

  it("preserves edited work documents across lifecycle commands", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Preserve docs", tmpDir);
    const workDir = path.join(tmpDir, created.workDir);
    const briefPath = path.join(workDir, "brief.md");
    const planPath = path.join(workDir, "plan.md");
    const tasksPath = path.join(workDir, "tasks.md");

    await fs.writeFile(briefPath, "# custom brief\n", "utf-8");
    await fs.writeFile(planPath, "# custom plan\n", "utf-8");
    await fs.writeFile(
      tasksPath,
      "# Tasks\n\n- [ ] Clarify scope and success criteria\n- [ ] Implement the core path\n",
      "utf-8",
    );

    await planWork(created.workId, tmpDir);
    await completeWorkTask("clarify-scope", created.workId, tmpDir);

    expect(await fs.readFile(briefPath, "utf-8")).toBe("# custom brief\n");
    expect(await fs.readFile(planPath, "utf-8")).toBe("# custom plan\n");
    expect(await fs.readFile(tasksPath, "utf-8")).toContain("- [x] Clarify scope and success criteria");
    expect(await fs.readFile(tasksPath, "utf-8")).toContain("- [ ] Implement the core path");
  });

  it("rejects invalid work ids", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    await expect(workStatus("../escape", tmpDir)).rejects.toThrow("Invalid workId");
  });

  it("rejects missing parent references", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    await expect(createWork("Child work", { initiativeId: "missing-parent" }, tmpDir)).rejects.toThrow(
      "Unknown initiative: missing-parent",
    );
    await expect(createWork("Child work", { projectId: "missing-project" }, tmpDir)).rejects.toThrow(
      "Unknown project: missing-project",
    );
    await expect(createWork("Child work", { milestoneId: "missing-milestone" }, tmpDir)).rejects.toThrow(
      "Unknown milestone: missing-milestone",
    );
  });

  it("rejects invalid task identifiers", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Invalid task id", tmpDir);
    await expect(completeWorkTask("!!!", created.workId, tmpDir)).rejects.toThrow("Unknown task: !!!");
  });

  it("deduplicates archive destinations", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const first = await createWork("Repeatable archive", tmpDir);
    const firstArchived = await archiveWork(first.workId, tmpDir);

    const second = await createWork("Repeatable archive", tmpDir);
    const secondArchived = await archiveWork(second.workId, tmpDir);

    expect(firstArchived.archivedTo).not.toBe(secondArchived.archivedTo);
    await expect(fs.stat(path.join(tmpDir, firstArchived.archivedTo))).resolves.toBeDefined();
    await expect(fs.stat(path.join(tmpDir, secondArchived.archivedTo))).resolves.toBeDefined();
  });
});
