"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Play,
  Pause,
  RefreshCcw,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  DollarSign,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
}

interface AdAccount {
  id: string;
  name: string;
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

async function apiPost(path: string, body: any) {
  const session = await getSession();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session?.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export default function CampaignManagerPage() {
  const router = useRouter();
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // Track which campaign's budget field is being edited
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [savingBudgetId, setSavingBudgetId] = useState<string | null>(null);

  useEffect(() => {
    loadAdAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadCampaigns(selectedAccount.id);
    }
  }, [selectedAccount]);

  const loadAdAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await apiGet("/meta/ads/adaccounts");
      const accounts = res.ad_accounts ?? res.data ?? [];
      setAdAccounts(accounts);
      if (accounts.length > 0) setSelectedAccount(accounts[0]);
    } catch {
      setError("Could not load ad accounts. Make sure your Facebook account is connected.");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadCampaigns = async (adAccountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/meta/ads/adaccounts/${adAccountId}/campaigns`);
      setCampaigns(res.campaigns ?? res.data ?? []);
    } catch {
      setError("Failed to load campaigns.");
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Fix 6: Toggle pause/resume — uses ads_management permission */
  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setTogglingId(campaign.id);

    // Optimistic update
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus as Campaign["status"] } : c))
    );

    try {
      await apiPost(`/meta/ads/${campaign.id}/status`, { status: newStatus });
      toast.success(`Campaign ${newStatus === "ACTIVE" ? "resumed" : "paused"} successfully`);
    } catch {
      // Revert on failure
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: campaign.status } : c))
      );
      toast.error("Failed to update campaign status");
    } finally {
      setTogglingId(null);
    }
  };

  const startEditingBudget = (campaign: Campaign) => {
    const current = campaign.daily_budget ?? campaign.lifetime_budget ?? "";
    // Budget stored in paise — convert back to rupees for display
    const displayBudget = current ? String(parseFloat(current) / 100) : "";
    setEditingBudget(campaign.id);
    setBudgetInput(displayBudget);
  };

  const saveBudget = async (campaign: Campaign) => {
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid budget amount (e.g. 500 for ₹500)");
      return;
    }
    setSavingBudgetId(campaign.id);
    try {
      await apiPost(`/meta/ads/adsets/${campaign.id}/budget`, {
        daily_budget: parsed,
      });
      // Update local state (value shown in rupees, API converts to paise)
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id ? { ...c, daily_budget: String(parsed * 100) } : c
        )
      );
      toast.success("Budget updated");
      setEditingBudget(null);
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setSavingBudgetId(null);
    }
  };

  const fmtBudget = (b?: string) => {
    if (!b) return "—";
    return `₹${(parseFloat(b) / 100).toFixed(0)}`;
  };

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
              <Megaphone className="h-6 w-6 text-violet-400" />
              Campaign Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pause, resume, and manage budgets via Meta Ads API (<code>ads_management</code>)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {adAccounts.length > 1 && (
            <div className="relative">
              <select
                value={selectedAccount?.id ?? ""}
                onChange={(e) => {
                  const acc = adAccounts.find((a) => a.id === e.target.value);
                  if (acc) setSelectedAccount(acc);
                }}
                className="appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
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
            onClick={() => selectedAccount && loadCampaigns(selectedAccount.id)}
            disabled={isLoading || !selectedAccount}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoadingAccounts && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading ad accounts...
        </div>
      )}

      {!isLoadingAccounts && adAccounts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-violet-500/10 p-4">
            <Megaphone className="h-8 w-8 text-violet-400" />
          </div>
          <p className="font-semibold">No Ad Accounts Found</p>
          <p className="text-sm text-muted-foreground">Connect your Meta account from Integrations to manage campaigns.</p>
          <button
            onClick={() => router.push("/integrations")}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            Go to Integrations
          </button>
        </div>
      )}

      {!isLoadingAccounts && selectedAccount && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Campaigns — {selectedAccount.name || selectedAccount.id}
            </h2>
            <span className="text-xs text-muted-foreground">{campaigns.length} campaigns</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground text-center">
              <Megaphone className="h-8 w-8 opacity-30" />
              <p className="text-sm">No campaigns found in this ad account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-white/10">
                    <th className="text-left px-4 py-2.5 font-medium">Campaign Name</th>
                    <th className="text-left px-4 py-2.5 font-medium">Objective</th>
                    <th className="text-right px-4 py-2.5 font-medium">Daily Budget</th>
                    <th className="text-center px-4 py-2.5 font-medium">Status</th>
                    <th className="text-center px-4 py-2.5 font-medium">Pause / Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{campaign.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs uppercase tracking-wide">
                        {campaign.objective ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingBudget === campaign.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-muted-foreground">₹</span>
                            <input
                              autoFocus
                              type="number"
                              min="1"
                              value={budgetInput}
                              onChange={(e) => setBudgetInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveBudget(campaign);
                                if (e.key === "Escape") setEditingBudget(null);
                              }}
                              className="w-20 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                            {savingBudgetId === campaign.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <button
                                  onClick={() => saveBudget(campaign)}
                                  className="rounded p-0.5 hover:bg-green-500/20 text-green-400 transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingBudget(null)}
                                  className="rounded p-0.5 hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingBudget(campaign)}
                            className="group flex items-center justify-end gap-1.5 hover:text-violet-400 transition-colors"
                          >
                            <span>{fmtBudget(campaign.daily_budget ?? campaign.lifetime_budget)}</span>
                            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            campaign.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-400"
                              : campaign.status === "PAUSED"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-white/10 text-muted-foreground"
                          }`}
                        >
                          {campaign.status === "ACTIVE" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleStatus(campaign)}
                          disabled={
                            togglingId === campaign.id ||
                            campaign.status === "DELETED" ||
                            campaign.status === "ARCHIVED"
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                            campaign.status === "ACTIVE"
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                        >
                          {togglingId === campaign.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : campaign.status === "ACTIVE" ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          {campaign.status === "ACTIVE" ? "Pause" : "Resume"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
