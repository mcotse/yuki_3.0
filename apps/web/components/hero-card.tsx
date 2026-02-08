"use client";

interface HeroItem {
  _id: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: string;
  itemLocation?: string;
}

interface HeroCardProps {
  item: HeroItem | null;
  onConfirm: (instanceId: string) => void;
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export function HeroCard({ item, onConfirm }: HeroCardProps) {
  if (!item) {
    return (
      <div className="rounded-2xl bg-success/10 p-6 text-center">
        <p className="text-lg font-semibold text-success">All clear!</p>
        <p className="mt-1 text-sm text-on-surface-muted">
          Nothing due right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-primary/5 p-6">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-on-surface-muted">
        Right Now
      </div>
      <h2 className="text-xl font-bold text-on-surface">{item.itemName}</h2>
      <p className="mt-0.5 text-sm text-on-surface-muted">{item.itemDose}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-muted">
        <span>{formatTime(item.scheduledHour, item.scheduledMinute)}</span>
        {item.itemLocation && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{item.itemLocation}</span>
          </>
        )}
      </div>
      <button
        onClick={() => onConfirm(item._id)}
        className="mt-4 w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white active:scale-[0.98] transition-transform"
      >
        Confirm
      </button>
    </div>
  );
}
