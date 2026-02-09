"use client";

import { useEffect, useRef } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Ensures the authenticated Clerk user has a corresponding Convex user record.
 * Renders nothing — mount this once in the app shell.
 */
export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const getOrCreate = useMutation(api.users.getOrCreate);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      getOrCreate().catch(() => {
        // Silently ignore — user may already exist
        hasSynced.current = false;
      });
    }
  }, [isAuthenticated, getOrCreate]);

  return null;
}
