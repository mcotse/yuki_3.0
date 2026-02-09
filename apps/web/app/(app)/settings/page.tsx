"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NotificationToggle } from "@/components/notification-toggle";
import { useNotifications } from "@/hooks/use-notifications";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: convexUser, isLoading: convexLoading } = useCurrentUser();
  const { isSubscribed, isSupported, toggle } = useNotifications();
  const { signOut } = useClerk();

  if (!clerkLoaded || convexLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-on-surface">Settings</h1>

      {/* Account Info */}
      <div className="rounded-xl bg-surface-dim p-4">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-on-surface-muted">
          Account
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {clerkUser?.imageUrl && (
              <img
                src={clerkUser.imageUrl}
                alt=""
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-on-surface">
                {clerkUser?.fullName ?? convexUser?.name ?? "Unknown"}
              </p>
              <p className="text-xs text-on-surface-muted">
                {clerkUser?.primaryEmailAddress?.emailAddress ??
                  convexUser?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-muted">
            <span>Role:</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary capitalize">
              {convexUser?.role ?? "caretaker"}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <NotificationToggle
        isSubscribed={isSubscribed}
        isSupported={isSupported}
        onToggle={toggle}
      />

      {/* App Info */}
      <div className="rounded-xl bg-surface-dim p-4">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-on-surface-muted">
          App
        </h2>
        <p className="text-xs text-on-surface-muted">Yuki 3.0</p>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="w-full rounded-xl border border-surface-container px-4 py-3 text-sm font-medium text-on-surface-muted active:bg-surface-dim transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
