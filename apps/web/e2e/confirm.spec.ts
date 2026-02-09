import { test, expect, waitForTimeline } from "./helpers";

test.describe("Confirm Medication", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("confirm button updates progress and shows undo toast", async ({ clerkPage }) => {
    // Capture initial progress text
    const progressBefore = await clerkPage.locator("text=/\\d+ \\/ \\d+/").textContent();

    // Click Confirm (hero card button)
    await clerkPage.locator("button", { hasText: "Confirm" }).first().click();

    // Undo toast should appear with "confirmed" text
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({ timeout: 10_000 });

    // Undo button should be visible
    await expect(clerkPage.locator("button", { hasText: "Undo" })).toBeVisible();

    // Progress should update (done count increases)
    const progressAfter = await clerkPage.locator("text=/\\d+ \\/ \\d+|All done!/").textContent();
    expect(progressAfter).not.toEqual(progressBefore);
  });

  test("confirmed medication shows Done pill in timeline", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // Get the first medication name from the hero card
    const heroName = await clerkPage.locator("text=Right Now").locator("..").locator("h2").textContent();
    expect(heroName).toBeTruthy();

    // Confirm via hero card
    await clerkPage.locator("button", { hasText: "Confirm" }).first().click();
    await clerkPage.waitForTimeout(1000);

    // The timeline item for that medication should now show "Done" status pill
    const timelineItem = clerkPage.locator(`text=${heroName}`).first().locator("..");
    await expect(timelineItem.locator("text=Done")).toBeVisible({ timeout: 5_000 });
  });

  test("confirm disables the confirm button for that item", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    // Capture confirm button count before clicking
    const countBefore = await clerkPage.locator('button[aria-label="Confirm"]').count();

    // Click inline confirm on first timeline item
    const firstConfirmBtn = clerkPage.locator('button[aria-label="Confirm"]').first();
    await firstConfirmBtn.click();

    // Wait for Convex mutation to propagate — button count should decrease
    await expect(async () => {
      const countAfter = await clerkPage.locator('button[aria-label="Confirm"]').count();
      expect(countAfter).toBeLessThan(countBefore);
    }).toPass({ timeout: 10_000 });
  });
});
