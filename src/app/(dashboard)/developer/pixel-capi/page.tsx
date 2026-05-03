"use client"

import React from 'react'
import {
    Target,
    Terminal,
    Code2,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    Activity,
    Package,
    ArrowRight,
    Users,
    Settings,
    Layers,
    BarChart3,
    Key,
    Webhook,
    RefreshCw,
    TrendingUp,
    Globe,
    UserCheck,
    DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function PixelDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const trackCode = `// LeadBajaar CAPI Bridge usage
lbTrack('Lead', {
  email: 'user@example.com',
  phone: '+919876543210'
}, {
  content_name: 'Summer Campaign',
  value: 500,
  currency: 'INR'
});`

    const payloadSpec = `{
  "data": [
    {
      "event_name": "Sales_Qualified_Lead",
      "event_time": 1664577963,
      "action_source": "system_generated",
      "user_data": {
        "lead_id": "1234567890123456", // 👈 Highest Priority
        "em": ["SHA256_HASHED_EMAIL"],
        "ph": ["SHA256_HASHED_PHONE"]
      },
      "custom_data": {
        "lead_event_source": "LeadBajaar CRM",
        "event_source": "crm",
        "currency": "INR",
        "value": 1500.00
      }
    }
  ]
}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-medium">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 border border-indigo-500">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">CAPI Intelligence Hub</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Powering Conversion Leads optimization via high-fidelity CRM feedback loops.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <Tabs defaultValue="architecture" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="architecture" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Architecture</TabsTrigger>
                            <TabsTrigger value="workflows" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">CRM Workflows</TabsTrigger>
                            <TabsTrigger value="advertiser" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Advertiser Setup</TabsTrigger>
                            <TabsTrigger value="developer" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Developer Guide</TabsTrigger>
                            <TabsTrigger value="api" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Payload Spec</TabsTrigger>
                        </TabsList>

                        <TabsContent value="architecture" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Hybrid Tracking & CRM Feedback</h2>
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                    LeadBajaar implements a **Hybrid Tracking** model. Every client-side event is simultaneously sent via the browser and our server. For CRM-based sales, we bridge the gap by sending "down-funnel" events (like Sales Qualified Lead or Won) directly to Meta, enabling their AI to optimize for **Conversion Leads**.
                                </p>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-8 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
                                        <div className="space-y-4">
                                            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-sm shadow-blue-50">
                                                <Users className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">Lead Ad Submission</div>
                                            <div className="text-xs text-slate-500 font-mono">Generates Lead ID</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <ArrowRight className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter">Matched via Lead ID</Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm shadow-indigo-50">
                                                <Layers className="w-8 h-8 text-indigo-600" />
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">CRM Conversion</div>
                                            <div className="text-xs text-slate-500 font-mono">Optimization: Conversion Leads</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm italic text-center font-medium">
                                        Goal: Achieve {'>'}60% Lead Coverage to unlock Funnel Analysis in Events Manager.
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="workflows" className="mt-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: "Lead Ads Bridge",
                                        desc: "100% accurate attribution. When a Meta Lead Ad is submitted, we capture the 15-digit Lead ID and immediately fire a CAPI Lead event back to Meta.",
                                        icon: Webhook,
                                        color: "blue"
                                    },
                                    {
                                        title: "Funnel Optimization",
                                        desc: "Trains Meta's AI to find quality. When you move a lead to 'Qualified' in CRM, we send an MQL/SQL event to Meta to optimize your delivery.",
                                        icon: TrendingUp,
                                        color: "emerald"
                                    },
                                    {
                                        title: "ROAS Mastery",
                                        desc: "See real revenue in Ads Manager. Moving a lead to 'Won' fires a Purchase event with actual deal value, linking ad spend to revenue.",
                                        icon: DollarSign,
                                        color: "amber"
                                    },
                                    {
                                        title: "Hybrid Security",
                                        desc: "Never lose a signal. Browser + Server events share IDs for perfect deduplication, ensuring tracking works even if browser cookies are blocked.",
                                        icon: Globe,
                                        color: "indigo"
                                    },
                                    {
                                        title: "Audience Power",
                                        desc: "High-precision retargeting. Using SHA-256 hashed emails/phones, Meta creates laser-focused lookalike audiences of your highest-paying customers.",
                                        icon: UserCheck,
                                        color: "violet"
                                    }
                                ].map((item, idx) => (
                                    <Card key={idx} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl transition-all group shadow-sm">
                                        <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-950/30 flex items-center justify-center border border-${item.color}-100 dark:border-${item.color}-900 mb-6 group-hover:scale-110 transition-transform shadow-sm shadow-${item.color}-50`}>
                                            <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-3">{item.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="advertiser" className="mt-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-indigo-500" />
                                    Meta Ads Manager Setup
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { title: "Create Leads Campaign", desc: "Select 'Leads' as the objective and 'Instant Forms' as the conversion location.", icon: BarChart3 },
                                        { title: "Enable Optimization", desc: "Under 'Optimization & Delivery', choose 'Conversion Leads' instead of 'Leads'.", icon: Zap },
                                        { title: "Create CRM Dataset", desc: "In Events Manager, create a new Dataset (Pixel) specifically for CRM events.", icon: Package },
                                        { title: "Share Pixel", desc: "Ensure your CRM Pixel is shared with the specific Ad Accounts running ads.", icon: ShieldCheck },
                                        { title: "Generate Access Token", desc: "Go to Pixel Settings > Conversions API > Generate Access Token.", icon: Key },
                                        { title: "Map Sales Funnel", desc: "Categorize and order your CRM stages in the Events Manager Funnel Builder.", icon: Layers }
                                    ].map((item, idx) => (
                                        <Card key={idx} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-indigo-500 transition-colors">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    <item.icon className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{item.title}</h4>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="developer" className="mt-8 space-y-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Webhook className="w-5 h-5 text-indigo-500" />
                                        Phase 1: Ingesting Leads
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm">
                                        Your CRM must capture the **15-17 digit Lead ID** from Meta Webhooks. This is the primary key for matching conversion events.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-indigo-500" />
                                        Phase 2: Sending Funnel Events
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm">
                                        Implement server-side calls for **every stage** transition in the sales funnel.
                                    </p>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                                            <CheckCircle2 className="w-3 h-3" /> Mandatory Parameters
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-mono">
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">action_source: "system_generated"</div>
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">event_source: "crm"</div>
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">lead_id: [15-17 digits]</div>
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">event_time: Unix Timestamp</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-indigo-500" />
                                        Phase 3: Verification & EMQ
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm">
                                        Aim for an **Event Match Quality (EMQ) score of 6.0+**. Improve this by sending multiple identifiers: `em` (hashed email), `ph` (hashed phone), and `fbc` (click ID).
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="api" className="mt-8 space-y-6">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none uppercase font-black text-[10px] tracking-widest px-2 py-0.5">CAPI JSON PAYLOAD</Badge>
                                    <span className="text-xs font-mono text-slate-500">endpoint: /v25.0/{"{pixel_id}"}/events</span>
                                </div>
                                <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto selection:bg-indigo-500/30">{payloadSpec}</pre>
                                <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(payloadSpec)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                    <h5 className="font-bold text-xs mb-2">Hashing Required</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Email (`em`) and Phone (`ph`) MUST be SHA-256 hashed before transmission.</p>
                                </Card>
                                <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                    <h5 className="font-bold text-xs mb-2">Batch Limit</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Up to 1,000 events per request. If one fails, the whole batch fails.</p>
                                </Card>
                                <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                    <h5 className="font-bold text-xs mb-2">Backfill Limit</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">You can send events up to 7 days old. Offline store events allow 62 days.</p>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-indigo-600 p-8 space-y-6 border-none text-white shadow-xl shadow-indigo-100">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-200" />
                            Critical Logic
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm font-medium text-indigo-50">
                                <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                                **Lead ID Retention**: Your CRM must preserve the 15-17 digit Lead ID throughout the entire lifecycle.
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-indigo-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Lead Coverage**: Meta needs events for at least 60% of the leads you download to start optimizing.
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-indigo-50">
                                <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                                **Full Funnel**: Send an event for EVERY stage transition, not just the final sale.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <Activity className="w-24 h-24 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight uppercase">Health Monitor</h3>
                        <div className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Lead Match Rate</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">92%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Funnel Analysis</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-mono">ENABLED</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-indigo-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 font-medium italic">Learning Phase: Graduation in 12 days.</p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
