import { test, expect, confirmAllMedications, waitForTimeline } from "./helpers";

test.describe("All Clear State", () => {
  test("shows all clear when every medication is confirmed", async ({ clerkPage }) => {
    test.setTimeout(90_000); // 6 medications with Convex mutations need generous timeout
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
    await waitForTimeline(clerkPage);

    await confirmAllMedications(clerkPage);

    // Should now show "All clear!"
    await expect(clerkPage.locator("text=All clear!")).toBeVisible({ timeout: 15_000 });

    // Progress should show "All done!"
    await expect(clerkPage.locator("text=All done!")).toBeVisible();
  });
});
