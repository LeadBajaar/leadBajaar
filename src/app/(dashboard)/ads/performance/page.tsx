"use client";

import React, { useState, useEffect } from "react";
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
import { API_BASE_URL } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

interface AdInsight {
  campaign_name: string;
  campaign_id: string;
  status?: string;
  spend: string;
  impressions: string;
  clicks: string;
  cpc?: string;
  ctr?: string;
  leads?: string;
  reach?: string;
  cpm?: string;
  cpl?: number | null;
}

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  currency?: string;
}

async function apiGet(path: string) {
  const session = await getSession();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${session?.token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

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
      const res = await apiGet("/meta/ads/adaccounts");
      const accounts = res.ad_accounts ?? res.data ?? [];
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
      const res = await apiGet(
        `/meta/ads/adaccounts/${adAccountId}/insights?date_preset=${datePreset}`
      );
      setInsights(res.insights ?? res.data ?? []);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-white/10 p-2 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              Ad Performance
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Campaign-level insights powered by Meta Ads API (<code>ads_read</code>)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Date preset selector */}
          <div className="relative">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
                className="appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {adAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name || a.id}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}

          <button
            onClick={() => selectedAccount && loadInsights(selectedAccount.id)}
            disabled={isLoading || !selectedAccount}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

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
          <button
            onClick={() => router.push("/integrations")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Go to Integrations
          </button>
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
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className={`inline-flex rounded-lg p-2 ${bg} mb-3`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold">{isLoading ? "—" : value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Campaign Table */}
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Campaigns — {selectedAccount.name || selectedAccount.id}
              </h2>
              <span className="text-xs text-muted-foreground">{insights.length} campaigns</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading insights...
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 opacity-30" />
                <p className="text-sm">No campaign data for this period.</p>
                <p className="text-xs">This could mean no campaigns ran, or the account has no spend yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-white/10">
                      <th className="text-left px-4 py-2.5 font-medium">Campaign Name</th>
                      <th className="text-left px-4 py-2.5 font-medium">Status</th>
                      <th className="text-right px-4 py-2.5 font-medium">Impressions</th>
                      <th className="text-right px-4 py-2.5 font-medium">Clicks</th>
                      <th className="text-right px-4 py-2.5 font-medium">Leads</th>
                      <th className="text-right px-4 py-2.5 font-medium">Spend</th>
                      <th className="text-right px-4 py-2.5 font-medium">CPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.map((row, i) => (
                      <tr key={row.campaign_id ?? i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{row.campaign_name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-400"
                              : row.status === "PAUSED"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-white/10 text-muted-foreground"
                          }`}>
                            {row.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmtNum(row.impressions || "0")}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmtNum(row.clicks || "0")}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-400">{fmtNum(row.leads || "0")}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-400">{fmtCur(parseFloat(row.spend || "0"))}</td>
                        <td className="px-4 py-3 text-right text-purple-400">
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
