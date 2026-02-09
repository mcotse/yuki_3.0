import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationToggle } from "../notification-toggle";

describe("NotificationToggle", () => {
  it("shows enabled state when subscribed", () => {
    render(
      <NotificationToggle
        isSubscribed={true}
        isSupported={true}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText("Notifications Enabled")).toBeDefined();
  });

  it("shows disabled state when not subscribed", () => {
    render(
      <NotificationToggle
        isSubscribed={false}
        isSupported={true}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText("Enable Notifications")).toBeDefined();
  });

  it("shows unsupported message when not supported", () => {
    render(
      <NotificationToggle
        isSubscribed={false}
        isSupported={false}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText(/not supported/i)).toBeDefined();
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(
      <NotificationToggle
        isSubscribed={false}
        isSupported={true}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalled();
  });
});
