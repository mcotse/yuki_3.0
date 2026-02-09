interface OnlineUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}

interface PresenceIndicatorProps {
  users: OnlineUser[];
}

export function PresenceIndicator({ users }: PresenceIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span
        data-testid="presence-dot"
        className="inline-block h-2 w-2 rounded-full bg-success"
      />
      <span className="text-xs text-on-surface-muted">
        {users.map((u) => u.name).join(", ")}
      </span>
    </div>
  );
}
