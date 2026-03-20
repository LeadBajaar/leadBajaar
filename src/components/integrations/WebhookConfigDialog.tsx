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
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>
            {webhookId ? "Edit Webhook" : "Create New Webhook"}
          </DialogTitle>
          <DialogDescription>
            {webhookId
              ? "Configure your webhook settings and payload mapping."
              : "Connect a new external source via webhook."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid gap-4 mt-2">
            {webhookId && activeWebhook ? (
              <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="incoming" className="gap-2">
                    <ArrowDownToLine className="h-4 w-4" /> Receive Leads
                  </TabsTrigger>
                  <TabsTrigger value="outgoing" className="gap-2">
                    <Send className="h-4 w-4" /> Dispatch Leads
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="incoming" className="space-y-6">
                  <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase text-primary flex items-center gap-2 tracking-wider">
                        <Globe className="h-3.5 w-3.5" /> Your Unique Receiver URL
                      </Label>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] animate-pulse">Live & Waiting</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[12px] p-3 bg-background border rounded-lg flex-1 font-mono break-all whitespace-normal shadow-sm">
                        {`https://api.leadbajaar.com/api/webhooks/incoming/${activeWebhook.uuid || ''}`}
                      </code>
                      <Button 
                        variant={copiedUrl ? "default" : "outline"} 
                        size={copiedUrl ? "default" : "icon"} 
                        className={cn("shrink-0 h-10 transition-all", copiedUrl ? "w-24 bg-green-600 hover:bg-green-700 border-none" : "w-10")} 
                        onClick={() => handleCopyUrl(`https://api.leadbajaar.com/api/webhooks/incoming/${activeWebhook.uuid || ''}`)}
                      >
                        {copiedUrl ? (
                          <div className="flex items-center text-xs font-bold text-white">
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Copied!
                          </div>
                        ) : (
                          <ClipboardCopy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Play className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Send a POST request with JSON payload to this URL. The system will automatically capture leads based on your mapping below.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Incoming Data Mapping</h4>
                        <p className="text-xs text-muted-foreground">Tell us which JSON fields match our CRM fields.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startListening(webhookId)}
                        disabled={isListening}
                        className={cn("h-8 text-xs", isListening && "bg-primary/5 border-primary/20")}
                      >
                        {isListening ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2 text-yellow-500 fill-yellow-500" />}
                        {isListening ? "Listening..." : "Auto-Detect Fields"}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {mapping.length > 0 ? (
                        <div className="grid gap-3">
                          {mapping.map((map, index) => (
                            <div key={index} className="group flex gap-3 items-center bg-muted/30 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all">
                              <div className="flex-1 space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Source Field (JSON Key)</Label>
                                {availableFields.length > 0 ? (
                                  <Select
                                    value={map.sourceField}
                                    onValueChange={(val) => updateFieldMapping(webhookId, index, "sourceField", val)}
                                  >
                                    <SelectTrigger className="h-9 bg-background shadow-sm">
                                      <SelectValue placeholder="Select field from payload" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableFields.map((f) => (
                                        <SelectItem key={f.key} value={f.key}>
                                          <div className="flex justify-between items-center w-full gap-4">
                                            <span className="font-medium">{f.key}</span>
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                              ({String(f.value)})
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    className="h-9 bg-background shadow-sm"
                                    placeholder="e.g. customer_name"
                                    value={map.sourceField}
                                    onChange={(e) => updateFieldMapping(webhookId, index, "sourceField", e.target.value)}
                                  />
                                )}
                              </div>
                              <div className="shrink-0 pt-5">
                                <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">CRM Target Field</Label>
                                <Select
                                  value={map.targetField}
                                  onValueChange={(val) => updateFieldMapping(webhookId, index, "targetField", val)}
                                >
                                  <SelectTrigger className="h-9 bg-background shadow-sm">
                                    <SelectValue placeholder="To CRM Field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="full_name">Full Name</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="company">Company</SelectItem>
                                    <SelectItem value="city">City</SelectItem>
                                    <SelectItem value="profession">Profession</SelectItem>
                                    <SelectItem value="deal_value">Deal Value</SelectItem>
                                    <SelectItem value="notes">Notes/Comment</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 mt-5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => removeFieldMapping(webhookId, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/10">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <Webhook className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">No field mappings defined yet.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px] mx-auto">Use "Auto-Detect" to quickly map fields from a test payload.</p>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full border-dashed border-2 h-10 hover:bg-primary/5 hover:border-primary/30 group"
                        onClick={() => addFieldMapping(webhookId)}
                      >
                        <Plus className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
                        Add Field Mapping
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outgoing" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Destination URL</Label>
                      <Input
                        type="url"
                        className="h-11 shadow-sm"
                        placeholder="https://your-server.com/callback"
                        value={activeWebhook.url || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWebhooks(prev => prev.map(w => w.id === webhookId ? { ...w, url: val } : w));
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground pl-1">
                        LeadBajaar will POST lead data to this URL whenever a new lead is captured.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 mt-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                          <ShieldCheck className="h-4 w-4" /> Security Secret
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-7 text-[10px] transition-all", copiedSecret ? "text-green-600 bg-green-50" : "text-orange-700 hover:bg-orange-100")}
                          onClick={() => handleCopySecret(activeWebhook.webhook_secret || activeWebhook.secret || '')}
                        >
                          {copiedSecret ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Copied!</>
                          ) : (
                            <><ClipboardCopy className="h-3 w-3 mr-1" /> Copy</>
                          )}
                        </Button>
                      </div>
                      <div className="bg-background/80 p-2 rounded border font-mono text-xs truncate select-all dark:bg-black/20">
                        {activeWebhook.webhook_secret || activeWebhook.secret || "Auto-generated upon save"}
                      </div>
                      <p className="text-[11px] text-orange-600/80 dark:text-orange-400/60 leading-relaxed italic">
                        Webhook payloads are signed using HMAC-SHA256. Use this secret to verify the `X-LeadBajaar-Signature` header in your server.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-5 py-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Webhook Name</Label>
                  <Input
                    className="h-11 shadow-sm"
                    value={newWebhook.name || ''}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Website Form, N8N Sync"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Choose a descriptive name to identify this source.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/20 flex flex-col items-center text-center space-y-2">
                    <ArrowDownToLine className="h-6 w-6 text-primary mb-1" />
                    <p className="text-xs font-bold uppercase tracking-wider">Receiver</p>
                    <p className="text-[10px] text-muted-foreground">Accept leads from outside into LeadBajaar</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/20 flex flex-col items-center text-center space-y-2">
                    <Send className="h-6 w-6 text-primary mb-1" />
                    <p className="text-xs font-bold uppercase tracking-wider">Dispatcher</p>
                    <p className="text-[10px] text-muted-foreground">Send captured leads to your own servers</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <h4 className="text-xs font-bold uppercase text-primary mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Secure by Default
                  </h4>
                  <ul className="text-[11px] space-y-2 text-muted-foreground">
                    <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1 shrink-0" />
                      <span>Unique per-integration UUID endpoint</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1 shrink-0" />
                      <span>HMAC-SHA256 payload signing for outgoing data</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1 shrink-0" />
                      <span>Real-time field mapping & auto-detection</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-none">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
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
