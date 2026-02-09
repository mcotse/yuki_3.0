import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ObservationSheet } from "../observation-sheet";

describe("ObservationSheet", () => {
  it("renders category options", () => {
    render(
      <ObservationSheet
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );
    expect(screen.getByText("Symptom")).toBeDefined();
    expect(screen.getByText("Snack")).toBeDefined();
    expect(screen.getByText("Behavior")).toBeDefined();
    expect(screen.getByText("Note")).toBeDefined();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <ObservationSheet
        isOpen={false}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("calls onSubmit with category and text", () => {
    const onSubmit = vi.fn();
    render(
      <ObservationSheet isOpen={true} onClose={() => {}} onSubmit={onSubmit} />
    );

    // Select category
    fireEvent.click(screen.getByText("Symptom"));

    // Type observation text
    fireEvent.change(screen.getByPlaceholderText(/what happened/i), {
      target: { value: "Yuki sneezed twice" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith("symptom", "Yuki sneezed twice");
  });

  it("disables save when no text entered", () => {
    render(
      <ObservationSheet
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Symptom"));

    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn.hasAttribute("disabled")).toBe(true);
  });
});
