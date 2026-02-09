import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MedicationForm } from "../medication-form";

describe("MedicationForm", () => {
  it("renders empty form for new medication", () => {
    render(<MedicationForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Dose")).toBeDefined();
    expect(screen.getByLabelText("Type")).toBeDefined();
  });

  it("pre-fills form when editing existing medication", () => {
    render(
      <MedicationForm
        initialValues={{
          name: "Prednisolone",
          dose: "1 drop",
          type: "eye_drop",
          location: "Fridge",
        }}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByDisplayValue("Prednisolone")).toBeDefined();
    expect(screen.getByDisplayValue("1 drop")).toBeDefined();
    expect(screen.getByDisplayValue("Fridge")).toBeDefined();
  });

  it("calls onSubmit with form data", () => {
    const onSubmit = vi.fn();
    render(<MedicationForm onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Apoquel" },
    });
    fireEvent.change(screen.getByLabelText("Dose"), {
      target: { value: "16mg" },
    });
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "oral" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Apoquel",
        dose: "16mg",
        type: "oral",
      })
    );
  });

  it("disables save when fields are empty", () => {
    render(<MedicationForm onSubmit={() => {}} onCancel={() => {}} />);
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn.hasAttribute("disabled")).toBe(true);
  });

  it("disables save when name is filled but dose is empty", () => {
    render(<MedicationForm onSubmit={() => {}} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Apoquel" },
    });
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn.hasAttribute("disabled")).toBe(true);
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<MedicationForm onSubmit={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
