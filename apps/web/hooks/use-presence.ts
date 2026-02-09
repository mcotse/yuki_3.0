"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

const HEARTBEAT_INTERVAL_MS = 30_000;

export function usePresence() {
  const { isAuthenticated } = useConvexAuth();
  const heartbeat = useMutation(api.presence.heartbeat);
  const goOffline = useMutation(api.presence.goOffline);
  const onlineUsers = useQuery(
    api.presence.getOnlineUsers,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial heartbeat
    heartbeat();

    // Periodic heartbeat
    const interval = setInterval(() => {
      heartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    // Go offline on page close
    const handleBeforeUnload = () => {
      goOffline();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      goOffline();
    };
  }, [isAuthenticated, heartbeat, goOffline]);

  return {
    onlineUsers: onlineUsers ?? [],
  };
}
