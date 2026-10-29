'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '@/lib/api';

import { MetaAccountHeader } from './MetaAccountHeader';
import { MetaPagesPanel, FacebookPageItem } from './MetaPagesPanel';
import { MetaLeadFormsPanel, LeadFormItem } from './MetaLeadFormsPanel';
import { MetaDataCompliancePanel } from './MetaDataCompliancePanel';

export function MetaAuthContainer() {
  const [activeTab, setActiveTab] = useState('pages');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  const [pages, setPages] = useState<FacebookPageItem[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPageItem | null>(null);

  const [forms, setForms] = useState<LeadFormItem[]>([]);
  const [trackedFormIds, setTrackedFormIds] = useState<string[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [syncingFormId, setSyncingFormId] = useState<string | null>(null);

  const [businesses, setBusinesses] = useState<Array<{ business_id: string; name: string }>>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // 1. Fetch initial status from backend
  const loadStatus = useCallback(async (showToast: boolean = false) => {
    try {
      setIsLoading(true);
      const res = await integrationApi.getMetaStatus();
      setStatusData(res);

      const rawPages: FacebookPageItem[] = (res.facebook_pages || []).map((p: any) => ({
        id: p.id || p.config?.page_id,
        name: p.name || p.config?.page_name || 'Facebook Page',
        category: p.category,
        webhook_subscribed: p.webhook_subscribed ?? false,
      }));

      setPages(rawPages);

      // Auto-select first page if none selected or if previously selected is gone
      setSelectedPage((prev) => {
        if (prev && rawPages.some((p) => p.id === prev.id)) {
          return rawPages.find((p) => p.id === prev.id) || null;
        }
        return rawPages[0] || null;
      });

      const rawBusinesses = res.businesses || [];
      setBusinesses(rawBusinesses);
      if (rawBusinesses.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(rawBusinesses[0].business_id);
      }

      if (showToast) {
        toast.success("Assets synchronized successfully");
      }
    } catch (err: any) {
      console.error("Failed to load Meta status:", err);
      toast.error("Status check failed", {
        description: err.message || "Could not retrieve Meta integration status.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusinessId]);

  // 2. Fetch forms when selectedPage changes
  const loadForms = useCallback(async (page: FacebookPageItem) => {
    if (!page?.id) return;
    try {
      setIsLoadingForms(true);
      setForms([]);
      setTrackedFormIds([]);

      // Fetch lead forms for page
      const formsRes = await integrationApi.getMetaPageForms(page.id);
      if (formsRes.status === 'success' && Array.isArray(formsRes.forms)) {
        setForms(formsRes.forms);
      } else {
        setForms([]);
      }

      // Fetch tracked forms for page
      try {
        const trackedRes = await integrationApi.getMetaTrackedForms(page.id);
        if (trackedRes.status === 'success' && Array.isArray(trackedRes.forms)) {
          setTrackedFormIds(trackedRes.forms.map((f: any) => f.form_id));
        }
      } catch (trackErr) {
        console.warn("Could not load tracked forms:", trackErr);
      }
    } catch (err: any) {
      toast.error("Failed to fetch lead forms", {
        description: err.message || "Unable to reach Meta Graph API.",
      });
    } finally {
      setIsLoadingForms(false);
    }
  }, []);

  // Initial mount
  useEffect(() => {
    loadStatus();

    // Listen for custom event triggered after OAuth popup completes
    const handleTriggerSync = () => {
      setTimeout(() => loadStatus(true), 600);
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'META_OAUTH_SUCCESS') {
        localStorage.removeItem('META_OAUTH_SUCCESS');
        toast.success("Facebook Account Connected", {
          description: "Your Meta assets have been synchronized.",
        });
        loadStatus(true);
      }
    };

    window.addEventListener('TRIGGER_META_SYNC', handleTriggerSync);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('TRIGGER_META_SYNC', handleTriggerSync);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [loadStatus]);

  // When selectedPage changes, load forms
  useEffect(() => {
    if (selectedPage) {
      loadForms(selectedPage);
    } else {
      setForms([]);
      setTrackedFormIds([]);
    }
  }, [selectedPage, loadForms]);

  // Connect Meta OAuth popup flow
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const res = await integrationApi.connectMeta();
      if (!res.auth_url) {
        throw new Error("No authorization URL returned from server.");
      }

      const popup = window.open(
        res.auth_url,
        'facebook-oauth',
        'width=650,height=750,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site in your browser.");
      }

      // Fallback polling in case storage event doesn't fire
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          loadStatus(true);
        }
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      toast.error("Connection Failed", { description: err.message });
    }
  };

  // Manual Sync Assets
  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await loadStatus(true);
      if (selectedPage) {
        await loadForms(selectedPage);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Subscribe page to webhook
  const handleSubscribePage = async (pageId: string) => {
    try {
      setIsSubscribing(true);
      const res = await integrationApi.subscribeMetaPage(pageId);
      if (res.status === 'success') {
        toast.success("Page Subscribed to Webhook", {
          description: "Meta will now stream real-time lead submissions to your CRM.",
        });
        await loadStatus();
      }
    } catch (err: any) {
      toast.error("Webhook Subscription Failed", { description: err.message });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Toggle Tracking Form
  const handleToggleTrackForm = async (form: LeadFormItem, isTracked: boolean) => {
    if (!selectedPage) return;
    try {
      if (isTracked) {
        await integrationApi.trackMetaForm(selectedPage.id, form.id, form.name, selectedPage.name);
        setTrackedFormIds((prev) => [...prev, form.id]);
        toast.success("Form Synced", {
          description: `Automatic lead capture enabled for "${form.name}".`,
        });
      } else {
        setTrackedFormIds((prev) => prev.filter((id) => id !== form.id));
        toast.info("Form Untracked", {
          description: `Auto-sync disabled for "${form.name}".`,
        });
      }
    } catch (err: any) {
      toast.error("Failed to update form tracking", { description: err.message });
    }
  };

  // Pull past leads (historical sync)
  const handlePullRecentLeads = async (form: LeadFormItem) => {
    try {
      setSyncingFormId(form.id);
      toast.info("Importing leads...", {
        description: `Fetching past 7 days of leads for "${form.name}".`,
      });

      const res = await integrationApi.syncMetaLeads(form.id, 7);
      if (res.status === 'success') {
        toast.success("Sync Complete", {
          description: `Successfully imported ${res.synced_count ?? 0} leads into CRM.`,
        });
      }
    } catch (err: any) {
      toast.error("Sync Failed", { description: err.message });
    } finally {
      setSyncingFormId(null);
    }
  };

  // Create Form
  const handleCreateForm = async (payload: {
    name: string;
    questions: Array<{ type: string; key: string }>;
    privacy_policy?: { url: string };
    follow_up_url?: string;
  }) => {
    if (!selectedPage) return;
    try {
      const res = await integrationApi.createMetaPageForm(selectedPage.id, payload);
      if (res.status === 'success' || res.id) {
        toast.success("Lead Form Created on Meta", {
          description: `Form "${payload.name}" is now active on your page.`,
        });
        await loadForms(selectedPage);
      }
    } catch (err: any) {
      toast.error("Form creation failed", { description: err.message });
    }
  };

  // Data Deletion
  const handleRequestDataDeletion = async () => {
    const res = await integrationApi.dataDeletionRequest();
    return res.confirmation_code;
  };

  // Disconnect Meta Account
  const handleDisconnectAccount = async () => {
    await integrationApi.disconnectMeta();
    await loadStatus();
    window.dispatchEvent(new Event('integrationsUpdated'));
  };

  const isConnected = Boolean(statusData?.connected);
  const userName = statusData?.facebook_oauth?.metadata?.meta_user_name || statusData?.meta_user_name;
  const metaUserId = statusData?.facebook_oauth?.metadata?.meta_user_id || statusData?.meta_user_id;

  return (
    <div className="space-y-6">
      {/* ── 1. Unified Account Header ────────────────────────────────────────── */}
      <MetaAccountHeader
        isConnected={isConnected}
        isLoading={isLoading}
        isSyncing={isSyncing}
        userName={userName}
        metaUserId={metaUserId}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onSelectBusiness={(id) => {
          setSelectedBusinessId(id);
          loadStatus();
        }}
        onConnect={handleConnect}
        onSync={handleManualSync}
        onDisconnectClick={() => setActiveTab('compliance')}
      />

      {/* ── 2. Modular Tab Navigation ────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="border-b border-slate-200/90 dark:border-slate-800">
          <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8">
            <TabsTrigger
              value="pages"
              className="px-1 py-3 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-b-2 border-transparent rounded-none data-[state=active]:border-[#E84C3A] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-transparent shadow-none transition-all flex items-center gap-2 tracking-tight"
            >
              <Globe className="h-4 w-4" />
              <span>Pages &amp; Lead Forms</span>
              {pages.length > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {pages.length}
                </span>
              )}
            </TabsTrigger>



            <TabsTrigger
              value="compliance"
              className="px-1 py-3 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-b-2 border-transparent rounded-none data-[state=active]:border-[#E84C3A] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-transparent shadow-none transition-all flex items-center gap-2 tracking-tight"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy &amp; Compliance</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab Content: Pages & Lead Forms ───────────────────────────────── */}
        <TabsContent value="pages" className="m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Pages List (5 cols) */}
            <div className="lg:col-span-5">
              <MetaPagesPanel
                pages={pages}
                selectedPage={selectedPage}
                onSelectPage={(p) => setSelectedPage(p)}
                onSubscribePage={handleSubscribePage}
                isSubscribing={isSubscribing}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column: Lead Forms for Selected Page (7 cols) */}
            <div className="lg:col-span-7">
              <MetaLeadFormsPanel
                selectedPage={selectedPage}
                forms={forms}
                trackedFormIds={trackedFormIds}
                isLoadingForms={isLoadingForms}
                onToggleTrackForm={handleToggleTrackForm}
                onPullRecentLeads={handlePullRecentLeads}
                onCreateForm={handleCreateForm}
                syncingFormId={syncingFormId}
              />
            </div>
          </div>
        </TabsContent>



        {/* ── Tab Content: Privacy & Compliance ──────────────────────────────── */}
        <TabsContent value="compliance" className="m-0 focus-visible:outline-none">
          <MetaDataCompliancePanel
            onRefreshStatus={() => loadStatus(true)}
            onRequestDataDeletion={handleRequestDataDeletion}
            onDisconnectAccount={handleDisconnectAccount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
