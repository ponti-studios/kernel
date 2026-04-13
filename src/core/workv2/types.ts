export interface WorkTask {
  id: string;
  title: string;
  done: boolean;
  completedAt?: string;
}

export interface WorkRecord {
  id: string;
  goal: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  tasks: WorkTask[];
}

export interface WorkProject {
  rootDir: string;
  kernelDir: string;
  workDir: string;
  archiveDir: string;
  dotKernelDir: string;
  pointersPath: string;
}
