export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-testid="skeleton-block"
      className={`animate-pulse rounded-lg bg-surface-container ${className}`}
    />
  );
}
