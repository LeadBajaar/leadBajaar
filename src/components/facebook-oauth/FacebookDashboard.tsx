'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Facebook,
  MessageCircle,
  Globe,
  Instagram,
  TrendingUp,
  Users,
  Phone,
  Settings,
  Loader2,
  RefreshCw,
  BarChart3,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Plus,
  Search,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  X,
  Trash2,
  Archive,
  Play,
  Pause,
  Zap,
  Eye,
  Info,
  ChevronDown,
  Check,
  Edit3,
  Filter,
  Copy,
  Pencil,
  Share2,
  Layout,
  Layers,
  List,
  ShieldCheck,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { integrationApi } from '@/lib/api'
import { PixelTestConsole } from './PixelTestConsole'
import { RoiDashboard } from './RoiDashboard'
import { WebhookVerificationDialog } from './WebhookVerificationDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ErrorDialog } from "@/components/ui/ErrorDialog"

interface FacebookPage {
  id: string
  name: string
  access_token?: string
  tasks?: string[]
  category?: string
  connected_at?: string
}

interface LeadForm {
  id: string
  name: string
  status: string
  created_time: string
}

const AD_ACCOUNT_STATUS_MAP: Record<number, { text: string, color: string }> = {
  1: { text: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  2: { text: 'Disabled', color: 'bg-red-100 text-red-700 border-red-200' },
  3: { text: 'Unsettled', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  4: { text: 'Pending Review', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  7: { text: 'In Grace Period', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  100: { text: 'Pending Closure', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  101: { text: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const CTA_OPTIONS = [
  { label: 'Learn More', value: 'LEARN_MORE' },
  { label: 'Get Quote', value: 'GET_QUOTE' },
  { label: 'Sign Up', value: 'SIGN_UP' },
  { label: 'Apply Now', value: 'APPLY_NOW' },
  { label: 'Download', value: 'DOWNLOAD' },
  { label: 'Get Offer', value: 'GET_OFFER' },
]

export function FacebookDashboard() {
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null)
  const [forms, setForms] = useState<LeadForm[]>([])
  const [adAccounts, setAdAccounts] = useState<any[]>([])
  const [selectedAdAccount, setSelectedAdAccount] = useState<any | null>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null)
  const [adSets, setAdSets] = useState<any[]>([])
  const [selectedAdSet, setSelectedAdSet] = useState<any | null>(null)
  const [ads, setAds] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [isLaunchingTemplate, setIsLaunchingTemplate] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusData, setStatusData] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null)
  const [isSyncingAssets, setIsSyncingAssets] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoadingForms, setIsLoadingForms] = useState(false)
  const [isConnectingMeta, setIsConnectingMeta] = useState(false)
  const [formsError, setFormsError] = useState<string | null>(null)
  const [isLoadingAds, setIsLoadingAds] = useState(false)
  const [isLoadingAdSets, setIsLoadingAdSets] = useState(false)
  const [isLoadingSpecificAds, setIsLoadingSpecificAds] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCreatingForm, setIsCreatingForm] = useState(false)
  const [newCampaignObjective, setNewCampaignObjective] = useState('OUTCOME_LEADS')
  const [isSpecialCategory, setIsSpecialCategory] = useState(false)
  const [creatives, setCreatives] = useState<any[]>([])
  const [isCreativesLoading, setIsCreativesLoading] = useState(false)
  const [isCreateFormDialogOpen, setIsCreateFormDialogOpen] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [setupChecklist, setSetupChecklist] = useState<any>(null)
  const [isDeepSyncing, setIsDeepSyncing] = useState(false)
  const [isCreateAudienceDialogOpen, setIsCreateAudienceDialogOpen] = useState(false)
  const [newAudienceName, setNewAudienceName] = useState('')
  const [isCreatingAudience, setIsCreatingAudience] = useState(false)
  const [isCreateAdSetDialogOpen, setIsCreateAdSetDialogOpen] = useState(false)
  const [newAdSetName, setNewAdSetName] = useState('')
  const [isCreatingAdSet, setIsCreatingAdSet] = useState(false)
  const [isCreateAdDialogOpen, setIsCreateAdDialogOpen] = useState(false)
  const [newAdName, setNewAdName] = useState('')
  const [selectedAdPageId, setSelectedAdPageId] = useState('')
  const [selectedAdFormId, setSelectedAdFormId] = useState('')
  const [adCreationForms, setAdCreationForms] = useState<any[]>([])
  const [isLoadingAdCreationForms, setIsLoadingAdCreationForms] = useState(false)
  const [isCreatingAd, setIsCreatingAd] = useState(false)
  const [newAdPrimaryText, setNewAdPrimaryText] = useState('Sign up to learn more about our exclusive offers!')
  const [newAdHeadline, setNewAdHeadline] = useState('Limited Time Offer!')
  const [newAdCta, setNewAdCta] = useState('LEARN_MORE')
  const [newAdImageUrl, setNewAdImageUrl] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=628&fit=crop')
  const [adAccountSearch, setAdAccountSearch] = useState('')
  const [isCreateCreativeDialogOpen, setIsCreateCreativeDialogOpen] = useState(false)
  const [newCreativeName, setNewCreativeName] = useState('')
  const [newCreativeMsg, setNewCreativeMsg] = useState('Check this out!')
  const [newCreativeHeadline, setNewCreativeHeadline] = useState('Limited Time Offer!')
  const [newCreativeCta, setNewCreativeCta] = useState('LEARN_MORE')
  const [newCreativeImageUrl, setNewCreativeImageUrl] = useState('')
  const [isCreatingCreative, setIsCreatingCreative] = useState(false)
  const [useLibraryCreative, setUseLibraryCreative] = useState(false)
  const [selectedLibraryCreativeId, setSelectedLibraryCreativeId] = useState('')
  const [lastError, setLastError] = useState<{ title: string, description: string, action: string, url?: string } | null>(null)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [pixels, setPixels] = useState<any[]>([])
  const [isSyncingPixels, setIsSyncingPixels] = useState(false)
  const [isLoadingPixels, setIsLoadingPixels] = useState(false)
  const [isPixelScriptDialogOpen, setIsPixelScriptDialogOpen] = useState(false)
  const [selectedPixelForScript, setSelectedPixelForScript] = useState<any | null>(null)
  const [isAdAccountOpen, setIsAdAccountOpen] = useState(false)
  const [activeInnerTab, setActiveInnerTab] = useState('campaigns')
  const [newAdSetBudget, setNewAdSetBudget] = useState(100)
  const [isEditCampaignDialogOpen, setIsEditCampaignDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string, label: string }>({ isOpen: false, id: '', label: '' })
  const [isDeletingObject, setIsDeletingObject] = useState(false)
  const [resourceFilter, setResourceFilter] = useState<'all' | 'active'>('all')
  const [isSyncingHistory, setIsSyncingHistory] = useState<string | null>(null)
  const [isDataDeletionDialogOpen, setIsDataDeletionDialogOpen] = useState(false)
  const [isDisconnectMetaDialogOpen, setIsDisconnectMetaDialogOpen] = useState(false)
  const [isDeletingData, setIsDeletingData] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDeletionStatusDialogOpen, setIsDeletionStatusDialogOpen] = useState(false)

  useEffect(() => {
    // Check for success/error parameters from Meta OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('meta_connected') === 'success') {
      toast.success("Meta Connected Successfully", {
        description: "Your Meta account has been linked and pages are being synced.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error')) {
      toast.error("Connection Failed", {
        description: urlParams.get('error') || "Failed to connect Meta account.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadPages()
    loadAdAccounts()
    loadTemplates()
    loadPixels()
  }, [])

  useEffect(() => {
    const fetchFormsForAd = async () => {
      if (!selectedAdPageId) return
      try {
        setIsLoadingAdCreationForms(true)
        const response = await integrationApi.getMetaPageForms(selectedAdPageId)
        if (response.status === 'success') {
          setAdCreationForms(response.forms || [])
          if (response.forms?.length > 0) {
            setSelectedAdFormId(response.forms[0].id)
          }
        }
      } catch (err: any) {
        // Silent handling for restricted assets as it's a known state
      } finally {
        setIsLoadingAdCreationForms(false)
      }
    }
    fetchFormsForAd()
  }, [selectedAdPageId])

  useEffect(() => {
    if (pages.length > 0 && !selectedAdPageId) {
      setSelectedAdPageId(pages[0].id)
    }
  }, [pages])

  useEffect(() => {
    if (selectedAdAccount) {
      loadCampaigns(selectedAdAccount.id)
      loadCreatives(selectedAdAccount.id)
    }
  }, [selectedAdAccount])

  useEffect(() => {
    if (selectedBusiness) {
      const fetchBusinessAssets = async () => {
        try {
          setIsLoading(true)
          const response = await integrationApi.getMetaBusinessAssets(selectedBusiness.business_id)
          if (response.status === 'success') {
            setAdAccounts(response.ad_accounts || [])
            setPages(response.facebook_pages || [])
            if (response.ad_accounts?.length > 0) {
                setSelectedAdAccount(response.ad_accounts[0])
            }
            if (response.facebook_pages?.length > 0) {
                setSelectedAdPageId(response.facebook_pages[0].id)
            }
          }
        } catch (err) {
          console.error("Error loading business assets:", err)
          toast.error("Asset Sync Failed", { description: "Could not retrieve assets for this business." })
        } finally {
          setIsLoading(false)
        }
      }
      fetchBusinessAssets()
    } else {
      // Reload defaults if "all/personal" selected
      loadAdAccounts()
      loadPages()
    }
  }, [selectedBusiness])

  // Helper to humanize Meta API errors & provide "what to do next"
  const formatMetaError = (errorMsg: any) => {
    let parsedError: any = null;
    let rawMessage = "";

    try {
      if (typeof errorMsg === 'string') {
        rawMessage = errorMsg;
        if (errorMsg.trim().startsWith('{')) {
          parsedError = JSON.parse(errorMsg);
        }
      } else if (typeof errorMsg === 'object' && errorMsg !== null) {
        parsedError = errorMsg;
        rawMessage = JSON.stringify(errorMsg);
      }
    } catch (e) {
      rawMessage = String(errorMsg);
    }

    const errorString = rawMessage.toLowerCase();
    const subcode = parsedError?.error_subcode?.toString() || "";
    const metaMessage = parsedError?.error_user_msg || parsedError?.message || rawMessage;
    const metaTitle = parsedError?.error_user_title;

    // 1. High-priority specific codes
    if (subcode === '80004' || errorString.includes('80004') || errorString.includes('rate limit')) {
      return {
        title: metaTitle || "Meta Rate Limit Hit",
        description: "You've synced too many accounts too quickly. Meta is temporarily throttling requests.",
        action: "Please wait 15-30 minutes before trying again."
      };
    }

    // Payment method
    if (subcode === '1359188' || errorString.includes('1359188') || errorString.includes('payment method')) {
      return {
        title: metaTitle || "Meta Payment Required",
        description: parsedError?.error_user_msg || "Your Ad Account does not have a valid payment method configured.",
        action: "Go to Meta Ads Manager > Billing & Payments to add a card before you can launch ads."
      };
    }

    // Capability/Permissions
    if (errorString.includes('code 3') || errorString.includes('capability')) {
      return {
        title: "Missing Permissions",
        description: "Your Facebook App lacks 'Ads Management' capability or is in Development Mode.",
        action: "Set your App to 'Live' at developers.facebook.com and ensure 'Standard Access' for Ads API."
      };
    }

    // Budget issues
    if (subcode === '4834011' || errorString.includes('4834011')) {
      return {
        title: metaTitle || "Budget Config Error",
        description: "Campaign budget sharing or Ad Set budget is not configured correctly for v25.0.",
        action: "Check if Campaign Budget Optimization is enabled and set a valid value."
      };
    }

    // Bid strategy
    if (subcode === '2490487' || errorString.includes('2490487')) {
      return {
        title: metaTitle || "Bid Strategy Required",
        description: "Meta requires a clear bid strategy or bid amount for this ad account.",
        action: "The system automatically sets 'Lowest Cost', but you may need to define a manual bid if your account is restricted."
      };
    }

    // Ad Creative Incomplete
    if (subcode === '2446391' || errorString.includes('2446391')) {
      return {
        title: metaTitle || "Ad Creative Incomplete",
        description: "Your ad structure is missing critical elements like an image, form ID, or page association.",
        action: "Ensure you've selected a Lead Form and that the Page has appropriate permissions."
      };
    }

    // Connection issues
    if (subcode === '190' || errorString.includes('190') || errorString.includes('expired')) {
      return {
        title: "Connection Expired",
        description: "Your Facebook access token has expired or was revoked.",
        action: "Please log out of Meta and reconnect your account."
      };
    }

    // Custom Audience or Lead Gen Terms
    if (subcode === '1892181' || subcode === '1870090' || errorString.includes('terms') || parsedError?.error_type === 'TOS_REQUIRED') {
      return {
        title: "Terms of Service Required",
        description: "You must accept the Lead Generation Terms of Service for your Facebook Page.",
        action: `Follow the link below to accept Meta's Lead Generation Terms for this ad account: ${parsedError?.tos_url || 'https://www.facebook.com/ads/leadgen/tos'}`,
        url: parsedError?.tos_url
      };
    }

    // Generic Invalid Parameter fallback
    if (errorString.includes('100') || errorString.includes('invalid parameter')) {
      return {
        title: metaTitle || "Invalid Meta Parameter",
        description: metaMessage,
        action: "Check your name, targeting, and budget fields for invalid characters or values."
      };
    }

    return {
      title: metaTitle || "Meta Operation Blocked",
      description: metaMessage || "Something went wrong while communicating with Facebook.",
      action: "Check the Meta Ad Account settings or your internet connection."
    };
  };

  const loadPages = async () => {
    try {
      setIsLoading(true)
      const response = await integrationApi.getMetaStatus()
      setStatusData(response)
      if (response.connected) {
        setPages(response.facebook_pages || [])
        setBusinesses(response.businesses || [])
        setSetupChecklist(response.setup_checklist || null)
      }
    } catch (error: any) {
      console.error('Failed to load Meta pages:', error)
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      toast.error(metaErr.title, {
        description: `${metaErr.description} ${metaErr.action}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualDataDeletionRequest = () => {
    setIsDataDeletionDialogOpen(true)
  }

  const handleConfirmDataDeletion = async () => {
    try {
      setIsDeletingData(true)
      const response = await integrationApi.dataDeletionRequest()
      
      if (response.confirmation_code) {
        toast.success("Request Sent", { 
          description: `Your data deletion request (ID: ${response.confirmation_code}) has been registered.` 
        })
      }
      setIsDataDeletionDialogOpen(false)
    } catch (error: any) {
      toast.error("Request Failed", { description: error.message })
    } finally {
      setIsDeletingData(false)
    }
  }

  const handleDisconnectMeta = () => {
    setIsDisconnectMetaDialogOpen(true)
  }

  const confirmDisconnectMeta = async () => {
    try {
      setIsDisconnecting(true)
      const response = await integrationApi.disconnectMeta()
      if (response.status === 'success') {
        toast.success("Disconnected", { description: "Your Meta account has been disconnected successfully." })
        window.location.reload()
      }
    } catch (error: any) {
      toast.error("Disconnect Failed", { description: error.message })
    } finally {
      setIsDisconnecting(false)
      setIsDisconnectMetaDialogOpen(false)
    }
  }

  const handleRefreshStatus = async () => {
    try {
      setIsSyncingAssets(true)
      await loadPages()
      
      if (selectedBusiness) {
        const response = await integrationApi.getMetaBusinessAssets(selectedBusiness.business_id)
        if (response.status === 'success') {
          setAdAccounts(response.ad_accounts || [])
          setPages(response.facebook_pages || [])
        }
      } else {
        await loadAdAccounts()
      }
      
      await loadTemplates()
      await loadPixels()
      
      toast.success("Sync Complete", { description: "Your Meta assets have been synchronized." })
    } catch (err) {
      console.error("Refresh failed:", err)
      toast.error("Sync Failed", { description: "Could not refresh your Meta assets." })
    } finally {
      setIsSyncingAssets(false)
    }
  }

  const handleCheckDeletionStatus = () => {
    if (statusData?.status === 'deletion_pending') {
      setIsDeletionStatusDialogOpen(true)
    } else {
      toast.info("No Active Deletion", { description: "You don't have a pending data deletion request for this account." })
    }
  }

  const loadAdAccounts = async () => {
    try {
      const response = await integrationApi.getMetaAdAccounts()
      if (response.status === 'success') {
        const rawAccounts = response.ad_accounts || []
        // Deduplicate accounts by ID to prevent key errors
        const uniqueAccounts: any[] = []
        const seenIds = new Set()

        rawAccounts.forEach((acc: any) => {
          if (!seenIds.has(acc.id)) {
            seenIds.add(acc.id)
            uniqueAccounts.push(acc)
          }
        })

        setAdAccounts(uniqueAccounts)
      }
    } catch (error: any) {
      console.error('Failed to load ad accounts:', error)
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      toast.error("Account Load Failed", {
        description: `${metaErr.description}\n\n👉 Next step: ${metaErr.action}`,
      })
    }
  }

  const loadCampaigns = async (adAccountId: string, isRefreshing = false) => {
    try {
      if (!isRefreshing) setIsLoadingAds(true)
      const [campaignsRes, insightsRes] = await Promise.all([
        integrationApi.getMetaCampaigns(adAccountId),
        integrationApi.getMetaAdAccountInsights(adAccountId)
      ])

      if (campaignsRes.status === 'success') {
        setCampaigns(campaignsRes.campaigns || [])
      }
      if (insightsRes.status === 'success') {
        setInsights(insightsRes.insights || [])
      }
      
      // Only clear child states if we are NOT just refreshing
      if (!isRefreshing) {
        setSelectedCampaign(null)
        setAdSets([])
        setAds([])
      }
    } catch (error: any) {
      console.error('Failed to load campaigns:', error)
      toast.error("Failed to load campaigns", {
        description: "Failed to load Meta Ads data",
      })
    } finally {
      setIsLoadingAds(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await integrationApi.getMetaTemplates()
      if (response.status === 'success') {
        setTemplates(response.templates || [])
      }
    } catch (error) {
      console.error('Failed to load templates')
      toast.error("Failed to load templates", { description: "Could not retrieve ad templates." })
    }
  }

  const loadPageForms = async (page: FacebookPage) => {
    try {
      setSelectedPage(page)
      setIsSubscribed(false)
      setIsLoadingForms(true)
      setForms([])
      setFormsError(null)

      const response = await integrationApi.getMetaPageForms(page.id)
      if (response.status === 'success') {
        setForms(response.forms || [])
      } else {
        setFormsError(response.error || "Could not load forms for this page.")
        toast.error("Access Restricted", {
          description: response.error || "Could not load forms for this page.",
        })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to load lead forms for this page"
      setFormsError(errorMessage)
    } finally {
      setIsLoadingForms(false)
    }
  }

  const handleMetaConnect = async () => {
    setIsConnectingMeta(true)
    try {
      const response = await integrationApi.connectMeta()
      const popup = window.open(
        response.auth_url,
        'facebook-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsConnectingMeta(false)
          toast.success("Connection Updated", { description: "Refreshing your assets from Meta..." })
          loadPages()
          // Optional: Trigger a manual sync to be sure
          handleManualSyncAssets()
        }
      }, 1000)
    } catch (error: any) {
      toast.error("Connection Failed", { description: error.message })
      setIsConnectingMeta(false)
    }
  }

  const handleSyncHistory = async (form: LeadForm) => {
    try {
      setIsSyncingHistory(form.id)
      toast.info("Manual Sync Started", {
        description: `Fetching recent leads for "${form.name}"...`
      })

      const response = await integrationApi.syncMetaLeads(form.id, 7)

      if (response.status === 'success') {
        toast.success("Sync Completed", {
          description: `Successfully imported ${response.synced_count || 0} leads into CRM.`,
        })
      }
    } catch (error: any) {
      toast.error("Sync Failed", { description: error.message })
    } finally {
      setIsSyncingHistory(null)
    }
  }
  const handleDeepSyncAccount = async () => {
    if (!selectedAdAccount) return
    setIsDeepSyncing(true)
    try {
      const response = await integrationApi.syncMetaAdAccountDetails(selectedAdAccount.id)
      toast.success("Deep Sync Complete", {
        description: response.message || "Reports and campaign history refreshed for this account."
      })
      // Refresh the UI with new data
      loadCampaigns(selectedAdAccount.id)
    } catch (error: any) {
      toast.error("Deep Sync Failed", {
        description: error.message,
      })
    } finally {
      setIsDeepSyncing(false)
    }
  }

  const handleManualSyncAssets = async () => {
    setIsSyncingAssets(true)
    try {
      const response = await integrationApi.syncMetaAssets()
      setIsSyncingAssets(false)

      setTimeout(() => {
        toast.success("Dashboard Refreshed", {
          description: "Ad account list and pages updated successfully."
        })
      }, 100);

      loadPages()
      loadAdAccounts()
    } catch (error: any) {
      setIsSyncingAssets(false)
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setTimeout(() => {
        toast.error(metaErr.title, {
          description: `${metaErr.description}\n\n👉 Next step: ${metaErr.action}`,
        })
      }, 100);
    }
  }

  const handleSubscribePage = async () => {
    if (!selectedPage) return;

    console.log('Manually checking webhook subscription for:', selectedPage.id);
    setIsSubscribing(true);
    try {
      const response = await integrationApi.subscribeMetaPage(selectedPage.id);
      console.log('Subscription response:', response);

      if (response?.status === 'success') {
        setIsSubscribed(true);
        toast.success("Webhook Verified", { description: "Page webhook subscription is active." })
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error("Subscription Failed", { description: error.message })
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCreateAdSet = async () => {
    if (!selectedAdAccount || !selectedCampaign || !newAdSetName) return

    try {
      setIsCreatingAdSet(true)
      const data = {
        campaign_id: selectedCampaign.id,
        name: newAdSetName,
        daily_budget: newAdSetBudget * 100, // Convert to cents/paise
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LEAD_GENERATION',
        promoted_object: { page_id: selectedPage?.id || pages[0]?.id },
        targeting: { geo_locations: { countries: ['IN'] } },
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        status: 'PAUSED'
      }

      const response = await integrationApi.createMetaAdSet(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast.success("Ad Set Created", { description: "New ad set added to campaign." })
        setIsCreateAdSetDialogOpen(false)
        setNewAdSetName('')
        loadAdSets(selectedCampaign)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingAdSet(false)
    }
  }

  const handleCreateAd = async () => {
    if (!selectedAdAccount || !selectedAdSet || !newAdName) return

    if (!useLibraryCreative && (!selectedAdPageId || !selectedAdFormId)) {
      setLastError({
        title: "Missing Assets",
        description: "A Facebook Page and Lead Form must be selected to create an ad.",
        action: "Please select a Page and a Lead Form from the dropdowns below."
      })
      setIsErrorDialogOpen(true)
      return
    }

    if (useLibraryCreative && !selectedLibraryCreativeId) {
      toast.error("Creative Selection Required", { description: "Please select a creative from your library." })
      return
    }

    try {
      setIsCreatingAd(true)
      const data = {
        adset_id: selectedAdSet.id,
        name: newAdName,
        status: 'PAUSED',
        ...(useLibraryCreative ? {
          existing_creative_id: selectedLibraryCreativeId
        } : {
          creative: {
            name: `${newAdName} Creative`,
            page_id: selectedAdPageId,
            form_id: selectedAdFormId,
            message: newAdPrimaryText,
            link: "https://leadbajaar.com",
            headline: newAdHeadline,
            image_url: newAdImageUrl,
            call_to_action: newAdCta
          }
        })
      }

      const response = await integrationApi.createMetaAd(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast.success("Ad Created", { description: "New ad added to ad set." })
        setIsCreateAdDialogOpen(false)
        setNewAdName('')
        loadAds(selectedAdSet)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingAd(false)
    }
  }

  const handleDuplicateObject = async (id: string, type: string) => {
    try {
      toast.info(`Duplicating ${type}...`, { description: "Preparing a copy with same assets." })
      const response = await integrationApi.duplicateMetaObject(id)
      if (response.status === 'success') {
        toast.success(`${type} Duplicated`, { description: "The copy is available in your list as 'PAUSED'." })
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id, true)
      }
    } catch (error: any) {
      toast.error("Duplication Failed", { description: error.message })
    }
  }

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    
    // Optimistic UI Update
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setAdSets(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    try {
      const response = await integrationApi.updateMetaStatus(id, newStatus as any)
      if (response.status === 'success') {
        toast.success(newStatus === 'ACTIVE' ? "Started" : "Paused", {
          description: `Status updated to ${newStatus}`
        });
        
        // Refresh silently in background to ensure sync
        if (selectedAdAccount) {
          if (activeInnerTab === 'campaigns') loadCampaigns(selectedAdAccount.id, true);
          else if (activeInnerTab === 'ad_sets' && selectedCampaign) loadAdSets(selectedCampaign, true);
          else if (activeInnerTab === 'ads' && selectedAdSet) loadAds(selectedAdSet, true);
        }
      }
    } catch (error: any) {
      // Revert optimistic update on error
      if (selectedAdAccount) {
        if (activeInnerTab === 'campaigns') loadCampaigns(selectedAdAccount.id, true);
        else if (activeInnerTab === 'ad_sets' && selectedCampaign) loadAdSets(selectedCampaign, true);
        else if (activeInnerTab === 'ads' && selectedAdSet) loadAds(selectedAdSet, true);
      }
      
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    }
  }

  const handleArchiveObject = async (id: string) => {
    try {
      const response = await integrationApi.updateMetaStatus(id, 'ARCHIVED')
      if (response.status === 'success') {
        toast.info("Object Archived", { description: "The campaign/adset has been moved to archives." })
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    }
  }

  const handleDeleteObject = async (id: string, label: string) => {
    setDeleteConfirm({ isOpen: true, id, label });
  }

  const confirmDeleteObject = async () => {
    const { id, label } = deleteConfirm;
    try {
      setIsDeletingObject(true)
      const response = await integrationApi.deleteMetaObject(id)
      if (response.status === 'success') {
        toast.success("Deleted Successfully", { description: `${label} has been removed from Meta.` })
        
        // Instant Local Update: Filter out the deleted object from UI lists
        if (label === 'Creative') {
          setCreatives(prev => prev.filter(c => c.id !== id))
        } else if (label === 'Campaign') {
          setCampaigns(prev => prev.filter(c => c.id !== id))
          if (selectedCampaign?.id === id) setSelectedCampaign(null)
        } else if (label === 'Ad Set') {
          setAdSets(prev => prev.filter(s => s.id !== id))
          if (selectedAdSet?.id === id) setSelectedAdSet(null)
        } else if (label === 'Ad') {
          setAds(prev => prev.filter(a => a.id !== id))
        }
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsDeletingObject(false)
      setDeleteConfirm({ isOpen: false, id: '', label: '' });
    }
  }

  const handleUpdateCampaignName = async () => {
    if (!editingCampaign || !newCampaignName) return;
    try {
      setIsCreatingCampaign(true);
      const response = await integrationApi.updateMetaCampaign(editingCampaign.id, { name: newCampaignName });
      if (response.status === 'success') {
        toast.success("Campaign Updated", { description: "Campaign name changed successfully." });
        setIsEditCampaignDialogOpen(false);
        setEditingCampaign(null);
        setNewCampaignName('');
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id);
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingCampaign(false);
    }
  }

  const handleCreateForm = async () => {
    if (!selectedPage || !newFormName) return

    try {
      setIsCreatingForm(true)
      const formData = {
        name: newFormName,
        questions: [
          { key: 'full_name', type: 'FULL_NAME' },
          { key: 'email', type: 'EMAIL' },
          { key: 'phone_number', type: 'PHONE' }
        ],
        privacy_policy: { url: 'https://leadbajaar.com/privacy' },
        follow_up_url: 'https://leadbajaar.com/thank-you'
      }

      const response = await integrationApi.createMetaPageForm(selectedPage.id, formData)

      if (response.status === 'success') {
        toast.success("Form Created", { description: "New Lead Gen Form is now live on Facebook!" })
        setIsCreateFormDialogOpen(false)
        setNewFormName('')
        loadPageForms(selectedPage)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingForm(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!selectedAdAccount || !newCampaignName) return

    try {
      setIsCreatingCampaign(true)
      const data = {
        name: newCampaignName,
        objective: newCampaignObjective,
        status: 'PAUSED',
        special_ad_categories: isSpecialCategory ? ['HOUSING', 'EMPLOYMENT', 'CREDIT', 'ISSUES_ELECTIONS_POLITICS'] : []
      }

      const response = await integrationApi.createMetaCampaign(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast.success("Campaign Created", { description: "New Lead Generation campaign is ready in your ad account." })
        setIsCreateCampaignDialogOpen(false)
        setNewCampaignName('')
        loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingCampaign(false)
    }
  }

  const handleLaunchTemplate = async (templateId: number) => {
    if (!selectedAdAccount) {
      toast.error("Select Ad Account", { description: "Please select an ad account first." })
      return
    }
    try {
      setIsLaunchingTemplate(true)
      const response = await integrationApi.launchMetaTemplate(selectedAdAccount.id, templateId)
      if (response.status === 'success') {
        toast.success("Campaign Launched!", { description: "Template deployed as a paused campaign." })
        loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsLaunchingTemplate(false)
    }
  }

  const handleCreateAudience = async () => {
    if (!selectedAdAccount || !newAudienceName) return

    try {
      setIsCreatingAudience(true)
      const data = {
        name: newAudienceName,
        subtype: 'CUSTOM', // Standard for lead-based audiences
        description: `Created via LeadBajaar on ${new Date().toLocaleDateString()}`
      }

      const response = await integrationApi.createMetaCustomAudience(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast.success("Audience Created", { description: "Your custom audience is now available in Meta Ads Manager." })
        setIsCreateAudienceDialogOpen(false)
        setNewAudienceName('')
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingAudience(false)
    }
  }

  const loadAdSets = async (campaign: any, isRefreshing = false) => {
    try {
      setSelectedCampaign(campaign)
      if (!isRefreshing) {
        setIsLoadingAdSets(true)
        setAdSets([])
        setAds([])
      }
      const response = await integrationApi.getMetaAdSets(campaign.id)
      if (response.status === 'success') {
        setAdSets(response.ad_sets || [])
      }
    } catch (error: any) {
      toast.error("Failed to load Ad Sets", { description: error.message })
    } finally {
      setIsLoadingAdSets(false)
    }
  }

  const loadAds = async (adSet: any, isRefreshing = false) => {
    try {
      setSelectedAdSet(adSet)
      if (!isRefreshing) {
        setIsLoadingSpecificAds(true)
        setAds([])
      }
      const response = await integrationApi.getMetaAds(adSet.id)
      if (response.status === 'success') {
        setAds(response.ads || [])
      }
    } catch (error: any) {
      toast.error("Failed to load Ads", { description: error.message })
    } finally {
      setIsLoadingSpecificAds(false)
    }
  }

  const loadCreatives = async (accountId: string) => {
    try {
      setIsCreativesLoading(true)
      const response = await integrationApi.getMetaAdCreatives(accountId)
      if (response.status === 'success') {
        setCreatives(response.creatives || [])
      }
    } catch (error: any) {
      toast.error("Failed to load Creatives", { description: error.message })
    } finally {
      setIsCreativesLoading(false)
    }
  }

  const handleCreateCreative = async () => {
    if (!selectedAdAccount || !newCreativeName || !selectedAdPageId || !selectedAdFormId) return

    try {
      setIsCreatingCreative(true)
      const data = {
        name: newCreativeName,
        page_id: selectedAdPageId,
        form_id: selectedAdFormId,
        message: newCreativeMsg,
        headline: newCreativeHeadline,
        call_to_action: newCreativeCta,
        image_url: newCreativeImageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=628&fit=crop"
      }

      const response = await integrationApi.createMetaAdCreativeStandalone(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast.success("Creative Created", { description: "Standalone ad creative added to library." })
        setIsCreateCreativeDialogOpen(false)
        setNewCreativeName('')
        loadCreatives(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    } finally {
      setIsCreatingCreative(false)
    }
  }

  const loadPixels = async () => {
    try {
      setIsLoadingPixels(true)
      const response = await integrationApi.getMetaPixels()
      if (response.status === 'success') {
        setPixels(response.pixels || [])
      }
    } catch (error: any) {
      console.error('Failed to load pixels:', error)
      toast.error("Failed to load Pixels", { description: "Could not retrieve Meta Pixels." })
    } finally {
      setIsLoadingPixels(false)
    }
  }

  const handleSyncPixels = async () => {
    try {
      setIsSyncingPixels(true)
      const response = await integrationApi.syncMetaPixels()
      if (response.status === 'success') {
        setPixels(response.pixels || [])
        toast.success("Pixels Synced", { description: "Your Meta Pixels have been updated." })
      }
    } catch (error: any) {
      toast.error("Sync Failed", { description: error.message })
    } finally {
      setIsSyncingPixels(false)
    }
  }

  const handleTogglePixelStatus = async (pixel: any) => {
    try {
      const newStatus = !pixel.is_active
      const response = await integrationApi.updateMetaPixel(pixel.id, { is_active: newStatus })
      if (response.status === 'success') {
        setPixels(pixels.map(p => p.id === pixel.id ? { ...p, is_active: newStatus } : p))
        toast.info("Status Updated", { description: `Pixel ${pixel.name} is now ${newStatus ? 'active' : 'inactive'}.` })
      }
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    }
  }

  const handleUpdateBudget = async (adSetId: string, newBudget: number) => {
    try {
      const response = await integrationApi.updateMetaAdSet(adSetId, { daily_budget: newBudget * 100 }) // Facebook cents
      if (response.status === 'success') {
        toast.success("Budget Updated", { description: "Ad Set budget adjusted successfully." })
        if (selectedCampaign) loadAdSets(selectedCampaign)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {lastError && (
        <Alert variant="destructive" className="relative pr-12 animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">{lastError.title}</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="text-sm opacity-90">{lastError.description}</p>
            <p className="mt-2 font-semibold text-xs uppercase tracking-wider">Solution: {lastError.action}</p>
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => setLastError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Meta Business Suite
            <Badge className="bg-blue-600 text-white border-none px-2 rounded-lg font-black text-[10px] tracking-widest uppercase">Agency Pro</Badge>
          </h2>
          <p className="text-muted-foreground">Manage your agency portfolios, ad accounts and lead generation assets (v25.1-Agency).</p>
        </div>
        
        {/* Meta Business Selector (Justification for business_management) */}
        <div className="bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 min-w-[300px] animate-in fade-in zoom-in duration-500">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex-1 px-1">
              <Select 
                value={selectedBusiness?.business_id || "all"} 
                onValueChange={(val) => {
                  const business = businesses.find(b => b.business_id === val);
                  setSelectedBusiness(business || null);
                }}
              >
                <SelectTrigger className="border-none bg-transparent h-8 focus:ring-0 px-0 font-bold text-slate-900 dark:text-white shadow-none">
                  <SelectValue placeholder="Select Business Manager" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                  <SelectItem value="all" className="font-bold">Personal Account (Default)</SelectItem>
                  {businesses.map((biz) => (
                    <SelectItem key={biz.business_id} value={biz.business_id} className="font-bold">
                      {biz.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                {selectedBusiness ? "Business Manager Portfolio" : "Standard Personal Assets"}
              </p>
            </div>
          </div>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {setupChecklist && (
            <TooltipProvider>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 cursor-default">
                      <div className={`h-2 w-2 rounded-full ${setupChecklist.oauth_connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500'}`} />
                      <span className="text-slate-700 dark:text-slate-300">
                        {setupChecklist.oauth_connected ? 'Active' : 'Setup'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="rounded-xl border-slate-200 shadow-xl bg-white text-slate-900 font-bold text-[10px]">
                    {setupChecklist.oauth_connected ? 'Meta Platform Active & Connected' : 'Meta Setup Required'}
                  </TooltipContent>
                </Tooltip>

                <span className="text-slate-300 dark:text-slate-600">|</span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-600 dark:text-slate-400 cursor-default hover:text-blue-600 transition-colors">
                      {pages.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="rounded-xl border-slate-200 shadow-xl bg-white text-slate-900 font-bold text-[10px]">
                     {pages.length} Total Registered Pages
                  </TooltipContent>
                </Tooltip>

                <span className="text-slate-300 dark:text-slate-600">|</span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-600 dark:text-slate-400 cursor-default hover:text-indigo-600 transition-colors">
                      {adAccounts.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="rounded-xl border-slate-200 shadow-xl bg-white text-slate-900 font-bold text-[10px]">
                    {adAccounts.length} Connected Ad Accounts
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
          <Button
            onClick={handleManualSyncAssets}
            disabled={isSyncingAssets || isLoading}
            variant="outline"
            size="sm"
            className="h-8 shadow-sm border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
          >
            {isSyncingAssets || isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
            )}
            {isSyncingAssets ? 'Syncing...' : 'Sync from Meta'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pages" className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-48 lg:w-52 shrink-0">
          <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-2 pb-4">
            <TabsTrigger value="pages" className="w-full relative flex items-center justify-start space-x-3 px-4 py-3.5 rounded-xl border border-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-300 font-bold text-sm data-[state=active]:shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] data-[state=active]:ring-1 data-[state=active]:ring-slate-200 dark:data-[state=active]:ring-slate-800 group overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r-md scale-y-0 opacity-0 group-data-[state=active]:scale-y-100 group-data-[state=active]:opacity-100 transition-all duration-300 origin-center" />
              <div className="flex items-center justify-center p-1.5 rounded-lg group-data-[state=active]:bg-blue-100 dark:group-data-[state=active]:bg-blue-900/30 transition-colors">
                <Globe className="h-4 w-4" />
              </div>
              <span>Pages & Leads</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="w-full relative flex items-center justify-start space-x-3 px-4 py-3.5 rounded-xl border border-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-300 font-bold text-sm data-[state=active]:shadow-[0_2px_10px_-3px_rgba(99,102,241,0.1)] data-[state=active]:ring-1 data-[state=active]:ring-slate-200 dark:data-[state=active]:ring-slate-800 group overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600 rounded-r-md scale-y-0 opacity-0 group-data-[state=active]:scale-y-100 group-data-[state=active]:opacity-100 transition-all duration-300 origin-center" />
              <div className="flex items-center justify-center p-1.5 rounded-lg group-data-[state=active]:bg-indigo-100 dark:group-data-[state=active]:bg-indigo-900/30 transition-colors">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span>Ads Manager</span>
            </TabsTrigger>
            <TabsTrigger value="creatives" className="w-full relative flex items-center justify-start space-x-3 px-4 py-3.5 rounded-xl border border-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-300 font-bold text-sm data-[state=active]:shadow-[0_2px_10px_-3px_rgba(168,85,247,0.1)] data-[state=active]:ring-1 data-[state=active]:ring-slate-200 dark:data-[state=active]:ring-slate-800 group overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-r-md scale-y-0 opacity-0 group-data-[state=active]:scale-y-100 group-data-[state=active]:opacity-100 transition-all duration-300 origin-center" />
              <div className="flex items-center justify-center p-1.5 rounded-lg group-data-[state=active]:bg-purple-100 dark:group-data-[state=active]:bg-purple-900/30 transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <span>Ad Creatives</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="w-full relative flex items-center justify-start space-x-3 px-4 py-3.5 rounded-xl border border-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-300 font-bold text-sm data-[state=active]:shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] data-[state=active]:ring-1 data-[state=active]:ring-slate-200 dark:data-[state=active]:ring-slate-800 group overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-600 rounded-r-md scale-y-0 opacity-0 group-data-[state=active]:scale-y-100 group-data-[state=active]:opacity-100 transition-all duration-300 origin-center" />
              <div className="flex items-center justify-center p-1.5 rounded-lg group-data-[state=active]:bg-emerald-100 dark:group-data-[state=active]:bg-emerald-900/30 transition-colors">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span>Ad Templates</span>
            </TabsTrigger>
            <TabsTrigger value="pixels" className="w-full relative flex items-center justify-start space-x-3 px-4 py-3.5 rounded-xl border border-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-300 font-bold text-sm data-[state=active]:shadow-[0_2px_10px_-3px_rgba(245,158,11,0.1)] data-[state=active]:ring-1 data-[state=active]:ring-slate-200 dark:data-[state=active]:ring-slate-800 group overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-600 rounded-r-md scale-y-0 opacity-0 group-data-[state=active]:scale-y-100 group-data-[state=active]:opacity-100 transition-all duration-300 origin-center" />
              <div className="flex items-center justify-center p-1.5 rounded-lg group-data-[state=active]:bg-amber-100 dark:group-data-[state=active]:bg-amber-900/30 transition-colors">
                <Zap className="h-4 w-4" />
              </div>
              <span>Pixels / CAPI</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="w-full relative flex items-center justify-start space-x-3 px-4 py-3.5 rounded-xl border border-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-300 font-bold text-sm data-[state=active]:shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)] data-[state=active]:ring-1 data-[state=active]:ring-slate-200 dark:data-[state=active]:ring-slate-800 group overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-rose-600 rounded-r-md scale-y-0 opacity-0 group-data-[state=active]:scale-y-100 group-data-[state=active]:opacity-100 transition-all duration-300 origin-center" />
              <div className="flex items-center justify-center p-1.5 rounded-lg group-data-[state=active]:bg-rose-100 dark:group-data-[state=active]:bg-rose-900/30 transition-colors">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span>ROI Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-w-0 w-full">
        <TabsContent value="pages" className="m-0 space-y-6">


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pages Column */}
            <Card className="lg:col-span-1 border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span>Managed Pages</span>
                </CardTitle>
                <CardDescription>
                  {pages.filter(p => !!p.access_token).length}/{pages.length} Pages Accessible
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => loadPageForms(page)}
                      className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left ${selectedPage?.id === page.id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                          {page.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold line-clamp-1 flex items-center gap-1.5">
                            {page.name}
                          </p>
                          <p className="text-[10px] uppercase opacity-70 tracking-tighter flex items-center gap-1">
                            {page.access_token ? (
                              <span className="text-green-600 font-bold flex items-center"><CheckCircle2 className="h-2 w-2 mr-0.5" /> Connected</span>
                            ) : (
                              <span className="text-amber-600 font-bold flex items-center"><AlertCircle className="h-2 w-2 mr-0.5" /> Not Selected</span>
                            )}
                            <span className="text-slate-400">| ID: {page.id}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-400 shrink-0 ${selectedPage?.id === page.id ? 'text-blue-500' : ''}`} />
                    </button>
                  ))}
                  <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-medium italic leading-tight">
                      Only pages selected during Meta connection can be managed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forms Column */}
            <Card className="lg:col-span-2 border-none shadow-md bg-white dark:bg-slate-900">
              {selectedPage ? (
                <>
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                          <Facebook className="h-5 w-5" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                             <CardTitle>{selectedPage.name}</CardTitle>
                             {selectedPage.access_token && (
                               <Badge variant="outline" className="h-5 text-[9px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                                 Connected via Meta
                               </Badge>
                             )}
                           </div>
                           <CardDescription>Managed Lead Forms</CardDescription>
                         </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog open={isCreateFormDialogOpen} onOpenChange={setIsCreateFormDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="h-4 w-4 mr-1" />
                              Create Form
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Lead Generation Form</DialogTitle>
                              <DialogDescription>
                                This will create a new Lead Gen Form on your Facebook Page "{selectedPage.name}".
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="form-name">Form Name</Label>
                                <Input
                                  id="form-name"
                                  value={newFormName}
                                  onChange={(e) => setNewFormName(e.target.value)}
                                  placeholder="e.g. Website Lead Form"
                                />
                              </div>
                              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                                <p className="font-semibold mb-1">Standard fields included:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  <li>Full Name</li>
                                  <li>Email Address</li>
                                  <li>Phone Number</li>
                                </ul>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsCreateFormDialogOpen(false)}>Cancel</Button>
                              <Button
                                onClick={handleCreateForm}
                                disabled={isCreatingForm || !newFormName}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {isCreatingForm ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Launch Form
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <WebhookVerificationDialog 
                          pageId={selectedPage.id} 
                          pageName={selectedPage.name} 
                        />
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-slate-200">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                    <CardContent className="pt-6">
                    {isLoadingForms ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <p className="text-sm text-muted-foreground">Loading forms...</p>
                      </div>
                    ) : formsError ? (
                      <div className="flex flex-col items-center justify-center py-10 px-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-center space-y-4">
                        <div className="h-14 w-14 bg-white dark:bg-red-900/20 rounded-full shadow-sm flex items-center justify-center text-red-500">
                          <ShieldAlert className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-red-800 dark:text-red-400">Permission Required</p>
                          <p className="text-sm text-red-600/80 dark:text-red-400/60 max-w-sm mx-auto">
                            {formsError}
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="font-bold shadow-md rounded-xl"
                          onClick={handleMetaConnect}
                          disabled={isConnectingMeta}
                        >
                          {isConnectingMeta ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Facebook className="h-3 w-3 mr-2" />}
                          Reconnect & Select Pages
                        </Button>
                      </div>
                    ) : forms.length > 0 ? (
                      <div className="grid gap-4">
                        {forms.map((form) => (
                          <div key={form.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center text-blue-500">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold">{form.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">ID: {form.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={form.status === 'ACTIVE' ? 'default' : 'secondary'} className={form.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                                {form.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 text-xs font-semibold px-3"
                                onClick={() => handleSyncHistory(form)}
                                disabled={isSyncingHistory === form.id}
                              >
                                {isSyncingHistory === form.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 mr-2" />
                                )}
                                {isSyncingHistory === form.id ? 'Syncing...' : 'Sync History'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">No forms found for this page.</div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                  <Facebook className="h-12 w-12 opacity-20 mb-4" />
                  <p>Select a Facebook page to manage lead forms</p>
                </div>
              )}
            </Card>
          </div>

          {/* Data Privacy & Compliance Section (Strongly recommended for Meta verification) */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold">Data Privacy & Compliance</h3>
            </div>
            <Card className="border-none shadow-sm bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
              <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-indigo-50/50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 h-9 px-4 font-bold rounded-xl"
                onClick={handleRefreshStatus}
              >
                <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isSyncingAssets && "animate-spin")} />
                Refresh Status
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-100 h-9 px-4 font-bold rounded-xl"
                onClick={handleCheckDeletionStatus}
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                Check Deletion Status
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 h-9 px-4 font-bold rounded-xl"
                onClick={handleManualDataDeletionRequest}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Request Data Deletion
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 px-4 font-bold rounded-xl"
                onClick={handleDisconnectMeta}
              >
                <X className="h-3.5 w-3.5 mr-2" />
                Disconnect Account
              </Button>
            </div>
            
            <div className="space-y-1.5 opacity-80 border-t border-blue-100/50 dark:border-blue-900/20 pt-4">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Info className="h-3 w-3" /> Meta Data Rights & Compliance
              </p>
              <p className="text-[11px] text-blue-800/70 dark:text-blue-200/60 leading-relaxed max-w-4xl">
                Once a deletion request is processed, all your Meta-related data (Leads, Forms, and Tokens) will be permanently purged from our infrastructure after manual verification. 
                Purge target completion is typically 30 days in accordance with the Meta Platform Terms.
              </p>
            </div>
          </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="ads" className="m-0 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              {/* Header / Account Selector Row - Global for this tab */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black tracking-tight flex items-center gap-3">
                      <span className="truncate">{selectedAdAccount ? selectedAdAccount.name : "Portfolio Overview"}</span>
                      {selectedAdAccount && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] h-5 px-2 border-0 shrink-0">ACTIVE</Badge>}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60 truncate">
                      {selectedAdAccount ? (selectedAdAccount.business?.name || 'Personal Account') : 'Meta Ads Network'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" className="!bg-[#00a400] hover:!bg-[#008a00] text-white font-black shadow-md border-none gap-2">
                        <Plus className="h-4 w-4" /> Create
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                      <DropdownMenuItem className="py-2.5 font-bold cursor-pointer" onClick={() => selectedAdAccount ? setIsCreateCampaignDialogOpen(true) : toast.info("Select Account", { description: "Please select an ad account first." })}>
                        <Layout className="h-4 w-4 mr-2 text-blue-500" /> New Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="py-2.5 font-bold cursor-pointer" 
                        onClick={() => {
                          if (!selectedAdAccount) {
                            toast.info("Select Account", { description: "Please select an ad account first." });
                            return;
                          }
                          if (selectedCampaign) {
                            setIsCreateAdSetDialogOpen(true);
                          } else {
                            setActiveInnerTab('campaigns');
                            toast.info("Select Campaign", { description: "Select a campaign first to add an ad set." });
                          }
                        }}
                      >
                        <Layers className="h-4 w-4 mr-2 text-purple-500" /> New Ad Set
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="py-2.5 font-bold cursor-pointer" 
                        onClick={() => {
                          if (!selectedAdAccount) {
                            toast.info("Select Account", { description: "Please select an ad account first." });
                            return;
                          }
                          if (selectedAdSet) {
                            setIsCreateAdDialogOpen(true);
                          } else {
                            setActiveInnerTab('ad_sets');
                            toast.info("Select Ad Set", { description: "Select an ad set first to add an ad." });
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2 text-green-500" /> New Ad
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="py-2.5 font-bold cursor-pointer border-t border-slate-100 mt-1 dark:border-slate-800" 
                        onClick={() => {
                          if (!selectedAdAccount) {
                            toast.info("Select Account", { description: "Please select an ad account first." });
                            return;
                          }
                          setIsCreateAudienceDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2 text-blue-600" /> New Audience
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Popover open={isAdAccountOpen} onOpenChange={setIsAdAccountOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isAdAccountOpen}
                        className="w-full md:w-[320px] justify-between h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold rounded-xl shadow-sm hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 transition-all group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Search className="h-4 w-4 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                          <span className="truncate">{selectedAdAccount ? selectedAdAccount.name : "Select Ad Account..."}</span>
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[450px] p-0 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden"
                      align="end"
                      side="bottom"
                      sideOffset={8}
                      avoidCollisions={false}
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search ad accounts..."
                            value={adAccountSearch}
                            onChange={(e) => setAdAccountSearch(e.target.value)}
                            className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none text-sm rounded-lg"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-2 space-y-1">
                          {adAccounts
                            .filter(acc =>
                              acc.name?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                              acc.id?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                              acc.business?.name?.toLowerCase().includes(adAccountSearch.toLowerCase())
                            )
                            .map((acc) => {
                              const accStatus = AD_ACCOUNT_STATUS_MAP[acc.account_status] || { text: 'Unknown', color: 'bg-slate-100 text-slate-700' };
                              return (
                                <button
                                  key={acc.id}
                                  onClick={() => {
                                    setSelectedAdAccount(acc);
                                    loadCampaigns(acc.id);
                                    setIsAdAccountOpen(false);
                                  }}
                                  className={`w-full flex items-start gap-3 p-3 text-left rounded-xl transition-all bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800/80 group ${selectedAdAccount?.id === acc.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''} ${acc.account_status !== 1 ? 'opacity-60' : ''}`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                    <Briefcase className={`h-4 w-4 ${selectedAdAccount?.id === acc.id ? 'text-blue-500' : 'text-slate-400'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="font-bold text-sm truncate uppercase tracking-tight">{acc.name}</span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge className={`text-[9px] px-1.5 h-4 leading-none border-0 ${accStatus.color}`}>{accStatus.text}</Badge>
                                        {selectedAdAccount?.id === acc.id && <Check className="h-3.5 w-3.5 text-blue-500" />}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70">
                                      <span>{acc.business?.name || 'Personal'}</span>
                                      <span>•</span>
                                      <span className="font-mono">{acc.id}</span>
                                      <span>•</span>
                                      <span className="font-mono">{acc.currency}</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          }
                          {adAccounts.length === 0 && <div className="p-8 text-center text-sm text-slate-500 italic">No ad accounts found</div>}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {selectedAdAccount ? (
                  <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Insights Summary Cards */}
                    <div className="p-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <div className="min-w-[140px] flex-1 bg-blue-600 p-2.5 rounded-xl text-white shadow-sm transition-all hover:bg-blue-700">
                        <p className="text-[9px] opacity-80 uppercase font-black tracking-widest leading-none mb-1">Spend (30d)</p>
                        <h3 className="text-sm font-black truncate">
                          {selectedAdAccount.currency} {insights.reduce((sum, i) => sum + parseFloat(i.spend || '0'), 0).toFixed(2)}
                        </h3>
                      </div>
                      <div className="min-w-[140px] flex-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Impressions</p>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {insights.reduce((sum, i) => sum + parseInt(i.impressions || '0'), 0).toLocaleString()}
                        </h3>
                      </div>
                      <div className="min-w-[140px] flex-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Link Clicks</p>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {insights.reduce((sum, i) => sum + parseInt(i.inline_link_clicks || '0'), 0).toLocaleString()}
                        </h3>
                      </div>
                      <div className="min-w-[140px] flex-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Avg. CTR</p>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {(insights.reduce((sum, i) => sum + parseFloat(i.ctr || '0'), 0) / Math.max(insights.length, 1)).toFixed(2)}%
                        </h3>
                      </div>
                      <div className="min-w-[140px] flex-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Avg. CPC</p>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {selectedAdAccount.currency} {(insights.reduce((sum, i) => sum + parseFloat(i.cpc || '0'), 0) / Math.max(insights.length, 1)).toFixed(2)}
                        </h3>
                      </div>
                    </div>

                    {/* Top Breadcrumb Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {activeInnerTab.replace('_', ' ')}
                      </span>
                      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                         <div className="h-5 w-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 font-bold text-[10px]">
                           {selectedAdAccount.name.charAt(0)}
                         </div>
                         <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                           {selectedAdAccount.name} ({selectedAdAccount.id})
                         </span>
                         <ChevronDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <span>Updated just now</span>
                        <button onClick={() => loadCampaigns(selectedAdAccount.id)} className="p-1 bg-white border border-slate-200 shadow-sm hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors" title="Reload Basic Data">
                          <RefreshCw className={`h-3 w-3 ${isLoadingAds ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                          onClick={handleDeepSyncAccount} 
                          disabled={isDeepSyncing}
                          className={`p-1 bg-white border border-slate-200 shadow-sm hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-all ${isDeepSyncing ? 'animate-spin border-blue-500 text-blue-500' : ''}`}
                          title="Deep Sync (Reports & Metrics)"
                        >
                          <Zap className={`h-3 w-3 ${isDeepSyncing ? 'text-blue-500' : ''}`} />
                        </button>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-bold bg-[#e4e6eb] dark:bg-slate-800 border-none hover:bg-slate-200 dark:hover:bg-slate-700">
                        Review and publish
                      </Button>
                    </div>
                  </div>

                  {/* Meta Resource Bar */}                   <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setResourceFilter('all')}
                        className={`h-8 px-3 text-xs font-bold transition-all ${resourceFilter === 'all' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <div className="flex items-center gap-2">
                          <List className="h-3.5 w-3.5" /> All ads
                        </div>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Zap className="h-3.5 w-3.5 mr-2" /> Actions <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl">
                           <DropdownMenuItem className="py-2.5 font-bold cursor-pointer" onClick={() => loadCampaigns(selectedAdAccount.id, true)}>
                             <RefreshCw className="h-4 w-4 mr-2 text-blue-500" /> Refresh Current View
                           </DropdownMenuItem>
                           <DropdownMenuItem className="py-2.5 font-bold cursor-pointer" onClick={handleDeepSyncAccount}>
                             <Zap className="h-4 w-4 mr-2 text-amber-500" /> Account Deep Sync
                           </DropdownMenuItem>
                           <DropdownMenuItem className="py-2.5 font-bold cursor-pointer text-red-500 border-t border-slate-50 mt-1" onClick={() => toast.info("Lead Flow Active", { description: "Currently monitoring real-time form submissions." })}>
                             <Trash2 className="h-4 w-4 mr-2" /> Bulk Delete
                           </DropdownMenuItem>
                           <DropdownMenuItem className="py-2.5 font-bold cursor-pointer opacity-50">
                             <Archive className="h-4 w-4 mr-2" /> Bulk Archive
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setResourceFilter('active')}
                        className={`h-8 px-3 text-xs font-bold transition-all ${resourceFilter === 'active' ? 'text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <TrendingUp className="h-3.5 w-3.5 mr-2" /> Active ads
                      </Button>

                      <div className="flex-1 min-w-[200px] relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <input
                         type="text"
                         placeholder="Search to filter by: name, ID or metrics"
                         className="w-full pl-9 pr-4 py-1.5 bg-transparent border-none text-xs focus:ring-0 placeholder:text-slate-400 font-medium"
                     />
                     </div>
                  </div>

                  {/* Inner Tabs */}
                  <div className="flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-1">
                     <button
                       onClick={() => setActiveInnerTab('campaigns')}
                       className={`px-6 py-3.5 text-sm font-bold transition-all relative ${activeInnerTab === 'campaigns' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                     >
                       <div className="flex items-center gap-2">
                         <Layout className="h-4 w-4" /> Campaigns
                       </div>
                     </button>
                     <button
                       onClick={() => setActiveInnerTab('ad_sets')}
                       className={`px-6 py-3.5 text-sm font-bold transition-all relative ${activeInnerTab === 'ad_sets' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                     >
                       <div className="flex items-center gap-2">
                         <Layers className="h-4 w-4" /> Ad sets
                       </div>
                     </button>
                     <button
                       onClick={() => setActiveInnerTab('ads')}
                       className={`px-6 py-3.5 text-sm font-bold transition-all relative ${activeInnerTab === 'ads' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                     >
                       <div className="flex items-center gap-2">
                         <FileText className="h-4 w-4" /> Ads
                       </div>
                     </button>
                  </div>

                  {/* Toolbar */}
                  <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="default" size="sm" className="h-8 !bg-[#00a400] hover:!bg-[#008a00] text-white font-bold text-xs px-4 rounded-md border-none">
                              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl">
                            <DropdownMenuItem className="py-2 font-bold cursor-pointer" onClick={() => setIsCreateCampaignDialogOpen(true)}>
                              <Layout className="h-4 w-4 mr-2 text-blue-500" /> Create Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem className="py-2 font-bold cursor-pointer" onClick={() => selectedCampaign ? setIsCreateAdSetDialogOpen(true) : toast.info("Select Campaign", { description: "Please select a campaign first." })}>
                              <Layers className="h-4 w-4 mr-2 text-purple-500" /> Create Ad Set
                            </DropdownMenuItem>
                            <DropdownMenuItem className="py-2 font-bold cursor-pointer" onClick={() => selectedAdSet ? setIsCreateAdDialogOpen(true) : toast.info("Select Ad Set", { description: "Please select an ad set first." })}>
                              <FileText className="h-4 w-4 mr-2 text-green-500" /> Create Ad
                            </DropdownMenuItem>
                            <DropdownMenuItem className="py-2 font-bold cursor-pointer border-t border-slate-100 mt-1 dark:border-slate-800" onClick={() => setIsCreateAudienceDialogOpen(true)}>
                              <Users className="h-4 w-4 mr-2 text-blue-600" /> New Audience
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>


                       <Button variant="outline" size="sm" onClick={() => toast.info("Select items", { description: "Please select one or more items to duplicate." })} className="h-8 text-xs font-bold gap-1.5 px-3">
                         <Copy className="h-3.5 w-3.5" /> Duplicate
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => toast.info("Select item", { description: "Please select a specific item to edit." })} className="h-8 text-xs font-bold gap-1.5 px-3">
                         <Pencil className="h-3.5 w-3.5" /> Edit
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => toast.info("A/B Testing", { description: "Select two items to start an A/B test comparison." })} className="h-8 text-xs font-bold gap-1.5 px-3">
                         <Share2 className="h-3.5 w-3.5" /> A/B test
                       </Button>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">
                             More <ChevronDown className="h-3 w-3 ml-1" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="start">
                           <DropdownMenuItem onClick={() => toast.info("ROAS Estimate", { description: "Expected range: 2.1x - 3.5x" })}>Export</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => toast.info("Import", { description: "Bulk import restricted." })}>Import</DropdownMenuItem>
                           <DropdownMenuItem className="text-red-500" onClick={() => toast.info("Delete", { description: "Select items for bulk deletion." })}>Delete</DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                         <Calendar className="h-3 w-3" /> Last 30 days
                       </div>
                       <Button variant="outline" size="sm" className="h-8 font-bold text-xs gap-1.5 px-3">
                          <Filter className="h-3.5 w-3.5" /> Columns
                       </Button>
                     </div>
                  </div>
                  {/* Dynamic Inner Content */}
                  <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
                     {/* Campaigns View */}
                     {activeInnerTab === 'campaigns' && (
                       <Table>
                         <TableHeader className="bg-slate-50 dark:bg-green-900/20 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                           <TableRow className="hover:bg-transparent">
                             <TableHead className="w-10 px-4"><Checkbox /></TableHead>
                             <TableHead className="w-12 text-center text-[11px] font-black uppercase text-slate-600 py-4">Off/On</TableHead>
                             <TableHead className="min-w-[200px] text-[11px] font-black uppercase text-slate-600">Campaign Name</TableHead>
                             <TableHead className="text-[11px] font-black uppercase text-slate-600">Delivery</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Results</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Budget</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Amount Spent</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">CTR</TableHead>
                             <TableHead className="text-center text-[11px] font-black uppercase text-slate-600">Actions</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {isLoadingAds ? (
                             <TableRow>
                               <TableCell colSpan={9} className="h-64 text-center">
                                 <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 opacity-20 mb-2" />
                                 <span className="text-xs font-medium text-slate-400">Loading campaigns...</span>
                               </TableCell>
                             </TableRow>
                           ) : campaigns.length > 0 ? (
                             campaigns
                               .filter(camp => resourceFilter === 'all' || camp.status === 'ACTIVE')
                               .map((camp) => {
                               const campInsight = insights.find(i => i.campaign_name === camp.name);
                               return (
                                 <TableRow key={camp.id} className="group hover:bg-blue-100/30 dark:hover:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800 h-16">
                                   <TableCell className="px-4"><Checkbox /></TableCell>
                                   <TableCell className="text-center">
                                     <Switch 
                                       checked={camp.status === 'ACTIVE'} 
                                       className="scale-90 data-[state=checked]:!bg-[#00a400] data-[state=unchecked]:bg-slate-100 dark:data-[state=unchecked]:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-sm"
                                       onCheckedChange={() => handleUpdateStatus(camp.id, camp.status)}
                                     />
                                   </TableCell>
                                   <TableCell>
                                     <div 
                                       className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer truncate max-w-[250px] transition-colors"
                                       onClick={() => {
                                         loadAdSets(camp);
                                         setActiveInnerTab('ad_sets');
                                       }}
                                     >
                                       {camp.name}
                                     </div>
                                     <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400 font-bold tracking-tight uppercase">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[8px]">{camp.objective?.replace('OUTCOME_', '')}</span>
                                        <span>•</span>
                                        <span className="font-mono">ID: {camp.id}</span>
                                     </div>
                                   </TableCell>
                                   <TableCell>
                                     <div className="flex items-center gap-2">
                                       <div className={`h-2.5 w-2.5 rounded-full ${camp.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-slate-400'}`} />
                                       <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">{camp.status.toLowerCase()}</span>
                                     </div>
                                   </TableCell>
                                   <TableCell className="text-right">
                                     <div className="text-xs font-black">{campInsight?.results || '-'}</div>
                                     <div className="text-[10px] text-slate-400">Leads</div>
                                   </TableCell>
                                   <TableCell className="text-right">
                                     <div className="text-xs font-black">{selectedAdAccount.currency} {camp.daily_budget ? (camp.daily_budget / 100).toFixed(2) : '-'}</div>
                                     <div className="text-[10px] text-slate-400">Daily Average</div>
                                   </TableCell>
                                   <TableCell className="text-right">
                                     <div className="text-xs font-black">{selectedAdAccount.currency} {parseFloat(campInsight?.spend || '0').toFixed(2)}</div>
                                   </TableCell>
                                   <TableCell className="text-right">
                                     <div className="text-xs font-black">{campInsight?.ctr || '0.00'}%</div>
                                   </TableCell>
                                   <TableCell className="text-center">
                                     <div className="flex items-center justify-center gap-1 transition-opacity">
                                       <button 
                                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full text-blue-600 transition-colors" 
                                          onClick={() => {
                                            setSelectedCampaign(camp);
                                            setIsCreateAdSetDialogOpen(true);
                                          }} 
                                          title="Add Ad Set"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                        </button>
                                        <button 
                                           className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full" 
                                           title="Edit"
                                           onClick={() => {
                                             setEditingCampaign(camp);
                                             setNewCampaignName(camp.name);
                                             setIsEditCampaignDialogOpen(true);
                                           }}
                                         >
                                           <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                                         </button>
                                       <button className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full text-red-500" onClick={() => handleDuplicateObject(camp.id, 'Campaign')} title="Duplicate"><Copy className="h-3.5 w-3.5" /></button><button className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full text-red-500" onClick={() => handleDeleteObject(camp.id, 'Campaign')} title="Delete">
                                         <Trash2 className="h-3.5 w-3.5" />
                                       </button>
                                     </div>
                                   </TableCell>
                                 </TableRow>
                               );
                             })
                           ) : (
                             <TableRow>
                               <TableCell colSpan={9} className="h-64 text-center">
                                 <div className="flex flex-col items-center justify-center space-y-4">
                                   <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                     <Layout className="h-8 w-8 text-slate-300" />
                                   </div>
                                   <div>
                                     <p className="text-slate-500 font-bold mb-1">No campaigns found in this account</p>
                                     <p className="text-slate-400 text-xs">Start your lead generation journey by creating a campaign.</p>
                                   </div>
                                   <Button 
                                     onClick={() => setIsCreateCampaignDialogOpen(true)}
                                     className="!bg-[#00a400] hover:!bg-[#008a00] text-white font-black shadow-md border-none gap-2"
                                   >
                                     <Plus className="h-4 w-4 mr-2" />
                                     Create Campaign
                                   </Button>
                                 </div>
                               </TableCell>
                             </TableRow>
                           )}
                         </TableBody>
                       </Table>
                     )}

                     {/* Ad Sets View */}
                     {activeInnerTab === 'ad_sets' && (
                       <Table>
                         <TableHeader className="bg-slate-50 dark:bg-green-900/20 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                           <TableRow className="hover:bg-transparent">
                             <TableHead className="w-10 px-4"><Checkbox /></TableHead>
                             <TableHead className="w-12 text-center text-[11px] font-black uppercase text-slate-600 py-4">Off/On</TableHead>
                             <TableHead className="min-w-[200px] text-[11px] font-black uppercase text-slate-600">Ad Set Name</TableHead>
                             <TableHead className="text-[11px] font-black uppercase text-slate-600">Delivery</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Results</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Budget</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Amount Spent</TableHead>
                             <TableHead className="text-center text-[11px] font-black uppercase text-slate-600">Actions</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {isLoadingAdSets ? (
                             <TableRow>
                               <TableCell colSpan={8} className="h-64 text-center">
                                 <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 opacity-20 mb-2" />
                                 <span className="text-xs font-medium text-slate-400">Loading ad sets...</span>
                               </TableCell>
                             </TableRow>
                           ) : adSets.length > 0 ? (
                             adSets
                             .filter(set => resourceFilter === 'all' || set.status === 'ACTIVE')
                             .map((set) => (
                               <TableRow key={set.id} className="group hover:bg-blue-100/30 dark:hover:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800 h-16">
                                 <TableCell className="px-4"><Checkbox /></TableCell>
                                 <TableCell className="text-center">
                                   <Switch 
                                      checked={set.status === 'ACTIVE'} 
                                      className="scale-90 data-[state=checked]:!bg-[#00a400] data-[state=unchecked]:bg-slate-100 dark:data-[state=unchecked]:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                                      onCheckedChange={() => handleUpdateStatus(set.id, set.status)}
                                    />
                                 </TableCell>
                                 <TableCell>
                                   <div 
                                     className="font-bold text-blue-600 hover:underline cursor-pointer truncate max-w-[250px]"
                                     onClick={() => {
                                       loadAds(set);
                                       setActiveInnerTab('ads');
                                     }}
                                   >
                                     {set.name}
                                   </div>
                                   <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-widest font-mono">ID: {set.id}</div>
                                 </TableCell>
                                 <TableCell>
                                   <div className="flex items-center gap-2">
                                     <div className={`h-2.5 w-2.5 rounded-full ${set.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                     <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">{set.status.toLowerCase()}</span>
                                   </div>
                                 </TableCell>
                                 <TableCell className="text-right">
                                   <div className="text-xs font-black">-</div>
                                   <div className="text-[10px] text-slate-400">Leads</div>
                                 </TableCell>
                                 <TableCell className="text-right">
                                   <div className="text-xs font-black">{selectedAdAccount.currency} {set.daily_budget ? (set.daily_budget / 100).toFixed(2) : '-'}</div>
                                   <div className="text-[10px] text-slate-400">Daily Average</div>
                                 </TableCell>
                                 <TableCell className="text-right font-black text-xs">
                                   {selectedAdAccount.currency} 0.00
                                 </TableCell>
                                  <TableCell className="text-center">
                                   <div className="flex items-center justify-center gap-1 transition-opacity">
                                     <button 
                                       className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/40 rounded-full text-green-600 transition-colors" 
                                       onClick={() => {
                                         setSelectedAdSet(set);
                                         setIsCreateAdDialogOpen(true);
                                       }} 
                                       title="Add Ad"
                                     >
                                       <Plus className="h-3.5 w-3.5" />
                                     </button>
                                     <button className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full text-slate-500" onClick={() => toast.info("Edit Ad Set", { description: "Audience editing coming soon." })} title="Edit">
                                       <Edit3 className="h-3.5 w-3.5" />
                                     </button>
                                     <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-full text-blue-500 transition-colors" onClick={() => handleDuplicateObject(set.id, 'Ad Set')} title="Duplicate">
                                       <Copy className="h-3.5 w-3.5" />
                                     </button>
                                     <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-full text-red-500 transition-colors" onClick={() => handleDeleteObject(set.id, 'Ad Set')} title="Delete">
                                       <Trash2 className="h-3.5 w-3.5" />
                                     </button>
                                   </div>
                                 </TableCell>
                               </TableRow>
                             ))
                           ) : (
                             <TableRow>
                               <TableCell colSpan={8} className="h-64 text-center">
                                 <div className="flex flex-col items-center justify-center space-y-4">
                                   <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                     <Layers className="h-8 w-8 text-slate-300" />
                                   </div>
                                   <div>
                                     <p className="text-slate-500 font-bold mb-1">
                                       {selectedCampaign ? `No ad sets found for campaign: ${selectedCampaign.name}` : 'Select a campaign to view ad sets'}
                                     </p>
                                     <p className="text-slate-400 text-xs">Define your audience and budget by creating an ad set.</p>
                                   </div>
                                   {selectedCampaign && (
                                     <Button 
                                       onClick={() => setIsCreateAdSetDialogOpen(true)}
                                       className="!bg-[#00a400] hover:!bg-[#008a00] text-white font-black shadow-md border-none gap-2"
                                     >
                                       <Plus className="h-4 w-4 mr-2" />
                                       Create Ad Set
                                     </Button>
                                   )}
                                 </div>
                               </TableCell>
                             </TableRow>
                           )}
                         </TableBody>
                       </Table>
                     )}

                     {/* Ads View */}
                     {activeInnerTab === 'ads' && (
                       <Table>
                         <TableHeader className="bg-slate-50 dark:bg-green-900/20 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                           <TableRow className="hover:bg-transparent">
                             <TableHead className="w-10 px-4"><Checkbox /></TableHead>
                             <TableHead className="w-12 text-center text-[11px] font-black uppercase text-slate-600 py-4">Off/On</TableHead>
                             <TableHead className="min-w-[200px] text-[11px] font-black uppercase text-slate-600">Ad Name</TableHead>
                             <TableHead className="text-[11px] font-black uppercase text-slate-600">Delivery</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Results</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Reach</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Frequency</TableHead>
                             <TableHead className="text-right text-[11px] font-black uppercase text-slate-600">Amount Spent</TableHead>
                              <TableHead className="text-center text-[11px] font-black uppercase text-slate-600">Actions</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {isLoadingSpecificAds ? (
                             <TableRow>
                               <TableCell colSpan={8} className="h-64 text-center">
                                 <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 opacity-20 mb-2" />
                                 <span className="text-xs font-medium text-slate-400">Loading ads...</span>
                               </TableCell>
                             </TableRow>
                           ) : ads.length > 0 ? (
                             ads
                             .filter(ad => resourceFilter === 'all' || ad.status === 'ACTIVE')
                             .map((ad) => (
                               <TableRow key={ad.id} className="group hover:bg-blue-100/30 dark:hover:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800 h-16">
                                 <TableCell className="px-4"><Checkbox /></TableCell>
                                 <TableCell className="text-center">
                                   <Switch 
                                      checked={ad.status === 'ACTIVE'} 
                                      className="scale-90 data-[state=checked]:!bg-[#00a400] data-[state=unchecked]:bg-slate-100 dark:data-[state=unchecked]:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-sm" 
                                      onCheckedChange={() => handleUpdateStatus(ad.id, ad.status)}
                                    />
                                 </TableCell>
                                 <TableCell>
                                   <div className="font-bold text-slate-900 dark:text-white truncate max-w-[250px]">{ad.name}</div>
                                   <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-widest font-mono">ID: {ad.id}</div>
                                 </TableCell>
                                 <TableCell>
                                   <div className="flex items-center gap-2">
                                     <div className={`h-2.5 w-2.5 rounded-full ${ad.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-slate-400'}`} />
                                     <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">{ad.status.toLowerCase()}</span>
                                   </div>
                                 </TableCell>
                                 <TableCell className="text-right font-black text-xs">-</TableCell>
                                 <TableCell className="text-right text-xs">0</TableCell>
                                 <TableCell className="text-right text-xs">0.00</TableCell>
                                 <TableCell className="text-right font-black text-xs">{selectedAdAccount.currency} 0.00</TableCell>
                                 <TableCell className="text-center">
                                   <div className="flex items-center justify-center gap-1 transition-opacity">
                                     <button className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full text-slate-500" onClick={() => toast.info("Edit Ad", { description: "Ad creative editing coming soon." })} title="Edit">
                                       <Edit3 className="h-3.5 w-3.5" />
                                     </button>
                                     <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-full text-blue-500 transition-colors" onClick={() => handleDuplicateObject(ad.id, 'Ad')} title="Duplicate">
                                       <Copy className="h-3.5 w-3.5" />
                                     </button>
                                     <button className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full text-slate-500" onClick={() => window.open(`https://www.facebook.com/ads/manager/preview/display/?ad_id=${ad.id}`, '_blank')} title="Preview Ad">
                                       <Eye className="h-3.5 w-3.5" />
                                     </button>
                                     <button className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800 rounded-full text-red-500" onClick={() => handleDeleteObject(ad.id, 'Ad')} title="Delete">
                                       <Trash2 className="h-3.5 w-3.5" />
                                     </button>
                                   </div>
                                 </TableCell>
                               </TableRow>
                             ))
                           ) : (
                             <TableRow>
                               <TableCell colSpan={8} className="h-64 text-center">
                                 <div className="flex flex-col items-center justify-center space-y-4">
                                   <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                     <FileText className="h-8 w-8 text-slate-300" />
                                   </div>
                                   <div>
                                     <p className="text-slate-500 font-bold mb-1">
                                       {selectedAdSet ? `No ads found for ad set: ${selectedAdSet.name}` : 'Select an ad set to view ads'}
                                     </p>
                                     <p className="text-slate-400 text-xs">Start showing your message by creating an ad.</p>
                                   </div>
                                   {selectedAdSet && (
                                     <Button 
                                       onClick={() => setIsCreateAdDialogOpen(true)}
                                       className="!bg-[#00a400] hover:!bg-[#008a00] text-white font-black shadow-md border-none gap-2"
                                     >
                                       <Plus className="h-4 w-4 mr-2" />
                                       Create Ad
                                     </Button>
                                   )}
                                 </div>
                               </TableCell>
                             </TableRow>
                           )}
                         </TableBody>
                       </Table>
                     )}
                  </div>
                  
                  {/* Bottom Global Status Bar */}
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-6">
                       <span>1 Ad account selected</span>
                       {activeInnerTab === 'campaigns' && <span>Results for {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}</span>}
                       {activeInnerTab === 'ad_sets' && <span>Results for {adSets.length} Ad Set{adSets.length !== 1 ? 's' : ''}</span>}
                       {activeInnerTab === 'ads' && <span>Results for {ads.length} Ad{ads.length !== 1 ? 's' : ''}</span>}
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> API Version v25.0</span>
                       <span className="text-blue-600 cursor-pointer hover:underline">Facebook Ads Manager API</span>
                     </div>
                  </div>

                  {/* Creation Dialogs */}
                  <Dialog open={isCreateCampaignDialogOpen} onOpenChange={setIsCreateCampaignDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5 text-blue-500" />
                          Launch New Campaign
                        </DialogTitle>
                        <DialogDescription>Create a lead generation campaign for "{selectedAdAccount?.name}".</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Campaign Name</Label>
                            <Input value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} placeholder="e.g. Q4 Real Estate Leads" />
                          </div>
                          
                          <div className="space-y-2">
                             <Label className="text-xs font-bold uppercase text-slate-500">Objective</Label>
                             <Select value={newCampaignObjective} onValueChange={setNewCampaignObjective}>
                               <SelectTrigger><SelectValue placeholder="Select Goal" /></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="OUTCOME_AWARENESS">Awareness</SelectItem>
                                 <SelectItem value="OUTCOME_TRAFFIC">Traffic</SelectItem>
                                 <SelectItem value="OUTCOME_ENGAGEMENT">Engagement</SelectItem>
                                 <SelectItem value="OUTCOME_LEADS">Leads</SelectItem>
                                 <SelectItem value="OUTCOME_APP_PROMOTION">App Promotion</SelectItem>
                                 <SelectItem value="OUTCOME_SALES">Sales</SelectItem>
                               </SelectContent>
                             </Select>
                          </div>

                          <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                            <Checkbox id="special-cat" checked={isSpecialCategory} onCheckedChange={(c) => setIsSpecialCategory(!!c)} />
                            <div className="grid gap-1.5 leading-none">
                              <label htmlFor="special-cat" className="text-[11px] font-bold uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Special Ad Category
                              </label>
                              <p className="text-[10px] text-amber-700 dark:text-amber-400">Required for Housing, Employment, Credit, or Politics.</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          Note: This campaign will be created as "PAUSED". All ads must manually be set to ACTIVE after review.
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateCampaignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCampaign} disabled={isCreatingCampaign || !newCampaignName} className="bg-blue-600 hover:bg-blue-700 font-bold">
                          {isCreatingCampaign && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Create Campaign
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isCreateAdSetDialogOpen} onOpenChange={setIsCreateAdSetDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-purple-500" />
                          Create New Ad Set
                        </DialogTitle>
                        <DialogDescription>Setting up target audience for "{selectedCampaign?.name}".</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-slate-500">Ad Set Name</Label>
                          <Input value={newAdSetName} onChange={(e) => setNewAdSetName(e.target.value)} placeholder="e.g. Pune Leads - Age 25-45" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase text-slate-600 text-slate-400">Budget (Daily)</Label>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                               <span className="text-xs font-bold text-slate-500">{selectedAdAccount?.currency}</span>
                               <Input 
                                 type="number" 
                                 className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 text-xs font-black p-0" 
                                 value={newAdSetBudget}
                                 onChange={(e) => setNewAdSetBudget(Number(e.target.value))}
                               />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase text-slate-600 text-slate-400">Targeting</Label>
                            <div className="text-[10px] font-bold text-slate-600 truncate bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-md border border-slate-200 dark:border-slate-700">India (Default)</div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateAdSetDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAdSet} disabled={isCreatingAdSet || !newAdSetName} className="bg-purple-600 hover:bg-purple-700 font-bold">
                          {isCreatingAdSet && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Create Ad Set
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isCreateAdDialogOpen} onOpenChange={setIsCreateAdDialogOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-green-500" />
                          Design New Lead Ad
                        </DialogTitle>
                        <DialogDescription>Quickly create a Lead Ad for "{selectedAdAccount?.name}" using existing forms.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                             <Label className="text-xs font-bold uppercase text-slate-500">Creative Type</Label>
                             <Tabs value={useLibraryCreative ? "library" : "new"} onValueChange={(v) => {
                               setUseLibraryCreative(v === "library")
                               if (v === "library" && creatives.length === 0 && selectedAdAccount) {
                                  loadCreatives(selectedAdAccount.id)
                               }
                             }}>
                               <TabsList className="grid w-full grid-cols-2 h-9">
                                 <TabsTrigger value="new" className="text-xs">Create New</TabsTrigger>
                                 <TabsTrigger value="library" className="text-xs">From Library</TabsTrigger>
                               </TabsList>
                             </Tabs>
                           </div>

                           <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Ad Name</Label>
                            <Input value={newAdName} onChange={(e) => setNewAdName(e.target.value)} placeholder="e.g. Free Consultation Offer" />
                          </div>

                          {useLibraryCreative ? (
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase text-slate-500">Select Creative</Label>
                              <Select value={selectedLibraryCreativeId} onValueChange={(val) => {
                                setSelectedLibraryCreativeId(val)
                                const creative = creatives.find(c => c.id === val)
                                if (creative) {
                                  // Update preview with selected creative info
                                  setNewAdPrimaryText(creative.message || creative.object_story_spec?.link_data?.message || '')
                                  setNewAdHeadline(creative.headline || creative.object_story_spec?.link_data?.name || '')
                                  setNewAdImageUrl(creative.image_url || creative.thumbnail_url || '')
                                }
                              }}>
                                <SelectTrigger><SelectValue placeholder="Select Creative" /></SelectTrigger>
                                <SelectContent>
                                  {creatives.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                 <Label className="text-xs font-bold uppercase text-slate-500">Facebook Page</Label>
                                 <Select value={selectedAdPageId} onValueChange={setSelectedAdPageId}>
                                   <SelectTrigger><SelectValue placeholder="Select Page" /></SelectTrigger>
                                   <SelectContent>{pages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                 </Select>
                              </div>

                              <div className="space-y-2">
                                 <Label className="text-xs font-bold uppercase text-slate-500">Lead Form</Label>
                                 <Select value={selectedAdFormId} onValueChange={setSelectedAdFormId}>
                                   <SelectTrigger><SelectValue placeholder={isLoadingAdCreationForms ? "Loading..." : "Select Form"} /></SelectTrigger>
                                   <SelectContent>{adCreationForms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                                 </Select>
                              </div>
                            </>
                          )}

                          {/* When using library, hide individual design fields as they are part of the creative */}
                          {!useLibraryCreative && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Body Text (Primary)</Label>
                                <textarea 
                                  className="w-full h-24 p-2 text-sm border rounded-md dark:bg-slate-800 dark:border-slate-700" 
                                  value={newAdPrimaryText}
                                  onChange={(e) => setNewAdPrimaryText(e.target.value)}
                                  placeholder="Describe what you are offering..."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Headline</Label>
                                <Input value={newAdHeadline} onChange={(e) => setNewAdHeadline(e.target.value)} placeholder="e.g. Claim Your Free Bonus" />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Image URL</Label>
                                <Input value={newAdImageUrl} onChange={(e) => setNewAdImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                              </div>

                              <div className="space-y-2">
                                 <Label className="text-xs font-bold uppercase text-slate-500">Call to Action</Label>
                                 <Select value={newAdCta} onValueChange={setNewAdCta}>
                                   <SelectTrigger><SelectValue placeholder="Select CTA" /></SelectTrigger>
                                   <SelectContent>{CTA_OPTIONS.map(cta => <SelectItem key={cta.value} value={cta.value}>{cta.label}</SelectItem>)}</SelectContent>
                                 </Select>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Preview Side */}
                        <div className="space-y-4">
                          <Label className="text-xs font-bold uppercase text-slate-500 block mb-2">Ad Preview (Feed)</Label>
                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                            <div className="p-3 border-b flex items-center gap-2">
                              <div className="h-8 w-8 bg-slate-100 rounded-full shrink-0" />
                              <div>
                                <div className="text-[11px] font-bold">{pages.find(p => p.id === selectedAdPageId)?.name || 'Page Name'}</div>
                                <div className="text-[10px] text-slate-400">Sponsored</div>
                              </div>
                            </div>
                            <div className="p-3 text-xs leading-relaxed whitespace-pre-wrap">{newAdPrimaryText}</div>
                            <div className="aspect-[1.91/1] bg-slate-100 relative group overflow-hidden">
                                {newAdImageUrl ? (
                                  <img src={newAdImageUrl} className="w-full h-full object-cover" alt="Ad Creative" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-slate-300"><Plus className="h-6 w-6" /></div>
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between border-t">
                              <div className="min-w-0 pr-4">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Facebook</p>
                                <p className="text-sm font-bold truncate">{newAdHeadline || 'Headline'}</p>
                              </div>
                              <Button size="sm" className="bg-slate-200 hover:bg-slate-300 text-slate-900 border-none h-8 px-4 font-bold text-xs uppercase tracking-tight shrink-0">
                                {CTA_OPTIONS.find(c => c.value === newAdCta)?.label || 'Learn More'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateAdDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAd} disabled={isCreatingAd || !newAdName || (!useLibraryCreative && !selectedAdFormId) || (useLibraryCreative && !selectedLibraryCreativeId)} className="bg-green-600 hover:bg-green-700 font-bold">
                          {isCreatingAd && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Create Ad
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                </div>
              ) : (
                <Card className="h-[500px] border-none shadow-sm flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <TrendingUp className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select an Ad Account</h3>
                  <p className="text-muted-foreground mt-3 max-w-xs mx-auto text-base font-medium leading-relaxed"> Use the account selector in the top right to start viewing your campaign performance.</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="m-0 space-y-6">
          <div className="flex flex-col items-center justify-center p-8 text-center bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-8">
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">One-Click Lead Ads</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">Launch high-converting lead campaigns using our pre-built industry templates. We handle targeting and optimization defaults.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length > 0 ? templates.map((tpl) => (
              <Card key={tpl.id} className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                <div className="h-3 bg-blue-500" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-2">{tpl.category}</Badge>
                    <TrendingUp className="h-5 w-5 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-lg">{tpl.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-400">
                      <div>Objective</div>
                      <div className="text-right">Budget Type</div>
                      <div className="text-slate-900 dark:text-slate-100">{tpl.objective?.replace('OUTCOME_', '')}</div>
                      <div className="text-right text-slate-900 dark:text-slate-100">Daily</div>
                    </div>

                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                      onClick={() => handleLaunchTemplate(tpl.id)}
                      disabled={isLaunchingTemplate || !selectedAdAccount}
                    >
                      {isLaunchingTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {selectedAdAccount ? 'Launch Template' : 'Select Ad Account First'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-3 text-center py-20 bg-slate-50 rounded-2xl border-dashed border-2">
                <p className="text-slate-400">No templates available. Add them to `meta_campaign_templates` table.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="creatives" className="m-0 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              {/* Header / Account Selector Row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 shadow-inner shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black tracking-tight flex items-center gap-3">
                      <span className="truncate">Creatives Library</span>
                      {selectedAdAccount && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[10px] h-5 px-2 border-0 uppercase tracking-widest shrink-0">{selectedAdAccount.currency}</Badge>}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60 truncate">
                      Visual Assets & Copy
                    </p>
                  </div>
                </div>

                <Popover open={isAdAccountOpen} onOpenChange={setIsAdAccountOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isAdAccountOpen}
                      className="w-full md:w-[320px] justify-between h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold rounded-xl shadow-sm hover:border-purple-500 hover:ring-4 hover:ring-purple-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Search className="h-4 w-4 text-slate-400 shrink-0 group-hover:text-purple-500 transition-colors" />
                        <span className="truncate">{selectedAdAccount ? selectedAdAccount.name : "Select Ad Account..."}</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[450px] p-0 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden" 
                    align="end" 
                    side="bottom" 
                    sideOffset={8}
                    avoidCollisions={false}
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search ad accounts..."
                          value={adAccountSearch}
                          onChange={(e) => setAdAccountSearch(e.target.value)}
                          className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none text-sm rounded-lg"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="p-2 space-y-1">
                        {adAccounts
                          .filter(acc =>
                            acc.name?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                            acc.id?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                            acc.business?.name?.toLowerCase().includes(adAccountSearch.toLowerCase())
                          )
                          .map((acc) => {
                            const accStatus = AD_ACCOUNT_STATUS_MAP[acc.account_status] || { text: 'Unknown', color: 'bg-slate-100 text-slate-700' };
                            return (
                              <button
                                key={acc.id}
                                onClick={() => {
                                  setSelectedAdAccount(acc);
                                  loadCreatives(acc.id);
                                  setIsAdAccountOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 p-3 text-left rounded-xl transition-all bg-white border border-slate-200 shadow-sm hover:bg-green-100 dark:hover:bg-slate-800/80 group ${selectedAdAccount?.id === acc.id ? 'bg-purple-50 dark:bg-purple-900/30' : ''} ${acc.account_status !== 1 ? 'opacity-60' : ''}`}
                              >
                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                  <Briefcase className={`h-4 w-4 ${selectedAdAccount?.id === acc.id ? 'text-purple-500' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-bold text-sm truncate uppercase tracking-tight">{acc.name}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Badge className={`text-[9px] px-1.5 h-4 leading-none border-0 ${accStatus.color}`}>{accStatus.text}</Badge>
                                      {selectedAdAccount?.id === acc.id && <Check className="h-3.5 w-3.5 text-purple-500" />}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70">
                                    <span>{acc.business?.name || 'Personal'}</span>
                                    <span>•</span>
                                    <span className="font-mono">{acc.id}</span>
                                    <span>•</span>
                                    <span className="font-mono">{acc.currency}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        }
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>

            <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Ad Creatives Library</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-wider opacity-70">Manage visual fragments</CardDescription>
                  </div>
                  <Dialog open={isCreateCreativeDialogOpen} onOpenChange={setIsCreateCreativeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 px-6 font-bold rounded-xl h-11" disabled={!selectedAdAccount}>
                        <Plus className="h-4 w-4 mr-2" /> Create Creative
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create Standalone Creative</DialogTitle>
                        <DialogDescription>Create a lead generation creative to reuse across multiple ads.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                          <Label>Creative Name</Label>
                          <Input value={newCreativeName} onChange={(e) => setNewCreativeName(e.target.value)} placeholder="e.g. Summer Promo 2024" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Page</Label>
                            <Select value={selectedAdPageId} onValueChange={setSelectedAdPageId}>
                              <SelectTrigger><SelectValue placeholder="Select Page" /></SelectTrigger>
                              <SelectContent>{pages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Lead Form</Label>
                            <Select value={selectedAdFormId} onValueChange={setSelectedAdFormId} disabled={adCreationForms.length === 0}>
                              <SelectTrigger><SelectValue placeholder={isLoadingAdCreationForms ? "Loading..." : "Select Form"} /></SelectTrigger>
                              <SelectContent>{adCreationForms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Headline</Label>
                          <Input 
                            value={newCreativeHeadline}
                            onChange={(e) => setNewCreativeHeadline(e.target.value)}
                            placeholder="e.g. Free Consultation Offer"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Call to Action</Label>
                          <Select value={newCreativeCta} onValueChange={setNewCreativeCta}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select CTA" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                              <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                              <SelectItem value="GET_QUOTE">Get Quote</SelectItem>
                              <SelectItem value="APPLY_NOW">Apply Now</SelectItem>
                              <SelectItem value="DOWNLOAD">Download</SelectItem>
                              <SelectItem value="GET_OFFER">Get Offer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Default Message (Ad Primary Text)</Label>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring theme-scrollbar"
                            value={newCreativeMsg}
                            onChange={(e) => setNewCreativeMsg(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Image URL (Landscape 1200x628)</Label>
                          <Input value={newCreativeImageUrl} onChange={(e) => setNewCreativeImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateCreative} disabled={isCreatingCreative || !newCreativeName || !selectedAdFormId}>
                          {isCreatingCreative && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Save Creative
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!selectedAdAccount ? (
                  <div className="py-24 text-center text-slate-400 flex flex-col items-center">
                    <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                      <Briefcase className="h-10 w-10 opacity-10" />
                    </div>
                    <p className="text-lg font-bold text-slate-500">Select an Ad Account to view creatives</p>
                  </div>
                ) : isCreativesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" /><p className="text-sm text-slate-400">Loading library...</p></div>
                ) : creatives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {creatives.map(c => (
                      <div key={c.id} className="border dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col space-y-3 hover:border-blue-500 transition-all group overflow-hidden shadow-sm hover:shadow-md">
                        <div className="h-32 w-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative">
                          {c.image_url || c.thumbnail_url ? (
                            <img src={c.image_url || c.thumbnail_url} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt={c.name} />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300"><FileText className="h-10 w-10" /></div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[9px] h-5 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white border-0">
                              {c.status || 'ACTIVE'}
                            </Badge>
                          </div>
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeleteObject(c.id, 'Creative');
                               }}
                               className="p-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-lg shadow-sm transition-all border border-slate-200 dark:border-slate-700"
                               title="Delete Creative"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm truncate" title={c.name}>{c.name}</p>
                          <div className="flex items-center justify-between">
                             <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase tracking-widest">ID: {c.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] w-full" disabled>
                            <Eye className="h-3 w-3 mr-2" /> Preview
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    <FileText className="h-12 w-12 text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">No standalone creatives found.</p>
                    <p className="text-slate-400 text-xs mt-1">Ready-to-use creatives created here can be reused in your campaigns.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pixels" className="m-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">Pixels & CAPI Console</h3>
              <p className="text-sm text-muted-foreground">Sync pixels, fire test events, and generate tracking scripts.</p>
            </div>
            <Button
              onClick={handleSyncPixels}
              disabled={isSyncingPixels}
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              {isSyncingPixels ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync Pixels from Meta
            </Button>
          </div>

          {/* Pixels status table */}
          <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Connected Pixels
                <Badge variant="secondary" className="ml-auto">{pixels.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Pixel</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Pixel ID</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Ad Account</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPixels ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                      </TableCell>
                    </TableRow>
                  ) : pixels.length > 0 ? (
                    pixels.map((pixel) => (
                      <TableRow key={pixel.id} className="border-slate-50 dark:border-slate-800/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center text-purple-600">
                              <Zap className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">{pixel.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{pixel.pixel_id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{pixel.ad_account_id || '—'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={pixel.is_active ? 'default' : 'secondary'}
                            className={pixel.is_active ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                          >
                            {pixel.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost" size="icon"
                            className={`h-8 w-8 ${pixel.is_active ? 'text-amber-500' : 'text-green-500'}`}
                            onClick={() => handleTogglePixelStatus(pixel)}
                          >
                            {pixel.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Zap className="h-10 w-10 opacity-10" />
                          <p>No pixels synced. Click "Sync Pixels from Meta" to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Test Console + Script Generator */}
          <PixelTestConsole
            pixels={pixels}
            adAccounts={adAccounts}
            onRefreshPixels={handleSyncPixels}
            isSyncingPixels={isSyncingPixels}
          />
        </TabsContent>

        <TabsContent value="roi" className="m-0 space-y-6">
          <RoiDashboard />
        </TabsContent>
        </div>
      </Tabs>
      <ErrorDialog 
        isOpen={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        title={lastError?.title || "Meta Operation Blocked"}
        description={lastError?.description || ""}
        action={lastError?.action}
        url={lastError?.url}
      />

      {/* Custom Delete Confirmation Modal */}
      <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to <strong>PERMANENTLY</strong> delete this {deleteConfirm.label}? This action cannot be undone and will remove it from Meta Ads Manager.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => !isDeletingObject && setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteObject} disabled={isDeletingObject} className="font-bold">
              {isDeletingObject && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Yes, Delete {deleteConfirm.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Edit Campaign Modal */}
      <Dialog open={isEditCampaignDialogOpen} onOpenChange={setIsEditCampaignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-500" />
              Edit Campaign Details
            </DialogTitle>
            <DialogDescription>Update the settings for your Meta Campaign.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Campaign Name</Label>
              <Input 
                value={newCampaignName} 
                onChange={(e) => setNewCampaignName(e.target.value)} 
                placeholder="Enter new name" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditCampaignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCampaignName} disabled={isCreatingCampaign || !newCampaignName} className="bg-blue-600 hover:bg-blue-700 font-bold">
              {isCreatingCampaign && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Audience Creation Dialog */}
      <Dialog open={isCreateAudienceDialogOpen} onOpenChange={setIsCreateAudienceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Users className="h-5 w-5" />
              Create Custom Audience
            </DialogTitle>
            <DialogDescription>
              Build a custom audience from your lead activity for retargeting or lookalikes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Audience name</Label>
              <Input
                placeholder="e.g. LeadBajaar Form Respondents"
                value={newAudienceName}
                onChange={(e) => setNewAudienceName(e.target.value)}
              />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Audience Details</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                   <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Source: Lead Forms Activity
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                   <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Type: Custom Audience
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400 leading-relaxed italic opacity-80">
                   "Includes all people who opened and submitted a lead form in the past 90 days."
                </li>
              </ul>
            </div>
            <p className="text-[10px] text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> Custom audiences can take up to 24 hours to populate fully in Meta Ads Manager.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateAudienceDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 font-bold"
              onClick={handleCreateAudience}
              disabled={isCreatingAudience || !newAudienceName}
            >
              {isCreatingAudience ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Audience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Deletion Dialog */}
      <Dialog open={isDataDeletionDialogOpen} onOpenChange={setIsDataDeletionDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
              Request Data Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will request a permanent deletion of your Meta-sourced data (leads, forms, and ad account references) from LeadBajaar servers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
               <div className="flex gap-3">
                 <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                   <strong>Important:</strong> This action cannot be undone once processed. It may take up to 30 days for all backups and distributed records to be fully purged from our infrastructure.
                 </p>
               </div>
             </div>
             <p className="text-sm text-slate-500">
               A confirmation code will be generated and logged with your request for compliance tracking.
             </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDataDeletionDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 font-bold" 
              onClick={handleConfirmDataDeletion}
              disabled={isDeletingData}
            >
              {isDeletingData && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send Deletion Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Meta Dialog */}
      <Dialog open={isDisconnectMetaDialogOpen} onOpenChange={setIsDisconnectMetaDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              Disconnect Meta Account
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to disconnect your Meta account? This will revoke all API permissions and immediately stop lead synchronization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDisconnectMetaDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDisconnectMeta} 
              disabled={isDisconnecting} 
              className="font-bold shadow-lg"
            >
              {isDisconnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Yes, Disconnect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Status Tracking Dialog */}
      <Dialog open={isDeletionStatusDialogOpen} onOpenChange={setIsDeletionStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px] gap-0 border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 flex flex-col items-center">
             <div className="h-14 w-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-amber-600 mb-3 shadow-sm">
                <ShieldCheck className="h-7 w-7" />
             </div>
             <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Active Deletion Request</DialogTitle>
             <p className="text-[11px] font-bold text-amber-700/70 dark:text-amber-400 uppercase tracking-widest mt-1">Status: Registered & Verified</p>
          </div>
          
          <div className="p-6 space-y-5 bg-white dark:bg-slate-900">
             <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmation Code</p>
                <p className="font-mono font-black text-xl text-indigo-600 dark:text-indigo-400 tracking-wider">
                   {statusData?.deletion_details?.code || 'LBJ-DEL-XXXXXX'}
                </p>
             </div>

             <div className="space-y-3 px-1">
                <div className="flex items-center justify-between text-[11px]">
                   <span className="text-slate-500 font-bold uppercase tracking-wide">Registry Date</span>
                   <span className="text-slate-900 dark:text-white font-black">
                     {statusData?.deletion_details?.requested_at ? new Date(statusData.deletion_details.requested_at).toLocaleDateString() : 'N/A'}
                   </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                   <span className="text-slate-500 font-bold uppercase tracking-wide">Queue Status</span>
                   <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 h-5 font-black uppercase text-[8px] tracking-widest">Awaiting Admin</Badge>
                </div>
             </div>
          </div>

          <div className="px-6 pb-6 pt-2 bg-white dark:bg-slate-900">
            <Button className="w-full h-10 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:text-slate-900 font-black text-xs uppercase tracking-widest shadow-lg" onClick={() => setIsDeletionStatusDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


