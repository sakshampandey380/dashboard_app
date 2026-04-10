import { Loader2 } from "lucide-react";
import { cn } from "../../units/helpers";

export const Loader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[200px] items-center justify-center">
    <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-slate-700 ${className}`} />
);

export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="card space-y-4 p-5">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="card space-y-4 p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-72 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className={cn(
          "grid gap-3",
          columns === 4 && "grid-cols-4",
          columns === 5 && "grid-cols-5",
          columns === 6 && "grid-cols-6",
          columns === 7 && "grid-cols-7",
          columns === 8 && "grid-cols-8"
        )}
      >
        {Array.from({ length: columns }).map((__, cellIndex) => (
          <Skeleton key={cellIndex} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    ))}
  </div>
);
