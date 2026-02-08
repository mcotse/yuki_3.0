import { openDB, type IDBPDatabase } from "idb";

export interface CachedInstance {
  _id: string;
  itemId: string;
  scheduleId: string;
  petId: string;
  date: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  confirmedBy?: string;
  confirmedAt?: number;
  snoozedUntil?: number;
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  notes?: string;
  // Denormalized from items for offline display
  itemName: string;
  itemDose: string;
  itemType: string;
}

export interface PendingMutation {
  id: string;
  type: "confirm" | "undo" | "snooze";
  instanceId: string;
  timestamp: number;
  args: Record<string, unknown>;
}

interface YukiDB {
  instances: {
    key: string;
    value: { date: string; instances: CachedInstance[] };
  };
  mutations: {
    key: string;
    value: PendingMutation;
  };
}

const DB_NAME = "yuki-offline";
const DB_VERSION = 1;

function getDB(): Promise<IDBPDatabase<YukiDB>> {
  return openDB<YukiDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("instances")) {
        db.createObjectStore("instances", { keyPath: "date" });
      }
      if (!db.objectStoreNames.contains("mutations")) {
        db.createObjectStore("mutations", { keyPath: "id" });
      }
    },
  });
}

export const offlineStore = {
  async cacheInstances(date: string, instances: CachedInstance[]) {
    const db = await getDB();
    await db.put("instances", { date, instances });
  },

  async getCachedInstances(date: string): Promise<CachedInstance[]> {
    const db = await getDB();
    const record = await db.get("instances", date);
    return record?.instances ?? [];
  },

  async queueMutation(mutation: PendingMutation) {
    const db = await getDB();
    await db.put("mutations", mutation);
  },

  async getPendingMutations(): Promise<PendingMutation[]> {
    const db = await getDB();
    return await db.getAll("mutations");
  },

  async removeMutation(id: string) {
    const db = await getDB();
    await db.delete("mutations", id);
  },

  async clear() {
    const db = await getDB();
    await db.clear("instances");
    await db.clear("mutations");
  },

  isOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine ?? true;
  },
};
