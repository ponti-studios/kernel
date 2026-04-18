import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  createInitiative,
  doneInitiative,
  listInitiatives,
  planInitiative,
} from "../../initiative/index.js";
import {
  createMilestone,
  doneMilestone,
  listMilestones,
  planMilestone,
} from "../../milestone/index.js";
import {
  createProject,
  doneProject,
  listProjects,
  planProject,
} from "../../project/index.js";
import { createWork } from "../../work/index.js";

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

  it("creates plan.md for initiative and milestone", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const initiative = await createInitiative("Init with plan", tmpDir);
    const project = await createProject("Proj with plan", {}, tmpDir);
    const milestone = await createMilestone("Ms with plan", {}, tmpDir);

    await expect(fs.stat(path.join(tmpDir, initiative.initiativeDir, "plan.md"))).resolves.toBeDefined();
    await expect(fs.stat(path.join(tmpDir, project.projectDir, "plan.md"))).resolves.toBeDefined();
    await expect(fs.stat(path.join(tmpDir, milestone.milestoneDir, "plan.md"))).resolves.toBeDefined();
  });

  it("planInitiative and planMilestone return planPath", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const initiative = await createInitiative("Plan path test", tmpDir);
    const milestone = await createMilestone("Plan path test", {}, tmpDir);

    const iPlanned = await planInitiative(initiative.initiativeId, tmpDir);
    const mPlanned = await planMilestone(milestone.milestoneId, tmpDir);

    expect(iPlanned.planPath).toContain("plan.md");
    expect(mPlanned.planPath).toContain("plan.md");
  });

  it("sets doneAt on all hierarchy levels when marked done", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const initiative = await createInitiative("DoneAt initiative", tmpDir);
    const project = await createProject("DoneAt project", {}, tmpDir);
    const milestone = await createMilestone("DoneAt milestone", {}, tmpDir);

    await doneInitiative(initiative.initiativeId, tmpDir);
    await doneProject(project.projectId, tmpDir);
    await doneMilestone(milestone.milestoneId, tmpDir);

    const iYaml = await fs.readFile(path.join(tmpDir, initiative.initiativeDir, "initiative.yaml"), "utf-8");
    const pYaml = await fs.readFile(path.join(tmpDir, project.projectDir, "project.yaml"), "utf-8");
    const mYaml = await fs.readFile(path.join(tmpDir, milestone.milestoneDir, "milestone.yaml"), "utf-8");

    expect(iYaml).toContain("doneAt:");
    expect(pYaml).toContain("doneAt:");
    expect(mYaml).toContain("doneAt:");
  });

  it("doneInitiative warns when linked projects are still active", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const initiative = await createInitiative("Initiative with active child", tmpDir);
    await createProject("Active project", { initiativeId: initiative.initiativeId }, tmpDir);

    const result = await doneInitiative(initiative.initiativeId, tmpDir);
    expect(result.warnings).toBeDefined();
    expect(result.warnings![0]).toContain("1 linked project(s) are still active");
  });

  it("doneProject warns when linked milestones are still active", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const project = await createProject("Project with active child", {}, tmpDir);
    await createMilestone("Active milestone", { projectId: project.projectId }, tmpDir);

    const result = await doneProject(project.projectId, tmpDir);
    expect(result.warnings).toBeDefined();
    expect(result.warnings![0]).toContain("1 linked milestone(s) are still active");
  });

  it("doneMilestone warns when linked work items are still active", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const milestone = await createMilestone("Milestone with active child", {}, tmpDir);
    await createWork("Active work item", { milestoneId: milestone.milestoneId }, tmpDir);

    const result = await doneMilestone(milestone.milestoneId, tmpDir);
    expect(result.warnings).toBeDefined();
    expect(result.warnings![0]).toContain("1 linked work item(s) are still active");
  });

  it("done functions produce no warnings when all children are complete", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const initiative = await createInitiative("Clean initiative", tmpDir);
    const project = await createProject("Clean project", { initiativeId: initiative.initiativeId }, tmpDir);
    const milestone = await createMilestone("Clean milestone", { projectId: project.projectId }, tmpDir);

    await doneMilestone(milestone.milestoneId, tmpDir);
    await doneProject(project.projectId, tmpDir);
    const result = await doneInitiative(initiative.initiativeId, tmpDir);

    expect(result.warnings).toBeUndefined();
  });

  it("stores target date on project and milestone records", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const project = await createProject("Dated project", { targetDate: "2025-12-31" }, tmpDir);
    const milestone = await createMilestone("Dated milestone", { targetDate: "2025-06-30" }, tmpDir);

    const pYaml = await fs.readFile(path.join(tmpDir, project.projectDir, "project.yaml"), "utf-8");
    const mYaml = await fs.readFile(path.join(tmpDir, milestone.milestoneDir, "milestone.yaml"), "utf-8");

    expect(pYaml).toContain("targetDate: 2025-12-31");
    expect(mYaml).toContain("targetDate: 2025-06-30");
  });

  it("list functions return all records with correct status", async () => {
    tmpDir = await mkTmpDir();
    await fs.writeFile(path.join(tmpDir, "package.json"), '{"name":"kernel-test"}');

    const i1 = await createInitiative("Initiative one", tmpDir);
    const i2 = await createInitiative("Initiative two", tmpDir);
    await doneInitiative(i1.initiativeId, tmpDir);

    const iList = await listInitiatives(tmpDir);
    expect(iList.initiatives).toHaveLength(2);
    expect(iList.initiatives.find((i) => i.id === i1.initiativeId)!.status).toBe("done");
    expect(iList.initiatives.find((i) => i.id === i2.initiativeId)!.status).toBe("active");

    const p1 = await createProject("Project one", {}, tmpDir);
    const p2 = await createProject("Project two", {}, tmpDir);
    await doneProject(p1.projectId, tmpDir);

    const pList = await listProjects(tmpDir);
    expect(pList.projects).toHaveLength(2);
    expect(pList.projects.find((p) => p.id === p1.projectId)!.status).toBe("done");
    expect(pList.projects.find((p) => p.id === p2.projectId)!.status).toBe("active");

    const m1 = await createMilestone("Milestone one", {}, tmpDir);
    const m2 = await createMilestone("Milestone two", {}, tmpDir);
    await doneMilestone(m1.milestoneId, tmpDir);

    const mList = await listMilestones(tmpDir);
    expect(mList.milestones).toHaveLength(2);
    expect(mList.milestones.find((m) => m.id === m1.milestoneId)!.status).toBe("done");
    expect(mList.milestones.find((m) => m.id === m2.milestoneId)!.status).toBe("active");
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
