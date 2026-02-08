"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function useToday() {
  const date = getTodayString();
  const data = useQuery(api.instances.getToday, { date });

  return {
    date,
    instances: data?.instances ?? [],
    heroItem: data?.heroItem ?? null,
    progress: data?.progress ?? { done: 0, total: 0 },
    isLoading: data === undefined,
  };
}
