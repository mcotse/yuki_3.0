"use client";

import { useState } from "react";

type ItemType = "eye_drop" | "oral" | "supplement" | "topical";

interface FormValues {
  name: string;
  dose: string;
  type: ItemType;
  location?: string;
  notes?: string;
  conflictGroup?: string;
}

interface MedicationFormProps {
  initialValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

export function MedicationForm({
  initialValues,
  onSubmit,
  onCancel,
}: MedicationFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [dose, setDose] = useState(initialValues?.dose ?? "");
  const [type, setType] = useState<ItemType>(initialValues?.type ?? "oral");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [conflictGroup, setConflictGroup] = useState(
    initialValues?.conflictGroup ?? ""
  );

  const canSubmit = name.trim() !== "" && dose.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      dose: dose.trim(),
      type,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      conflictGroup: conflictGroup.trim() || undefined,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-surface-container bg-surface-dim p-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none";

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="med-name" className="mb-1 block text-xs font-medium text-on-surface-muted">
          Name
        </label>
        <input
          id="med-name"
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Medication name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="med-dose" className="mb-1 block text-xs font-medium text-on-surface-muted">
          Dose
        </label>
        <input
          id="med-dose"
          aria-label="Dose"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="e.g., 1 drop, left eye"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="med-type" className="mb-1 block text-xs font-medium text-on-surface-muted">
          Type
        </label>
        <select
          id="med-type"
          aria-label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as ItemType)}
          className={inputClass}
        >
          <option value="eye_drop">Eye Drop</option>
          <option value="oral">Oral</option>
          <option value="supplement">Supplement</option>
          <option value="topical">Topical</option>
        </select>
      </div>

      <div>
        <label htmlFor="med-location" className="mb-1 block text-xs font-medium text-on-surface-muted">
          Location
        </label>
        <input
          id="med-location"
          aria-label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Fridge, Cabinet"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="med-notes" className="mb-1 block text-xs font-medium text-on-surface-muted">
          Notes
        </label>
        <textarea
          id="med-notes"
          aria-label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label htmlFor="med-conflict" className="mb-1 block text-xs font-medium text-on-surface-muted">
          Conflict Group
        </label>
        <input
          id="med-conflict"
          aria-label="Conflict Group"
          value={conflictGroup}
          onChange={(e) => setConflictGroup(e.target.value)}
          placeholder="e.g., eye_drops (optional)"
          className={inputClass}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="flex-1 rounded-xl border border-surface-container px-4 py-3 text-sm font-medium text-on-surface-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Save"
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          Save
        </button>
      </div>
    </div>
  );
}
