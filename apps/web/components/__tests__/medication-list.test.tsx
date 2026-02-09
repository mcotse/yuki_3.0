import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MedicationList } from "../medication-list";

const mockItems = [
  {
    _id: "item_1",
    name: "Prednisolone",
    dose: "1 drop, left eye",
    type: "eye_drop" as const,
    location: "Fridge",
    isActive: true,
    schedules: [
      { _id: "s1", timeOfDay: "morning" as const, scheduledHour: 8, scheduledMinute: 0 },
      { _id: "s2", timeOfDay: "evening" as const, scheduledHour: 20, scheduledMinute: 0 },
    ],
  },
  {
    _id: "item_2",
    name: "Galliprant",
    dose: "20mg tablet",
    type: "oral" as const,
    location: "Cabinet",
    isActive: false,
    schedules: [
      { _id: "s3", timeOfDay: "morning" as const, scheduledHour: 8, scheduledMinute: 0 },
    ],
  },
];

describe("MedicationList", () => {
  it("renders all medication names", () => {
    render(
      <MedicationList
        items={mockItems}
        onEdit={() => {}}
        onToggleActive={() => {}}
      />
    );
    expect(screen.getByText("Prednisolone")).toBeDefined();
    expect(screen.getByText("Galliprant")).toBeDefined();
  });

  it("shows dose and schedule count", () => {
    render(
      <MedicationList
        items={mockItems}
        onEdit={() => {}}
        onToggleActive={() => {}}
      />
    );
    expect(screen.getByText("1 drop, left eye")).toBeDefined();
    expect(screen.getByText(/2 schedules/i)).toBeDefined();
    expect(screen.getByText(/1 schedule/i)).toBeDefined();
  });

  it("shows inactive badge for deactivated items", () => {
    render(
      <MedicationList
        items={mockItems}
        onEdit={() => {}}
        onToggleActive={() => {}}
      />
    );
    expect(screen.getByText("Inactive")).toBeDefined();
  });

  it("calls onEdit with item id", () => {
    const onEdit = vi.fn();
    render(
      <MedicationList
        items={mockItems}
        onEdit={onEdit}
        onToggleActive={() => {}}
      />
    );
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);
    expect(onEdit).toHaveBeenCalledWith("item_1");
  });

  it("shows empty state when no items", () => {
    render(
      <MedicationList
        items={[]}
        onEdit={() => {}}
        onToggleActive={() => {}}
      />
    );
    expect(screen.getByText(/no medications/i)).toBeDefined();
  });
});
