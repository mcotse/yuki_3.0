type ObservationCategory = "symptom" | "snack" | "behavior" | "note";

interface CategoryPickerProps {
  selected: ObservationCategory | null;
  onSelect: (category: ObservationCategory) => void;
}

const categories: { value: ObservationCategory; label: string; icon: string }[] = [
  { value: "symptom", label: "Symptom", icon: "🤒" },
  { value: "snack", label: "Snack", icon: "🍖" },
  { value: "behavior", label: "Behavior", icon: "🐾" },
  { value: "note", label: "Note", icon: "📝" },
];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="flex gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={`flex-1 rounded-lg px-2 py-2 text-center text-xs transition-colors ${
            selected === cat.value
              ? "bg-primary text-white"
              : "bg-surface-container text-on-surface-muted"
          }`}
        >
          <div className="text-base">{cat.icon}</div>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
