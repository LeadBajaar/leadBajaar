import { SkeletonCard } from "@/components/state/SkeletonCard"

function Block({ className }: { className?: string }) {
  return <div className={`skeleton ${className || ""}`} />
}

export default function DashboardLoading() {
  return (
    <div
      className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200"
      role="status"
      aria-label="Loading page content"
    >
      {/* Top Header & Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div className="flex flex-col gap-2">
          <Block className="h-7 w-48 rounded-lg" />
          <Block className="h-3.5 w-72 rounded" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Block className="h-9 w-28 rounded-lg hidden sm:block" />
          <Block className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Metric / Stat Strip Skeleton (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-1">
        {/* Primary Content Container (Table / List / Chart Placeholder) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <SkeletonCard variant="table" rows={6} />
        </div>

        {/* Secondary Aside Container (Activity / Pipeline / Info Placeholder) */}
        <div className="flex flex-col gap-3">
          <SkeletonCard variant="activity" rows={5} />
        </div>
      </div>
    </div>
  )
}
