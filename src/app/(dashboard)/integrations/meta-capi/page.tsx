'use client';

import React, { useState, useEffect } from 'react';
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary fill-indigo-500/20" />
              Meta Conversions API Hub
            </h2>
            <p className="text-muted-foreground mt-1">
              Monitor server-side events, verify tracking accuracy, and optimize your Meta Ad performance.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchData}
            className="bg-background border-border hover:bg-accent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.total_events || 0}</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live server-side signals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ShieldCheck className="h-12 w-12 text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.total_conversions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Matched attribution data</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <BarChart3 className="h-12 w-12 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tracked Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics?.currency || 'INR'} {metrics?.total_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From Purchase events</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Database className="h-12 w-12 text-purple-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pixels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pixels.filter(p => p.is_active).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Of {pixels.length} total synced</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card border-border shadow-md min-w-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-indigo-400" />
              Event Volume Trends
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Daily conversion events sent via server-side API.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-2">
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
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card border-border shadow-md min-w-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Events Breakdown
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribution of event types across all pixels.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tester" className="w-full">
        <TabsList className="bg-card border border-border p-1">
          <TabsTrigger value="tester" className="flex items-center gap-2 px-6">
            <Terminal className="h-4 w-4" />
            Testing Console
          </TabsTrigger>
          <TabsTrigger value="pixels" className="flex items-center gap-2 px-6">
            <Settings className="h-4 w-4" />
            Manage Pixels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tester" className="mt-6">
          <PixelTestConsole 
            pixels={pixels} 
            adAccounts={adAccounts} 
            onRefreshPixels={fetchData} 
            isSyncingPixels={isSyncing} 
          />
        </TabsContent>

        <TabsContent value="pixels" className="mt-6">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-start sm:items-center justify-between">
              <div>
                <CardTitle>Active Meta Pixels</CardTitle>
                <CardDescription className="mt-1">
                  Toggle pixels to enable or disable server-side tracking for specific lead sources.
                </CardDescription>
              </div>
              <Button onClick={() => setShowManualPixelDialog(true)} className="bg-primary hover:bg-primary/90 text-white shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Pixel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Pixel Name</th>
                      <th className="px-4 py-3">Pixel ID</th>
                      <th className="px-4 py-3">Ad Account</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
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
                            <Badge className={pixel.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-accent text-muted-foreground border-border'}>
                              {pixel.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10 dark:text-indigo-400 dark:hover:text-indigo-300"
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
            </CardContent>
          </Card>
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
