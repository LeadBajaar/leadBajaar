"use client";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/state";
import { Plus, Gift, UserCheck, Mail, MessageCircle, Calendar, RefreshCw } from "lucide-react";

export interface ActivityItem {
  label: string;
  sub: string;
  time: string;
  icon_name: string;
  color: string;
}

function stripEmoji(text: string): string {
  return text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/\s{2,}/g, " ").trim();
}

function getActivityDesign(item: ActivityItem) {
  const label = (item.label || "").toLowerCase();
  const icon = (item.icon_name || "").toLowerCase();

  // 1. Meeting Booked / Meeting Book
  if (
    label.includes("meeting book") || 
    label.includes("meeting") || 
    label.includes("appointment") || 
    label.includes("call booked")
  ) {
    return { color: "#10B981", Icon: Calendar }; // Green
  }

  // 2. Lead Reactivated
  if (
    label.includes("reactivated") || 
    label.includes("reactive") || 
    label.includes("resume")
  ) {
    return { color: "#3B82F6", Icon: RefreshCw }; // Blue with RefreshCw
  }

  // 3. New Update / Status Update
  if (
    label.includes("new update") || 
    label.includes("update") || 
    label.includes("updated") || 
    label.includes("status") || 
    label.includes("stage")
  ) {
    return { color: "#F59E0B", Icon: UserCheck }; // Orange
  }

  // 4. New Lead / Leads Created
  if (
    label.includes("lead added") || 
    label.includes("new lead") || 
    label.includes("lead created") || 
    label.includes("create lead")
  ) {
    return { color: "#554DF0", Icon: Plus }; // Purple
  }

  // 5. Email Sent
  if (
    label.includes("email sent") || 
    label.includes("sent email") || 
    label.includes("email")
  ) {
    return { color: "#3B82F6", Icon: Mail }; // Blue
  }

  // 6. New Message / WhatsApp / Chat
  if (
    label.includes("new message") || 
    label.includes("message received") || 
    label.includes("chat") || 
    label.includes("whatsapp") || 
    label.includes("message")
  ) {
    return { color: "#06B6D4", Icon: MessageCircle }; // Cyan
  }

  // 7. Icon-name based fallbacks (if label doesn't match above categories)
  if (icon.includes("mail")) {
    return { color: "#3B82F6", Icon: Mail };
  }
  if (icon.includes("message") || icon.includes("chat")) {
    return { color: "#06B6D4", Icon: MessageCircle };
  }
  if (icon.includes("calendar") || icon.includes("video")) {
    return { color: "#10B981", Icon: Calendar };
  }
  if (icon.includes("target") || icon.includes("check")) {
    return { color: "#F59E0B", Icon: UserCheck };
  }
  if (icon.includes("plus") || icon.includes("add")) {
    return { color: "#554DF0", Icon: Plus };
  }

  // Default Fallback
  return { color: "#3B82F6", Icon: Plus };
}

export function ActivityCard({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-900">Recent Activity</h3>
          <p className="text-[11px] font-medium text-slate-500">Latest updates from your pipeline</p>
        </div>
        <a href="/activity" className="text-[11px] font-bold text-[#554DF0] hover:underline flex items-center gap-1 transition-all">
          View all &rarr;
        </a>
      </div>

      {!activities || activities.length === 0 ? (
        <EmptyState
          size="sm"
          title="No recent activity"
          description="When things happen in your CRM, they'll show up here."
        />
      ) : (
        <div className="flex-1 flex flex-col relative pl-6">
          {/* Timeline connecting line */}
          <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-slate-100" />
          
          <div className="flex flex-col gap-6 relative z-10">
            {activities.map((item, i) => {
              const { color, Icon } = getActivityDesign(item);
              
              return (
                <div key={i} className="flex items-start gap-4 relative group">
                  {/* Timeline Dot on the line */}
                  <div 
                    className="absolute left-[-16px] top-[14px] w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm shrink-0 z-20"
                    style={{ backgroundColor: color }}
                  />

                  {/* Circular Icon */}
                  <div 
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm border border-white/10"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex-1 flex flex-col min-w-0 justify-center py-0.5">
                    <div className="flex justify-between items-start">
                      <p className="text-[13px] font-extrabold text-slate-900 leading-tight">
                        {stripEmoji(item.label)}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 whitespace-nowrap ml-2 mt-0.5">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-500 mt-1 leading-snug truncate">
                      {stripEmoji(item.sub).replace(/\s*•\s*/g, "  ·  ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
