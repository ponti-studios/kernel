import { defineConfig, devices } from "@playwright/test";

/**
 * Run against a real server on a port the live one does not use, so a running instance never blocks the
 * suite. `reuseExistingServer` keeps local iteration fast; CI always starts clean.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: "4173" },
  },
});
