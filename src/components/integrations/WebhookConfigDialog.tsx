"use client";

import React from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Globe,
  Webhook,
  CheckCircle2,
  ArrowDownToLine,
  ArrowRight,
  Send,
  LucideIcon,
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
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [copiedSecret, setCopiedSecret] = React.useState(false);

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

  const activeWebhook = (webhookId ? webhooks.find(w => w.id === webhookId) : null) || (isOpen && !webhookId ? newWebhook : null);
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
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden border border-[var(--crm-border)] bg-[var(--crm-bg)] shadow-xl">
        <div className="bg-[var(--crm-surface-1)] border-b border-[var(--crm-border)] p-5 flex-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[var(--crm-text-primary)] flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-[var(--crm-surface-3)] flex items-center justify-center">
                <Webhook className="h-4 w-4 text-[var(--crm-text-secondary)]" />
              </div>
              {webhookId ? "Edit Webhook" : "Create New Webhook"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--crm-text-secondary)] mt-1 ml-[44px]">
              {webhookId
                ? "Configure your webhook settings and payload mapping."
                : "Connect a new external source via webhook."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid gap-4 mt-2">
            {webhookId && activeWebhook ? (
              <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[var(--crm-surface-2)] p-1 rounded-lg">
                  <TabsTrigger value="incoming" className="gap-2 rounded-md data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:text-[var(--crm-text-primary)] text-[var(--crm-text-secondary)]">
                    <ArrowDownToLine className="h-3.5 w-3.5" /> Receive Leads
                  </TabsTrigger>
                  <TabsTrigger value="outgoing" className="gap-2 rounded-md data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:text-[var(--crm-text-primary)] text-[var(--crm-text-secondary)]">
                    <Send className="h-3.5 w-3.5" /> Dispatch Leads
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="incoming" className="space-y-6">
                  <div className="p-4 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-mono tracking-wider text-[var(--crm-text-secondary)] flex items-center gap-2">
                        RECEIVER_URL
                      </Label>
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs p-2 bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-md flex-1 font-mono text-[var(--crm-text-primary)] break-all whitespace-normal shadow-sm">
                        {`https://api.leadbajaar.com/api/webhooks/incoming/${activeWebhook.uuid || ''}`}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("shrink-0 h-9 rounded-md transition-all border border-[var(--crm-border)]", copiedUrl ? "w-24 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" : "w-9 bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)]")} 
                        onClick={() => handleCopyUrl(`https://api.leadbajaar.com/api/webhooks/incoming/${activeWebhook.uuid || ''}`)}
                      >
                        {copiedUrl ? (
                          <div className="flex items-center text-[10px] font-mono tracking-wider">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            COPIED
                          </div>
                        ) : (
                          <ClipboardCopy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <div className="h-4 w-4 rounded-sm bg-[var(--crm-surface-3)] flex items-center justify-center shrink-0 mt-0.5">
                        <Play className="h-2.5 w-2.5 text-[var(--crm-text-secondary)]" />
                      </div>
                      <p className="text-[11px] text-[var(--crm-text-tertiary)] leading-relaxed">
                        Send a POST request with JSON payload to this URL. The system will automatically capture leads based on your mapping below.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-[var(--crm-text-primary)]">Incoming Data Mapping</h4>
                        <p className="text-[11px] text-[var(--crm-text-tertiary)]">Map JSON paths to CRM fields. Supports nested data via dot-notation (e.g. <code className="font-mono text-[10px] bg-[var(--crm-surface-2)] border border-[var(--crm-border)] px-1 py-0.5 rounded text-[var(--crm-text-secondary)]">body.data.13</code>).</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startListening(webhookId)}
                        disabled={isListening}
                        className={cn("h-8 text-xs rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)]", isListening && "bg-[var(--crm-surface-2)] text-[var(--crm-text-tertiary)]")}
                      >
                        {isListening ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Zap className="h-3.5 w-3.5 mr-2 text-[var(--crm-text-secondary)]" />}
                        {isListening ? "Listening..." : "Auto-Detect Fields"}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {mapping.length > 0 ? (
                        <div className="grid gap-2">
                          {mapping.map((map, index) => (
                            <div key={index} className="group flex gap-3 items-center bg-[var(--crm-surface-2)] p-2 rounded-lg border border-[var(--crm-border)] hover:border-[var(--crm-text-tertiary)] transition-all">
                              <div className="flex-1 space-y-1">
                                <Label className="text-[10px] font-mono tracking-wider text-[var(--crm-text-tertiary)] ml-1">JSON_PATH</Label>
                                {availableFields.length > 0 ? (
                                  <Select
                                    value={map.sourceField}
                                    onValueChange={(val) => updateFieldMapping(webhookId, index, "sourceField", val)}
                                  >
                                    <SelectTrigger className="h-8 bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-primary)] rounded-md font-mono text-xs">
                                      <SelectValue placeholder="Select field from payload">
                                        {map.sourceField && (
                                          <span>{map.sourceField}</span>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[280px] bg-[var(--crm-surface-1)] border-[var(--crm-border)]">
                                      {availableFields.map((f) => {
                                        const preview = f.value === null ? 'null' : f.value === '' ? '(empty)' : String(f.value);
                                        const truncated = preview.length > 80 ? preview.slice(0, 77) + '...' : preview;
                                        return (
                                          <SelectItem key={f.key} value={f.key} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)] focus:text-[var(--crm-text-primary)] cursor-pointer">
                                            <div className="flex flex-col gap-0.5 py-0.5">
                                              <span className="font-mono text-[11px] text-[var(--crm-text-primary)]">{f.key}</span>
                                              <span className="text-[10px] text-[var(--crm-text-tertiary)] font-mono truncate max-w-[280px]">
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
                                    className="h-8 bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-primary)] rounded-md font-mono text-xs placeholder-[var(--crm-text-tertiary)]"
                                    placeholder="e.g. body.data.12 or body.event"
                                    value={map.sourceField}
                                    onChange={(e) => updateFieldMapping(webhookId, index, "sourceField", e.target.value)}
                                  />
                                )}
                              </div>
                              <div className="shrink-0 pt-5">
                                <ArrowRight className="h-3.5 w-3.5 text-[var(--crm-text-tertiary)]" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label className="text-[10px] font-mono tracking-wider text-[var(--crm-text-tertiary)] ml-1">CRM_FIELD</Label>
                                <Select
                                  value={map.targetField}
                                  onValueChange={(val) => updateFieldMapping(webhookId, index, "targetField", val)}
                                >
                                  <SelectTrigger className="h-8 bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-primary)] rounded-md text-xs">
                                    <SelectValue placeholder="To CRM Field" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[var(--crm-surface-1)] border-[var(--crm-border)]">
                                    <SelectItem value="full_name" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Full Name</SelectItem>
                                    <SelectItem value="email" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Email</SelectItem>
                                    <SelectItem value="phone" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Phone</SelectItem>
                                    <SelectItem value="company" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Company</SelectItem>
                                    <SelectItem value="city" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">City</SelectItem>
                                    <SelectItem value="profession" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Profession</SelectItem>
                                    <SelectItem value="deal_value" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Deal Value</SelectItem>
                                    <SelectItem value="notes" className="text-xs text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-3)]">Notes/Comment</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 mt-5 rounded-md text-[var(--crm-text-tertiary)] hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => removeFieldMapping(webhookId, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border border-dashed border-[var(--crm-border)] rounded-xl bg-[var(--crm-surface-2)]">
                          <div className="h-8 w-8 rounded-md bg-[var(--crm-surface-3)] flex items-center justify-center mx-auto mb-3">
                            <Webhook className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                          </div>
                          <p className="text-sm text-[var(--crm-text-secondary)]">No field mappings defined.</p>
                          <p className="text-xs text-[var(--crm-text-tertiary)] mt-1 max-w-[200px] mx-auto">Use "Auto-Detect" to quickly map fields from a test payload.</p>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full border border-dashed border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-2)] hover:border-[var(--crm-text-tertiary)] text-[var(--crm-text-secondary)] h-9 rounded-lg transition-colors group"
                        onClick={() => addFieldMapping(webhookId)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field Mapping
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outgoing" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[var(--crm-text-primary)]">Destination URL</Label>
                      <Input
                        type="url"
                        className="h-9 bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-primary)] rounded-md"
                        placeholder="https://your-server.com/callback"
                        value={activeWebhook.url || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWebhooks(prev => prev.map(w => w.id === webhookId ? { ...w, url: val } : w));
                        }}
                      />
                      <p className="text-[11px] text-[var(--crm-text-tertiary)] pl-1">
                        LeadBajaar will POST lead data to this URL whenever a new lead is captured.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] mt-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-mono tracking-wider flex items-center gap-2 text-[var(--crm-text-secondary)]">
                          <ShieldCheck className="h-3.5 w-3.5" /> SECURITY_SECRET
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-7 text-[10px] rounded-md transition-all", copiedSecret ? "text-green-500 bg-green-500/10" : "text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]")}
                          onClick={() => handleCopySecret(activeWebhook.webhook_secret || activeWebhook.secret || '')}
                        >
                          {copiedSecret ? (
                            <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> COPIED</>
                          ) : (
                            <><ClipboardCopy className="h-3.5 w-3.5 mr-1" /> COPY</>
                          )}
                        </Button>
                      </div>
                      <div className="bg-[var(--crm-bg)] p-2.5 rounded-md border border-[var(--crm-border)] font-mono text-xs truncate select-all text-[var(--crm-text-primary)]">
                        {activeWebhook.webhook_secret || activeWebhook.secret || "Auto-generated upon save"}
                      </div>
                      <p className="text-[11px] text-[var(--crm-text-tertiary)] leading-relaxed italic">
                        Webhook payloads are signed using HMAC-SHA256. Use this secret to verify the `X-LeadBajaar-Signature` header in your server.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-5 py-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[var(--crm-text-primary)]">Webhook Name</Label>
                  <Input
                    className="h-9 bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-primary)] rounded-md"
                    value={newWebhook.name || ''}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Website Form, N8N Sync"
                  />
                  <p className="text-[11px] text-[var(--crm-text-tertiary)] mt-1">Choose a descriptive name to identify this source.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] flex flex-col items-center text-center space-y-2">
                    <ArrowDownToLine className="h-5 w-5 text-[var(--crm-text-secondary)] mb-1" />
                    <p className="text-[10px] font-mono tracking-wider text-[var(--crm-text-primary)]">RECEIVER</p>
                    <p className="text-[10px] text-[var(--crm-text-tertiary)]">Accept leads from outside into LeadBajaar</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] flex flex-col items-center text-center space-y-2">
                    <Send className="h-5 w-5 text-[var(--crm-text-secondary)] mb-1" />
                    <p className="text-[10px] font-mono tracking-wider text-[var(--crm-text-primary)]">DISPATCHER</p>
                    <p className="text-[10px] text-[var(--crm-text-tertiary)]">Send captured leads to your own servers</p>
                  </div>
                </div>

                <div className="bg-[var(--crm-surface-2)] p-4 rounded-xl border border-[var(--crm-border)]">
                  <h4 className="text-[10px] font-mono tracking-wider text-[var(--crm-text-primary)] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" /> SECURE BY DEFAULT
                  </h4>
                  <ul className="text-[11px] space-y-2 text-[var(--crm-text-tertiary)]">
                    <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--crm-text-secondary)] mt-1 shrink-0" />
                      <span>Unique per-integration UUID endpoint</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--crm-text-secondary)] mt-1 shrink-0" />
                      <span>HMAC-SHA256 payload signing for outgoing data</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--crm-text-secondary)] mt-1 shrink-0" />
                      <span>Real-time field mapping & auto-detection</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-none p-5 bg-[var(--crm-surface-1)] border-t border-[var(--crm-border)]">
          <Button variant="ghost" className="rounded-md font-semibold text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)]" onClick={handleCancel}>Cancel</Button>
          <Button 
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 font-semibold px-6 shadow-none text-white"
            onClick={handleAction} 
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {webhookId ? "Saving..." : "Connecting..."}
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
