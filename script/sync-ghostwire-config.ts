import { detectCurrentConfig, writeOmoConfig } from "../src/cli/config-manager";
import type { InstallConfig } from "../src/cli/types";

function buildInstallConfigFromDetected(): InstallConfig {
  const detected = detectCurrentConfig();
  return {
    hasOpenAI: detected.hasOpenAI,
    hasGemini: detected.hasGemini,
    hasCopilot: detected.hasCopilot,
    hasOpencodeZen: detected.hasOpencodeZen,
    hasZaiCodingPlan: detected.hasZaiCodingPlan,
    hasKimiForCoding: detected.hasKimiForCoding,
  };
}

function main(): void {
  const config = buildInstallConfigFromDetected();
  const result = writeOmoConfig(config, { overwrite: true });

  if (!result.success) {
    console.error(`Failed to sync ghostwire config: ${result.error}`);
    process.exit(1);
  }

  console.log(`Synced ghostwire config: ${result.configPath}`);
}

main();
