import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "../_generated/api";
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

async function createUser(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId: "clerk_123",
      name: "Matthew",
      email: "matt@example.com",
      role: "admin",
      lastSeenAt: Date.now(),
    });
  });
}

describe("presence", () => {
  describe("heartbeat", () => {
    it("creates a presence record on first heartbeat", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.presence.heartbeat, {});

      const records = await t.run(async (ctx) => {
        return await ctx.db.query("presence").collect();
      });

      expect(records).toHaveLength(1);
      expect(records[0].isOnline).toBe(true);
      expect(records[0].lastHeartbeat).toBeDefined();
    });

    it("updates existing presence record on subsequent heartbeat", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.presence.heartbeat, {});
      await asUser.mutation(api.presence.heartbeat, {});

      const records = await t.run(async (ctx) => {
        return await ctx.db.query("presence").collect();
      });

      expect(records).toHaveLength(1);
    });
  });

  describe("getOnlineUsers", () => {
    it("returns online users with their names", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.presence.heartbeat, {});

      const result = await asUser.query(api.presence.getOnlineUsers, {});

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Matthew");
      expect(result[0].isOnline).toBe(true);
    });
  });

  describe("goOffline", () => {
    it("marks user as offline", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.presence.heartbeat, {});
      await asUser.mutation(api.presence.goOffline, {});

      const records = await t.run(async (ctx) => {
        return await ctx.db.query("presence").collect();
      });

      expect(records[0].isOnline).toBe(false);
    });
  });
});
