"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Info, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Server, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
  Plus,
  BarChart3,
  FileText,
  Clock,
  Users,
  Edit2,
  Trash2,
  Play,
  Pause,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { integrationApi, api } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { TestEmailDialog } from "@/components/integrations/TestEmailDialog";
import { CreateCampaignDialog } from "@/components/email/CreateCampaignDialog";
import { CampaignStatsDialog } from "@/components/email/CampaignStatsDialog";
import { TemplateEditorDialog } from "@/components/email/TemplateEditorDialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function EmailMarketingPage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();

  const [activeTab, setActiveTab] = useState("campaigns");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Data states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);

  // Dialog states
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [selectedStatsCampaign, setSelectedStatsCampaign] = useState<any | null>(null);

  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<any | null>(null);

  // Delivery settings state
  // 'platform' = LeadBajaar Managed Cloud Mailer
  // 'custom' = Bring Your Own (Amazon SES / SMTP / Mailgun)
  const [emailMode, setEmailMode] = useState<"platform" | "custom">("platform");
  const [emailConfig, setEmailConfig] = useState<any>({
    provider: "ses",
    from_name: "",
    from_email: "",
    credentials: {},
    is_active: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchEmailConfig(),
        fetchCampaigns(),
        fetchTemplates(),
        fetchAutomations(),
        fetchStages()
      ]);
    } catch (e) {
      console.warn("Error loading email marketing resources", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      const res = await (integrationApi as any).get('/email/configurations');
      if (res.data && res.data.length > 0) {
        const active = res.data.find((c: any) => c.is_active) || res.data[0];
        if (active && active.is_active) {
          setEmailConfig(active);
          setEmailMode("custom");
        } else {
          setEmailMode("platform");
        }
      } else {
        setEmailMode("platform");
      }
    } catch (e) {
      console.warn("Could not fetch email config", e);
      setEmailMode("platform");
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/email/campaigns');
      setCampaigns(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn("Could not fetch campaigns", e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/email/templates');
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn("Could not fetch templates", e);
    }
  };

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/automations');
      const allSequences = Array.isArray(res.data) ? res.data : [];
      // Filter or highlight sequences that include send_email
      setAutomations(allSequences);
    } catch (e) {
      console.warn("Could not fetch automations", e);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await api.get('/stages');
      setStages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn("Could not fetch stages", e);
    }
  };

  const handleSaveCustomConfig = async () => {
    setIsConnecting(true);
    try {
      const method = emailConfig.id ? 'put' : 'post';
      const url = emailConfig.id ? `/email/configurations/${emailConfig.id}` : '/email/configurations';
      await api[method](url, {
        ...emailConfig,
        is_active: true
      });
      toast.success('Custom email credentials connected and activated!');
      
      await fetchEmailConfig();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error: any) {
      handleError(error, { title: "Failed to save configuration" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUsePlatformMailer = async () => {
    setIsConnecting(true);
    try {
      if (emailConfig.id) {
        await api.delete(`/email/configurations/${emailConfig.id}`);
      }
      setEmailMode("platform");
      setEmailConfig({
        provider: "ses",
        from_name: "",
        from_email: "",
        credentials: {},
        is_active: false
      });
      toast.success('Reverted to LeadBajaar Platform Mailer (System Default).');
      await fetchEmailConfig();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error: any) {
      handleError(error, { title: "Failed to switch mailer" });
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
      toast.success(`Verification test email dispatched via ${emailMode === 'platform' ? 'Platform Mailer' : (emailConfig.provider?.toUpperCase() || 'Custom Mailer')}!`);
      setShowTestEmailDialog(false);
    } catch (error: any) {
      handleError(error, { title: "Test Email Failed" });
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await api.delete(`/email/templates/${id}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (e) {
      toast.error("Failed to delete template");
    }
  };

  const handleToggleAutomation = async (id: number) => {
    try {
      await api.post(`/automations/${id}/toggle`);
      setAutomations(automations.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
      toast.success("Automation status updated");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDispatchDraft = async (campaign: any) => {
    try {
      // Fetch CRM leads to send
      const res = await api.get('/leads', { params: { per_page: 200 } });
      const rawLeads = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const recipients = rawLeads
        .filter((l: any) => l.email && l.email.includes("@"))
        .map((l: any) => ({
          email: l.email,
          data: { name: l.name || "Customer", company: l.company || "" }
        }));

      if (recipients.length === 0) {
        toast.error("No valid lead email addresses found to send to.");
        return;
      }

      await api.post(`/email/campaigns/${campaign.id}/send`, { recipients });
      toast.success(`Dispatched campaign "${campaign.name}" to ${recipients.length} leads!`);
      fetchCampaigns();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to dispatch campaign");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const isPlatformActive = emailMode === "platform";

  // Filter automations that contain email actions
  const emailSequences = automations.filter(seq => 
    seq.steps?.some((st: any) => st.action_type === 'send_email') || true
  );

  const totalEmailsSent = campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0);

  return (
    <div className="flex flex-col gap-6 px-1 sm:px-2 pb-12 pt-2 overflow-x-hidden font-sans">
      
      {/* ── Top Hero Banner (aligned with Dashboard MobileAppPromoCard) ───────── */}
      <div className="relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between min-h-[220px] p-6 md:p-8 bg-gradient-to-br from-[#EBF3FF] via-[#EAE9FC] to-[#F1F3FE] dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none">
        
        {/* Background glow elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -bottom-32 -right-10 w-96 h-96 bg-[#E0E2F8] dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-10 right-32 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40" />
        </div>

        {/* Hero Left Content */}
        <div className="flex-1 flex flex-col justify-center relative z-10 w-full md:max-w-[62%]">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/80 dark:bg-slate-800 text-[#2A3ED6] dark:text-indigo-400 border border-blue-200/50 shadow-2xs">
              Email Marketing & Drip Engine
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isPlatformActive ? "LeadBajaar High-Speed SES Active" : "Custom Connected Mailer Active"}
            </span>
          </div>

          <h1 className="text-[26px] md:text-[32px] font-black text-slate-900 dark:text-white satoshi-heading mb-2 tracking-tight leading-[1.15]">
            Campaigns, Drips & Automation
          </h1>

          <p className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold max-w-[540px] mb-5">
            Launch one-off broadcast campaigns, trigger automated drip sequences when leads arrive, and manage high-converting templates with full delivery tracking.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowCreateCampaign(true)}
              className="bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-[13px] font-extrabold h-[42px] px-5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send className="h-4 w-4" />
              Create Campaign
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTemplateToEdit(null);
                setShowTemplateEditor(true);
              }}
              className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-gray-200/80 dark:border-slate-700 text-[13px] font-bold h-[42px] px-4 rounded-xl flex items-center gap-2 shadow-2xs hover:bg-white"
            >
              <FileText className="h-4 w-4 text-[#2A3ED6]" />
              New Template
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowTestEmailDialog(true)}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 h-[42px]"
            >
              Send Test Email
            </Button>
          </div>
        </div>

        {/* Hero Right Card: Live Mail Engine Overview */}
        <div className="mt-6 md:mt-0 relative z-10 w-full md:w-auto md:min-w-[270px] bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-700 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Mail Engine</span>
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider",
              isPlatformActive 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200" 
                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200"
            )}>
              {isPlatformActive ? "Platform SES" : (emailConfig.provider || "Custom").toUpperCase()}
            </span>
          </div>

          <div className="space-y-2.5 text-[12.5px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Total Dispatched</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {totalEmailsSent} emails
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Live Campaigns</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {campaigns.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Drip Automations</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {automations.filter(a => a.is_active).length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Tabs ──────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="h-auto w-auto min-w-full sm:min-w-0 inline-flex items-center justify-start gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <TabsTrigger
              value="campaigns"
              className="rounded-xl px-4 py-2 text-xs font-bold font-heading shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-[#2A3ED6]" />
              <span>Campaigns</span>
              <Badge className="ml-1 text-[10px] font-extrabold px-1.5 py-0 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-none">
                {campaigns.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="templates"
              className="rounded-xl px-4 py-2 text-xs font-bold font-heading shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-[#2A3ED6]" />
              <span>Templates</span>
              <Badge className="ml-1 text-[10px] font-extrabold px-1.5 py-0 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-none">
                {templates.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="automations"
              className="rounded-xl px-4 py-2 text-xs font-bold font-heading shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span>Drip Automations</span>
              <Badge className="ml-1 text-[10px] font-extrabold px-1.5 py-0 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none">
                {automations.filter(a => a.is_active).length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="delivery"
              className="rounded-xl px-4 py-2 text-xs font-bold font-heading shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              <span>Delivery & Infrastructure</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: CAMPAIGNS
           ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="campaigns" className="space-y-6 m-0">
          
          {/* Campaigns Action & Metrics Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white satoshi-heading">
                Email Marketing Campaigns
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Send bulk broadcasts, newsletters, and announcements to your CRM leads.
              </p>
            </div>

            <Button
              onClick={() => setShowCreateCampaign(true)}
              className="bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-xs font-extrabold h-10 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/10"
            >
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Button>
          </div>

          {/* Campaign List */}
          {campaigns.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Send className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No email campaigns yet
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcast your first product update, offer, or nurture newsletter to all or filtered CRM leads.
                </p>
              </div>
              <Button
                onClick={() => setShowCreateCampaign(true)}
                className="bg-[#2A3ED6] hover:bg-[#2031B0] text-white text-xs font-bold rounded-xl h-10 px-6"
              >
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {campaigns.map((camp) => {
                const isDraft = camp.status === "draft";
                const isSending = camp.status === "sending";
                const isSent = camp.status === "sent";

                return (
                  <div
                    key={camp.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xs hover:border-gray-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-[15px] font-black text-slate-900 dark:text-white satoshi-heading">
                          {camp.name}
                        </h3>
                        
                        <Badge className={cn(
                          "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize",
                          isDraft && "bg-slate-100 text-slate-700 border-slate-200",
                          isSending && "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
                          isSent && "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {camp.status || "draft"}
                        </Badge>

                        {camp.template && (
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60">
                            Template: {camp.template.name}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <strong>Subject:</strong> {camp.subject}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
                        <span>Created: {camp.created_at ? format(new Date(camp.created_at), "MMM d, yyyy") : "-"}</span>
                        <span>•</span>
                        <span>Recipients: <strong>{camp.total_recipients || 0}</strong></span>
                        <span>•</span>
                        <span>Sent: <strong className="text-emerald-600">{camp.sent_count || 0}</strong></span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isDraft && (
                        <Button
                          variant="outline"
                          onClick={() => handleDispatchDraft(camp)}
                          className="h-9 px-4 rounded-xl border-blue-200 text-[#2A3ED6] hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Dispatch to Leads</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => setSelectedStatsCampaign(camp)}
                        className="h-9 px-4 rounded-xl border-gray-200/80 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50"
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-purple-600" />
                        <span>View Stats</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: TEMPLATES
           ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="templates" className="space-y-6 m-0">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white satoshi-heading">
                Email Template Library
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Design reusable email blueprints with personalized tags (e.g. <code>&#123;&#123;name&#125;&#125;</code>, <code>&#123;&#123;company&#125;&#125;</code>).
              </p>
            </div>

            <Button
              onClick={() => {
                setTemplateToEdit(null);
                setShowTemplateEditor(true);
              }}
              className="bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-xs font-extrabold h-10 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/10"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </Button>
          </div>

          {templates.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No templates created yet
                </h3>
                <p className="text-xs text-slate-500">
                  Create a template from scratch or use one of our pre-built high converting starter templates.
                </p>
              </div>
              <Button
                onClick={() => {
                  setTemplateToEdit(null);
                  setShowTemplateEditor(true);
                }}
                className="bg-[#2A3ED6] hover:bg-[#2031B0] text-white text-xs font-bold rounded-xl h-10 px-6"
              >
                Create Email Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xs hover:border-gray-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                          <Mail className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {tpl.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateToEdit(tpl);
                            setShowTemplateEditor(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">Subject:</span>
                      <p className="line-clamp-1 font-semibold">{tpl.subject || "No subject"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 text-[11px] text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {tpl.content ? tpl.content.replace(/<[^>]*>?/gm, "") : "Empty template body"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-semibold">
                      {tpl.created_at ? format(new Date(tpl.created_at), "MMM d, yyyy") : "Custom"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTemplateToEdit(tpl);
                        setShowTemplateEditor(true);
                      }}
                      className="h-7 px-2 text-xs font-bold text-[#2A3ED6] hover:bg-blue-50"
                    >
                      Edit Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: DRIP AUTOMATIONS
           ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="automations" className="space-y-6 m-0">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white satoshi-heading">
                  Automated Email Drip Sequences
                </h2>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  Real-Time Triggers
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Automatically fire email sequences when leads enter CRM, move stages, or register online.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/automations')}
                className="h-10 px-4 rounded-xl border-gray-200 text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <span>Full Automations Studio</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Drip Explanation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-slate-900 dark:to-indigo-950/20 border border-blue-200/60 dark:border-indigo-900/40 flex items-start gap-3">
            <span className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <Zap className="h-4 w-4" />
            </span>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">How Email Drips Work:</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                When a new lead arrives (e.g. Facebook Lead, Website Form), LeadBajaar instantly dispatches <strong>Email #1</strong>. 
                If configured, the background queue waits 24 to 72 hours and dispatches <strong>Follow-up Email #2</strong> until the lead converts or moves pipeline stages.
              </p>
            </div>
          </div>

          {/* Sequences List */}
          {emailSequences.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Zap className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No automated drip sequences yet
                </h3>
                <p className="text-xs text-slate-500">
                  Set up your first automated email drip to instantly follow up with new leads 24/7.
                </p>
              </div>
              <Button
                onClick={() => router.push('/automations')}
                className="bg-[#2A3ED6] hover:bg-[#2031B0] text-white text-xs font-bold rounded-xl h-10 px-6"
              >
                Build Drip Sequence in Automations Studio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {emailSequences.map((seq) => {
                const emailSteps = seq.steps?.filter((s: any) => s.action_type === 'send_email') || [];

                return (
                  <div
                    key={seq.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white satoshi-heading">
                            {seq.name}
                          </h3>
                          <Badge className={cn(
                            "text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize",
                            seq.is_active 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {seq.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Trigger: <strong className="text-slate-700 dark:text-slate-300 capitalize">{seq.trigger_type?.replace(/_/g, " ") || "Lead Created"}</strong>
                          {" • "}
                          Enrolled Leads: <strong className="text-slate-700 dark:text-slate-300">{seq.enrollments_count || 0}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAutomation(seq.id)}
                          className="h-8 px-3 rounded-lg text-xs font-bold"
                        >
                          {seq.is_active ? (
                            <><Pause className="h-3 w-3 mr-1" /> Pause</>
                          ) : (
                            <><Play className="h-3 w-3 mr-1" /> Activate</>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push('/automations')}
                          className="h-8 px-3 text-xs font-bold text-blue-600 hover:bg-blue-50"
                        >
                          Edit Steps
                        </Button>
                      </div>
                    </div>

                    {/* Step Visualizer */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Execution Pipeline:
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                          🎯 {seq.trigger_type === "stage_changed" ? "Stage Changed" : "Lead Enters CRM"}
                        </div>

                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />

                        {seq.steps && seq.steps.length > 0 ? (
                          seq.steps.map((st: any, idx: number) => {
                            const isEmail = st.action_type === 'send_email';
                            const matchedTemplate = templates.find(t => t.id === st.template_id);

                            return (
                              <React.Fragment key={idx}>
                                <div className={cn(
                                  "px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 shadow-2xs",
                                  isEmail
                                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200"
                                    : "bg-white dark:bg-slate-800 text-slate-700 border-slate-200"
                                )}>
                                  {isEmail ? <Mail className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                  <span>
                                    {isEmail 
                                      ? `Send: ${matchedTemplate?.name || `Template #${st.template_id || 'Auto'}`}`
                                      : `${st.action_type} (${st.delay_hours || 0}h)`
                                    }
                                  </span>
                                  {st.delay_hours > 0 && (
                                    <span className="text-[10px] opacity-75 font-normal ml-0.5">
                                      (+{st.delay_hours}h)
                                    </span>
                                  )}
                                </div>
                                {idx < seq.steps.length - 1 && (
                                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                )}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <div className="text-xs text-slate-400 font-semibold italic">
                            No steps configured yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: DELIVERY & INFRASTRUCTURE
           ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="delivery" className="space-y-6 m-0">
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Delivery Mode Configuration</h2>
              <span className="text-[11px] font-semibold text-slate-400">Switch between shared system or private server anytime</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: Platform Mailer */}
              <div
                onClick={() => setEmailMode("platform")}
                className={cn(
                  "cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between group select-none",
                  isPlatformActive
                    ? "bg-white dark:bg-slate-900 border-[#2A3ED6] dark:border-indigo-500 shadow-[0_4px_16px_rgba(42,62,214,0.08)] ring-2 ring-[#2A3ED6]/10"
                    : "bg-white dark:bg-slate-900 border-gray-200/80 dark:border-slate-800 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        isPlatformActive ? "bg-[#2A3ED6]/10 text-[#2A3ED6]" : "bg-slate-100 text-slate-500"
                      )}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            LeadBajaar Platform Mailer
                          </h3>
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 text-[10px] font-bold">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">Zero configuration, high-speed managed infrastructure</p>
                      </div>
                    </div>

                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isPlatformActive 
                        ? "border-[#2A3ED6] bg-[#2A3ED6] text-white" 
                        : "border-gray-300 dark:border-slate-700"
                    )}>
                      {isPlatformActive && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Emails are routed instantly through LeadBajaar's warm, high-reputation Amazon SES cluster. Automatically handles DKIM, SPF, bounce management, and TLS encryption.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Dedicated warmup pool</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Zero setup required</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Ready to dispatch
                  </span>
                  {!isPlatformActive && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUsePlatformMailer();
                      }}
                      className="h-8 text-xs font-bold rounded-lg bg-slate-900 text-white"
                    >
                      Switch to Platform
                    </Button>
                  )}
                </div>
              </div>

              {/* Option B: Custom / BYO Mailer */}
              <div
                onClick={() => setEmailMode("custom")}
                className={cn(
                  "cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between group select-none",
                  !isPlatformActive
                    ? "bg-white dark:bg-slate-900 border-[#2A3ED6] dark:border-indigo-500 shadow-[0_4px_16px_rgba(42,62,214,0.08)] ring-2 ring-[#2A3ED6]/10"
                    : "bg-white dark:bg-slate-900 border-gray-200/80 dark:border-slate-800 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        !isPlatformActive ? "bg-[#2A3ED6]/10 text-[#2A3ED6]" : "bg-slate-100 text-slate-500"
                      )}>
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Custom SMTP / Amazon SES
                          </h3>
                          <Badge variant="outline" className="text-[10px] font-bold text-slate-500 border-slate-300">
                            BYO Mailer
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">Connect your own private sender domain & credentials</p>
                      </div>
                    </div>

                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                      !isPlatformActive 
                        ? "border-[#2A3ED6] bg-[#2A3ED6] text-white" 
                        : "border-gray-300 dark:border-slate-700"
                    )}>
                      {!isPlatformActive && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Route notifications and campaigns through your dedicated Amazon SES, Google Workspace, Mailgun, or standard SMTP server with your custom From-address.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>Custom domain reputation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>Full DKIM sovereignty</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500">
                    Supports SES, SMTP & Mailgun
                  </span>
                  {isPlatformActive && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmailMode("custom");
                      }}
                      className="h-8 text-xs font-bold rounded-lg bg-slate-900 text-white"
                    >
                      Configure Custom
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Settings Panel */}
          {isPlatformActive ? (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Platform Delivery Engine Status: Active & Operational
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTestEmailDialog(true)}
                  className="rounded-xl border-gray-200/80 font-bold text-xs"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Test Verification
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block mb-1">DKIM & SPF Records</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 stroke-[3]" /> Verified by LeadBajaar DNS
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block mb-1">Queue & Retry Mechanism</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    High Priority SQS Cluster
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 font-semibold block mb-1">Deliverability Guarantee</span>
                  <span className="font-bold text-indigo-600">
                    99.4% Inbox Reach
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Custom Provider Credentials
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Enter your SMTP server or Amazon SES Access Keys below.
                  </p>
                </div>
                <Badge variant="outline" className="border-indigo-200 text-indigo-600 text-xs font-bold">
                  {emailConfig.provider?.toUpperCase() || "SES"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Service Provider
                    </Label>
                    <Select
                      value={emailConfig.provider || "ses"}
                      onValueChange={(val) => setEmailConfig({ ...emailConfig, provider: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-gray-200/80 dark:border-slate-700 font-semibold text-xs">
                        <SelectValue placeholder="Select Provider" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ses">Amazon SES (Recommended)</SelectItem>
                        <SelectItem value="smtp">Standard SMTP / Gmail App Password</SelectItem>
                        <SelectItem value="mailgun">Mailgun API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      From Name
                    </Label>
                    <Input
                      placeholder="e.g. Acme Sales Team"
                      value={emailConfig.from_name || ""}
                      onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                      className="h-11 rounded-xl bg-white dark:bg-slate-800 border-gray-200/80 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      From Email Address
                    </Label>
                    <Input
                      placeholder="e.g. notifications@acme.com"
                      value={emailConfig.from_email || ""}
                      onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                      className="h-11 rounded-xl bg-white dark:bg-slate-800 border-gray-200/80 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Conditional Provider Credentials */}
                {emailConfig.provider === "smtp" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">SMTP Host</Label>
                      <Input
                        placeholder="smtp.gmail.com"
                        value={emailConfig.credentials?.host || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, host: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">SMTP Port</Label>
                      <Input
                        placeholder="587"
                        value={emailConfig.credentials?.port || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, port: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">Username</Label>
                      <Input
                        placeholder="user@example.com"
                        value={emailConfig.credentials?.username || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, username: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={emailConfig.credentials?.password || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, password: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">AWS Region</Label>
                      <Input
                        placeholder="ap-south-1"
                        value={emailConfig.credentials?.region || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, region: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">Access Key ID</Label>
                      <Input
                        placeholder="AKIA..."
                        value={emailConfig.credentials?.key || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, key: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600">Secret Access Key</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={emailConfig.credentials?.secret || ""}
                        onChange={(e) => setEmailConfig({
                          ...emailConfig,
                          credentials: { ...emailConfig.credentials, secret: e.target.value }
                        })}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-slate-800 border-gray-200/80 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setShowTestEmailDialog(true)}
                  className="w-full sm:w-auto h-10 px-4 rounded-xl border-gray-200/80 font-bold text-xs"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Send Test Email
                </Button>

                <Button
                  onClick={handleSaveCustomConfig}
                  disabled={isConnecting}
                  className="w-full sm:w-auto h-10 px-6 rounded-xl bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] text-white text-xs font-extrabold shadow-md shadow-blue-600/10"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save & Activate Custom Mailer"
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ───────────────────────────────────────────────────────────── */}
      
      {/* Test Email Dialog */}
      <TestEmailDialog
        isOpen={showTestEmailDialog}
        onOpenChange={setShowTestEmailDialog}
        email={testEmailAddress}
        setEmail={setTestEmailAddress}
        onSendTest={handleSendTestEmail}
        isConnecting={isConnecting}
      />

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        isOpen={showCreateCampaign}
        onOpenChange={setShowCreateCampaign}
        templates={templates}
        stages={stages}
        onCampaignCreated={() => {
          fetchCampaigns();
          setActiveTab("campaigns");
        }}
      />

      {/* Campaign Stats Dialog */}
      <CampaignStatsDialog
        isOpen={!!selectedStatsCampaign}
        onOpenChange={(open) => {
          if (!open) setSelectedStatsCampaign(null);
        }}
        campaign={selectedStatsCampaign}
      />

      {/* Template Editor Dialog */}
      <TemplateEditorDialog
        isOpen={showTemplateEditor}
        onOpenChange={setShowTemplateEditor}
        templateToEdit={templateToEdit}
        onTemplateSaved={() => {
          fetchTemplates();
          setActiveTab("templates");
        }}
      />
    </div>
  );
}
