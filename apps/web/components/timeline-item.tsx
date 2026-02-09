"use client";

import { useState } from "react";
import { StatusPill } from "./status-pill";
import { formatTime } from "@/lib/format-time";

export interface TimelineInstance {
  _id: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  conflictWarning?: string;
  itemLocation?: string;
}

interface TimelineItemProps {
  instance: TimelineInstance;
  isUpcoming?: boolean;
  onConfirm: (instanceId: string) => void;
  onSnooze: (instanceId: string, durationMinutes: number) => void;
}

const SNOOZE_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
] as const;

export function TimelineItem({
  instance,
  isUpcoming,
  onConfirm,
  onSnooze,
}: TimelineItemProps) {
  const [showSnooze, setShowSnooze] = useState(false);
  const isPending = instance.status === "pending";
  const isSnoozed = instance.status === "snoozed";
  const canAct = isPending || isSnoozed;

  if (instance.isObservation) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-surface-dim p-3">
        <div className="mt-0.5 text-xs text-on-surface-muted">
          {formatTime(instance.scheduledHour, instance.scheduledMinute)}
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium uppercase text-on-surface-muted">
            {instance.observationCategory ?? "Note"}
          </div>
          <p className="text-sm text-on-surface">
            {instance.observationText}
          </p>
        </div>
        <StatusPill status={instance.status} />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-dim p-3">
      <div className="mt-0.5 text-xs text-on-surface-muted">
        {formatTime(instance.scheduledHour, instance.scheduledMinute)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface truncate">
            {instance.itemName}
          </span>
          <StatusPill
            status={instance.status}
            isUpcoming={isUpcoming}
          />
        </div>
        <p className="text-xs text-on-surface-muted">{instance.itemDose}</p>

        {instance.conflictWarning && (
          <p className="mt-1 text-xs text-warning">{instance.conflictWarning}</p>
        )}

        {showSnooze && (
          <div className="mt-2 flex gap-2">
            {SNOOZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSnooze(instance._id, opt.value);
                  setShowSnooze(false);
                }}
                className="rounded-lg bg-surface-container px-2 py-1 text-xs text-on-surface-muted active:scale-[0.97] transition-transform"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {canAct && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSnooze(!showSnooze)}
            aria-label="Snooze"
            className="rounded-lg p-2 text-xs text-on-surface-muted active:bg-surface-container transition-colors"
          >
            ⏰
          </button>
          <button
            onClick={() => onConfirm(instance._id)}
            aria-label="Confirm"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white active:scale-[0.97] transition-transform"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
