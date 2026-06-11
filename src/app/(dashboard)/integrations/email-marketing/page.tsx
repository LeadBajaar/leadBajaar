"use client";

import React, { useState, useEffect } from "react";
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
import { Mail, Info, Send, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { integrationApi, api } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { TestEmailDialog } from "@/components/integrations/TestEmailDialog";

export default function EmailMarketingPage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  const [emailConfig, setEmailConfig] = useState<any>({
    provider: "ses",
    from_name: "",
    from_email: "",
    credentials: {},
    is_active: true
  });

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const res = await (integrationApi as any).get('/email/configurations');
      if (res.data && res.data.length > 0) {
        const active = res.data.find((c: any) => c.is_active) || res.data[0];
        setEmailConfig(active);
      }
    } catch (e) {
      console.warn("Could not fetch email config", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsConnecting(true);
    try {
      const method = emailConfig.id ? 'put' : 'post';
      const url = emailConfig.id ? `/email/configurations/${emailConfig.id}` : '/email/configurations';
      await api[method](url, emailConfig);
      toast.success('Email integration synchronized!');
      
      fetchEmailConfig();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error: any) {
      handleError(error, { title: "Failed to save configuration" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Email is required');
      return;
    }
    try {
      await api.post('/email/configurations/test', { email: testEmailAddress });
      toast.success('Professional test email dispatched!');
      setShowTestEmailDialog(false);
    } catch (error: any) {
      handleError(error, { title: "Test Email Failed" });
    }
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
        <div className="flex items-center gap-4 p-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-[8px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]"
            onClick={() => router.push('/integrations')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Email Integration</h1>
              <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
                Choose your provider and scale your automated revenue engine.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-2xl p-6 shadow-sm">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
                  Provider Type
                </Label>
                <Select
                  value={emailConfig.provider}
                  onValueChange={(v) => setEmailConfig({ ...emailConfig, provider: v })}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]">
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
                <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
                  Sender Name
                </Label>
                <Input
                  placeholder="e.g., John from LeadBajaar"
                  value={emailConfig.from_name}
                  onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                  className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
                  Sender Email
                </Label>
                <Input
                  placeholder="johndoe@yourdomain.com"
                  value={emailConfig.from_email}
                  onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                  className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {emailConfig.provider === "ses" && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                    />
                  </div>
                </div>
              )}

              {emailConfig.provider === "smtp" && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                        className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                        className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest pl-1">
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
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 shadow-sm mt-auto">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  Verify your sender email in dashboard. For Gmail, use an{" "}
                  <strong className="text-amber-800 dark:text-amber-300 underline underline-offset-2">
                    App Password
                  </strong>
                  .
                </p>
              </div>
            </div>
            
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-xl border-[var(--crm-border)] font-bold hover:bg-[var(--crm-surface-2)] transition-all flex items-center gap-2 group"
              onClick={() => setShowTestEmailDialog(true)}
            >
              Send Test Email{" "}
              <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              className="w-full sm:w-44 h-11 rounded-xl bg-[var(--crm-primary)] hover:opacity-90 font-black text-white shadow-xl dark:shadow-none transition-all"
              onClick={handleSave}
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
      </div>

      <TestEmailDialog
        isOpen={showTestEmailDialog}
        onOpenChange={setShowTestEmailDialog}
        email={testEmailAddress}
        setEmail={setTestEmailAddress}
        onSendTest={handleSendTestEmail}
      />
    </div>
  );
}
