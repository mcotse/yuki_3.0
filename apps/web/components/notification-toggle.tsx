"use client";

interface NotificationToggleProps {
  isSubscribed: boolean;
  isSupported: boolean;
  onToggle: () => void;
}

export function NotificationToggle({
  isSubscribed,
  isSupported,
  onToggle,
}: NotificationToggleProps) {
  if (!isSupported) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-surface-dim p-3">
        <div>
          <p className="text-sm font-medium text-on-surface">Notifications</p>
          <p className="text-xs text-on-surface-muted">
            Push notifications are not supported on this device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-dim p-3">
      <div>
        <p className="text-sm font-medium text-on-surface">Notifications</p>
        <p className="text-xs text-on-surface-muted">
          {isSubscribed
            ? "Push notifications enabled"
            : "Get notified when medications are due"}
        </p>
      </div>
      <button
        onClick={onToggle}
        role="button"
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          isSubscribed
            ? "bg-success/15 text-success"
            : "bg-primary text-white"
        }`}
      >
        {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
      </button>
    </div>
  );
}
