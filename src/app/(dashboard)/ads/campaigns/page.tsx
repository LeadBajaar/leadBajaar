"use client";

import { PageHeader } from "@/components/page-header/PageHeader";
import { Button } from "@/components/ui/button";
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
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { getAdAccounts, getCampaigns, updateCampaignStatus, updateAdSetBudget, deleteObject } from "@/lib/api/ads.api";
import { AdAccount, Campaign } from "@/lib/api/types/ads.types";

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
      const accounts = await getAdAccounts();
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
      const fetchedCampaigns = await getCampaigns(adAccountId);
      setCampaigns(fetchedCampaigns);
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
      await updateCampaignStatus(campaign.id, { status: newStatus as any });
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

  const handleDelete = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to permanently delete campaign "${campaign.name}"? This action cannot be undone.`)) return;
    
    setTogglingId(campaign.id);
    try {
      await deleteObject(campaign.id);
      toast.success("Campaign deleted successfully");
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign");
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
      await updateAdSetBudget(campaign.id, {
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
      <PageHeader
        title="Campaign Manager"
        description="Pause, resume, and manage budgets via Meta Ads API"
        actions={
          <>
            {adAccounts.length > 1 && (
              <div className="relative">
                <select
                  value={selectedAccount?.id ?? ""}
                  onChange={(e) => {
                    const acc = adAccounts.find((a) => a.id === e.target.value);
                    if (acc) setSelectedAccount(acc);
                  }}
                  className="appearance-none rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 px-3 py-1.5 pr-8 text-[13px] font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-violet-500"
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
            <Button
              onClick={() => router.push("/ads/campaigns/new")}
              className="flex items-center gap-1.5 h-[34px] px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-bold shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
            <div 
              onClick={() => selectedAccount && loadCampaigns(selectedAccount.id)}
              className={`flex items-center gap-2 px-3 py-1.5 h-[34px] w-fit rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 text-[13px] font-bold text-slate-700 shadow-sm transition-all select-none ${isLoading || !selectedAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <RefreshCcw className={`h-4 w-4 text-slate-500 shrink-0 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </div>
          </>
        }
      />

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
          <Button 
            onClick={() => router.push("/integrations")}
            className="bg-violet-600 hover:bg-violet-700 text-white transition-colors"
          >
            Go to Integrations
          </Button>
        </div>
      )}

      {!isLoadingAccounts && selectedAccount && (
        <div className="rounded-[var(--r-lg)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--crm-border)] flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[var(--crm-text-primary)]">
              Campaigns — {selectedAccount.name || selectedAccount.id}
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{campaigns.length} campaigns</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 font-medium">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 text-center">
              <Megaphone className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No campaigns found in this ad account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-[var(--crm-border)] bg-slate-50/50">
                    <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider">Campaign Name</th>
                    <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider">Objective</th>
                    <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">Daily Budget</th>
                    <th className="text-center px-5 py-3 font-semibold uppercase tracking-wider">Status</th>
                    <th className="text-center px-5 py-3 font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--crm-border)]">
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-700 max-w-[200px] truncate">{campaign.name}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-bold uppercase tracking-wide">
                        {campaign.objective ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {editingBudget === campaign.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-500 font-medium">₹</span>
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
                              className="w-20 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-sm text-right text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-sm"
                            />
                            {savingBudgetId === campaign.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" size="icon"
                                  onClick={() => saveBudget(campaign)}
                                  className="h-auto w-auto p-0.5 hover:bg-green-500/20 text-green-400 transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" size="icon"
                                  onClick={() => setEditingBudget(null)}
                                  className="h-auto w-auto p-0.5 hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <Button 
                            variant="ghost"
                            onClick={() => startEditingBudget(campaign)}
                            className="group flex items-center justify-end gap-1.5 hover:text-violet-600 transition-colors h-auto w-auto p-0.5 font-semibold text-slate-700"
                          >
                            <span>{fmtBudget(campaign.daily_budget ?? campaign.lifetime_budget)}</span>
                            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            campaign.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : campaign.status === "PAUSED"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
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
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => toggleStatus(campaign)}
                            disabled={
                              togglingId === campaign.id ||
                              campaign.status === "DELETED" ||
                              campaign.status === "ARCHIVED"
                            }
                            className={`inline-flex items-center gap-1.5 transition-all h-8 text-[12px] font-bold ${
                              campaign.status === "ACTIVE"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
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
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(campaign)}
                            disabled={togglingId === campaign.id}
                            className="h-8 w-8 p-0 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Campaign"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
