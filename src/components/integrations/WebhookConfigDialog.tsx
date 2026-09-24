"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Plus,
  Webhook,
  CheckCircle2,
  ArrowDownToLine,
  ArrowRight,
  Send,
  ClipboardCopy,
  Loader2,
  Play,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface WebhookMapping {
  sourceField: string;
  targetField: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  mapping: WebhookMapping[];
  uuid?: string;
  secret?: string;
  webhook_secret?: string;
  enrichment?: {
    enabled: boolean;
    url: string;
    method: string;
    headers: { key: string; value: string }[];
  };
}

interface WebhookConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  webhookId: string | null;
  webhooks: WebhookConfig[];
  newWebhook: Partial<WebhookConfig>;
  setNewWebhook: React.Dispatch<React.SetStateAction<Partial<WebhookConfig>>>;
  setWebhooks: React.Dispatch<React.SetStateAction<WebhookConfig[]>>;
  isConnecting: boolean;
  isListening: boolean;
  availableFields: { key: string; value: any }[];
  onSave: (id: string) => Promise<void>;
  onAdd: () => Promise<void>;
  startListening: (id: string) => Promise<void>;
  addFieldMapping: (id: string) => void;
  updateFieldMapping: (id: string, index: number, field: "sourceField" | "targetField", value: string) => void;
  removeFieldMapping: (id: string, index: number) => void;
}

export function WebhookConfigDialog({
  isOpen,
  onOpenChange,
  webhookId,
  webhooks,
  newWebhook,
  setNewWebhook,
  setWebhooks,
  isConnecting,
  isListening,
  availableFields,
  onSave,
  onAdd,
  startListening,
  addFieldMapping,
  updateFieldMapping,
  removeFieldMapping,
}: WebhookConfigDialogProps) {
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast({ title: "URL Copied!", description: "Paste this into your external service (e.g. n8n, Zapier)." });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    toast({ title: "Secret Copied!" });
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const activeWebhook = (webhookId ? webhooks.find((w) => w.id === webhookId) : null) || (isOpen && !webhookId ? newWebhook : null);
  const mapping = activeWebhook?.mapping || [];

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleAction = async () => {
    if (webhookId) {
      await onSave(webhookId);
      onOpenChange(false);
    } else {
      await onAdd();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] max-h-[750px] flex flex-col p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182D] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-slate-50/70 dark:bg-[#121A30] border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-5 flex-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Webhook className="h-4.5 w-4.5" />
              </div>
              <div>
                <span>{webhookId ? "Edit Webhook" : "Create New Webhook"}</span>
                {webhookId && activeWebhook?.name && (
                  <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({activeWebhook.name})
                  </span>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-12">
              {webhookId
                ? "Configure webhook payload mappings, security secrets, and data endpoints."
                : "Connect a new external application or system to send or receive leads."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-4">
          {webhookId && activeWebhook ? (
            <Tabs defaultValue="incoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
                <TabsTrigger
                  value="incoming"
                  className="gap-2 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-2xs"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" /> Receive Leads (Inbound)
                </TabsTrigger>
                <TabsTrigger
                  value="outgoing"
                  className="gap-2 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" /> Dispatch Leads (Outbound)
                </TabsTrigger>
              </TabsList>

              {/* Inbound Tab */}
              <TabsContent value="incoming" className="space-y-5 focus-visible:outline-none">
                {/* Receiver URL Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      RECEIVER WEBHOOK URL
                    </Label>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active Endpoint
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex-1 font-mono text-slate-800 dark:text-slate-200 break-all select-all shadow-2xs">
                      {`https://api.leadbajaar.com/api/webhooks/incoming/${activeWebhook.uuid || ''}`}
                    </code>
                    <Button
                      variant="outline"
                      className={cn(
                        "shrink-0 h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer",
                        copiedUrl
                          ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
                      )}
                      onClick={() => handleCopyUrl(`https://api.leadbajaar.com/api/webhooks/incoming/${activeWebhook.uuid || ''}`)}
                    >
                      {copiedUrl ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="h-4 w-4" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <div className="h-4 w-4 rounded-sm bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Play className="h-2.5 w-2.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Send a POST request with JSON payload to this URL. The system will automatically parse and route incoming leads.
                    </p>
                  </div>
                </div>

                {/* Data Enrichment Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Data Enrichment (HubSpot / CRM)</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Fetch full contact object details using `objectId` from incoming webhook payload.
                    </p>
                  </div>
                  <Switch
                    checked={activeWebhook.enrichment?.enabled || false}
                    onCheckedChange={(checked) => {
                      setWebhooks((prev) =>
                        prev.map((w) =>
                          w.id === webhookId
                            ? {
                                ...w,
                                enrichment: {
                                  url: "",
                                  method: "POST",
                                  headers: [],
                                  ...(w.enrichment || {}),
                                  enabled: checked,
                                },
                              }
                            : w
                        )
                      );
                    }}
                  />
                </div>

                {/* Mapping Section */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Incoming Data Mapping</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Map incoming JSON properties to CRM fields (supports dot notation like <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">data.customer.email</code>).
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startListening(webhookId)}
                      disabled={isListening}
                      className={cn(
                        "h-8 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs",
                        isListening
                          ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-blue-50/80 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800/60"
                      )}
                    >
                      {isListening ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Listening...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5 mr-1.5" /> Auto-Detect Fields
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {mapping.length > 0 ? (
                      <div className="grid gap-2">
                        {mapping.map((map, index) => (
                          <div
                            key={index}
                            className="group flex gap-2.5 items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80"
                          >
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1">
                                JSON PAYLOAD FIELD
                              </Label>
                              {availableFields.length > 0 ? (
                                <Select
                                  value={map.sourceField}
                                  onValueChange={(val) => updateFieldMapping(webhookId, index, "sourceField", val)}
                                >
                                  <SelectTrigger className="h-8.5 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs">
                                    <SelectValue placeholder="Select field from payload" />
                                  </SelectTrigger>
                                  <SelectContent position="popper" className="z-[200] max-h-[260px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    {availableFields.map((f) => {
                                      const preview = f.value === null ? "null" : f.value === "" ? "(empty)" : String(f.value);
                                      const truncated = preview.length > 60 ? preview.slice(0, 57) + "..." : preview;
                                      return (
                                        <SelectItem key={f.key} value={f.key} className="text-xs cursor-pointer">
                                          <div className="flex flex-col gap-0.5 py-0.5">
                                            <span className="font-mono font-semibold text-slate-900 dark:text-white">{f.key}</span>
                                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[260px]">
                                              = {truncated}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  className="h-8.5 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs placeholder:text-slate-400"
                                  placeholder="e.g. data.email or user_phone"
                                  value={map.sourceField}
                                  onChange={(e) => updateFieldMapping(webhookId, index, "sourceField", e.target.value)}
                                />
                              )}
                            </div>

                            <div className="shrink-0 pt-4.5">
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>

                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1">
                                CRM DESTINATION FIELD
                              </Label>
                              <Select
                                value={map.targetField}
                                onValueChange={(val) => updateFieldMapping(webhookId, index, "targetField", val)}
                              >
                                <SelectTrigger className="h-8.5 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium">
                                  <SelectValue placeholder="Select CRM Field" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[200] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                  <SelectItem value="full_name" className="text-xs">Full Name</SelectItem>
                                  <SelectItem value="email" className="text-xs">Email</SelectItem>
                                  <SelectItem value="phone" className="text-xs">Phone</SelectItem>
                                  <SelectItem value="company" className="text-xs">Company</SelectItem>
                                  <SelectItem value="city" className="text-xs">City</SelectItem>
                                  <SelectItem value="profession" className="text-xs">Profession</SelectItem>
                                  <SelectItem value="deal_value" className="text-xs">Deal Value</SelectItem>
                                  <SelectItem value="notes" className="text-xs">Notes/Comments</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 shrink-0 mt-4.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              onClick={() => removeFieldMapping(webhookId, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                          <Webhook className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No field mappings configured</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Auto-Detect Fields&quot; or add mapping rows manually below.</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold h-9 rounded-xl text-xs transition-colors cursor-pointer"
                      onClick={() => addFieldMapping(webhookId)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Field Mapping Row
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Outbound Tab */}
              <TabsContent value="outgoing" className="space-y-5 focus-visible:outline-none">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">Destination Dispatch URL</Label>
                    <Input
                      type="url"
                      className="h-9.5 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                      placeholder="https://your-server.com/api/leads-callback"
                      value={activeWebhook.url || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWebhooks((prev) => prev.map((w) => (w.id === webhookId ? { ...w, url: val } : w)));
                      }}
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      LeadBajaar will send an HTTP POST payload with lead data to this URL whenever a lead is created or updated.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="h-4 w-4 text-blue-500" /> HMAC SECURITY SIGNATURE SECRET
                      </Label>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-8.5 px-3.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs",
                          copiedSecret
                            ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
                        )}
                        onClick={() => handleCopySecret(activeWebhook.webhook_secret || activeWebhook.secret || "")}
                      >
                        {copiedSecret ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCopy className="h-3.5 w-3.5" />
                            <span>Copy Secret</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs truncate select-all text-slate-800 dark:text-slate-200 shadow-2xs">
                      {activeWebhook.webhook_secret || activeWebhook.secret || "Auto-generated upon save"}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Outgoing payloads are signed using HMAC-SHA256. Use this secret to verify the <code className="font-mono text-[10px] bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded">X-LeadBajaar-Signature</code> header on your server.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Create Webhook Form */
            <div className="space-y-5 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Webhook Name</Label>
                <Input
                  className="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  value={newWebhook.name || ""}
                  onChange={(e) => setNewWebhook((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Website Contact Form, Zapier Lead Receiver, n8n Automation"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose a clear, descriptive name to identify this lead stream.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Destination URL (Optional for Inbound)</Label>
                <Input
                  type="url"
                  className="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  value={newWebhook.url || ""}
                  onChange={(e) => setNewWebhook((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-domain.com/webhook-receiver"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Leave blank if you are only receiving leads via LeadBajaar&apos;s inbound endpoint.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center text-center space-y-1.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ArrowDownToLine className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Inbound Webhook</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Accept leads from third-party websites or apps directly into CRM.</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center text-center space-y-1.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Send className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Outbound Webhook</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Forward CRM lead creations or updates to your external endpoints.</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Secure by Default
                </h4>
                <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>Unique per-integration UUID receiving URL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>HMAC-SHA256 payload signature verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>Real-time payload listener with auto-detection</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-none px-6 py-4 bg-slate-50/70 dark:bg-[#121A30] border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            className="rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs px-6 py-2.5 shadow-xs cursor-pointer"
            onClick={handleAction}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {webhookId ? "Saving Changes..." : "Creating Webhook..."}
              </>
            ) : (
              webhookId ? "Save Changes" : "Create Webhook"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
