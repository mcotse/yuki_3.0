import { test, expect } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ clerkPage }) => {
    // Seed data and navigate
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
  });

  test("shows hero card with medication name", async ({ clerkPage }) => {
    // Wait for loading to finish
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });

    // Should show one of our seeded medications
    const heroCard = clerkPage.locator("text=Right Now").locator("..");
    await expect(heroCard).toBeVisible();

    // Should have a Confirm button
    await expect(clerkPage.locator("button", { hasText: "Confirm" })).toBeVisible();
  });

  test("shows progress ring", async ({ clerkPage }) => {
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });

    // Progress ring should show "0 / N" initially
    await expect(clerkPage.locator("text=/\\d+ \\/ \\d+/")).toBeVisible();
  });

  test("shows bottom navigation tabs", async ({ clerkPage }) => {
    await expect(clerkPage.locator("text=Dashboard")).toBeVisible();
    await expect(clerkPage.locator("text=History")).toBeVisible();
    await expect(clerkPage.locator("text=Settings")).toBeVisible();
  });
});
