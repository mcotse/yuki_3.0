import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import * as users from "../users";
import * as seed from "../seed";
import * as instances from "../instances";
import * as actions from "../actions";
import * as notifications from "../notifications";
import * as generatedApi from "../_generated/api";
import * as generatedServer from "../_generated/server";

const modules = {
  "convex/users.ts": () => Promise.resolve(users),
  "convex/seed.ts": () => Promise.resolve(seed),
  "convex/instances.ts": () => Promise.resolve(instances),
  "convex/actions.ts": () => Promise.resolve(actions),
  "convex/notifications.ts": () => Promise.resolve(notifications),
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

describe("notifications", () => {
  describe("subscribe", () => {
    it("stores a push subscription for the user", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.notifications.subscribe, {
        endpoint: "https://push.example.com/sub/123",
        p256dh: "test-p256dh-key",
        auth: "test-auth-key",
      });

      const subs = await t.run(async (ctx) => {
        return await ctx.db.query("pushSubscriptions").collect();
      });

      expect(subs).toHaveLength(1);
      expect(subs[0].endpoint).toBe("https://push.example.com/sub/123");
    });

    it("replaces existing subscription for same user", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.notifications.subscribe, {
        endpoint: "https://push.example.com/sub/old",
        p256dh: "old-key",
        auth: "old-auth",
      });

      await asUser.mutation(api.notifications.subscribe, {
        endpoint: "https://push.example.com/sub/new",
        p256dh: "new-key",
        auth: "new-auth",
      });

      const subs = await t.run(async (ctx) => {
        return await ctx.db.query("pushSubscriptions").collect();
      });

      expect(subs).toHaveLength(1);
      expect(subs[0].endpoint).toBe("https://push.example.com/sub/new");
    });
  });

  describe("unsubscribe", () => {
    it("removes the push subscription", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.notifications.subscribe, {
        endpoint: "https://push.example.com/sub/123",
        p256dh: "key",
        auth: "auth",
      });

      await asUser.mutation(api.notifications.unsubscribe, {});

      const subs = await t.run(async (ctx) => {
        return await ctx.db.query("pushSubscriptions").collect();
      });

      expect(subs).toHaveLength(0);
    });
  });

  describe("getSubscriptionStatus", () => {
    it("returns subscribed true when subscription exists", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.notifications.subscribe, {
        endpoint: "https://push.example.com/sub/123",
        p256dh: "key",
        auth: "auth",
      });

      const result = await asUser.query(
        api.notifications.getSubscriptionStatus,
        {}
      );
      expect(result.subscribed).toBe(true);
    });

    it("returns subscribed false when no subscription", async () => {
      const t = convexTest(schema, modules);
      await createUser(t);

      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const result = await asUser.query(
        api.notifications.getSubscriptionStatus,
        {}
      );
      expect(result.subscribed).toBe(false);
    });
  });
});
