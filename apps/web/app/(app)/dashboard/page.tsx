"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToday } from "@/hooks/use-today";
import { HeroCard } from "@/components/hero-card";
import { ProgressRing } from "@/components/progress-ring";
import { UndoToast } from "@/components/undo-toast";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { TimelineList } from "@/components/timeline-list";
import { ObservationFab } from "@/components/observation-fab";
import { ObservationSheet } from "@/components/observation-sheet";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardPage() {
  const { instances, heroItem, progress, isLoading } = useToday();
  const confirmMutation = useMutation(api.actions.confirm);
  const undoMutation = useMutation(api.actions.undo);
  const snoozeMutation = useMutation(api.actions.snooze);
  const addObservationMutation = useMutation(api.actions.addObservation);

  const [observationOpen, setObservationOpen] = useState(false);

  const petId = instances[0]?.petId;

  const handleObservationSubmit = useCallback(
    async (category: "symptom" | "snack" | "behavior" | "note", text: string) => {
      if (!petId) return;
      await addObservationMutation({
        petId: petId as Id<"pets">,
        category,
        text,
      });
    },
    [addObservationMutation, petId]
  );

  const [undoState, setUndoState] = useState<{
    instanceId: string;
    itemName: string;
  } | null>(null);

  const handleConfirm = useCallback(
    async (instanceId: string) => {
      const item =
        instances.find((i) => i._id === instanceId) ?? heroItem;
      const itemName = item?.itemName ?? "Medication";

      // Haptic feedback
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(50);
      }

      await confirmMutation({
        instanceId: instanceId as Id<"dailyInstances">,
        notes: "",
      });
      setUndoState({ instanceId, itemName });
    },
    [confirmMutation, instances, heroItem]
  );

  const handleUndo = useCallback(async () => {
    if (!undoState) return;
    await undoMutation({
      instanceId: undoState.instanceId as Id<"dailyInstances">,
    });
    setUndoState(null);
  }, [undoMutation, undoState]);

  const handleSnooze = useCallback(
    async (instanceId: string, durationMinutes: number) => {
      await snoozeMutation({
        instanceId: instanceId as Id<"dailyInstances">,
        durationMinutes,
      });
    },
    [snoozeMutation]
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <HeroCard item={heroItem} onConfirm={handleConfirm} />

      <ProgressRing done={progress.done} total={progress.total} />

      <TimelineList
        instances={instances}
        onConfirm={handleConfirm}
        onSnooze={handleSnooze}
      />

      <ObservationFab onClick={() => setObservationOpen(true)} />

      <ObservationSheet
        isOpen={observationOpen}
        onClose={() => setObservationOpen(false)}
        onSubmit={handleObservationSubmit}
      />

      {undoState && (
        <UndoToast
          itemName={undoState.itemName}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}
    </div>
  );
}
