'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/lib/api'
import { toast } from 'sonner'
import { 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  Loader2,
  ExternalLink,
  Search,
  Zap,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from "@/components/ui/progress"

export default function AdminEmailPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setIsRefreshing(true)
      const data = await adminApi.getEmailStats()
      setStats(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch email statistics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const systemUsedPercentage = stats ? (stats.system_sent / (stats.total_sent || 1)) * 100 : 0
  const customUsedPercentage = stats ? (stats.custom_sent / (stats.total_sent || 1)) * 100 : 0
  const failureRate = stats ? (stats.total_failed / ((stats.total_sent + stats.total_failed) || 1)) * 100 : 0

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Email Infrastructure Monitoring</h1>
          <p className="text-slate-400">Track platform-wide email usage, system SES health, and delivery issues.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchStats} 
          disabled={isRefreshing}
          className="gap-2 bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mail className="h-12 w-12 text-indigo-500" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-slate-400 font-medium">All-Time Sent</CardDescription>
             <CardTitle className="text-3xl font-bold text-white tracking-tight">{stats?.total_sent?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex items-center text-xs text-emerald-400 gap-1 font-semibold">
               <Zap className="h-3 w-3" />
               <span>{(stats?.monthly_sent || 0).toLocaleString()} this month</span>
             </div>
           </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-slate-400 font-medium">System (SES) Usage</CardDescription>
             <CardTitle className="text-3xl font-bold text-white tracking-tight">{stats?.system_sent?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <Progress value={systemUsedPercentage} className="h-1.5 bg-slate-800" indicatorClassName="bg-indigo-500" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{systemUsedPercentage.toFixed(1)}% of total traffic</p>
           </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="h-12 w-12 text-indigo-500" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-slate-400 font-medium">Custom SMTP Usage</CardDescription>
             <CardTitle className="text-3xl font-bold text-white tracking-tight">{stats?.custom_sent?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <Progress value={customUsedPercentage} className="h-1.5 bg-slate-800" indicatorClassName="bg-emerald-500" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{customUsedPercentage.toFixed(1)}% of total traffic</p>
           </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group border-l-4 border-l-rose-500">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="h-12 w-12 text-rose-500" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-slate-400 font-medium">Failed Deliveries</CardDescription>
             <CardTitle className="text-3xl font-bold text-white tracking-tight">{stats?.total_failed?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <div className="flex justify-between text-[11px] font-bold">
                <span className="text-rose-400 uppercase tracking-widest">{failureRate.toFixed(1)}% FAILURE RATE</span>
                <span className="text-slate-500">THRESHOLD: 5%</span>
             </div>
             <Progress value={Math.min(100, (failureRate * 10))} className="h-1.5 bg-slate-800" indicatorClassName={failureRate > 5 ? "bg-rose-500" : "bg-orange-500"} />
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Users Table */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800">
            <div className="flex justify-between items-center">
               <div>
                  <CardTitle className="text-white text-lg">High Usage Companies</CardTitle>
                  <CardDescription>Top companies by monthly email volume.</CardDescription>
               </div>
               <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">MONTHLY CAP</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold text-[11px] uppercase tracking-widest pl-6">Company</TableHead>
                  <TableHead className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Plan</TableHead>
                  <TableHead className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Usage</TableHead>
                  <TableHead className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-right pr-6">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.top_companies?.map((company: any) => (
                  <TableRow key={company.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-bold text-white pl-6">{company.name}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-slate-300 capitalize text-[10px] py-0 px-2">{company.plan || 'Free'}</Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <span className="text-sm font-mono text-indigo-400">{company.monthly_email_count.toLocaleString()}</span>
                         <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (company.monthly_email_count / (company.plan === 'pro' ? 50 : company.plan === 'enterprise' ? 500 : 1)))}%` }} />
                         </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex justify-end items-center gap-2">
                          {!company.is_email_enabled && (
                            <Badge variant="destructive" className="text-[9px] h-5">SUSPENDED</Badge>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-indigo-600 rounded-lg">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white text-lg flex items-center gap-2">
               <History className="h-4 w-4 text-rose-500" />
               Recent Failures
            </CardTitle>
            <CardDescription>Last 20 blocked or failed emails.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            <div className="divide-y divide-slate-800">
               {stats?.recent_errors?.length === 0 ? (
                 <div className="p-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-20" />
                    <p className="text-slate-500 font-medium">No recent errors detected.</p>
                 </div>
               ) : (
                 stats?.recent_errors?.map((err: any) => (
                   <div key={err.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                         <p className="text-xs font-bold text-white max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{err.recipient_email}</p>
                         <span className="text-[10px] text-slate-500 font-mono">{format(new Date(err.created_at), 'hh:mm:ss a')}</span>
                      </div>
                      <p className="text-[10px] font-bold text-indigo-400 capitalize mb-1">{err.company?.name || 'Unknown Company'}</p>
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded p-2 mt-2">
                        <p className="text-[10px] text-rose-400 font-medium leading-tight">{err.error || 'Connection timed out or limit exceeded.'}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Note */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-4">
         <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
         </div>
         <div className="space-y-1">
            <p className="text-sm font-bold text-white">System Performance Note</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              All "System" emails are routed via the AWS SES Primary Identity. High failure rates (above 5%) on the system channel may risk platform-wide IP reputation. Consider suspending companies with suspicious error logs to protect the system's deliverability.
            </p>
         </div>
      </div>
    </div>
  )
}
