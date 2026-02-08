import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { internal } from "../_generated/api";
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

describe("seed", () => {
  it("creates a pet, items, and schedules", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.seed.seedDemoData, {});

    const pets = await t.run(async (ctx) => {
      return await ctx.db.query("pets").collect();
    });
    expect(pets).toHaveLength(1);
    expect(pets[0].name).toBe("Yuki");

    const items = await t.run(async (ctx) => {
      return await ctx.db.query("items").collect();
    });
    expect(items.length).toBeGreaterThanOrEqual(3);

    const schedules = await t.run(async (ctx) => {
      return await ctx.db.query("itemSchedules").collect();
    });
    expect(schedules.length).toBeGreaterThanOrEqual(3);
  });

  it("is idempotent — does not duplicate on second run", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.seed.seedDemoData, {});
    await t.mutation(internal.seed.seedDemoData, {});

    const pets = await t.run(async (ctx) => {
      return await ctx.db.query("pets").collect();
    });
    expect(pets).toHaveLength(1);
  });
});
