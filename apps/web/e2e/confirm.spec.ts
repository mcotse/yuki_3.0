import { test, expect } from "./helpers";

test.describe("Confirm Medication", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("confirm button updates progress and shows undo toast", async ({ clerkPage }) => {
    // Capture initial progress text
    const progressBefore = await clerkPage.locator("text=/\\d+ \\/ \\d+/").textContent();

    // Click Confirm
    await clerkPage.locator("button", { hasText: "Confirm" }).click();

    // Undo toast should appear with "confirmed" text
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({ timeout: 5_000 });

    // Undo button should be visible
    await expect(clerkPage.locator("button", { hasText: "Undo" })).toBeVisible();

    // Progress should update (done count increases)
    const progressAfter = await clerkPage.locator("text=/\\d+ \\/ \\d+|All done!/").textContent();
    expect(progressAfter).not.toEqual(progressBefore);
  });
});
