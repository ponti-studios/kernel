export interface KernelProject {
  rootDir: string;
  kernelDir: string;
  dotKernelDir: string;
  changesDir: string;
  archiveDir: string;
  specsDir: string;
  templatesDir: string;
  memoryDir: string;
  hooksDir: string;
  featureFilePath: string;
}

export interface WorkflowArtifactStatus {
  id: string;
  title: string;
  outputPath: string;
  dependencies: string[];
  status: "blocked" | "ready" | "done";
}

export interface ChangeStatus {
  change: string;
  schemaName: string;
  applyRequires: string[];
  artifacts: WorkflowArtifactStatus[];
}

export interface ArtifactInstruction {
  artifactId: string;
  change: string;
  outputPath: string;
  dependencies: string[];
  context: string;
  rules: string[];
  template: string;
  instruction: string;
}

export interface ApplyInstructionTask {
  text: string;
  done: boolean;
}

export interface ApplyInstructionPayload {
  change: string;
  schemaName: string;
  state: "blocked" | "in_progress" | "all_done";
  contextFiles: string[];
  progress: {
    total: number;
    complete: number;
    remaining: number;
  };
  tasks: ApplyInstructionTask[];
  instruction: string;
}

export interface FeaturePointer {
  featureDirectory: string;
}

export interface FeatureSummary {
  featureDirectory: string;
  specPath: string;
}

export interface AnalyzeSummary {
  featureDirectory: string;
  findings: string[];
  readyForImplementation: boolean;
}

export interface GitCommandResult {
  stdout: string;
  stderr: string;
}
