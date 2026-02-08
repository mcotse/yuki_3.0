import { test, expect } from "./helpers";

test.describe("All Clear State", () => {
  test("shows all clear when every medication is confirmed", async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });

    // Confirm all medications one by one
    // The hero card rotates to the next pending item after each confirm
    let hasMore = true;
    let maxIterations = 10; // Safety valve

    while (hasMore && maxIterations > 0) {
      const confirmButton = clerkPage.locator("button", { hasText: "Confirm" });
      const allClear = clerkPage.locator("text=All clear!");

      if (await allClear.isVisible()) {
        hasMore = false;
      } else if (await confirmButton.isVisible()) {
        await confirmButton.click();

        // Wait for undo toast to appear then dismiss
        await clerkPage.waitForTimeout(500);

        // Wait for either next hero card or all clear
        await clerkPage.waitForSelector(
          'button:has-text("Confirm"), text="All clear!"',
          { timeout: 10_000 }
        );
      } else {
        hasMore = false;
      }

      maxIterations--;
    }

    // Should now show "All clear!"
    await expect(clerkPage.locator("text=All clear!")).toBeVisible();

    // Progress should show "All done!"
    await expect(clerkPage.locator("text=All done!")).toBeVisible();
  });
});
