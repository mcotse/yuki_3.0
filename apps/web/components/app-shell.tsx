import { BottomTabs } from "./bottom-tabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-svh max-w-md bg-surface pb-20">
      <main className="px-4 pt-4">{children}</main>
      <BottomTabs />
    </div>
  );
}
