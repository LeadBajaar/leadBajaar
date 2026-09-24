"use client";

import React, { useState, useEffect, useRef } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, integrationApi } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";

import { BrandLogo } from "@/components/integrations/BrandLogos";
import { WebhookConfigDialog } from "@/components/integrations/WebhookConfigDialog";
import { EmailConfigDialog } from "@/components/integrations/EmailConfigDialog";
import { TestEmailDialog } from "@/components/integrations/TestEmailDialog";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  mapping: {
    sourceField: string;
    targetField: string;
  }[];
  secret?: string;
  uuid?: string;
  enrichment?: {
    enabled: boolean;
    url: string;
    method: string;
    headers: { key: string; value: string }[];
  };
}

interface ConnectedIntegration {
  id: number;
  user_id: number;
  type: string;
  config: Record<string, any>;
  metadata: any;
  environment: string;
  is_active: boolean;
  webhook_url: string | null;
  webhook_secret: string | null;
  created_at: string;
  updated_at: string;
}

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  category: "communication" | "lead_sources" | "productivity" | "marketing" | "payment" | "other";
  route?: string;
  isPopular?: boolean;
}

const popularIntegrationsList: IntegrationItem[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect WhatsApp Business API to send messages, automate responses and manage chats.",
    category: "communication",
    route: "/integrations/whatsapp",
    isPopular: true,
  },
  {
    id: "leadform",
    name: "Facebook Lead Ads",
    description: "Sync leads from Facebook Lead Ads directly into your CRM in real time.",
    category: "lead_sources",
    route: "/integrations/facebook-lead-forms",
    isPopular: true,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sync your meetings and appointments with Google Calendar.",
    category: "productivity",
    isPopular: true,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Send emails, track opens and manage conversations directly from your CRM.",
    category: "communication",
    route: "/integrations/email-marketing",
    isPopular: true,
  },
];

const catalogIntegrations: IntegrationItem[] = [
  {
    id: "outlook",
    name: "Outlook",
    description: "Sync emails and calendar with Microsoft Outlook.",
    category: "productivity",
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    description: "Export leads and data to Google Sheets automatically.",
    category: "productivity",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5000+ apps and automate workflows.",
    category: "productivity",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Send SMS, make calls and verify numbers using Twilio.",
    category: "communication",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Sync customers and orders from your WooCommerce store.",
    category: "lead_sources",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync leads and run email campaigns with Mailchimp.",
    category: "marketing",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments and manage subscriptions with Stripe.",
    category: "payment",
  },
  {
    id: "pabbly",
    name: "Pabbly Connect",
    description: "Automate tasks and connect your favorite applications.",
    category: "productivity",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    description: "Connect with customers via official Meta WhatsApp Business Cloud API.",
    category: "communication",
    route: "/integrations/whatsapp",
  },
  {
    id: "evolution",
    name: "WhatsApp (Evolution)",
    description: "Connect personal WhatsApp numbers via QR code Evolution API.",
    category: "communication",
    route: "/integrations/evolution",
  },
  {
    id: "leadform",
    name: "Facebook Lead Forms",
    description: "Connect and sync Facebook Lead Form submissions automatically.",
    category: "lead_sources",
    route: "/integrations/facebook-lead-forms",
  },
  {
    id: "facebook_conversion_api",
    name: "Meta Conversion API",
    description: "Track conversions with Facebook Conversion API for better attribution.",
    category: "marketing",
    route: "/integrations/meta-capi",
  },
  {
    id: "lb_forms",
    name: "LB Forms",
    description: "Create custom forms and capture leads directly into CRM.",
    category: "lead_sources",
    route: "/lb-forms",
  },
  {
    id: "webhook",
    name: "General Webhook",
    description: "Receive leads into CRM or dispatch them to external tools.",
    category: "other",
    route: "/integrations/webhooks",
  },
  {
    id: "email",
    name: "Email Marketing",
    description: "Connect SES, SMTP, or Mailgun for automated drip sequences.",
    category: "marketing",
    route: "/integrations/email-marketing",
  },
  {
    id: "facebook_auth",
    name: "Facebook Auth",
    description: "Connect Facebook accounts to manage pages and permissions.",
    category: "marketing",
    route: "/integrations/facebook-auth",
  },
];

const categoryTabs = [
  { id: "all", label: "All" },
  { id: "communication", label: "Communication" },
  { id: "lead_sources", label: "Lead Sources" },
  { id: "productivity", label: "Productivity" },
  { id: "marketing", label: "Marketing" },
  { id: "payment", label: "Payment" },
  { id: "other", label: "Other" },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const popularScrollRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [integrationToConfirm, setIntegrationToConfirm] = useState<IntegrationItem | null>(null);

  // Webhook State
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    name: "",
    url: "",
    events: [],
    mapping: [],
  });
  const [isListeningForWebhook, setIsListeningForWebhook] = useState(false);
  const [availablePayloadFields, setAvailablePayloadFields] = useState<{ key: string; value: any }[]>([]);

  // Deletion Modal
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState({
    provider: 'smtp',
    from_name: '',
    from_email: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_default_region: 'us-east-1',
  });
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestToolName, setRequestToolName] = useState("");
  const [requestUseCase, setRequestUseCase] = useState("");

  // Meta Reconnect State
  const [metaConnectionStatus, setMetaConnectionStatus] = useState<{
    connected: boolean;
    needs_reconnect?: boolean;
    status?: string;
  } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const fetchConnectedIntegrations = async () => {
    try {
      const response = await integrationApi.getConnectedIntegrations();
      setConnectedIntegrations(response || []);
    } catch {
      setConnectedIntegrations([]);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const response = await api.get("/webhooks");
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setWebhooks(response.data.data);
      }
    } catch {
      // ignore
    }
  };

  const fetchEmailConfig = async () => {
    try {
      const response = await api.get('/email/configurations');
      if (response?.data?.data) {
        setEmailConfig(response.data.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchConnectedIntegrations();
    fetchWebhooks();
    fetchEmailConfig();

    const checkMetaStatus = async () => {
      try {
        const res = await (integrationApi as any).get('/meta/status');
        if (res?.data) setMetaConnectionStatus(res.data);
      } catch {
        // ignore
      }
    };
    checkMetaStatus();

    const handleUpdate = () => {
      fetchConnectedIntegrations();
      fetchWebhooks();
    };
    window.addEventListener('integrationsUpdated', handleUpdate);
    return () => window.removeEventListener('integrationsUpdated', handleUpdate);
  }, []);

  const saveWebhookConfig = async (id: string) => {
    try {
      const webhook = webhooks.find((w) => w.id === id);
      if (!webhook) return;
      await api.put(`/webhooks/${id}`, webhook);
      toast.success("Webhook updated successfully");
      fetchWebhooks();
    } catch {
      toast.error("Failed to save webhook");
    }
  };

  const addWebhook = async () => {
    try {
      if (!newWebhook.name || !newWebhook.url) {
        toast.error("Please provide a webhook name and destination URL");
        return;
      }
      await api.post("/webhooks", newWebhook);
      toast.success("Webhook created successfully");
      setShowNewWebhookDialog(false);
      setNewWebhook({ name: "", url: "", events: [], mapping: [] });
      fetchWebhooks();
    } catch {
      toast.error("Failed to create webhook");
    }
  };

  const addFieldMapping = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              mapping: [...(w.mapping || []), { sourceField: "", targetField: "" }],
            }
          : w
      )
    );
  };

  const updateFieldMapping = (
    id: string,
    index: number,
    field: "sourceField" | "targetField",
    value: string
  ) => {
    setWebhooks((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const newMapping = [...(w.mapping || [])];
          if (newMapping[index]) {
            newMapping[index] = { ...newMapping[index], [field]: value };
          }
          return { ...w, mapping: newMapping };
        }
        return w;
      })
    );
  };

  const removeFieldMapping = (id: string, index: number) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              mapping: (w.mapping || []).filter((_, i) => i !== index),
            }
          : w
      )
    );
  };

  const isIntegrationConnected = (id: string): boolean => {
    if (id === 'webhook') {
      return webhooks.some((w) => w.isActive);
    }
    if (id === 'email' || id === 'gmail') {
      return !!(emailConfig?.from_email && (emailConfig?.smtp_host || emailConfig?.aws_access_key_id));
    }
    if (id === 'leadform' || id === 'facebook_auth') {
      return metaConnectionStatus?.connected ?? false;
    }
    return connectedIntegrations.some(
      (ci) =>
        (ci.type === id ||
          (id === 'leadform' && ci.type === 'leadform') ||
          (id === 'whatsapp' && (ci.type === 'whatsapp' || ci.type === 'evolution')) ||
          (id === 'gmail' && ci.type === 'email')) &&
        ci.is_active
    );
  };

  const handleIntegrationCardAction = (item: IntegrationItem) => {
    const isConnected = isIntegrationConnected(item.id);

    if (item.route) {
      router.push(item.route);
      return;
    }

    if (isConnected) {
      if (item.id === "webhook") {
        setShowNewWebhookDialog(true);
      } else if (item.id === "email") {
        setSelectedIntegrationId("email");
      } else {
        toast.info(`${item.name} is connected and syncing actively.`);
      }
      return;
    }

    // Direct Connect modal
    setIntegrationToConfirm(item);
  };

  const handleConfirmConnect = async () => {
    if (!integrationToConfirm) return;
    setIsConnecting(true);

    try {
      await integrationApi.saveIntegration({
        type: integrationToConfirm.id,
        config: {},
        isActive: true,
        environment: "production",
      });

      toast.success(`${integrationToConfirm.name} connected successfully!`);
      fetchConnectedIntegrations();
      window.dispatchEvent(new Event('integrationsUpdated'));

      if (integrationToConfirm.route) {
        router.push(integrationToConfirm.route);
      }
    } catch (error: any) {
      handleError(error, { title: `Failed to connect ${integrationToConfirm.name}` });
    } finally {
      setIsConnecting(false);
      setIntegrationToConfirm(null);
    }
  };

  const handleDeactivateRequest = (integrationId: string) => {
    const connected = connectedIntegrations.find((ci) => ci.type === integrationId && ci.is_active);
    if (connected) {
      setWebhookToDelete(connected.id.toString());
      setShowDeleteDialog(true);
    } else {
      toast.info("Integration is not actively configured.");
    }
  };

  const deleteWebhook = async () => {
    if (!webhookToDelete) return;
    setIsDeleting(true);
    try {
      await integrationApi.deleteIntegration(webhookToDelete);
      toast.success("Integration disconnected successfully");
      fetchConnectedIntegrations();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error) {
      toast.error("Failed to disconnect integration");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setWebhookToDelete(null);
    }
  };

  const handleReconnectMeta = async () => {
    setIsReconnecting(true);
    try {
      const res = await (integrationApi as any).get('/meta/connect');
      const authUrl = res?.data?.auth_url ?? res?.auth_url;
      if (authUrl) window.location.href = authUrl;
    } catch {
      toast.error('Could not start Facebook reconnection. Please try again.');
    } finally {
      setIsReconnecting(false);
    }
  };

  const scrollPopular = (direction: "left" | "right") => {
    if (popularScrollRef.current) {
      const amount = 320;
      popularScrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  const filteredCatalog = catalogIntegrations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <RoleGuard allowedFeatures={['integrations']}>
      <div className="w-full min-h-full pb-20 sm:pb-24 lg:pb-28">
        
        {/* Meta Expired Alert */}
        {metaConnectionStatus && metaConnectionStatus.connected === false &&
          metaConnectionStatus.status !== 'deletion_pending' && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-orange-300 bg-orange-50 dark:bg-orange-950/30 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Your Facebook connection has expired.</strong> Reconnect to continue receiving leads and ad data.
              </span>
            </div>
            <Button
              variant="default"
              onClick={handleReconnectMeta}
              disabled={isReconnecting}
              className="shrink-0 rounded-xl bg-orange-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors h-auto w-auto"
            >
              {isReconnecting ? 'Connecting...' : 'Reconnect'}
            </Button>
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Satoshi']">
              Integrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Connect your favorite tools and automate your workflow
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-[#10182D] border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-2xs focus-visible:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ── Popular Integrations ────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Popular Integrations
            </h2>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline" size="icon"
                onClick={() => scrollPopular("left")}
                className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs p-0"
                title="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="icon"
                onClick={() => scrollPopular("right")}
                className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs p-0"
                title="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={popularScrollRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-1"
          >
            {popularIntegrationsList.map((item) => {
              const isConnected = isIntegrationConnected(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#10182D] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                        <BrandLogo id={item.id} className="w-11 h-11" />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 h-auto w-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleIntegrationCardAction(item)}>
                            {isConnected ? "Manage Integration" : "Connect"}
                          </DropdownMenuItem>
                          {isConnected && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivateRequest(item.id)}
                              className="text-red-600"
                            >
                              Disconnect
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toast.info(`Viewing documentation for ${item.name}`)}>
                            View Docs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mt-3.5 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2 min-h-[34px]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {isConnected ? (
                      <Button
                        variant="outline"
                        onClick={() => handleIntegrationCardAction(item)}
                        className="text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold h-auto w-auto transition-colors"
                      >
                        Manage
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleIntegrationCardAction(item)}
                        className="text-blue-600 dark:text-blue-400 bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 px-3.5 py-1.5 rounded-lg text-xs font-bold h-auto w-auto transition-colors"
                      >
                        Connect +
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── All Integrations ────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3.5">
            All Integrations
          </h2>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button /* TODO: Segmented control */
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer",
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs"
                      : "bg-white dark:bg-[#10182D] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                  )}
                >
                  {tab.id === "all" ? "All" : tab.label}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredCatalog.map((item) => {
              const isConnected = isIntegrationConnected(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#10182D] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                        <BrandLogo id={item.id} className="w-11 h-11" />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 h-auto w-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleIntegrationCardAction(item)}>
                            {isConnected ? "Manage Integration" : "Connect"}
                          </DropdownMenuItem>
                          {isConnected && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivateRequest(item.id)}
                              className="text-red-600"
                            >
                              Disconnect
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toast.info(`Viewing documentation for ${item.name}`)}>
                            View Docs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mt-3.5 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2 min-h-[34px]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {isConnected ? (
                      <Button
                        variant="outline"
                        onClick={() => handleIntegrationCardAction(item)}
                        className="text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold h-auto w-auto transition-colors"
                      >
                        Manage
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleIntegrationCardAction(item)}
                        className="text-blue-600 dark:text-blue-400 bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 px-3.5 py-1.5 rounded-lg text-xs font-bold h-auto w-auto transition-colors"
                      >
                        Connect +
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Missing an Integration Banner ────────────────────────────────── */}
        <div className="mt-10 mb-12 lg:mb-16 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div className="w-11 h-11 rounded-xl bg-blue-100/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Missing an integration?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                We&apos;re always adding new integrations. Tell us which one you need.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowRequestModal(true)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs shrink-0 cursor-pointer h-auto"
          >
            Request Integration
          </Button>
        </div>

        {/* ── Connect Confirmation Dialog ─────────────────────────────────── */}
        <Dialog open={!!integrationToConfirm} onOpenChange={(open) => !open && setIntegrationToConfirm(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect {integrationToConfirm?.name}</DialogTitle>
              <DialogDescription>
                Enable and configure {integrationToConfirm?.name} integration for your CRM workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-xs text-slate-500">
              {integrationToConfirm?.description}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIntegrationToConfirm(null)} disabled={isConnecting}>
                Cancel
              </Button>
              <Button onClick={handleConfirmConnect} disabled={isConnecting} className="bg-[#FE4548] hover:bg-[#FE4548]/90 text-white font-bold">
                {isConnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Yes, Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Request Integration Dialog ──────────────────────────────────── */}
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request New Integration</DialogTitle>
              <DialogDescription>
                Suggest a tool or platform you&apos;d love to connect with LeadBajaar CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="tool-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">Tool or Service Name</Label>
                <Input
                  id="tool-name"
                  placeholder="e.g. HubSpot, Shopify, Notion..."
                  value={requestToolName}
                  onChange={(e) => setRequestToolName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="use-case" className="text-xs font-bold text-slate-700 dark:text-slate-300">How would you use it?</Label>
                <textarea
                  id="use-case"
                  rows={3}
                  placeholder="Describe your workflow or what data needs to sync..."
                  value={requestUseCase}
                  onChange={(e) => setRequestUseCase(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!requestToolName.trim()) {
                    toast.error("Please enter a tool name");
                    return;
                  }
                  toast.success("Thank you! Your request has been submitted to the product team.");
                  setShowRequestModal(false);
                  setRequestToolName("");
                  setRequestUseCase("");
                }}
                className="bg-[#FE4548] hover:bg-[#FE4548]/90 text-white font-bold"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Config Dialog */}
        <WebhookConfigDialog
          isOpen={showNewWebhookDialog}
          onOpenChange={setShowNewWebhookDialog}
          webhookId={selectedWebhookId}
          webhooks={webhooks}
          newWebhook={newWebhook}
          setNewWebhook={setNewWebhook}
          setWebhooks={setWebhooks}
          isConnecting={isConnecting}
          isListening={isListeningForWebhook}
          availableFields={availablePayloadFields}
          onSave={saveWebhookConfig}
          onAdd={addWebhook}
          startListening={async () => {}}
          addFieldMapping={addFieldMapping}
          updateFieldMapping={updateFieldMapping}
          removeFieldMapping={removeFieldMapping}
        />

        {/* Email Config Dialog */}
        <EmailConfigDialog
          isOpen={selectedIntegrationId === "email"}
          onOpenChange={(open) => !open && setSelectedIntegrationId(null)}
          emailConfig={emailConfig}
          setEmailConfig={setEmailConfig}
          onSave={async () => {
            try {
              setIsConnecting(true);
              const method = (emailConfig as any).id ? 'put' : 'post';
              const url = (emailConfig as any).id ? `/email/configurations/${(emailConfig as any).id}` : '/email/configurations';
              await api[method](url, emailConfig);
              toast.success('Email integration synchronized!');
              setSelectedIntegrationId(null);
              fetchEmailConfig();
              fetchConnectedIntegrations();
            } catch {
              toast.error('Synchronization failed');
            } finally {
              setIsConnecting(false);
            }
          }}
          onSendTest={() => setShowTestEmailDialog(true)}
          isConnecting={isConnecting}
        />

        {/* Test Email Dialog */}
        <TestEmailDialog
          isOpen={showTestEmailDialog}
          onOpenChange={setShowTestEmailDialog}
          email={testEmailAddress}
          setEmail={setTestEmailAddress}
          onSend={async () => {
            if (!testEmailAddress) {
              toast.error('Email is required');
              return;
            }
            try {
              setIsConnecting(true);
              await api.post('/email/configurations/test', { email: testEmailAddress });
              toast.success('Test email dispatched!');
              setShowTestEmailDialog(false);
            } catch {
              toast.error('Test dispatch failed');
            } finally {
              setIsConnecting(false);
            }
          }}
          isConnecting={isConnecting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={deleteWebhook}
          isLoading={isDeleting}
          title="Disconnect Integration"
          description="Are you sure you want to disconnect this integration? You can re-enable it at any time."
          confirmText="Disconnect"
        />
      </div>
    </RoleGuard>
  );
}
