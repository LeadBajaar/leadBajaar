import * as React from "react"

import { cn } from "@/lib/utils"

/** Thin wrapper around the existing `.skeleton` CSS class (styles/globals.css) —
 * that class already carries the reduced-motion-safe pulse animation and the
 * correct surface color for both themes. This just adds layout sizing. */
function Block({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />
}

export type SkeletonCardVariant = "stat" | "list" | "table" | "activity" | "form"

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: SkeletonCardVariant
  /** Number of repeated rows for list/table/activity variants. Ignored by stat/form. */
  rows?: number
}

function StatSkeleton() {
  // Matches a stat-card shell: eyebrow label, big figure, caption.
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--r-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-3 h-[100px] shadow-sm">
      <Block className="h-[10px] w-16" />
      <Block className="h-6 w-20" />
      <Block className="h-[10px] w-24 mt-auto" />
    </div>
  )
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col rounded-[var(--r-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] overflow-hidden shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 h-14 border-b border-[var(--crm-border)] last:border-b-0"
        >
          <Block className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5 flex-1">
            {/* Varied widths on purpose — identical-width rows read as more obviously fake. */}
            <Block className={cn("h-3", i % 2 === 0 ? "w-1/3" : "w-1/2")} />
            <Block className="h-2.5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-[var(--r-sm)] border border-[var(--crm-border)] overflow-hidden shadow-sm">
      <div className="flex gap-4 px-4 h-10 items-center bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
        <Block className="h-2.5 w-20" />
        <Block className="h-2.5 w-28" />
        <Block className="h-2.5 w-16 ml-auto" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 h-12 items-center border-b border-[var(--crm-border)] last:border-b-0 bg-[var(--crm-surface-1)]"
        >
          <Block className="h-3 w-24" />
          <Block className="h-3 w-32" />
          <Block className="h-3 w-14 ml-auto" />
        </div>
      ))}
    </div>
  )
}

function ActivitySkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--r-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-3 shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 h-11">
          <Block className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Block className={cn("h-3", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
            <Block className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--r-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-4 shadow-sm">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Block className="h-2.5 w-20" />
          <Block className="h-9 w-full" />
        </div>
      ))}
      <div className="flex gap-2 justify-end pt-1">
        <Block className="h-8 w-16" />
        <Block className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * Loading placeholder matched to the final geometry of a real card, so the
 * skeleton → content swap never shifts layout. Pick the variant that matches
 * what will actually render, not a generic box.
 */
export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ variant, rows, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} role="status" aria-label="Loading" {...props}>
        {variant === "stat" && <StatSkeleton />}
        {variant === "list" && <ListSkeleton rows={rows} />}
        {variant === "table" && <TableSkeleton rows={rows} />}
        {variant === "activity" && <ActivitySkeleton rows={rows} />}
        {variant === "form" && <FormSkeleton />}
      </div>
    )
  }
)
SkeletonCard.displayName = "SkeletonCard"
