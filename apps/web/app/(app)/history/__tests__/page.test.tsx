import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HistoryPage from "../page";

const mockInstances = [
  {
    _id: "inst_1",
    itemName: "Prednisolone",
    itemDose: "1 drop",
    itemType: "eye_drop",
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "confirmed" as const,
    confirmedAt: Date.now(),
    isObservation: false,
    auditTrail: [],
  },
];

vi.mock("convex/react", () => ({
  useQuery: () => ({ instances: mockInstances }),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    history: {
      getForDate: { name: "history:getForDate" },
    },
  },
}));

vi.mock("@/lib/date-utils", () => ({
  getTodayString: () => "2026-02-08",
}));

describe("HistoryPage", () => {
  it("renders the date picker", () => {
    render(<HistoryPage />);
    expect(screen.getByLabelText("Previous day")).toBeDefined();
    expect(screen.getByLabelText("Next day")).toBeDefined();
  });

  it("renders filter chips", () => {
    render(<HistoryPage />);
    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("Eye Drops")).toBeDefined();
    expect(screen.getByText("Oral")).toBeDefined();
  });

  it("renders history list with instances", () => {
    render(<HistoryPage />);
    expect(screen.getByText("Prednisolone")).toBeDefined();
  });

  it("navigates dates when date picker arrows are clicked", () => {
    render(<HistoryPage />);
    fireEvent.click(screen.getByLabelText("Previous day"));
    // After clicking previous, should show Feb 7
    expect(screen.getByText(/feb 7/i)).toBeDefined();
  });
});
