import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--r-pill)] border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow-sm hover:bg-primary/90",
        secondary:
          "border-transparent bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)] shadow-sm",
        destructive:
          "border-transparent bg-[var(--crm-red-soft)] text-red-500",
        outline: "text-[var(--crm-text-primary)] border-[var(--crm-border)]",
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
