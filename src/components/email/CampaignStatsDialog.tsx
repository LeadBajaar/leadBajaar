"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Send, 
  CheckCircle2, 
  Eye, 
  MousePointerClick, 
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  Smartphone,
  Monitor,
  Search,
  ExternalLink,
  Clock,
  User,
  Users,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface CampaignStatsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: any;
}

export function CampaignStatsDialog({
  isOpen,
  onOpenChange,
  campaign,
}: CampaignStatsDialogProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen && campaign?.id) {
      fetchStats();
      setSearchQuery("");
    }
  }, [isOpen, campaign?.id]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/email/campaigns/${campaign.id}/stats`);
      setStats(res.data);
    } catch (e) {
      console.warn("Failed to load campaign statistics", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeliveryCount = (statusName: string) => {
    if (!stats?.delivery_stats) return 0;
    const found = stats.delivery_stats.find((s: any) => s.status?.toLowerCase() === statusName.toLowerCase());
    return found ? found.count : 0;
  };

  const getEventCount = (eventName: string) => {
    if (!stats?.engagement_stats) return 0;
    const found = stats.engagement_stats.find((e: any) => e.event_type?.toLowerCase() === eventName.toLowerCase());
    return found ? found.count : 0;
  };

  const totalRecipients = campaign?.total_recipients || 0;
  const sentCount = campaign?.sent_count || getDeliveryCount("sent") || 0;
  const openedCount = getEventCount("opened") || getEventCount("open");
  const clickedCount = getEventCount("clicked") || getEventCount("click");
  const bouncedCount = getDeliveryCount("bounced") || getDeliveryCount("failed");

  const openRate = sentCount > 0 ? ((openedCount / sentCount) * 100).toFixed(1) : "0.0";
  const clickRate = openedCount > 0 ? ((clickedCount / openedCount) * 100).toFixed(1) : "0.0";

  // Device stats
  const mobileCount = stats?.device_stats?.mobile || 0;
  const desktopCount = stats?.device_stats?.desktop || 0;
  const totalDeviceEvents = mobileCount + desktopCount;
  const mobilePct = totalDeviceEvents > 0 ? Math.round((mobileCount / totalDeviceEvents) * 100) : 0;
  const desktopPct = totalDeviceEvents > 0 ? Math.round((desktopCount / totalDeviceEvents) * 100) : 0;

  // Filter recipient logs by search query
  const recipientLogs: any[] = stats?.recipient_logs || [];
  const filteredLogs = recipientLogs.filter((log) => 
    !searchQuery.trim() || log.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[820px] w-full max-h-[92vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="space-y-1 text-left pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-100 dark:border-purple-900/50">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 dark:text-white satoshi-heading">
                  Campaign Telemetry & Recipient Analytics
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium">
                  {campaign?.name || "Campaign Analytics"}
                </DialogDescription>
              </div>
            </div>

            <Badge className="capitalize text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-none">
              Status: {campaign?.status || "draft"}
            </Badge>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-xs font-semibold text-slate-400">Loading recipient telemetry and event traces...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-3">
            {/* Metadata bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {campaign?.subject || "No subject"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Template</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {campaign?.template?.name || "Default Template"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {campaign?.created_at ? format(new Date(campaign.created_at), "MMM d, yyyy") : "-"}
                </span>
              </div>
            </div>

            {/* Metrics 4-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-blue-200/60 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <Send className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Dispatched</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {sentCount}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  of {totalRecipients} queued
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Opened</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {openedCount}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                  {openRate}% Open Rate
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200/60 bg-indigo-50/50 dark:bg-indigo-950/20">
                <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Clicked</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {clickedCount}
                </div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold mt-0.5">
                  {clickRate}% Click-to-Open
                </div>
              </div>

              <div className="p-4 rounded-xl border border-rose-200/60 bg-rose-50/50 dark:bg-rose-950/20">
                <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Bounced</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {bouncedCount}
                </div>
                <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold mt-0.5">
                  {sentCount > 0 ? ((bouncedCount / sentCount) * 100).toFixed(1) : 0}% Bounce Rate
                </div>
              </div>
            </div>

            {/* Device Demographics Strip */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    📱 Reader Device Breakdown
                  </span>
                  <span className="text-[11px] text-slate-400">({totalDeviceEvents} total interactions)</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-600">
                    <Smartphone className="h-3.5 w-3.5" /> Mobile: {mobilePct}% ({mobileCount})
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Monitor className="h-3.5 w-3.5" /> Desktop: {desktopPct}% ({desktopCount})
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${totalDeviceEvents > 0 ? mobilePct : 50}%` }} 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                />
                <div 
                  style={{ width: `${totalDeviceEvents > 0 ? desktopPct : 50}%` }} 
                  className="bg-slate-400 h-full transition-all duration-500" 
                />
              </div>
            </div>

            {/* Recipient-by-Recipient Activity Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#2A3ED6]" /> Recipient Activity Logs
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Inspect individual lead delivery status, open counts, and click telemetry.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search recipient email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {recipientLogs.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 text-xs text-slate-400 font-medium">
                  No individual recipient logs found for this campaign yet.
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200/80 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-200/80 dark:border-slate-700 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Opens</th>
                        <th className="py-2.5 px-3">Clicks</th>
                        <th className="py-2.5 px-3">Device</th>
                        <th className="py-2.5 px-3">Last Event</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {filteredLogs.map((log) => {
                        const hasOpened = (log.open_count || 0) > 0;
                        const hasClicked = (log.click_count || 0) > 0;

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-600 font-bold shrink-0">
                                {log.recipient_email?.charAt(0).toUpperCase()}
                              </span>
                              <span className="truncate max-w-[180px]">{log.recipient_email}</span>
                            </td>

                            <td className="py-2.5 px-3">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize border",
                                hasClicked && "bg-indigo-50 text-indigo-700 border-indigo-200",
                                !hasClicked && hasOpened && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                !hasClicked && !hasOpened && log.status === "sent" && "bg-blue-50 text-blue-700 border-blue-200",
                                log.status === "failed" && "bg-rose-50 text-rose-700 border-rose-200",
                                log.status === "queued" && "bg-slate-100 text-slate-600 border-slate-200"
                              )}>
                                {hasClicked ? "Clicked" : hasOpened ? "Opened" : log.status || "Delivered"}
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              <span className={cn("font-bold", hasOpened ? "text-emerald-600" : "text-slate-400")}>
                                {log.open_count || 0}x
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              <span className={cn("font-bold", hasClicked ? "text-indigo-600" : "text-slate-400")}>
                                {log.click_count || 0}x
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-slate-500 font-medium">
                              {log.device ? (
                                <span className="flex items-center gap-1 text-[11px]">
                                  {log.device === "Mobile" ? <Smartphone className="h-3 w-3 text-indigo-500" /> : <Monitor className="h-3 w-3 text-slate-500" />}
                                  {log.device}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-slate-500 font-medium">
                              {log.last_event?.time ? (
                                <span className="text-[11px] block truncate max-w-[140px]" title={log.last_event.url || ""}>
                                  {formatDistanceToNow(new Date(log.last_event.time), { addSuffix: true })}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Awaiting read</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Smart Telemetry Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>CRM Integrated Telemetry:</strong> Every email open and link click is also automatically recorded onto the lead's CRM Timeline and triggers Meta CAPI conversion attribution.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
