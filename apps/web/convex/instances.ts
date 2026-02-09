import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, query } from "./_generated/server";

export async function generateDailyInstancesHandler(
  ctx: MutationCtx,
  date: string,
) {
  // Check if instances already exist for this date
  const existing = await ctx.db
    .query("dailyInstances")
    .withIndex("by_date", (q) => q.eq("date", date))
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
  itemId: string;
  scheduleId: string;
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
}

export const getToday = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const rawInstances = await ctx.db
      .query("dailyInstances")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    // Enrich with item details
    const instances: EnrichedInstance[] = await Promise.all(
      rawInstances.map(async (inst) => {
        const item = await ctx.db.get(inst.itemId);
        return {
          _id: inst._id as unknown as string,
          itemId: inst.itemId as unknown as string,
          scheduleId: inst.scheduleId as unknown as string,
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

    // Compute progress
    const done = instances.filter((i) => i.status === "confirmed").length;
    const total = instances.filter((i) => !i.isObservation).length;

    // Compute hero item: first pending instance that is due or overdue
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const heroItem =
      instances.find(
        (i) =>
          i.status === "pending" &&
          !i.isObservation &&
          i.scheduledHour * 60 + i.scheduledMinute <= currentMinutes
      ) ??
      instances.find((i) => i.status === "pending" && !i.isObservation) ??
      null;

    return {
      instances,
      heroItem,
      progress: { done, total },
    };
  },
});
