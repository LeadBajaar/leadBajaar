'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  BarChart3, 
  Settings, 
  Plus, 
  Zap, 
  Database, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  LineChart as LineChartIcon,
  ShieldCheck,
  Send,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { integrationApi } from '@/lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { PixelTestConsole } from '@/components/meta-capi/PixelTestConsole';
import { ManualPixelDialog } from '@/components/meta-capi/ManualPixelDialog';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header/PageHeader';

interface CAPIMetrics {
  total_events: number;
  total_conversions: number;
  total_revenue: number;
  currency: string;
}

interface EventBreakdown {
  event_name: string;
  count: number;
}

interface ChartData {
  date: string;
  count: number;
}

export default function MetaCapiHubPage() {
  const router = useRouter();
  const [pixels, setPixels] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<CAPIMetrics | null>(null);
  const [breakdown, setBreakdown] = useState<EventBreakdown[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [showManualPixelDialog, setShowManualPixelDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, metricsRes] = await Promise.all([
        integrationApi.getConversionApiConfiguration(),
        integrationApi.getMetaPixelRoiSummary(30)
      ]);

      // Map manual configurations to the Pixel interface expected by sub-components
      const manualPixels = (configRes.configurations || []).map((c: any) => ({
        id: c.integration_id,
        pixel_id: c.pixel_id,
        name: c.page_name,
        ad_account_id: '',
        is_active: c.is_configured
      }));

      setPixels(manualPixels);
      setMetrics(metricsRes.summary || null);
      setBreakdown(metricsRes.breakdown || []);
      setChartData(metricsRes.chart_data || []);
      setAdAccounts([]); // Manual mode doesn't use OAuth ad accounts
    } catch (err: any) {
      toast.error('Failed to load CAPI dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPixels = async () => {
    try {
      setIsSyncing(true);
      await integrationApi.syncMetaPixels();
      toast.success('Pixels synced successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync pixels');
    } finally {
      setIsSyncing(false);
    }
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="flex flex-col flex-1 gap-4 sm:gap-5">
      <PageHeader
        title="Meta Conversions API Hub"
        description="Monitor server-side events, verify tracking accuracy, and optimize your Meta Ad performance."
        icon={<Zap className="h-6 w-6 text-primary" />}
        actions={
          <Button 
            variant="outline" 
            onClick={fetchData}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg font-semibold h-9 px-4 shadow-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Total Events */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Events (30d)</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics?.total_events || 0}</div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 flex items-center mt-1.5 uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Live server-side signals
            </p>
          </div>
        </div>

        {/* Stat 2: Total Conversions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Conversions</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics?.total_conversions || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center mt-1.5 uppercase tracking-wide">
              Matched attribution data
            </p>
          </div>
        </div>

        {/* Stat 3: Tracked Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tracked Revenue</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {metrics?.currency || 'INR'} {metrics?.total_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center mt-1.5 uppercase tracking-wide">
              From Purchase events
            </p>
          </div>
        </div>

        {/* Stat 4: Active Pixels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center shrink-0">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Pixels</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{pixels.filter(p => p.is_active).length}</div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center mt-1.5 uppercase tracking-wide">
              Of {pixels.length} total synced
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-0 rounded-2xl flex flex-col">
          <div className="p-5 pb-0">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-indigo-500" />
              Event Volume Trends
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Daily conversion events sent via server-side API.
            </p>
          </div>
          <div className="p-5 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="currentColor" 
                  className="opacity-50"
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="opacity-50"
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-0 rounded-2xl flex flex-col">
          <div className="p-5 pb-0">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Events Breakdown
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Distribution of event types across all pixels.
            </p>
          </div>
          <div className="p-5 h-[300px] w-full">
            {breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="event_name" 
                    type="category" 
                    stroke="currentColor" 
                    className="opacity-50"
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <BarChart3 className="h-12 w-12 mb-2" />
                <p>No event data found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="tester" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="tester" className="flex items-center gap-2 px-6 rounded-lg text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all">
            <Terminal className="h-4 w-4" />
            Testing Console
          </TabsTrigger>
          <TabsTrigger value="pixels" className="flex items-center gap-2 px-6 rounded-lg text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all">
            <Settings className="h-4 w-4" />
            Manage Pixels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tester" className="mt-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
            <PixelTestConsole 
              pixels={pixels} 
              adAccounts={adAccounts} 
              onRefreshPixels={fetchData} 
              isSyncingPixels={isSyncing} 
            />
          </div>
        </TabsContent>

        <TabsContent value="pixels" className="mt-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Active Meta Pixels</h3>
                <p className="text-[13px] text-slate-500 mt-1">
                  Toggle pixels to enable or disable server-side tracking for specific lead sources.
                </p>
              </div>
              <Button onClick={() => setShowManualPixelDialog(true)} className="bg-primary hover:bg-primary/90 text-white shrink-0 rounded-lg font-semibold shadow-sm h-9 px-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Pixel
              </Button>
            </div>
            <div className="p-5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50 dark:bg-slate-950/50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Pixel Name</th>
                      <th className="px-4 py-3">Pixel ID</th>
                      <th className="px-4 py-3">Ad Account</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {pixels.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          No pixels found. Click "Add Pixel" to configure one manually.
                        </td>
                      </tr>
                    ) : (
                      pixels.map((pixel) => (
                        <tr key={pixel.id} className="hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-4 font-semibold">{pixel.name}</td>
                          <td className="px-4 py-4 font-mono text-muted-foreground">{pixel.pixel_id}</td>
                          <td className="px-4 py-4 text-muted-foreground">{pixel.ad_account_id}</td>
                          <td className="px-4 py-4">
                            <span className={cn("text-[11px] font-bold tracking-wider px-2 py-1 rounded-md", pixel.is_active ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700")}>
                              {pixel.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={cn(
                                "h-8 px-3 rounded-lg text-xs font-semibold shadow-sm",
                                pixel.is_active 
                                  ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              )}
                              onClick={async () => {
                                try {
                                  await integrationApi.updateMetaPixel(pixel.id, { is_active: !pixel.is_active });
                                  toast.success(`Pixel ${pixel.is_active ? 'disabled' : 'enabled'}`);
                                  fetchData();
                                } catch (err: any) {
                                  toast.error(err.message);
                                }
                              }}
                            >
                              {pixel.is_active ? 'Disable' : 'Enable'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ManualPixelDialog 
        open={showManualPixelDialog} 
        onClose={() => setShowManualPixelDialog(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
