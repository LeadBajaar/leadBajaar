"use client"

import React from 'react'
import {
    FileCheck2,
    ArrowLeft,
    ShieldCheck,
    Zap,
    Target,
    Database,
    BarChart3,
    Terminal,
    Search,
    Code2,
    CheckCircle2,
    AlertCircle,
    Clock,
    LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const verificationData = [
    { id: 1, api: "Custom Audiences", endpoint: "POST /act_{id}/customaudiences", status: "✅", priority: "🔴", implementation: "MetaAdsController::createCustomAudience()" },
    { id: 2, api: "Lookalike Audiences", endpoint: "POST /act_{id}/customaudiences", status: "✅", priority: "🟡", implementation: "MetaAdsController::createLookalikeAudience()" },
    { id: 3, api: "Offline Conversions", endpoint: "POST /{offline_set_id}/events", status: "✅", priority: "🟡", implementation: "MetaService::uploadOfflineConversion()" },
    { id: 4, api: "Ad Insights", endpoint: "GET /act_{id}/insights", status: "✅", priority: "🔴", implementation: "MetaAdsController::getInsights()" },
    { id: 5, api: "Ad Creative Library", endpoint: "GET /act_{id}/adcreatives", status: "✅", priority: "🔴", implementation: "MetaAdsController::getAdCreatives()" },
    { id: "6a", api: "Image Upload", endpoint: "POST /act_{id}/adimages", status: "✅", priority: "🟡", implementation: "MetaAdsController::uploadAdImage()" },
    { id: "6b", api: "Video Upload", endpoint: "POST /act_{id}/advideos", status: "✅", priority: "🟡", implementation: "MetaAdsController::uploadAdVideo()" },
    { id: 7, api: "Lead Form Management", endpoint: "POST /{page_id}/leadgen_forms", status: "✅", priority: "🔴", implementation: "createLeadForm() + updateFormStatus()" },
    { id: 8, api: "Lead Retrieval", endpoint: "GET /{leadgen_id}", status: "✅", priority: "🔴", implementation: "FacebookApiService::getLeadFormData()" },
    { id: 9, api: "Ad Account Details", endpoint: "GET /act_{id}", status: "✅", priority: "🔴", implementation: "MetaAdsController::getAdAccounts()" },
    { id: 10, api: "Campaign Duplication", endpoint: "POST /{id}/copies", status: "✅", priority: "🟡", implementation: "MetaService::duplicateCampaign()" },
    { id: 11, api: "Automated Rules", endpoint: "POST /act_{id}/adrules_library", status: "✅", priority: "🟢", implementation: "MetaService::createAutomatedRule()" },
    { id: 12, api: "Business Asset API", endpoint: "GET /{id}/owned_ad_accounts", status: "✅", priority: "🟡", implementation: "MetaAdsController::getBusinessAdAccounts()" },
    { id: 13, api: "Page API", endpoint: "GET /me/accounts", status: "✅", priority: "🔴", implementation: "FacebookApiService::getUserPages()" },
    { id: 14, api: "Instagram API", endpoint: "GET /{page_id}?fields=ig_account", status: "✅", priority: "🟡", implementation: "getInstagramBusinessAccounts()" },
    { id: 15, api: "Ad Preview API", endpoint: "GET /{ad_id}/previews", status: "✅", priority: "🟡", implementation: "MetaAdsController::getAdPreview()" },
    { id: 16, api: "CAPI Implementation", endpoint: "POST /{pixel_id}/events", status: "✅", priority: "🔴", implementation: "FacebookConversionApiService ✓" },
    { id: 17, api: "Event Diagnostics", endpoint: "GET /{pixel_id}/diagnostics", status: "✅", priority: "🟡", implementation: "MetaPixelController::getDiagnostics()" },
    { id: 18, api: "Delivery Estimates", endpoint: "GET /act_{id}/delivery_estimate", status: "✅", priority: "🟢", implementation: "MetaAdsController::getDeliveryEstimate()" },
]

export default function VerificationReportPage() {
    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-10 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200 border border-slate-800">
                                <FileCheck2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Meta API Verification</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Compliance audit & platform implementation report.</p>
                            </div>
                        </div>
                    </div>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-6 shadow-sm rounded-2xl">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Status</p>
                            <Badge className="bg-emerald-500 text-white border-none py-1 px-4 font-black">100% COMPLETE</Badge>
                        </div>
                        <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Generated</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">March 11, 2026</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Endpoints", value: "18", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Critical Priority", value: "8", icon: Zap, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Deduplication", value: "Active", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "API Version", value: "v25.0", icon: Terminal, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex items-center gap-4 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} dark:bg-opacity-20 ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Table */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[2rem] overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Verification Matrix</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Detailed audit of controller-to-endpoint mapping.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/80">
                            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                <TableHead className="w-12 font-black text-slate-400 dark:text-slate-600 text-center">#</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-200">Module / API Name</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-200">Meta Edge / Endpoint</TableHead>
                                <TableHead className="text-center font-bold text-slate-900 dark:text-slate-200">Priority</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-200">Backend Implementation</TableHead>
                                <TableHead className="text-center font-bold text-slate-900 dark:text-slate-200">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {verificationData.map((row) => (
                                <TableRow key={row.id} className="border-slate-50 dark:border-slate-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                    <TableCell className="text-center font-mono text-xs text-slate-400 dark:text-slate-600">{row.id}</TableCell>
                                    <TableCell>
                                        <div className="font-black text-slate-900 dark:text-slate-200">{row.api}</div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-mono">{row.endpoint}</code>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-lg" title={row.priority === "🔴" ? "Critical" : row.priority === "🟡" ? "Important" : "Standard"}>
                                            {row.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                            <Code2 className="w-3 h-3 text-indigo-400 dark:text-indigo-600" />
                                            {row.implementation}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-emerald-500 text-lg">
                                        {row.status}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Implementation Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <Card className="lg:col-span-2 bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <LayoutDashboard className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-2xl font-black tracking-tight">System Foundation</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                            The LeadBajaar Meta Bridge architecture is designed for multi-tenant scalability. It utilizes a unified <code className="text-indigo-400">MetaService</code> pattern, ensuring that permission refreshes, token upgrades, and API retries are handled consistently across all 18 integration points.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Security Layer</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">AES-256-GCM encryption for Page and System tokens in the <code className="text-slate-300">integrations</code> table.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Reliability Layer</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Exponential backoff for Graph API rate limits (Error 17) and automatic retry on network timeouts.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 space-y-6 rounded-3xl shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Next Steps
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <AlertCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <strong className="text-slate-900 dark:text-slate-200 block mb-1">Webhooks Health</strong>
                                    Monitor leadgen event latency over the next 48h to ensure &lt; 2s processing.
                                </p>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <strong className="text-slate-900 dark:text-slate-200 block mb-1">App Review</strong>
                                    All requested scopes are verified. Ready for submission to Meta App Review Live mode.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
