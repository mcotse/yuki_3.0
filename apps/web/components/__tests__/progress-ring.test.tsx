import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing } from "../progress-ring";

describe("ProgressRing", () => {
  it("displays done/total text", () => {
    render(<ProgressRing done={3} total={6} />);
    expect(screen.getByText("3 / 6")).toBeDefined();
  });

  it("shows 'All done!' when complete", () => {
    render(<ProgressRing done={6} total={6} />);
    expect(screen.getByText("All done!")).toBeDefined();
  });

  it("renders an SVG circle", () => {
    const { container } = render(<ProgressRing done={2} total={5} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
