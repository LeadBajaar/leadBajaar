import * as React from "react"
import { cn } from "@/lib/utils"

const SectionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("max-w-[640px] space-y-6", className)}
      {...props}
    />
  )
)
SectionContent.displayName = "SectionContent"

export { SectionContent }
