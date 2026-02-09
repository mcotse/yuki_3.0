import { mutation, query } from "./_generated/server";

const STALE_THRESHOLD_MS = 60 * 1000; // 60 seconds

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const now = Date.now();

    // Upsert presence record
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastHeartbeat: now,
        isOnline: true,
      });
    } else {
      await ctx.db.insert("presence", {
        userId: user._id,
        lastHeartbeat: now,
        isOnline: true,
      });
    }

    // Mark stale users as offline
    const allPresence = await ctx.db.query("presence").collect();
    for (const p of allPresence) {
      if (p._id !== existing?._id && p.isOnline && now - p.lastHeartbeat > STALE_THRESHOLD_MS) {
        await ctx.db.patch(p._id, { isOnline: false });
      }
    }
  },
});

export const goOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { isOnline: false });
    }
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allPresence = await ctx.db.query("presence").collect();

    const onlineUsers = await Promise.all(
      allPresence
        .filter((p) => p.isOnline)
        .map(async (p) => {
          const user = await ctx.db.get(p.userId);
          return {
            userId: p.userId as unknown as string,
            name: user?.name ?? "Unknown",
            avatarUrl: user?.avatarUrl,
            isOnline: p.isOnline,
          };
        })
    );

    return onlineUsers;
  },
});
