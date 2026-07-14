import * as React from "react"

import { cn } from "@/lib/utils"
import { SkeletonCard } from "./SkeletonCard"

function Block({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />
}

/**
 * Full-page skeleton at the exact geometry of the Honest Home working-mode
 * layout: Today Strip (3 columns), 4 stat cards, pipeline + activity row.
 * Deliberately simpler than the loaded state's internal detail — the point
 * is a stable shell that doesn't jump when content arrives, not a pixel-
 * perfect preview of every element.
 */
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="status" aria-label="Loading dashboard">
      {/* Today Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 rounded-[var(--r-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-2 px-0 sm:px-5",
              i > 0 && "sm:border-l sm:border-[var(--crm-border)]"
            )}
          >
            <Block className="h-[10px] w-24" />
            <Block className="h-5 w-10" />
            <Block className="h-2.5 w-32" />
          </div>
        ))}
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>

      {/* Pipeline + activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="flex flex-col gap-3 rounded-[var(--r-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-3 shadow-sm">
          <Block className="h-4 w-32" />
          <Block className="h-6 w-full" />
          <Block className="h-2.5 w-40" />
        </div>
        <SkeletonCard variant="activity" rows={4} />
      </div>
    </div>
  )
}
