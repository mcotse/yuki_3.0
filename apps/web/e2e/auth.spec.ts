import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders Clerk sign-in", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Yuki");
    await expect(page.locator("text=Pet medication tracker")).toBeVisible();
  });

  test("accessing admin page without auth redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("accessing history page without auth redirects to login", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL(/\/login/);
  });

  test("accessing settings page without auth redirects to login", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});
