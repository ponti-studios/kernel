export type BooleanArg = "no" | "yes";

export interface InstallArgs {
  tui: boolean;
  openai?: BooleanArg;
  gemini?: BooleanArg;
  copilot?: BooleanArg;
  opencodeZen?: BooleanArg;
  zaiCodingPlan?: BooleanArg;
  kimiForCoding?: BooleanArg;
  skipAuth?: boolean;
  installPath?: string;
  localOnly?: boolean;
}

export interface InstallConfig {
  hasOpenAI: boolean;
  hasGemini: boolean;
  hasCopilot: boolean;
  hasOpencodeZen: boolean;
  hasZaiCodingPlan: boolean;
  hasKimiForCoding: boolean;
}

export interface ConfigMergeResult {
  success: boolean;
  configPath: string;
  error?: string;
}

export interface DetectedConfig {
  isInstalled: boolean;
  hasOpenAI: boolean;
  hasGemini: boolean;
  hasCopilot: boolean;
  hasOpencodeZen: boolean;
  hasZaiCodingPlan: boolean;
  hasKimiForCoding: boolean;
}
