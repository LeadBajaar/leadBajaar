'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Trash2, 
  RefreshCcw, 
  Search, 
  Clock, 
  Terminal, 
  Database, 
  PieChart,
  ChevronDown,
  ChevronUp,
  XCircle,
  ShieldAlert,
  ChevronRight,
  Code
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { RoleGuard } from '@/components/RoleGuard';

interface AppErrorLog {
  time: string;
  env: string;
  level: string;
  message: string;
  details: any;
}

export default function ErrorMonitoringPage() {
  const [logs, setLogs] = useState<AppErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/errors');
      setLogs(response.data.logs || []);
    } catch (error) {
      toast.error('Failed to fetch error logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all log data? This cannot be undone.')) return;
    
    try {
      await api.delete('/errors/clear');
      setLogs([]);
      toast.success('Logs cleared successfully!');
    } catch (error) {
      toast.error('Failed to clear logs');
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.time.includes(searchTerm)
  );

  const getStatusColor = (message: string) => {
    if (message.includes('Crash')) return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (message.includes('422') || message.includes('Validation')) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    if (message.includes('401')) return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    return 'bg-blue-500/10 text-primary border-primary/20';
  };

  return (
    <RoleGuard allowedFeatures={['error_logs']}>
      <div className="p-6 md:p-10 space-y-8 flex-1">
        {/* Header section with glass effect */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--crm-border)] pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--crm-text-primary)] tracking-tight flex items-center gap-3">
              <ShieldAlert className="h-10 w-10 text-red-600" />
              Error Monitoring
            </h1>
            <p className="text-[var(--crm-text-secondary)] mt-2 text-lg">
              Live tracking and analysis of application-wide errors and crashes.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchLogs} 
              className="flex-1 md:flex-none border-[var(--crm-border)] h-11"
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="destructive" 
              onClick={clearLogs} 
              className="flex-1 md:flex-none h-11 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-[var(--crm-surface-1)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--crm-text-secondary)]">Total Errors</p>
                  <p className="text-3xl font-bold text-[var(--crm-text-primary)]">{logs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-[var(--crm-surface-1)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--crm-text-secondary)]">API Failures</p>
                  <p className="text-3xl font-bold text-[var(--crm-text-primary)]">
                    {logs.filter(l => l.message.includes('API')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[var(--crm-surface-1)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Terminal className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--crm-text-secondary)]">Client Crashes</p>
                  <p className="text-3xl font-bold text-[var(--crm-text-primary)]">
                    {logs.filter(l => l.message.includes('Crash')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[var(--crm-surface-1)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--crm-text-secondary)]">Environment</p>
                  <p className="text-3xl font-bold text-[var(--crm-text-primary)] uppercase">local</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Log Table */}
        <Card className="border-none shadow-xl bg-[var(--crm-surface-1)] overflow-hidden">
          <CardHeader className="border-b border-[var(--crm-border)] flex flex-row items-center justify-between bg-[var(--crm-surface-2)] px-6 py-5">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Terminal className="h-5 w-5 text-primary" />
                Recent Logs
              </CardTitle>
            </div>
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-secondary)]" />
              <Input 
                placeholder="Filter logs..." 
                className="pl-10 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-lg shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCcw className="h-12 w-12 text-primary animate-spin opacity-20" />
                <p className="text-[var(--crm-text-secondary)] font-medium animate-pulse">Streaming error logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-[var(--crm-surface-2)]">
                <CheckCircle2 className="h-16 w-16 text-emerald-500/40" />
                <div className="text-center">
                  <p className="text-xl font-bold text-[var(--crm-text-primary)]">Clean Slate!</p>
                  <p className="text-[var(--crm-text-secondary)]">No errors detected in the current log session.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[var(--crm-surface-2)]">
                    <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-[200px] font-bold text-[var(--crm-text-secondary)] uppercase text-[11px] tracking-wider">Timestamp</TableHead>
                      <TableHead className="w-[150px] font-bold text-[var(--crm-text-secondary)] uppercase text-[11px] tracking-wider text-center">Severity</TableHead>
                      <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase text-[11px] tracking-wider">Exception / Message</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, index) => (
                      <React.Fragment key={index}>
                        <TableRow 
                          className={`
                            group cursor-pointer transition-colors
                            ${expandedLog === index ? 'bg-[var(--crm-accent-soft)]/30' : 'hover:bg-[var(--crm-surface-3)]'}
                            border-[var(--crm-border)]
                          `}
                          onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                        >
                          <TableCell className="text-center">
                             {expandedLog === index ? <ChevronDown className="h-4 w-4 text-[var(--crm-accent)]" /> : <ChevronRight className="h-4 w-4 text-[var(--crm-text-secondary)] group-hover:text-[var(--crm-text-secondary)]" />}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-[var(--crm-text-secondary)]">
                            {log.time}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`px-2.5 py-0.5 border-2 shadow-sm font-bold tracking-tight ${getStatusColor(log.message)}`}>
                              {(log.level || 'info').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-[var(--crm-accent)]:text-indigo-400 transition-colors">
                              {log.message}
                            </div>
                            {log.details?.ip && (
                              <div className="text-[10px] text-[var(--crm-text-secondary)] font-mono mt-1 flex items-center gap-1.5">
                                <RefreshCcw className="h-3 w-3" />
                                IP: {log.details.ip}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                             {/* Action buttons could go here */}
                          </TableCell>
                        </TableRow>
                        
                        {/* Expandable Technical Details */}
                        {expandedLog === index && (
                          <TableRow className="bg-[var(--crm-surface-2)] border-none">
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--crm-surface-3)]/50 w-fit">
                                      <Terminal className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                                      <span className="text-[11px] font-bold text-[var(--crm-text-primary)] uppercase tracking-widest">Metadata</span>
                                    </div>
                                    <pre className="p-5 rounded-2xl bg-[var(--crm-surface-1)] border border-[var(--crm-border)] text-[12px] leading-relaxed overflow-x-auto shadow-inner text-[var(--crm-text-primary)] font-mono">
                                      {JSON.stringify(log.details?.data || { no_data: true }, null, 2)}
                                    </pre>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--crm-surface-3)]/50 w-fit">
                                      <Code className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                                      <span className="text-[11px] font-bold text-[var(--crm-text-primary)] uppercase tracking-widest">System Context</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                       <div className="p-4 rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
                                          <p className="text-[10px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-wider mb-1">Environment</p>
                                          <p className="font-mono text-sm font-bold text-[var(--crm-accent)]">{log.env}</p>
                                       </div>
                                       <div className="p-4 rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
                                          <p className="text-[10px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-wider mb-1">User IP</p>
                                          <p className="font-mono text-sm font-bold text-[var(--crm-accent)]">{log.details?.ip || 'N/A'}</p>
                                       </div>
                                       {log.details?.data?.status && (
                                         <div className="p-4 rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
                                            <p className="text-[10px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-wider mb-1">HTTP Status</p>
                                            <p className="font-mono text-sm font-bold text-red-600">{log.details.data.status}</p>
                                         </div>
                                       )}
                                       {log.details?.data?.time && (
                                         <div className="p-4 rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
                                            <p className="text-[10px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-wider mb-1">Client Time</p>
                                            <p className="font-mono text-[11px] font-bold text-indigo-400 line-clamp-1">{log.details.data.time}</p>
                                         </div>
                                       )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <div className="px-6 py-4 bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] text-[11px] font-bold text-[var(--crm-text-secondary)] flex items-center justify-between uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Live monitoring active
             </div>
             <div>
                Showing {filteredLogs.length} of {logs.length} events
             </div>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
