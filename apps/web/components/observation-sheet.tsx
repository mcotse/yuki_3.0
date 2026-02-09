"use client";

import { useState } from "react";
import { CategoryPicker } from "./category-picker";

type ObservationCategory = "symptom" | "snack" | "behavior" | "note";

interface ObservationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: ObservationCategory, text: string) => void;
}

export function ObservationSheet({
  isOpen,
  onClose,
  onSubmit,
}: ObservationSheetProps) {
  const [category, setCategory] = useState<ObservationCategory | null>(null);
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!category || !text.trim()) return;
    onSubmit(category, text.trim());
    setCategory(null);
    setText("");
    onClose();
  };

  const handleClose = () => {
    setCategory(null);
    setText("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={handleClose}
      />
      {/* Sheet */}
      <div
        role="dialog"
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-2xl bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">
            Add Observation
          </h2>
          <button
            onClick={handleClose}
            className="text-sm text-on-surface-muted"
          >
            Cancel
          </button>
        </div>

        <CategoryPicker selected={category} onSelect={setCategory} />

        <textarea
          placeholder="What happened?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-surface-container bg-surface-dim p-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!category || !text.trim()}
          aria-label="Save"
          className="mt-3 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          Save Observation
        </button>
      </div>
    </>
  );
}
