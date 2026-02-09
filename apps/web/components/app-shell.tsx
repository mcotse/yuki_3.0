import { BottomTabs } from "./bottom-tabs";
import { UserSync } from "./user-sync";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-svh max-w-md bg-surface pb-20">
      <UserSync />
      <main className="px-4 pt-4">{children}</main>
      <BottomTabs />
    </div>
  );
}
