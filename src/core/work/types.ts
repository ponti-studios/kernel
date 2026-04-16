export interface WorkTask {
  id: string;
  title: string;
  done: boolean;
  completedAt?: string;
}

export interface InitiativeRecord {
  id: string;
  goal: string;
  status: "active" | "done" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  id: string;
  goal: string;
  status: "active" | "done" | "archived";
  initiativeId?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneRecord {
  id: string;
  goal: string;
  status: "active" | "done" | "archived";
  projectId?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkRecord {
  id: string;
  goal: string;
  status: "active" | "archived";
  initiativeId?: string;
  projectId?: string;
  milestoneId?: string;
  createdAt: string;
  updatedAt: string;
  tasks: WorkTask[];
}

export interface WorkProject {
  rootDir: string;
  kernelDir: string;
  initiativeDir: string;
  projectsDir: string;
  milestonesDir: string;
  workDir: string;
  archiveDir: string;
  dotKernelDir: string;
  pointersPath: string;
}
