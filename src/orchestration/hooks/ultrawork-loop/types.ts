import type { UltraworkLoopConfig } from "../../../platform/config";

export interface UltraworkLoopState {
  active: boolean;
  iteration: number;
  max_iterations: number;
  completion_promise: string;
  started_at: string;
  prompt: string;
  session_id?: string;
  ultrawork?: boolean;
}

export interface UltraworkLoopOptions {
  config?: UltraworkLoopConfig;
  getTranscriptPath?: (sessionId: string) => string;
  apiTimeout?: number;
  checkSessionExists?: (sessionId: string) => Promise<boolean>;
}
