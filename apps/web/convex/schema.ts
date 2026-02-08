import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users — synced from Clerk on first login
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("caretaker")),
    avatarUrl: v.optional(v.string()),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // Pets
  pets: defineTable({
    name: v.string(),
    species: v.string(),
    isActive: v.boolean(),
  }),

  // Medication items (the "what" — e.g., "Prednisolone eye drops")
  items: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    dose: v.string(),
    type: v.union(
      v.literal("eye_drop"),
      v.literal("oral"),
      v.literal("supplement"),
      v.literal("topical")
    ),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    conflictGroup: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_pet", ["petId"])
    .index("by_pet_active", ["petId", "isActive"]),

  // Schedules (the "when" — e.g., "8:00 AM and 8:00 PM")
  itemSchedules: defineTable({
    itemId: v.id("items"),
    timeOfDay: v.union(
      v.literal("morning"),
      v.literal("midday"),
      v.literal("evening"),
      v.literal("night")
    ),
    scheduledHour: v.number(),
    scheduledMinute: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
  })
    .index("by_item", ["itemId"]),

  // Daily instances (the "did it happen" — one per item per schedule per day)
  dailyInstances: defineTable({
    itemId: v.id("items"),
    scheduleId: v.id("itemSchedules"),
    petId: v.id("pets"),
    date: v.string(),
    scheduledHour: v.number(),
    scheduledMinute: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("snoozed"),
      v.literal("skipped")
    ),
    confirmedBy: v.optional(v.id("users")),
    confirmedAt: v.optional(v.number()),
    snoozedUntil: v.optional(v.number()),
    isObservation: v.boolean(),
    observationCategory: v.optional(
      v.union(
        v.literal("symptom"),
        v.literal("snack"),
        v.literal("behavior"),
        v.literal("note")
      )
    ),
    observationText: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_pet_date", ["petId", "date"])
    .index("by_item_date", ["itemId", "date"])
    .index("by_status_date", ["status", "date"]),

  // Confirmation history (audit trail)
  confirmationHistory: defineTable({
    instanceId: v.id("dailyInstances"),
    action: v.union(
      v.literal("confirmed"),
      v.literal("unconfirmed"),
      v.literal("snoozed"),
      v.literal("skipped")
    ),
    performedBy: v.id("users"),
    performedAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_instance", ["instanceId"])
    .index("by_performed_at", ["performedAt"]),

  // Presence heartbeats
  presence: defineTable({
    userId: v.id("users"),
    lastHeartbeat: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_user", ["userId"]),
});
