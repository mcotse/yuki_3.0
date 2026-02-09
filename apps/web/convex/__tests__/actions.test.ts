import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import * as users from "../users";
import * as seed from "../seed";
import * as instances from "../instances";
import * as actions from "../actions";
import * as presence from "../presence";
import * as generatedApi from "../_generated/api";
import * as generatedServer from "../_generated/server";

const modules = {
  "convex/users.ts": () => Promise.resolve(users),
  "convex/seed.ts": () => Promise.resolve(seed),
  "convex/instances.ts": () => Promise.resolve(instances),
  "convex/actions.ts": () => Promise.resolve(actions),
  "convex/presence.ts": () => Promise.resolve(presence),
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

    it("should clear snoozedUntil when undoing a snoozed instance", async () => {
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

      // Snooze first
      await asUser.mutation(api.actions.snooze, {
        instanceId,
        durationMinutes: 15,
      });

      // Then undo
      await asUser.mutation(api.actions.undo, { instanceId });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(instanceId);
      });

      expect(updated?.status).toBe("pending");
      expect(updated?.snoozedUntil).toBeUndefined();
    });
  });

  describe("snooze", () => {
    it("marks an instance as snoozed with snoozedUntil", async () => {
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

      await asUser.mutation(api.actions.snooze, {
        instanceId,
        durationMinutes: 15,
      });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(instanceId);
      });

      expect(updated?.status).toBe("snoozed");
      expect(updated?.snoozedUntil).toBeDefined();
      expect(updated?.snoozedUntil).toBeGreaterThan(Date.now());
    });

    it("creates a snoozed history entry", async () => {
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

      await asUser.mutation(api.actions.snooze, {
        instanceId,
        durationMinutes: 30,
      });

      const history = await t.run(async (ctx) => {
        return await ctx.db
          .query("confirmationHistory")
          .withIndex("by_instance", (q) => q.eq("instanceId", instanceId))
          .collect();
      });

      expect(history).toHaveLength(1);
      expect(history[0].action).toBe("snoozed");
      expect(history[0].notes).toBe("Snoozed for 30 minutes");
    });

    it("rejects snooze on already confirmed instance", async () => {
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
        asUser.mutation(api.actions.snooze, {
          instanceId,
          durationMinutes: 15,
        })
      ).rejects.toThrow("Cannot snooze");
    });
  });

  describe("addObservation", () => {
    it("creates an observation instance that is immediately confirmed", async () => {
      const t = convexTest(schema, modules);
      const userId = await setupWithInstances(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.addObservation, {
        petId: (await t.run(async (ctx) => {
          const pet = await ctx.db.query("pets").first();
          return pet!._id;
        })) as any,
        category: "symptom",
        text: "Yuki sneezed twice after the walk",
      });

      const obs = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .filter((q) => q.eq(q.field("isObservation"), true))
          .collect();
      });

      expect(obs).toHaveLength(1);
      expect(obs[0].isObservation).toBe(true);
      expect(obs[0].observationCategory).toBe("symptom");
      expect(obs[0].observationText).toBe(
        "Yuki sneezed twice after the walk"
      );
      expect(obs[0].status).toBe("confirmed");
      expect(obs[0].confirmedBy).toEqual(userId);
    });

    it("uses current time for observation scheduling", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const petId = await t.run(async (ctx) => {
        const pet = await ctx.db.query("pets").first();
        return pet!._id;
      });

      await asUser.mutation(api.actions.addObservation, {
        petId: petId as any,
        category: "note",
        text: "Ate all her food",
      });

      const obs = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .filter((q) => q.eq(q.field("isObservation"), true))
          .first();
      });

      expect(obs?.scheduledHour).toBeDefined();
      expect(obs?.scheduledMinute).toBeDefined();
    });
  });
});
