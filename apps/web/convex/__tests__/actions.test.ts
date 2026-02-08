import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import * as users from "../users";
import * as seed from "../seed";
import * as instances from "../instances";
import * as actions from "../actions";
import * as generatedApi from "../_generated/api";
import * as generatedServer from "../_generated/server";

const modules = {
  "convex/users.ts": () => Promise.resolve(users),
  "convex/seed.ts": () => Promise.resolve(seed),
  "convex/instances.ts": () => Promise.resolve(instances),
  "convex/actions.ts": () => Promise.resolve(actions),
  "convex/_generated/api.ts": () => Promise.resolve(generatedApi),
  "convex/_generated/server.ts": () => Promise.resolve(generatedServer),
};

async function setupWithInstances(t: ReturnType<typeof convexTest>) {
  // Create a user
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId: "clerk_123",
      name: "Matthew",
      email: "matt@example.com",
      role: "admin",
      lastSeenAt: Date.now(),
    });
  });

  await t.mutation(internal.seed.seedDemoData, {});
  await t.mutation(internal.instances.generateDailyInstances, {
    date: "2026-02-07",
  });

  return userId;
}

describe("actions", () => {
  describe("confirm", () => {
    it("marks an instance as confirmed", async () => {
      const t = convexTest(schema, modules);
      const userId = await setupWithInstances(t);

      // Get first pending instance
      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.confirm, { instanceId, notes: "" });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(instanceId);
      });

      expect(updated?.status).toBe("confirmed");
      expect(updated?.confirmedBy).toEqual(userId);
      expect(updated?.confirmedAt).toBeDefined();
    });

    it("creates a confirmation history entry", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.confirm, {
        instanceId,
        notes: "Given with breakfast",
      });

      const history = await t.run(async (ctx) => {
        return await ctx.db
          .query("confirmationHistory")
          .withIndex("by_instance", (q) => q.eq("instanceId", instanceId))
          .collect();
      });

      expect(history).toHaveLength(1);
      expect(history[0].action).toBe("confirmed");
      expect(history[0].notes).toBe("Given with breakfast");
    });

    it("prevents double-confirm", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.confirm, { instanceId, notes: "" });

      await expect(
        asUser.mutation(api.actions.confirm, { instanceId, notes: "" })
      ).rejects.toThrow("already confirmed");
    });
  });

  describe("undo", () => {
    it("reverts a confirmed instance back to pending", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.confirm, { instanceId, notes: "" });
      await asUser.mutation(api.actions.undo, { instanceId });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(instanceId);
      });

      expect(updated?.status).toBe("pending");
      expect(updated?.confirmedBy).toBeUndefined();
    });

    it("creates an unconfirmed history entry", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.confirm, { instanceId, notes: "" });
      await asUser.mutation(api.actions.undo, { instanceId });

      const history = await t.run(async (ctx) => {
        return await ctx.db
          .query("confirmationHistory")
          .withIndex("by_instance", (q) => q.eq("instanceId", instanceId))
          .collect();
      });

      expect(history).toHaveLength(2);
      expect(history[1].action).toBe("unconfirmed");
    });
  });
});
