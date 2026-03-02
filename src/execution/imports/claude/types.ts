import type { PluginComponentsResult } from "../../plugin-loader";

export interface ClaudeImportReport {
  pluginName: string;
  path: string;
  converted: {
    commands: number;
    skills: number;
    agents: number;
    mcps: number;
    hooks: number;
  };
  warnings: string[];
  errors: string[];
}

export interface ClaudeImportResult {
  components: PluginComponentsResult;
  report: ClaudeImportReport;
}

export interface ClaudeImportOptions {
  path: string;
  pluginName?: string;
  strict?: boolean;
  atomic?: boolean;
  dryRun?: boolean;
  namespacePrefix?: string;
  namespaceOverrides?: Record<string, string>;
  include?: string[];
  exclude?: string[];
}
