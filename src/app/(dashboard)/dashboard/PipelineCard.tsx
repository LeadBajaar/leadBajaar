"use client";

import { EmptyState } from "@/components/state";

export interface PipelineStage {
  stage: string;
  count: number;
  pct: number;
  color: string;
}

// Harmonious muted palette cycled by stage position — theme-reactive CSS vars,
// so dark mode gets the adjusted variants automatically. Coral is deliberately
// NOT used here (reserved for primary CTAs per the v2 design system).
const STAGE_BAR_COLORS = [
  "var(--crm-accent)",
  "var(--crm-blue)",
  "var(--crm-amber)",
  "var(--crm-green)",
  "var(--crm-red)",
];

export function PipelineCard({ pipeline }: { pipeline: PipelineStage[] }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-card">
      <div className="px-4 py-3.5 border-b border-[var(--crm-border)]">
        <h2 className="text-[13px] font-semibold text-[var(--crm-text-primary)]">Pipeline this month</h2>
        <p className="text-[11px] text-[var(--crm-text-secondary)] mt-0.5">Current funnel breakdown</p>
      </div>
      {pipeline.length === 0 ? (
        <EmptyState
          size="sm"
          title="No leads in your pipeline yet"
          description="Leads you add will show up here by stage."
          primaryAction={{ label: "Add a lead", href: "/leads" }}
        />
      ) : (
        <div className="p-4 space-y-5 animate-in fade-in duration-300">
          {pipeline.map((p, i) => {
            const barColor = STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length];
            return (
              <div key={p.stage} className="space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--crm-text-primary)] min-w-0 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: barColor }}
                      aria-hidden="true"
                    />
                    {p.stage}
                  </span>
                  {/* Right-aligned stat block */}
                  <span className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                    <span className="text-[14px] font-semibold text-[var(--crm-text-primary)] leading-none">
                      {p.count}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--crm-text-tertiary)] bg-[var(--crm-surface-2)] rounded-full px-1.5 py-0.5 leading-none">
                      {p.pct}%
                    </span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[var(--crm-surface-3)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                    style={{ width: `${p.pct}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
