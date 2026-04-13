import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { doctorKernel } from "../doctor.js";
import { initializeKernel } from "../init.js";
import { syncKernelBrain } from "../sync.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "brain-test-"));
}

describe("brain v2", () => {
  let homeDir = "";

  afterEach(async () => {
    if (homeDir) {
      await fs.rm(homeDir, { recursive: true, force: true });
      homeDir = "";
    }
  });

  it("initializes the local brain and syncs enabled hosts", async () => {
    homeDir = await mkTmpDir();
    await fs.mkdir(path.join(homeDir, ".codex"), { recursive: true });

    const init = await initializeKernel(homeDir);
    expect(init.enabledHosts).toContain("codex");

    const skillPath = path.join(homeDir, ".kernel", "brain", "skills", "kernel-build", "SKILL.md");
    expect(await fs.stat(skillPath)).toBeDefined();

    const linkedSkillPath = path.join(homeDir, ".codex", "skills", "kernel-build");
    const linkStats = await fs.lstat(linkedSkillPath);
    expect(linkStats.isSymbolicLink()).toBe(true);

    const sync = await syncKernelBrain(homeDir);
    expect(sync.hosts.length).toBeGreaterThan(0);
    expect(sync.hosts.some((host) => host.host === "codex")).toBe(true);

    const doctor = await doctorKernel(homeDir);
    expect(doctor.issues.filter((issue) => issue.level === "error")).toHaveLength(0);
  });
});
