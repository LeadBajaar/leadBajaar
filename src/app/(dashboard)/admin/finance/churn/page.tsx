'use client'

import { useState, useEffect, useCallback } from 'react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  UserX, AlertCircle, RefreshCw, Phone, Mail,
  ArrowRight, CheckCircle, Info, TrendingDown,
  Activity, Zap, UserMinus, Search,
} from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

export default function ChurnPage() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getChurnLog()
      setData(res)
    } catch {
      toast.error('Failed to load churn data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDetect = async () => {
    try {
      setDetecting(true)
      const res = await financeApi.detectChurn()
      toast.success(res.message)
      fetchData()
    } catch {
      toast.error('Detection failed')
    } finally {
      setDetecting(false)
    }
  }

  if (loading && !data) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )

  const { churns, metrics, at_risk, win_back } = data ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Churn & Retention</h2>
          <p className="text-sm text-muted-foreground">Monitor lost customers and high-risk subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDetect} disabled={detecting} variant="outline" size="sm" className="h-9 gap-1">
            <Search className="h-3.5 w-3.5" /> {detecting ? 'Detecting...' : 'Detect Churn'}
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm" className="h-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Churn Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200/50 bg-gradient-to-br from-red-50/50 dark:from-red-950/20">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Churn Rate</span>
              <div className="h-7 w-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{metrics?.churn_rate}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Target: &lt; 5% per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Lost MRR</p>
            <p className="text-2xl font-bold text-red-500">{fmt(metrics?.churned_mrr)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{metrics?.churned_count} companies lost this month</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">At-Risk MRR</p>
            <p className="text-2xl font-bold text-amber-600">{fmt(at_risk?.reduce((s: number, c: any) => s + (c.plan_price || 0), 0))}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{at_risk?.length} companies expiring within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Recoverable</p>
            <p className="text-2xl font-bold text-primary">{fmt(win_back?.reduce((s: number, c: any) => s + (c.monthly_value || 0), 0))}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Churned in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At Risk List */}
        <Card>
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
              High-Risk Subscriptions (Expiring Soon)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {at_risk?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No high-risk accounts found ✓</div>
              ) : at_risk?.map((comp: any) => (
                <div key={comp.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{comp.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="px-1 py-0 h-4 capitalize">{comp.plan}</Badge>
                      <span>Expires {comp.expires_at?.split('T')[0]}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild>
                      <a href={`mailto:${comp.owner?.email}`} title="Email Customer"><Mail className="h-4 w-4" /></a>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" title="Contact Support">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Win-back / Reactivation Opportunity */}
        <Card>
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Win-Back Opportunities (Recent Churn)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {win_back?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No recent churn recorded</div>
              ) : win_back?.map((log: any) => (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{log.company?.name}</p>
                    <p className="text-[10px] text-muted-foreground">Churned on {log.churned_at} • Reason: <span className="capitalize">{log.reason?.replace('_',' ')}</span></p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/10">
                    Recover {fmt(log.monthly_value)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Churn Log */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold">Churn Log</h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Workspace</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Churn Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Value</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {churns?.data?.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No churn history found</td></tr>
                  ) : churns?.data?.map((log: any) => (
                    <tr key={log.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium">{log.company?.name}</td>
                      <td className="p-3 capitalize text-xs">{log.plan}</td>
                      <td className="p-3 text-xs text-muted-foreground">{log.churned_at}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] capitalize font-normal border-muted-foreground/30">
                          {log.reason?.replace('_',' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-semibold text-red-500">{fmt(log.monthly_value)}</td>
                      <td className="p-3 text-right">
                        {log.reactivated_at ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50">Reactivated</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">Churned</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
