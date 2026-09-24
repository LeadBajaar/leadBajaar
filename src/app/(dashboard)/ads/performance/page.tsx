"use client";

import { PageHeader } from "@/components/page-header/PageHeader";import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  Eye,
  RefreshCcw,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getAdAccounts, getInsights } from "@/lib/api/ads.api";
import { AdAccount, AdInsight } from "@/lib/api/types/ads.types";

export default function AdPerformancePage() {
  const router = useRouter();
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState("last_30_days");

  useEffect(() => {
    loadAdAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadInsights(selectedAccount.id);
    }
  }, [selectedAccount, datePreset]);

  const loadAdAccounts = async () => {
    setIsLoadingAccounts(true);
    setError(null);
    try {
      const accounts = await getAdAccounts();
      setAdAccounts(accounts);
      if (accounts.length > 0) setSelectedAccount(accounts[0]);
    } catch (e: any) {
      setError("Could not load ad accounts. Make sure your Facebook account is connected.");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadInsights = async (adAccountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedInsights = await getInsights(adAccountId, datePreset);
      setInsights(fetchedInsights);
    } catch (e: any) {
      setError("Failed to load insights. The account may have no campaigns yet.");
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpend = insights.reduce((s, r) => s + parseFloat(r.spend || "0"), 0);
  const totalLeads = insights.reduce((s, r) => s + parseInt(r.leads || "0"), 0);
  const totalClicks = insights.reduce((s, r) => s + parseInt(r.clicks || "0"), 0);
  const totalImpressions = insights.reduce((s, r) => s + parseInt(r.impressions || "0"), 0);
  const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;

  const fmtNum = (n: number | string) => Number(n).toLocaleString("en-IN");
  const fmtCur = (n: number) => `₹${n.toFixed(2)}`;

  return (
    <div className="w-full min-h-full p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Ad Performance"
        description="Campaign-level insights powered by Meta Ads API"
        actions={
          <>
            {/* Date preset selector */}
            <div className="relative">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 px-3 py-1.5 pr-8 text-[13px] font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Account selector */}
            {adAccounts.length > 1 && (
              <div className="relative">
                <select
                  value={selectedAccount?.id ?? ""}
                  onChange={(e) => {
                    const acc = adAccounts.find((a) => a.id === e.target.value);
                    if (acc) setSelectedAccount(acc);
                  }}
                  className="appearance-none rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 px-3 py-1.5 pr-8 text-[13px] font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {adAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.id}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            )}

            <div 
              onClick={() => selectedAccount && loadInsights(selectedAccount.id)}
              className={`flex items-center gap-2 px-3 py-1.5 w-fit rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 text-[13px] font-bold text-slate-700 shadow-sm transition-all select-none ${isLoading || !selectedAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <RefreshCcw className={`h-4 w-4 text-slate-500 shrink-0 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </div>
          </>
        }
      />

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading accounts */}
      {isLoadingAccounts && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading ad accounts...
        </div>
      )}

      {/* No accounts connected */}
      {!isLoadingAccounts && adAccounts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-blue-500/10 p-4">
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold">No Ad Accounts Found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Meta Business account from the Integrations page to see performance data.
            </p>
          </div>
          <Button variant="ghost"
            onClick={() => router.push("/integrations")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors p-0 h-auto w-auto"
          >
            Go to Integrations
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      {!isLoadingAccounts && selectedAccount && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Spend", value: fmtCur(totalSpend), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Total Leads", value: fmtNum(totalLeads), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Avg. CPL", value: avgCPL > 0 ? fmtCur(avgCPL) : "—", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Total Clicks", value: fmtNum(totalClicks), icon: MousePointerClick, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Impressions", value: fmtNum(totalImpressions), icon: Eye, color: "text-pink-400", bg: "bg-pink-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className={`inline-flex rounded-lg p-2.5 ${bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{isLoading ? "—" : value}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Campaign Table */}
          <div className="rounded-[var(--r-lg)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--crm-border)] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[var(--crm-text-primary)]">
                Campaigns — {selectedAccount.name || selectedAccount.id}
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{insights.length} campaigns</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 font-medium">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading insights...
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center text-slate-400">
                <BarChart3 className="h-10 w-10 opacity-40" />
                <p className="text-sm font-medium">No campaign data for this period.</p>
                <p className="text-xs">This could mean no campaigns ran, or the account has no spend yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-[var(--crm-border)] bg-slate-50/50">
                      <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider">Campaign Name</th>
                      <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">Impressions</th>
                      <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">Clicks</th>
                      <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">Leads</th>
                      <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">Spend</th>
                      <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">CPL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--crm-border)]">
                    {insights.map((row, i) => (
                      <tr key={row.campaign_id ?? i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-700 max-w-[200px] truncate">{row.campaign_name || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            row.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : row.status === "PAUSED"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {row.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500 font-medium">{fmtNum(row.impressions || "0")}</td>
                        <td className="px-5 py-4 text-right text-slate-500 font-medium">{fmtNum(row.clicks || "0")}</td>
                        <td className="px-5 py-4 text-right font-bold text-blue-600">{fmtNum(row.leads || "0")}</td>
                        <td className="px-5 py-4 text-right font-bold text-green-600">{fmtCur(parseFloat(row.spend || "0"))}</td>
                        <td className="px-5 py-4 text-right font-bold text-purple-600">
                          {row.cpl != null ? fmtCur(row.cpl) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
