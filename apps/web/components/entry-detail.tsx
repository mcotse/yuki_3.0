interface AuditEntry {
  action: string;
  userName: string;
  performedAt: number;
  notes?: string;
}

interface EntryDetailProps {
  auditTrail: AuditEntry[];
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const actionLabels: Record<string, string> = {
  confirmed: "Confirmed",
  unconfirmed: "Undone",
  snoozed: "Snoozed",
  skipped: "Skipped",
};

export function EntryDetail({ auditTrail }: EntryDetailProps) {
  if (auditTrail.length === 0) {
    return (
      <p className="py-2 text-xs text-on-surface-muted">No actions recorded.</p>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {auditTrail.map((entry, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="text-on-surface-muted">
            {formatTimestamp(entry.performedAt)}
          </span>
          <div>
            <span className="font-medium text-on-surface">
              {actionLabels[entry.action] ?? entry.action}
            </span>
            <span className="text-on-surface-muted"> by {entry.userName}</span>
            {entry.notes && (
              <p className="mt-0.5 text-on-surface-muted">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
