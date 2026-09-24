"use client";

import { EmptyState } from "@/components/state";
import { ArrowUpRight } from "lucide-react";

export interface PipelineStage {
  stage: string;
  count: number;
  pct: number;
  color: string;
}

const STAGE_BAR_COLORS = [
  "#3B4CEB", // Dark Blue
  "#2A69F6", // Blue
  "#1AC7DB", // Cyan
  "#F59E0B", // Orange
  "#EF4444", // Red
];

export function PipelineCard({ pipeline }: { pipeline: PipelineStage[] }) {
  const totalLeads = pipeline.find(p => p.stage.toLowerCase() === 'lead')?.count || 5000;
  const closedLeads = pipeline.find(p => p.stage.toLowerCase().includes('close'))?.count || 0;
  
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-900">Pipeline Overview</h3>
          <p className="text-[11px] font-medium text-slate-500">Current funnel breakdown</p>
        </div>
      </div>

      {pipeline.length === 0 ? (
        <EmptyState
          size="sm"
          title="No leads in your pipeline yet"
          description="Leads you add will show up here by stage."
          primaryAction={{ label: "Add a lead", href: "/leads" }}
        />
      ) : (
        <div className="flex-1 flex flex-row gap-6 items-center justify-between">
          
          {/* Funnel Visualization */}
          <div className="flex-1 w-full flex flex-col gap-1.5">
            {pipeline.map((p, i) => {
              const n = pipeline.length;
              const topWidth = 100 - (40 / n) * i;
              const bottomWidth = 100 - (40 / n) * (i + 1);
              const leftTop = (100 - topWidth) / 2;
              const rightTop = 100 - leftTop;
              const leftBottom = (100 - bottomWidth) / 2;
              const rightBottom = 100 - leftBottom;
              
              const clipPath = `polygon(${leftTop}% 0%, ${rightTop}% 0%, ${rightBottom}% 100%, ${leftBottom}% 100%)`;
              const bg = STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length];

              return (
                <div 
                  key={p.stage} 
                  className="h-[44px] w-full flex items-center justify-center relative overflow-hidden"
                  style={{ clipPath, backgroundColor: bg }}
                >
                  <div 
                    className="absolute inset-y-0 flex items-center justify-between text-white z-10 px-5"
                    style={{ left: `${leftBottom}%`, right: `${leftBottom}%` }}
                  >
                    <span className="text-[11px] font-extrabold tracking-wider truncate max-w-[50%]">
                      {p.stage}
                    </span>
                    <span className="text-[11px] font-extrabold opacity-95 tracking-wide whitespace-nowrap">
                      {p.count} <span className="opacity-75 font-semibold">({p.pct}%)</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metric Boxes */}
          <div className="w-[130px] shrink-0 flex flex-col gap-3">
            {/* Box 1 */}
            <div className="flex flex-col p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <span className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">Total Leads</span>
              <span className="text-[20px] font-extrabold text-slate-900 satoshi-heading leading-tight mb-1.5">5,000</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-green-50 border border-green-100 text-green-700">
                  <ArrowUpRight className="h-2 w-2 mr-0.5" strokeWidth={3} />
                  18.5%
                </span>
                <span className="text-[9px] font-medium text-slate-400">vs last month</span>
              </div>
            </div>
            
            {/* Box 2 */}
            <div className="flex flex-col p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <span className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">Conversion Rate</span>
              <span className="text-[20px] font-extrabold text-slate-900 satoshi-heading leading-tight mb-1.5">6.4%</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-green-50 border border-green-100 text-green-700">
                  <ArrowUpRight className="h-2 w-2 mr-0.5" strokeWidth={3} />
                  12.2%
                </span>
                <span className="text-[9px] font-medium text-slate-400">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Link */}
      <div className="flex justify-center sm:justify-end mt-auto pt-6 border-t border-slate-100/50 mt-4">
        <a href="/pipeline" className="text-[11px] font-bold text-[#554DF0] hover:underline flex items-center gap-1 transition-all">
          View Full Funnel &rarr;
        </a>
      </div>
    </div>
  );
}
