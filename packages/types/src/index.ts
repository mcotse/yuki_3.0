// --- Enums as union types ---

export type MedicationType = "eye_drop" | "oral" | "supplement" | "topical";

export type InstanceStatus = "pending" | "confirmed" | "snoozed" | "skipped";

export type UserRole = "admin" | "caretaker";

export type ObservationCategory = "symptom" | "snack" | "behavior" | "note";

export type TimeOfDay = "morning" | "midday" | "evening" | "night";

// --- Shared display helpers ---

export const INSTANCE_STATUS_LABELS: Record<InstanceStatus, string> = {
  pending: "Due",
  confirmed: "Done",
  snoozed: "Snoozed",
  skipped: "Skipped",
};

export const MEDICATION_TYPE_LABELS: Record<MedicationType, string> = {
  eye_drop: "Eye Drop",
  oral: "Oral",
  supplement: "Supplement",
  topical: "Topical",
};
