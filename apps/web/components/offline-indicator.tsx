interface OfflineIndicatorProps {
  isOnline: boolean;
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) return null;

  return (
    <div className="bg-warning px-4 py-2 text-center text-xs font-medium text-white">
      You're offline — changes will sync when you reconnect
    </div>
  );
}
