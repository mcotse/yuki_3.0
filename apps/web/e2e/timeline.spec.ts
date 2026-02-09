import { test, expect, waitForTimeline, confirmAllMedications } from "./helpers";

test.describe("Timeline & Snooze (V3)", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("displays timeline list below hero card", async ({ clerkPage }) => {
    await expect(clerkPage.locator("text=Today's Schedule")).toBeVisible();
  });

  test("timeline shows all seeded medications", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    await expect(clerkPage.locator("text=Prednisolone").first()).toBeVisible({ timeout: 10_000 });
    await expect(clerkPage.locator("text=Galliprant").first()).toBeVisible({ timeout: 10_000 });
    await expect(clerkPage.locator("text=Fish Oil").first()).toBeVisible({ timeout: 10_000 });
  });

  test("timeline items show status pills", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // At least one "Due" or "Upcoming" pill should be visible
    const duePill = clerkPage.locator("text=Due");
    const upcomingPill = clerkPage.locator("text=Upcoming");

    const dueVisible = await duePill.first().isVisible().catch(() => false);
    const upcomingVisible = await upcomingPill.first().isVisible().catch(() => false);

    expect(dueVisible || upcomingVisible).toBe(true);
  });

  test("inline confirm from timeline updates progress", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // Capture initial progress
    const progressBefore = await clerkPage.locator("text=/\\d+ \\/ \\d+/").textContent();

    // Click the first timeline Confirm button (aria-label)
    await clerkPage.locator('button[aria-label="Confirm"]').first().click();

    // Wait for Convex mutation to propagate and progress to update
    await expect(async () => {
      const progressAfter = await clerkPage
        .locator("text=/\\d+ \\/ \\d+|All done!/")
        .textContent();
      expect(progressAfter).not.toEqual(progressBefore);
    }).toPass({ timeout: 10_000 });
  });

  test("snooze button shows duration options", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // Click the first Snooze button
    await clerkPage.locator('button[aria-label="Snooze"]').first().click();

    // Verify snooze duration options appear
    await expect(clerkPage.locator("text=15 min")).toBeVisible();
    await expect(clerkPage.locator("text=30 min")).toBeVisible();
    await expect(clerkPage.locator("text=1 hour")).toBeVisible();
  });

  test("snoozing an item changes its status to snoozed", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // Click Snooze on first item
    await clerkPage.locator('button[aria-label="Snooze"]').first().click();

    // Choose 15 min snooze
    await clerkPage.locator("text=15 min").click();

    // Wait for Convex mutation to propagate and check "Snoozed" pill appears
    await expect(clerkPage.locator("text=Snoozed")).toBeVisible({ timeout: 10_000 });
  });

  test("confirm all medications reaches all-clear state", async ({ clerkPage }) => {
    test.setTimeout(90_000); // 6 medications with Convex mutations
    await waitForTimeline(clerkPage);

    await confirmAllMedications(clerkPage);

    await expect(clerkPage.locator("text=All clear!")).toBeVisible({ timeout: 15_000 });
  });
});
