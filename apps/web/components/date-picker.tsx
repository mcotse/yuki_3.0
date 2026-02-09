"use client";

interface DatePickerProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isToday(dateStr: string): boolean {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return dateStr === `${y}-${m}-${d}`;
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        aria-label="Previous day"
        onClick={() => onChange(addDays(date, -1))}
        className="rounded-lg p-2 text-on-surface-muted active:bg-surface-container transition-colors"
      >
        ‹
      </button>
      <div className="text-center">
        <div className="text-sm font-semibold text-on-surface">
          {formatDisplayDate(date)}
        </div>
        {isToday(date) && (
          <div className="text-xs text-primary">Today</div>
        )}
      </div>
      <button
        aria-label="Next day"
        onClick={() => onChange(addDays(date, 1))}
        className="rounded-lg p-2 text-on-surface-muted active:bg-surface-container transition-colors"
      >
        ›
      </button>
    </div>
  );
}
