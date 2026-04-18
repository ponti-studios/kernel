import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  archiveWork,
  completeWorkTask,
  createWork,
  listArchivedWork,
  listWork,
  nextWorkTask,
  planWork,
  restoreWork,
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

  it("listWork returns all active items and the current pointer", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const a = await createWork("Item alpha", tmpDir);
    const b = await createWork("Item beta", tmpDir);

    const list = await listWork(tmpDir);
    expect(list.items).toHaveLength(2);
    expect(list.items.map((i) => i.id)).toContain(a.workId);
    expect(list.items.map((i) => i.id)).toContain(b.workId);
    expect(list.currentWorkId).toBe(b.workId);

    const item = list.items.find((i) => i.id === a.workId)!;
    expect(item.status).toBe("active");
    expect(item.progress.total).toBe(4);
    expect(item.progress.complete).toBe(0);
  });

  it("archiveWork warns about incomplete tasks", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Incomplete work", tmpDir);
    await completeWorkTask("clarify-scope", created.workId, tmpDir);

    const archived = await archiveWork(created.workId, tmpDir);
    expect(archived.warnings).toBeDefined();
    expect(archived.warnings!.length).toBe(1);
    expect(archived.warnings![0]).toContain("3 incomplete task(s)");
  });

  it("archiveWork with all tasks done produces no warnings", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Complete work", tmpDir);
    await completeWorkTask("clarify-scope", created.workId, tmpDir);
    await completeWorkTask("implement-core-path", created.workId, tmpDir);
    await completeWorkTask("verify-behavior", created.workId, tmpDir);
    await completeWorkTask("capture-followups", created.workId, tmpDir);

    const archived = await archiveWork(created.workId, tmpDir);
    expect(archived.warnings).toBeUndefined();
  });

  it("archiveWork auto-advances pointer to next active item", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const a = await createWork("Item alpha", tmpDir);
    const b = await createWork("Item beta", tmpDir);

    // pointer is on b after second create
    await archiveWork(b.workId, tmpDir);

    // pointer should now resolve to the only remaining item
    const status = await workStatus(undefined, tmpDir);
    expect(status.workId).toBe(a.workId);
  });

  it("resolves work item automatically when only one exists and pointer is cleared", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const a = await createWork("Solo item", tmpDir);
    const b = await createWork("Second item", tmpDir);

    // archive the active item (b), pointer advances to a
    await archiveWork(b.workId, tmpDir);

    // status with no explicit id should resolve to a
    const status = await workStatus(undefined, tmpDir);
    expect(status.workId).toBe(a.workId);
    expect(status.goal).toBe("Solo item");
  });

  it("completeWorkTask appends a journal entry", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Journal task test", tmpDir);
    await completeWorkTask("clarify-scope", created.workId, tmpDir);

    const journalPath = path.join(tmpDir, created.workDir, "journal.md");
    const journal = await fs.readFile(journalPath, "utf-8");
    expect(journal).toContain("Completed task: Clarify scope and success criteria");
  });

  it("archiveWork appends a journal entry before moving", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Journal archive test", tmpDir);
    const journalPath = path.join(tmpDir, created.workDir, "journal.md");

    const archived = await archiveWork(created.workId, tmpDir);
    // journal is inside the archive now
    const archivedJournalPath = path.join(tmpDir, archived.archivedTo, "journal.md");
    const journal = await fs.readFile(archivedJournalPath, "utf-8");
    expect(journal).toContain("Archived with");
  });

  it("listArchivedWork returns archived items", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Item to archive", tmpDir);
    const archived = await archiveWork(created.workId, tmpDir);

    const list = await listArchivedWork(tmpDir);
    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe(created.workId);
    expect(list.items[0].archivedDir).toBe(archived.archivedTo);
  });

  it("restoreWork moves item back to active and updates pointer", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Restore me", tmpDir);
    await archiveWork(created.workId, tmpDir);

    // item should be archived now
    const archivedList = await listArchivedWork(tmpDir);
    expect(archivedList.items.map((i) => i.id)).toContain(created.workId);

    const restored = await restoreWork(created.workId, tmpDir);
    expect(restored.workId).toBe(created.workId);

    // should appear in active list again
    const activeList = await listWork(tmpDir);
    expect(activeList.items.map((i) => i.id)).toContain(created.workId);
    expect(activeList.currentWorkId).toBe(created.workId);

    // should no longer be in archived list
    const archivedAfter = await listArchivedWork(tmpDir);
    expect(archivedAfter.items.map((i) => i.id)).not.toContain(created.workId);

    // restored item status in yaml should be active
    const status = await workStatus(created.workId, tmpDir);
    expect(status.workId).toBe(created.workId);
  });

  it("restoreWork appends journal entry", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Journal restore test", tmpDir);
    await archiveWork(created.workId, tmpDir);
    const restored = await restoreWork(created.workId, tmpDir);

    const journalPath = path.join(tmpDir, restored.restoredTo, "journal.md");
    const journal = await fs.readFile(journalPath, "utf-8");
    expect(journal).toContain("Restored from archive");
  });

  it("restoreWork rejects unknown work id", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    await expect(restoreWork("no-such-item", tmpDir)).rejects.toThrow("No archived work item found");
  });

  it("exact task id match does not collide on shared prefix", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const created = await createWork("Prefix collision test", tmpDir);
    const tasksPath = path.join(tmpDir, created.workDir, "tasks.md");
    await fs.writeFile(
      tasksPath,
      "# Tasks\n\n- [ ] Verify behavior with tests\n- [ ] Verify deployment works\n",
      "utf-8",
    );

    // completing by full title slug must not ambiguously match both
    await completeWorkTask("verify-behavior-with-tests", created.workId, tmpDir);
    const content = await fs.readFile(tasksPath, "utf-8");
    expect(content).toContain("- [x] Verify behavior with tests");
    expect(content).toContain("- [ ] Verify deployment works");
  });
});
