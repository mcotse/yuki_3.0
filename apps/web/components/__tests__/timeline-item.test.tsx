import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineItem } from "../timeline-item";

const mockInstance = {
  _id: "inst_1",
  itemName: "Prednisolone",
  itemDose: "1 drop, left eye",
  itemType: "eye_drop" as const,
  scheduledHour: 8,
  scheduledMinute: 0,
  status: "pending" as const,
  isObservation: false,
  itemLocation: "Fridge",
};

describe("TimelineItem", () => {
  it("displays medication name, dose, and time", () => {
    render(
      <TimelineItem
        instance={mockInstance}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByText("Prednisolone")).toBeDefined();
    expect(screen.getByText("1 drop, left eye")).toBeDefined();
    expect(screen.getByText("8:00 AM")).toBeDefined();
  });

  it("shows confirm button for pending items", () => {
    render(
      <TimelineItem
        instance={mockInstance}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /confirm/i })).toBeDefined();
  });

  it("calls onConfirm with instance id", () => {
    const onConfirm = vi.fn();
    render(
      <TimelineItem
        instance={mockInstance}
        onConfirm={onConfirm}
        onSnooze={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledWith("inst_1");
  });

  it("hides confirm button for confirmed items", () => {
    render(
      <TimelineItem
        instance={{ ...mockInstance, status: "confirmed" }}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.queryByRole("button", { name: /confirm/i })).toBeNull();
  });

  it("shows snooze button for pending items", () => {
    render(
      <TimelineItem
        instance={mockInstance}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /snooze/i })).toBeDefined();
  });

  it("displays conflict warning when provided", () => {
    render(
      <TimelineItem
        instance={{ ...mockInstance, conflictWarning: "Wait 5 min after Prednisolone" }}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByText(/wait 5 min/i)).toBeDefined();
  });

  it("displays observation text for observation items", () => {
    render(
      <TimelineItem
        instance={{
          ...mockInstance,
          isObservation: true,
          observationCategory: "symptom",
          observationText: "Yuki sneezed twice",
          status: "confirmed",
        }}
        onConfirm={() => {}}
        onSnooze={() => {}}
      />
    );
    expect(screen.getByText("Yuki sneezed twice")).toBeDefined();
  });
});
