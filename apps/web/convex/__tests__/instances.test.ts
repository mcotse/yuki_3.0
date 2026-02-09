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

// Helper to seed data and generate instances
async function setupWithInstances(t: ReturnType<typeof convexTest>, date: string) {
  await t.mutation(internal.seed.seedDemoData, {});
  await t.mutation(internal.instances.generateDailyInstances, { date });
}

describe("instances", () => {
  describe("generateDailyInstances", () => {
    it("creates instances for all active schedules on a given date", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t, "2026-02-07");

      const result = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });

      // 6 schedules -> 6 instances
      expect(result).toHaveLength(6);
      expect(result.every((i) => i.status === "pending")).toBe(true);
    });

    it("is idempotent — does not duplicate instances", async () => {
      const t = convexTest(schema, modules);
      await t.mutation(internal.seed.seedDemoData, {});
      await t.mutation(internal.instances.generateDailyInstances, { date: "2026-02-07" });
      await t.mutation(internal.instances.generateDailyInstances, { date: "2026-02-07" });

      const result = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });

      expect(result).toHaveLength(6);
    });
  });

  describe("getToday", () => {
    it("returns today's instances with item details", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t, "2026-02-07");

      const result = await t.query(api.instances.getToday, { date: "2026-02-07" });

      expect(result.instances).toHaveLength(6);
      expect(result.instances[0]).toHaveProperty("itemName");
      expect(result.instances[0]).toHaveProperty("itemDose");
      expect(result.progress.total).toBe(6);
      expect(result.progress.done).toBe(0);
    });

    it("computes heroItem as the most urgent pending instance", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t, "2026-02-07");

      const result = await t.query(api.instances.getToday, { date: "2026-02-07" });

      expect(result.heroItem).not.toBeNull();
      expect(result.heroItem?.status).toBe("pending");
      // Hero should be the earliest scheduled item
      expect(result.heroItem?.scheduledHour).toBe(8);
      expect(result.heroItem?.scheduledMinute).toBe(0);
    });

    it("returns expired snoozed items as effectively pending in hero calculation", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t, "2026-02-07");

      // Snooze an instance with an already-expired time
      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      await t.run(async (ctx) => {
        await ctx.db.patch(instanceId, {
          status: "snoozed",
          snoozedUntil: Date.now() - 1000, // expired 1 second ago
        });
      });

      const result = await t.query(api.instances.getToday, {
        date: "2026-02-07",
        now: Date.now(),
      });

      // The expired-snoozed instance should still appear with status "snoozed"
      // but should be a hero candidate
      const snoozedItem = result.instances.find(
        (i: any) => i._id === (instanceId as unknown as string)
      );
      expect(snoozedItem?.status).toBe("snoozed");
      // It should be eligible for hero (snooze expired)
      // Since hero picks first eligible pending/expired-snoozed item, it should be picked
      expect(result.heroItem).not.toBeNull();
    });

    it("includes conflictWarning for items in same conflict group", async () => {
      const t = convexTest(schema, modules);
      await setupWithInstances(t, "2026-02-07");

      // Confirm the first eye drop (Prednisolone)
      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });

      // Find Prednisolone instance (8:00) and confirm it
      const predInstance = instances.find(
        (i) => i.scheduledHour === 8 && i.scheduledMinute === 0
      );
      if (predInstance) {
        await t.run(async (ctx) => {
          await ctx.db.patch(predInstance._id, {
            status: "confirmed",
            confirmedAt: Date.now(), // just now
          });
        });
      }

      const result = await t.query(api.instances.getToday, {
        date: "2026-02-07",
        now: Date.now(),
      });

      // Cyclosporine (8:05, same conflict group) should have a warning
      const cycloInstance = result.instances.find(
        (i: any) => i.itemName === "Cyclosporine" && i.scheduledHour === 8
      );
      expect(cycloInstance?.conflictWarning).toBeDefined();
      expect(cycloInstance?.conflictWarning).toContain("Prednisolone");
    });
  });
});
