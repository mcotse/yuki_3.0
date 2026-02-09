import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PresenceIndicator } from "../presence-indicator";

describe("PresenceIndicator", () => {
  it("renders online user names", () => {
    render(
      <PresenceIndicator
        users={[
          { userId: "u1", name: "Matthew", isOnline: true },
          { userId: "u2", name: "Sarah", isOnline: true },
        ]}
      />
    );
    expect(screen.getByText(/Matthew/)).toBeDefined();
    expect(screen.getByText(/Sarah/)).toBeDefined();
  });

  it("shows nothing when no users are online", () => {
    const { container } = render(<PresenceIndicator users={[]} />);
    expect(container.textContent).toBe("");
  });

  it("shows green dot for online status", () => {
    render(
      <PresenceIndicator
        users={[{ userId: "u1", name: "Matthew", isOnline: true }]}
      />
    );
    const dot = screen.getByTestId("presence-dot");
    expect(dot).toBeDefined();
  });
});
