'use client'

import { useState, useEffect } from 'react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Receipt,
  CreditCard, BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight,
  Building2, AlertCircle, Zap, Timer, Scale,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = ['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6','#8b5cf6','#14b8a6','#f43f5e','#6b7280']

export default function FinanceDashboardPage() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth]     = useState(new Date().getMonth() + 1)
  const [year, setYear]       = useState(new Date().getFullYear())

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await financeApi.getDashboard(month, year)
      setData(res)
    } catch {
      toast.error('Failed to load finance dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [month, year])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )

  const { revenue, expenses, pnl, payroll, highlights, burn_trend, projections } = data ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">P&amp;L Dashboard</h2>
          <p className="text-sm text-[var(--crm-text-secondary)]">Financial overview for the selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={fetchData} className="h-8 gap-1">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50/50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--crm-text-secondary)] font-medium uppercase tracking-wider">Revenue</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{fmt(revenue?.total ?? 0)}</p>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-1">{highlights?.active_workspaces ?? 0} active workspaces</p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-red-200/50 bg-gradient-to-br from-red-50/50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--crm-text-secondary)] font-medium uppercase tracking-wider">Total Burn</span>
              <div className="h-7 w-7 rounded-lg bg-red-100 flex items-center justify-center">
                <Receipt className="h-3.5 w-3.5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-500">{fmt(expenses?.total ?? 0)}</p>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-1">Ops {fmt(expenses?.operational ?? 0)} + Payroll {fmt(expenses?.payroll ?? 0)}</p>
          </CardContent>
        </Card>

        {/* Net P&L */}
        <Card className={`border-2 ${pnl?.is_profitable ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/30' : 'border-red-200/60 bg-gradient-to-br from-red-50/30'}`}>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--crm-text-secondary)] font-medium uppercase tracking-wider">Net P&amp;L</span>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${pnl?.is_profitable ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {pnl?.is_profitable
                  ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                  : <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />}
              </div>
            </div>
            <p className={`text-2xl font-bold ${pnl?.is_profitable ? 'text-emerald-600' : 'text-red-500'}`}>
              {fmt(pnl?.net_profit_loss ?? 0)}
            </p>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-1">Margin {pnl?.gross_margin ?? 0}%</p>
          </CardContent>
        </Card>

        {/* Payroll Status */}
        <Card className="border-primary/10 bg-gradient-to-br from-indigo-50/50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--crm-text-secondary)] font-medium uppercase tracking-wider">Payroll</span>
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-[var(--crm-accent)]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--crm-accent)]">{fmt(payroll?.total ?? 0)}</p>
            <div className="flex items-center gap-2 mt-1">
              {payroll?.pending_count > 0 && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 py-0">
                  {payroll.pending_count} pending
                </Badge>
              )}
              {payroll?.pending_count === 0 && (
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 py-0">
                  All paid ✓
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* P&L Statement */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              P&amp;L Statement — {MONTHS[month - 1]} {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm font-mono">
              <div className="flex justify-between py-1.5 border-b font-semibold text-[var(--crm-text-primary)]/70 text-xs uppercase tracking-wider">
                <span>Revenue</span><span></span>
              </div>
              <div className="flex justify-between py-1 pl-4">
                <span className="text-[var(--crm-text-secondary)]">Subscriptions</span>
                <span className="text-emerald-600 font-semibold">{fmt(revenue?.subscription ?? 0)}</span>
              </div>
              {revenue?.adjustments !== 0 && (
                <div className="flex justify-between py-1 pl-4">
                  <span className="text-[var(--crm-text-secondary)]">Adjustments & Fees</span>
                  <span className="text-emerald-600 font-semibold">{fmt(revenue?.adjustments ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b font-semibold">
                <span>Total Revenue</span>
                <span className="text-emerald-600">{fmt(revenue?.total ?? 0)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-semibold text-[var(--crm-text-primary)]/70 text-xs uppercase tracking-wider mt-2">
                <span>Expenses</span><span></span>
              </div>
              {(expenses?.by_category ?? []).map((cat: any) => (
                <div key={cat.category} className="flex justify-between py-1 pl-4">
                  <span className="text-[var(--crm-text-secondary)]">{cat.category}</span>
                  <span className="text-red-500">{fmt(cat.total)}</span>
                </div>
              ))}
              <div className="flex justify-between py-1 pl-4">
                <span className="text-[var(--crm-text-secondary)]">Salaries & Payroll</span>
                <span className="text-red-500">{fmt(expenses?.payroll ?? 0)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-semibold">
                <span>Total Expenses</span>
                <span className="text-red-500">{fmt(expenses?.total ?? 0)}</span>
              </div>
              <div className={`flex justify-between py-2 px-2 rounded-lg mt-2 font-bold text-base ${pnl?.is_profitable ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <span>NET {pnl?.is_profitable ? 'PROFIT' : 'LOSS'}</span>
                <span className={pnl?.is_profitable ? 'text-emerald-600' : 'text-red-500'}>
                  {fmt(pnl?.net_profit_loss ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projections & Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-[var(--crm-accent)] text-white border-none overflow-hidden relative">
              <Zap className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />
              <CardContent className="pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Financial Runway</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{projections?.runway_months ?? '—'}</span>
                  <span className="text-sm text-indigo-100">Months</span>
                </div>
                <p className="text-[10px] text-indigo-100 mt-2">Based on avg burn of {fmt(projections?.avg_monthly_burn ?? 0)}/mo</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--crm-accent)] text-white border-none overflow-hidden relative">
              <Scale className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />
              <CardContent className="pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--crm-text-secondary)]">Cash Flow Projection</p>
                <p className="text-xl font-bold mt-2 text-emerald-400">Stable & Growing</p>
                <p className="text-[10px] text-[var(--crm-text-secondary)] mt-2">Retention rate is healthy. Net margin trending up.</p>
              </CardContent>
            </Card>
          </div>

          {/* Burn Trend Chart */}
          {burn_trend?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Monthly Burn Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={burn_trend} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="top" align="right" />
                    <Bar dataKey="payroll" stackId="a" name="Payroll" fill="#6366f1" radius={[0,0,0,0]} />
                    <Bar dataKey="opex" stackId="a" name="Opex" fill="#ec4899" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Expense Category Breakdown (Pie) */}
      {expenses?.by_category?.length > 0 && (
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold">Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative">
                <PieChart width={220} height={220}>
                  <Pie 
                    data={expenses.by_category} 
                    dataKey="total" 
                    nameKey="category" 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={85} 
                    paddingAngle={5}
                    cornerRadius={4}
                  >
                    {expenses.by_category.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmt(v)} />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase">Burn</span>
                  <span className="text-lg font-bold">{fmt(expenses?.total ?? 0)}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1 w-full">
                {expenses.by_category.map((cat: any, i: number) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-sm shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[var(--crm-text-secondary)] group-hover:text-[var(--crm-text-primary)] transition-colors">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{fmt(cat.total)}</p>
                      <p className="text-[10px] text-[var(--crm-text-secondary)]">{((cat.total / expenses.total) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
