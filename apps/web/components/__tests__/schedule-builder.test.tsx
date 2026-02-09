import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScheduleBuilder } from "../schedule-builder";

const mockSchedules = [
  { _id: "s1", timeOfDay: "morning" as const, scheduledHour: 8, scheduledMinute: 0 },
  { _id: "s2", timeOfDay: "evening" as const, scheduledHour: 20, scheduledMinute: 0 },
];

describe("ScheduleBuilder", () => {
  it("renders existing schedules", () => {
    render(
      <ScheduleBuilder
        schedules={mockSchedules}
        onAdd={() => {}}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText("8:00 AM")).toBeDefined();
    expect(screen.getByText("8:00 PM")).toBeDefined();
  });

  it("shows time of day labels", () => {
    render(
      <ScheduleBuilder
        schedules={mockSchedules}
        onAdd={() => {}}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText(/morning/i)).toBeDefined();
    expect(screen.getByText(/evening/i)).toBeDefined();
  });

  it("calls onRemove with schedule id", () => {
    const onRemove = vi.fn();
    render(
      <ScheduleBuilder
        schedules={mockSchedules}
        onAdd={() => {}}
        onRemove={onRemove}
      />
    );
    const removeButtons = screen.getAllByLabelText("Remove schedule");
    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith("s1");
  });

  it("shows add schedule button", () => {
    render(
      <ScheduleBuilder
        schedules={mockSchedules}
        onAdd={() => {}}
        onRemove={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /add schedule/i })).toBeDefined();
  });
});
