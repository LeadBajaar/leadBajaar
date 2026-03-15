"use client"

import React from 'react'
import {
    Code2,
    Settings,
    Database,
    Target,
    BarChart3,
    Zap,
    ShieldCheck,
    ArrowRight,
    ExternalLink,
    BookOpen,
    Terminal,
    Server
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/RoleGuard'

const features = [
    {
        title: 'Asset & Account Management',
        description: 'Manage Business Managers, Ad Accounts, and Pages. Use the Business Asset API for deep hierarchy control.',
        icon: Database,
        href: '/developer/assets',
        color: 'emerald',
        badge: '100% Complete'
    },
    {
        title: 'Lead Capture & Retrieval',
        description: 'Configure webhooks, retrieve leads via Graph API, and manage LeadGen forms with active/archived status.',
        icon: Settings,
        href: '/developer/leads',
        color: 'blue',
        badge: 'v25.0 API'
    },
    {
        title: 'Pixel & CAPI Tracking',
        description: 'Hybrid tracking bridge (Browser + Server). Track offline conversions (Won/Closed) and monitor health.',
        icon: Target,
        href: '/developer/pixel-capi',
        color: 'violet',
        badge: 'Production Ready'
    },
    {
        title: 'Advanced Ad Ops',
        description: 'Duplicate campaigns, manage creatives library, and monitor delivery estimates for optimized reach.',
        icon: Zap,
        href: '/developer/ads',
        color: 'orange',
        badge: 'New'
    },
    {
        title: 'Audience Intelligence',
        description: 'Create Custom and Lookalike audiences for retargeting. Sync CRM leads back to Meta securely.',
        icon: BarChart3,
        href: '/developer/audiences',
        color: 'indigo',
        badge: 'High Priority'
    },
    {
        title: 'Security & Compliance',
        description: 'OAuth 2.0 flow, token lifecycle management, and GDPR-compliant SHA-256 PII hashing.',
        icon: ShieldCheck,
        href: '/developer/security',
        color: 'rose',
        badge: 'Certified'
    }
]

export default function DeveloperHubPage() {
    return (
        <RoleGuard allowedRoles={['Super Admin', 'Admin']}>
            <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-12 bg-slate-50 dark:bg-slate-950 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 lg:p-16 border border-indigo-500 shadow-2xl shadow-indigo-200 dark:shadow-indigo-950/50">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                    <div className="relative z-10 max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-50 text-xs font-bold uppercase tracking-widest">
                            <Terminal className="w-3 h-3" />
                            Developer Console v1.0
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                            Scale your <span className="text-indigo-100 ring-1 ring-white/20 px-4 rounded-3xl bg-white/5">Meta Architecture</span>
                        </h1>
                        <p className="text-lg text-indigo-50/80 leading-relaxed font-medium">
                            LeadBajaar's Developer Hub is your command center for Meta API integrations. Access deep asset management, hybrid conversion tracking, and automated ad operations in one place.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href="/developer/getting-started" className="px-6 py-3 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold transition-all shadow-xl shadow-black/10 flex items-center gap-2 group">
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/developer/report" className="px-6 py-3 rounded-2xl bg-indigo-700/50 hover:bg-indigo-700 border border-white/10 text-white font-bold transition-all flex items-center gap-2">
                                Implementation Report <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-indigo-500" />
                            Integration Modules
                        </h2>
                        <Badge variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 font-bold">18/18 API Slots Active</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <Link key={idx} href={feature.href}>
                                <Card className="group relative h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm">
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <CardHeader className="relative z-10 pb-2">
                                        <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${feature.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                                            feature.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' :
                                                feature.color === 'violet' ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400' :
                                                    feature.color === 'orange' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' :
                                                        feature.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' :
                                                            'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                                            }`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {feature.title}
                                            </CardTitle>
                                            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none text-[10px] uppercase font-bold px-2 py-0">
                                                {feature.badge}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-slate-500 dark:text-slate-400 pt-2 leading-relaxed font-medium">
                                            {feature.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative z-10 pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 mt-4">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Configure Module <ArrowRight className="w-3 h-3" />
                                        </span>
                                        <div className="h-1.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden group-hover:w-20 transition-all">
                                            <div className="h-full w-2/3 bg-indigo-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Notes / Developer Tips */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <Server className="w-5 h-5 text-emerald-500" />
                        Technical Implementation Notes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authentication & Tokens</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <strong className="text-slate-900 dark:text-slate-200">Long-Lived Tokens:</strong> All integrations automatically upgrade short-lived tokens to 60-day long-lived tokens via the oauth endpoints.
                                    </p>
                                </div>
                                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <strong className="text-slate-900 dark:text-slate-200">Token Refresh:</strong> Use the "Refresh Token" button if you encounter Error 190 (Token Expired) or permission changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Permissions & Access</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <strong className="text-slate-900 dark:text-slate-200">Admin Role Required:</strong> Pixel creation and Business Asset management require Ad Account Admin access.
                                    </p>
                                </div>
                                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <strong className="text-slate-900 dark:text-slate-200">App Review:</strong> Ensure your Meta App has <code>leads_retrieval</code> and <code>ads_management</code> approved for Live mode.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
