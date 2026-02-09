import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfflineIndicator } from "../offline-indicator";

describe("OfflineIndicator", () => {
  it("shows offline banner when isOnline is false", () => {
    render(<OfflineIndicator isOnline={false} />);
    expect(screen.getByText(/offline/i)).toBeDefined();
  });

  it("renders nothing when online", () => {
    const { container } = render(<OfflineIndicator isOnline={true} />);
    expect(container.textContent).toBe("");
  });
});
