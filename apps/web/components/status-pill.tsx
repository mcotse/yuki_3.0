interface StatusPillProps {
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  isUpcoming?: boolean;
}

const styles: Record<string, string> = {
  due: "bg-warning/15 text-warning",
  done: "bg-success/15 text-success",
  snoozed: "bg-primary/15 text-primary",
  skipped: "bg-on-surface-muted/15 text-on-surface-muted",
  upcoming: "bg-surface-container text-on-surface-muted",
};

export function StatusPill({
  status,
  isUpcoming,
}: StatusPillProps) {
  let label: string;
  let style: string;

  if (status === "confirmed") {
    label = "Done";
    style = styles.done;
  } else if (status === "snoozed") {
    label = "Snoozed";
    style = styles.snoozed;
  } else if (status === "skipped") {
    label = "Skipped";
    style = styles.skipped;
  } else if (isUpcoming) {
    label = "Upcoming";
    style = styles.upcoming;
  } else {
    label = "Due";
    style = styles.due;
  }

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
