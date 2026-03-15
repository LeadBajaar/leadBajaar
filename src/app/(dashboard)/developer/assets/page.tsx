"use client"

import React from 'react'
import {
    Database,
    Terminal,
    Code2,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    Building2,
    ArrowRight,
    Briefcase,
    Users,
    Key,
    RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AssetDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const businessAssetJson = `{
  "id": "BUSINESS_ID",
  "name": "Acme Marketing Agency",
  "vertical": "ADVERTISING_AGENCY",
  "owned_ad_accounts": {
    "data": [
      { "id": "act_123456", "name": "Ad Account A", "account_status": 1 },
      { "id": "act_789012", "name": "Ad Account B", "account_status": 2 }
    ]
  }
}`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 border border-emerald-500">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Asset & Account Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Deep hierarchy control via Business Asset API.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="business" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Business Assets</TabsTrigger>
                            <TabsTrigger value="auth" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">OAuth & Tokens</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 font-medium font-medium">
                                    LeadBajaar organizes Meta assets into a three-tier hierarchy: **Business Manager → Ad Account → Page.**
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                                            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest leading-none">Business IDs</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Identify agency-owned vs. client-owned assets.</p>
                                    </div>
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest leading-none">Role Checks</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Verifies Admin status before allowing pixel creation.</p>
                                    </div>
                                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center border border-violet-100 dark:border-violet-900">
                                            <RefreshCw className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-widest leading-none">Discovery</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Syncs sub-assets instantly upon OAuth connection.</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="business" className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Direct Business Query</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Query specific Business Managers to retrieve all linked ad accounts. Critical for multi-client agency setups.</p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none uppercase font-black text-[10px] tracking-widest px-2 py-0.5">GET</Badge>
                                        <span className="text-xs font-mono text-slate-500">/{"{business_id}"}/owned_ad_accounts</span>
                                    </div>
                                    <pre className="text-xs text-indigo-200 leading-relaxed font-mono overflow-x-auto">{businessAssetJson}</pre>
                                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(businessAssetJson)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="auth" className="mt-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-indigo-500" />
                                    OAuth Token Architecture
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">1. Token Upgrade</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                            The CRM exchanges the user’s short-lived code (2 hours) for a **Long-Lived System Token** (60 days).
                                        </p>
                                    </Card>
                                    <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">2. Page Tokens</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                            Each retrieved Page is associated with its own **Permanent Page Access Token** for background processing.
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-emerald-600 p-8 space-y-6 border-none text-white shadow-xl shadow-emerald-100">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-200" />
                            Critical Notes
                        </h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex gap-3 text-sm text-emerald-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Scope Verification:** Ensure <code>business_management</code> scope is requested during OAuth.
                            </li>
                            <li className="flex gap-3 text-sm text-emerald-50">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                                **Encryption:** All tokens are AES-256 encrypted before storage in the <code>integrations</code> table.
                            </li>
                            <li className="flex gap-3 text-sm text-emerald-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Account Status:** Ad Accounts with status <code>DISABLED (2)</code> cannot be used for pixel creation.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <Database className="w-24 h-24 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Hierarchy Snapshot</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Validating connection hierarchy for active user.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>BM Managed</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">128 assets</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Ad Accounts</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono">42 active</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-1/2 bg-blue-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
