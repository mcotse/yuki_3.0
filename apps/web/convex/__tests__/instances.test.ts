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
  });
});
