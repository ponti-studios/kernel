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
  return fs.mkdtemp(path.join(os.tmpdir(), "workv2-test-"));
}

describe("work v2 lifecycle", () => {
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
});
