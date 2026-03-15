"use client"

import React from 'react'
import {
    Zap,
    Terminal,
    Code2,
    ZapIcon,
    ShieldCheck,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    Play,
    ArrowRight,
    Monitor,
    Video,
    MousePointer2
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AdsDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const duplicationCode = `// POST /api/meta/ads/campaigns/{id}/duplicate
{
  "status": "success",
  "new_campaign_id": "9988776655",
  "message": "Campaign duplicated into 1 copy."
}`

    const ruleCode = `// Automated Rule Logic
{
  "name": "Pause High CPL AdSets",
  "evaluation_spec": {
    "evaluation_type": "SCHEDULE",
    "filters": [
      { "field": "cost_per_lead", "value": 1000, "operator": "GREATER_THAN" }
    ]
  },
  "execution_spec": { "execution_type": "PAUSE" }
}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-950/40 border border-orange-500">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Advanced Ad Operations</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Campaign duplication, automated rules, and delivery intelligence.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="duplication" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="duplication" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Duplication</TabsTrigger>
                            <TabsTrigger value="rules" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Auto-Rules</TabsTrigger>
                            <TabsTrigger value="creatives" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Creatives</TabsTrigger>
                            <TabsTrigger value="estimates" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Intelligence</TabsTrigger>
                        </TabsList>

                        <TabsContent value="duplication" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                    The Duplication API enables horizontal scaling by cloning entire campaign structures—including Ad Sets and Creatives—in a single call.
                                </p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto">{duplicationCode}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(duplicationCode)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="rules" className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Automated Rules (AdRules API)</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Configure bid triggers and safety nets to protect your budget during off-hours.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 font-black text-xs">1</div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest leading-none">Identify Metric</span>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 font-black text-xs">2</div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest leading-none">Set Trigger</span>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 font-black text-xs">3</div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest leading-none">Specify Action</span>
                                    </div>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <pre className="text-xs text-orange-200 leading-relaxed font-mono overflow-x-auto">{ruleCode}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(ruleCode)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="creatives" className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 mb-4 shadow-sm">
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-[0.2em] mb-2 leading-none">Ad Preview API</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Fetch real-time HTML/IFRAME renders of your ads directly from Meta.</p>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900 mb-4 shadow-sm">
                                    <Video className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-[0.2em] mb-2 leading-none">Media Upload</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Direct multipart upload for Images and Videos to the Media Library.</p>
                            </Card>
                        </TabsContent>

                        <TabsContent value="estimates" className="mt-8 space-y-6">
                            <div className="p-10 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ZapIcon className="w-40 h-40" />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-2xl font-black tracking-tight">Delivery Intelligence</h3>
                                    <p className="text-indigo-50 leading-relaxed font-medium max-w-xl">
                                        Predict performance before you launch. Our engine queries Meta's Audience Insights to provide real-time forecasting.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Est. Reach</span>
                                            <p className="text-2xl font-black font-mono">45k - 120k</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Est. Leads</span>
                                            <p className="text-2xl font-black font-mono">12 - 45</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Confidence</span>
                                            <p className="text-2xl font-black font-mono text-emerald-300">High</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-orange-600 p-8 space-y-6 border-none text-white shadow-xl shadow-orange-100 dark:shadow-orange-950/20">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-orange-200" />
                            Critical Notes
                        </h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex gap-3 text-sm text-orange-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Creative Specs:** Images &lt; 8MB and Videos &lt; 4GB with validated aspect ratios.
                            </li>
                            <li className="flex gap-3 text-sm text-orange-50">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                                **Rule Frequency:** Automated rules run every 15-30 minutes by default.
                            </li>
                            <li className="flex gap-3 text-sm text-orange-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Estimate Limits:** Estimates are illustrative—actual delivery depends on auction density.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <ZapIcon className="w-24 h-24 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Ops Velocity</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Tracking automation frequency and API throughput.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Duplicate Speed</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">1.2s avg</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Creative Sync</span>
                                    <span className="text-orange-600 dark:text-orange-400 font-mono">24/hr peak</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-orange-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
