import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

// Helper to verify admin role
async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user || user.role !== "admin") throw new Error("Admin access required");

  return user;
}

export const listItems = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    await requireAdmin(ctx);

    const items = await ctx.db
      .query("items")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();

    const itemsWithSchedules = await Promise.all(
      items.map(async (item) => {
        const schedules = await ctx.db
          .query("itemSchedules")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect();

        return {
          ...item,
          schedules,
        };
      })
    );

    return itemsWithSchedules;
  },
});

export const getPet = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const pet = await ctx.db.query("pets").first();
    if (!pet) return null;

    return pet;
  },
});

export const addItem = mutation({
  args: {
    petId: v.id("pets"),
    name: v.string(),
    dose: v.string(),
    type: v.union(
      v.literal("eye_drop"),
      v.literal("oral"),
      v.literal("supplement"),
      v.literal("topical")
    ),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    conflictGroup: v.optional(v.string()),
    schedules: v.array(
      v.object({
        timeOfDay: v.union(
          v.literal("morning"),
          v.literal("midday"),
          v.literal("evening"),
          v.literal("night")
        ),
        scheduledHour: v.number(),
        scheduledMinute: v.number(),
        daysOfWeek: v.optional(v.array(v.number())),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const itemId = await ctx.db.insert("items", {
      petId: args.petId,
      name: args.name,
      dose: args.dose,
      type: args.type,
      location: args.location,
      notes: args.notes,
      conflictGroup: args.conflictGroup,
      isActive: true,
    });

    for (const schedule of args.schedules) {
      await ctx.db.insert("itemSchedules", {
        itemId,
        timeOfDay: schedule.timeOfDay,
        scheduledHour: schedule.scheduledHour,
        scheduledMinute: schedule.scheduledMinute,
        daysOfWeek: schedule.daysOfWeek,
      });
    }

    return itemId;
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    name: v.optional(v.string()),
    dose: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("eye_drop"),
        v.literal("oral"),
        v.literal("supplement"),
        v.literal("topical")
      )
    ),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    conflictGroup: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, ...updates }) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    const patch: Record<string, any> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.dose !== undefined) patch.dose = updates.dose;
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.location !== undefined) patch.location = updates.location;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.conflictGroup !== undefined)
      patch.conflictGroup = updates.conflictGroup;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(itemId, patch);
    }
  },
});

export const deactivateItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");
    await ctx.db.patch(itemId, { isActive: false });
  },
});

export const activateItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");
    await ctx.db.patch(itemId, { isActive: true });
  },
});

export const addSchedule = mutation({
  args: {
    itemId: v.id("items"),
    timeOfDay: v.union(
      v.literal("morning"),
      v.literal("midday"),
      v.literal("evening"),
      v.literal("night")
    ),
    scheduledHour: v.number(),
    scheduledMinute: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    return await ctx.db.insert("itemSchedules", {
      itemId: args.itemId,
      timeOfDay: args.timeOfDay,
      scheduledHour: args.scheduledHour,
      scheduledMinute: args.scheduledMinute,
      daysOfWeek: args.daysOfWeek,
    });
  },
});

export const removeSchedule = mutation({
  args: { scheduleId: v.id("itemSchedules") },
  handler: async (ctx, { scheduleId }) => {
    await requireAdmin(ctx);

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    await ctx.db.delete(scheduleId);
  },
});
