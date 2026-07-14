"use client";

import * as LucideIcons from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/state";

export interface ActivityItem {
  label: string;
  sub: string;
  time: string;
  icon_name: string;
  color: string;
}

function getLucideIcon(name: string) {
  return (LucideIcons as any)[name] || LucideIcons.Zap;
}

// Backend-sourced titles sometimes carry emoji (e.g. "New Lead: X 🚀") — strip
// them so the feed keeps a consistent professional tone; status is conveyed by
// the tinted icon instead.
function stripEmoji(text: string): string {
  return text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/\s{2,}/g, " ").trim();
}

export function ActivityCard({ activity }: { activity: ActivityItem[] }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-card">
      <div className="px-4 py-2.5 border-b border-[var(--crm-border)]">
        <h2 className="text-[13px] font-semibold text-[var(--crm-text-primary)]">Recent activity</h2>
        <p className="text-[11px] text-[var(--crm-text-secondary)] mt-0.5">Latest events in your pipeline</p>
      </div>
      {activity.length === 0 ? (
        <EmptyState size="sm" title="No activity yet" description="Activity will appear as your team works leads." />
      ) : (
        <div className="p-2 space-y-0.5 animate-in fade-in duration-300">
          {activity.slice(0, 4).map((item, i) => {
            const Icon = getLucideIcon(item.icon_name);
            return (
              <div
                key={i}
                className="group flex items-start gap-3 rounded-[var(--r-md)] px-2.5 py-1.5 hover:bg-[var(--crm-surface-2)] transition-colors cursor-default"
              >
                {/* Icon chip tinted from the item's own status/source color */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--r-md)]",
                    item.color || "text-[var(--crm-text-secondary)]"
                  )}
                  style={{ backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[12px] font-medium text-[var(--crm-text-primary)] leading-tight truncate">
                    {stripEmoji(item.label)}
                  </p>
                  <p className="text-[11px] text-[var(--crm-text-tertiary)] mt-0.5 truncate">
                    {stripEmoji(item.sub).replace(/\s*•\s*/g, "  ·  ")}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-[var(--crm-text-secondary)] shrink-0 pt-1 tabular-nums whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            );
          })}
          {activity.length > 4 && (
            <div className="px-2.5 pt-1 pb-1">
              <a
                href="/leads"
                className="text-[11px] font-semibold text-[var(--crm-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-accent)] rounded-[var(--r-sm)]"
              >
                View all activity →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
