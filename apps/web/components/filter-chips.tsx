"use client";

type FilterValue = "eye_drop" | "oral" | "supplement" | "topical" | "observation" | null;

interface FilterChipsProps {
  selected: FilterValue;
  onSelect: (value: FilterValue) => void;
}

const filters: { value: FilterValue; label: string }[] = [
  { value: null, label: "All" },
  { value: "eye_drop", label: "Eye Drops" },
  { value: "oral", label: "Oral" },
  { value: "supplement", label: "Supplements" },
  { value: "topical", label: "Topical" },
  { value: "observation", label: "Observations" },
];

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((f) => {
        const isActive = selected === f.value;
        return (
          <button
            key={f.label}
            onClick={() => onSelect(f.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "bg-surface-container text-on-surface-muted"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

export type { FilterValue };
