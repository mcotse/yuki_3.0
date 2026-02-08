import { Skeleton } from "./skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero card skeleton */}
      <Skeleton className="h-40 w-full" />
      {/* Progress ring skeleton */}
      <Skeleton className="mx-auto h-12 w-32" />
      {/* Timeline items skeleton */}
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
