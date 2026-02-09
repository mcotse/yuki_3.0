import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardPage from "../page";

// Mock convex react hooks
const mockConfirm = vi.fn();
const mockUndo = vi.fn();
const mockSnooze = vi.fn();
const mockAddObservation = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: (ref: { name?: string } | string) => {
    const name = typeof ref === "string" ? ref : ref?.name ?? String(ref);
    if (name.includes("addObservation")) return mockAddObservation;
    if (name.includes("undo")) return mockUndo;
    if (name.includes("snooze")) return mockSnooze;
    return mockConfirm;
  },
  useQuery: () => undefined,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    actions: {
      confirm: { name: "actions:confirm" },
      undo: { name: "actions:undo" },
      snooze: { name: "actions:snooze" },
      addObservation: { name: "actions:addObservation" },
    },
    instances: {
      getToday: { name: "instances:getToday" },
    },
  },
}));

const mockInstances = [
  {
    _id: "inst_1",
    petId: "pet_1",
    itemName: "Prednisolone",
    itemDose: "1 drop",
    itemType: "eye_drop",
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "pending" as const,
    isObservation: false,
  },
];

vi.mock("@/hooks/use-today", () => ({
  useToday: () => ({
    date: "2026-02-08",
    instances: mockInstances,
    heroItem: mockInstances[0],
    progress: { done: 0, total: 1 },
    isLoading: false,
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the observation FAB button", () => {
    render(<DashboardPage />);
    expect(screen.getByLabelText("Add observation")).toBeDefined();
  });

  it("opens observation sheet when FAB is clicked", () => {
    render(<DashboardPage />);
    fireEvent.click(screen.getByLabelText("Add observation"));
    expect(screen.getByText("Add Observation")).toBeDefined();
  });

  it("calls addObservation mutation on submit", () => {
    render(<DashboardPage />);

    // Open sheet
    fireEvent.click(screen.getByLabelText("Add observation"));

    // Select category
    fireEvent.click(screen.getByText("Symptom"));

    // Type text
    fireEvent.change(screen.getByPlaceholderText(/what happened/i), {
      target: { value: "Yuki sneezed" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mockAddObservation).toHaveBeenCalledWith({
      petId: "pet_1",
      category: "symptom",
      text: "Yuki sneezed",
    });
  });

  it("closes observation sheet after submit", () => {
    render(<DashboardPage />);

    // Open sheet
    fireEvent.click(screen.getByLabelText("Add observation"));
    expect(screen.getByText("Add Observation")).toBeDefined();

    // Select category and type text
    fireEvent.click(screen.getByText("Symptom"));
    fireEvent.change(screen.getByPlaceholderText(/what happened/i), {
      target: { value: "Yuki sneezed" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    // Sheet should be closed (dialog should not be present)
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
