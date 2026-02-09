import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "../page";

const mockSignOut = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      fullName: "Matthew Cotse",
      primaryEmailAddress: { emailAddress: "matt@example.com" },
      imageUrl: "https://example.com/avatar.jpg",
    },
    isLoaded: true,
  }),
  useClerk: () => ({
    signOut: mockSignOut,
  }),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    user: { name: "Matthew Cotse", email: "matt@example.com", role: "admin" },
    isLoading: false,
    isAdmin: true,
  }),
}));

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    isSubscribed: false,
    isSupported: true,
    toggle: vi.fn(),
    isLoading: false,
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders account info with name and email", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Matthew Cotse")).toBeDefined();
    expect(screen.getByText("matt@example.com")).toBeDefined();
  });

  it("shows user role", () => {
    render(<SettingsPage />);
    expect(screen.getByText("admin")).toBeDefined();
  });

  it("shows the notification toggle", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Enable Notifications")).toBeDefined();
  });

  it("shows sign out button", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Sign Out")).toBeDefined();
  });

  it("calls signOut when sign out button is clicked", () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows app version info", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Yuki 3.0")).toBeDefined();
  });
});
