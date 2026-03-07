'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'
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
  const [isCreateFormDialogOpen, setIsCreateFormDialogOpen] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [setupChecklist, setSetupChecklist] = useState<any>(null)
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
  }, [])

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
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdAccounts = async () => {
    try {
      const response = await integrationApi.getMetaAdAccounts()
      if (response.status === 'success') {
        setAdAccounts(response.ad_accounts || [])
      }
    } catch (error: any) {
      console.error('Failed to load ad accounts:', error)
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
  const handleManualSyncAssets = async () => {
    setIsSyncingAssets(true)
    try {
      const response = await integrationApi.syncMetaAssets()
      setIsSyncingAssets(false)

      setTimeout(() => {
        toast({
          title: "Assets Synced",
          description: response.message || "Ad accounts, campaigns, and ad sets updated."
        })
      }, 100);

      loadPages()
      loadAdAccounts()
    } catch (error: any) {
      setIsSyncingAssets(false)
      setTimeout(() => {
        toast({
          title: "Sync Failed",
          description: error.message,
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

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      const response = await integrationApi.updateMetaStatus(id, newStatus as any)
      if (response.status === 'success') {
        toast({ title: "Status Updated", description: `Campaign is now ${newStatus}` })
        if (selectedAdAccount) loadCampaigns(selectedAdAccount.id)
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" })
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
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      })
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
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      })
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
      toast({ title: "Launch Failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLaunchingTemplate(false)
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

  const handleUpdateBudget = async (adSetId: string, newBudget: number) => {
    try {
      const response = await integrationApi.updateMetaAdSet(adSetId, { daily_budget: newBudget * 100 }) // Facebook cents
      if (response.status === 'success') {
        toast({ title: "Budget Updated", description: "Ad Set budget adjusted successfully." })
        if (selectedCampaign) loadAdSets(selectedCampaign)
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 max-w-md">
          <TabsTrigger value="pages" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Pages & Leads</span>
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Ads Manager</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Ad Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-6">


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

        <TabsContent value="ads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Ad Accounts Sidebar */}
            <Card className="lg:col-span-1 border-none shadow-md bg-white dark:bg-slate-900 h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" /> Ad Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => { setSelectedAdAccount(acc); loadCampaigns(acc.id); }}
                      className={`w-full p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedAdAccount?.id === acc.id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-r-4 border-blue-500 shadow-sm' : ''}`}
                    >
                      <p className="font-bold text-sm truncate">{acc.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1 h-4 font-mono">{acc.currency}</Badge>
                        <span className="text-[10px] text-muted-foreground uppercase">{acc.id}</span>
                      </div>
                    </button>
                  ))}
                  {adAccounts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">No ad accounts found</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ads Explorer Area */}
            <div className="lg:col-span-3 space-y-6">
              {selectedAdAccount ? (
                <>
                  {/* Insights Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm bg-blue-600 text-white">
                      <CardContent className="p-4">
                        <p className="text-xs opacity-80 uppercase font-bold">Total Spend (Last 30d)</p>
                        <h3 className="text-2xl font-black mt-1">
                          {selectedAdAccount.currency} {insights.reduce((sum, i) => sum + parseFloat(i.spend), 0).toFixed(2)}
                        </h3>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Total Impressions</p>
                        <h3 className="text-2xl font-black mt-1">
                          {insights.reduce((sum, i) => sum + parseInt(i.impressions), 0).toLocaleString()}
                        </h3>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Clicks</p>
                        <h3 className="text-2xl font-black mt-1">
                          {insights.reduce((sum, i) => sum + parseInt(i.clicks), 0).toLocaleString()}
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
                      <div className="flex items-center space-x-2">
                        <Dialog open={isCreateCampaignDialogOpen} onOpenChange={setIsCreateCampaignDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="h-4 w-4 mr-1" />
                              Create Campaign
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
                            <TableHead className="font-bold text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingAds ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-40 text-center text-muted-foreground bg-slate-50/50">
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
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${camp.status === 'ACTIVE' ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}`}
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(camp.id, camp.status); }}
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>

                                  {isExpanded && (
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                      <TableCell colSpan={6} className="p-0 border-b border-blue-100 dark:border-blue-900/30">
                                        <div className="pl-12 pr-4 py-4 space-y-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Ad Sets in this Campaign</h4>
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
                                                                defaultValue={set.daily_budget / 100}
                                                                className="w-16 h-6 text-xs font-bold bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none focus:bg-white px-1"
                                                                onBlur={(e) => handleUpdateBudget(set.id, parseFloat(e.target.value))}
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(set.id, set.status); }}>
                                                          <RefreshCw className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>

                                                    {isAdSetExpanded && (
                                                      <div className="bg-slate-50 border-t p-3">
                                                        <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2 pl-6">Active Ads</h5>
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
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateStatus(ad.id, ad.status)}>
                                                                  <RefreshCw className="h-3 w-3" />
                                                                </Button>
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
                              <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
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

        <TabsContent value="templates" className="space-y-6">
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
      </Tabs>
    </div>
  )
}


