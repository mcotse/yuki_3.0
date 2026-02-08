import { test, expect } from "./helpers";

test.describe("Navigation", () => {
  test("bottom tabs navigate between pages", async ({ clerkPage }) => {
    await clerkPage.goto("/dashboard");

    // Click History tab
    await clerkPage.locator("nav a", { hasText: "History" }).click();
    await expect(clerkPage).toHaveURL(/\/history/);

    // Click Settings tab
    await clerkPage.locator("nav a", { hasText: "Settings" }).click();
    await expect(clerkPage).toHaveURL(/\/settings/);

    // Click Dashboard tab to go back
    await clerkPage.locator("nav a", { hasText: "Dashboard" }).click();
    await expect(clerkPage).toHaveURL(/\/dashboard/);
  });

  test("active tab is highlighted", async ({ clerkPage }) => {
    await clerkPage.goto("/dashboard");

    // Dashboard tab should have the active class (text-primary)
    const dashboardTab = clerkPage.locator("nav a", { hasText: "Dashboard" });
    await expect(dashboardTab).toHaveClass(/text-primary/);

    // History tab should NOT have the active class
    const historyTab = clerkPage.locator("nav a", { hasText: "History" });
    await expect(historyTab).not.toHaveClass(/text-primary/);
  });
});
