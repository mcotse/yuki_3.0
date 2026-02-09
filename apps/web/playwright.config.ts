import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  reporter: process.env.CI ? "github" : "html",
  globalSetup: require.resolve("./e2e/global-setup.ts"),

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // Parallel groups — each project runs its own worker(s)
  projects: [
    // Group A: Read-only tests (no mutations) — can fully parallelize
    {
      name: "readonly",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "smoke.spec.ts",
        "auth.spec.ts",
        "dashboard.spec.ts",
        "navigation.spec.ts",
        "settings.spec.ts",
        "presence.spec.ts",
      ],
    },
    // Group B: Confirm/Undo flows — depends on readonly to reduce parallel load
    {
      name: "confirm-undo",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["confirm.spec.ts", "undo.spec.ts", "all-clear.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group C: Timeline/Snooze
    {
      name: "timeline",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["timeline.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group D: Observations
    {
      name: "observations",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["observations.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group E: History
    {
      name: "history",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["history.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group F: Admin (serial within group — mutations change shared items)
    {
      name: "admin",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["admin.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group G: Cross-feature integration
    {
      name: "integration",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["integration.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group H: Accessibility
    {
      name: "a11y",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["a11y.spec.ts"],
      dependencies: ["readonly"],
    },
    // Group I: Edge cases
    {
      name: "edge-cases",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["edge-cases.spec.ts"],
      dependencies: ["readonly"],
    },
    // Mobile viewport — runs mobile-specific tests on Pixel 7
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: ["mobile.spec.ts"],
      dependencies: ["readonly"],
    },
  ],

  // Allow parallel workers across projects
  workers: 4,

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
