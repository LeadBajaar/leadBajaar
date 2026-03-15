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
    ArrowRight
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

    const backendCode = `// Laravel Endpoint: POST /api/tracking/event
// Hashes PII via SHA-256 automatically
{
  "pixel_id": "123456789",
  "event_name": "Purchase",
  "event_id": "lb_xyz_123",
  "user_data": { 
    "email": "user@email.com", 
    "phone": "91987..." 
  },
  "custom_data": { "value": 999, "currency": "INR" }
}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 border border-indigo-500">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Pixel & CAPI Intelligence</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Hybrid tracking implementation with real-time diagnostics.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="architecture" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="architecture" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Architecture</TabsTrigger>
                            <TabsTrigger value="setup" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Setup Guide</TabsTrigger>
                            <TabsTrigger value="usecases" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Use Cases</TabsTrigger>
                            <TabsTrigger value="api" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">API Ref</TabsTrigger>
                        </TabsList>

                        <TabsContent value="architecture" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 font-medium font-medium">
                                    LeadBajaar implements a **Hybrid Tracking** model. Every client-side event is simultaneously sent to Meta via the browser (<code>fbq</code>) and our CRM server (<code>API Gateway</code>), ensuring 100% data fidelity even when ad-blockers are active.
                                </p>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 py-8 space-y-6 overflow-hidden shadow-sm">
                                    <div className="flex items-center justify-between font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <span>Event Source</span>
                                        <span>Deduplication</span>
                                        <span>Destination</span>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-full md:w-40 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-center font-bold text-sm shadow-sm shadow-indigo-50 dark:shadow-none">Browser Pixel</div>
                                            <ArrowRight className="text-slate-300 dark:text-slate-700 hidden md:block" />
                                            <div className="flex-1 w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center font-mono text-xs italic border border-slate-100 dark:border-slate-700">event_id: "lb_123"</div>
                                            <ArrowRight className="text-slate-300 dark:text-slate-700 hidden md:block" />
                                            <div className="w-full md:w-40 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-center font-bold text-sm shadow-sm shadow-emerald-50 dark:shadow-none">Meta Events Mgr</div>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-full md:w-40 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900 text-violet-600 dark:text-violet-400 text-center font-bold text-sm shadow-sm shadow-violet-50 dark:shadow-none">CAPI Bridge</div>
                                            <ArrowRight className="text-slate-300 dark:text-slate-700 hidden md:block" />
                                            <div className="flex-1 w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center font-mono text-xs italic border border-slate-100 dark:border-slate-700">event_id: "lb_123"</div>
                                            <ArrowRight className="text-slate-300 dark:text-slate-700 hidden md:block" />
                                            <div className="w-full md:w-40 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-center font-bold text-sm shadow-sm shadow-emerald-50 dark:shadow-none">Meta API</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="setup" className="mt-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-indigo-500" />
                                    Implementation Wizard
                                </h3>
                                <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-12 pb-4">
                                    <li className="ml-10">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full -left-[17px] ring-8 ring-slate-50 dark:ring-slate-950 text-xs font-bold text-white shadow-lg">1</span>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">Initialize the Bridge</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">Paste the LeadBajaar Tracking script in your <code>&lt;head&gt;</code>. This script initializes both <code>fbq</code> and the <code>lbTrack</code> function.</p>
                                        <Link href="/integrations" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold underline transition-all group">
                                            Generate Script <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </li>
                                    <li className="ml-10">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full -left-[17px] ring-8 ring-slate-50 dark:ring-slate-950 text-xs font-bold text-white shadow-lg">2</span>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">Track Conversions</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">Replace standard <code>fbq('track')</code> with <code>lbTrack()</code>. This ensures server-to-server redundancy.</p>
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                            <div className="absolute top-0 right-0 p-3 flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto selection:bg-indigo-500/30">{trackCode}</pre>
                                            <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(trackCode)}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </li>
                                    <li className="ml-10">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full -left-[17px] ring-8 ring-slate-50 dark:ring-slate-950 text-xs font-bold text-white shadow-lg">3</span>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">Verify Health</h4>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Navigate to the **Diagnostics Tab** to check for "Missing Parameters" or "Match Quality" warnings from Meta.</p>
                                    </li>
                                </ol>
                            </div>
                        </TabsContent>

                        <TabsContent value="usecases" className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-100 dark:border-amber-900">
                                        <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Cross-Device Retargeting</h4>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    By sending hashed emails via CAPI, Meta can match users across devices even if cookies are blocked on their smartphone.
                                </p>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                                        <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Full-Funnel ROI</h4>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Automatically fires a **Purchase** event to Meta when a lead in your CRM is moved to the **"Won"** stage — linking ad spend to actual revenue.
                                </p>
                            </Card>
                        </TabsContent>

                        <TabsContent value="api" className="mt-8 space-y-6">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none uppercase font-black text-[10px] tracking-widest px-2 py-0.5">POST</Badge>
                                    <span className="text-xs font-mono text-slate-500">/api/tracking/event</span>
                                </div>
                                <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto">{backendCode}</pre>
                                <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(backendCode)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
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
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm font-medium text-indigo-50">
                                <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                                PII must be hashed using **SHA-256** before sending to Meta. Our backend handler does this automatically.
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-indigo-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **event_id** must match identically between browser pixel and CAPI call for deduplication.
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-indigo-50">
                                <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0 mt-0.5" />
                                Use the **Diagnostics Tab** to verify. Meta feedback has a 20-30 minute delay.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <Activity className="w-24 h-24 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Health Monitor</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Monitoring 18 integration endpoints. All systems functional.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>CAPI Latency</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">142ms</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-4/5 bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>EMQ Score</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-mono">8.4 / 10</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[84%] bg-indigo-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm shadow-indigo-50">
                            <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">SDK Download</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Get the pre-built Meta Integration kit for React, Vue, or PHP. Includes authentication helpers.
                        </p>
                        <Button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-bold shadow-sm transition-all">
                            Coming Soon
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
