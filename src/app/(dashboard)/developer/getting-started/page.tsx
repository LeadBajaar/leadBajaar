"use client"

import React from 'react'
import {
    Compass,
    Terminal,
    Code2,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    FileCode,
    ArrowRight,
    Rocket,
    Search,
    ZapIcon
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function GettingStartedDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const endpointCode = `// Fetch Active Ad Accounts
GET /api/meta/ads/accounts
Header: Authorization Bearer {YOUR_TOKEN}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 border border-indigo-500">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Getting Started</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Your 5-minute guide to mastering the LeadBajaar Meta Bridge.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 space-y-12">
                    {/* Section 1 */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 border-b-2 border-slate-100 dark:border-slate-800 pb-2">1. The Core Workflow</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-black text-xs">A</div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Connect via OAuth</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Use the Integrations panel to authorize LeadBajaar with your Meta Business Manager.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-black text-xs">B</div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Sync Assets</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">The CRM will automatically discover your Ad Accounts, Pages, and Forms.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 font-black text-xs">C</div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Enable Tracking</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Deploy the tracking script to start capturing leads and server-side events.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center border border-violet-100 dark:border-violet-900 text-violet-600 dark:text-violet-400 font-black text-xs">D</div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Automate Scaling</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Set duplication rules and audience sync jobs to grow your revenue.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 border-b-2 border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                            2. Authentication
                            <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 font-black text-[10px] tracking-widest uppercase py-1">Secure</Badge>
                        </h2>
                        <div className="p-10 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 p-8 opacity-10">
                                <ShieldCheck className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Bearer Token Access</h3>
                            <p className="text-indigo-50 leading-relaxed font-medium mb-8">
                                To use the LeadBajaar API programmatically, you must include your User Access Token in the Authorization header.
                            </p>
                            <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-indigo-950/50 p-6 backdrop-blur-sm">
                                <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto">{endpointCode}</pre>
                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/40 hover:text-white" onClick={() => copyToClipboard(endpointCode)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 - Technical Docs */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 border-b-2 border-slate-100 dark:border-slate-800 pb-2">3. Deep Implementation Docs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "API Verification Report", file: "/developer/report", desc: "Full audit of implemented vs target endpoints." },
                                { title: "CAPI Implementation", file: "META_PIXEL_CAPI_IMPLEMENTATION.md", desc: "Technical details of the Server-side tracking bridge." },
                                { title: "OAuth System Design", file: "META_OAUTH_IMPLEMENTATION_SYSTEM.md", desc: "How we manage tokens and system users." },
                                { title: "Pixel Verification", file: "META_PIXEL_VERIFICATION_REPORT.md", desc: "Validation check for tracking accuracy." },
                            ].map((doc, i) => (
                                <Link key={i} href={doc.file.startsWith('/') ? doc.file : `/docs/${doc.file}`} target="_blank" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 group transition-all shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{doc.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{doc.desc}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <Card className="bg-indigo-600 p-8 space-y-6 border-none text-white shadow-xl shadow-indigo-100">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <Compass className="w-5 h-5 text-indigo-200" />
                            Quick Start Tools
                        </h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                <p className="text-sm text-indigo-50">Generate your API Sandbox token in Account Settings.</p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                <p className="text-sm text-indigo-50">Use the Pixel Tester to send a dry-run event.</p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                <p className="text-sm text-indigo-50">Download our Postman collection for local testing.</p>
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <ZapIcon className="w-24 h-24 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Platform Power</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Current infrastructure benchmarks.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>API Uptime</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">99.98%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>P99 Real-time Latency</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono">84ms</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[95%] bg-blue-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
