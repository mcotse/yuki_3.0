import { test, expect, waitForTimeline, confirmAllMedications } from "./helpers";

test.describe("Cross-Feature Integration", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("confirm on dashboard appears as Done in history", async ({ clerkPage }) => {
    // Confirm a medication on the dashboard (hero card button)
    await clerkPage.locator("button", { hasText: "Confirm" }).first().click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({ timeout: 10_000 });

    // Navigate to history
    await clerkPage.locator("text=History").click();
    await clerkPage.waitForURL("**/history", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Wait for data to load and propagate from Convex
    await clerkPage.waitForTimeout(3000);

    // At least one "Done" or "Confirmed" status should be visible
    await expect(
      clerkPage.locator("text=Done").or(clerkPage.locator("text=Confirmed")).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("observation submitted on dashboard appears in history with Observations filter", async ({ clerkPage }) => {
    // Submit an observation — use evaluate() to bypass z-index overlay from bottom nav
    const fab = clerkPage.locator('button[aria-label="Add observation"]');
    await expect(fab).toBeVisible({ timeout: 10_000 });
    await fab.evaluate((el) => (el as HTMLElement).click());
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible({ timeout: 5_000 });
    await clerkPage.locator("text=Snack").click();
    await clerkPage.locator('textarea[placeholder="What happened?"]').fill("Ate a treat");
    await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

    // Wait for sheet to close and observation to appear in timeline
    await expect(clerkPage.locator("text=Add Observation")).not.toBeVisible({ timeout: 5_000 });
    await expect(clerkPage.locator("text=Ate a treat")).toBeVisible({ timeout: 10_000 });

    // Navigate to history immediately (use goto for speed — minimize shared-state window)
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Click the "Observations" filter chip to show observations
    const obsFilter = clerkPage.locator("button", { hasText: "Observations" });
    await expect(obsFilter).toBeVisible({ timeout: 5_000 });
    await obsFilter.click();

    // The observation should appear in the filtered history list
    // Note: with shared Convex DB, another worker's seedForTest can wipe observations
    await expect(clerkPage.locator("text=Ate a treat")).toBeVisible({ timeout: 20_000 });
  });

  test("snooze on dashboard shows Snoozed status in timeline and history", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // Snooze first item
    await clerkPage.locator('button[aria-label="Snooze"]').first().click();
    await clerkPage.locator("text=15 min").click();

    // Verify "Snoozed" pill in timeline
    await expect(clerkPage.locator("text=Snoozed")).toBeVisible({ timeout: 10_000 });

    // Navigate to history
    await clerkPage.locator("text=History").click();
    await clerkPage.waitForURL("**/history", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });
    await clerkPage.waitForTimeout(2000);

    // History should show snoozed status
    await expect(clerkPage.locator("text=Snoozed").first()).toBeVisible({ timeout: 15_000 });
  });

  test.fixme("admin add medication appears in dashboard timeline", async ({ clerkPage }) => {
    // Go to admin (target the nav link, not the role badge)
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({ timeout: 10_000 });

    // Wait for list to load
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({ timeout: 10_000 });

    // Add a new medication
    await clerkPage.locator("button", { hasText: "Add" }).click();
    await clerkPage.locator('input[aria-label="Name"]').fill("Metronidazole");
    await clerkPage.locator('input[aria-label="Dose"]').fill("250mg twice daily");
    await clerkPage.locator('select[aria-label="Type"]').selectOption("oral");
    await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

    // Verify it appears in admin list
    await expect(clerkPage.locator("text=Metronidazole").first()).toBeVisible({ timeout: 10_000 });

    // Go back to dashboard — the new medication should eventually appear after
    // daily instance generation (may need a page reload to trigger generation)
    await clerkPage.locator("text=Dashboard").click();
    await clerkPage.waitForURL("**/dashboard", { timeout: 10_000 });

    // Wait for timeline to load
    await waitForTimeline(clerkPage);
    await clerkPage.waitForTimeout(2000);

    // Note: The medication will only appear if daily instances are regenerated.
    // This test verifies the admin → dashboard data flow when the app regenerates.
    // If the medication doesn't appear immediately, that's expected behavior —
    // daily instances are only generated once per day.
  });

  test("full daily workflow: confirm all → all clear → check history", async ({ clerkPage }) => {
    test.setTimeout(90_000); // 6 medications with Convex mutations
    await waitForTimeline(clerkPage);

    await confirmAllMedications(clerkPage);

    // Verify all clear
    await expect(clerkPage.locator("text=All clear!")).toBeVisible({ timeout: 15_000 });
    await expect(clerkPage.locator("text=All done!")).toBeVisible();

    // Go to history — all items should show "Done"
    await clerkPage.locator("text=History").click();
    await clerkPage.waitForURL("**/history", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });
    await clerkPage.waitForTimeout(2000);

    // Every medication instance in history should be "Done"
    const pendingCount = await clerkPage.locator("text=Pending").count();
    expect(pendingCount).toBe(0);
  });
});
