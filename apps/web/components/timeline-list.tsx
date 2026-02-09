"use client";

import { TimelineItem, type TimelineInstance } from "./timeline-item";

interface TimelineListProps {
  instances: TimelineInstance[];
  onConfirm: (instanceId: string) => void;
  onSnooze: (instanceId: string, durationMinutes: number) => void;
}

export function TimelineList({
  instances,
  onConfirm,
  onSnooze,
}: TimelineListProps) {
  if (instances.length === 0) {
    return (
      <div className="rounded-xl bg-surface-dim p-4 text-center text-sm text-on-surface-muted">
        No medications scheduled for today.
      </div>
    );
  }

  // Determine which items are upcoming (scheduled after current time)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-muted">
        Today's Schedule
      </h3>
      {instances.map((instance) => {
        const scheduledMinutes =
          instance.scheduledHour * 60 + instance.scheduledMinute;
        const isUpcoming =
          instance.status === "pending" && scheduledMinutes > currentMinutes;

        return (
          <TimelineItem
            key={instance._id}
            instance={instance}
            isUpcoming={isUpcoming}
            onConfirm={onConfirm}
            onSnooze={onSnooze}
          />
        );
      })}
    </div>
  );
}
