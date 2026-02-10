"use client";

import { useState } from "react";

interface Schedule {
  _id: string;
  timeOfDay: "morning" | "midday" | "evening" | "night";
  scheduledHour: number;
  scheduledMinute: number;
  daysOfWeek?: number[];
}

interface NewSchedule {
  timeOfDay: "morning" | "midday" | "evening" | "night";
  scheduledHour: number;
  scheduledMinute: number;
  daysOfWeek?: number[];
}

interface ScheduleBuilderProps {
  schedules: Schedule[];
  onAdd: (schedule: NewSchedule) => void;
  onRemove: (scheduleId: string) => void;
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

const TIME_OF_DAY_DEFAULTS: Record<string, { hour: number; minute: number }> = {
  morning: { hour: 8, minute: 0 },
  midday: { hour: 12, minute: 0 },
  evening: { hour: 20, minute: 0 },
  night: { hour: 22, minute: 0 },
};

export function ScheduleBuilder({
  schedules,
  onAdd,
  onRemove,
}: ScheduleBuilderProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTimeOfDay, setNewTimeOfDay] = useState<NewSchedule["timeOfDay"]>("morning");
  const [newHour, setNewHour] = useState(8);
  const [newMinute, setNewMinute] = useState(0);

  const handleAdd = () => {
    const clampedHour = Math.max(0, Math.min(23, newHour));
    const clampedMinute = Math.max(0, Math.min(59, newMinute));
    onAdd({
      timeOfDay: newTimeOfDay,
      scheduledHour: clampedHour,
      scheduledMinute: clampedMinute,
    });
    setShowAdd(false);
  };

  const handleTimeOfDayChange = (tod: NewSchedule["timeOfDay"]) => {
    setNewTimeOfDay(tod);
    const defaults = TIME_OF_DAY_DEFAULTS[tod];
    setNewHour(defaults.hour);
    setNewMinute(defaults.minute);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wider text-on-surface-muted">
        Schedules
      </h4>

      {schedules.map((s) => (
        <div
          key={s._id}
          className="flex items-center justify-between rounded-lg bg-surface-container p-2"
        >
          <div className="text-sm text-on-surface">
            <span className="capitalize">{s.timeOfDay}</span>
            {" \u00B7 "}
            <span>{formatTime(s.scheduledHour, s.scheduledMinute)}</span>
          </div>
          <button
            aria-label="Remove schedule"
            onClick={() => onRemove(s._id)}
            className="rounded p-1 text-xs text-on-surface-muted active:bg-surface-dim"
          >
            {"\u2715"}
          </button>
        </div>
      ))}

      {showAdd ? (
        <div className="space-y-2 rounded-lg border border-surface-container p-3">
          <select
            value={newTimeOfDay}
            onChange={(e) =>
              handleTimeOfDayChange(e.target.value as NewSchedule["timeOfDay"])
            }
            className="w-full rounded-lg border border-surface-container bg-surface-dim p-2 text-sm text-on-surface"
          >
            <option value="morning">Morning</option>
            <option value="midday">Midday</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={23}
              value={newHour}
              onChange={(e) => setNewHour(Number(e.target.value))}
              placeholder="Hour"
              className="w-20 rounded-lg border border-surface-container bg-surface-dim p-2 text-sm"
            />
            <span className="self-center text-on-surface-muted">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={newMinute}
              onChange={(e) => setNewMinute(Number(e.target.value))}
              placeholder="Min"
              className="w-20 rounded-lg border border-surface-container bg-surface-dim p-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 rounded-lg border border-surface-container px-3 py-2 text-xs text-on-surface-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          aria-label="Add schedule"
          className="w-full rounded-lg border border-dashed border-surface-container p-2 text-xs text-on-surface-muted active:bg-surface-dim"
        >
          + Add Schedule
        </button>
      )}
    </div>
  );
}
