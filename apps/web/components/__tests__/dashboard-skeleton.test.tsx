import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSkeleton } from "../dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("renders skeleton elements", () => {
    render(<DashboardSkeleton />);
    const skeletons = screen.getAllByTestId("skeleton-block");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
