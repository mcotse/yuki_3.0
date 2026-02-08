import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UndoToast } from "../undo-toast";

describe("UndoToast", () => {
  it("displays the medication name", () => {
    render(
      <UndoToast
        itemName="Prednisolone"
        onUndo={() => {}}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText(/prednisolone confirmed/i)).toBeDefined();
  });

  it("calls onUndo when undo button is clicked", () => {
    const onUndo = vi.fn();
    render(
      <UndoToast itemName="Prednisolone" onUndo={onUndo} onDismiss={() => {}} />
    );

    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(onUndo).toHaveBeenCalled();
  });

  it("calls onDismiss after 5 seconds", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <UndoToast
        itemName="Prednisolone"
        onUndo={() => {}}
        onDismiss={onDismiss}
      />
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
