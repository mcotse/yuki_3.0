import { test, expect, waitForTimeline } from "./helpers";

// These tests run in the "mobile" Playwright project (Pixel 7 viewport)
test.describe("Mobile Viewport", () => {
  test.beforeEach(async ({ clerkPage }) => {
    await clerkPage.goto("/api/test-seed");
    await clerkPage.goto("/dashboard");
    await clerkPage.waitForSelector("text=Right Now", { timeout: 15_000 });
  });

  test("bottom tabs are visible and tappable on mobile", async ({ clerkPage }) => {
    // Bottom tabs should be visible at the bottom of the viewport
    const tabBar = clerkPage.locator("nav").last();
    await expect(tabBar).toBeVisible();

    // All tabs should be visible
    await expect(clerkPage.locator("text=Dashboard")).toBeVisible();
    await expect(clerkPage.locator("text=History")).toBeVisible();
    await expect(clerkPage.locator("text=Settings")).toBeVisible();

    // Tabs should be within the viewport (not scrolled off)
    const tabBox = await tabBar.boundingBox();
    expect(tabBox).not.toBeNull();
    if (tabBox) {
      const viewport = clerkPage.viewportSize();
      expect(tabBox.y + tabBox.height).toBeLessThanOrEqual(viewport!.height + 10);
    }
  });

  test("hero card is fully visible without horizontal scroll", async ({ clerkPage }) => {
    const heroCard = clerkPage.locator("text=Right Now").locator("..").locator("..");
    const box = await heroCard.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const viewport = clerkPage.viewportSize();
      // Card should fit within viewport width
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width + 10);
    }
  });

  test("confirm button has adequate touch target size", async ({ clerkPage }) => {
    const confirmBtn = clerkPage.locator("button", { hasText: "Confirm" }).first();
    const box = await confirmBtn.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // WCAG 2.5.8 recommends minimum 44x44px touch targets
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("observation FAB is visible and not overlapping tabs", async ({ clerkPage }) => {
    const fab = clerkPage.locator('button[aria-label="Add observation"]');
    await expect(fab).toBeVisible();

    const fabBox = await fab.boundingBox();
    const tabBar = clerkPage.locator("nav").last();
    const tabBox = await tabBar.boundingBox();

    expect(fabBox).not.toBeNull();
    expect(tabBox).not.toBeNull();

    if (fabBox && tabBox) {
      // FAB bottom should be above the tab bar top (no overlap)
      expect(fabBox.y + fabBox.height).toBeLessThanOrEqual(tabBox.y + 5);
    }
  });

  test("observation sheet fills mobile viewport appropriately", async ({ clerkPage }) => {
    await clerkPage.locator('button[aria-label="Add observation"]').click();
    await expect(clerkPage.locator("text=Add Observation")).toBeVisible();

    // Sheet should be at least 30% of viewport height on mobile
    const sheet = clerkPage.locator("text=Add Observation").locator("..").locator("..");
    const sheetBox = await sheet.boundingBox();
    const viewport = clerkPage.viewportSize();

    expect(sheetBox).not.toBeNull();
    if (sheetBox && viewport) {
      expect(sheetBox.height).toBeGreaterThanOrEqual(viewport.height * 0.3);
    }
  });

  test("timeline items have adequate touch targets for confirm/snooze", async ({ clerkPage }) => {
    await waitForTimeline(clerkPage);

    const confirmBtns = clerkPage.locator('button[aria-label="Confirm"]');
    const count = await confirmBtns.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await confirmBtns.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(24);
        expect(box.width).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test("history page date picker arrows are tappable on mobile", async ({ clerkPage }) => {
    await clerkPage.goto("/history");
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });

    const prevBtn = clerkPage.locator('button[aria-label="Previous day"]');
    const nextBtn = clerkPage.locator('button[aria-label="Next day"]');

    for (const btn of [prevBtn, nextBtn]) {
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(20);
        expect(box.width).toBeGreaterThanOrEqual(20);
      }
    }
  });

  test("full mobile flow: dashboard → confirm → history", async ({ clerkPage }) => {
    // Confirm a medication (hero card button)
    await clerkPage.locator("button", { hasText: "Confirm" }).first().click();
    await expect(clerkPage.locator("text=/confirmed/i")).toBeVisible({ timeout: 5_000 });

    // Navigate to history via bottom tab
    await clerkPage.locator("text=History").click();
    await clerkPage.waitForURL("**/history", { timeout: 10_000 });

    // History should render correctly on mobile
    await expect(clerkPage.locator("text=Today")).toBeVisible({ timeout: 10_000 });
  });
});
