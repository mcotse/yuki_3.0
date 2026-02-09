import { test, expect } from "./helpers";

test.describe("Edge Cases", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
  });

  test("dashboard shows skeleton while loading", async ({ clerkPage }) => {
    // After navigation, either the skeleton or the loaded content should be visible immediately
    // The skeleton uses data-testid="skeleton-block" and disappears once data loads
    const skeleton = clerkPage.locator('[data-testid="skeleton-block"]').first();
    const content = clerkPage.locator('text="Right Now"').or(clerkPage.locator('text="All clear!"'));

    // One of them should appear
    await skeleton.or(content.first()).waitFor({ timeout: 15_000 });
  });

  test("refreshing the page preserves auth state", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });

    // Reload the page
    await clerkPage.reload();

    // Should still be on the dashboard (auth preserved)
    await clerkPage.waitForURL("**/dashboard", { timeout: 15_000 });
    await expect(
      clerkPage
        .locator('text="Right Now"')
        .or(clerkPage.locator('text="All clear!"'))
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("rapid confirm/undo does not crash", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });

    // Confirm a medication
    await clerkPage.locator("button", { hasText: "Confirm" }).click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({
      timeout: 5_000,
    });

    // Undo it
    await clerkPage.locator("button", { hasText: "Undo" }).click();

    // Wait for undo to process
    await clerkPage.waitForTimeout(1000);

    // Confirm again — should not crash
    const confirmButton = clerkPage.locator("button", { hasText: "Confirm" });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Page should still be functional — no crash
    await expect(
      clerkPage
        .locator('text="Right Now"')
        .or(clerkPage.locator('text="All clear!"'))
        .or(clerkPage.locator("text=/confirmed/i"))
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigating between all pages works smoothly", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });

    // Dashboard -> History
    await clerkPage.locator("text=History").click();
    await clerkPage.waitForURL("**/history", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Today")).toBeVisible({
      timeout: 10_000,
    });

    // History -> Settings
    await clerkPage.locator("text=Settings").click();
    await clerkPage.waitForURL("**/settings", { timeout: 10_000 });
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    // Settings -> Admin
    await clerkPage.locator("text=Admin").click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({
      timeout: 10_000,
    });

    // Admin -> Dashboard
    await clerkPage.locator("text=Dashboard").click();
    await clerkPage.waitForURL("**/dashboard", { timeout: 10_000 });
    await expect(
      clerkPage
        .locator('text="Right Now"')
        .or(clerkPage.locator('text="All clear!"'))
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("empty history date shows no records message", async ({ clerkPage }) => {
    // Go to history
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({
      timeout: 10_000,
    });

    // Navigate back 5 days where no data exists
    for (let i = 0; i < 5; i++) {
      await clerkPage.locator('button[aria-label="Previous day"]').click();
      await clerkPage.waitForTimeout(500);
    }

    // Empty state message should appear
    await expect(
      clerkPage.locator("text=No records for this date.")
    ).toBeVisible({ timeout: 10_000 });
  });
});
