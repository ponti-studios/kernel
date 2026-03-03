/**
 * Import Diagnostics and Troubleshooting
 *
 * Provides detailed diagnostics for Claude plugin import issues.
 */

import type { ClaudeImportResult, ClaudeImportReport } from "./types";
import type { PluginComponentsResult } from "../../execution/plugin-loader/types";

export interface DiagnosticIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  component?: string;
  suggestion?: string;
  documentation?: string;
}

export interface ImportDiagnostics {
  success: boolean;
  issues: DiagnosticIssue[];
  summary: {
    totalComponents: number;
    successful: number;
    failed: number;
    warnings: number;
  };
  recommendations: string[];
}

/**
 * Diagnose import result and generate detailed report
 */
export function diagnoseImport(result: ClaudeImportResult): ImportDiagnostics {
  const issues: DiagnosticIssue[] = [];
  const recommendations: string[] = [];

  // Check for missing components
  const expectedComponents = getExpectedComponentCount(result);
  const actualComponents = getActualComponentCount(result.components);

  if (actualComponents === 0 && expectedComponents > 0) {
    issues.push({
      severity: "error",
      code: "IMPORT_NO_COMPONENTS",
      message: "No components were imported from the plugin",
      suggestion: "Check that the plugin path is correct and the plugin contains valid components",
    });
    recommendations.push("Verify the plugin is properly installed and the path is correct");
  }

  // Analyze report warnings
  for (const warning of result.report.warnings) {
    const issue = analyzeWarning(warning);
    if (issue) {
      issues.push(issue);
    }
  }

  // Analyze report errors
  for (const error of result.report.errors) {
    const issue = analyzeError(error);
    issues.push(issue);
  }

  // Check for namespace conflicts
  const conflicts = detectNamespaceConflicts(result.components);
  for (const conflict of conflicts) {
    issues.push({
      severity: "warning",
      code: "NAMESPACE_CONFLICT",
      message: `Namespace conflict detected: ${conflict}`,
      suggestion: "Use namespace_overrides in configuration to resolve conflicts",
    });
    recommendations.push("Configure namespace_overrides to rename conflicting components");
  }

  // Check for security issues
  const securityIssues = detectSecurityIssues(result);
  for (const issue of securityIssues) {
    issues.push(issue);
  }

  // Generate recommendations based on findings
  if (issues.some((i) => i.severity === "error")) {
    recommendations.push("Review and fix all errors before using imported components");
  }

  if (result.report.warnings.length > 5) {
    recommendations.push("Consider using strict mode to fail fast on warnings");
  }

  if (!result.components.mcpServers || Object.keys(result.components.mcpServers).length === 0) {
    recommendations.push("No MCP servers imported - verify .mcp.json exists if expected");
  }

  return {
    success: issues.filter((i) => i.severity === "error").length === 0,
    issues,
    summary: {
      totalComponents: actualComponents,
      successful: actualComponents - issues.filter((i) => i.severity === "error").length,
      failed: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
    },
    recommendations,
  };
}

/**
 * Analyze a warning message and create a diagnostic issue
 */
function analyzeWarning(warning: string): DiagnosticIssue | null {
  // Path traversal warning
  if (warning.includes("path") && warning.includes("traversal")) {
    return {
      severity: "error",
      code: "SECURITY_PATH_TRAVERSAL",
      message: warning,
      suggestion: "Use absolute paths or ensure paths don't contain '..' sequences",
      documentation: "https://docs.opencode.ai/security/path-validation",
    };
  }

  // Missing manifest warning
  if (warning.includes("manifest") || warning.includes("plugin.json")) {
    return {
      severity: "info",
      code: "MISSING_MANIFEST",
      message: warning,
      suggestion: "Create a .claude-plugin/plugin.json file for better plugin metadata",
    };
  }

  // Namespace conflict warning
  if (warning.includes("conflict") || warning.includes("duplicate")) {
    return {
      severity: "warning",
      code: "NAMESPACE_COLLISION",
      message: warning,
      suggestion: "Use namespace_overrides configuration to rename components",
    };
  }

  // DRY RUN warning
  if (warning.includes("DRY RUN")) {
    return {
      severity: "info",
      code: "DRY_RUN_MODE",
      message: "Import ran in dry-run mode - no components were actually imported",
      suggestion: "Set dryRun: false to perform actual import",
    };
  }

  // Filter warning
  if (warning.includes("skipped") || warning.includes("filter")) {
    return {
      severity: "info",
      code: "COMPONENT_FILTERED",
      message: warning,
      suggestion: "Review include/exclude filters if components are missing",
    };
  }

  // Generic warning
  return {
    severity: "warning",
    code: "GENERIC_WARNING",
    message: warning,
  };
}

/**
 * Analyze an error message and create a diagnostic issue
 */
function analyzeError(error: string): DiagnosticIssue {
  // Security error
  if (error.includes("Security") || error.includes("security")) {
    return {
      severity: "error",
      code: "SECURITY_VIOLATION",
      message: error,
      suggestion: "Check path permissions and ensure plugin is from a trusted source",
      documentation: "https://docs.opencode.ai/security",
    };
  }

  // Strict mode error
  if (error.includes("Strict mode")) {
    return {
      severity: "error",
      code: "STRICT_MODE_FAILURE",
      message: error,
      suggestion: "Fix warnings or disable strict mode if partial import is acceptable",
    };
  }

  // Atomic mode error
  if (error.includes("atomic")) {
    return {
      severity: "error",
      code: "ATOMIC_MODE_FAILURE",
      message: error,
      suggestion: "All components must succeed in atomic mode - check individual errors",
    };
  }

  // Parse error
  if (error.includes("parse") || error.includes("JSON")) {
    return {
      severity: "error",
      code: "PARSE_ERROR",
      message: error,
      suggestion: "Check plugin.json and component files for valid JSON/Markdown",
    };
  }

  // Generic error
  return {
    severity: "error",
    code: "IMPORT_ERROR",
    message: error,
  };
}

/**
 * Detect namespace conflicts in imported components
 */
function detectNamespaceConflicts(components: PluginComponentsResult): string[] {
  const conflicts: string[] = [];
  const seen = new Set<string>();

  const allNames = [
    ...Object.keys(components.commands),
    ...Object.keys(components.skills),
    ...Object.keys(components.agents),
  ];

  for (const name of allNames) {
    if (seen.has(name)) {
      conflicts.push(name);
    }
    seen.add(name);
  }

  return conflicts;
}

/**
 * Detect security issues in import result
 */
function detectSecurityIssues(result: ClaudeImportResult): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];

  // Check for unrestricted MCP servers
  for (const [name, mcp] of Object.entries(result.components.mcpServers ?? {})) {
    const mcpConfig = mcp as { command?: string; url?: string };

    if (mcpConfig.command?.includes("sudo") || mcpConfig.command?.includes("su")) {
      issues.push({
        severity: "error",
        code: "SECURITY_PRIVILEGED_MCP",
        message: `MCP server "${name}" uses privileged command: ${mcpConfig.command}`,
        component: name,
        suggestion: "Remove sudo/su from MCP commands or use a non-privileged alternative",
      });
    }

    if (mcpConfig.url?.startsWith("http://")) {
      issues.push({
        severity: "warning",
        code: "SECURITY_INSECURE_MCP_URL",
        message: `MCP server "${name}" uses insecure HTTP connection`,
        component: name,
        suggestion: "Use HTTPS instead of HTTP for MCP server connections",
      });
    }
  }

  return issues;
}

/**
 * Get expected component count from report
 */
function getExpectedComponentCount(result: ClaudeImportResult): number {
  // This would typically come from the plugin manifest
  // For now, we estimate based on what was found
  return (
    result.report.converted.commands +
    result.report.converted.skills +
    result.report.converted.agents +
    result.report.converted.mcps
  );
}

/**
 * Get actual imported component count
 */
function getActualComponentCount(components: PluginComponentsResult): number {
  return (
    Object.keys(components.commands).length +
    Object.keys(components.skills).length +
    Object.keys(components.agents).length +
    Object.keys(components.mcpServers).length
  );
}

/**
 * Generate troubleshooting guide for common issues
 */
export function generateTroubleshootingGuide(diagnostics: ImportDiagnostics): string {
  const lines = [
    "=".repeat(70),
    "Import Troubleshooting Guide",
    "=".repeat(70),
    "",
    `Import Status: ${diagnostics.success ? "✓ SUCCESS" : "✗ FAILED"}`,
    "",
    "Summary:",
    `  - Total Components: ${diagnostics.summary.totalComponents}`,
    `  - Successful: ${diagnostics.summary.successful}`,
    `  - Failed: ${diagnostics.summary.failed}`,
    `  - Warnings: ${diagnostics.summary.warnings}`,
    "",
  ];

  if (diagnostics.issues.length > 0) {
    lines.push("Issues Found:", "-".repeat(70));

    for (const issue of diagnostics.issues) {
      const icon = issue.severity === "error" ? "✗" : issue.severity === "warning" ? "⚠" : "ℹ";
      lines.push(`${icon} [${issue.code}] ${issue.message}`);

      if (issue.component) {
        lines.push(`   Component: ${issue.component}`);
      }

      if (issue.suggestion) {
        lines.push(`   Suggestion: ${issue.suggestion}`);
      }

      if (issue.documentation) {
        lines.push(`   Documentation: ${issue.documentation}`);
      }

      lines.push("");
    }
  }

  if (diagnostics.recommendations.length > 0) {
    lines.push("Recommendations:", "-".repeat(70));

    for (let i = 0; i < diagnostics.recommendations.length; i++) {
      lines.push(`${i + 1}. ${diagnostics.recommendations[i]}`);
    }

    lines.push("");
  }

  lines.push("=".repeat(70));

  return lines.join("\n");
}

/**
 * Quick health check for import result
 */
export function quickHealthCheck(result: ClaudeImportResult): {
  healthy: boolean;
  status: "green" | "yellow" | "red";
  message: string;
} {
  const errorCount = result.report.errors.length;
  const warningCount = result.report.warnings.length;
  const hasComponents = getActualComponentCount(result.components) > 0;

  if (errorCount === 0 && warningCount === 0 && hasComponents) {
    return {
      healthy: true,
      status: "green",
      message: "Import completed successfully with no issues",
    };
  }

  if (errorCount === 0 && hasComponents) {
    return {
      healthy: true,
      status: "yellow",
      message: `Import completed with ${warningCount} warning(s)`,
    };
  }

  return {
    healthy: false,
    status: "red",
    message: `Import failed with ${errorCount} error(s)`,
  };
}
