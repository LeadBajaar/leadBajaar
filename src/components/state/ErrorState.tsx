import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const errorStateVariants = cva("flex flex-col items-center text-center mx-auto gap-3", {
  variants: {
    variant: {
      // Sits inside an existing card/section — compact, no heavy framing.
      inline: "max-w-[320px] py-6",
      // Replaces an entire page/region — more breathing room.
      page: "max-w-[360px] py-14",
    },
  },
  defaultVariants: { variant: "inline" },
})

export interface ErrorStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof errorStateVariants> {
  title?: string
  description?: string
  /** Called on retry click. May be async — the button shows an inline spinner while it resolves. */
  onRetry?: () => void | Promise<void>
  retryLabel?: string
  supportHref?: string
  supportLabel?: string
  /** If a previous successful fetch exists, show when it was — e.g. "Showing data from 10:42 AM". */
  lastUpdated?: Date | string
}

/**
 * Generic error state. Never fabricates data to paper over a failed fetch —
 * pair with a stale-data-dim pattern at the call site if a cached value should
 * stay visible instead of being replaced by this component.
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = "We couldn't load this",
      description = "Something went wrong on our end. Please try again.",
      onRetry,
      retryLabel = "Try again",
      supportHref,
      supportLabel = "Contact support",
      lastUpdated,
      variant,
      className,
      ...props
    },
    ref
  ) => {
    const [isRetrying, setIsRetrying] = React.useState(false)
    const [retryCount, setRetryCount] = React.useState(0)

    const handleRetry = React.useCallback(async () => {
      if (!onRetry || isRetrying) return
      setIsRetrying(true)
      try {
        await onRetry()
        setRetryCount(0)
      } catch {
        setRetryCount((c) => c + 1)
      } finally {
        setIsRetrying(false)
      }
    }, [onRetry, isRetrying])

    const lastUpdatedLabel = React.useMemo(() => {
      if (!lastUpdated) return null
      const date = typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated
      if (Number.isNaN(date.getTime())) return null
      return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    }, [lastUpdated])

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(errorStateVariants({ variant }), className)}
        {...props}
      >
        <div
          className="flex items-center justify-center h-11 w-11 rounded-full bg-[var(--crm-amber-soft)] text-[var(--crm-amber)]"
          aria-hidden="true"
        >
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-medium text-[var(--crm-text-primary)]">{title}</p>
          <p className="text-[12px] leading-relaxed text-[var(--crm-text-secondary)]">
            {description}
            {retryCount > 1 && supportHref
              ? " If this keeps happening, support can help."
              : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying}>
              <RefreshCw
                className={cn("h-3.5 w-3.5", isRetrying && "animate-spin motion-reduce:animate-none")}
              />
              <span aria-live="polite">{isRetrying ? "Retrying…" : retryLabel}</span>
            </Button>
          ) : null}
          {supportHref ? (
            <Button variant="ghost" size="sm" asChild>
              <a href={supportHref}>{supportLabel}</a>
            </Button>
          ) : null}
        </div>
        {lastUpdatedLabel ? (
          <p className="text-[11px] text-[var(--crm-text-tertiary)]">
            Showing data from {lastUpdatedLabel}
          </p>
        ) : null}
      </div>
    )
  }
)
ErrorState.displayName = "ErrorState"
