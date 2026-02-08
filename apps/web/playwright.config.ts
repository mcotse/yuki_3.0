import { defineConfig, devices } from "@playwright/test";
import { clerkSetup } from "@clerk/testing/playwright";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Serial — tests share Convex state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker — shared Convex database
  reporter: process.env.CI ? "github" : "html",
  globalSetup: require.resolve("./e2e/global-setup.ts"),

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
