"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const user = useQuery(api.users.current);

  return {
    user: user ?? null,
    isLoading: user === undefined,
    isAdmin: user?.role === "admin",
  };
}
