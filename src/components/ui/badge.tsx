import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--r-pill)] border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)]",
        secondary:
          "border-transparent bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)]",
        outline: "text-[var(--crm-text-primary)] border-[var(--crm-border)]",
        /* Semantic Variants */
        success: "border-[var(--crm-green-border)] bg-[var(--crm-green-soft)] text-[var(--crm-green)]",
        warning: "border-[var(--crm-amber-border)] bg-[var(--crm-amber-soft)] text-[var(--crm-amber)]",
        danger: "border-[var(--crm-red-border)] bg-[var(--crm-red-soft)] text-[var(--crm-red)]",
        /* Categorical Variants */
        blue: "border-[var(--crm-blue-border)] bg-[var(--crm-blue-soft)] text-[var(--crm-blue)]",
        purple: "border-[var(--crm-purple-border)] bg-[var(--crm-purple-soft)] text-[var(--crm-purple)]",
        neutral: "border-[var(--crm-border)] bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
