import { test, expect } from "./helpers";

test.describe("Settings Page (V9)", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("navigates to settings page", async ({ clerkPage }) => {
    // Click Settings in bottom tabs
    await clerkPage.locator("text=Settings").click();
    await clerkPage.waitForURL("**/settings", { timeout: 10_000 });

    // Settings heading should be visible
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows account information", async ({ clerkPage }) => {
    await clerkPage.goto("/settings");

    // Wait for page to load
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    // Account section heading
    await expect(clerkPage.locator("text=Account")).toBeVisible();

    // Role badge should be visible (role text like "admin" or "caretaker")
    await expect(clerkPage.locator("text=Role:")).toBeVisible();
  });

  test("shows notification toggle", async ({ clerkPage }) => {
    await clerkPage.goto("/settings");
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    // Notifications section should be visible
    await expect(clerkPage.getByText("Notifications", { exact: true })).toBeVisible();
  });

  test("shows app info", async ({ clerkPage }) => {
    await clerkPage.goto("/settings");
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    // App section with "Yuki 3.0" text
    await expect(clerkPage.locator("text=Yuki 3.0")).toBeVisible();
  });

  test("shows sign out button", async ({ clerkPage }) => {
    await clerkPage.goto("/settings");
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    // Sign Out button
    await expect(
      clerkPage.locator("button", { hasText: "Sign Out" })
    ).toBeVisible();
  });

  test("sign out button redirects to login page", async ({ clerkPage }) => {
    await clerkPage.goto("/settings");
    await expect(clerkPage.locator("h1", { hasText: "Settings" })).toBeVisible({ timeout: 10_000 });

    // Click sign out
    await clerkPage.locator("button", { hasText: "Sign Out" }).click();

    // Should redirect to login page
    await clerkPage.waitForURL(/\/login/, { timeout: 15_000 });
  });
});
