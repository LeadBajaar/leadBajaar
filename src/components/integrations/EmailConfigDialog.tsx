"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Info, Send, Loader2, Sparkles, Server, CheckCircle2 } from "lucide-react";

interface EmailConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailConfig: any;
  setEmailConfig: (config: any) => void;
  onSave: (mode: "platform" | "custom") => Promise<void>;
  onSendTest: () => void;
  isConnecting: boolean;
}

export function EmailConfigDialog({
  isOpen,
  onOpenChange,
  emailConfig,
  setEmailConfig,
  onSave,
  onSendTest,
  isConnecting,
}: EmailConfigDialogProps) {
  const [activeMode, setActiveMode] = useState<"platform" | "custom">(
    emailConfig?.is_active && (emailConfig?.provider || emailConfig?.from_email) ? "custom" : "platform"
  );

  useEffect(() => {
    if (emailConfig?.is_active && (emailConfig?.provider || emailConfig?.from_email)) {
      setActiveMode("custom");
    } else {
      setActiveMode("platform");
    }
  }, [emailConfig]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-2xl p-0 overflow-hidden border border-gray-200/80 shadow-2xl dark:bg-slate-900">
        <div className="bg-gradient-to-br from-[#EBF3FF] via-[#EAE9FC] to-[#F1F3FE] dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 border-b border-gray-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/80 dark:bg-slate-800 text-[#2A3ED6] border border-blue-200/50">
              Delivery Settings
            </span>
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white satoshi-heading">
            Email Delivery Integration
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Choose between LeadBajaar's built-in platform mailer or your custom connected SES/SMTP.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setActiveMode("platform")}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                activeMode === "platform"
                  ? "bg-white dark:bg-slate-900 border-[#2A3ED6] ring-2 ring-[#2A3ED6]/10 shadow-sm"
                  : "bg-slate-50/60 dark:bg-slate-800/40 border-gray-200/80 dark:border-slate-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[#2A3ED6]" />
                <span className="font-bold text-[13px] text-slate-900 dark:text-white">Platform Mailer</span>
                {activeMode === "platform" && (
                  <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Managed high-speed delivery with zero setup required.
              </p>
            </div>

            <div
              onClick={() => setActiveMode("custom")}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                activeMode === "custom"
                  ? "bg-white dark:bg-slate-900 border-[#2A3ED6] ring-2 ring-[#2A3ED6]/10 shadow-sm"
                  : "bg-slate-50/60 dark:bg-slate-800/40 border-gray-200/80 dark:border-slate-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Server className="h-4 w-4 text-[#2A3ED6]" />
                <span className="font-bold text-[13px] text-slate-900 dark:text-white">Custom SES / SMTP</span>
                {activeMode === "custom" && (
                  <Badge className="bg-[#2A3ED6] text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Connect your private Amazon SES, SMTP, or Mailgun domain.
              </p>
            </div>
          </div>

          {activeMode === "platform" ? (
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                    LeadBajaar Platform Mailer Active
                  </h4>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                    All notifications, campaign sequences, and meeting confirmations are dispatched via LeadBajaar's verified delivery cloud. No API keys or domain DNS records needed.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                    Provider Type
                  </Label>
                  <Select
                    value={emailConfig.provider || "ses"}
                    onValueChange={(v) => setEmailConfig({ ...emailConfig, provider: v })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                      <SelectItem value="smtp">Direct SMTP / Gmail</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                    Sender Name
                  </Label>
                  <Input
                    placeholder="e.g., John from LeadBajaar"
                    value={emailConfig.from_name || ""}
                    onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                    Sender Email
                  </Label>
                  <Input
                    placeholder="johndoe@yourdomain.com"
                    value={emailConfig.from_email || ""}
                    onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {emailConfig.provider === "ses" && (
                  <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                        AWS Access Key
                      </Label>
                      <Input
                        type="password"
                        value={emailConfig.credentials?.key || ""}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            credentials: { ...emailConfig.credentials, key: e.target.value },
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                        AWS Secret Key
                      </Label>
                      <Input
                        type="password"
                        value={emailConfig.credentials?.secret || ""}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            credentials: { ...emailConfig.credentials, secret: e.target.value },
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                        AWS Region
                      </Label>
                      <Input
                        placeholder="us-east-1"
                        value={emailConfig.credentials?.region || ""}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            credentials: { ...emailConfig.credentials, region: e.target.value },
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                  </div>
                )}

                {emailConfig.provider === "smtp" && (
                  <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                          Host
                        </Label>
                        <Input
                          placeholder="smtp.gmail.com"
                          value={emailConfig.credentials?.host || ""}
                          onChange={(e) =>
                            setEmailConfig({
                              ...emailConfig,
                              credentials: { ...emailConfig.credentials, host: e.target.value },
                            })
                          }
                          className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                          Port
                        </Label>
                        <Input
                          placeholder="587"
                          value={emailConfig.credentials?.port || ""}
                          onChange={(e) =>
                            setEmailConfig({
                              ...emailConfig,
                              credentials: { ...emailConfig.credentials, port: e.target.value },
                            })
                          }
                          className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                        Username
                      </Label>
                      <Input
                        value={emailConfig.credentials?.username || ""}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            credentials: { ...emailConfig.credentials, username: e.target.value },
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                        Password
                      </Label>
                      <Input
                        type="password"
                        value={emailConfig.credentials?.password || ""}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            credentials: { ...emailConfig.credentials, password: e.target.value },
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 shadow-sm mt-auto">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-[10px] font-bold leading-relaxed">
                    Verify your sender email in dashboard. For Gmail, use an{" "}
                    <strong className="text-amber-800 dark:text-amber-300 underline underline-offset-2">
                      App Password
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group"
            onClick={onSendTest}
          >
            Send Test Email{" "}
            <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              className="h-11 px-6 rounded-xl font-bold dark:text-slate-400"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-44 h-11 rounded-xl bg-primary hover:bg-primary/90 font-black text-white shadow-xl shadow-primary/20 dark:shadow-none transition-all"
              onClick={() => onSave(activeMode)}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : activeMode === "platform" ? (
                "Use Platform Mailer"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

