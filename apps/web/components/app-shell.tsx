"use client";

import { BottomTabs } from "./bottom-tabs";
import { UserSync } from "./user-sync";
import { PresenceIndicator } from "./presence-indicator";
import { OfflineIndicator } from "./offline-indicator";
import { usePresence } from "@/hooks/use-presence";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { onlineUsers } = usePresence();
  const isOnline = useOnlineStatus();

  return (
    <div className="mx-auto min-h-svh max-w-md bg-surface pb-20">
      <UserSync />
      <OfflineIndicator isOnline={isOnline} />
      <header className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-sm font-semibold text-on-surface">Yuki</span>
        <PresenceIndicator users={onlineUsers} />
      </header>
      <main className="px-4 pt-2">{children}</main>
      <BottomTabs />
    </div>
  );
}
