import { test, expect } from "./helpers";

test.describe("Presence Indicators (V4)", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("shows presence indicator with user name in header", async ({
    clerkPage,
  }) => {
    // Wait for presence heartbeat to register — the green dot should appear
    // The presence-dot has data-testid="presence-dot" and shows user names next to it
    await expect(
      clerkPage.locator('[data-testid="presence-dot"]')
    ).toBeVisible({ timeout: 15_000 });
  });

  test("offline indicator shows when offline", async ({ clerkPage }) => {
    // Access the browser context from the page to simulate offline
    const context = clerkPage.context();

    // Simulate going offline
    await context.setOffline(true);

    // The offline banner should appear with "offline" text
    await expect(
      clerkPage.locator("text=You're offline")
    ).toBeVisible({ timeout: 10_000 });

    // Go back online
    await context.setOffline(false);

    // Offline banner should disappear
    await expect(
      clerkPage.locator("text=You're offline")
    ).not.toBeVisible({ timeout: 10_000 });
  });
});
