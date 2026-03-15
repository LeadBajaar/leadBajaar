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
  AlertCircle,
  X,
  Trash2,
  Archive,
  Play,
  Pause,
  Zap,
  Eye,
  Info
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'
import { PixelTestConsole } from './PixelTestConsole'
import { RoiDashboard } from './RoiDashboard'
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
  const [isSyncingAssets, setIsSyncingAssets] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoadingForms, setIsLoadingForms] = useState(false)
  const [isLoadingAds, setIsLoadingAds] = useState(false)
  const [isLoadingAdSets, setIsLoadingAdSets] = useState(false)
  const [isLoadingSpecificAds, setIsLoadingSpecificAds] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCreatingForm, setIsCreatingForm] = useState(false)
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
  const [adAccountSearch, setAdAccountSearch] = useState('')
  const [isCreateCreativeDialogOpen, setIsCreateCreativeDialogOpen] = useState(false)
  const [newCreativeName, setNewCreativeName] = useState('')
  const [newCreativeMsg, setNewCreativeMsg] = useState('Check this out!')
  const [newCreativeImageUrl, setNewCreativeImageUrl] = useState('')
  const [isCreatingCreative, setIsCreatingCreative] = useState(false)
  const [lastError, setLastError] = useState<{ title: string, description: string, action: string } | null>(null)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [pixels, setPixels] = useState<any[]>([])
  const [isSyncingPixels, setIsSyncingPixels] = useState(false)
  const [isLoadingPixels, setIsLoadingPixels] = useState(false)
  const [isPixelScriptDialogOpen, setIsPixelScriptDialogOpen] = useState(false)
  const [selectedPixelForScript, setSelectedPixelForScript] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check for success/error parameters from Meta OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('meta_connected') === 'success') {
      toast({
        title: "Meta Connected Successfully",
        description: "Your Meta account has been linked and pages are being synced.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error')) {
      toast({
        title: "Connection Failed",
        description: urlParams.get('error') || "Failed to connect Meta account.",
        variant: "destructive"
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
      } catch (err) {
        console.error("Error loading forms for ad:", err)
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

  // Helper to humanize Meta API errors & provide "what to do next"
  const formatMetaError = (errorMsg: string) => {
    let parsedError: any = null;
    try {
      if (errorMsg.trim().startsWith('{')) {
        parsedError = JSON.parse(errorMsg);
      }
    } catch (e) {
      // Not JSON
    }

    const errorString = errorMsg.toLowerCase();
    const subcode = parsedError?.error_subcode?.toString() || "";
    const metaMessage = parsedError?.error_user_msg || parsedError?.message || errorMsg;
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

    // Generic Invalid Parameter fallback
    if (errorString.includes('100') || errorString.includes('invalid parameter')) {
      return {
        title: "Invalid Meta Parameter",
        description: metaMessage,
        action: "Check your name, targeting, and budget fields for invalid characters or values."
      };
    }

    return {
      title: "Meta Operation Blocked",
      description: metaMessage || "Something went wrong while communicating with Facebook.",
      action: "Check the Meta Ad Account settings or your internet connection."
    };
  };

  const loadPages = async () => {
    try {
      setIsLoading(true)
      const response = await integrationApi.getMetaStatus()
      if (response.connected) {
        setPages(response.facebook_pages || [])
        setSetupChecklist(response.setup_checklist || null)
      }
    } catch (error: any) {
      console.error('Failed to load Meta pages:', error)
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      toast({
        title: metaErr.title,
        description: `${metaErr.description} ${metaErr.action}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
      toast({
        title: metaErr.title,
        description: `${metaErr.description}\n\n👉 Next step: ${metaErr.action}`,
        variant: "destructive"
      })
    }
  }

  const loadCampaigns = async (adAccountId: string) => {
    try {
      setIsLoadingAds(true)
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
      setSelectedCampaign(null)
      setAdSets([])
      setAds([])
    } catch (error: any) {
      console.error('Failed to load campaigns:', error)
      toast({
        title: "Error",
        description: "Failed to load Meta Ads data",
        variant: "destructive"
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
    }
  }

  const loadPageForms = async (page: FacebookPage) => {
    try {
      setSelectedPage(page)
      setIsSubscribed(false)
      setIsLoadingForms(true)
      setForms([])

      const response = await integrationApi.getMetaPageForms(page.id)
      if (response.status === 'success') {
        setForms(response.forms || [])
      }
    } catch (error: any) {
      console.error('Failed to load lead forms:', error)
      toast({
        title: "Error",
        description: "Failed to load lead forms for this page",
        variant: "destructive"
      })
    } finally {
      setIsLoadingForms(false)
    }
  }

  const handleSyncHistory = async (form: LeadForm) => {
    try {
      toast({
        title: "Manual Sync Started",
        description: `Fetching historical leads for ${form.name}...`
      })

      const response = await integrationApi.retrieveFacebookLeads({
        form_id: form.id,
        integration_id: 0
      })

      toast({
        title: "Sync Completed",
        description: `Successfully retrieved ${response.count || 0} leads from Meta.`,
        variant: "default"
      })
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Could not retrieve historical leads",
        variant: "destructive"
      })
    }
  }
  const handleDeepSyncAccount = async () => {
    if (!selectedAdAccount) return
    setIsDeepSyncing(true)
    try {
      const response = await integrationApi.syncMetaAdAccountDetails(selectedAdAccount.id)
      toast({
        title: "Deep Sync Complete",
        description: response.message || "Reports and campaign history refreshed for this account."
      })
      // Refresh the UI with new data
      loadCampaigns(selectedAdAccount.id)
    } catch (error: any) {
      toast({
        title: "Deep Sync Failed",
        description: error.message,
        variant: "destructive"
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
        toast({
          title: "Dashboard Refreshed",
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
        toast({
          title: metaErr.title,
          description: `${metaErr.description}\n\n👉 Next step: ${metaErr.action}`,
          variant: "destructive"
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
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
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
        daily_budget: 50000, // 500 units in cents/paise
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LEAD_GENERATION',
        promoted_object: { page_id: selectedPage?.id || pages[0]?.id },
        targeting: { geo_locations: { countries: ['IN'] } },
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        status: 'PAUSED'
      }

      const response = await integrationApi.createMetaAdSet(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast({ title: "Ad Set Created", description: "New ad set added to campaign." })
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

    if (!selectedAdPageId || !selectedAdFormId) {
      setLastError({
        title: "Missing Assets",
        description: "A Facebook Page and Lead Form must be selected to create an ad.",
        action: "Please select a Page and a Lead Form from the dropdowns below."
      })
      setIsErrorDialogOpen(true)
      return
    }

    try {
      setIsCreatingAd(true)
      const data = {
        adset_id: selectedAdSet.id,
        name: newAdName,
        status: 'PAUSED',
        creative: {
          name: `${newAdName} Creative`,
          page_id: selectedAdPageId,
          form_id: selectedAdFormId,
          message: "Sign up to learn more about our exclusive offers!",
          link: "https://leadbajaar.com",
          // Default high-converting placeholder image (standard Meta landscape size)
          image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=628&fit=crop"
        }
      }

      const response = await integrationApi.createMetaAd(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast({ title: "Ad Created", description: "New ad added to ad set." })
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

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      const response = await integrationApi.updateMetaStatus(id, newStatus as any)
      if (response.status === 'success') {
        toast({
          title: newStatus === 'ACTIVE' ? "Campaign/Ad Started" : "Campaign/Ad Paused",
          description: `Status updated to ${newStatus}`
        })
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    }
  }

  const handleArchiveObject = async (id: string) => {
    try {
      const response = await integrationApi.updateMetaStatus(id, 'ARCHIVED')
      if (response.status === 'success') {
        toast({ title: "Object Archived", description: "The campaign/adset has been moved to archives." })
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
    }
  }

  const handleDeleteObject = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete this ${label}? This action cannot be undone.`)) return

    try {
      const response = await integrationApi.deleteMetaObject(id)
      if (response.status === 'success') {
        toast({ title: "Deleted Successfully", description: `${label} has been removed from Meta.` })
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      const metaErr = formatMetaError(error.message);
      setLastError(metaErr);
      setIsErrorDialogOpen(true);
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
        toast({
          title: "Form Created",
          description: "New Lead Gen Form is now live on Facebook!",
          variant: "default"
        })
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
        objective: 'OUTCOME_LEADS',
        status: 'PAUSED'
      }

      const response = await integrationApi.createMetaCampaign(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast({
          title: "Campaign Created",
          description: "New Lead Generation campaign is ready in your ad account.",
          variant: "default"
        })
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
      toast({ title: "Select Ad Account", description: "Please select an ad account first.", variant: "destructive" })
      return
    }
    try {
      setIsLaunchingTemplate(true)
      const response = await integrationApi.launchMetaTemplate(selectedAdAccount.id, templateId)
      if (response.status === 'success') {
        toast({ title: "Campaign Launched!", description: "Template deployed as a paused campaign." })
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
        toast({
          title: "Audience Created",
          description: "Your custom audience is now available in Meta Ads Manager.",
          variant: "default"
        })
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

  const loadAdSets = async (campaign: any) => {
    try {
      setSelectedCampaign(campaign)
      setIsLoadingAdSets(true)
      setAdSets([])
      setAds([])
      const response = await integrationApi.getMetaAdSets(campaign.id)
      if (response.status === 'success') {
        setAdSets(response.ad_sets || [])
      }
    } catch (error: any) {
      toast({ title: "Failed to load Ad Sets", description: error.message, variant: "destructive" })
    } finally {
      setIsLoadingAdSets(false)
    }
  }

  const loadAds = async (adSet: any) => {
    try {
      setSelectedAdSet(adSet)
      setIsLoadingSpecificAds(true)
      setAds([])
      const response = await integrationApi.getMetaAds(adSet.id)
      if (response.status === 'success') {
        setAds(response.ads || [])
      }
    } catch (error: any) {
      toast({ title: "Failed to load Ads", description: error.message, variant: "destructive" })
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
      toast({ title: "Failed to load Creatives", description: error.message, variant: "destructive" })
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
        image_url: newCreativeImageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=628&fit=crop"
      }

      const response = await integrationApi.createMetaAdCreativeStandalone(selectedAdAccount.id, data)

      if (response.status === 'success') {
        toast({ title: "Creative Created", description: "Standalone ad creative added to library." })
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
        toast({ title: "Pixels Synced", description: "Your Meta Pixels have been updated." })
      }
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" })
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
        toast({ title: "Status Updated", description: `Pixel ${pixel.name} is now ${newStatus ? 'active' : 'inactive'}.` })
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" })
    }
  }

  const handleUpdateBudget = async (adSetId: string, newBudget: number) => {
    try {
      const response = await integrationApi.updateMetaAdSet(adSetId, { daily_budget: newBudget * 100 }) // Facebook cents
      if (response.status === 'success') {
        toast({ title: "Budget Updated", description: "Ad Set budget adjusted successfully." })
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Meta Business Suite</h2>
          <p className="text-muted-foreground">Manage your Facebook Pages and Ads (v25.0)</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {setupChecklist && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
              <div className={`h-2 w-2 rounded-full ${setupChecklist.oauth_connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500'}`} />
              <span className="text-slate-700 dark:text-slate-300">
                {setupChecklist.oauth_connected ? 'Meta Platform Active' : 'Setup Required'}
              </span>
              <span className="text-slate-400 mx-1">|</span>
              <span className="text-slate-600 dark:text-slate-400">{pages.length} Pages</span>
              <span className="text-slate-400 mx-1">|</span>
              <span className="text-slate-600 dark:text-slate-400">{adAccounts.length} Ad Accounts</span>
            </div>
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
                <CardDescription>{pages.length} pages found</CardDescription>
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
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {page.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold line-clamp-1">{page.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase opacity-70 tracking-tighter">ID: {page.id}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-400 ${selectedPage?.id === page.id ? 'text-blue-500' : ''}`} />
                    </button>
                  ))}
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
                          <CardTitle>{selectedPage.name}</CardTitle>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 text-[10px] font-bold uppercase tracking-tight border-blue-200 dark:border-blue-900 ${isSubscribed ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}
                          onClick={handleSubscribePage}
                          disabled={isSubscribing || isSubscribed}
                        >
                          {isSubscribing ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                          ) : isSubscribed ? (
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-green-500" />
                          ) : (
                            <Settings className="h-2.5 w-2.5 mr-1" />
                          )}
                          {isSubscribed ? 'Verified' : 'Verify Webhook'}
                        </Button>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
                              >
                                <RefreshCw className="h-3 w-3 mr-2" /> Sync History
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
        </TabsContent>

        <TabsContent value="ads" className="m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ad Accounts Sidebar */}
            <Card className="lg:col-span-1 border-none shadow-md bg-white dark:bg-slate-900 h-fit flex flex-col max-h-[500px]">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" /> Ad Accounts
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{adAccounts.length}</Badge>
                </CardTitle>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={adAccountSearch}
                    onChange={(e) => setAdAccountSearch(e.target.value)}
                    className="pl-9 h-9 bg-slate-50 border-none shadow-none text-xs focus-visible:ring-blue-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-grow bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adAccounts
                    .filter(acc =>
                      acc.name?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                      acc.id?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                      acc.business?.name?.toLowerCase().includes(adAccountSearch.toLowerCase())
                    )
                    .map((acc) => {
                      const statusMap: Record<number, { text: string, color: string }> = {
                        1: { text: 'Active', color: 'bg-green-100 text-green-700' },
                        2: { text: 'Disabled', color: 'bg-red-100 text-red-700' },
                        3: { text: 'Unsettled', color: 'bg-amber-100 text-amber-700' },
                        7: { text: 'Pending Review', color: 'bg-blue-100 text-blue-700' },
                        8: { text: 'Pending Settlement', color: 'bg-blue-100 text-blue-700' },
                        9: { text: 'In Grace Period', color: 'bg-blue-100 text-blue-700' },
                        100: { text: 'Pending Closure', color: 'bg-slate-100 text-slate-700' },
                        101: { text: 'Closed', color: 'bg-slate-100 text-slate-700' },
                      };
                      const status = statusMap[acc.account_status] || { text: 'Unknown', color: 'bg-slate-100 text-slate-700' };
                      const businessName = acc.business?.name || 'Personal Account';

                      return (
                        <button
                          key={acc.id}
                          onClick={() => { setSelectedAdAccount(acc); loadCampaigns(acc.id); }}
                          className={`w-full p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedAdAccount?.id === acc.id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-r-4 border-blue-500 shadow-sm' : ''} ${acc.account_status !== 1 ? 'opacity-70' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm truncate flex-1">{acc.name}</p>
                            <Badge className={`text-[9px] px-1 h-3.5 leading-none ${status.color}`} variant="outline">
                              {status.text}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                              {businessName}
                            </p>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{acc.currency}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{acc.id}</p>
                        </button>
                      );
                    })}
                  {adAccounts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">No ad accounts found</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ads Explorer Area */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAdAccount ? (
                <>
                  {/* Insights Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-none shadow-sm bg-blue-600 text-white col-span-1 sm:col-span-2 md:col-span-1">
                      <CardContent className="p-4">
                        <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Total Spend (Last 30d)</p>
                        <h3 className="text-xl font-black mt-1">
                          {selectedAdAccount.currency} {insights.reduce((sum, i) => sum + parseFloat(i.spend || '0'), 0).toFixed(2)}
                        </h3>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Impressions</p>
                        <h3 className="text-xl font-black mt-1">
                          {insights.reduce((sum, i) => sum + parseInt(i.impressions || '0'), 0).toLocaleString()}
                        </h3>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Clicks</p>
                        <h3 className="text-xl font-black mt-1">
                          {insights.reduce((sum, i) => sum + parseInt(i.clicks || '0'), 0).toLocaleString()}
                        </h3>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg CTR</p>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-black mt-1">
                            {(() => {
                              const totalImps = insights.reduce((sum, i) => sum + parseInt(i.impressions || '0'), 0);
                              const totalClicks = insights.reduce((sum, i) => sum + parseInt(i.clicks || '0'), 0);
                              return totalImps > 0 ? ((totalClicks / totalImps) * 100).toFixed(2) : '0.00';
                            })()}%
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg CPC</p>
                        <h3 className="text-xl font-black mt-1">
                          {selectedAdAccount.currency} {(() => {
                            const totalSpend = insights.reduce((sum, i) => sum + parseFloat(i.spend || '0'), 0);
                            const totalClicks = insights.reduce((sum, i) => sum + parseInt(i.clicks || '0'), 0);
                            return totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00';
                          })()}
                        </h3>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Campaigns Table */}
                  <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800">
                      <div>
                        <CardTitle className="text-xl">Campaigns</CardTitle>
                        <CardDescription>Performance for {selectedAdAccount.name}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeepSyncAccount}
                          disabled={isDeepSyncing || isLoadingAds}
                          className="h-9 font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {isDeepSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                          )}
                          Refresh Details
                        </Button>

                        <Dialog open={isCreateAudienceDialogOpen} onOpenChange={setIsCreateAudienceDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 font-semibold border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              <Users className="h-4 w-4 mr-2 text-purple-500" />
                              New Audience
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Custom Audience</DialogTitle>
                              <DialogDescription>
                                Targeted for {selectedAdAccount.name}. You can later use this to target specific lead segments.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold">Audience Name</label>
                                <Input
                                  placeholder="e.g. VIP Leads March 2024"
                                  value={newAudienceName}
                                  onChange={(e) => setNewAudienceName(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsCreateAudienceDialogOpen(false)}>Cancel</Button>
                              <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={handleCreateAudience}
                                disabled={isCreatingAudience || !newAudienceName}
                              >
                                {isCreatingAudience ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Create Audience
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isCreateCampaignDialogOpen} onOpenChange={setIsCreateCampaignDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 font-semibold">
                              <Plus className="h-4 w-4 mr-1" />
                              New Campaign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Launch New Campaign</DialogTitle>
                              <DialogDescription>
                                Create a new Lead Generation campaign for "{selectedAdAccount.name}".
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="campaign-name">Campaign Name</Label>
                                <Input
                                  id="campaign-name"
                                  value={newCampaignName}
                                  onChange={(e) => setNewCampaignName(e.target.value)}
                                  placeholder="e.g. March Lead Gen Blast"
                                />
                              </div>
                              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                                <p className="font-semibold mb-1">Configuration:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  <li>Objective: Lead Generation (OUTCOME_LEADS)</li>
                                  <li>Initial Status: Paused (Setup required in Meta Ads Manager)</li>
                                  <li>Budget: Not set (Define in Ads Manager)</li>
                                </ul>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsCreateCampaignDialogOpen(false)}>Cancel</Button>
                              <Button
                                onClick={handleCreateCampaign}
                                disabled={isCreatingCampaign || !newCampaignName}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {isCreatingCampaign ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Create Campaign
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => loadCampaigns(selectedAdAccount.id)} disabled={isLoadingAds}>
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAds ? 'animate-spin' : ''}`} /> Sync Data
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                          <TableRow>
                            <TableHead className="font-bold">Campaign Name</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Objective</TableHead>
                            <TableHead className="font-bold text-right">Spend</TableHead>
                            <TableHead className="font-bold text-right">Results</TableHead>
                            <TableHead className="font-bold text-right">CTR</TableHead>
                            <TableHead className="font-bold text-right">CPC</TableHead>
                            <TableHead className="font-bold text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingAds ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-40 text-center text-muted-foreground bg-slate-50/50">
                                <Plus className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2 opacity-20" />
                                <p className="text-sm">Fetching campaigns and global insights...</p>
                              </TableCell>
                            </TableRow>
                          ) : campaigns.length > 0 ? (
                            campaigns.map((camp) => {
                              const campInsight = insights.find(i => i.campaign_name === camp.name);
                              const isExpanded = selectedCampaign?.id === camp.id;

                              return (
                                <React.Fragment key={camp.id}>
                                  <TableRow
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    onClick={() => isExpanded ? setSelectedCampaign(null) : loadAdSets(camp)}
                                  >
                                    <TableCell className="font-bold flex items-center space-x-2">
                                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90 text-blue-500' : 'text-slate-300'}`} />
                                      <span className="truncate max-w-[150px]">{camp.name}</span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={camp.status === 'ACTIVE' ? 'default' : 'secondary'} className={camp.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                                        {camp.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-mono opacity-70">
                                      {camp.objective?.replace('OUTCOME_', '')}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {selectedAdAccount.currency} {campInsight?.spend || '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex flex-col items-end">
                                        <span className="font-bold text-blue-600">{campInsight?.clicks || 0}</span>
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Clicks</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex flex-col items-end">
                                        <span className={`font-bold ${parseFloat(campInsight?.ctr || '0') > 1.5 ? 'text-green-600' : parseFloat(campInsight?.ctr || '0') > 0.8 ? 'text-amber-500' : 'text-slate-600'}`}>
                                          {parseFloat(campInsight?.ctr || '0').toFixed(2)}%
                                        </span>
                                        <span className="text-[8px] text-muted-foreground opacity-50 uppercase">CTR</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex flex-col items-end">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                          {selectedAdAccount.currency} {parseFloat(campInsight?.cpc || '0').toFixed(2)}
                                        </span>
                                        <span className="text-[8px] text-muted-foreground opacity-50 uppercase">CPC</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={`h-8 w-8 ${camp.status === 'ACTIVE' ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}`}
                                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(camp.id, camp.status); }}
                                          title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                                        >
                                          {camp.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-slate-400 hover:text-blue-500"
                                          onClick={(e) => { e.stopPropagation(); handleArchiveObject(camp.id); }}
                                          title="Archive Campaign"
                                        >
                                          <Archive className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                                          onClick={(e) => { e.stopPropagation(); handleDeleteObject(camp.id, 'Campaign'); }}
                                          title="Delete Campaign"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>

                                  {isExpanded && (
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                      <TableCell colSpan={6} className="p-0 border-b border-blue-100 dark:border-blue-900/30">
                                        <div className="pl-12 pr-4 py-4 space-y-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Ad Sets in this Campaign</h4>

                                            <Dialog open={isCreateAdSetDialogOpen} onOpenChange={setIsCreateAdSetDialogOpen}>
                                              <DialogTrigger asChild>
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-blue-600">
                                                  <Plus className="h-3 w-3 mr-1" /> New Ad Set
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent>
                                                <DialogHeader><DialogTitle>Quick Create Ad Set</DialogTitle></DialogHeader>
                                                <div className="py-4 space-y-4">
                                                  <div className="space-y-2">
                                                    <Label>Ad Set Name</Label>
                                                    <Input value={newAdSetName} onChange={(e) => setNewAdSetName(e.target.value)} placeholder="e.g. Lead Gen South" />
                                                  </div>
                                                </div>
                                                <DialogFooter>
                                                  <Button onClick={handleCreateAdSet} disabled={isCreatingAdSet || !newAdSetName}>
                                                    {isCreatingAdSet && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                                    Create Ad Set
                                                  </Button>
                                                </DialogFooter>
                                              </DialogContent>
                                            </Dialog>
                                          </div>

                                          {isLoadingAdSets ? (
                                            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-blue-400" /></div>
                                          ) : adSets.length > 0 ? (
                                            <div className="space-y-2">
                                              {adSets.map((set) => {
                                                const isAdSetExpanded = selectedAdSet?.id === set.id;
                                                return (
                                                  <div key={set.id} className="border rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                                    <div
                                                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                                      onClick={() => isAdSetExpanded ? setSelectedAdSet(null) : loadAds(set)}
                                                    >
                                                      <div className="flex items-center space-x-3">
                                                        <ChevronRight className={`h-3 w-3 transition-transform ${isAdSetExpanded ? 'rotate-90' : ''}`} />
                                                        <span className="text-sm font-bold">{set.name}</span>
                                                        <Badge variant="outline" className="text-[9px] uppercase">{set.status}</Badge>
                                                      </div>
                                                      <div className="flex items-center space-x-4">
                                                        <div className="text-right flex items-center space-x-2">
                                                          <div className="flex flex-col text-right">
                                                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">Daily Budget</p>
                                                            <div className="flex items-center group/budget">
                                                              <span className="text-xs font-bold mr-1">{selectedAdAccount.currency}</span>
                                                              <input
                                                                type="number"
                                                                defaultValue={(set.daily_budget || 0) / 100}
                                                                className="w-16 h-6 text-xs font-bold bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none focus:bg-white px-1"
                                                                onBlur={(e) => {
                                                                  const val = parseFloat(e.target.value);
                                                                  if (!isNaN(val)) handleUpdateBudget(set.id, val);
                                                                }}
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(set.id, set.status); }} title="Toggle Status">
                                                            {set.status === 'ACTIVE' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                                          </Button>
                                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteObject(set.id, 'Ad Set'); }} title="Delete Ad Set">
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {isAdSetExpanded && (
                                                      <div className="bg-slate-50 border-t p-3">
                                                        <div className="flex items-center justify-between mb-2 pl-6">
                                                          <h5 className="text-[10px] font-bold uppercase text-slate-400">Active Ads</h5>
                                                          <Dialog open={isCreateAdDialogOpen} onOpenChange={setIsCreateAdDialogOpen}>
                                                            <DialogTrigger asChild>
                                                              <Button size="sm" variant="ghost" className="h-6 text-[9px] font-bold text-blue-600">
                                                                <Plus className="h-2.5 w-2.5 mr-1" /> New Ad
                                                              </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                              <DialogHeader><DialogTitle>Quick Create Ad</DialogTitle></DialogHeader>
                                                              <div className="py-4 space-y-4">
                                                                <div className="space-y-2">
                                                                  <Label>Ad Name</Label>
                                                                  <Input value={newAdName} onChange={(e) => setNewAdName(e.target.value)} placeholder="e.g. 20% Off Promo" />
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label>Facebook Page</Label>
                                                                  <Select value={selectedAdPageId} onValueChange={setSelectedAdPageId}>
                                                                    <SelectTrigger>
                                                                      <SelectValue placeholder="Select Page" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                      {pages.map(p => (
                                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                      ))}
                                                                    </SelectContent>
                                                                  </Select>
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label>Lead Form</Label>
                                                                  <Select
                                                                    value={selectedAdFormId}
                                                                    onValueChange={setSelectedAdFormId}
                                                                    disabled={isLoadingAdCreationForms || adCreationForms.length === 0}
                                                                  >
                                                                    <SelectTrigger>
                                                                      <SelectValue placeholder={isLoadingAdCreationForms ? "Loading forms..." : "Select Form"} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                      {adCreationForms.map(f => (
                                                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                                      ))}
                                                                    </SelectContent>
                                                                  </Select>
                                                                  {adCreationForms.length === 0 && !isLoadingAdCreationForms && selectedAdPageId && (
                                                                    <p className="text-[10px] text-red-500 font-bold">No forms found for this page. Please create one in 'Pages & Leads' tab.</p>
                                                                  )}
                                                                </div>

                                                                <p className="text-[10px] text-muted-foreground border-t pt-2">This will create a lead ad using high-quality placeholder creative.</p>
                                                              </div>
                                                              <DialogFooter>
                                                                <Button onClick={handleCreateAd} disabled={isCreatingAd || !newAdName || !selectedAdFormId}>
                                                                  {isCreatingAd && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                                                  Create Ad
                                                                </Button>
                                                              </DialogFooter>
                                                            </DialogContent>
                                                          </Dialog>
                                                        </div>
                                                        {isLoadingSpecificAds ? (
                                                          <div className="flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                                        ) : ads.length > 0 ? (
                                                          <div className="pl-6 space-y-2">
                                                            {ads.map((ad) => (
                                                              <div key={ad.id} className="flex items-center justify-between bg-white p-2 rounded border shadow-xs">
                                                                <div className="flex items-center space-x-2">
                                                                  <div className="h-6 w-6 bg-slate-100 rounded flex items-center justify-center">
                                                                    <FileText className="h-3 w-3 text-slate-400" />
                                                                  </div>
                                                                  <span className="text-xs font-semibold">{ad.name}</span>
                                                                  <Badge variant="outline" className="text-[8px] h-4">{ad.status}</Badge>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-500" onClick={() => handleUpdateStatus(ad.id, ad.status)} title="Toggle Status">
                                                                    {ad.status === 'ACTIVE' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                                                  </Button>
                                                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => handleDeleteObject(ad.id, 'Ad')} title="Delete Ad">
                                                                    <Trash2 className="h-3 w-3" />
                                                                  </Button>
                                                                </div>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ) : (
                                                          <p className="text-[10px] text-center text-muted-foreground">No ads in this set</p>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-center text-muted-foreground border-dashed border-2 p-4 rounded-xl">No Ad Sets found for this campaign.</p>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                                No campaigns found for this ad account
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="h-[500px] border-dashed border-2 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
                  <TrendingUp className="h-16 w-16 text-slate-200 mb-4" />
                  <h3 className="text-xl font-bold text-slate-400">Select an Ad Account</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm"> Choose an account from the sidebar to view your campaign performance and manage statuses.</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-none shadow-md bg-white dark:bg-slate-900 h-fit flex flex-col max-h-[500px]">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" /> Ad Accounts
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{adAccounts.length}</Badge>
                </CardTitle>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={adAccountSearch}
                    onChange={(e) => setAdAccountSearch(e.target.value)}
                    className="pl-9 h-9 bg-slate-50 border-none shadow-none text-xs focus-visible:ring-blue-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-grow bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adAccounts
                    .filter(acc =>
                      acc.name?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                      acc.id?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                      acc.business?.name?.toLowerCase().includes(adAccountSearch.toLowerCase())
                    )
                    .map((acc) => {
                      const statusMap: Record<number, { text: string, color: string }> = {
                        1: { text: 'Active', color: 'bg-green-100 text-green-700' },
                        2: { text: 'Disabled', color: 'bg-red-100 text-red-700' },
                        3: { text: 'Unsettled', color: 'bg-amber-100 text-amber-700' },
                        7: { text: 'Pending Review', color: 'bg-blue-100 text-blue-700' },
                        8: { text: 'Pending Settlement', color: 'bg-blue-100 text-blue-700' },
                        9: { text: 'In Grace Period', color: 'bg-blue-100 text-blue-700' },
                        100: { text: 'Pending Closure', color: 'bg-slate-100 text-slate-700' },
                        101: { text: 'Closed', color: 'bg-slate-100 text-slate-700' },
                      };
                      const status = statusMap[acc.account_status] || { text: 'Unknown', color: 'bg-slate-100 text-slate-700' };
                      const businessName = acc.business?.name || 'Personal Account';

                      return (
                        <button
                          key={acc.id}
                          onClick={() => { setSelectedAdAccount(acc); loadCreatives(acc.id); }}
                          className={`w-full p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedAdAccount?.id === acc.id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-r-4 border-blue-500 shadow-sm' : ''} ${acc.account_status !== 1 ? 'opacity-70' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm truncate flex-1">{acc.name}</p>
                            <Badge className={`text-[9px] px-1 h-3.5 leading-none ${status.color}`} variant="outline">
                              {status.text}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                              {businessName}
                            </p>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{acc.currency}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{acc.id}</p>
                        </button>
                      );
                    })}
                  {adAccounts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">No ad accounts found</div>
                  ) || adAccounts.filter(acc =>
                    acc.name?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                    acc.id?.toLowerCase().includes(adAccountSearch.toLowerCase()) ||
                    acc.business?.name?.toLowerCase().includes(adAccountSearch.toLowerCase())
                  ).length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm">No accounts match search</div>
                    )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ad Creatives Library</CardTitle>
                    <CardDescription>Reusable visual and text components for your ads</CardDescription>
                  </div>
                  <Dialog open={isCreateCreativeDialogOpen} onOpenChange={setIsCreateCreativeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700" disabled={!selectedAdAccount}>
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
                          <Label>Default Message</Label>
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
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                    <Briefcase className="h-10 w-10 mb-4 opacity-10" />
                    Select an Ad Account on the left to load its creatives
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
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm truncate" title={c.name}>{c.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono tracking-tighter">CREATIVE ID: {c.id}</p>
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
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="sm:max-w-md border-red-100 bg-red-50/10 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-red-600 mb-2">
              <AlertCircle className="h-6 w-6" />
              <DialogTitle className="text-xl font-black">{lastError?.title || "Meta Error"}</DialogTitle>
            </div>
            <DialogDescription className="text-slate-700 dark:text-slate-300 font-medium text-base">
              {lastError?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-red-100/50 mt-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">What to do:</h4>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {lastError?.action || "Check your internet connection and try again."}
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsErrorDialogOpen(false)}
              className="w-full sm:w-auto font-bold border-red-200 hover:bg-red-100 text-red-700 transition-all"
            >
              Understand & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


