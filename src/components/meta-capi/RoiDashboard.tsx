'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Loader2, TrendingUp, Zap, DollarSign, Target, RefreshCw,
    BarChart3, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import { integrationApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

interface RoiSummary {
    total_events: number
    total_conversions: number
    total_revenue: number
    currency: string
}

interface EventBreakdown {
    event_name: string
    count: number
}

interface DailyData {
    date: string
    count: number
}

interface RoiData {
    summary: RoiSummary
    breakdown: EventBreakdown[]
    chart_data: DailyData[]
}

const EVENT_COLORS: Record<string, string> = {
    Lead: 'bg-blue-500',
    PageView: 'bg-purple-500',
    Purchase: 'bg-green-500',
    CompleteRegistration: 'bg-amber-500',
    ViewContent: 'bg-slate-400',
}

const METRIC_ICONS = {
    events: Zap,
    conversions: Target,
    revenue: DollarSign,
}

export function RoiDashboard() {
    const { toast } = useToast()
    const [data, setData] = useState<RoiData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [days, setDays] = useState(30)

    useEffect(() => {
        fetchData()
    }, [days])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const response = await integrationApi.getMetaPixelRoiSummary(days)
            if (response.status === 'success') {
                setData(response)
            }
        } catch (error: any) {
            // If no data available yet, set empty state gracefully
            setData({
                summary: { total_events: 0, total_conversions: 0, total_revenue: 0, currency: 'INR' },
                breakdown: [],
                chart_data: []
            })
        } finally {
            setIsLoading(false)
        }
    }

    const maxCount = data?.chart_data?.reduce((m, d) => Math.max(m, d.count), 0) || 1
    const maxBreakdown = data?.breakdown?.reduce((m, b) => Math.max(m, b.count), 0) || 1

    const formatNumber = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return n.toString()
    }

    const formatCurrency = (n: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(n)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-extrabold tracking-tight">Conversion Analytics</h3>
                    <p className="text-sm text-muted-foreground">Performance data from your Meta Pixel & CAPI events.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={days.toString()} onValueChange={v => setDays(parseInt(v))}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="h-8">
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="border-none shadow-md animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
                                <div className="h-8 bg-slate-100 rounded w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Events */}
                        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200">
                                        {days}d
                                    </Badge>
                                </div>
                                <p className="text-3xl font-black tracking-tight mb-1">
                                    {formatNumber(data?.summary.total_events ?? 0)}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Total Events Tracked</p>
                            </CardContent>
                        </Card>

                        {/* Total Conversions */}
                        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                                        <Target className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200">
                                        CAPI
                                    </Badge>
                                </div>
                                <p className="text-3xl font-black tracking-tight mb-1">
                                    {formatNumber(data?.summary.total_conversions ?? 0)}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Conversions Captured</p>
                            </CardContent>
                        </Card>

                        {/* Total Revenue */}
                        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200">
                                        {data?.summary.currency || 'INR'}
                                    </Badge>
                                </div>
                                <p className="text-3xl font-black tracking-tight mb-1">
                                    {formatCurrency(data?.summary.total_revenue ?? 0, data?.summary.currency ?? 'INR')}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Total Conversion Value</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Daily Chart */}
                        <Card className="border-none shadow-md bg-white dark:bg-slate-900 lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" /> Daily Events ({days} days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!data?.chart_data?.length ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-slate-300">
                                        <BarChart3 className="h-10 w-10 mb-2" />
                                        <p className="text-sm text-slate-400">No event data yet. Fire some events to see the chart.</p>
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-end gap-1.5 pt-4">
                                        {data.chart_data.map((d, i) => {
                                            const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.date}: ${d.count} events`}>
                                                    <div className="w-full relative flex items-end" style={{ height: '160px' }}>
                                                        <div
                                                            className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-400"
                                                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                                                        />
                                                    </div>
                                                    {data.chart_data.length <= 14 && (
                                                        <span className="text-[8px] text-slate-400 rotate-45 origin-left">
                                                            {new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Event Breakdown */}
                        <Card className="border-none shadow-md bg-white dark:bg-slate-900 lg:col-span-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Event Types
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!data?.breakdown?.length ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-slate-300">
                                        <Target className="h-8 w-8 mb-2" />
                                        <p className="text-xs text-slate-400 text-center">No events tracked yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        {data.breakdown.map((b, i) => {
                                            const pct = maxBreakdown > 0 ? Math.round((b.count / maxBreakdown) * 100) : 0
                                            const color = EVENT_COLORS[b.event_name] || 'bg-slate-400'
                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{b.event_name}</span>
                                                        <span className="font-bold text-slate-500">{formatNumber(b.count)}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${color} transition-all duration-500`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Banner */}
                    {data?.summary.total_events === 0 ? (
                        <Card className="border-2 border-dashed border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
                            <CardContent className="py-8 flex flex-col items-center text-center gap-3">
                                <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
                                    <Zap className="h-7 w-7 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200">No Conversions Yet</h4>
                                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                        Start tracking by syncing your pixels and adding the script to your website, or fire a test event in the <strong>Pixels / CAPI</strong> tab.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-md bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-green-800 dark:text-green-300">Tracking is Live!</p>
                                    <p className="text-xs text-green-700/70 dark:text-green-400/70">
                                        Your pixels are sending events to Meta via CAPI. Check Meta Events Manager for real-time verification.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
