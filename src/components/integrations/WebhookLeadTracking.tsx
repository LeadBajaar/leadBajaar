"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Webhook,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  TrendingUp,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  HelpCircle,
  Layers,
  CheckCircle2,
  Eye,
  Terminal,
} from "lucide-react";
import { integrationApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

export interface WebhookEndpointInfo {
  id: string;
  uuid?: string;
  name: string;
  inbound_url: string;
  outbound_url?: string;
  is_active: boolean;
  events: string[];
  created_at?: string;
  leads_count: number;
}

export interface WebhookLead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  profession?: string;
  stage: string;
  status?: string;
  deal_value?: number | null;
  paid_amount?: number | null;
  source?: string;
  notes?: string;
  created_at: string;
  webhook: {
    id?: string | null;
    name: string;
    uuid?: string | null;
    inbound_url?: string | null;
    outbound_url?: string | null;
  };
  has_payload: boolean;
}

export interface WebhookStats {
  total_leads: number;
  leads_today: number;
  total_deal_value: number;
  closed_deals: number;
  conversion_rate: number;
  active_endpoints: number;
}

interface WebhookLeadTrackingProps {
  onSwitchToConfig?: () => void;
  onOpenCreateDialog?: () => void;
}

export function WebhookLeadTracking({
  onSwitchToConfig,
  onOpenCreateDialog,
}: WebhookLeadTrackingProps) {
  // Filters & State
  const [webhooks, setWebhooks] = useState<WebhookEndpointInfo[]>([]);
  const [leads, setLeads] = useState<WebhookLead[]>([]);
  const [stats, setStats] = useState<WebhookStats>({
    total_leads: 0,
    leads_today: 0,
    total_deal_value: 0,
    closed_deals: 0,
    conversion_rate: 0,
    active_endpoints: 0,
  });
  const [meta, setMeta] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: 15,
  });

  const [selectedWebhookId, setSelectedWebhookId] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Payload Inspector Modal state
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [selectedLeadForPayload, setSelectedLeadForPayload] = useState<WebhookLead | null>(null);
  const [payloadDetails, setPayloadDetails] = useState<any | null>(null);
  const [isLoadingPayload, setIsLoadingPayload] = useState(false);
  const [payloadActiveTab, setPayloadActiveTab] = useState<"raw" | "mapped">("raw");

  const [copiedUrlMap, setCopiedUrlMap] = useState<Record<string, boolean>>({});
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch leads on filter changes
  const fetchWebhookLeads = useCallback(
    async (pageToLoad: number = 1, showRefreshToast: boolean = false) => {
      try {
        if (showRefreshToast) setIsRefreshing(true);
        else setIsLoading(true);

        const params: any = {
          page: pageToLoad,
          per_page: 15,
        };

        if (selectedWebhookId && selectedWebhookId !== "all") {
          params.webhook_id = selectedWebhookId;
        }
        if (selectedStage && selectedStage !== "all") {
          params.stage = selectedStage;
        }
        if (selectedDateRange && selectedDateRange !== "all") {
          params.date_range = selectedDateRange;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const data = await integrationApi.getWebhookLeads(params);

        setWebhooks(data.webhooks || []);
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
        if (data.meta) setMeta(data.meta);

        if (showRefreshToast) {
          toast.success("Webhook lead tracking refreshed!");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load webhook lead tracking data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedWebhookId, selectedStage, selectedDateRange, debouncedSearch]
  );

  useEffect(() => {
    fetchWebhookLeads(1);
  }, [fetchWebhookLeads]);

  // Handle URL Copy
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlMap((prev) => ({ ...prev, [id]: true }));
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => {
      setCopiedUrlMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Open Raw Payload Inspector
  const handleInspectPayload = async (lead: WebhookLead) => {
    setSelectedLeadForPayload(lead);
    setIsPayloadModalOpen(true);
    setIsLoadingPayload(true);
    setPayloadDetails(null);
    setPayloadActiveTab("raw");

    try {
      const data = await integrationApi.getWebhookLeadPayload(lead.id);
      setPayloadDetails(data);
    } catch (err: any) {
      toast.error("Could not load raw webhook payload snapshot");
    } finally {
      setIsLoadingPayload(false);
    }
  };

  // Copy Raw JSON Payload
  const handleCopyPayloadJson = () => {
    if (!payloadDetails?.payload) return;
    navigator.clipboard.writeText(JSON.stringify(payloadDetails.payload, null, 2));
    setCopiedPayload(true);
    toast.success("Payload JSON copied to clipboard");
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Export Filtered Leads to CSV
  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast.error("No leads to export under current filters");
      return;
    }

    const headers = [
      "Lead ID",
      "Name",
      "Phone",
      "Email",
      "Company",
      "City",
      "Stage",
      "Deal Value",
      "Webhook Source",
      "Webhook Inbound URL",
      "Captured At",
    ];

    const rows = leads.map((lead) => [
      `LDB-${lead.id}`,
      `"${(lead.name || "").replace(/"/g, '""')}"`,
      `"${lead.phone || ""}"`,
      `"${lead.email || ""}"`,
      `"${(lead.company || "").replace(/"/g, '""')}"`,
      `"${(lead.city || "").replace(/"/g, '""')}"`,
      `"${lead.stage || "Lead"}"`,
      lead.deal_value || 0,
      `"${(lead.webhook?.name || lead.source || "").replace(/"/g, '""')}"`,
      `"${lead.webhook?.inbound_url || ""}"`,
      `"${lead.created_at ? format(new Date(lead.created_at), "yyyy-MM-dd HH:mm:ss") : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `webhook_leads_export_${format(new Date(), "yyyyMMdd_HHmm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${leads.length} webhook leads!`);
  };

  // Stage Badge Helper
  const getStageBadge = (stage: string) => {
    const s = stage?.toLowerCase() || "lead";
    if (s.includes("closed") || s.includes("won")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {stage}
        </span>
      );
    }
    if (s.includes("appointment") || s.includes("meeting") || s.includes("booked")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {stage}
        </span>
      );
    }
    if (s.includes("qualified") || s.includes("warm") || s.includes("interested")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {stage}
        </span>
      );
    }
    if (s.includes("lost") || s.includes("junk") || s.includes("not")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {stage}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {stage || "Lead"}
      </span>
    );
  };

  // Currently selected webhook object
  const activeSelectedWebhook = useMemo(() => {
    if (selectedWebhookId === "all") return null;
    return webhooks.find((w) => w.id === selectedWebhookId) || null;
  }, [selectedWebhookId, webhooks]);

  const hasActiveFilters =
    selectedWebhookId !== "all" ||
    selectedStage !== "all" ||
    selectedDateRange !== "all" ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedWebhookId("all");
    setSelectedStage("all");
    setSelectedDateRange("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* ── Top Executive KPI Overview Bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Webhook Leads */}
        <Card className="relative overflow-hidden border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-100/30 dark:from-[#0F172A] dark:via-[#111C38] dark:to-[#172554]/30 shadow-xs hover:shadow-md transition-all rounded-2xl">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-900/70 dark:text-indigo-400">
                  Total Webhook Leads
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {stats.total_leads.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tracked across all inbound URLs
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </Card>

        {/* KPI 2: Ingested Today */}
        <Card className="relative overflow-hidden border border-emerald-100 dark:border-emerald-950/60 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/30 dark:from-[#0F172A] dark:via-[#0F291E] dark:to-[#064E3B]/20 shadow-xs hover:shadow-md transition-all rounded-2xl">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-900/70 dark:text-emerald-400">
                  Captured Today
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {stats.leads_today.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real-time incoming leads
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 border border-emerald-200/50 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        </Card>

        {/* KPI 3: Pipeline Value */}
        <Card className="relative overflow-hidden border border-blue-100 dark:border-blue-950/60 bg-gradient-to-br from-white via-blue-50/20 to-blue-100/30 dark:from-[#0F172A] dark:via-[#132240] dark:to-[#1E3A8A]/20 shadow-xs hover:shadow-md transition-all rounded-2xl">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-900/70 dark:text-blue-400">
                Pipeline Value
              </span>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                <span>₹</span>
                <span>{stats.total_deal_value.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Attributed revenue generated
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-200/50 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
        </Card>

        {/* KPI 4: Conversion Rate */}
        <Card className="relative overflow-hidden border border-violet-100 dark:border-violet-950/60 bg-gradient-to-br from-white via-violet-50/20 to-violet-100/30 dark:from-[#0F172A] dark:via-[#201438] dark:to-[#4C1D95]/20 shadow-xs hover:shadow-md transition-all rounded-2xl">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-violet-900/70 dark:text-violet-400">
                Conversion Rate
              </span>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                <span>{stats.conversion_rate}%</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                  ({stats.closed_deals} won)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stats.active_endpoints} endpoints operational
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-violet-600/10 dark:bg-violet-500/20 border border-violet-200/50 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
        </Card>
      </div>

      {/* ── Active Webhook Banner (When a specific webhook is selected) ─────────────── */}
      {activeSelectedWebhook && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-slate-50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Webhook className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeSelectedWebhook.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {activeSelectedWebhook.is_active ? "Active" : "Paused"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  • {activeSelectedWebhook.leads_count} leads attributed
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                <span className="text-[11px] font-semibold text-slate-400">Inbound URL:</span>
                <span className="bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 break-all select-all">
                  {activeSelectedWebhook.inbound_url}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-500 hover:text-indigo-600 cursor-pointer"
                  onClick={() =>
                    handleCopyUrl(
                      activeSelectedWebhook.inbound_url,
                      activeSelectedWebhook.id
                    )
                  }
                >
                  {copiedUrlMap[activeSelectedWebhook.id] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWebhookId("all")}
              className="text-xs h-8 rounded-lg cursor-pointer"
            >
              Show All Webhooks
            </Button>
            {onSwitchToConfig && (
              <Button
                variant="default"
                size="sm"
                onClick={onSwitchToConfig}
                className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Configure Mapping
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Filter Controls Bar ────────────────────────────────────────────────────── */}
      <Card className="border border-[var(--crm-border)] bg-[var(--crm-surface-1)] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search leads by name, email, phone, company, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchWebhookLeads(meta.current_page, true)}
                disabled={isLoading || isRefreshing}
                className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-2",
                    isRefreshing && "animate-spin text-indigo-600"
                  )}
                />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={leads.length === 0}
                className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                Export CSV
              </Button>

              {onOpenCreateDialog && (
                <Button
                  size="sm"
                  onClick={onOpenCreateDialog}
                  className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  <Webhook className="h-4 w-4 mr-2" />
                  New Webhook
                </Button>
              )}
            </div>
          </div>

          {/* Filtering Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {/* Filter 1: Webhook URL selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Webhook className="h-3 w-3 text-indigo-500" />
                Webhook Source / URL
              </label>
              <Select
                value={selectedWebhookId}
                onValueChange={(val) => setSelectedWebhookId(val)}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <SelectValue placeholder="All Webhook Endpoints" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all" className="text-xs font-medium">
                    All Webhook Endpoints ({stats.total_leads} leads)
                  </SelectItem>
                  {webhooks.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id} className="text-xs">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                          {wh.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60 font-mono">
                          {wh.leads_count} leads
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter 2: Stage selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="h-3 w-3 text-violet-500" />
                Lead Stage
              </label>
              <Select
                value={selectedStage}
                onValueChange={(val) => setSelectedStage(val)}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Stages</SelectItem>
                  <SelectItem value="Lead" className="text-xs">Lead (New)</SelectItem>
                  <SelectItem value="Contacted" className="text-xs">Contacted</SelectItem>
                  <SelectItem value="Qualified" className="text-xs">Qualified</SelectItem>
                  <SelectItem value="Appointment Booked" className="text-xs">Appointment Booked</SelectItem>
                  <SelectItem value="Deal Closed" className="text-xs">Deal Closed (Won)</SelectItem>
                  <SelectItem value="Lost" className="text-xs">Lost / Junk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter 3: Date Range */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-emerald-500" />
                  Time Window
                </label>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Reset all
                  </button>
                )}
              </div>
              <Select
                value={selectedDateRange}
                onValueChange={(val) => setSelectedDateRange(val)}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Time</SelectItem>
                  <SelectItem value="today" className="text-xs">Today</SelectItem>
                  <SelectItem value="yesterday" className="text-xs">Yesterday</SelectItem>
                  <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
                  <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
                  <SelectItem value="this_month" className="text-xs">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Leads Tracking Table ───────────────────────────────────────────────────── */}
      <Card className="border border-[var(--crm-border)] bg-[var(--crm-surface-1)] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--crm-border)]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Captured Webhook Leads
            </h2>
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0 text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50"
            >
              {meta.total}
            </Badge>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing {leads.length > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0} -{" "}
            {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} leads
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 font-medium">
              Loading webhook leads and payload attributions...
            </p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Webhook className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Leads Captured Yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {hasActiveFilters
                  ? "No leads matched your filter criteria. Try selecting 'All Webhooks' or clearing your search term."
                  : "Send your first incoming POST request to your webhook inbound URL to capture and track leads here in real-time."}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs rounded-xl"
              >
                Clear Filters
              </Button>
            ) : webhooks.length > 0 ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-left w-full space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Quick Test Endpoint:</span>
                  <span className="text-emerald-600 font-semibold">Active</span>
                </div>
                <code className="text-xs block bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 break-all select-all">
                  {webhooks[0]?.inbound_url}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-8 cursor-pointer"
                  onClick={() => handleCopyUrl(webhooks[0].inbound_url, webhooks[0].id)}
                >
                  <Copy className="h-3 w-3 mr-1.5" />
                  Copy Inbound URL
                </Button>
              </div>
            ) : (
              onOpenCreateDialog && (
                <Button
                  size="sm"
                  onClick={onOpenCreateDialog}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs"
                >
                  Create Webhook Endpoint
                </Button>
              )
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <TableHead className="text-xs font-bold w-[220px]">Contact Details</TableHead>
                  <TableHead className="text-xs font-bold min-w-[200px]">Webhook URL Source</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Stage</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Deal Value</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Captured At</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leads.map((lead) => {
                  const leadInitials = (lead.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";

                  return (
                    <TableRow
                      key={lead.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      {/* Contact */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {leadInitials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {lead.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {lead.phone && (
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="hover:text-indigo-600 flex items-center gap-0.5"
                                >
                                  <Phone className="h-2.5 w-2.5" />
                                  <span>{lead.phone}</span>
                                </a>
                              )}
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="hover:text-indigo-600 flex items-center gap-0.5 truncate max-w-[120px]"
                                >
                                  <Mail className="h-2.5 w-2.5" />
                                  <span className="truncate">{lead.email}</span>
                                </a>
                              )}
                            </div>
                            {(lead.company || lead.city) && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                {[lead.company, lead.city].filter(Boolean).join(" • ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Webhook Attribution */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 truncate max-w-[180px]">
                              <Webhook className="h-2.5 w-2.5 text-indigo-500" />
                              <span className="truncate">
                                {lead.webhook?.name || lead.source || "External Webhook"}
                              </span>
                            </span>
                          </div>

                          {lead.webhook?.inbound_url && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              <span className="truncate max-w-[180px]">
                                {lead.webhook.inbound_url.replace(/^https?:\/\/[^\/]+/, "")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0"
                                onClick={() =>
                                  handleCopyUrl(
                                    lead.webhook.inbound_url!,
                                    `row-${lead.id}`
                                  )
                                }
                              >
                                {copiedUrlMap[`row-${lead.id}`] ? (
                                  <Check className="h-2.5 w-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Stage */}
                      <TableCell className="py-3.5">
                        {getStageBadge(lead.stage)}
                      </TableCell>

                      {/* Deal Value */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {lead.deal_value ? `₹${lead.deal_value.toLocaleString("en-IN")}` : "—"}
                          </span>
                          {lead.paid_amount ? (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Paid: ₹{lead.paid_amount.toLocaleString("en-IN")}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Captured At */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {lead.created_at
                              ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
                              : "Recently"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {lead.created_at
                              ? format(new Date(lead.created_at), "MMM d, yyyy h:mm a")
                              : ""}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                    onClick={() =>
                                      window.open(`https://wa.me/${cleanPhone}`, "_blank")
                                    }
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Chat on WhatsApp</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer shadow-2xs"
                                  onClick={() => handleInspectPayload(lead)}
                                >
                                  <Code2 className="h-3.5 w-3.5 mr-1" />
                                  Payload
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Inspect raw incoming webhook payload</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                                  onClick={() =>
                                    window.open(`/leads?leadId=${lead.id}`, "_blank")
                                  }
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open in CRM</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-[var(--crm-border)] flex items-center justify-between text-xs text-slate-500">
            <div>
              Page {meta.current_page} of {meta.last_page}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1 || isLoading}
                onClick={() => fetchWebhookLeads(meta.current_page - 1)}
                className="h-8 px-3 rounded-lg text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page || isLoading}
                onClick={() => fetchWebhookLeads(meta.current_page + 1)}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Raw Payload Snapshot Modal ────────────────────────────────────────────── */}
      <Dialog open={isPayloadModalOpen} onOpenChange={setIsPayloadModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-none">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <span>Webhook Payload Snapshot</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">
                      (Lead: {selectedLeadForPayload?.name})
                    </span>
                  </div>
                </DialogTitle>

                {payloadDetails?.payload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPayloadJson}
                    className="h-8 px-3 text-xs rounded-xl font-medium gap-1.5 cursor-pointer"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Raw JSON payload ingested from the external webhook endpoint for this lead.
              </DialogDescription>
            </DialogHeader>

            {/* Sub-meta strip */}
            {selectedLeadForPayload && (
              <div className="flex flex-wrap items-center gap-3 pt-3 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Ref: LDB-{selectedLeadForPayload.id}
                </span>
                {payloadDetails?.ip && (
                  <span className="flex items-center gap-1 font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Client IP: {payloadDetails.ip}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-500">
                  Source: {selectedLeadForPayload.webhook?.name || selectedLeadForPayload.source}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {isLoadingPayload ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-7 w-7 animate-spin text-indigo-600" />
                <p className="text-xs text-slate-400">Fetching raw webhook payload snapshot...</p>
              </div>
            ) : payloadDetails?.payload ? (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPayloadActiveTab("raw")}
                      className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer",
                        payloadActiveTab === "raw"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      Raw JSON
                    </button>
                    <button
                      onClick={() => setPayloadActiveTab("mapped")}
                      className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer",
                        payloadActiveTab === "mapped"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      CRM Mapped Fields
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {Array.isArray(payloadDetails.payload)
                      ? `${payloadDetails.payload.length} items`
                      : `${Object.keys(payloadDetails.payload).length} properties`}
                  </span>
                </div>

                {payloadActiveTab === "raw" ? (
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner border border-slate-800">
                    <pre className="whitespace-pre leading-relaxed">
                      {JSON.stringify(payloadDetails.payload, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    <div className="grid grid-cols-2 p-2.5 bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 uppercase">
                      <span>CRM Field</span>
                      <span>Extracted Webhook Value</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Full Name</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {selectedLeadForPayload?.name || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Phone Number</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {selectedLeadForPayload?.phone || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Email Address</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {selectedLeadForPayload?.email || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Company</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {selectedLeadForPayload?.company || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">City / Location</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {selectedLeadForPayload?.city || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Notes / Details</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {selectedLeadForPayload?.notes || "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No payload record found for this lead.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
