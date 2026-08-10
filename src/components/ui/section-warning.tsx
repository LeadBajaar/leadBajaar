import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionWarningProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

const SectionWarning = React.forwardRef<HTMLDivElement, SectionWarningProps>(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-[var(--crm-amber-soft)] border border-[var(--crm-amber-border)] rounded-[var(--r-lg)] p-4 flex gap-3 text-[var(--crm-amber)]", className)}
      {...props}
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        {title && <h4 className="font-semibold text-sm">{title}</h4>}
        <div className="text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  )
)
SectionWarning.displayName = "SectionWarning"

export { SectionWarning }
