import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomTabs } from "../bottom-tabs";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// Mock useCurrentUser hook
const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

describe("BottomTabs", () => {
  it("renders three tab links for non-admin users", () => {
    mockUseCurrentUser.mockReturnValue({ isAdmin: false });
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /history/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();
    expect(screen.queryByRole("link", { name: /admin/i })).toBeNull();
  });

  it("renders four tab links including Admin for admin users", () => {
    mockUseCurrentUser.mockReturnValue({ isAdmin: true });
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /history/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /admin/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();
  });

  it("highlights the active tab", () => {
    mockUseCurrentUser.mockReturnValue({ isAdmin: false });
    render(<BottomTabs />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink.className).toContain("text-primary");
  });
});
