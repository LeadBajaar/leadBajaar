'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Mail, Phone, Calendar, Building2,
  Users, CalendarCheck2, TrendingUp, Target,
  ArrowUpRight, ArrowDownRight, Zap,
  Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Overview } from '@/components/overview'
import { getDashboardStats } from '@/lib/api'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

// ── Types ─────────────────────────────────────────────────────
interface DashboardData {
  stats: any[]
  monthly_overview: any[]
  pipeline: any[]
  recent_activity: any[]
}

const demoDashboardData: DashboardData = {
  stats: [
    { label: 'Total Leads', value: '1,284', key: 'leads', trend: 'up', change: '+12%' },
    { label: 'Meetings Set', value: '42', key: 'meetings', trend: 'up', change: '+8%' },
    { label: 'Conversion Rate', value: '18.5%', key: 'conversion', trend: 'up', change: '+2.4%' },
    { label: 'Avg Response', value: '4m 12s', key: 'response', trend: 'down', change: '-15%' },
  ],
  monthly_overview: [
    { name: 'Jan', value: 400, meetings: 120 },
    { name: 'Feb', value: 520, meetings: 156 },
    { name: 'Mar', value: 480, meetings: 142 },
    { name: 'Apr', value: 610, meetings: 184 },
    { name: 'May', value: 590, meetings: 172 },
    { name: 'Jun', value: 720, meetings: 210 },
    { name: 'Jul', value: 840, meetings: 245 },
    { name: 'Aug', value: 950, meetings: 280 },
  ],
  pipeline: [
    { stage: 'New Leads', count: 450, pct: 100, color: 'bg-blue-500' },
    { stage: 'Qualified', count: 280, pct: 62, color: 'bg-indigo-500' },
    { stage: 'Negotiating', count: 120, pct: 26, color: 'bg-violet-500' },
    { stage: 'Closing', count: 42, pct: 9, color: 'bg-emerald-500' },
  ],
  recent_activity: [
    { label: 'Sarah Connor', sub: 'Scheduled a viewing for Hubli Residency', time: '2m ago', icon_name: 'CalendarCheck2', color: 'text-emerald-500' },
    { label: 'New Meta Lead', sub: 'Came through "Premium Villas" campaign', time: '15m ago', icon_name: 'Target', color: 'text-indigo-500' },
    { label: 'Vikram Singh', sub: 'Replied via WhatsApp integration', time: '1h ago', icon_name: 'MessageCircle', color: 'text-blue-500' },
    { label: 'Email Opened', sub: 'Amit Shah viewed "Pricing Catalog"', time: '3h ago', icon_name: 'Mail', color: 'text-slate-500' },
  ]
}

// ─────────────────────────────────────────────────────────────
// Skeleton components
// ─────────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

// Fixed heights to avoid SSR/client Math.random() hydration mismatch
const SKELETON_BAR_HEIGHTS = [55, 72, 40, 85, 62, 90, 48, 78, 65, 88, 70, 95]

function ChartSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-[300px] pt-4">
          {SKELETON_BAR_HEIGHTS.map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [todayLabel, setTodayLabel] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setTodayLabel(format(new Date(), 'EEEE, d MMM yyyy'))
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await getDashboardStats()
        // If data is empty or brand new, use high-fidelity demo data to show potential
        if (!statsData || !statsData.stats || statsData.stats.length === 0 || statsData.stats.every((s: any) => s.value == 0)) {
          setData(demoDashboardData)
          setIsDemo(true)
        } else {
          setData(statsData)
          setIsDemo(false)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setData(demoDashboardData) // Fallback to demo on error for preview
        setIsDemo(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) {
      if (user) {
        fetchDashboardData()
      } else {
        setIsLoading(false)
      }
    }
  }, [userLoading, user])

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : '?'

  const getStatIcon = (key: string) => {
    switch (key) {
      case 'leads': return { icon: Users, color: 'text-indigo-600', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40' };
      case 'meetings': return { icon: CalendarCheck2, color: 'text-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' };
      case 'conversion': return { icon: Target, color: 'text-violet-600', iconBg: 'bg-violet-100 dark:bg-violet-900/40' };
      case 'response': return { icon: Zap, color: 'text-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-900/20' };
      default: return { icon: Zap, color: 'text-slate-600', iconBg: 'bg-slate-100' };
    }
  }

  const getLucideIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.Zap;
    return Icon;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 h-full overflow-auto">

      {/* ── Welcome banner ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-52 mb-1.5" />
              <Skeleton className="h-4 w-72" />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Good evening, {user?.name?.split(' ')[0] ?? 'there'} 👋
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Here's what's happening with your leads today.
              </p>
            </>
          )}
        </div>
        {todayLabel && (
          <Badge
            variant="outline"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5"
          >
            <Clock className="h-3 w-3" />
            {todayLabel}
          </Badge>
        )}
        {isDemo && !isLoading && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ml-2">
            Demo Preview Mode
          </Badge>
        )}
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : data.stats.map((s) => {
            const { icon: Icon, color, iconBg } = getStatIcon(s.key);
            return (
              <Card
                key={s.label}
                className={cn(
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
                  'hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5',
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {s.label}
                    </span>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
                      <Icon className={cn('h-5 w-5', color)} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {s.value}
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    s.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                  )}>
                    {s.trend === 'up'
                      ? <ArrowUpRight className="h-3.5 w-3.5" />
                      : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {s.change} from last month
                  </div>
                </CardContent>
              </Card>
            )
          })
        }
      </div>

      {/* ── Chart + Profile row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">

        {/* Chart */}
        {isLoading ? (
          <div className="lg:col-span-4"><ChartSkeleton /></div>
        ) : (
          <Card className="lg:col-span-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Meeting & Lead Overview
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-0.5">
                    Monthly performance for current year
                  </CardDescription>
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />Leads
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Meetings
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pr-4 pt-2">
              <Overview data={data?.monthly_overview} />
            </CardContent>
          </Card>
        )}

        {/* Right column: Profile + Activity */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Account card */}
          {isLoading ? <ProfileSkeleton /> : user && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900">
                    <AvatarImage src={(user as any).avatar || ''} />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-base">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2.5 pt-1">
                  {[
                    { key: 'email', icon: Mail, text: user.email },
                    { key: 'phone', icon: Phone, text: (user as any).phone || 'Not provided' },
                    { key: 'company', icon: Building2, text: (user as any).company || 'Not provided' },
                    { key: 'member', icon: Calendar, text: `Member since ${format(new Date((user as any).created_at || new Date()), 'MMMM yyyy')}` },
                  ].map(({ key, icon: Icon, text }) => (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 truncate">{text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Pipeline + Activity row ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pipeline */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Lead Pipeline
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Current funnel breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data && data.pipeline.map((p) => (
                <div key={p.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{p.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">{p.count}</span>
                      <span className="text-slate-400 text-xs w-8 text-right">{p.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', p.color)}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Latest events in your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data && data.recent_activity.map((item, i) => {
                  const Icon = getLucideIcon(item.icon_name);
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        'bg-slate-100 dark:bg-slate-800',
                      )}>
                        <Icon className={cn('h-4 w-4', item.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{item.sub}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 mt-0.5">{item.time}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
