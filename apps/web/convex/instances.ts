import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, query } from "./_generated/server";

export async function generateDailyInstancesHandler(
  ctx: MutationCtx,
  date: string,
) {
  // Check if scheduled instances already exist for this date (ignore observations)
  const existing = await ctx.db
    .query("dailyInstances")
    .withIndex("by_date", (q) => q.eq("date", date))
    .filter((q) => q.eq(q.field("isObservation"), false))
    .first();

  if (existing) return;

  // Get all active items with their schedules
  const items = await ctx.db
    .query("items")
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();

  for (const item of items) {
    const schedules = await ctx.db
      .query("itemSchedules")
      .withIndex("by_item", (q) => q.eq("itemId", item._id))
      .collect();

    for (const schedule of schedules) {
      await ctx.db.insert("dailyInstances", {
        itemId: item._id,
        scheduleId: schedule._id,
        petId: item.petId,
        date,
        scheduledHour: schedule.scheduledHour,
        scheduledMinute: schedule.scheduledMinute,
        status: "pending",
        isObservation: false,
      });
    }
  }
}

export const generateDailyInstances = internalMutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => generateDailyInstancesHandler(ctx, date),
});

// Enriched instance type for the client
interface EnrichedInstance {
  _id: string;
  itemId?: string;
  scheduleId?: string;
  petId: string;
  date: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  confirmedBy?: string;
  confirmedAt?: number;
  snoozedUntil?: number;
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  notes?: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  itemLocation?: string;
  conflictGroup?: string;
  conflictWarning?: string;
}

export const getToday = query({
  args: {
    date: v.string(),
    now: v.optional(v.number()),
  },
  handler: async (ctx, { date, now: clientNow }) => {
    const now = clientNow ?? Date.now();

    const rawInstances = await ctx.db
      .query("dailyInstances")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    // Enrich with item details
    const instances: EnrichedInstance[] = await Promise.all(
      rawInstances.map(async (inst) => {
        const item = inst.itemId ? await ctx.db.get(inst.itemId) : null;
        return {
          _id: inst._id as unknown as string,
          itemId: inst.itemId as unknown as string | undefined,
          scheduleId: inst.scheduleId as unknown as string | undefined,
          petId: inst.petId as unknown as string,
          date: inst.date,
          scheduledHour: inst.scheduledHour,
          scheduledMinute: inst.scheduledMinute,
          status: inst.status,
          confirmedBy: inst.confirmedBy as unknown as string | undefined,
          confirmedAt: inst.confirmedAt,
          snoozedUntil: inst.snoozedUntil,
          isObservation: inst.isObservation,
          observationCategory: inst.observationCategory,
          observationText: inst.observationText,
          notes: inst.notes,
          itemName: item?.name ?? "Unknown",
          itemDose: item?.dose ?? "",
          itemType: item?.type ?? "oral",
          itemLocation: item?.location,
          conflictGroup: item?.conflictGroup,
        };
      })
    );

    // Sort by scheduled time
    instances.sort((a, b) => {
      const aMin = a.scheduledHour * 60 + a.scheduledMinute;
      const bMin = b.scheduledHour * 60 + b.scheduledMinute;
      return aMin - bMin;
    });

    // Add conflict warnings
    const CONFLICT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
    for (const inst of instances) {
      if (inst.status !== "pending" && !(inst.status === "snoozed" && inst.snoozedUntil && inst.snoozedUntil < now)) {
        continue;
      }
      if (!inst.conflictGroup) continue;

      const recentConflict = instances.find(
        (other) =>
          other._id !== inst._id &&
          other.conflictGroup === inst.conflictGroup &&
          other.status === "confirmed" &&
          other.confirmedAt &&
          now - other.confirmedAt < CONFLICT_WINDOW_MS
      );

      if (recentConflict) {
        inst.conflictWarning = `Wait 5 min after ${recentConflict.itemName}`;
      }
    }

    // Compute progress
    const done = instances.filter((i) => i.status === "confirmed" && !i.isObservation).length;
    const total = instances.filter((i) => !i.isObservation).length;

    // Hero item: first pending or expired-snoozed instance that is due/overdue
    const currentDate = new Date(now);
    const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

    const isHeroEligible = (i: EnrichedInstance) =>
      !i.isObservation &&
      (i.status === "pending" ||
        (i.status === "snoozed" && i.snoozedUntil !== undefined && i.snoozedUntil < now));

    const heroItem =
      instances.find(
        (i) =>
          isHeroEligible(i) &&
          i.scheduledHour * 60 + i.scheduledMinute <= currentMinutes
      ) ??
      instances.find((i) => isHeroEligible(i)) ??
      null;

    return {
      instances,
      heroItem,
      progress: { done, total },
    };
  },
});
