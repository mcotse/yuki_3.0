import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineList } from "../timeline-list";

const mockInstances = [
  {
    _id: "inst_1",
    itemName: "Prednisolone",
    itemDose: "1 drop, left eye",
    itemType: "eye_drop",
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "confirmed" as const,
    isObservation: false,
  },
  {
    _id: "inst_2",
    itemName: "Cyclosporine",
    itemDose: "1 drop, both eyes",
    itemType: "eye_drop",
    scheduledHour: 8,
    scheduledMinute: 5,
    status: "pending" as const,
    isObservation: false,
  },
  {
    _id: "inst_3",
    itemName: "Galliprant",
    itemDose: "20mg tablet",
    itemType: "oral",
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "pending" as const,
    isObservation: false,
  },
];

describe("TimelineList", () => {
  it("renders all instances", () => {
    render(
      <TimelineList
        instances={mockInstances}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByText("Prednisolone")).toBeDefined();
    expect(screen.getByText("Cyclosporine")).toBeDefined();
    expect(screen.getByText("Galliprant")).toBeDefined();
  });

  it("shows section header", () => {
    render(
      <TimelineList
        instances={mockInstances}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByText("Today's Schedule")).toBeDefined();
  });

  it("shows empty state when no instances", () => {
    render(
      <TimelineList
        instances={[]}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByText(/no medications/i)).toBeDefined();
  });
});
