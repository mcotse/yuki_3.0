"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToday } from "@/hooks/use-today";
import { HeroCard } from "@/components/hero-card";
import { ProgressRing } from "@/components/progress-ring";
import { UndoToast } from "@/components/undo-toast";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardPage() {
  const { heroItem, progress, isLoading } = useToday();
  const confirmMutation = useMutation(api.actions.confirm);
  const undoMutation = useMutation(api.actions.undo);

  const [undoState, setUndoState] = useState<{
    instanceId: string;
    itemName: string;
  } | null>(null);

  const handleConfirm = useCallback(
    async (instanceId: string) => {
      const itemName = heroItem?.itemName ?? "Medication";
      await confirmMutation({
        instanceId: instanceId as Id<"dailyInstances">,
        notes: "",
      });
      setUndoState({ instanceId, itemName });
    },
    [confirmMutation, heroItem]
  );

  const handleUndo = useCallback(async () => {
    if (!undoState) return;
    await undoMutation({
      instanceId: undoState.instanceId as Id<"dailyInstances">,
    });
    setUndoState(null);
  }, [undoMutation, undoState]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <HeroCard item={heroItem} onConfirm={handleConfirm} />

      <ProgressRing done={progress.done} total={progress.total} />

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
