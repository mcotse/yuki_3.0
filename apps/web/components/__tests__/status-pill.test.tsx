import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "../status-pill";

describe("StatusPill", () => {
  it("shows 'Due' for pending status", () => {
    render(<StatusPill status="pending" />);
    expect(screen.getByText("Due")).toBeDefined();
  });

  it("shows 'Done' for confirmed status", () => {
    render(<StatusPill status="confirmed" />);
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("shows 'Snoozed' for snoozed status", () => {
    render(<StatusPill status="snoozed" />);
    expect(screen.getByText("Snoozed")).toBeDefined();
  });

  it("shows 'Upcoming' for pending items scheduled in the future", () => {
    render(<StatusPill status="pending" isUpcoming />);
    expect(screen.getByText("Upcoming")).toBeDefined();
  });
});
