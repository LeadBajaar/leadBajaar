'use client'

import React from 'react'
import { 
  BookOpen, Zap, Shield, Users, Mail, 
  MessageSquare, Target, Settings, ArrowRight,
  TrendingUp, Activity, CheckCircle2, AlertCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function AutomationsGuidePage() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="space-y-4">
        <Badge className="bg-indigo-600 text-white font-bold h-7 px-4 rounded-full">Developer Documentation</Badge>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Email & Marketing Automation Guide
        </h1>
        <p className="text-lg text-slate-500 max-w-3xl">
          Everything developers and platform admins need to know about LeadBajaar's automated revenue engine.
        </p>
      </div>

      <Tabs defaultValue="admin" className="space-y-8">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-14 w-full sm:w-auto">
          <TabsTrigger value="admin" className="rounded-xl px-8 h-12 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-slate-800">
            <Shield className="w-4 h-4 mr-2" /> Admin & Infrastructure
          </TabsTrigger>
          <TabsTrigger value="user" className="rounded-xl px-8 h-12 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-slate-800">
            <Users className="w-4 h-4 mr-2" /> End-User Guide
          </TabsTrigger>
        </TabsList>

        {/* --- ADMIN CONTENT --- */}
        <TabsContent value="admin" className="space-y-10 focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-2">
                  <Mail className="w-5 h-5" />
                </div>
                <CardTitle>Global Email Infrastructure</CardTitle>
                <CardDescription>Managing the platform's multi-tenant delivery system.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Connecting Providers</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Admins can now connect custom email providers directly via the <Link href="/integrations?tab=marketing" className="text-indigo-600 font-bold hover:underline underline-offset-4">Integrations Hub</Link>. We support Amazon SES, Direct SMTP (Gmail/Outlook), and Mailgun.
                    </p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dynamic Mailer Injection</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      The backend dynamically swaps the Laravel mailer transport at runtime based on the company's active configuration. This allows for fully white-labeled delivery across different workspaces.
                    </p>
                 </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center text-white mb-2">
                  <Shield className="w-5 h-5" />
                </div>
                <CardTitle>Validation & Testing</CardTitle>
                <CardDescription>Ensuring reliable delivery and security.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Connection Verification</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Use the "Send Test Email" feature in the Integration Dialog to verify SMPT/SES heartbeat. Failure to verify will prevent sequences from dispatching to avoid queue blockage.
                    </p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Credential Encryption</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      All provider credentials (Secret Keys, Passwords) are encrypted at rest. The UI never exposes existing secrets in plain text once saved.
                    </p>
                 </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <h3 className="text-3xl font-bold tracking-tight">System Maintainance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Settings className="w-4 h-4" /></div>
                      <div>
                        <p className="font-bold">Artisan Scheduler</p>
                        <p className="text-sm text-white/60">Ensure <code>* * * * * schedule:run</code> is in the server crontab for minutely automation processing.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Activity className="w-4 h-4" /></div>
                      <div>
                        <p className="font-bold">Queue Worker</p>
                        <p className="text-sm text-white/60">Run <code>php artisan queue:work</code> to process emails in the background without slowing the UI.</p>
                      </div>
                   </div>
                </div>
              </div>
              <div className="lg:w-1/3 p-6 bg-white/5 rounded-3xl border border-white/10">
                 <h4 className="font-bold mb-4 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Use Case: The "Saved Sale"</h4>
                 <p className="text-sm text-white/70 leading-relaxed italic">
                   "A lead goes cold for 7 days. The <code>leads:check-inactivity</code> command fires, sending an alert to the agent and enrolling the lead in the 'Re-engagement' Sequence. The agent closes the deal 2 days later without manually remembering to follow up."
                 </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- USER CONTENT --- */}
        <TabsContent value="user" className="space-y-10 focus:outline-none focus:ring-0">
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 <h3 className="text-2xl font-bold flex items-center gap-3">
                   <Zap className="w-6 h-6 text-indigo-500" />
                   Designing Your First Automation
                 </h3>
                 <p className="text-slate-500">Master the Visual Sequence Builder located in your CRM dashboard.</p>
                 
                 <div className="space-y-4">
                    {[
                      { t: 'Step 1: Choose a Trigger', d: 'When should the sequence start? Popular choices: when a new lead is added or when you move a lead to "Qualified".' },
                      { t: 'Step 2: Connect Your Delivery Engine', d: 'Visit the Integrations page to link your Amazon SES or SMTP account. This ensures your emails are sent from your own professional domain.' },
                      { t: 'Step 3: Add Actions', d: 'Mix and match channels. Start with an Email, then wait 24 hours to send a WhatsApp message.' },
                      { t: 'Step 4: Auto-Stages', d: 'Use the "Update Stage" action to automatically move leads through your pipeline as they progress in the sequence.' },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group hover:ring-2 hover:ring-indigo-500/20 transition-all">
                        <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm font-black text-indigo-600 shrink-0 border border-slate-200 dark:border-slate-800">{i+1}</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{s.t}</p>
                          <p className="text-sm text-slate-500 leading-relaxed mt-1">{s.d}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-6">
                 <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200 dark:shadow-none p-6 rounded-[2rem] h-full">
                    <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5" />
                      Conversion Magic
                    </h4>
                    <p className="text-sm text-white/80 leading-relaxed mb-6">
                      Every person who clicks a link in your sequence is automatically pushed back into your Meta Ad Manager.
                    </p>
                    <ul className="space-y-4 text-xs font-medium">
                      <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-indigo-200" /> 100% Attribution Accuracy</li>
                      <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-indigo-200" /> Automatic "ViewContent" Events</li>
                      <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-indigo-200" /> No Pixel Installation Required</li>
                      <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-indigo-200" /> Lower Ad Spend via better LLA</li>
                    </ul>
                 </Card>
              </div>
            </div>

            <Separator className="dark:bg-slate-800" />

            <div className="space-y-6">
               <h3 className="text-2xl font-bold flex items-center gap-3">
                 <BookOpen className="w-6 h-6 text-indigo-500" />
                 Ready-to-Use Blueprints
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-indigo-500 transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-none">Real Estate</Badge>
                        <Mail className="w-5 h-5 text-slate-400" />
                     </div>
                     <h4 className="font-bold text-lg mb-2">The "Hot Lead" Express</h4>
                     <p className="text-sm text-slate-500 mb-4 line-clamp-2 italic">Drip sequence designed for immediate 5-minute outreach after form submission.</p>
                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       3 EMAILS <ArrowRight className="w-3 h-3" /> 1 WHATSAPP <ArrowRight className="w-3 h-3" /> 48H DELAY
                     </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-indigo-500 transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-none">B2B SaaS</Badge>
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                     </div>
                     <h4 className="font-bold text-lg mb-2">Demo Nurture Flow</h4>
                     <p className="text-sm text-slate-500 mb-4 line-clamp-2 italic">Follow-up series for leads that booked a meeting but haven't signed yet.</p>
                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       2 EMAILS <ArrowRight className="w-3 h-3" /> STAGE UPDATE <ArrowRight className="w-3 h-3" /> 72H DELAY
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full bg-slate-100 ${className}`} />
}
