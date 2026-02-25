'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  Legend, TooltipProps
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, Target, DollarSign,
  Calendar, Activity, Zap, ArrowUpRight, ArrowDownRight,
  BarChart2, PieChart as PieIcon, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const monthlyLeads = [
  { month: 'Jan', leads: 42, converted: 18, lost: 8, revenue: 124000 },
  { month: 'Feb', leads: 58, converted: 24, lost: 12, revenue: 168000 },
  { month: 'Mar', leads: 75, converted: 31, lost: 14, revenue: 217000 },
  { month: 'Apr', leads: 63, converted: 28, lost: 10, revenue: 196000 },
  { month: 'May', leads: 91, converted: 42, lost: 16, revenue: 294000 },
  { month: 'Jun', leads: 84, converted: 38, lost: 13, revenue: 266000 },
  { month: 'Jul', leads: 110, converted: 52, lost: 18, revenue: 364000 },
  { month: 'Aug', leads: 98, converted: 47, lost: 15, revenue: 329000 },
  { month: 'Sep', leads: 126, converted: 61, lost: 22, revenue: 427000 },
  { month: 'Oct', leads: 138, converted: 68, lost: 24, revenue: 476000 },
  { month: 'Nov', leads: 152, converted: 74, lost: 28, revenue: 518000 },
  { month: 'Dec', leads: 171, converted: 89, lost: 31, revenue: 623000 },
]

const conversionRateData = [
  { month: 'Jan', rate: 42.9, target: 45 },
  { month: 'Feb', rate: 41.4, target: 45 },
  { month: 'Mar', rate: 41.3, target: 45 },
  { month: 'Apr', rate: 44.4, target: 45 },
  { month: 'May', rate: 46.2, target: 45 },
  { month: 'Jun', rate: 45.2, target: 45 },
  { month: 'Jul', rate: 47.3, target: 45 },
  { month: 'Aug', rate: 48.0, target: 45 },
  { month: 'Sep', rate: 48.4, target: 45 },
  { month: 'Oct', rate: 49.3, target: 45 },
  { month: 'Nov', rate: 48.7, target: 45 },
  { month: 'Dec', rate: 52.0, target: 45 },
]

const leadSourceData = [
  { name: 'Facebook', value: 382, color: '#6366f1', fill: '#6366f1' },
  { name: 'Website', value: 294, color: '#8b5cf6', fill: '#8b5cf6' },
  { name: 'Referral', value: 218, color: '#06b6d4', fill: '#06b6d4' },
  { name: 'LinkedIn', value: 163, color: '#10b981', fill: '#10b981' },
  { name: 'Email', value: 109, color: '#f59e0b', fill: '#f59e0b' },
  { name: 'Other', value: 74, color: '#94a3b8', fill: '#94a3b8' },
]

const stageData = [
  { stage: 'New', count: 312, color: '#6366f1', fill: '#6366f1' },
  { stage: 'Contacted', count: 248, color: '#8b5cf6', fill: '#8b5cf6' },
  { stage: 'Qualified', count: 186, color: '#06b6d4', fill: '#06b6d4' },
  { stage: 'Proposal', count: 124, color: '#10b981', fill: '#10b981' },
  { stage: 'Negotiation', count: 72, color: '#f59e0b', fill: '#f59e0b' },
  { stage: 'Closed', count: 58, color: '#22c55e', fill: '#22c55e' },
]

const weeklyActivity = [
  { day: 'Mon', calls: 24, emails: 38, meetings: 8 },
  { day: 'Tue', calls: 31, emails: 42, meetings: 11 },
  { day: 'Wed', calls: 28, emails: 35, meetings: 14 },
  { day: 'Thu', calls: 36, emails: 48, meetings: 9 },
  { day: 'Fri', calls: 22, emails: 29, meetings: 12 },
  { day: 'Sat', calls: 8, emails: 12, meetings: 3 },
  { day: 'Sun', calls: 4, emails: 6, meetings: 1 },
]

const topPerformers = [
  { name: 'Aryan Sharma', leads: 47, converted: 28, revenue: 196000, avatar: 'AS' },
  { name: 'Priya Mehta', leads: 39, converted: 22, revenue: 154000, avatar: 'PM' },
  { name: 'Rahul Gupta', leads: 35, converted: 19, revenue: 133000, avatar: 'RG' },
  { name: 'Sneha Patel', leads: 31, converted: 17, revenue: 119000, avatar: 'SP' },
  { name: 'Karan Singh', leads: 28, converted: 14, revenue: 98000, avatar: 'KS' },
]

const dealValueRanges = [
  { range: '< ₹10K', count: 218 },
  { range: '₹10K–25K', count: 187 },
  { range: '₹25K–50K', count: 142 },
  { range: '₹50K–1L', count: 96 },
  { range: '₹1L–5L', count: 54 },
  { range: '> ₹5L', count: 22 },
]

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

  const totalLeads = monthlyLeads.reduce((s, m) => s + m.leads, 0)
  const totalConverted = monthlyLeads.reduce((s, m) => s + m.converted, 0)
  const totalRevenue = monthlyLeads.reduce((s, m) => s + m.revenue, 0)
  const convRate = ((totalConverted / totalLeads) * 100).toFixed(1)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 h-full overflow-y-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track performance across your entire sales pipeline</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
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
              <BarChart data={monthlyLeads} barGap={2} barCategoryGap="28%">
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
              <AreaChart data={monthlyLeads}>
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
              <LineChart data={conversionRateData}>
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
                  <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    dataKey="value" paddingAngle={3} stroke="none">
                    {leadSourceData.map((entry, i) => (
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
                {leadSourceData.map((s) => {
                  const total = leadSourceData.reduce((a, b) => a + b.value, 0)
                  const pct = ((s.value / total) * 100).toFixed(0)
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
              {stageData.map((s) => {
                const max = stageData[0].count
                const pct = (s.count / max) * 100
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
              <BarChart data={weeklyActivity} barGap={2}>
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
              <BarChart data={dealValueRanges} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  formatter={(v: number) => [v, 'Leads']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {dealValueRanges.map((_, i) => (
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
              {topPerformers.map((rep, i) => {
                const convPct = Math.round((rep.converted / rep.leads) * 100)
                const accentColors = ['bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500']
                return (
                  <div key={rep.name} className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0',
                      accentColors[i]
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
                        <div className={cn('h-full rounded-full', accentColors[i])}
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
  )
}
