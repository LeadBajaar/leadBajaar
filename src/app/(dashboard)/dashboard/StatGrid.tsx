"use client";

import Link from "next/link";
import { Users, CalendarCheck2, Target, Zap, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

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
  compact?: boolean;
}

export function StatGrid({ isLoading, stats, compact }: StatGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4 animate-in fade-in duration-300", compact ? "grid-cols-4" : "grid-cols-2 lg:grid-cols-4")} role="status" aria-label="Loading stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full", compact ? "flex-row justify-end gap-4 flex-wrap xl:flex-nowrap" : "lg:flex-row mb-8")}>
      {stats.map((s, idx) => {
        const { icon: Icon, href, fallbackLabel } = metaFor(s.key);
        const upIsGood = s.upIsGood ?? true;
        const isNeutral = !s.change || s.change === "0%" || s.change === "+0%" || s.change === "-0%" || s.change.includes("0.0%") || s.change === "0.0%";
        const isPositive = !isNeutral && (s.trend === "up" ? upIsGood : !upIsGood);
        
        if (compact) {
          let badgeBg = "bg-slate-50 text-slate-500 border-slate-100";
          let ArrowIcon = ArrowRight;
          
          if (!isNeutral) {
            if (isPositive) {
              badgeBg = "bg-green-50 text-green-700 border-green-100";
              ArrowIcon = s.trend === "up" ? ArrowUpRight : ArrowDownRight;
            } else {
              badgeBg = "bg-red-50 text-red-700 border-red-100";
              ArrowIcon = s.trend === "up" ? ArrowUpRight : ArrowDownRight;
            }
          }

          return (
            <Link 
              key={s.key} 
              href={href} 
              className="flex-1 min-w-[145px] max-w-[180px] flex flex-col justify-between h-[92px] bg-white border border-gray-200/80 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-3.5 group transition-all hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
            >
              {/* Top Row: Label and Badge */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[12px] font-bold text-slate-500 tracking-tight leading-none group-hover:text-slate-700 transition-colors">
                  {s.label || fallbackLabel}
                </span>
                {s.change && (
                  <span
                    className={cn(
                      "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] border tabular-nums leading-none",
                      badgeBg
                    )}
                  >
                    <ArrowIcon className="h-2.5 w-2.5 mr-0.5 shrink-0" strokeWidth={3} aria-hidden="true" />
                    {s.change}
                  </span>
                )}
              </div>
              
              {/* Bottom Row: Value and vs text */}
              <div className="flex flex-col items-start mt-2">
                <span className="text-[24px] font-extrabold tracking-tight text-slate-900 leading-none satoshi-heading">
                  {s.value}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1.5 leading-none">
                  vs last 7 days
                </span>
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={s.key}
            href={href}
            className={cn(
              "group relative flex-1 flex flex-col justify-between py-2 px-6 transition-all h-[100px]",
              idx !== stats.length - 1 && "border-b lg:border-b-0 lg:border-r border-slate-200/60"
            )}
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {s.label || fallbackLabel}
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition-transform group-hover:scale-105">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <span className="text-[32px] font-bold tracking-tight text-slate-900 leading-none satoshi-heading">
                {s.value}
              </span>

              {s.change && (
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-sm tabular-nums",
                      isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {s.trend === "up" ? (
                      <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" strokeWidth={3} aria-hidden="true" />
                    )}
                    {s.change}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">vs last month</span>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
