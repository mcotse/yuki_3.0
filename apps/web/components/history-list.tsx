"use client";

import { useState } from "react";
import { StatusPill } from "./status-pill";
import { EntryDetail } from "./entry-detail";
import { formatTime } from "@/lib/format-time";

interface AuditEntry {
  action: string;
  userName: string;
  performedAt: number;
  notes?: string;
}

interface HistoryInstance {
  _id: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  confirmedAt?: number;
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  auditTrail: AuditEntry[];
}

interface HistoryListProps {
  instances: HistoryInstance[];
}

export function HistoryList({ instances }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (instances.length === 0) {
    return (
      <div className="rounded-xl bg-surface-dim p-4 text-center text-sm text-on-surface-muted">
        No records for this date.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {instances.map((inst) => {
        const isExpanded = expandedId === inst._id;

        return (
          <div key={inst._id} className="rounded-xl bg-surface-dim">
            <button
              onClick={() =>
                setExpandedId(isExpanded ? null : inst._id)
              }
              className="flex w-full items-start gap-3 p-3 text-left"
            >
              <div className="mt-0.5 text-xs text-on-surface-muted">
                {formatTime(inst.scheduledHour, inst.scheduledMinute)}
              </div>
              <div className="flex-1 min-w-0">
                {inst.isObservation ? (
                  <>
                    <span className="text-xs font-medium uppercase text-on-surface-muted">
                      {inst.observationCategory ?? "Note"}
                    </span>
                    <p className="text-sm text-on-surface">
                      {inst.observationText}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-on-surface">
                      {inst.itemName}
                    </span>
                    <p className="text-xs text-on-surface-muted">
                      {inst.itemDose}
                    </p>
                  </>
                )}
              </div>
              <StatusPill status={inst.status} />
            </button>

            {isExpanded && (
              <div className="border-t border-surface-container px-3 pb-3">
                <EntryDetail auditTrail={inst.auditTrail} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
