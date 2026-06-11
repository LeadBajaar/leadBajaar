"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Webhook, Plus, Globe, Settings, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { integrationApi } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { useUser } from "@/contexts/UserContext";
import { WebhookConfigDialog } from "@/components/integrations/WebhookConfigDialog";
import { cn } from "@/lib/utils";

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
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState<any>({ name: "", url: "", events: [], mapping: [] });
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [isListeningForWebhook, setIsListeningForWebhook] = useState(false);
  const [availablePayloadFields, setAvailablePayloadFields] = useState<{key: string, value: any}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

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
          name: ci.config.name || "External Webhook",
          url: ci.webhook_url || ci.config.url || "",
          events: ci.config.events || ["lead.created"],
          isActive: ci.is_active,
          mapping: ci.config.mapping || [],
          secret: ci.webhook_secret || ""
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

          // Provide first mapping row immediately if none exist
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

          console.log("Captured fields:", fields);
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
          secret: (webhook as any).secret
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--crm-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] z-10 overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[8px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]"
              onClick={() => router.push('/integrations')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Webhooks</h1>
              <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
                Manage your incoming and outgoing webhooks
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setNewWebhook({ name: "", url: "", events: [], mapping: [] });
              setSelectedWebhookId(null);
              setShowNewWebhookDialog(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 max-w-4xl mx-auto">
          {webhooks.length === 0 ? (
            <div className="text-center py-12 text-[var(--crm-text-secondary)] border border-[var(--crm-border)] rounded-xl bg-[var(--crm-surface-1)]">
              No webhooks configured yet.
            </div>
          ) : (
            <div className="border border-[var(--crm-border)] rounded-xl bg-[var(--crm-surface-1)] overflow-hidden divide-y divide-[var(--crm-border)] shadow-sm">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-[var(--crm-surface-2)] transition-colors gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                      <Webhook className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--crm-text-primary)] truncate">
                          {webhook.name}
                        </h3>
                        <div className="h-1 w-1 rounded-full bg-[var(--crm-text-tertiary)] hidden sm:block" />
                        <span className="text-xs font-mono text-[var(--crm-text-secondary)] truncate max-w-[200px] sm:max-w-[300px]">
                          {webhook.url || 'No URL configured'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {webhook.events.map((event) => (
                          <span key={event} className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-secondary)]">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold tracking-wider", webhook.isActive ? "text-green-600 dark:text-green-500" : "text-[var(--crm-text-tertiary)]")}>
                        {webhook.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                        className="scale-90"
                      />
                    </div>
                    <div className="h-6 w-[1px] bg-[var(--crm-border)] hidden sm:block" />
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setNewWebhook(webhook);
                          setSelectedWebhookId(webhook.id);
                          setShowNewWebhookDialog(true);
                        }}
                        className="h-8 w-8 rounded-md text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-3)]"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md text-[var(--crm-text-tertiary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this webhook?")) {
                            deleteWebhook(webhook.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
