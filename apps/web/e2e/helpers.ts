import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test as base, expect, Page } from "@playwright/test";

/**
 * Sign in through the Clerk UI.
 * Handles the email+password step and the device-verification OTP step
 * (uses the fixed code 424242 for +clerk_test emails).
 */
async function clerkSignIn(page: Page) {
  await page.goto("/login");

  // Fill email
  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.waitFor({ timeout: 10_000 });
  await emailInput.fill(process.env.E2E_CLERK_USER_EMAIL!);

  // Fill password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(process.env.E2E_CLERK_USER_PASSWORD!);

  // Click Continue (exact match to avoid hitting the Google button)
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // Handle device-verification OTP screen if it appears
  const otpInput = page.locator('input[autocomplete="one-time-code"]');
  const dashboard = page.locator('text="All clear!", text="Right Now"');

  const which = await Promise.race([
    otpInput.waitFor({ timeout: 10_000 }).then(() => "otp" as const),
    dashboard.first().waitFor({ timeout: 10_000 }).then(() => "done" as const),
  ]);

  if (which === "otp") {
    // Clerk uses a custom OTP input — click it then type digits
    await otpInput.click();
    await page.keyboard.type("424242", { delay: 50 });
    // Clerk auto-submits when all digits entered; if not, click Continue
    await page.waitForURL("**/dashboard", { timeout: 10_000 }).catch(() => {
      return page.getByRole("button", { name: "Continue", exact: true }).click();
    });
  }

  // Wait until we land on the dashboard
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

// Extend Playwright test with Clerk auth helper
export const test = base.extend<{ clerkPage: Page }>({
  clerkPage: async ({ page }, use) => {
    await setupClerkTestingToken({ page });
    await clerkSignIn(page);
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
