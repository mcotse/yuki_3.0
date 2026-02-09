import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import * as users from "../users";
import * as seed from "../seed";
import * as instances from "../instances";
import * as actions from "../actions";
import * as presence from "../presence";
import * as history from "../history";
import * as generatedApi from "../_generated/api";
import * as generatedServer from "../_generated/server";

const modules = {
  "convex/users.ts": () => Promise.resolve(users),
  "convex/seed.ts": () => Promise.resolve(seed),
  "convex/instances.ts": () => Promise.resolve(instances),
  "convex/actions.ts": () => Promise.resolve(actions),
  "convex/presence.ts": () => Promise.resolve(presence),
  "convex/history.ts": () => Promise.resolve(history),
  "convex/_generated/api.ts": () => Promise.resolve(generatedApi),
  "convex/_generated/server.ts": () => Promise.resolve(generatedServer),
};

async function setupWithData(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
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
}

describe("history", () => {
  describe("getForDate", () => {
    it("returns all instances for a given date with item details", async () => {
      const t = convexTest(schema, modules);
      await setupWithData(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const result = await asUser.query(api.history.getForDate, {
        date: "2026-02-07",
      });

      expect(result.instances.length).toBeGreaterThan(0);
      expect(result.instances[0].itemName).toBeDefined();
    });

    it("includes audit trail for each instance", async () => {
      const t = convexTest(schema, modules);
      await setupWithData(t);

      // Confirm an instance to create audit history
      const allInstances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.actions.confirm, {
        instanceId: allInstances[0]._id,
        notes: "Given with breakfast",
      });

      const result = await asUser.query(api.history.getForDate, {
        date: "2026-02-07",
      });

      const confirmed = result.instances.find(
        (i: any) => i._id === (allInstances[0]._id as unknown as string)
      );
      expect(confirmed?.auditTrail).toHaveLength(1);
      expect(confirmed?.auditTrail[0].action).toBe("confirmed");
      expect(confirmed?.auditTrail[0].userName).toBe("Matthew");
    });

    it("filters by medication type when specified", async () => {
      const t = convexTest(schema, modules);
      await setupWithData(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const result = await asUser.query(api.history.getForDate, {
        date: "2026-02-07",
        typeFilter: "oral",
      });

      expect(result.instances.length).toBeGreaterThan(0);
      expect(
        result.instances.every((i: any) => i.itemType === "oral")
      ).toBe(true);
    });

    it("returns empty array for date with no instances", async () => {
      const t = convexTest(schema, modules);
      await setupWithData(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const result = await asUser.query(api.history.getForDate, {
        date: "2025-01-01",
      });

      expect(result.instances).toHaveLength(0);
    });
  });
});
