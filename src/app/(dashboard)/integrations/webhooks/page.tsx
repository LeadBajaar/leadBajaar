"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Webhook,
  Plus,
  Settings,
  Trash2,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { integrationApi } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { WebhookConfigDialog } from "@/components/integrations/WebhookConfigDialog";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useUser } from "@/contexts/UserContext";

interface WebhookConfig {
  id: string;
  uuid?: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  mapping: { sourceField: string; targetField: string }[];
  secret?: string;
}

export default function WebhooksPage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { hasAddon } = useUser();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState<any>({ name: "", url: "", events: [], mapping: [] });
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [isListeningForWebhook, setIsListeningForWebhook] = useState(false);
  const [availablePayloadFields, setAvailablePayloadFields] = useState<{key: string, value: any}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedUrlMap, setCopiedUrlMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await integrationApi.getConnectedIntegrations();
      const filteredWebhooks = response
        .filter((ci: any) => ci.type === "webhook")
        .map((ci: any) => ({
          id: ci.id.toString(),
          uuid: ci.uuid,
          name: ci.config?.name || "External Webhook",
          url: ci.webhook_url || ci.config?.url || "",
          events: ci.config?.events || ["lead.created"],
          isActive: ci.is_active,
          mapping: ci.config?.mapping || [],
          secret: ci.webhook_secret || "",
          enrichment: ci.config?.enrichment || { enabled: false }
        }));
      setWebhooks(filteredWebhooks);
    } catch (error: any) {
      setWebhooks([]);
      handleError(error, { title: "Connection Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebhook = async (id: string) => {
    const webhook = webhooks.find((w) => w.id === id);
    if (!webhook) return;
    try {
      const newStatus = !webhook.isActive;
      await (integrationApi as any).updateIntegrationStatus(id, newStatus);
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isActive: newStatus } : w))
      );
      toast.success(`Webhook ${newStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error: any) {
      handleError(error, { title: "Failed to update webhook" });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await (integrationApi as any).deleteIntegration(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success("Webhook deleted successfully");
    } catch (error: any) {
      handleError(error, { title: "Failed to delete webhook" });
    }
  };

  const addWebhook = async () => {
    if (!newWebhook.name) return;
    try {
      setIsConnecting(true);
      await integrationApi.saveIntegration({
        type: "webhook",
        config: { ...newWebhook, secret: Math.random().toString(36).substring(2, 12) },
        isActive: true,
        environment: "production"
      });
      setShowNewWebhookDialog(false);
      setNewWebhook({ name: "", url: "", events: [], mapping: [] });
      setSelectedWebhookId(null);
      fetchWebhooks();
      toast.success("Webhook created successfully!");
    } catch (error: any) {
      handleError(error, { title: "Creation Failed" });
    } finally {
      setIsConnecting(false);
    }
  };

  const flattenPayload = (obj: any, prefix = ''): { key: string; value: any }[] => {
    const result: { key: string; value: any }[] = [];
    if (obj === null || obj === undefined) return result;

    for (const [k, v] of Object.entries(obj)) {
      const dotKey = prefix ? `${prefix}.${k}` : k;

      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        result.push(...flattenPayload(v, dotKey));
      } else if (Array.isArray(v)) {
        v.forEach((item, i) => {
          if (item !== null && typeof item === 'object') {
            result.push(...flattenPayload(item, `${dotKey}.${i}`));
          } else {
            result.push({ key: `${dotKey}.${i}`, value: item });
          }
        });
      } else {
        result.push({ key: dotKey, value: v });
      }
    }
    return result;
  };

  const startListening = async (id: string) => {
    setIsListeningForWebhook(true);
    setAvailablePayloadFields([]);
    toast.success("Waiting for test request...");

    const pollInterval = setInterval(async () => {
      try {
        const result = await integrationApi.getLatestLog(id);
        if (result.log && (result.log.details?.payload || result.log.details)) {
          const payloadData = result.log.details.payload || result.log.details;
          const payload = typeof payloadData === 'string' ? JSON.parse(payloadData) : payloadData;
          const fields = flattenPayload(payload);

          setAvailablePayloadFields(fields);
          setIsListeningForWebhook(false);
          clearInterval(pollInterval);

          setWebhooks((prev) =>
            prev.map((webhook) => {
              if (webhook.id === id) {
                return {
                  ...webhook,
                  mapping: [...webhook.mapping, { sourceField: "", targetField: "" }],
                };
              }
              return webhook;
            }),
          );

          toast.success(`Webhook captured — ${fields.length} mappable fields detected!`);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);

    setTimeout(() => { clearInterval(pollInterval); setIsListeningForWebhook(false); }, 120000);
  };

  const saveWebhookConfig = async (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;
    try {
      const config = {
        type: "webhook",
        config: {
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          mapping: webhook.mapping,
          secret: (webhook as any).secret,
          enrichment: (webhook as any).enrichment
        },
        isActive: webhook.isActive,
        environment: "production" as "production"
      };

      if (webhookId) {
        await (integrationApi as any).updateIntegration(webhookId, config);
        toast.success("Webhook mapping updated!");
      } else {
        await integrationApi.saveIntegration(config);
        toast.success("Webhook created!");
      }

      setShowNewWebhookDialog(false);
      fetchWebhooks();
    } catch (error: any) {
      handleError(error, { title: "Save Failed" });
    }
  };

  const addFieldMapping = (webhookId: string) => {
    setWebhooks((prev) =>
      prev.map((webhook) => {
        if (webhook.id === webhookId) {
          return {
            ...webhook,
            mapping: [...webhook.mapping, { sourceField: "", targetField: "" }],
          };
        }
        return webhook;
      }),
    );
  };

  const updateFieldMapping = (
    webhookId: string,
    index: number,
    field: "sourceField" | "targetField",
    value: string,
  ) => {
    setWebhooks((prev) =>
      prev.map((webhook) => {
        if (webhook.id === webhookId) {
          const newMapping = [...webhook.mapping];
          newMapping[index] = { ...newMapping[index], [field]: value };
          return { ...webhook, mapping: newMapping };
        }
        return webhook;
      }),
    );
  };

  const removeFieldMapping = (webhookId: string, index: number) => {
    setWebhooks((prev) =>
      prev.map((webhook) => {
        if (webhook.id === webhookId) {
          const newMapping = webhook.mapping.filter((_, i) => i !== index);
          return { ...webhook, mapping: newMapping };
        }
        return webhook;
      }),
    );
  };

  const handleCopyInboundUrl = (uuid: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://api.leadbajaar.com";
    const apiUrl = origin.includes("localhost") ? "http://localhost:8000" : "https://api.leadbajaar.com";
    const fullUrl = `${apiUrl}/api/webhooks/incoming/${uuid || ""}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrlMap((prev) => ({ ...prev, [id]: true }));
    toast.success("Receiver Webhook URL copied to clipboard!");
    setTimeout(() => {
      setCopiedUrlMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-[350px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-5 pb-16">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Webhooks"
        description="Configure incoming and outgoing webhook endpoints. Track and filter all leads directly in your CRM Leads page."
        icon={
          <div className="h-10 w-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Webhook className="h-5 w-5" />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setNewWebhook({ name: "", url: "", events: [], mapping: [] });
                setSelectedWebhookId(null);
                setShowNewWebhookDialog(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer font-semibold h-9 px-4 text-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Webhook Endpoint
            </Button>
          </div>
        }
      />

      {/* ── Content: Webhook Endpoints List ────────────────────────────────────── */}
      <div className="w-full">
        {webhooks.length === 0 ? (
          <div className="text-center py-16 px-4 text-[var(--crm-text-secondary)] border border-[var(--crm-border)] rounded-2xl bg-[var(--crm-surface-1)] space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Webhook className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Webhook Endpoints Configured Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a webhook endpoint to receive leads from websites, Zapier, n8n, Make, or custom apps. You can filter all resulting leads directly on your CRM Leads page.
              </p>
            </div>
            <Button
              onClick={() => {
                setNewWebhook({ name: "", url: "", events: [], mapping: [] });
                setSelectedWebhookId(null);
                setShowNewWebhookDialog(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create First Webhook
            </Button>
          </div>
        ) : (
          <div className="border border-[var(--crm-border)] rounded-2xl bg-[var(--crm-surface-1)] overflow-hidden divide-y divide-[var(--crm-border)] shadow-xs">
            {webhooks.map((webhook) => {
              const origin = typeof window !== "undefined" ? window.location.origin : "https://api.leadbajaar.com";
              const apiUrl = origin.includes("localhost") ? "http://localhost:8000" : "https://api.leadbajaar.com";
              const inboundUrl = `${apiUrl}/api/webhooks/incoming/${webhook.uuid || ""}`;

              return (
                <div
                  key={webhook.id}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 hover:bg-[var(--crm-surface-2)] transition-colors gap-4"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                      <Webhook className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {webhook.name}
                        </h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                          webhook.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                        )}>
                          {webhook.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className="flex items-center gap-1">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Inbound URL Bar */}
                      <div className="flex items-center gap-2 max-w-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                          Inbound URL:
                        </span>
                        <code className="text-xs font-mono bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate select-all flex-1">
                          {inboundUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 shrink-0 cursor-pointer"
                          onClick={() => handleCopyInboundUrl(webhook.uuid || "", webhook.id)}
                        >
                          {copiedUrlMap[webhook.id] ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600 mr-1" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {webhook.url && (
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 truncate">
                          <span className="text-slate-400">Outbound URL:</span>
                          <span className="truncate">{webhook.url}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {hasAddon('webhook_lead_tracking') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/leads?webhookId=${webhook.id}`)}
                          className="h-8 px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer shadow-2xs"
                        >
                          <Users className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                          View Leads
                        </Button>

                        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                        className="scale-90"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setNewWebhook(webhook);
                          setSelectedWebhookId(webhook.id);
                          setShowNewWebhookDialog(true);
                        }}
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this webhook endpoint?")) {
                            deleteWebhook(webhook.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WebhookConfigDialog
        isOpen={showNewWebhookDialog}
        onOpenChange={setShowNewWebhookDialog}
        webhookId={selectedWebhookId}
        webhooks={webhooks as any}
        newWebhook={newWebhook}
        setNewWebhook={setNewWebhook}
        setWebhooks={setWebhooks as any}
        isConnecting={isConnecting}
        isListening={isListeningForWebhook}
        availableFields={availablePayloadFields}
        onSave={saveWebhookConfig}
        onAdd={addWebhook}
        startListening={startListening}
        addFieldMapping={addFieldMapping}
        updateFieldMapping={updateFieldMapping}
        removeFieldMapping={removeFieldMapping}
      />
    </div>
  );
}
