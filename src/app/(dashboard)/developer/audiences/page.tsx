"use client"

import React from 'react'
import {
    BarChart3,
    Terminal,
    Code2,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    Users,
    ArrowRight,
    TrendingUp,
    Search,
    UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AudienceDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const customAudienceCode = `// POST /act_{ad_account_id}/customaudiences
{
  "name": "CRM Leads - Last 30 Days",
  "subtype": "CUSTOM",
  "description": "Synced via LeadBajaar",
  "customer_file_source": "USER_PROVIDED_ONLY_FOR_BUSINESS_MGMT"
}`

    const lookalikeCode = `// POST /act_{ad_account_id}/customaudiences
{
  "name": "Lookalike (IN, 1%) - Top Buyers",
  "subtype": "LOOKALIKE",
  "origin_audience_id": "99887766",
  "lookalike_spec": {
    "type": "similarity",
    "country": "IN",
    "ratio": 0.01
  }
}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 border border-indigo-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Audience Intelligence</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Custom Audiences, Lookalikes, and Audience Insights sync.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="custom" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="custom" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Custom Audiences</TabsTrigger>
                            <TabsTrigger value="lookalike" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Lookalikes</TabsTrigger>
                            <TabsTrigger value="sync" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">CRM Sync</TabsTrigger>
                            <TabsTrigger value="insights" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Insights</TabsTrigger>
                        </TabsList>

                        <TabsContent value="custom" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 font-medium font-medium">
                                    Retarget your CRM leads directly on Meta. Custom Audiences allow you to upload hashed customer data to create a specific target segment for your ads.
                                </p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto selection:bg-indigo-500/30">{customAudienceCode}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(customAudienceCode)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="lookalike" className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Scaling with Lookalikes</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Reach new people who are similar to your best customers. Lookalike Audiences use a "Seed" (Custom Audience) as their origin.</p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <pre className="text-xs text-emerald-300 leading-relaxed font-mono overflow-x-auto selection:bg-emerald-500/30">{lookalikeCode}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(lookalikeCode)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="sync" className="mt-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                    CRM Multi-Source Sync
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <Badge className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-none px-3 font-black text-[10px] tracking-widest uppercase mb-2">PULL</Badge>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100">Automated Upload</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Job scheduler automatically hashes and uploads new CRM leads to Meta every 24 hours.</p>
                                    </Card>
                                    <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-rose-200 dark:hover:border-rose-700 transition-all">
                                        <Badge className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-none px-3 font-black text-[10px] tracking-widest uppercase mb-2">PUSH</Badge>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100">Opt-Out Handling</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">If a lead is marked as "Spam", they are instantly removed from all active Meta audiences.</p>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="insights" className="mt-8 space-y-6">
                            <div className="p-10 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 text-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                                <div className="relative z-10 space-y-4 max-w-xl mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 border border-white/30">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-2xl font-black tracking-tight">Advanced Demographic Mining</h4>
                                    <p className="text-indigo-50 leading-relaxed font-medium">Discover which user segments have the highest conversion rates directly within the LeadBajaar dashboard using the Insights API.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-indigo-600 p-8 space-y-6 border-none text-white shadow-xl shadow-indigo-100">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-200" />
                            Critical Notes
                        </h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex gap-3 text-sm text-indigo-50">
                                <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                                **PII Policy:** Always ensure you have user consent before uploading data to Meta for retargeting.
                            </li>
                            <li className="flex gap-3 text-sm text-indigo-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Audience Size:** Custom Audiences require a minimum of **100 matched users** for delivery.
                            </li>
                            <li className="flex gap-3 text-sm text-indigo-50">
                                <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                                **Auto-Expansion:** Lookalikes automatically expand as the seed audience data changes.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <UserPlus className="w-24 h-24 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sync Intelligence</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Optimizing audience matching algorithms.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Match Accuracy</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">92%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>DAILY SYNC</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-mono">15.4k leads</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-indigo-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
