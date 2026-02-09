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
    await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

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

  test("can submit each observation category", async ({ clerkPage }) => {
    const categories = [
      { name: "Snack", text: "Had a dental chew" },
      { name: "Behavior", text: "Very playful this morning" },
      { name: "Note", text: "Vet appointment tomorrow" },
    ];

    for (const { name, text } of categories) {
      // Open sheet
      await clerkPage.locator('button[aria-label="Add observation"]').click();
      await expect(clerkPage.locator("text=Add Observation")).toBeVisible();

      // Select category
      await clerkPage.locator(`text=${name}`).click();

      // Type text
      await clerkPage.locator('textarea[placeholder="What happened?"]').fill(text);

      // Submit
      await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

      // Sheet should close
      await expect(clerkPage.locator("text=Add Observation")).not.toBeVisible({ timeout: 5_000 });

      // Text should appear in timeline
      await expect(clerkPage.locator(`text=${text}`)).toBeVisible({ timeout: 10_000 });
    }
  });

  test("observation shows correct category icon/label in timeline", async ({ clerkPage }) => {
    // Submit a Behavior observation
    await clerkPage.locator('button[aria-label="Add observation"]').click();
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible();
    await clerkPage.locator("text=Behavior").click();
    await clerkPage.locator('textarea[placeholder="What happened?"]').fill("Scratching ears");
    await clerkPage.locator('button[aria-label="Save"]').evaluate((el) => (el as HTMLElement).click());

    await expect(clerkPage.locator("text=Add Observation")).not.toBeVisible({ timeout: 5_000 });

    // The observation in timeline should show the category label
    await expect(clerkPage.locator("text=Scratching ears")).toBeVisible({ timeout: 10_000 });
    // The category "Behavior" should be visible near the observation text
    const observation = clerkPage.locator("text=Scratching ears").locator("..").locator("..");
    await expect(observation.locator("text=/behavior/i")).toBeVisible();
  });
});
