import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { generateDailyInstancesHandler } from "./instances";

export async function seedDemoDataHandler(ctx: MutationCtx) {
  // Idempotency: skip if pet already exists
  const existingPet = await ctx.db.query("pets").first();
  if (existingPet) return;

  // Create pet
  const petId = await ctx.db.insert("pets", {
    name: "Yuki",
    species: "dog",
    isActive: true,
  });

  // Create medications
  const prednisolone = await ctx.db.insert("items", {
    petId,
    name: "Prednisolone",
    dose: "1 drop, left eye",
    type: "eye_drop",
    location: "Fridge",
    conflictGroup: "eye_drops",
    isActive: true,
  });

  const cyclosporine = await ctx.db.insert("items", {
    petId,
    name: "Cyclosporine",
    dose: "1 drop, both eyes",
    type: "eye_drop",
    location: "Cabinet",
    conflictGroup: "eye_drops",
    isActive: true,
    notes: "Must wait 5 min after Prednisolone",
  });

  const galliprant = await ctx.db.insert("items", {
    petId,
    name: "Galliprant",
    dose: "20mg tablet",
    type: "oral",
    location: "Cabinet",
    isActive: true,
    notes: "Give with food",
  });

  const fishoil = await ctx.db.insert("items", {
    petId,
    name: "Fish Oil",
    dose: "1 pump",
    type: "supplement",
    location: "Cabinet",
    isActive: true,
  });

  // Create schedules
  // Prednisolone: morning and evening
  await ctx.db.insert("itemSchedules", {
    itemId: prednisolone,
    timeOfDay: "morning",
    scheduledHour: 8,
    scheduledMinute: 0,
  });
  await ctx.db.insert("itemSchedules", {
    itemId: prednisolone,
    timeOfDay: "evening",
    scheduledHour: 20,
    scheduledMinute: 0,
  });

  // Cyclosporine: morning and evening (5 min after prednisolone)
  await ctx.db.insert("itemSchedules", {
    itemId: cyclosporine,
    timeOfDay: "morning",
    scheduledHour: 8,
    scheduledMinute: 5,
  });
  await ctx.db.insert("itemSchedules", {
    itemId: cyclosporine,
    timeOfDay: "evening",
    scheduledHour: 20,
    scheduledMinute: 5,
  });

  // Galliprant: morning only
  await ctx.db.insert("itemSchedules", {
    itemId: galliprant,
    timeOfDay: "morning",
    scheduledHour: 8,
    scheduledMinute: 0,
  });

  // Fish oil: morning only
  await ctx.db.insert("itemSchedules", {
    itemId: fishoil,
    timeOfDay: "morning",
    scheduledHour: 8,
    scheduledMinute: 0,
  });
}

export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => seedDemoDataHandler(ctx),
});

/**
 * Internal seed mutation for E2E testing.
 * Seeds demo data + resets and regenerates today's instances.
 */
export const seedForTest = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    // Full reset: delete all instances, history, observations, schedules, items
    const instances = await ctx.db.query("dailyInstances").collect();
    for (const inst of instances) {
      const history = await ctx.db
        .query("confirmationHistory")
        .withIndex("by_instance", (q) => q.eq("instanceId", inst._id))
        .collect();
      for (const h of history) {
        await ctx.db.delete(h._id);
      }
      await ctx.db.delete(inst._id);
    }

    const schedules = await ctx.db.query("itemSchedules").collect();
    for (const sched of schedules) {
      await ctx.db.delete(sched._id);
    }

    const items = await ctx.db.query("items").collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    const pets = await ctx.db.query("pets").collect();
    for (const pet of pets) {
      await ctx.db.delete(pet._id);
    }

    // Re-seed fresh demo data
    await seedDemoDataHandler(ctx);

    // Generate fresh daily instances
    await generateDailyInstancesHandler(ctx, today);

    return { ok: true as const, date: today };
  },
});
