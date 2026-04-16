import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  createInitiative,
  doneInitiative,
  planInitiative,
} from "../../initiative/index.js";
import {
  createMilestone,
  doneMilestone,
  planMilestone,
} from "../../milestone/index.js";
import {
  createProject,
  doneProject,
  planProject,
} from "../../project/index.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "hierarchy-test-"));
}

describe("hierarchy lifecycle", () => {
  let tmpDir = "";

  afterEach(async () => {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
      tmpDir = "";
    }
  });

  it("preserves edited initiative, project, and milestone docs", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const initiative = await createInitiative("Program alpha", tmpDir);
    const project = await createProject("Project alpha", { initiativeId: initiative.initiativeId }, tmpDir);
    const milestone = await createMilestone("Milestone alpha", { projectId: project.projectId }, tmpDir);

    const initiativeBrief = path.join(tmpDir, initiative.initiativeDir, "brief.md");
    const projectBrief = path.join(tmpDir, project.projectDir, "brief.md");
    const projectPlan = path.join(tmpDir, project.projectDir, "plan.md");
    const milestoneBrief = path.join(tmpDir, milestone.milestoneDir, "brief.md");

    await fs.writeFile(initiativeBrief, "initiative notes\n", "utf-8");
    await fs.writeFile(projectBrief, "project notes\n", "utf-8");
    await fs.writeFile(projectPlan, "project plan\n", "utf-8");
    await fs.writeFile(milestoneBrief, "milestone notes\n", "utf-8");

    await planInitiative(initiative.initiativeId, tmpDir);
    await doneInitiative(initiative.initiativeId, tmpDir);
    await planProject(project.projectId, tmpDir);
    await doneProject(project.projectId, tmpDir);
    await planMilestone(milestone.milestoneId, tmpDir);
    await doneMilestone(milestone.milestoneId, tmpDir);

    expect(await fs.readFile(initiativeBrief, "utf-8")).toBe("initiative notes\n");
    expect(await fs.readFile(projectBrief, "utf-8")).toBe("project notes\n");
    expect(await fs.readFile(projectPlan, "utf-8")).toBe("project plan\n");
    expect(await fs.readFile(milestoneBrief, "utf-8")).toBe("milestone notes\n");
  });

  it("rejects missing parent links and invalid ids", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    await expect(createProject("Project alpha", { initiativeId: "missing-initiative" }, tmpDir)).rejects.toThrow(
      "Unknown initiative: missing-initiative",
    );
    await expect(createMilestone("Milestone alpha", { projectId: "missing-project" }, tmpDir)).rejects.toThrow(
      "Unknown project: missing-project",
    );
    await expect(planInitiative("../escape", tmpDir)).rejects.toThrow("Invalid initiativeId");
    await expect(planProject("../escape", tmpDir)).rejects.toThrow("Invalid projectId");
    await expect(planMilestone("../escape", tmpDir)).rejects.toThrow("Invalid milestoneId");
  });
});
