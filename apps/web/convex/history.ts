import { v } from "convex/values";
import { query } from "./_generated/server";

interface AuditEntry {
  action: string;
  userName: string;
  performedAt: number;
  notes?: string;
}

interface HistoryInstance {
  _id: string;
  itemId?: string;
  petId: string;
  date: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  confirmedAt?: number;
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  auditTrail: AuditEntry[];
}

export const getForDate = query({
  args: {
    date: v.string(),
    typeFilter: v.optional(
      v.union(
        v.literal("eye_drop"),
        v.literal("oral"),
        v.literal("supplement"),
        v.literal("topical"),
        v.literal("observation")
      )
    ),
  },
  handler: async (ctx, { date, typeFilter }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const rawInstances = await ctx.db
      .query("dailyInstances")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    const instances: HistoryInstance[] = await Promise.all(
      rawInstances.map(async (inst) => {
        const item = inst.itemId ? await ctx.db.get(inst.itemId) : null;

        const historyEntries = await ctx.db
          .query("confirmationHistory")
          .withIndex("by_instance", (q) => q.eq("instanceId", inst._id))
          .collect();

        const auditTrail: AuditEntry[] = await Promise.all(
          historyEntries.map(async (h) => {
            const user = await ctx.db.get(h.performedBy);
            return {
              action: h.action,
              userName: user?.name ?? "Unknown",
              performedAt: h.performedAt,
              notes: h.notes,
            };
          })
        );

        return {
          _id: inst._id as unknown as string,
          itemId: inst.itemId as unknown as string,
          petId: inst.petId as unknown as string,
          date: inst.date,
          scheduledHour: inst.scheduledHour,
          scheduledMinute: inst.scheduledMinute,
          status: inst.status,
          confirmedAt: inst.confirmedAt,
          isObservation: inst.isObservation,
          observationCategory: inst.observationCategory,
          observationText: inst.observationText,
          itemName: item?.name ?? "Unknown",
          itemDose: item?.dose ?? "",
          itemType: item?.type ?? "oral",
          auditTrail,
        };
      })
    );

    instances.sort((a, b) => {
      const aMin = a.scheduledHour * 60 + a.scheduledMinute;
      const bMin = b.scheduledHour * 60 + b.scheduledMinute;
      return aMin - bMin;
    });

    const filtered = typeFilter
      ? instances.filter((i) => {
          if (typeFilter === "observation") return i.isObservation;
          return !i.isObservation && i.itemType === typeFilter;
        })
      : instances;

    return { instances: filtered };
  },
});
