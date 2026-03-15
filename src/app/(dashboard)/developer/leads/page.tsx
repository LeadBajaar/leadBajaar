"use client"

import React from 'react'
import {
    Settings,
    Terminal,
    Code2,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    Database,
    ArrowRight,
    Webhook,
    FileText,
    RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LeadDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const webhookJson = `{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "ad_id": "12345",
            "form_id": "67890",
            "leadgen_id": "ABC123DEF",
            "page_id": "PAGE_ID",
            "adgroup_id": "54321",
            "campaign_id": "09876",
            "created_time": 1710083200
          }
        }
      ]
    }
  ]
}`

    const leadRetrievalCode = `// GET /{leadgen-id}
{
  "created_time": "2024-03-10T00:00:00+0000",
  "id": "ABC123DEF",
  "ad_id": "12345",
  "form_id": "67890",
  "field_data": [
    { "name": "full_name", "values": ["John Doe"] },
    { "name": "email", "values": ["john@example.com"] },
    { "name": "phone_number", "values": ["+919876543210"] }
  ]
}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-950/40 border border-blue-500">
                        <Webhook className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Lead Capture & Retrieval</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time webhook processing and Graph API lead retrieval.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="webhooks" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Webhooks</TabsTrigger>
                            <TabsTrigger value="retrieval" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Retrieval</TabsTrigger>
                            <TabsTrigger value="forms" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Forms API</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                    The Lead Capture system ensures you never miss a lead. It primarily relies on **Meta Webhooks**, with a robust **Graph API Fallback** for historical retrieval and data reconciliation.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-100 dark:border-amber-900">
                                            <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest">Real-time</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Webhooks deliver leads in &lt; 2 seconds.</p>
                                    </div>
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                                            <RefreshCw className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest">Sync History</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Retrieve up to 90 days of missed leads.</p>
                                    </div>
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                                            <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest">Form Mapping</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Automatic schema detection for fields.</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="webhooks" className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Webhook Payload Schema</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Meta sends this payload to our <code>/api/meta/webhook</code> endpoint. We immediately extract the <code>leadgen_id</code> to fetch full details.</p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto">{webhookJson}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(webhookJson)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="retrieval" className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lead Data Normalization</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Once the <code>leadgen_id</code> is received, we call the Graph API to get detailing data. Our system normalizes phone numbers (e.g., stripping <code>+</code> or adding country codes) before saving.</p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <pre className="text-xs text-emerald-300 leading-relaxed font-mono overflow-x-auto">{leadRetrievalCode}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(leadRetrievalCode)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="forms" className="mt-8 space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Form Life-cycle</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                                    <Badge className="bg-emerald-500 text-white border-none uppercase font-black text-[10px] tracking-widest px-3 py-1">Active</Badge>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Forms currently accepting leads. Webhooks are auto-subscribed on creation via the CRM.</p>
                                </div>
                                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                                    <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none uppercase font-black text-[10px] tracking-widest px-3 py-1">Archived</Badge>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Archived forms stop receiving leads but retain historical data. Use the toggle to reactivate.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-blue-600 p-8 space-y-6 border-none text-white shadow-xl shadow-blue-100 dark:shadow-blue-950/20">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-200" />
                            Critical Notes
                        </h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex gap-3 text-sm text-blue-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Webhook Delay:** High-traffic pages may experience up to 5s delay. Use the Sync Dashboard for monitoring.
                            </li>
                            <li className="flex gap-3 text-sm text-blue-50">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                                **Leads Retrieval Permission:** Ensure your Meta App token has <code>leads_retrieval</code> granted.
                            </li>
                            <li className="flex gap-3 text-sm text-blue-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Form Expiry:** Meta only persists leads for **90 days**. LeadBajaar stores them indefinitely.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <Database className="w-24 h-24 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sync Status</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Monitoring sync jobs for all connected pages.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Queue Health</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% OK</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Avg Retrieval Time</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono">0.8s</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[90%] bg-blue-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
