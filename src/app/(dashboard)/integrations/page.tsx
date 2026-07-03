"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Globe,
  Webhook,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ArrowDownToLine,
  ArrowRight,
  Send,
  Cloud,
  Database,
  Zap,
  MessageCircle,
  LucideIcon,
  ClipboardCopy,
  Facebook,
  Loader2,
  Settings,
  Play,
  ShieldCheck,
  AlertCircle,
  Mail,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, integrationApi, IntegrationConfig } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

import { FacebookConversionApiManager } from "@/components/meta-capi/FacebookConversionApiManager";
import { LeadConversionTracker } from "@/components/meta-capi/LeadConversionTracker";
import { ConversionApiTester } from "@/components/meta-capi/ConversionApiTester";
import { WebhookConfigDialog } from "@/components/integrations/WebhookConfigDialog";
import { EmailConfigDialog } from "@/components/integrations/EmailConfigDialog";
import { TestEmailDialog } from "@/components/integrations/TestEmailDialog";
import { UnifiedIntegrationDialog } from "@/components/integrations/UnifiedIntegrationDialog";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { GoogleAccountCard } from "@/components/integrations/GoogleAccountCard";

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
}

interface ConnectedIntegration {
  id: number;
  user_id: number;
  type: string;
  config: {
    // WhatsApp fields (snake_case from backend)
    phone_number_id?: string;
    waba_id?: string;
    access_token?: string;
    enable_templates?: boolean;
    // Facebook Lead Form fields
    project_name?: string;
    page_id?: string;
    form_id?: string;
    page_access_token?: string;
    // Facebook Conversion API fields
    pixel_id?: string;
    page_name?: string;
    test_event_code?: string;
    // Email Marketing fields
    provider?: string;
    from_name?: string;
    from_email?: string;
    credentials?: any;
    // Add other possible config fields
  };
  metadata: any;
  environment: string;
  is_active: boolean;
  webhook_url: string | null;
  webhook_secret: string | null;
  created_at: string;
  updated_at: string;
}

interface Integration {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  color: string;
  description: string;
  features: string[];
  allowMultiple: boolean;
  plans?: string[];
}

interface WhatsAppConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  enableTemplates: boolean;
}

interface FacebookConfig {
  leadFormName: string;
  pageId: string;
  formId: string;
  accessToken: string;
  pixelId?: string;
  testEventCode?: string;
}

interface FacebookConversionApiConfig {
  pixelId: string;
  accessToken: string;
  pageName: string;
  testEventCode?: string;
}

interface ConfigError {
  phoneNumberId?: string;
  wabaId?: string;
  accessToken?: string;
  leadFormName?: string;
  pageId?: string;
  formId?: string;
  fbAccessToken?: string;
  pixelId?: string;
  conversionApiAccessToken?: string;
  pageName?: string;
}

const integrations: Integration[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    icon: MessageCircle,
    category: "messaging",
    color: "#25D366",
    description: "Connect with customers via WhatsApp Business Platform",
    features: [
      "Automated Messages",
      "Chat Templates",
      "Business Profile",
      "Message Analytics",
    ],
    allowMultiple: false,
    plans: ["pro", "enterprise"],
  },
  {
    id: "evolution",
    name: "WhatsApp (Evolution)",
    icon: MessageCircle,
    category: "messaging",
    color: "#25D366",
    description: "Connect personal WhatsApp numbers via Evolution API",
    features: [
      "QR Code Connection",
      "Personal Number Support",
      "Automated Messaging"
    ],
    allowMultiple: true,
  },
  {
    id: "leadform",
    name: "Facebook Lead Forms",
    icon: Facebook,
    category: "marketing",
    color: "#1877F2",
    description: "Connect and sync Facebook Lead Form submissions",
    features: [
      "Lead Form Integration",
      "Real-time Notifications",
      "Automated Lead Capture",
    ],
    allowMultiple: true,
  },
  {
    id: "facebook_conversion_api",
    name: "Facebook Conversion API",
    icon: Facebook,
    category: "marketing",
    color: "#1877F2",
    description:
      "Track conversions with Facebook Conversion API for better attribution",
    features: [
      "Server-side Tracking",
      "Better Attribution",
      "Privacy Compliant",
      "iOS 14.5+ Compatible",
    ],
    allowMultiple: true,
  },
  {
    id: "webhook",
    name: "General Webhook",
    icon: Webhook,
    category: "webhooks",
    color: "#4F46E5",
    description: "Receive leads into CRM or dispatch them to external tools.",
    features: ["Incoming Lead Receiver", "Outgoing Dispatcher", "Secure Auth", "Custom Mapping"],
    allowMultiple: true,
  },
  {
    id: "facebook_auth",
    name: "Facebook Auth",
    icon: Facebook,
    category: "marketing",
    color: "#1877F2",
    description: "Connect Facebook accounts to manage pages and services.",
    features: ["OAuth Connection", "Page Management", "Service Sync"],
    allowMultiple: false,
  },
  {
    id: "email",
    name: "Email Marketing",
    icon: Mail,
    category: "marketing",
    color: "#4F46E5",
    description: "Connect SES, SMTP, or Mailgun for automated drip sequences",
    features: [
      "Custom SMTP Support",
      "Amazon SES Integration",
      "Campaign Analytics",
      "Sequences Enabled",
    ],
    allowMultiple: false,
  },
  {
    id: "lb_forms",
    name: "LB Forms",
    icon: ClipboardCopy,
    category: "marketing",
    color: "#8B5CF6",
    description: "Create custom forms and capture leads directly into CRM.",
    features: [
      "Drag-and-drop Builder",
      "Auto Lead Creation",
      "Custom Redirection",
      "Embeddable Forms"
    ],
    allowMultiple: false,
  },
];

const dummyLogs = [
  {
    id: 1,
    integration: "Salesforce",
    action: "Data sync",
    status: "Success",
    timestamp: "2023-06-15 10:30:00",
    icon: RefreshCcw,
  },
  {
    id: 2,
    integration: "HubSpot",
    action: "Contact import",
    status: "Failed",
    timestamp: "2023-06-15 11:45:00",
    icon: ArrowDownToLine,
  },
  {
    id: 3,
    integration: "Mailchimp",
    action: "Campaign sync",
    status: "Success",
    timestamp: "2023-06-15 13:15:00",
    icon: RefreshCcw,
  },
  {
    id: 4,
    integration: "Zapier",
    action: "Trigger update",
    status: "Success",
    timestamp: "2023-06-15 14:30:00",
    icon: Send,
  },
  {
    id: 5,
    integration: "Calendly",
    action: "Appointment sync",
    status: "Success",
    timestamp: "2023-06-15 15:45:00",
    icon: RefreshCcw,
  },
];

import { RoleGuard } from "@/components/RoleGuard";

export default function IntegrationsPage() {
  const { hasPlan, hasType, hasFeature } = useUser();
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [connectingIntegrationId, setConnectingIntegrationId] = useState<string | null>(null);
  const [integrationToConfirm, setIntegrationToConfirm] = useState<Integration | null>(null);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Lead Form Webhook",
      url: "https://example.com/webhook1",
      events: ["lead.created", "lead.updated"],
      isActive: true,
      mapping: [
        { sourceField: "name", targetField: "full_name" },
        { sourceField: "email", targetField: "email_address" },
      ],
    },
  ]);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    name: "",
    url: "",
    events: [],
    mapping: [],
  });
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    enableTemplates: false,
  });
  const [facebookConfig, setFacebookConfig] = useState<FacebookConfig>({
    leadFormName: "",
    pageId: "",
    formId: "",
    accessToken: "",
    pixelId: "",
    testEventCode: "",
  });
  const [facebookConversionApiConfig, setFacebookConversionApiConfig] =
    useState<FacebookConversionApiConfig>({
      pixelId: "",
      accessToken: "",
      pageName: "",
      testEventCode: "",
    });
  const [configErrors, setConfigErrors] = useState<ConfigError>({});
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<
    string | null
  >(null);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    ConnectedIntegration[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [isConnecting, setIsConnecting] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const [isListeningForWebhook, setIsListeningForWebhook] = useState(false);
  const [availablePayloadFields, setAvailablePayloadFields] = useState<{ key: string; value: any }[]>([]);

  // Fix 10: Meta connection status for reconnect banner
  const [metaConnectionStatus, setMetaConnectionStatus] = useState<{
    connected: boolean;
    needs_reconnect?: boolean;
    status?: string;
  } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const [emailConfig, setEmailConfig] = useState<any>({
    provider: 'ses',
    from_name: '',
    from_email: '',
    credentials: {},
    is_active: true
  });

  const fetchEmailConfig = async () => {
    try {
      const res = await (integrationApi as any).get('/email/configurations');
      if (res.data && res.data.length > 0) {
        const active = res.data.find((c: any) => c.is_active) || res.data[0];
        setEmailConfig(active);
      }
    } catch (e) {
      console.warn("Could not fetch email config");
    }
  };

  useEffect(() => {
    // Select tab based on query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (
      tab &&
      [
        "all",
        "facebook",
        "marketing",
        "messaging",
        "webhooks",
        "settings",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    } else if (urlParams.has("meta_connected")) {
      setActiveTab("facebook");
    }

    fetchEmailConfig();
    fetchConnectedIntegrations();
    // Fix 10: Check Meta connection status for reconnect banner
    fetchMetaStatus();
  }, []);

  const fetchConnectedIntegrations = async () => {
    try {
      const response = await integrationApi.getConnectedIntegrations();
      setConnectedIntegrations(response);
      if (response && response.length > 0) {
        setCurrentUserId(response[0].user_id);
      }

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
      setConnectedIntegrations([]);
      setWebhooks([]);
      handleError(error, { title: "Connection Error" });
    }
  };

  const canConnectIntegration = (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    if (!integration) return false;

    const isConnected = connectedIntegrations.some(
      (ci) => ci.type === integrationId && ci.is_active,
    );

    return integration.allowMultiple || !isConnected;
  };

  // const toggleIntegration = async (integrationId: string) => {
  //   try {
  //     const isActive = !activeIntegrations.includes(integrationId);
  //     await integrationApi.updateIntegrationStatus(integrationId, isActive);
  //     setActiveIntegrations(prev =>
  //       isActive
  //         ? [...prev, integrationId]
  //         : prev.filter(id => id !== integrationId)
  //     );
  //     toast.success("");
  //   } catch (error: any) {
  //     toast.error("Error");
  //     // Revert the UI state if the API call failed
  //     setActiveIntegrations(prev => prev);
  //   }
  // }

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
      setSelectedIntegrationId(null);
      fetchConnectedIntegrations();
      toast.success("Integration connected successfully!");
    } catch (error: any) {
      handleError(error, { title: "Integration Failed" });
    } finally {
      setIsConnecting(false);
    }
  };

  const deleteWebhook = async () => {
    if (!webhookToDelete) return;
    try {
      setIsDeleting(true);
      await integrationApi.deleteIntegration(webhookToDelete);
      toast.success("Integration deactivated successfully");
      setShowDeleteDialog(false);
      fetchConnectedIntegrations();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error: any) {
      handleError(error, { title: "Deletion Failed" });
    } finally {
      setIsDeleting(false);
      setWebhookToDelete(null);
    }
  };

  const toggleWebhook = async (id: string) => {
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) return;
    try {
      await integrationApi.updateIntegrationStatus(id, !webhook.isActive);
      toast.success(`Webhook ${webhook.isActive ? "deactivated" : "activated"} successfully`);
      fetchConnectedIntegrations();
    } catch (error: any) {
      handleError(error, { title: "Status Update Failed" });
    }
  };

  /**
   * Recursively flatten a nested object/array into dot-notation key-value pairs.
   * e.g. { body: { data: ["a", "b"], event: "x" } }
   *   → [{ key: "body.data.0", value: "a" }, { key: "body.data.1", value: "b" }, { key: "body.event", value: "x" }]
   */
  const flattenPayload = (obj: any, prefix = ''): { key: string; value: any }[] => {
    const result: { key: string; value: any }[] = [];
    if (obj === null || obj === undefined) return result;

    for (const [k, v] of Object.entries(obj)) {
      const dotKey = prefix ? `${prefix}.${k}` : k;

      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        // Recurse into nested objects
        result.push(...flattenPayload(v, dotKey));
      } else if (Array.isArray(v)) {
        // Recurse into arrays with numeric index
        v.forEach((item, i) => {
          if (item !== null && typeof item === 'object') {
            result.push(...flattenPayload(item, `${dotKey}.${i}`));
          } else {
            result.push({ key: `${dotKey}.${i}`, value: item });
          }
        });
      } else {
        // Scalar value — leaf node
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

          // Flatten nested structures into dot-notation field paths
          const fields = flattenPayload(payload);

          setAvailablePayloadFields(fields);
          setIsListeningForWebhook(false);
          clearInterval(pollInterval);

          // Provide first mapping row immediately if none exist
          addFieldMapping(id);

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
      fetchConnectedIntegrations();
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

  const validateConfig = () => {
    const errors: ConfigError = {};

    if (!whatsappConfig.phoneNumberId.trim()) {
      errors.phoneNumberId = "Phone Number ID is required";
    }
    if (!whatsappConfig.wabaId.trim()) {
      errors.wabaId = "WABA ID is required";
    }
    if (!whatsappConfig.accessToken.trim()) {
      errors.accessToken = "Access Token is required";
    }

    setConfigErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleSaveConfig = async () => {
  //   if (validateConfig()) {
  //     try {
  //       await integrationApi.saveIntegration({
  //         type: 'whatsapp',
  //         config: whatsappConfig,
  //         isActive: true,
  //         environment: 'production',
  //       });
  //       toast.success("WhatsApp integration has been configured successfully.");
  //       setSelectedIntegrationId(null);
  //     } catch (error: any) {
  //       toast.error("Configuration Failed");
  //     }
  //   }
  // };

  const validateFacebookConfig = () => {
    const errors: ConfigError = {};

    if (!facebookConfig.leadFormName.trim()) {
      errors.leadFormName = "Lead Form Name is required";
    }
    if (!facebookConfig.pageId.trim()) {
      errors.pageId = "Page ID is required";
    }
    if (!facebookConfig.formId.trim()) {
      errors.formId = "Form ID is required";
    }
    if (!facebookConfig.accessToken.trim()) {
      errors.fbAccessToken = "Access Token is required";
    }

    setConfigErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleSaveFacebookConfig = async () => {
  //   if (validateFacebookConfig()) {
  //     try {
  //       await integrationApi.saveIntegration({
  //         type: 'facebook',
  //         config: facebookConfig,
  //         isActive: true,
  //         environment: 'production',
  //       });
  //       toast.success("Facebook Lead Form integration has been configured successfully.");
  //       setSelectedIntegrationId(null);
  //     } catch (error: any) {
  //       toast.error("Configuration Failed");
  //     }
  //   }
  // };

  const handleIntegrationAction = async (integration: Integration) => {

    const connectedIntegration = connectedIntegrations.find(
      (ci) => ci.type === integration.id && ci.is_active,
    );

    if (connectedIntegration) {
      if (integration.id === "whatsapp") {
        router.push("/integrations/whatsapp");
        return;
      } else if (integration.id === "evolution") {
        router.push("/integrations/evolution");
        return;
      } else if (integration.id === "facebook_conversion_api") {
        router.push("/integrations/meta-capi");
        return;
      } else if (integration.id === "leadform") {
        router.push("/integrations/facebook-lead-forms");
        return;
      } else if (integration.id === "email") {
        router.push("/integrations/email-marketing");
        return;
      } else if (integration.id === "webhook") {
        router.push("/integrations/webhooks");
        return;
      } else if (integration.id === "facebook_auth") {
        router.push("/integrations/facebook-auth");
        return;
      } else if (integration.id === "lb_forms") {
        router.push("/lb-forms");
        return;
      }
    }
    
    // Not connected: Ask for confirmation
    setIntegrationToConfirm(integration);
  };

  const handleConfirmConnect = async () => {
    if (!integrationToConfirm) return;
    
    setIsConnecting(true);
    setConnectingIntegrationId(integrationToConfirm.id);
    
    try {
      await integrationApi.saveIntegration({
        type: integrationToConfirm.id,
        config: {},
        isActive: true,
        environment: "production",
      });
      
      toast.success(`${integrationToConfirm.name} enabled successfully!`);
      fetchConnectedIntegrations();
      window.dispatchEvent(new Event('integrationsUpdated'));
      
      // Route to page
      const routeMap: Record<string, string> = {
        facebook: "/integrations/facebook",
        evolution: "/integrations/evolution",
        facebook_conversion_api: "/integrations/meta-capi",
        leadform: "/integrations/facebook-lead-forms",
        email: "/integrations/email-marketing",
        webhook: "/integrations/webhooks",
        facebook_auth: "/integrations/facebook-auth",
        lb_forms: "/lb-forms"
      };
      
      const route = routeMap[integrationToConfirm.id];
      if (route) {
        router.push(route);
      }
      
    } catch (error: any) {
      handleError(error, { title: `Failed to connect ${integrationToConfirm.name}` });
    } finally {
      setIsConnecting(false);
      setConnectingIntegrationId(null);
      setIntegrationToConfirm(null);
    }
  };

  const handleDeactivateRequest = (integrationId: string) => {
    const connected = connectedIntegrations.find(ci => ci.type === integrationId && ci.is_active);
    if (connected) {
      setWebhookToDelete(connected.id.toString());
      setShowDeleteDialog(true);
    }
  };

  const handleIntegrationConnect = async () => {
    const type = selectedIntegrationId;
    if (!type) return;

    let config: any;
    if (type === "whatsapp") {
      config = whatsappConfig;
    } else if (type === "leadform") {
      config = facebookConfig;
    } else if (type === "facebook_conversion_api") {
      config = facebookConversionApiConfig;
    } else {
      config = {};
    }
    // Clear previous errors
    setConfigErrors({});

    // Validate based on integration type
    if (type === "whatsapp") {
      if (!config.phoneNumberId?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          phoneNumberId: "Phone Number ID is required",
        }));
        return;
      }
      if (!config.wabaId?.trim()) {
        setConfigErrors((prev) => ({ ...prev, wabaId: "WABA ID is required" }));
        return;
      }
      if (!config.accessToken?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          accessToken: "Access Token is required",
        }));
        return;
      }
    } else if (type === "facebook" || type === "leadform") {
      if (!config.leadFormName?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          leadFormName: "Lead Form Name is required",
        }));
        return;
      }
      if (!config.pageId?.trim()) {
        setConfigErrors((prev) => ({ ...prev, pageId: "Page ID is required" }));
        return;
      }
      if (!config.formId?.trim()) {
        setConfigErrors((prev) => ({ ...prev, formId: "Form ID is required" }));
        return;
      }
      if (!config.accessToken?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          fbAccessToken: "Access Token is required",
        }));
        return;
      }
    } else if (type === "facebook_conversion_api") {
      if (!config.pixelId?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          pixelId: "Pixel ID is required",
        }));
        return;
      }
      if (!config.accessToken?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          conversionApiAccessToken: "Access Token is required",
        }));
        return;
      }
      if (!config.pageName?.trim()) {
        setConfigErrors((prev) => ({
          ...prev,
          pageName: "Page Name is required",
        }));
        return;
      }
    }

    setIsConnecting(true);
    try {
      // Clean up config - remove empty optional fields
      const cleanedConfig = { ...config };
      if (cleanedConfig.testEventCode === "") {
        delete cleanedConfig.testEventCode;
      }

      const payload: IntegrationConfig = {
        type: type,
        config: cleanedConfig,
        isActive: true,
        environment: "production" as "sandbox" | "production",
      };

      const response = await integrationApi.saveIntegration(payload);

      // Update connected integrations list with the correct structure
      setConnectedIntegrations((prev) => [
        ...prev,
        {
          id: response.data.id,
          user_id: response.data.user_id,
          type: type,
          config: config,
          metadata: null,
          environment: "production",
          is_active: true,
          webhook_url: null,
          webhook_secret: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      toast.success("Integration connected successfully");

      setConfigErrors({});
      setSelectedIntegrationId(null);
    } catch (error: any) {
      handleError(error, { title: "Integration Failed" });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchMetaStatus = async () => {
    try {
      const res = await (integrationApi as any).get('/meta/status');
      setMetaConnectionStatus(res.data ?? res);
    } catch (e) {
      // Silently fail — don't block page load if status check fails
    }
  };

  const handleReconnectMeta = async () => {
    setIsReconnecting(true);
    try {
      const res = await (integrationApi as any).get('/meta/connect');
      const authUrl = res?.data?.auth_url ?? res?.auth_url;
      if (authUrl) window.location.href = authUrl;
    } catch (e) {
      toast.error('Could not start Facebook reconnection. Please try again.');
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <RoleGuard allowedFeatures={['integrations']}>
      <div className="w-full h-full overflow-y-auto p-6 pt-2">
        {/* Fix 10: Meta reconnect banner — appears when token is expired or connection lost */}
        {metaConnectionStatus && metaConnectionStatus.connected === false &&
          metaConnectionStatus.status !== 'deletion_pending' && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-orange-400/40 bg-orange-500/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-orange-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Your Facebook connection has expired.</strong> Reconnect to continue receiving leads and ad data.
              </span>
            </div>
            <button
              onClick={handleReconnectMeta}
              disabled={isReconnecting}
              className="shrink-0 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {isReconnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          </div>
        )}
        {/* Google Workspace Account Card */}
        <div className="mb-6">
          <GoogleAccountCard />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto no-scrollbar mb-4">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="settings">Integration Settings</TabsTrigger>
            </TabsList>
          </div>
          {[
            "all",
            "marketing",
            "messaging",
            "webhooks",
            "settings",
          ].map((category) => (
            <TabsContent key={category} value={category}>
              {category === "marketing" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {integrations
                      .filter((i) => i.category === "marketing")
                      .map((integration) => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          connectedIntegrations={connectedIntegrations}
                          onAction={handleIntegrationAction}
                          onDeactivate={handleDeactivateRequest}
                          isConnecting={isConnecting && (selectedIntegrationId === integration.id || connectingIntegrationId === integration.id)}
                        />
                      ))}
                  </div>

                  {/* Conversion API Management Components */}
                  <div className="pt-8 border-t">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold">Conversion API Management</h2>
                      <p className="text-sm text-muted-foreground">Manage configurations and track lead events</p>
                    </div>
                    <div className="space-y-6">
                      <FacebookConversionApiManager />
                      <LeadConversionTracker />
                      <ConversionApiTester />
                    </div>
                  </div>
                </div>
              ) : category === "webhooks" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Webhooks</h2>
                      <p className="text-sm text-muted-foreground mt-1">Connect your CRM to external services via incoming or outgoing webhooks.</p>
                    </div>
                    <Button onClick={() => setShowNewWebhookDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Webhook
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Connect New Webhook Card */}
                    <Card className="border-dashed border-2 flex items-center justify-center p-4 hover:bg-muted/50 transition-colors cursor-pointer group gap-3" onClick={() => {
                      setSelectedWebhookId(null);
                      setShowNewWebhookDialog(true);
                    }}>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">Add New Webhook</h3>
                        <p className="text-[11px] text-muted-foreground">Connect another source</p>
                      </div>
                    </Card>

                    {webhooks.map((webhook) => (
                      <Card key={webhook.id} className="flex flex-col p-4 gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-blue-500/10 shrink-0">
                              <Webhook className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold leading-none truncate">{webhook.name}</h3>
                              <p className="text-[11px] text-[var(--crm-text-secondary)] mt-1 truncate">
                                {webhook.url || "No outgoing URL set"}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={webhook.isActive}
                            onCheckedChange={() => toggleWebhook(webhook.id)}
                            className="scale-75 origin-right shrink-0"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[var(--crm-border)]">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
                            onClick={() => {
                              setWebhookToDelete(webhook.id);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          
                          <div className="flex-1 flex justify-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              navigator.clipboard.writeText(`https://api.leadbajaar.com/api/webhooks/incoming/${(webhook as any).uuid}`);
                              toast.success("URL Copied!");
                            }} title="Copy URL">
                              <ClipboardCopy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-3 rounded-lg font-semibold"
                            onClick={() => {
                              setSelectedWebhookId(webhook.id);
                              setShowNewWebhookDialog(true);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1.5" /> Configure
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : category === "settings" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold mb-4">
                    Integration Settings
                  </h2>
                  <Card>
                    <CardContent className="pt-6">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Data Sync Frequency</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <Label htmlFor="sync-frequency">Sync every</Label>
                              <Select>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="360">6 hours</SelectItem>
                                  <SelectItem value="720">12 hours</SelectItem>
                                  <SelectItem value="1440">24 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Data Mapping</AccordionTrigger>
                          <AccordionContent>
                            <p className="mb-4">
                              Configure how data fields from integrated services
                              map to your CRM fields.
                            </p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>Configure Mapping</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Data Mapping Configuration
                                  </DialogTitle>
                                  <DialogDescription>
                                    Map fields from your integrated services to
                                    your CRM fields.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="sourceField"
                                      className="text-right"
                                    >
                                      Source Field
                                    </Label>
                                    <Select>
                                      <SelectTrigger className="w-full col-span-3">
                                        <SelectValue placeholder="Select source field" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="email">
                                          Email
                                        </SelectItem>
                                        <SelectItem value="phone">
                                          Phone
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="targetField"
                                      className="text-right"
                                    >
                                      Target Field
                                    </Label>
                                    <Select>
                                      <SelectTrigger className="w-full col-span-3">
                                        <SelectValue placeholder="Select target field" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="fullName">
                                          Full Name
                                        </SelectItem>
                                        <SelectItem value="emailAddress">
                                          Email Address
                                        </SelectItem>
                                        <SelectItem value="phoneNumber">
                                          Phone Number
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit">Save mapping</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger>Integration Logs</AccordionTrigger>
                          <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Integration</TableHead>
                                  <TableHead>Action</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Timestamp</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dummyLogs.map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {Icons[
                                          log.integration.toLowerCase() as keyof typeof Icons
                                        ] ? (
                                          React.createElement(
                                            Icons[
                                            log.integration.toLowerCase() as keyof typeof Icons
                                            ],
                                            {
                                              className: "h-4 w-4",
                                              style: {
                                                color: integrations.find(
                                                  (i) =>
                                                    i.name.toLowerCase() ===
                                                    log.integration.toLowerCase(),
                                                )?.color,
                                              },
                                            },
                                          )
                                        ) : (
                                          <div className="h-4 w-4" />
                                        )}
                                        {log.integration}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {React.createElement(log.icon, {
                                          className: "h-4 w-4 text-gray-500",
                                        })}
                                        {log.action}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {log.status === "Success" ? (
                                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Success
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 flex items-center gap-1">
                                            <XCircle className="h-3 w-3" />
                                            Failed
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                      {log.timestamp}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {integrations
                    .filter(
                      (integration) => {
                        const categoryMatch = category === "all" || integration.category === category;
                        
                        // Use hasFeature if the integration defines required features
                        let featureMatch = true;
                        if (integration.id === 'whatsapp') {
                          featureMatch = hasFeature('whatsapp_cloud_api');
                        } else if (integration.plans) {
                          // Fallback for other items still using 'plans'
                          featureMatch = hasPlan(integration.plans) || hasType(['agency', 'super_admin']);
                        }
                        
                        return categoryMatch && featureMatch;
                      }
                    )
                    .map((integration) => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        connectedIntegrations={connectedIntegrations}
                        onAction={handleIntegrationAction}
                        onDeactivate={handleDeactivateRequest}
                        isConnecting={isConnecting && (selectedIntegrationId === integration.id || connectingIntegrationId === integration.id)}
                      />
                    ))}
                </div>
              )}
              {/* </div> */}
            </TabsContent>
          ))}
        </Tabs>

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
            } catch (e) {
              toast.error('Synchronization failed');
            } finally {
              setIsConnecting(false);
            }
          }}
          onSendTest={() => setShowTestEmailDialog(true)}
          isConnecting={isConnecting}
        />

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
              toast.success('Professional test email dispatched!');
              setShowTestEmailDialog(false);
            } catch (e) {
              toast.error('Test dispatch failed');
            } finally {
              setIsConnecting(false);
            }
          }}
          isConnecting={isConnecting}
        />

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
          startListening={startListening}
          addFieldMapping={addFieldMapping}
          updateFieldMapping={updateFieldMapping}
          removeFieldMapping={removeFieldMapping}
        />

        <UnifiedIntegrationDialog
          isOpen={!!selectedIntegrationId && selectedIntegrationId !== "webhook" && selectedIntegrationId !== "email"}
          onOpenChange={(open) => !open && setSelectedIntegrationId(null)}
          selectedIntegrationId={selectedIntegrationId}
          integrations={integrations}
          currentUserId={currentUserId}
          whatsappConfig={whatsappConfig}
          setWhatsappConfig={setWhatsappConfig}
          facebookConfig={facebookConfig}
          setFacebookConfig={setFacebookConfig}
          facebookConversionApiConfig={facebookConversionApiConfig}
          setFacebookConversionApiConfig={setFacebookConversionApiConfig}
          configErrors={configErrors}
          isConnecting={isConnecting}
          onSave={handleIntegrationConnect}
        />
        <DeleteConfirmationModal
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={deleteWebhook}
          isLoading={isDeleting}
          title="Deactivate Integration"
          description="Are you sure you want to deactivate this integration? This action can be undone later by re-connecting from the integrations gallery."
          confirmText="Confirm Deactivation"
        />

      <Dialog open={!!integrationToConfirm} onOpenChange={(open) => !open && setIntegrationToConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to connect {integrationToConfirm?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setIntegrationToConfirm(null)} disabled={isConnecting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmConnect} disabled={isConnecting} className="bg-indigo-600 hover:bg-indigo-700">
              {isConnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Yes, Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </RoleGuard>
  );
}
