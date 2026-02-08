interface ProgressRingProps {
  done: number;
  total: number;
}

export function ProgressRing({ done, total }: ProgressRingProps) {
  const percentage = total === 0 ? 0 : done / total;
  const isComplete = done === total && total > 0;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);

  return (
    <div className="flex items-center gap-3">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-surface-container"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={isComplete ? "text-success" : "text-primary"}
        />
      </svg>
      <span className="text-sm font-medium text-on-surface">
        {isComplete ? "All done!" : `${done} / ${total}`}
      </span>
    </div>
  );
}
