"use client";

interface Schedule {
  _id: string;
  timeOfDay: string;
  scheduledHour: number;
  scheduledMinute: number;
}

interface MedicationItem {
  _id: string;
  name: string;
  dose: string;
  type: string;
  location?: string;
  isActive: boolean;
  schedules: Schedule[];
}

interface MedicationListProps {
  items: MedicationItem[];
  onEdit: (itemId: string) => void;
  onToggleActive: (itemId: string, isActive: boolean) => void;
}

export function MedicationList({
  items,
  onEdit,
  onToggleActive,
}: MedicationListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-surface-dim p-4 text-center text-sm text-on-surface-muted">
        No medications configured yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item._id}
          className={`rounded-xl bg-surface-dim p-3 ${!item.isActive ? "opacity-60" : ""}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-on-surface truncate">
                  {item.name}
                </span>
                {!item.isActive && (
                  <span className="rounded-full bg-on-surface-muted/15 px-2 py-0.5 text-xs text-on-surface-muted">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-muted">{item.dose}</p>
              <p className="mt-1 text-xs text-on-surface-muted">
                {item.schedules.length} schedule{item.schedules.length !== 1 ? "s" : ""}
                {item.location && ` · ${item.location}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label={item.isActive ? "Deactivate" : "Activate"}
                onClick={() => onToggleActive(item._id, !item.isActive)}
                className="rounded-lg p-2 text-xs text-on-surface-muted active:bg-surface-container transition-colors"
              >
                {item.isActive ? "\u23F8" : "\u25B6"}
              </button>
              <button
                aria-label="Edit"
                onClick={() => onEdit(item._id)}
                className="rounded-lg p-2 text-xs text-on-surface-muted active:bg-surface-container transition-colors"
              >
                {"\u270E"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
