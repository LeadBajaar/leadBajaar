'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Send, ExternalLink, ShieldCheck, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { integrationApi } from '@/lib/api'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WebhookVerificationDialogProps {
  pageId: string
  pageName: string
}

export function WebhookVerificationDialog({ pageId, pageName }: WebhookVerificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState<any>(null)
  const [leadId, setLeadId] = useState('')
  const [testingLead, setTestingLead] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const loadChecklist = async () => {
    try {
      setLoading(true)
      const response = await integrationApi.getMetaWebhookChecklist(pageId)
      if (response.status === 'success') {
        setChecklist(response.checklist)
      }
    } catch (err: any) {
      toast.error('Verification Failed', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadChecklist()
    }
  }, [isOpen])

  const handleTestLead = async () => {
    if (!leadId) return
    try {
      setTestingLead(true)
      setTestResult(null)
      const response = await integrationApi.testMetaLeadRetrieval(leadId)
      if (response.status === 'success') {
        setTestResult(response.lead_data)
        toast.success("Round-Trip Success", { 
          description: "Successfully fetched lead data structures from Meta Graph API." 
        })
      }
    } catch (err: any) {
      toast.error("Retrieval Failed", { description: err.message })
    } finally {
      setTestingLead(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[11px] font-black uppercase text-blue-600 tracking-tight border-blue-200 bg-blue-50/50 hover:bg-blue-100">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Verify Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Webhook Troubleshooting & Verification
          </DialogTitle>
          <DialogDescription>
            Verify that your integration with "{pageName}" is correctly configured for real-time leads.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* 1. Permissions Check */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center justify-between">
                1. Permission & Token Check
                <Button variant="ghost" size="sm" onClick={loadChecklist} disabled={loading} className="h-6 w-6 p-0">
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </h3>
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking Meta Graph API...
                </div>
              ) : checklist ? (
                <div className="space-y-2">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${checklist.permissions.required_present ? 'bg-green-50/50 border-green-100' : 'bg-amber-50/50 border-amber-100'}`}>
                    <div className="flex items-center gap-2">
                      {checklist.permissions.required_present ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-xs font-semibold">Required Scopes Present</span>
                    </div>
                    {checklist.permissions.required_present ? (
                      <Badge className="bg-green-500 text-[10px]">VERIFIED</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px]">MISSING</Badge>
                    )}
                  </div>
                  {!checklist.permissions.required_present && (
                    <Alert variant="destructive" className="py-2 text-[11px]">
                      Your account is missing: {checklist.permissions.missing.join(', ')}. 
                      Please reconnect and grant all requested permissions.
                    </Alert>
                  )}
                </div>
              ) : null}
            </div>

            <Separator />

            {/* 2. Webhook Subscription */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold">2. Webhook Subscription Status</h3>
              {checklist && (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${checklist.subscription?.is_subscribed ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex items-center gap-2">
                    {checklist.subscription?.is_subscribed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <span className="text-xs font-semibold block">LeadGen Webhook</span>
                      <span className="text-[10px] text-muted-foreground">
                        {checklist.subscription?.is_subscribed ? 'Active and receiving leadgen field' : 'Subscription not active for this page'}
                      </span>
                    </div>
                  </div>
                  {checklist.subscription?.is_subscribed ? (
                    <Badge className="bg-green-500 text-[10px]">ACTIVE</Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold" onClick={async () => {
                      setLoading(true);
                      try {
                        await integrationApi.subscribeMetaPage(pageId);
                        toast.success("Subscribed Successfully");
                        loadChecklist();
                      } catch (e: any) {
                        toast.error(e.message);
                      } finally {
                        setLoading(false);
                      }
                    }}>
                      Fix Now
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* 3. Round-Trip Test */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold">3. Perform Round-Trip Data Retrieval</h3>
              <p className="text-[11px] text-muted-foreground">
                Testing a real Lead ID (e.g. from an Ad Preview) confirms that LeadBajaar can decode the payload 
                and fetch the full lead data from Meta Graph API.
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="Enter Lead ID (e.g. 123456789...)" 
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <Button 
                  size="sm" 
                  onClick={handleTestLead} 
                  disabled={!leadId || testingLead}
                  className="h-8 bg-black text-white"
                >
                  {testingLead ? <Loader2 className="h-3 w-3 animate-spin px-4" /> : 'Run Test'}
                </Button>
              </div>

              {testResult && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Lead Structure verified</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-[10px]">VALID</Badge>
                  </div>
                  <ScrollArea className="h-24">
                    <pre className="text-[9px] text-slate-600 dark:text-slate-400 font-mono">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>

            <Separator />

            {/* 4. Ad Preview Link */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Step 4: Real-world Submission
              </h3>
              <p className="text-[11px] text-blue-700">
                The most direct way to test is to submit a lead via Meta's <strong>Ad Preview</strong> system.
                Submit a lead from a preview and check "Managed Leads" in 2-3 minutes.
              </p>
              <Button variant="link" className="h-auto p-0 text-[11px] font-bold text-blue-600" asChild>
                <a href="https://developers.facebook.com/tools/lead-ads-testing" target="_blank" rel="noopener noreferrer">
                  Open Meta Lead Ads Testing Tool
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => setIsOpen(false)}>
            Close Verification Console
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
