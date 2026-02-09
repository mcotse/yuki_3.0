"use client";

import { useEffect } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Ensures the authenticated Clerk user has a corresponding Convex user record.
 * Renders nothing — mount this once in the app shell.
 */
export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const getOrCreate = useMutation(api.users.getOrCreate);

  useEffect(() => {
    if (isAuthenticated) {
      getOrCreate().catch(() => {
        // Silently ignore — user may already exist
      });
    }
  }, [isAuthenticated, getOrCreate]);

  return null;
}
