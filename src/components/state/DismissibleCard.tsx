import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const STORAGE_PREFIX = "lb_dismissed_"

function readDismissed(id: string): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + id) === "1"
  } catch {
    return false
  }
}

function writeDismissed(id: string) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + id, "1")
  } catch {
    // localStorage unavailable (private mode, quota) — dismissal just won't persist.
  }
}

export interface DismissibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique key this dismissal is remembered under (`lb_dismissed_<id>` in localStorage). */
  id: string
  /** When false, dismissal is session-only (not written to localStorage). Defaults to true. */
  persist?: boolean
  onDismiss?: () => void
  dismissLabel?: string
}

/**
 * A card the user can permanently dismiss (persisted to localStorage, scoped
 * by `id`). Used for setup nudges, promos, and one-time announcements — never
 * for anything the user needs to see again (that belongs in a notification
 * center, not a dismiss-and-forget card).
 */
export const DismissibleCard = React.forwardRef<HTMLDivElement, DismissibleCardProps>(
  ({ id, persist = true, onDismiss, dismissLabel = "Dismiss", className, children, ...props }, ref) => {
    const [dismissed, setDismissed] = React.useState(() => (persist ? readDismissed(id) : false))
    const [isCollapsing, setIsCollapsing] = React.useState(false)
    const prefersReducedMotion = usePrefersReducedMotion()

    const handleDismiss = React.useCallback(() => {
      if (persist) writeDismissed(id)
      onDismiss?.()
      if (prefersReducedMotion) {
        setDismissed(true)
        return
      }
      setIsCollapsing(true)
      window.setTimeout(() => setDismissed(true), 200)
    }, [id, persist, onDismiss, prefersReducedMotion])

    if (dismissed) return null

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center gap-3 rounded-[var(--r-sm)] border border-[var(--crm-border-hover)] shadow-sm",
          "bg-[var(--crm-surface-2)]/70 backdrop-blur-xl px-4 py-3 transition-[opacity,transform,height] duration-200 ease-out",
          "motion-reduce:transition-none",
          isCollapsing && "opacity-0 -translate-y-1",
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">{children}</div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={dismissLabel}
          className={cn(
            "flex items-center justify-center h-6 w-6 shrink-0 rounded-[var(--r-sm)] text-[var(--crm-text-tertiary)]",
            "hover:bg-[var(--crm-surface-3)] hover:text-[var(--crm-text-secondary)] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-accent)]"
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }
)
DismissibleCard.displayName = "DismissibleCard"

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])
  return reduced
}
