import type { CheckDefinition } from "../types";
import { getOpenCodeCheckDefinition } from "./opencode";
import { getPluginCheckDefinition } from "./plugin";
import { getConfigCheckDefinition } from "./config";
import { getAuthCheckDefinitions } from "./auth";
import { getDependencyCheckDefinitions } from "./dependencies";
import { getGhCliCheckDefinition } from "./gh";
import { getLspCheckDefinition } from "./lsp";
import { getMcpCheckDefinitions } from "./mcp";
import { getMcpOAuthCheckDefinition } from "./mcp-oauth";
import { getVersionCheckDefinition } from "./version";

export { getOpenCodeCheckDefinition } from "./opencode";
export { getPluginCheckDefinition } from "./plugin";
export { getConfigCheckDefinition, validateConfig } from "./config";
export { getAuthProviderInfo, checkAuthProvider } from "./auth";
export { getDependencyCheckDefinitions } from "./dependencies";
export { getGhCliCheckDefinition } from "./gh";
export { getLspCheckDefinition } from "./lsp";
export { getMcpCheckDefinitions, checkMcpServers, checkUserMcpServers } from "./mcp";
export { getMcpOAuthCheckDefinition } from "./mcp-oauth";
export { getVersionCheckDefinition } from "./version";

export function getAllCheckDefinitions(): CheckDefinition[] {
  return [
    getOpenCodeCheckDefinition(),
    getPluginCheckDefinition(),
    getConfigCheckDefinition(),
    ...getAuthCheckDefinitions(),
    ...getDependencyCheckDefinitions(),
    getGhCliCheckDefinition(),
    getLspCheckDefinition(),
    ...getMcpCheckDefinitions(),
    getMcpOAuthCheckDefinition(),
    getVersionCheckDefinition(),
  ];
}
