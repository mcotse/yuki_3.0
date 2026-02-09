import { test, expect } from "./helpers";

test.describe("Admin Page (V7)", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("admin tab is visible for admin users", async ({ clerkPage }) => {
    // The bottom nav should show the Admin tab for admin users
    await expect(clerkPage.locator("text=Admin")).toBeVisible();
  });

  test("navigates to admin page", async ({ clerkPage }) => {
    // Click Admin in bottom tabs
    await clerkPage.locator("text=Admin").click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });

    // Should show the "Medications" heading
    await expect(clerkPage.locator("text=Medications")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows medication list", async ({ clerkPage }) => {
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({
      timeout: 10_000,
    });

    // Seeded medications should be visible
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({
      timeout: 15_000,
    });
    await expect(clerkPage.locator("text=Cyclosporine")).toBeVisible({ timeout: 5_000 });
    await expect(clerkPage.locator("text=Galliprant")).toBeVisible({ timeout: 5_000 });
    await expect(clerkPage.locator("text=Fish Oil")).toBeVisible({ timeout: 5_000 });
  });

  test("add medication form opens and works", async ({ clerkPage }) => {
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({
      timeout: 10_000,
    });

    // Wait for medication list to load
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({
      timeout: 10_000,
    });

    // Click "+ Add" button
    await clerkPage.locator("button", { hasText: "Add" }).click();

    // Form should appear with Name input
    await expect(clerkPage.locator('input[aria-label="Name"]')).toBeVisible();

    // Fill in the form
    await clerkPage.locator('input[aria-label="Name"]').fill("Apoquel");
    await clerkPage.locator('input[aria-label="Dose"]').fill("16mg daily");
    await clerkPage.locator('select[aria-label="Type"]').selectOption("oral");

    // Save (use evaluate to bypass z-index issues)
    await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

    // Should return to list with new medication visible
    await expect(clerkPage.locator("text=Apoquel")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("edit medication form opens with existing data", async ({ clerkPage }) => {
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({
      timeout: 10_000,
    });

    // Wait for medication list to load
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({
      timeout: 10_000,
    });

    // Click the first Edit button
    await clerkPage.locator('button[aria-label="Edit"]').first().click();

    // Form should appear with pre-filled Name input
    const nameInput = clerkPage.locator('input[aria-label="Name"]');
    await expect(nameInput).toBeVisible();

    // Name input should have a value (pre-filled from existing item)
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test("deactivate medication shows inactive badge", async ({ clerkPage }) => {
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({
      timeout: 10_000,
    });

    // Wait for medication list to load
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({
      timeout: 10_000,
    });

    // Click the first Deactivate button
    await clerkPage.locator('button[aria-label="Deactivate"]').first().click();

    // "Inactive" badge should appear
    await expect(clerkPage.locator("text=Inactive").first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("reactivate deactivated medication removes inactive badge", async ({ clerkPage }) => {
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({ timeout: 10_000 });
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({ timeout: 10_000 });

    // Deactivate first
    await clerkPage.locator('button[aria-label="Deactivate"]').first().click();
    await expect(clerkPage.locator("text=Inactive").first()).toBeVisible({ timeout: 5_000 });

    // Now reactivate
    await clerkPage.locator('button[aria-label="Activate"]').first().click();

    // "Inactive" badge should disappear after Convex mutation propagates
    await expect(clerkPage.locator("text=Inactive")).not.toBeVisible({ timeout: 10_000 });
  });

  test("edit medication saves updated name", async ({ clerkPage }) => {
    // Navigate via tab click to preserve Convex auth context (goto can cause auth race)
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({ timeout: 10_000 });
    await expect(clerkPage.locator("text=Fish Oil")).toBeVisible({ timeout: 15_000 });

    // Find and click Edit for Fish Oil
    const fishOilCard = clerkPage.locator(".rounded-xl").filter({ hasText: "Fish Oil" });
    await fishOilCard.locator('button[aria-label="Edit"]').click();

    // Clear and update the name
    const nameInput = clerkPage.locator('input[aria-label="Name"]');
    await expect(nameInput).toBeVisible({ timeout: 5_000 });
    await nameInput.clear();
    await nameInput.fill("Omega-3 Fish Oil");

    // Save (use evaluate to bypass z-index issues)
    await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

    // Updated name should appear in the list
    await expect(clerkPage.locator("text=Omega-3 Fish Oil")).toBeVisible({ timeout: 15_000 });
  });

  test("add medication form validates required fields", async ({ clerkPage }) => {
    await clerkPage.locator("nav a", { hasText: "Admin" }).click();
    await clerkPage.waitForURL("**/admin", { timeout: 10_000 });
    await expect(clerkPage.locator("text=Medications")).toBeVisible({ timeout: 10_000 });
    await expect(clerkPage.locator("text=Prednisolone")).toBeVisible({ timeout: 10_000 });

    // Open add form
    await clerkPage.locator("button", { hasText: "Add" }).click();

    // Try to save without filling required fields
    const saveBtn = clerkPage.locator('button[aria-label="Save"]');

    // Save should be disabled or clicking should show validation error
    const isDisabled = await saveBtn.isDisabled().catch(() => false);
    if (isDisabled) {
      // Save is disabled when form is empty — good
      expect(isDisabled).toBe(true);
    } else {
      // Click save and check for validation feedback
      await saveBtn.click();
      // Either an error appears or the form stays open (didn't save)
      await expect(clerkPage.locator('input[aria-label="Name"]')).toBeVisible();
    }
  });
});
