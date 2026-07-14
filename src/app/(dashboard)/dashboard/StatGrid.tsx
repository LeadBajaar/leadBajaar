"use client";

import Link from "next/link";
import { Users, CalendarCheck2, Target, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SkeletonCard } from "@/components/state";

export interface DashboardStat {
  label: string;
  value: string | number;
  key: string;
  trend?: "up" | "down";
  change?: string;
  /** Whether an "up" trend is good for this metric — e.g. up is bad for avg. response time. */
  upIsGood?: boolean;
}

const STAT_META: Record<string, { icon: React.ElementType; href: string; fallbackLabel: string }> = {
  leads: { icon: Users, href: "/leads", fallbackLabel: "Total Leads" },
  meetings: { icon: CalendarCheck2, href: "/meetings", fallbackLabel: "Meetings" },
  conversion: { icon: Target, href: "/analytics", fallbackLabel: "Conversion Rate" },
  response: { icon: Zap, href: "/analytics", fallbackLabel: "Avg. Response" },
};

function metaFor(key: string) {
  return STAT_META[key] ?? { icon: Zap, href: "/analytics", fallbackLabel: "Metric" };
}

interface StatGridProps {
  isLoading: boolean;
  stats: DashboardStat[];
}

export function StatGrid({ isLoading, stats }: StatGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300" role="status" aria-label="Loading stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const { icon: Icon, href, fallbackLabel } = metaFor(s.key);
        const upIsGood = s.upIsGood ?? true;
        const isPositive = s.trend === "up" ? upIsGood : !upIsGood;
        return (
          <Link
            key={s.key}
            href={href}
            className={cn(
              "group flex flex-col gap-2 rounded-[var(--r-lg)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-card p-4 min-h-[116px]",
              "transition-all duration-200 hover:shadow-card-md hover:border-[var(--crm-border-hover)] hover:-translate-y-px",
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-accent)]"
            )}
          >
            {/* Label + icon */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--crm-text-secondary)] leading-tight pt-1">
                {s.label || fallbackLabel}
              </span>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--r-md)] bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                aria-hidden="true"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </div>

            {/* Value */}
            <span className="text-[26px] font-semibold tracking-[-0.01em] tabular-nums text-[var(--crm-text-primary)] leading-none">
              {s.value}
            </span>

            {/* Change badge */}
            {s.change && (
              <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                <span
                  className={cn(
                    "inline-flex items-center text-[10px] font-semibold px-2 py-[3px] rounded-full tabular-nums",
                    isPositive ? "bg-success-bg text-success" : "bg-destructive-bg text-destructive"
                  )}
                >
                  {s.trend === "up" ? (
                    <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                  )}
                  {s.change}
                </span>
                <span className="text-[10px] text-[var(--crm-text-tertiary)]">vs last month</span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
