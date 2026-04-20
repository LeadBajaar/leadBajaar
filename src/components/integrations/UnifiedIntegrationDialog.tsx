"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Globe,
  ClipboardCopy,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UnifiedIntegrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIntegrationId: string | null;
  integrations: any[];
  currentUserId: number | undefined;
  whatsappConfig: any;
  setWhatsappConfig: (config: any) => void;
  facebookConfig: any;
  setFacebookConfig: (config: any) => void;
  facebookConversionApiConfig: any;
  setFacebookConversionApiConfig: (config: any) => void;
  configErrors: any;
  isConnecting: boolean;
  onSave: () => Promise<void>;
}

export function UnifiedIntegrationDialog({
  isOpen,
  onOpenChange,
  selectedIntegrationId,
  integrations,
  currentUserId,
  whatsappConfig,
  setWhatsappConfig,
  facebookConfig,
  setFacebookConfig,
  facebookConversionApiConfig,
  setFacebookConversionApiConfig,
  configErrors,
  isConnecting,
  onSave,
}: UnifiedIntegrationDialogProps) {
  const selectedIntegration = integrations.find(
    (i) => i.id === selectedIntegrationId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl dark:bg-slate-900">
        <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Settings className="h-4 w-4 text-indigo-400" />
              </div>
              {selectedIntegration?.name} Configuration
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Configure your credentials and settings for this integration.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-6">
            {selectedIntegrationId === "whatsapp" ? (
              <div className="grid gap-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4 mb-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase text-primary flex items-center gap-2 tracking-wider">
                      <Globe className="h-3.5 w-3.5" /> WhatsApp Webhook
                      Configuration
                    </Label>
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                      Meta Dashboard Setup
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">
                        Cloud API Webhook URL
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] p-2.5 bg-background border rounded-lg flex-1 font-mono break-all whitespace-normal shadow-sm">
                          {`https://api.leadbajaar.com/api/webhook/whatsapp?id=${currentUserId}`}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-9 w-9"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://api.leadbajaar.com/api/webhook/whatsapp?id=${currentUserId}`
                            );
                            toast.success("Webhook URL Copied!");
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">
                        Verify Token
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] p-2.5 bg-background border rounded-lg flex-1 font-mono shadow-sm">
                          123abc
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-9 w-9"
                          onClick={() => {
                            navigator.clipboard.writeText("123abc");
                            toast.success("Verify Token Copied!");
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-blue-600" />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Copy these values into your Meta Developer Dashboard under{" "}
                      <strong>WhatsApp → Configuration</strong> to enable
                      messaging features.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number ID</Label>
                  <Input
                    placeholder="Enter Phone Number ID"
                    value={whatsappConfig.phoneNumberId}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        phoneNumberId: e.target.value,
                      })
                    }
                    className={cn(
                      configErrors.phoneNumberId && "border-red-500"
                    )}
                  />
                  {configErrors.phoneNumberId && (
                    <p className="text-xs text-red-500">
                      {configErrors.phoneNumberId}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>WABA ID</Label>
                  <Input
                    placeholder="Enter WABA ID"
                    value={whatsappConfig.wabaId}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        wabaId: e.target.value,
                      })
                    }
                    className={cn(configErrors.wabaId && "border-red-500")}
                  />
                  {configErrors.wabaId && (
                    <p className="text-xs text-red-500">{configErrors.wabaId}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    placeholder="Enter Access Token"
                    value={whatsappConfig.accessToken}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        accessToken: e.target.value,
                      })
                    }
                    className={cn(configErrors.accessToken && "border-red-500")}
                  />
                  {configErrors.accessToken && (
                    <p className="text-xs text-red-500">
                      {configErrors.accessToken}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-templates-unified"
                    checked={whatsappConfig.enableTemplates}
                    onCheckedChange={(checked) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        enableTemplates: checked,
                      })
                    }
                  />
                  <Label htmlFor="enable-templates-unified">
                    Enable Message Templates
                  </Label>
                </div>
              </div>
            ) : selectedIntegrationId === "leadform" ||
              selectedIntegrationId === "facebook" ? (
              <div className="grid gap-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4 mb-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase text-primary flex items-center gap-2 tracking-wider">
                      <Globe className="h-3.5 w-3.5" /> Facebook Lead Form
                      Webhook
                    </Label>
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                      Meta Dashboard Setup
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">
                        Webhook URL
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] p-2.5 bg-background border rounded-lg flex-1 font-mono break-all whitespace-normal shadow-sm">
                          {`https://api.leadbajaar.com/api/webhook/leadform?id=${currentUserId}`}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-9 w-9"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://api.leadbajaar.com/api/webhook/leadform?id=${currentUserId}`
                            );
                            toast.success("Lead Form URL Copied!");
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">
                        Verify Token
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] p-2.5 bg-background border rounded-lg flex-1 font-mono shadow-sm">
                          123abc
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-9 w-9"
                          onClick={() => {
                            navigator.clipboard.writeText("123abc");
                            toast.success("Verify Token Copied!");
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-blue-600" />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Copy these values into your Meta Developer Dashboard under{" "}
                      <strong>Webhooks → Leadgen</strong> to enable real-time
                      lead capture.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lead Form Name</Label>
                  <Input
                    placeholder="Enter Project Name"
                    value={facebookConfig.leadFormName}
                    onChange={(e) =>
                      setFacebookConfig({
                        ...facebookConfig,
                        leadFormName: e.target.value,
                      })
                    }
                    className={cn(
                      configErrors.leadFormName && "border-red-500"
                    )}
                  />
                  {configErrors.leadFormName && (
                    <p className="text-xs text-red-500">
                      {configErrors.leadFormName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Page ID</Label>
                  <Input
                    placeholder="Enter Page ID"
                    value={facebookConfig.pageId}
                    onChange={(e) =>
                      setFacebookConfig({
                        ...facebookConfig,
                        pageId: e.target.value,
                      })
                    }
                    className={cn(configErrors.pageId && "border-red-500")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Form ID</Label>
                  <Input
                    placeholder="Enter Form ID"
                    value={facebookConfig.formId}
                    onChange={(e) =>
                      setFacebookConfig({
                        ...facebookConfig,
                        formId: e.target.value,
                      })
                    }
                    className={cn(configErrors.formId && "border-red-500")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    placeholder="Enter Access Token"
                    value={facebookConfig.accessToken}
                    onChange={(e) =>
                      setFacebookConfig({
                        ...facebookConfig,
                        accessToken: e.target.value,
                      })
                    }
                    className={cn(configErrors.fbAccessToken && "border-red-500")}
                  />
                </div>
              </div>
            ) : selectedIntegrationId === "facebook_conversion_api" ? (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Pixel ID</Label>
                  <Input
                    placeholder="Enter Pixel ID"
                    value={facebookConversionApiConfig.pixelId}
                    onChange={(e) =>
                      setFacebookConversionApiConfig({
                        ...facebookConversionApiConfig,
                        pixelId: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Page Name</Label>
                  <Input
                    placeholder="Enter Page Name"
                    value={facebookConversionApiConfig.pageName}
                    onChange={(e) =>
                      setFacebookConversionApiConfig({
                        ...facebookConversionApiConfig,
                        pageName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    placeholder="Enter Access Token"
                    value={facebookConversionApiConfig.accessToken}
                    onChange={(e) =>
                      setFacebookConversionApiConfig({
                        ...facebookConversionApiConfig,
                        accessToken: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <p className="text-sm text-muted-foreground">
                  Standard configuration for this service.
                </p>
                <div className="space-y-2">
                  <Label>API Key / Token</Label>
                  <Input type="password" placeholder="Enter API Key" />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-none p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800">
          <Button
            variant="ghost"
            className="rounded-xl font-bold dark:text-slate-400"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-lg shadow-indigo-200 dark:shadow-none"
            onClick={onSave}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Configuration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
