'use client'

import { useState, useEffect, useCallback } from 'react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  TrendingUp, TrendingDown, DollarSign, Building2,
  Calendar, Search, RefreshCw, Plus, ArrowUpRight,
  CreditCard, Clock, CheckCircle, AlertCircle, Eye,
  Filter, FileText,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

const ADJ_TYPES = [
  { value: 'one_time_fee', label: 'One-time Fee' },
  { value: 'setup_charge', label: 'Setup Charge' },
  { value: 'custom_plan', label: 'Custom Plan' },
  { value: 'refund', label: 'Refund' },
  { value: 'discount', label: 'Discount' },
  { value: 'credit', label: 'Credit' },
]

export default function RevenuePage() {
  const [mrrData, setMrrData]       = useState<any>(null)
  const [mrrHistory, setMrrHistory] = useState<any[]>([])
  const [subs, setSubs]             = useState<any[]>([])
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [companies, setCompanies]   = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  
  // Modals
  const [showRenew, setShowRenew]   = useState(false)
  const [showAdj, setShowAdj]       = useState(false)
  
  // Forms
  const [selectedComp, setSelectedComp] = useState<any>(null)
  const [renewForm, setRenewForm]   = useState({ extend_days: '30', amount: '0', notes: '' })
  const [adjForm, setAdjForm]       = useState({
    company_id: '',
    type: 'one_time_fee',
    amount: '',
    description: '',
    effective_date: new Date().toISOString().split('T')[0],
    invoice_url: ''
  })

  const [search, setSearch]         = useState('')
  const [filterPlan, setFilterPlan] = useState('all')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [mrr, history, subRes, adjRes, compRes] = await Promise.all([
        financeApi.getMrrBreakdown(),
        financeApi.getMrrHistory(),
        financeApi.getSubscriptions({ search: search || undefined, plan: filterPlan !== 'all' ? filterPlan : undefined }),
        financeApi.getRevenueAdjustments(),
        financeApi.getRevenueCompanies()
      ])
      setMrrData(mrr)
      setMrrHistory(history.history ?? [])
      setSubs(subRes.subscriptions?.data ?? [])
      setAdjustments(adjRes.adjustments?.data ?? [])
      setCompanies(compRes.companies ?? [])
    } catch {
      toast.error('Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }, [search, filterPlan])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRenew = async () => {
    if (!selectedComp) return
    try {
      await financeApi.manualRenewal({
        company_id: selectedComp.id,
        extend_days: parseInt(renewForm.extend_days),
        amount: parseFloat(renewForm.amount),
        notes: renewForm.notes,
      })
      toast.success('Subscription extended')
      setShowRenew(false)
      fetchData()
    } catch {
      toast.error('Failed to extend subscription')
    }
  }

  const handleAddAdjustment = async () => {
    if (!adjForm.company_id || !adjForm.amount) {
      toast.error('Please fill in Company and Amount'); return
    }
    try {
      await financeApi.createRevenueAdjustment({
        ...adjForm,
        amount: parseFloat(adjForm.amount)
      })
      toast.success('Revenue adjustment recorded')
      setShowAdj(false)
      setAdjForm({
        company_id: '',
        type: 'one_time_fee',
        amount: '',
        description: '',
        effective_date: new Date().toISOString().split('T')[0],
        invoice_url: ''
      })
      fetchData()
    } catch {
      toast.error('Failed to record adjustment')
    }
  }

  if (loading && !mrrData) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue & MRR</h2>
          <p className="text-sm text-muted-foreground">Manage subscriptions and monthly recurring revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAdj(true)} className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add Adjustment
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm" className="h-9 gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* MRR Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Net MRR</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{fmt(mrrData?.total_mrr)}</p>
            <div className="flex items-center gap-1 mt-1 text-[10px]">
              <span className={mrrData?.mrr_growth >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                {mrrData?.mrr_growth >= 0 ? '+' : ''}{mrrData?.mrr_growth}%
              </span>
              <span className="text-muted-foreground text-xs font-mono ml-2">from {fmt(mrrData?.prev_mrr)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Annual (ARR)</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{fmt(mrrData?.arr)}</p>
            <p className="text-xs text-muted-foreground mt-1">Projected yearly revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Active Subs</span>
              <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{mrrData?.active_count}</p>
            <p className="text-xs text-muted-foreground mt-1">Paid workspaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Adjustments</span>
              <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Plus className="h-3.5 w-3.5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{fmt(mrrData?.adjustments)}</p>
            <p className="text-xs text-muted-foreground mt-1">One-time fees & credits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">MRR Growth (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mrrHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mrrData?.plan_breakdown?.map((p: any) => (
                <div key={p.plan} className="p-3 rounded-xl border bg-muted/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{p.plan}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">{p.count} users</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold">{fmt(p.mrr)}</p>
                    <p className="text-[10px] text-muted-foreground italic">at {fmt(p.price)}/mo</p>
                  </div>
                </div>
              ))}
              {(!mrrData?.plan_breakdown || mrrData.plan_breakdown.length === 0) && (
                <div className="py-10 text-center text-xs text-muted-foreground">No active subscriptions</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList className="grid w-64 grid-cols-2">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold">Active Subscriptions</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search workspace..." className="pl-8 h-8 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="h-8 text-xs w-32"><SelectValue placeholder="Plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Workspace</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Expiry</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((sub: any) => (
                      <tr key={sub.id} className="border-b hover:bg-muted/20">
                        <td className="p-3">
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-40">{sub.owner?.email}</p>
                        </td>
                        <td className="p-3 capitalize text-xs font-medium">{sub.plan}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-xs">{sub.expires_at?.split('T')[0]}</span>
                            <span className={`text-[10px] font-medium ${
                              sub.expiry_status === 'critical' ? 'text-red-500' :
                              sub.expiry_status === 'warning' ? 'text-amber-500' :
                              sub.expiry_status === 'expired' ? 'text-red-600 font-bold' :
                              'text-emerald-600'
                            }`}>
                              {sub.days_remaining < 0 ? 'Expired' : `${sub.days_remaining} days left`}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">{fmt(sub.plan_price)}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] ${
                            sub.is_expired ? 'text-red-500 border-red-300 bg-red-50' : 'text-emerald-600 border-emerald-300 bg-emerald-50'
                          }`}>
                            {sub.is_expired ? 'Expired' : 'Active'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setSelectedComp(sub); setShowRenew(true) }}>
                              Renew
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subs.length === 0 && (
                      <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No subscriptions found matching filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">One-time Revenue & Adjustments</h3>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Company</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((adj: any) => (
                      <tr key={adj.id} className="border-b hover:bg-muted/20">
                        <td className="p-3 text-xs">{adj.effective_date}</td>
                        <td className="p-3 font-medium">{adj.company?.name}</td>
                        <td className="p-3 capitalize">
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {adj.type.replace('_',' ')}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{adj.description || '—'}</td>
                        <td className={`p-3 text-right font-bold ${adj.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {fmt(adj.amount)}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{adj.recorded_by?.name}</td>
                      </tr>
                    ))}
                    {adjustments.length === 0 && (
                      <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No adjustments recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Renewal Dialog */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Subscription — {selectedComp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Extend Days</Label>
              <Input type="number" value={renewForm.extend_days} onChange={e => setRenewForm(f => ({ ...f, extend_days: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Renewal Amount (₹)</Label>
              <Input type="number" value={renewForm.amount} onChange={e => setRenewForm(f => ({ ...f, amount: e.target.value }))} />
              <p className="text-[10px] text-muted-foreground italic">Enter 0 if this is a free/promotional extension</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Input placeholder="Promotion, bank transfer received, etc." value={renewForm.notes} onChange={e => setRenewForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowRenew(false)}>Cancel</Button>
            <Button size="sm" onClick={handleRenew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Process Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revenue Adjustment Dialog */}
      <Dialog open={showAdj} onOpenChange={setShowAdj}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Revenue Adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Select Company *</Label>
              <Select value={adjForm.company_id} onValueChange={v => setAdjForm(f => ({ ...f, company_id: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Pick a company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.plan})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type *</Label>
                <Select value={adjForm.type} onValueChange={v => setAdjForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ADJ_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (₹) *</Label>
                <Input type="number" placeholder="e.g. 5000" value={adjForm.amount} onChange={e => setAdjForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Effective Date *</Label>
              <Input type="date" value={adjForm.effective_date} onChange={e => setAdjForm(f => ({ ...f, effective_date: e.target.value }))} />
              <p className="text-[10px] text-muted-foreground italic">Revenue will be attributed to this date's month</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input placeholder="e.g. Setup charge for custom domain" value={adjForm.description} onChange={e => setAdjForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Invoice URL (Optional)</Label>
              <Input placeholder="Link to PDF invoice" value={adjForm.invoice_url} onChange={e => setAdjForm(f => ({ ...f, invoice_url: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowAdj(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddAdjustment} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <CheckCircle className="h-4 w-4" /> Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
