"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { MedicationList } from "@/components/medication-list";
import { MedicationForm } from "@/components/medication-form";
import { ScheduleBuilder } from "@/components/schedule-builder";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import type { Id } from "@/convex/_generated/dataModel";

type ItemType = "eye_drop" | "oral" | "supplement" | "topical";

interface FormValues {
  name: string;
  dose: string;
  type: ItemType;
  location?: string;
  notes?: string;
  conflictGroup?: string;
}

export default function AdminPage() {
  const { isAdmin, isLoading: userLoading } = useCurrentUser();
  const pet = useQuery(api.admin.getPet);
  const items = useQuery(
    api.admin.listItems,
    pet ? { petId: pet._id } : "skip"
  );
  const addItemMutation = useMutation(api.admin.addItem);
  const updateItemMutation = useMutation(api.admin.updateItem);
  const deactivateMutation = useMutation(api.admin.deactivateItem);
  const activateMutation = useMutation(api.admin.activateItem);
  const addScheduleMutation = useMutation(api.admin.addSchedule);
  const removeScheduleMutation = useMutation(api.admin.removeSchedule);

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editingItemId, setEditingItemId] = useState<Id<"items"> | null>(null);

  const handleAdd = useCallback(
    async (values: FormValues) => {
      if (!pet) return;
      try {
        await addItemMutation({
          petId: pet._id,
          name: values.name,
          dose: values.dose,
          type: values.type,
          location: values.location,
          notes: values.notes,
          conflictGroup: values.conflictGroup,
          schedules: [],
        });
        setView("list");
      } catch (error) {
        console.error("Failed to add item:", error);
      }
    },
    [addItemMutation, pet]
  );

  const handleUpdate = useCallback(
    async (values: FormValues) => {
      if (!editingItemId) return;
      try {
        await updateItemMutation({
          itemId: editingItemId,
          name: values.name,
          dose: values.dose,
          type: values.type,
          location: values.location,
          notes: values.notes,
          conflictGroup: values.conflictGroup,
        });
        setView("list");
        setEditingItemId(null);
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    },
    [updateItemMutation, editingItemId]
  );

  const handleToggleActive = useCallback(
    async (itemId: string, activate: boolean) => {
      try {
        if (activate) {
          await activateMutation({ itemId: itemId as Id<"items"> });
        } else {
          await deactivateMutation({ itemId: itemId as Id<"items"> });
        }
      } catch (error) {
        console.error("Failed to toggle item active state:", error);
      }
    },
    [activateMutation, deactivateMutation]
  );

  const handleEdit = useCallback((itemId: string) => {
    setEditingItemId(itemId as Id<"items">);
    setView("edit");
  }, []);

  const handleAddSchedule = useCallback(
    async (schedule: {
      timeOfDay: "morning" | "midday" | "evening" | "night";
      scheduledHour: number;
      scheduledMinute: number;
    }) => {
      if (!editingItemId) return;
      try {
        await addScheduleMutation({
          itemId: editingItemId,
          ...schedule,
        });
      } catch (error) {
        console.error("Failed to add schedule:", error);
      }
    },
    [addScheduleMutation, editingItemId]
  );

  const handleRemoveSchedule = useCallback(
    async (scheduleId: string) => {
      try {
        await removeScheduleMutation({
          scheduleId: scheduleId as Id<"itemSchedules">,
        });
      } catch (error) {
        console.error("Failed to remove schedule:", error);
      }
    },
    [removeScheduleMutation]
  );

  if (userLoading) return <DashboardSkeleton />;

  if (!isAdmin) {
    return (
      <div className="rounded-xl bg-surface-dim p-4 text-center text-sm text-on-surface-muted">
        Admin access required.
      </div>
    );
  }

  if (!pet) return (
    <div className="p-4 text-center text-on-surface-muted">
      No pets configured. Please add a pet first.
    </div>
  );
  if (!items) return <DashboardSkeleton />;

  const editingItem = editingItemId
    ? items.find((i) => i._id === editingItemId)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Medications</h1>
        {view === "list" && (
          <button
            onClick={() => setView("add")}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white active:scale-[0.97] transition-transform"
          >
            + Add
          </button>
        )}
      </div>

      {view === "list" && (
        <MedicationList
          items={items}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />
      )}

      {view === "add" && (
        <MedicationForm
          onSubmit={handleAdd}
          onCancel={() => setView("list")}
        />
      )}

      {view === "edit" && editingItem && (
        <div className="space-y-4">
          <MedicationForm
            initialValues={{
              name: editingItem.name,
              dose: editingItem.dose,
              type: editingItem.type as ItemType,
              location: editingItem.location,
              notes: editingItem.notes,
              conflictGroup: editingItem.conflictGroup,
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setView("list");
              setEditingItemId(null);
            }}
          />

          <ScheduleBuilder
            schedules={editingItem.schedules}
            onAdd={handleAddSchedule}
            onRemove={handleRemoveSchedule}
          />
        </div>
      )}
    </div>
  );
}
