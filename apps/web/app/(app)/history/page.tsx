"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DatePicker } from "@/components/date-picker";
import { FilterChips } from "@/components/filter-chips";
import { HistoryList } from "@/components/history-list";
import type { FilterValue } from "@/components/filter-chips";
import { getTodayString } from "@/lib/date-utils";

export default function HistoryPage() {
  const [date, setDate] = useState(getTodayString);
  const [typeFilter, setTypeFilter] = useState<FilterValue>(null);

  const data = useQuery(api.history.getForDate, {
    date,
    typeFilter: typeFilter ?? undefined,
  });

  const isLoading = data === undefined;

  return (
    <div className="space-y-4">
      <DatePicker date={date} onChange={setDate} />

      <FilterChips selected={typeFilter} onSelect={setTypeFilter} />

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-32 rounded bg-surface-dim" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-16 rounded-full bg-surface-dim" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-dim" />
          ))}
        </div>
      ) : (
        <HistoryList instances={data.instances} />
      )}
    </div>
  );
}
