import { test, expect } from "./helpers";

test.describe("Observations (V5)", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("FAB button is visible on dashboard", async ({ clerkPage }) => {
    await expect(
      clerkPage.locator('button[aria-label="Add observation"]')
    ).toBeVisible();
  });

  test("FAB opens observation sheet", async ({ clerkPage }) => {
    // Click the FAB
    await clerkPage.locator('button[aria-label="Add observation"]').click();

    // Sheet should be visible with heading
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible();

    // Category buttons should be visible
    await expect(clerkPage.locator("text=Symptom")).toBeVisible();
    await expect(clerkPage.locator("text=Snack")).toBeVisible();
    await expect(clerkPage.locator("text=Behavior")).toBeVisible();
    await expect(clerkPage.locator("text=Note")).toBeVisible();
  });

  test("can submit an observation", async ({ clerkPage }) => {
    // Open sheet
    await clerkPage.locator('button[aria-label="Add observation"]').click();
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible();

    // Select category
    await clerkPage.locator("text=Symptom").click();

    // Type observation text
    await clerkPage
      .locator('textarea[placeholder="What happened?"]')
      .fill("Slight redness in left eye");

    // Submit
    await clerkPage.locator('button[aria-label="Save"]').click();

    // Sheet should close
    await expect(clerkPage.locator("text=Add Observation")).not.toBeVisible({
      timeout: 5_000,
    });

    // Observation text should appear in the timeline
    await expect(
      clerkPage.locator("text=Slight redness in left eye")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("save is disabled without text", async ({ clerkPage }) => {
    // Open sheet
    await clerkPage.locator('button[aria-label="Add observation"]').click();
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible();

    // Select a category but don't type text
    await clerkPage.locator("text=Symptom").click();

    // Save button should be disabled
    await expect(clerkPage.locator('button[aria-label="Save"]')).toBeDisabled();
  });

  test("cancel closes sheet without saving", async ({ clerkPage }) => {
    // Open sheet
    await clerkPage.locator('button[aria-label="Add observation"]').click();
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible();

    // Select category and type text
    await clerkPage.locator("text=Note").click();
    await clerkPage
      .locator('textarea[placeholder="What happened?"]')
      .fill("Just a test note");

    // Cancel
    await clerkPage.locator("button", { hasText: "Cancel" }).click();

    // Sheet should close
    await expect(clerkPage.locator("text=Add Observation")).not.toBeVisible({
      timeout: 5_000,
    });

    // Text should NOT appear in the timeline
    await expect(
      clerkPage.locator("text=Just a test note")
    ).not.toBeVisible();
  });
});
