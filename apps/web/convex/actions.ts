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

    await ctx.db.patch(instanceId, {
      status: "pending",
      confirmedBy: undefined,
      confirmedAt: undefined,
    });

    await ctx.db.insert("confirmationHistory", {
      instanceId,
      action: "unconfirmed",
      performedBy: user._id,
      performedAt: Date.now(),
    });
  },
});
