"use client";

import { useEffect } from "react";

interface UndoToastProps {
  itemName: string;
  onUndo: () => void;
  onDismiss: () => void;
}

const DISMISS_MS = 5000;

export function UndoToast({ itemName, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md">
      <div className="flex items-center justify-between rounded-xl bg-on-surface px-4 py-3 text-surface shadow-lg">
        <span className="text-sm">{itemName} confirmed</span>
        <button
          onClick={onUndo}
          className="ml-4 text-sm font-semibold text-primary-light"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
