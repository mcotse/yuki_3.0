import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test as base, expect, Page } from "@playwright/test";

// Extend Playwright test with Clerk auth helper
export const test = base.extend<{ clerkPage: Page }>({
  clerkPage: async ({ page }, use) => {
    await setupClerkTestingToken({ page });
    await use(page);
  },
});

export { expect };

/**
 * Seed the Convex database with demo data for testing.
 * Calls our API route which triggers seedDemoData + generateDailyInstances.
 */
export async function seedTestData(page: Page) {
  const response = await page.request.get("/api/test-seed");
  if (!response.ok()) {
    throw new Error(`Seed failed: ${response.status()} ${await response.text()}`);
  }
}

/**
 * Wait for the dashboard to finish loading (skeleton gone, content visible).
 */
export async function waitForDashboard(page: Page) {
  // Wait for either hero card or "All clear" to appear
  await page.waitForSelector(
    'text="Right Now", text="All clear!"',
    { timeout: 15_000 }
  );
}
