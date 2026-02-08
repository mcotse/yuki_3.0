import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  offlineStore,
  type CachedInstance,
  type PendingMutation,
} from "../offline";

beforeEach(async () => {
  await offlineStore.clear();
});

describe("offlineStore", () => {
  describe("cacheInstances", () => {
    it("stores and retrieves today's instances", async () => {
      const instances: CachedInstance[] = [
        {
          _id: "inst_1" as any,
          itemId: "item_1" as any,
          scheduleId: "sched_1" as any,
          petId: "pet_1" as any,
          date: "2026-02-07",
          scheduledHour: 8,
          scheduledMinute: 0,
          status: "pending",
          isObservation: false,
          itemName: "Prednisolone",
          itemDose: "1 drop",
          itemType: "eye_drop",
        },
      ];

      await offlineStore.cacheInstances("2026-02-07", instances);
      const cached = await offlineStore.getCachedInstances("2026-02-07");

      expect(cached).toHaveLength(1);
      expect(cached[0].itemName).toBe("Prednisolone");
    });
  });

  describe("mutation queue", () => {
    it("queues a pending mutation", async () => {
      const mutation: PendingMutation = {
        id: "mut_1",
        type: "confirm",
        instanceId: "inst_1" as any,
        timestamp: Date.now(),
        args: { notes: "" },
      };

      await offlineStore.queueMutation(mutation);
      const pending = await offlineStore.getPendingMutations();

      expect(pending).toHaveLength(1);
      expect(pending[0].type).toBe("confirm");
    });

    it("removes a mutation after flush", async () => {
      const mutation: PendingMutation = {
        id: "mut_1",
        type: "confirm",
        instanceId: "inst_1" as any,
        timestamp: Date.now(),
        args: {},
      };

      await offlineStore.queueMutation(mutation);
      await offlineStore.removeMutation("mut_1");
      const pending = await offlineStore.getPendingMutations();

      expect(pending).toHaveLength(0);
    });
  });

  describe("isOnline", () => {
    it("defaults to true", () => {
      expect(offlineStore.isOnline()).toBe(true);
    });
  });
});
