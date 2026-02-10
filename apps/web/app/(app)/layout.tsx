import { AppShell } from "@/components/app-shell";

export const dynamic =
  process.env.STATIC_EXPORT === "true" ? "force-static" : "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
