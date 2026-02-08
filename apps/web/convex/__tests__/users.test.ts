import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import * as users from "../users";
import * as generatedApi from "../_generated/api";
import * as generatedServer from "../_generated/server";

const modules = {
  "convex/users.ts": () => Promise.resolve(users),
  "convex/_generated/api.ts": () => Promise.resolve(generatedApi),
  "convex/_generated/server.ts": () => Promise.resolve(generatedServer),
};

describe("users", () => {
  describe("getOrCreate", () => {
    it("creates a new user when none exists", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const userId = await asUser.mutation(api.users.getOrCreate, {});

      expect(userId).toBeDefined();

      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });

      expect(user).toMatchObject({
        clerkId: "clerk_123",
        name: "Matthew",
        role: "admin", // first user is admin
      });
    });

    it("returns existing user on second call", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      const firstId = await asUser.mutation(api.users.getOrCreate, {});
      const secondId = await asUser.mutation(api.users.getOrCreate, {});

      expect(firstId).toEqual(secondId);
    });

    it("second user gets caretaker role", async () => {
      const t = convexTest(schema, modules);

      const asAdmin = t.withIdentity({
        subject: "clerk_admin",
        name: "Admin",
        email: "admin@example.com",
      });

      const asCaretaker = t.withIdentity({
        subject: "clerk_caretaker",
        name: "Caretaker",
        email: "caretaker@example.com",
      });

      await asAdmin.mutation(api.users.getOrCreate, {});
      const caretakerId = await asCaretaker.mutation(api.users.getOrCreate, {});

      const caretaker = await t.run(async (ctx) => {
        return await ctx.db.get(caretakerId);
      });

      expect(caretaker?.role).toBe("caretaker");
    });

    it("throws when not authenticated", async () => {
      const t = convexTest(schema, modules);

      await expect(
        t.mutation(api.users.getOrCreate, {})
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("current", () => {
    it("returns null when not authenticated", async () => {
      const t = convexTest(schema, modules);
      const result = await t.query(api.users.current, {});
      expect(result).toBeNull();
    });

    it("returns user when authenticated", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      });

      await asUser.mutation(api.users.getOrCreate, {});

      const user = await asUser.query(api.users.current, {});
      expect(user).toMatchObject({
        clerkId: "clerk_123",
        name: "Matthew",
      });
    });
  });
});
