'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

import { useState, useEffect, Fragment } from 'react'
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
  RefreshCw,
  Power
} from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export default function AdminEmailPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedCompanies, setExpandedCompanies] = useState<number[]>([])
  const [isToggling, setIsToggling] = useState<number | null>(null)

  const [isTogglingCompany, setIsTogglingCompany] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchStats = async (searchStr = searchTerm, pageNum = page, limitNum = limit, statusFilter = filterStatus) => {
    try {
      setIsRefreshing(true)
      const data = await adminApi.getEmailStats(searchStr, pageNum, limitNum, statusFilter)
      setStats(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch email statistics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleToggleCompanyEmail = async (id: number) => {
    try {
      setIsTogglingCompany(id)
      const res = await adminApi.toggleCompanyEmail(id)
      toast.success(res.message)
      fetchStats(searchTerm, page, limit, filterStatus)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsTogglingCompany(null)
    }
  }

  useEffect(() => {
    fetchStats(searchTerm, page, limit, filterStatus)
  }, [])

  // Handle Search Debounce
  useEffect(() => {
    if (isLoading) return
    const timer = setTimeout(() => {
      setPage(1)
      fetchStats(searchTerm, 1, limit, filterStatus)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (isLoading) return
    fetchStats(searchTerm, page, limit, filterStatus)
  }, [page, limit, filterStatus])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-accent)]" />
      </div>
    )
  }

  const systemUsedPercentage = stats ? (stats.system_sent / (stats.total_sent || 1)) * 100 : 0
  const customUsedPercentage = stats ? (stats.custom_sent / (stats.total_sent || 1)) * 100 : 0
  const failureRate = stats ? (stats.total_failed / ((stats.total_sent + stats.total_failed) || 1)) * 100 : 0

  const toggleCompany = (id: number) => {
    setExpandedCompanies(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleToggleNotification = async (userId: number, type: 'new_lead' | 'meeting_booked') => {
    try {
      setIsToggling(userId)
      const res = await adminApi.toggleUserNotification(userId, type)
      toast.success(res.message)
      fetchStats(searchTerm, page, limit, filterStatus)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsToggling(null)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--crm-text-primary)]">Email Infrastructure Monitoring</h1>
          <p className="text-[var(--crm-text-secondary)] text-sm">Track platform-wide email usage, system SES health, and delivery issues.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchStats(searchTerm, page, limit, filterStatus)} 
          disabled={isRefreshing}
          className="gap-2 bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
        >
          <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-[var(--crm-border)] shadow-md overflow-hidden relative group transition-all hover:shadow-lg">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mail className="h-12 w-12 text-primary" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-[var(--crm-text-secondary)] font-medium">All-Time Sent</CardDescription>
             <CardTitle className="text-3xl font-bold text-[var(--crm-text-primary)] tracking-tight">{stats?.total_sent?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex items-center text-xs text-emerald-500 gap-1 font-semibold">
               <Zap className="h-3 w-3" />
               <span>{(stats?.monthly_sent || 0).toLocaleString()} this month</span>
             </div>
           </CardContent>
        </Card>

        <Card className="bg-card border-[var(--crm-border)] shadow-md overflow-hidden relative group transition-all hover:shadow-lg">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-[var(--crm-text-secondary)] font-medium">System (SES) Usage</CardDescription>
             <CardTitle className="text-3xl font-bold text-[var(--crm-text-primary)] tracking-tight">{stats?.system_sent?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <Progress value={systemUsedPercentage} className="h-1.5 bg-secondary" indicatorClassName="bg-primary" />
             <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-wider">{systemUsedPercentage.toFixed(1)}% of total traffic</p>
           </CardContent>
        </Card>

        <Card className="bg-card border-[var(--crm-border)] shadow-md overflow-hidden relative group transition-all hover:shadow-lg">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="h-12 w-12 text-primary" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-[var(--crm-text-secondary)] font-medium">Custom SMTP Usage</CardDescription>
             <CardTitle className="text-3xl font-bold text-[var(--crm-text-primary)] tracking-tight">{stats?.custom_sent?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <Progress value={customUsedPercentage} className="h-1.5 bg-secondary" indicatorClassName="bg-emerald-500" />
             <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-wider">{customUsedPercentage.toFixed(1)}% of total traffic</p>
           </CardContent>
        </Card>

        <Card className="bg-card border-[var(--crm-border)] shadow-md overflow-hidden relative group transition-all hover:shadow-lg border-l-4 border-l-rose-500">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="h-12 w-12 text-rose-500" />
           </div>
           <CardHeader className="pb-2">
             <CardDescription className="text-[var(--crm-text-secondary)] font-medium">Failed Deliveries</CardDescription>
             <CardTitle className="text-3xl font-bold text-[var(--crm-text-primary)] tracking-tight">{stats?.total_failed?.toLocaleString()}</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <div className="flex justify-between text-[11px] font-bold">
                <span className="text-rose-500 uppercase tracking-widest">{failureRate.toFixed(1)}% FAILURE RATE</span>
                <span className="text-[var(--crm-text-secondary)]">THRESHOLD: 5%</span>
             </div>
             <Progress value={Math.min(100, (failureRate * 10))} className="h-1.5 bg-secondary" indicatorClassName={failureRate > 5 ? "bg-rose-500" : "bg-orange-500"} />
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Users Table */}
        <Card className="lg:col-span-2 bg-card border-[var(--crm-border)] shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[var(--crm-border)] bg-muted/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <CardTitle className="text-[var(--crm-text-primary)] text-lg">Platform Companies</CardTitle>
                  <CardDescription className="text-[var(--crm-text-secondary)]">Monitor email volume and manage global suspension toggles.</CardDescription>
               </div>
               <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--crm-text-secondary)]" />
                   <Input
                     placeholder="Search workspace..."
                     className="pl-9 bg-[var(--crm-surface-1)] border-[var(--crm-border)]"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
                 <div className="w-32">
                   <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
                     <SelectTrigger className="h-10 text-xs">
                       <SelectValue placeholder="Status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">All Status</SelectItem>
                       <SelectItem value="enabled">Enabled</SelectItem>
                       <SelectItem value="disabled">Disabled</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold hidden sm:flex">MONTHLY CAP</Badge>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                    <TableHead className="w-[30px]"></TableHead>
                    <TableHead className="text-[var(--crm-text-secondary)] font-bold text-[11px] uppercase tracking-widest">Company</TableHead>
                    <TableHead className="text-[var(--crm-text-secondary)] font-bold text-[11px] uppercase tracking-widest">Plan</TableHead>
                    <TableHead className="text-[var(--crm-text-secondary)] font-bold text-[11px] uppercase tracking-widest">Usage</TableHead>
                    <TableHead className="text-[var(--crm-text-secondary)] font-bold text-[11px] uppercase tracking-widest text-right pr-6">Controls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {stats?.companies?.data?.map((company: any) => (
                      <Fragment key={company.id}>
                        <TableRow 
                          className={cn(
                            "border-[var(--crm-border)] transition-colors cursor-pointer",
                            expandedCompanies.includes(company.id) ? "bg-muted/30" : "hover:bg-muted/20"
                          )}
                          onClick={() => toggleCompany(company.id)}
                        >
                          <TableCell>
                             <div className="flex items-center justify-center">
                                <Search className={cn("h-3 w-3 transition-transform duration-200 text-[var(--crm-text-secondary)]", expandedCompanies.includes(company.id) && "rotate-90 text-primary")} />
                             </div>
                          </TableCell>
                          <TableCell className="font-medium">
                             <div className="flex flex-col">
                                <span className="text-[var(--crm-text-primary)] text-sm font-bold tracking-tight">{company.name}</span>
                                <span className="text-[10px] text-[var(--crm-text-secondary)] uppercase tracking-widest font-bold">ID: {company.id}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant="secondary" className="text-[10px] bg-secondary/50 text-[var(--crm-text-secondary)] border-[var(--crm-border)] font-bold uppercase">
                                {company.plan || 'Free'}
                             </Badge>
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-[var(--crm-text-primary)]">{(company.monthly_email_count || 0).toLocaleString()}</span>
                                <span className="text-[9px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-tighter">Sent this month</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                             <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {!company.is_email_enabled && (
                                  <Badge variant="destructive" className="text-[9px] h-5 font-bold uppercase tracking-tighter">DISABLED</Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isTogglingCompany === company.id}
                                  onClick={() => handleToggleCompanyEmail(company.id)}
                                  className={cn(
                                    "h-8 w-8 rounded-lg transition-all",
                                    company.is_email_enabled 
                                      ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" 
                                      : "text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                  )}
                                  title={company.is_email_enabled ? "Suspend all emails for this company" : "Activate email services"}
                                >
                                  {isTogglingCompany === company.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}
                                </Button>
                                <Link href={`/agency?companyId=${company.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--crm-text-secondary)] hover:text-primary hover:bg-primary/10 rounded-lg">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                             </div>
                          </TableCell>
                        </TableRow>
                      
                      {/* Expanded Row for User Management */}
                      {expandedCompanies.includes(company.id) && (
                        <TableRow className="bg-muted/5 border-[var(--crm-border)] hover:bg-muted/10">
                          <TableCell colSpan={5} className="p-4">
                             <div className="space-y-4 px-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--crm-border)] pb-2">
                                   <div className="flex items-center gap-2">
                                      <div className="h-1 w-4 bg-primary rounded-full" />
                                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Workspace Users & Email Toggles</h4>
                                   </div>
                                   <p className="text-[10px] text-[var(--crm-text-secondary)] italic">Toggle "Stop" to prevent Lead Notification emails for specific agents.</p>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                                   {(() => {
                                     // Merge owner and members, deduplicate by ID
                                     const allUsers = [...(company.members || [])]
                                     if (company.owner && !allUsers.find(u => u.id === company.owner.id)) {
                                       allUsers.unshift({
                                         ...company.owner,
                                         name: `${company.owner.name} (Owner)`,
                                         notification_settings: company.owner.notification_settings || {}
                                       })
                                     }

                                     return allUsers.map((user: any) => {
                                       const leadEnabled = user.notification_settings?.email_notifications?.new_lead === true;
                                       const meetingEnabled = user.notification_settings?.email_notifications?.meeting_booked === true;
                                       return (
                                         <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-3 rounded-xl border border-[var(--crm-border)] shadow-sm gap-3">
                                            <div className="flex items-center gap-3">
                                               <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-[var(--crm-text-secondary)]">
                                                  {user.name[0]?.toUpperCase()}
                                               </div>
                                               <div className="min-w-0">
                                                  <p className="text-xs font-bold text-[var(--crm-text-primary)] truncate">{user.name}</p>
                                                  <p className="text-[10px] text-[var(--crm-text-secondary)] truncate">{user.email}</p>
                                               </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                              <Button
                                                size="sm"
                                                variant={leadEnabled ? "destructive" : "outline"}
                                                disabled={isToggling === user.id}
                                                onClick={(e) => { e.stopPropagation(); handleToggleNotification(user.id, 'new_lead'); }}
                                                className={cn(
                                                  "h-7 text-[9px] font-bold px-3 flex-1 sm:flex-none",
                                                  leadEnabled 
                                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20"
                                                    : "border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20"
                                                )}
                                              >
                                                {leadEnabled ? "Leads: ON" : "Leads: OFF"}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant={meetingEnabled ? "destructive" : "outline"}
                                                disabled={isToggling === user.id}
                                                onClick={(e) => { e.stopPropagation(); handleToggleNotification(user.id, 'meeting_booked'); }}
                                                className={cn(
                                                  "h-7 text-[9px] font-bold px-3 flex-1 sm:flex-none",
                                                  meetingEnabled 
                                                    ? "bg-[var(--crm-accent-soft)]0/10 text-[var(--crm-accent)] hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20"
                                                    : "border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-accent-soft)]0/10 hover:text-primary hover:border-[var(--crm-accent)]/20"
                                                )}
                                              >
                                                {meetingEnabled ? "Meeting: ON" : "Meeting: OFF"}
                                              </Button>
                                            </div>
                                         </div>
                                       )
                                     })
                                   })()}
                                   {(!company.members?.length && !company.owner) && (
                                     <p className="text-[10px] text-[var(--crm-text-secondary)] py-2 pl-2">No users found for this workspace.</p>
                                   )}
                                </div>
                             </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            {stats?.companies && stats.companies.last_page > 1 && (
              <div className="p-4 border-t border-[var(--crm-border)] bg-muted/10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm font-medium text-[var(--crm-text-secondary)] px-4">
                        Page {stats.companies.current_page} of {stats.companies.last_page}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(stats.companies.last_page, p + 1))}
                        className={page === stats.companies.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card className="bg-card border-[var(--crm-border)] shadow-md rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-[var(--crm-border)] bg-muted/20">
            <CardTitle className="text-[var(--crm-text-primary)] text-lg flex items-center gap-2">
               <History className="h-4 w-4 text-rose-500" />
               Recent Failures
            </CardTitle>
            <CardDescription className="text-[var(--crm-text-secondary)]">Last 20 blocked or failed emails.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            <div className="divide-y divide-border">
               {stats?.recent_errors?.length === 0 ? (
                 <div className="p-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-20" />
                    <p className="text-[var(--crm-text-secondary)] font-medium">No recent errors detected.</p>
                 </div>
               ) : (
                 stats?.recent_errors?.map((err: any) => (
                   <div key={err.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                         <p className="text-xs font-bold text-[var(--crm-text-primary)] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{err.recipient_email}</p>
                         <span className="text-[10px] text-[var(--crm-text-secondary)] font-mono">{format(new Date(err.created_at), 'hh:mm:ss a')}</span>
                      </div>
                      <p className="text-[10px] font-bold text-primary capitalize mb-1">{err.company?.name || 'Unknown Company'}</p>
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded p-2 mt-2">
                        <p className="text-[10px] text-rose-500 font-medium leading-tight">{err.error || 'Connection timed out or limit exceeded.'}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Note */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4">
         <div className="h-10 w-10 shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5 text-white" />
         </div>
         <div className="space-y-1">
            <p className="text-sm font-bold text-[var(--crm-text-primary)]">System Performance Note</p>
            <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">
              All "System" emails are routed via the AWS SES Primary Identity. High failure rates (above 5%) on the system channel may risk platform-wide IP reputation. Consider suspending companies with suspicious error logs to protect the system's deliverability.
            </p>
         </div>
      </div>
    </div>
  )
}
