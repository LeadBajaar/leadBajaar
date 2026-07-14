import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
}

const emptyStateVariants = cva("flex flex-col items-center text-center mx-auto", {
  variants: {
    size: {
      sm: "max-w-[280px] py-6 gap-2",
      md: "max-w-[360px] py-10 gap-3",
      lg: "max-w-[420px] py-14 gap-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const iconWrapVariants = cva(
  "flex items-center justify-center rounded-full mb-1 text-[var(--crm-text-tertiary)] bg-[var(--crm-surface-3)]",
  {
    variants: {
      size: {
        sm: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const titleVariants = cva("font-medium text-[var(--crm-text-primary)]", {
  variants: {
    size: {
      sm: "text-[13px]",
      md: "text-[14px]",
      lg: "text-[16px]",
    },
  },
  defaultVariants: { size: "md" },
})

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /** Optional icon — pass a lucide-react icon component, not an element. */
  icon?: LucideIcon
  title: string
  description?: string
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
}

/**
 * Generic empty state — reusable across Leads, Inbox, Meetings, Integrations,
 * Dashboard, etc. Renders one icon, one message, and up to two actions.
 * Never render more than one primary CTA's worth of urgency; a second action
 * should read as a lesser/alternate path (e.g. "Learn more"), not a second
 * equally-weighted choice.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon: Icon, title, description, primaryAction, secondaryAction, size, className, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={cn(emptyStateVariants({ size }), className)} {...props}>
        {Icon ? (
          <div className={iconWrapVariants({ size })} aria-hidden="true">
            <Icon strokeWidth={1.75} />
          </div>
        ) : null}
        <p className={titleVariants({ size })}>{title}</p>
        {description ? (
          <p className="text-[12px] leading-relaxed text-[var(--crm-text-secondary)]">
            {description}
          </p>
        ) : null}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2 mt-1">
            {primaryAction ? (
              <Button
                size={size === "sm" ? "sm" : "default"}
                onClick={primaryAction.onClick}
                asChild={Boolean(primaryAction.href)}
              >
                {primaryAction.href ? (
                  <a href={primaryAction.href}>{primaryAction.label}</a>
                ) : (
                  primaryAction.label
                )}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button
                variant="ghost"
                size={size === "sm" ? "sm" : "default"}
                onClick={secondaryAction.onClick}
                asChild={Boolean(secondaryAction.href)}
              >
                {secondaryAction.href ? (
                  <a href={secondaryAction.href}>{secondaryAction.label}</a>
                ) : (
                  secondaryAction.label
                )}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"
