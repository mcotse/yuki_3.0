import { test, expect } from "./helpers";

test.describe("Undo Confirmation", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("undo reverts the confirmation", async ({ clerkPage }) => {
    // Get initial progress
    const progressBefore = await clerkPage.locator("text=/\\d+ \\/ \\d+/").textContent();

    // Confirm
    await clerkPage.locator("button", { hasText: "Confirm" }).click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible();

    // Undo
    await clerkPage.locator("button", { hasText: "Undo" }).click();

    // Toast should disappear
    await expect(clerkPage.locator("text=/confirmed/i")).not.toBeVisible({ timeout: 3_000 });

    // Progress should return to original
    const progressAfterUndo = await clerkPage.locator("text=/\\d+ \\/ \\d+/").textContent();
    expect(progressAfterUndo).toEqual(progressBefore);

    // Hero card should show "Right Now" again (medication is back to pending)
    await expect(clerkPage.locator("text=Right Now")).toBeVisible();
  });

  test("undo toast auto-dismisses after 5 seconds", async ({ clerkPage }) => {
    await clerkPage.locator("button", { hasText: "Confirm" }).click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible();

    // Wait for auto-dismiss (5s + buffer)
    await clerkPage.waitForTimeout(6_000);

    // Toast should be gone
    await expect(clerkPage.locator("button", { hasText: "Undo" })).not.toBeVisible();
  });
});
