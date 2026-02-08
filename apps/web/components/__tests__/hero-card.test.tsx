import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroCard } from "../hero-card";

describe("HeroCard", () => {
  const mockInstance = {
    _id: "inst_1",
    itemName: "Prednisolone",
    itemDose: "1 drop, left eye",
    itemType: "eye_drop" as const,
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "pending" as const,
    itemLocation: "Fridge",
  };

  it("displays medication name and dose", () => {
    render(<HeroCard item={mockInstance} onConfirm={() => {}} />);
    expect(screen.getByText("Prednisolone")).toBeDefined();
    expect(screen.getByText("1 drop, left eye")).toBeDefined();
  });

  it("displays scheduled time", () => {
    render(<HeroCard item={mockInstance} onConfirm={() => {}} />);
    expect(screen.getByText("8:00 AM")).toBeDefined();
  });

  it("shows confirm button when pending", () => {
    render(<HeroCard item={mockInstance} onConfirm={() => {}} />);
    expect(screen.getByRole("button", { name: /confirm/i })).toBeDefined();
  });

  it("calls onConfirm when button is clicked", () => {
    const onConfirm = vi.fn();
    render(<HeroCard item={mockInstance} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledWith("inst_1");
  });

  it("shows all-clear state when item is null", () => {
    render(<HeroCard item={null} onConfirm={() => {}} />);
    expect(screen.getByText(/all clear/i)).toBeDefined();
  });
});
