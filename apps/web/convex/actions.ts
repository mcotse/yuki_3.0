import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const confirm = mutation({
  args: {
    instanceId: v.id("dailyInstances"),
    notes: v.string(),
  },
  handler: async (ctx, { instanceId, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const instance = await ctx.db.get(instanceId);
    if (!instance) throw new Error("Instance not found");
    if (instance.status === "confirmed") {
      throw new Error("Instance already confirmed");
    }

    const now = Date.now();

    await ctx.db.patch(instanceId, {
      status: "confirmed",
      confirmedBy: user._id,
      confirmedAt: now,
    });

    await ctx.db.insert("confirmationHistory", {
      instanceId,
      action: "confirmed",
      performedBy: user._id,
      performedAt: now,
      notes: notes || undefined,
    });
  },
});

export const snooze = mutation({
  args: {
    instanceId: v.id("dailyInstances"),
    durationMinutes: v.number(),
  },
  handler: async (ctx, { instanceId, durationMinutes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const instance = await ctx.db.get(instanceId);
    if (!instance) throw new Error("Instance not found");
    if (instance.status === "confirmed") {
      throw new Error("Cannot snooze a confirmed instance");
    }

    const now = Date.now();
    const snoozedUntil = now + durationMinutes * 60 * 1000;

    await ctx.db.patch(instanceId, {
      status: "snoozed",
      snoozedUntil,
    });

    await ctx.db.insert("confirmationHistory", {
      instanceId,
      action: "snoozed",
      performedBy: user._id,
      performedAt: now,
      notes: `Snoozed for ${durationMinutes} minutes`,
    });
  },
});

export const undo = mutation({
  args: {
    instanceId: v.id("dailyInstances"),
  },
  handler: async (ctx, { instanceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const instance = await ctx.db.get(instanceId);
    if (!instance) throw new Error("Instance not found");
    if (instance.status === "pending") {
      throw new Error("Instance is already pending");
    }

    await ctx.db.patch(instanceId, {
      status: "pending",
      confirmedBy: undefined,
      confirmedAt: undefined,
      snoozedUntil: undefined,
    });

    await ctx.db.insert("confirmationHistory", {
      instanceId,
      action: "unconfirmed",
      performedBy: user._id,
      performedAt: Date.now(),
    });
  },
});

export const addObservation = mutation({
  args: {
    petId: v.id("pets"),
    category: v.union(
      v.literal("symptom"),
      v.literal("snack"),
      v.literal("behavior"),
      v.literal("note")
    ),
    text: v.string(),
  },
  handler: async (ctx, { petId, category, text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const dy = String(now.getDate()).padStart(2, "0");
    const date = `${y}-${mo}-${dy}`;
    const scheduledHour = now.getHours();
    const scheduledMinute = now.getMinutes();

    await ctx.db.insert("dailyInstances", {
      petId,
      date,
      scheduledHour,
      scheduledMinute,
      status: "confirmed",
      confirmedBy: user._id,
      confirmedAt: now.getTime(),
      isObservation: true,
      observationCategory: category,
      observationText: text,
    });
  },
});
