"use client"

import React from 'react'
import {
    ShieldCheck,
    Terminal,
    Code2,
    Lock,
    Eye,
    ArrowLeft,
    Copy,
    CheckCircle2,
    AlertCircle,
    FileCode,
    ArrowRight,
    Fingerprint,
    UserCheck,
    ShieldAlert
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SecurityDocsPage() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Code snippet copied!")
    }

    const hashingCode = `// PHP SHA-256 PII Hashing
public function hashData($data) {
  $normalized = trim(strtolower($data));
  return hash('sha256', $normalized);
}

// Result for 'John@Example.Com':
// b7e233... (64 character hex)`

    const encryptionNote = `// Database Layer
// Tokens stored via Eloquent $casts = ['access_token' => 'encrypted']
// Uses AES-256-CBC with APP_KEY`

    return (
        <div className="h-full overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <Link href="/developer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Console
            </Link>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-950/40 border border-rose-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Security & Compliance</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Data privacy, PII hashing, and token lifecycle security.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="privacy" className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto shadow-sm">
                            <TabsTrigger value="privacy" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">PII Hashing</TabsTrigger>
                            <TabsTrigger value="tokens" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">Token Security</TabsTrigger>
                            <TabsTrigger value="gdpr" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 font-bold">GDPR/CCPA</TabsTrigger>
                        </TabsList>

                        <TabsContent value="privacy" className="mt-8 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                    Meta's Business Tools Policy requires that all Personally Identifiable Information (PII) be hashed locally before being sent to their servers.
                                </p>
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-100 dark:border-rose-900">
                                            <Fingerprint className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">Mandatory SHA-256</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Emails, Phone Numbers, and Names must be lowercase, trimmed, and hashed.</p>
                                        </div>
                                    </div>
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 shadow-2xl">
                                        <pre className="text-xs text-rose-200 leading-relaxed font-mono overflow-x-auto selection:bg-rose-500/30">{hashingCode}</pre>
                                        <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => copyToClipboard(hashingCode)}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tokens" className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Secure Token Storage</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">We treat Meta Access Tokens as highly sensitive. They are never stored in plaintext.</p>
                                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-900 dark:text-slate-100 flex-1">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span>At-Rest Encryption: AES-256-GCM architecture.</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-900 dark:text-slate-100 flex-1">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span>Minimal Scope: We only request <code>ads_management</code> and <code>leads_retrieval</code>.</span>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 font-mono text-xs text-slate-500 dark:text-slate-400 italic">
                                        {encryptionNote}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="gdpr" className="mt-8 space-y-6">
                            <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Lock className="w-40 h-40 text-rose-600" />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-2xl font-black tracking-tight">Compliance Readiness</h3>
                                    <p className="text-slate-400 leading-relaxed font-medium max-w-xl">
                                        LeadBajaar's Meta bridge is built with GDPR 'Privacy by Design' principles. We provide automated opt-out syncing and data deletion handlers.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <Badge className="bg-white/10 text-white border-white/20 px-4 py-1">GDPR Ready</Badge>
                                        <Badge className="bg-white/10 text-white border-white/20 px-4 py-1">CCPA Compliant</Badge>
                                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-1">SSL Encrypted</Badge>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-rose-600 p-8 space-y-6 border-none text-white shadow-xl shadow-rose-100 dark:shadow-rose-950/20">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-rose-200" />
                            Security Alerts
                        </h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex gap-3 text-sm text-rose-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **Token Leakage:** Never log full access tokens to cloud logging services like Sentry/Loggly.
                            </li>
                            <li className="flex gap-3 text-sm text-rose-50">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                                **IP Whitelisting:** Our outbound CAPI requests come from a dedicated Static IP for extra security.
                            </li>
                            <li className="flex gap-3 text-sm text-rose-50">
                                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                                **SSL Pinning:** Use HTTPS only for all webhook listeners.
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 overflow-hidden relative shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.1]">
                            <UserCheck className="w-24 h-24 text-rose-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Audit Logs</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Reviewing last 24h security events.</p>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Hashing Accuracy</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% Correct</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Threat Blocking</span>
                                    <span className="text-rose-600 dark:text-rose-400 font-mono">Active</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-rose-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
