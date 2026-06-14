'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  Legend, TooltipProps
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, Target, DollarSign,
  Calendar, Activity, Zap, ArrowUpRight, ArrowDownRight,
  BarChart2, PieChart as PieIcon, Filter, Database, EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoleGuard } from '@/components/RoleGuard'
import { getAnalyticsData } from '@/lib/api'

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, trend, trendValue, icon: Icon, gradient
}: {
  title: string
  value: string
  sub: string
  trend: 'up' | 'down'
  trendValue: string
  icon: React.ElementType
  gradient: string
}) {
  const isUp = trend === 'up'
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', gradient)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className={cn(
          'mt-3 flex items-center gap-1.5 text-xs font-semibold',
          isUp ? 'text-emerald-600' : 'text-red-500'
        )}>
          {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trendValue} vs last month
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Custom Tooltips ───────────────────────────────────────────────────────────

function LeadsTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function RevenueTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      <p className="text-indigo-600 font-bold">₹{((payload[0]?.value as number) / 1000).toFixed(0)}K</p>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const PERIODS = ['This Month', 'Last 6M', 'This Year', 'All Time']

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('This Year')
  const [realData, setRealData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getAnalyticsData()
        setRealData(data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── Data selection ──
  const activeMonthlyLeads = realData?.monthlyLeads || []
  const activeConversionRateData = realData?.conversionRateData || []
  const activeLeadSourceData = realData?.leadSourceData || []
  const activeStageData = realData?.stageData || []
  const activeWeeklyActivity = realData?.weeklyActivity || []
  const activeDealValueRanges = realData?.dealValueRanges || []
  const activeTopPerformers = realData?.topPerformers || []

  const totalLeads = activeMonthlyLeads.reduce((s: number, m: any) => s + m.leads, 0)
  const totalConverted = activeMonthlyLeads.reduce((s: number, m: any) => s + m.converted, 0)
  const totalRevenue = activeMonthlyLeads.reduce((s: number, m: any) => s + m.revenue, 0)
  const convRate = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '0.0'

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['Super Admin', 'Admin', 'Manager']} allowedPlans={['pro', 'enterprise']}>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin', 'Manager']} allowedPlans={['pro', 'enterprise']}>
      <div className="flex flex-col absolute inset-0 sm:relative sm:inset-auto sm:min-h-screen gap-4 sm:gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Track performance across your entire sales pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-full lg:w-auto overflow-x-auto no-scrollbar shrink-0">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                period === p
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={totalLeads.toLocaleString()}
          sub="Across all sources"
          trend="up" trendValue="+18.4%"
          icon={Users}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        <StatCard
          title="Converted"
          value={totalConverted.toLocaleString()}
          sub="Successfully closed"
          trend="up" trendValue="+22.1%"
          icon={Target}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <StatCard
          title="Conv. Rate"
          value={`${convRate}%`}
          sub="Lead-to-close ratio"
          trend="up" trendValue="+3.2%"
          icon={Activity}
          gradient="bg-gradient-to-br from-violet-500 to-violet-700"
        />
        <StatCard
          title="Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          sub="Total deal value"
          trend="up" trendValue="+31.6%"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-amber-500 to-amber-700"
        />
      </div>

      {/* ── Row 1: Lead Volume + Revenue Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lead Volume Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Lead Volume</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">Monthly leads, converted & lost</CardDescription>
              </div>
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-xs">12 months</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activeMonthlyLeads} barGap={2} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<LeadsTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="leads" name="Leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="Lost" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-2 pl-7">
              {[['Leads', '#6366f1'], ['Converted', '#10b981'], ['Lost', '#f87171']].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Revenue Trend</CardTitle>
            <CardDescription className="text-xs text-slate-400">Cumulative deal value (₹)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activeMonthlyLeads}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue"
                  stroke="#8b5cf6" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Conversion Rate + Sources + Stage Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Conversion Rate */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Conversion Rate</CardTitle>
            <CardDescription className="text-xs text-slate-400">Actual vs 45% target</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activeConversionRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28}
                  tickFormatter={(v) => `${v}%`} domain={[35, 58]} />
                <Tooltip
                  formatter={(v: number, n) => [`${v}%`, n === 'rate' ? 'Actual' : 'Target']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }}
                />
                <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2}
                  strokeDasharray="5 5" dot={false} name="target" />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1' }} name="rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources Pie */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Lead Sources</CardTitle>
            <CardDescription className="text-xs text-slate-400">Where leads come from</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={130} height={150}>
                <PieChart>
                  <Pie data={activeLeadSourceData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    dataKey="value" paddingAngle={3} stroke="none">
                    {activeLeadSourceData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [v, 'Leads']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1">
                {activeLeadSourceData.map((s: any) => {
                  const total = activeLeadSourceData.reduce((a: number, b: any) => a + b.value, 0)
                  const pct = total > 0 ? ((s.value / total) * 100).toFixed(0) : '0'
                  return (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: s.color }} />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Stage Funnel */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Pipeline Stages</CardTitle>
            <CardDescription className="text-xs text-slate-400">Leads by current stage</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mt-1">
              {activeStageData.map((s: any) => {
                const max = activeStageData.length > 0 ? activeStageData[0].count : 0
                const pct = max > 0 ? (s.count / max) * 100 : 0
                return (
                  <div key={s.stage} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20 shrink-0">{s.stage}</span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${pct}%`, background: s.color }}
                      >
                        <span className="text-[10px] text-white font-bold">{s.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Weekly Activity + Deal Range + Top Performers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Weekly Activity */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Weekly Activity</CardTitle>
            <CardDescription className="text-xs text-slate-400">Calls, emails & meetings per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeWeeklyActivity} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<LeadsTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="calls" name="Calls" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="emails" name="Emails" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="meetings" name="Meetings" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deal Value Distribution */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Deal Value Distribution</CardTitle>
            <CardDescription className="text-xs text-slate-400">Leads by deal size bracket</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeDealValueRanges} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  formatter={(v: number) => [v, 'Leads']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {activeDealValueRanges.map((_: any, i: number) => (
                    <Cell key={i} fill={`hsl(${239 + i * 12}, ${70 - i * 4}%, ${55 + i * 3}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">Top Performers</CardTitle>
            <CardDescription className="text-xs text-slate-400">Best closers this period</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 mt-1">
              {activeTopPerformers.map((rep: any, i: number) => {
                const convPct = Math.round((rep.converted / rep.leads) * 100)
                const accentColors = ['bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500']
                return (
                  <div key={rep.name} className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0',
                      accentColors[i % accentColors.length]
                    )}>
                      {rep.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{rep.name}</p>
                        <span className="text-xs font-bold text-emerald-600 shrink-0 ml-2">{convPct}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{rep.leads} leads</span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400">₹{(rep.revenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="mt-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', accentColors[i % accentColors.length])}
                          style={{ width: `${convPct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
    </RoleGuard>
  )
}
