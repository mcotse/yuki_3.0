import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterChips } from "../filter-chips";

describe("FilterChips", () => {
  it("renders all filter options", () => {
    render(<FilterChips selected={null} onSelect={() => {}} />);
    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("Eye Drops")).toBeDefined();
    expect(screen.getByText("Oral")).toBeDefined();
    expect(screen.getByText("Supplements")).toBeDefined();
    expect(screen.getByText("Topical")).toBeDefined();
    expect(screen.getByText("Observations")).toBeDefined();
  });

  it("highlights the selected chip", () => {
    render(<FilterChips selected="oral" onSelect={() => {}} />);
    const oralChip = screen.getByText("Oral");
    expect(oralChip.className).toContain("bg-primary");
  });

  it("calls onSelect with filter value", () => {
    const onSelect = vi.fn();
    render(<FilterChips selected={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Eye Drops"));
    expect(onSelect).toHaveBeenCalledWith("eye_drop");
  });

  it("calls onSelect with null when All is clicked", () => {
    const onSelect = vi.fn();
    render(<FilterChips selected="oral" onSelect={onSelect} />);
    fireEvent.click(screen.getByText("All"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
