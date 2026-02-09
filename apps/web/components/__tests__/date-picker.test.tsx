import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatePicker } from "../date-picker";

describe("DatePicker", () => {
  it("displays the formatted date", () => {
    render(<DatePicker date="2026-02-07" onChange={() => {}} />);
    expect(screen.getByText(/feb 7/i)).toBeDefined();
  });

  it("calls onChange with previous date on back click", () => {
    const onChange = vi.fn();
    render(<DatePicker date="2026-02-07" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(onChange).toHaveBeenCalledWith("2026-02-06");
  });

  it("calls onChange with next date on forward click", () => {
    const onChange = vi.fn();
    render(<DatePicker date="2026-02-07" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(onChange).toHaveBeenCalledWith("2026-02-08");
  });

  it("shows 'Today' label when date is today", () => {
    const today = new Date().toISOString().split("T")[0];
    render(<DatePicker date={today} onChange={() => {}} />);
    expect(screen.getByText("Today")).toBeDefined();
  });
});
