import { test, expect, waitForTimeline } from "./helpers";

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

    // Confirm a medication (hero card button)
    await clerkPage.locator("button", { hasText: "Confirm" }).first().click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({
      timeout: 10_000,
    });

    // Undo it
    await clerkPage.locator("button", { hasText: "Undo" }).click();

    // Wait for undo to process
    await clerkPage.waitForTimeout(1000);

    // Confirm again — should not crash
    const confirmButton = clerkPage.locator("button", { hasText: "Confirm" }).first();
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

    // Settings -> Admin (target the nav link, not the role badge)
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications").first()).toBeVisible({
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

  test("cannot confirm an already-confirmed medication", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
    await waitForTimeline(clerkPage);

    // Confirm via timeline inline button
    const firstConfirm = clerkPage.locator('button[aria-label="Confirm"]').first();
    await firstConfirm.click();

    // Wait for Convex mutation to propagate — "Done" pill should appear
    await expect(clerkPage.locator("text=Done").first()).toBeVisible({ timeout: 10_000 });

    const doneItems = clerkPage.locator("text=Done");
    const doneCount = await doneItems.count();
    expect(doneCount).toBeGreaterThan(0);

    // Each "Done" item should NOT have a Confirm button
    for (let i = 0; i < doneCount; i++) {
      const doneItem = doneItems.nth(i).locator("..").locator("..");
      const confirmBtn = doneItem.locator('button[aria-label="Confirm"]');
      await expect(confirmBtn).not.toBeVisible();
    }
  });

  test("cannot snooze an already-confirmed medication", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
    await waitForTimeline(clerkPage);

    // Confirm a medication first
    await clerkPage.locator('button[aria-label="Confirm"]').first().click();

    // Wait for Convex mutation to propagate
    await expect(clerkPage.locator("text=Done").first()).toBeVisible({ timeout: 10_000 });

    // The confirmed item should not show a Snooze button
    const doneItems = clerkPage.locator("text=Done");
    const doneCount = await doneItems.count();
    expect(doneCount).toBeGreaterThan(0);

    for (let i = 0; i < doneCount; i++) {
      const doneItem = doneItems.nth(i).locator("..").locator("..");
      const snoozeBtn = doneItem.locator('button[aria-label="Snooze"]');
      await expect(snoozeBtn).not.toBeVisible();
    }
  });

  test("snooze shows Snoozed status pill", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
    await waitForTimeline(clerkPage);

    // Snooze the first item
    await clerkPage.locator('button[aria-label="Snooze"]').first().click();
    await clerkPage.locator("text=15 min").click();
    await expect(clerkPage.locator("text=Snoozed")).toBeVisible({ timeout: 10_000 });

    // The snoozed item should show "Snoozed" pill
    const snoozedPills = clerkPage.locator("text=Snoozed");
    expect(await snoozedPills.count()).toBeGreaterThan(0);
  });
});
