import { test, expect } from "./helpers";

test.describe("History Page (V6)", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("navigates to history page", async ({ clerkPage }) => {
    // Click History in bottom tabs
    await clerkPage.locator("text=History").click();
    await clerkPage.waitForURL("**/history", { timeout: 10_000 });

    // History page should load
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });
  });

  test("shows date picker with today's date", async ({ clerkPage }) => {
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Navigation arrows should be present
    await expect(
      clerkPage.locator('button[aria-label="Previous day"]')
    ).toBeVisible();
    await expect(
      clerkPage.locator('button[aria-label="Next day"]')
    ).toBeVisible();
  });

  test("shows filter chips", async ({ clerkPage }) => {
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    await expect(clerkPage.locator("button", { hasText: "All" })).toBeVisible();
    await expect(clerkPage.locator("button", { hasText: "Eye Drops" })).toBeVisible();
    await expect(clerkPage.locator("button", { hasText: "Oral" })).toBeVisible();
  });

  test("shows medication instances for today", async ({ clerkPage }) => {
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Wait for data to load — at least one seeded medication should show
    await expect(clerkPage.locator("text=Prednisolone").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("filter chips filter the list", async ({ clerkPage }) => {
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Wait for initial data
    await expect(clerkPage.locator("text=Prednisolone").first()).toBeVisible({
      timeout: 10_000,
    });

    // Click "Oral" filter chip
    await clerkPage.locator("button", { hasText: "Oral" }).click();

    // Galliprant (oral med) should be visible
    await expect(clerkPage.locator("text=Galliprant").first()).toBeVisible({
      timeout: 10_000,
    });

    // Prednisolone (eye drop) should NOT be visible after filtering to Oral
    await expect(clerkPage.locator("text=Prednisolone")).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test("date navigation works", async ({ clerkPage }) => {
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Navigate to previous day
    await clerkPage.locator('button[aria-label="Previous day"]').click();

    // "Today" label should no longer be visible
    await expect(clerkPage.locator("text=Today")).not.toBeVisible({
      timeout: 5_000,
    });

    // Navigate back to today (next day)
    await clerkPage.locator('button[aria-label="Next day"]').click();

    // "Today" should reappear
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 5_000 });
  });

  test("expanding an item shows audit trail", async ({ clerkPage }) => {
    // First confirm a medication on the dashboard
    await clerkPage.locator("button", { hasText: "Confirm" }).click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({
      timeout: 5_000,
    });

    // Navigate to history page
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    // Wait for items to load
    await clerkPage.waitForTimeout(2000);

    // Find an item with "Done" status (confirmed) and click to expand
    const doneItem = clerkPage.locator("text=Done").first();
    await expect(doneItem).toBeVisible({ timeout: 10_000 });
    await doneItem.click();

    // Audit trail should show "Confirmed" action
    await expect(clerkPage.locator("text=Confirmed")).toBeVisible({
      timeout: 5_000,
    });
  });
});
