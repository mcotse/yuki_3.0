import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import * as users from "../users";
import * as seed from "../seed";
import * as instances from "../instances";
import * as actions from "../actions";
import * as admin from "../admin";
import * as generatedApi from "../_generated/api";
import * as generatedServer from "../_generated/server";

const modules = {
  "convex/users.ts": () => Promise.resolve(users),
  "convex/seed.ts": () => Promise.resolve(seed),
  "convex/instances.ts": () => Promise.resolve(instances),
  "convex/actions.ts": () => Promise.resolve(actions),
  "convex/admin.ts": () => Promise.resolve(admin),
  "convex/_generated/api.ts": () => Promise.resolve(generatedApi),
  "convex/_generated/server.ts": () => Promise.resolve(generatedServer),
};

async function setupWithSeedData(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      clerkId: "clerk_admin",
      name: "Matthew",
      email: "matt@example.com",
      role: "admin",
      lastSeenAt: Date.now(),
    });
    await ctx.db.insert("users", {
      clerkId: "clerk_caretaker",
      name: "Sarah",
      email: "sarah@example.com",
      role: "caretaker",
      lastSeenAt: Date.now(),
    });
  });

  await t.mutation(internal.seed.seedDemoData, {});
}

describe("admin", () => {
  describe("listItems", () => {
    it("returns all items for a pet with their schedules", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const petId = await t.run(async (ctx) => {
        const pet = await ctx.db.query("pets").first();
        return pet!._id;
      });

      const result = await asAdmin.query(api.admin.listItems, {
        petId: petId as any,
      });

      expect(result.length).toBe(4);
      expect(result[0].name).toBeDefined();
      expect(result[0].schedules).toBeDefined();
      expect(result[0].schedules.length).toBeGreaterThan(0);
    });

    it("rejects non-admin users", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asCaretaker = t.withIdentity({
        subject: "clerk_caretaker",
        name: "Sarah",
        email: "sarah@example.com",
      });

      const petId = await t.run(async (ctx) => {
        const pet = await ctx.db.query("pets").first();
        return pet!._id;
      });

      await expect(
        asCaretaker.query(api.admin.listItems, { petId: petId as any })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("addItem", () => {
    it("creates a new item with schedules", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const petId = await t.run(async (ctx) => {
        const pet = await ctx.db.query("pets").first();
        return pet!._id;
      });

      await asAdmin.mutation(api.admin.addItem, {
        petId: petId as any,
        name: "Apoquel",
        dose: "16mg tablet",
        type: "oral",
        location: "Cabinet",
        notes: "Give with food",
        schedules: [
          { timeOfDay: "morning", scheduledHour: 8, scheduledMinute: 0 },
        ],
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db.query("items").collect();
      });

      const apoquel = items.find((i) => i.name === "Apoquel");
      expect(apoquel).toBeDefined();
      expect(apoquel!.dose).toBe("16mg tablet");
      expect(apoquel!.isActive).toBe(true);

      const schedules = await t.run(async (ctx) => {
        return await ctx.db
          .query("itemSchedules")
          .withIndex("by_item", (q) => q.eq("itemId", apoquel!._id))
          .collect();
      });
      expect(schedules).toHaveLength(1);
      expect(schedules[0].scheduledHour).toBe(8);
    });

    it("creates an item with conflictGroup", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const petId = await t.run(async (ctx) => {
        const pet = await ctx.db.query("pets").first();
        return pet!._id;
      });

      await asAdmin.mutation(api.admin.addItem, {
        petId: petId as any,
        name: "Cyclosporine Extra",
        dose: "1 drop",
        type: "eye_drop",
        conflictGroup: "eye_drops",
        schedules: [],
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db.query("items").collect();
      });

      const item = items.find((i) => i.name === "Cyclosporine Extra");
      expect(item).toBeDefined();
      expect(item!.conflictGroup).toBe("eye_drops");
    });

    it("rejects non-admin users", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asCaretaker = t.withIdentity({
        subject: "clerk_caretaker",
        name: "Sarah",
        email: "sarah@example.com",
      });

      const petId = await t.run(async (ctx) => {
        const pet = await ctx.db.query("pets").first();
        return pet!._id;
      });

      await expect(
        asCaretaker.mutation(api.admin.addItem, {
          petId: petId as any,
          name: "Apoquel",
          dose: "16mg",
          type: "oral",
          schedules: [],
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("updateItem", () => {
    it("updates item fields", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const itemId = await t.run(async (ctx) => {
        const item = await ctx.db.query("items").first();
        return item!._id;
      });

      await asAdmin.mutation(api.admin.updateItem, {
        itemId: itemId as any,
        name: "Prednisolone Updated",
        dose: "2 drops, left eye",
      });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(itemId);
      });

      expect(updated?.name).toBe("Prednisolone Updated");
      expect(updated?.dose).toBe("2 drops, left eye");
    });
  });

  describe("deactivateItem", () => {
    it("sets item isActive to false", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const itemId = await t.run(async (ctx) => {
        const item = await ctx.db.query("items").first();
        return item!._id;
      });

      await asAdmin.mutation(api.admin.deactivateItem, {
        itemId: itemId as any,
      });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(itemId);
      });

      expect(updated?.isActive).toBe(false);
    });

    it("can reactivate a deactivated item", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const itemId = await t.run(async (ctx) => {
        const item = await ctx.db.query("items").first();
        return item!._id;
      });

      await asAdmin.mutation(api.admin.deactivateItem, {
        itemId: itemId as any,
      });
      await asAdmin.mutation(api.admin.activateItem, {
        itemId: itemId as any,
      });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(itemId);
      });

      expect(updated?.isActive).toBe(true);
    });
  });

  describe("addSchedule", () => {
    it("adds a schedule to an existing item", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const itemId = await t.run(async (ctx) => {
        const item = await ctx.db
          .query("items")
          .filter((q) => q.eq(q.field("name"), "Galliprant"))
          .first();
        return item!._id;
      });

      await asAdmin.mutation(api.admin.addSchedule, {
        itemId: itemId as any,
        timeOfDay: "evening",
        scheduledHour: 20,
        scheduledMinute: 0,
      });

      const schedules = await t.run(async (ctx) => {
        return await ctx.db
          .query("itemSchedules")
          .withIndex("by_item", (q) => q.eq("itemId", itemId))
          .collect();
      });

      expect(schedules).toHaveLength(2); // morning + new evening
    });
  });

  describe("removeSchedule", () => {
    it("deletes a schedule", async () => {
      const t = convexTest(schema, modules);
      await setupWithSeedData(t);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Matthew",
        email: "matt@example.com",
      });

      const schedule = await t.run(async (ctx) => {
        return await ctx.db.query("itemSchedules").first();
      });

      await asAdmin.mutation(api.admin.removeSchedule, {
        scheduleId: schedule!._id as any,
      });

      const deleted = await t.run(async (ctx) => {
        return await ctx.db.get(schedule!._id);
      });

      expect(deleted).toBeNull();
    });
  });
});
