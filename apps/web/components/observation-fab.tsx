"use client";

interface ObservationFabProps {
  onClick: () => void;
}

export function ObservationFab({ onClick }: ObservationFabProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Add observation"
      className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl text-white shadow-lg active:scale-[0.95] transition-transform"
    >
      +
    </button>
  );
}
