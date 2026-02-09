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
  const dashboard = page.locator('text="All clear!"').or(page.locator('text="Right Now"'));

  const otpPromise = otpInput.waitFor({ timeout: 10_000 }).then(() => "otp" as const);
  const dashPromise = dashboard.first().waitFor({ timeout: 10_000 }).then(() => "done" as const);
  // Suppress unhandled rejection from the losing promise
  otpPromise.catch(() => {});
  dashPromise.catch(() => {});
  const which = await Promise.race([otpPromise, dashPromise]);

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
  await page.locator('text="Right Now"').or(page.locator('text="All clear!"')).first().waitFor({ timeout: 15_000 });
}

/**
 * Wait for timeline items to appear on the dashboard.
 */
export async function waitForTimeline(page: Page) {
  await page.locator("text=Today's Schedule").waitFor({ timeout: 15_000 });
}

/**
 * Confirm all medications one by one until all-clear state.
 * Uses aria-label="Confirm" on timeline items and the hero card's "Confirm" button text.
 */
export async function confirmAllMedications(page: Page) {
  // With shared Convex DB, another worker's seedForTest can reset data mid-loop.
  // Use shorter per-iteration timeout so the loop recovers faster from resets.
  let maxIterations = 20;
  while (maxIterations > 0) {
    const allClear = page.locator("text=All clear!");
    if (await allClear.isVisible()) break;

    // Track "Done" count before clicking to detect state change
    const doneBefore = await page.locator("text=Done").count();

    // Try timeline inline Confirm buttons first (aria-label="Confirm")
    const timelineConfirm = page.locator('button[aria-label="Confirm"]').first();
    if (await timelineConfirm.isVisible()) {
      await timelineConfirm.click();
    } else {
      // Fall back to hero card Confirm button (identified by text)
      const heroConfirm = page.locator("button", { hasText: "Confirm" }).first();
      if (await heroConfirm.isVisible()) {
        await heroConfirm.click();
      } else {
        break;
      }
    }

    // Wait for mutation: "Done" count increases or "All clear!" appears.
    // Short timeout so the loop can retry quickly if shared state resets data.
    try {
      await expect(async () => {
        const allClearNow = await page.locator("text=All clear!").isVisible();
        if (allClearNow) return;
        const doneAfter = await page.locator("text=Done").count();
        expect(doneAfter).toBeGreaterThan(doneBefore);
      }).toPass({ timeout: 10_000 });
    } catch {
      // Mutation may have been reset by another worker's seedForTest — continue loop
    }

    maxIterations--;
  }
}
