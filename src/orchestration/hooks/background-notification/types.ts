import type { BackgroundTask } from "../../../execution/background-agent/types";

export interface BackgroundNotificationHookConfig {
  formatNotification?: (tasks: BackgroundTask[]) => string;
}
