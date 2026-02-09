import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryList } from "../history-list";

const mockInstances = [
  {
    _id: "inst_1",
    itemName: "Prednisolone",
    itemDose: "1 drop, left eye",
    itemType: "eye_drop",
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "confirmed" as const,
    confirmedAt: Date.now(),
    isObservation: false,
    auditTrail: [
      {
        action: "confirmed",
        userName: "Matthew",
        performedAt: Date.now(),
        notes: "Given with breakfast",
      },
    ],
  },
  {
    _id: "inst_2",
    itemName: "Galliprant",
    itemDose: "20mg tablet",
    itemType: "oral",
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "pending" as const,
    isObservation: false,
    auditTrail: [],
  },
];

describe("HistoryList", () => {
  it("renders all instances with names", () => {
    render(<HistoryList instances={mockInstances} />);
    expect(screen.getByText("Prednisolone")).toBeDefined();
    expect(screen.getByText("Galliprant")).toBeDefined();
  });

  it("shows empty state when no instances", () => {
    render(<HistoryList instances={[]} />);
    expect(screen.getByText(/no records/i)).toBeDefined();
  });

  it("expands audit trail on click", () => {
    render(<HistoryList instances={mockInstances} />);

    // Click to expand Prednisolone
    fireEvent.click(screen.getByText("Prednisolone"));

    // Audit trail should be visible
    expect(screen.getByText("Given with breakfast")).toBeDefined();
    expect(screen.getByText(/matthew/i)).toBeDefined();
  });
});
