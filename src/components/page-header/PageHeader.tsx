import React from "react";
import { cn } from "@/lib/utils";
import { PageHeaderProps } from "./types";

export function PageHeader({
  title,
  description,
  icon,
  badge,
  breadcrumbs,
  actions,
  secondaryActions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col mb-6",
        className
      )}
    >
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            {icon && <div className="shrink-0">{icon}</div>}
            <h1 className="text-[28px] font-extrabold text-[var(--crm-text-primary)] tracking-tight satoshi-heading flex items-center gap-2 whitespace-nowrap leading-tight">
              <span className="truncate">{title}</span>
              {badge && <div className="shrink-0">{badge}</div>}
            </h1>
          </div>
          {description && (
            <p className="text-[13px] font-semibold text-slate-500">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex-1 w-full xl:w-auto xl:max-w-3xl flex items-center justify-start xl:justify-end gap-2">
            {actions}
          </div>
        )}
      </div>

      {secondaryActions && (
        <div className="flex items-center gap-2.5 w-full md:w-auto mt-4">
          {secondaryActions}
        </div>
      )}
    </div>
  );
}
