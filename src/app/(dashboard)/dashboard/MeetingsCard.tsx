"use client";

import { Calendar, Video, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  company: string;
  time: string;
}

const mockMeetings: Meeting[] = [
  { id: "1", title: "Discovery Call", company: "Acme Corp", time: "Today, 11:00 AM" },
  { id: "2", title: "Product Demo", company: "Globex Solutions", time: "Today, 02:30 PM" },
  { id: "3", title: "Follow-up Call", company: "Stark Industries", time: "Tomorrow, 10:00 AM" },
];

export function MeetingsCard() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-900">Meetings This Week</h3>
          <p className="text-[11px] font-medium text-slate-500">Your upcoming meetings</p>
        </div>
        <a href="/meetings" className="text-[11px] font-bold text-[#554DF0] hover:underline flex items-center gap-1 transition-all">
          View Calendar &rarr;
        </a>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {mockMeetings.map((meeting, idx) => {
          let colorBg = "bg-blue-50 text-blue-600";
          let IconComponent = (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="7" y="7" width="3" height="3"/>
              <rect x="14" y="7" width="3" height="3"/>
              <rect x="7" y="14" width="3" height="3"/>
              <rect x="14" y="14" width="3" height="3"/>
            </svg>
          );

          if (idx === 1) {
            colorBg = "bg-purple-50 text-purple-600";
          } else if (idx === 2) {
            colorBg = "bg-sky-50 text-sky-600";
            IconComponent = <CalendarDays className="h-5 w-5" />;
          }

          return (
            <div key={meeting.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3.5">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colorBg)}>
                  {IconComponent}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900">{meeting.title}</span>
                  <span className="text-[11px] font-medium text-slate-500 mb-0.5">{meeting.company}</span>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {meeting.time}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50 gap-1.5 shadow-sm rounded-md">
                Join <Video className="h-3.5 w-3.5" fill="currentColor" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="flex justify-center sm:justify-end mt-auto pt-6 border-t border-slate-100/50 mt-4">
        <a href="/meetings" className="text-[11px] font-bold text-[#554DF0] hover:underline flex items-center gap-1 transition-all">
          View All Meetings &rarr;
        </a>
      </div>
    </div>
  );
}
