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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Info, Send, Loader2 } from "lucide-react";

interface EmailConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailConfig: any;
  setEmailConfig: (config: any) => void;
  onSave: () => Promise<void>;
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl dark:bg-slate-900">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Mail className="h-7 w-7" />
              Email Integration
            </DialogTitle>
            <DialogDescription className="text-indigo-100/80 text-sm font-medium">
              Choose your provider and scale your automated revenue engine.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                  Provider Type
                </Label>
                <Select
                  value={emailConfig.provider}
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
                  value={emailConfig.from_name}
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
                  value={emailConfig.from_email}
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
              className="w-full sm:w-44 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
              onClick={onSave}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
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
