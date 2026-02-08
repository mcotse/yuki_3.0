import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomTabs } from "../bottom-tabs";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("BottomTabs", () => {
  it("renders three tab links", () => {
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /history/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();
  });

  it("highlights the active tab", () => {
    render(<BottomTabs />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink.className).toContain("text-primary");
  });
});
