'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MessageSquare, Bot, ArrowRight, Activity, Trash2, Edit3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, QrCode } from 'lucide-react';
import Link from 'next/link';

interface Flow {
  id: number;
  name: string;
  trigger_keyword: string;
  match_type: string;
  required_state: string;
  next_state: string | null;
  reply_message: string;
  is_active: boolean;
  priority: number;
}

interface UserSession {
  userId: string;
  status: 'connected' | 'disconnected';
}

export default function WhatsAppBotPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  // Connection Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'qr' | 'success'>('idle');

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axios.get(`${WHATSAPP_BASE_URL}/dashboard/status`, {
        params: { userId: user.id }
      });
      const activeSessions = res.data.activeSessions || [];
      setSessions(activeSessions);
      if (activeSessions.length > 0 && !selectedUser) {
        setSelectedUser(activeSessions[0]);
      }
    } catch (err) {
      toast.error('Failed to connect to WhatsApp Service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchFlows(selectedUser);
    }
  }, [selectedUser]);

  const fetchFlows = async (userId: string) => {
    try {
      const res = await axios.get(`${WHATSAPP_BASE_URL}/chatbot/flows/${userId}`);
      setFlows(res.data.flows || []);
    } catch (err) {
      toast.error('Failed to load chatbot flows');
    }
  };

  const toggleFlow = async (flowId: number, isActive: boolean) => {
    try {
      await axios.patch(`${WHATSAPP_BASE_URL}/chatbot/flows/${flowId}/toggle`, {
        user_id: selectedUser,
        is_active: isActive
      });
      toast.success(isActive ? 'Flow enabled' : 'Flow disabled');
      fetchFlows(selectedUser!);
    } catch (err) {
      toast.error('Failed to update flow status');
    }
  };

  const deleteFlow = async (flowId: number) => {
    if (!confirm('Are you sure you want to delete this flow?')) return;
    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/chatbot/flows/${flowId}`, {
        data: { user_id: selectedUser }
      });
      toast.success('Flow deleted successfully');
      fetchFlows(selectedUser!);
    } catch (err) {
      toast.error('Failed to delete flow');
    }
  };

  const handleConnectRequest = async () => {
    if (!newUserId) {
      toast.error('Please enter a User ID');
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionStatus('idle');
      setQrCode(null);

      // Scoping: Use UserID as a prefix to ensure ownership
      const scopedId = `${user!.id}_${newUserId}`;

      // 1. Initialize session
      await axios.post(`${WHATSAPP_BASE_URL}/messages/connect`, { userId: scopedId });

      setConnectionStatus('qr');
      toast.info('Session initiated. Fetching QR code...');

      // 2. Start polling for QR and connection success
      startPolling(scopedId);
    } catch (err) {
      toast.error('Failed to initiate connection');
      setIsConnecting(false);
    }
  };

  const startPolling = (userId: string) => {
    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > 60) { // Timeout after 5 mins (5s * 60)
        clearInterval(interval);
        setIsConnecting(false);
        return;
      }

      try {
        // Check QR
        const qrRes = await axios.get(`${WHATSAPP_BASE_URL}/dashboard/qr/${userId}`);
        if (qrRes.data.qr) {
          setQrCode(qrRes.data.qr);
        }

        // Check if status changed to 'open'
        const statusRes = await axios.get(`${WHATSAPP_BASE_URL}/dashboard/status`);
        const activeSessions = statusRes.data.activeSessions || [];
        if (activeSessions.includes(userId)) {
          setConnectionStatus('success');
          clearInterval(interval);
          setIsConnecting(false);
          toast.success('WhatsApp Connected Successfully!');
          fetchSessions(); // Refresh the list
          setTimeout(() => setIsConnectModalOpen(false), 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">WhatsApp Pro Bot</h2>
          <p className="text-muted-foreground">
            Self-hosted automation engine with advanced session flows.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
                <QrCode className="mr-2 h-4 w-4" /> Connect New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Connect WhatsApp</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Enter a unique identifier for this account and scan the QR code.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 text-center">
                {connectionStatus === 'idle' && (
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="newId">Account ID (e.g. Phone or Name)</Label>
                    <div className="flex gap-2">
                      <input
                        id="newId"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. support_desk"
                      />
                      <Button onClick={handleConnectRequest} disabled={isConnecting}>
                        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get QR'}
                      </Button>
                    </div>
                  </div>
                )}

                {connectionStatus === 'qr' && (
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl mx-auto min-h-[250px] min-w-[250px] relative overflow-hidden">
                    {qrCode ? (
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-900 text-xs font-bold uppercase tracking-widest">Generating QR...</p>
                      </div>
                    )}
                    <div className="mt-4 flex items-center text-slate-500 text-[10px]">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Auto-refreshing every 5s
                    </div>
                  </div>
                )}

                {connectionStatus === 'success' && (
                  <div className="flex flex-col items-center justify-center p-8 text-emerald-400">
                    <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">Authenticated!</h3>
                    <p className="text-sm text-slate-400 mt-2">Redirecting to session view...</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {selectedUser && (
            <Link href={`/whatsapp-bot/builder?userId=${selectedUser}`}>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Open Visual Builder
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Sidebar: Active Accounts */}
        <Card className="col-span-2 shadow-xl border-white/5 bg-slate-900/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Bot className="mr-2 h-5 w-5 text-indigo-400" /> Connected Accounts
            </CardTitle>
            <CardDescription>Accounts running on your Baileys instance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {sessions.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-slate-800 rounded-lg">
                    No active sessions.<br />Connect one in Dashboard.
                  </div>
                )}
                {sessions.map((id) => (
                  <div
                    key={id}
                    onClick={() => setSelectedUser(id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedUser === id
                        ? 'bg-indigo-500/10 border-indigo-500/50'
                        : 'hover:bg-slate-800/50 border-transparent'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {id.includes('_') ? id.split('_')[1].substring(0, 1).toUpperCase() : id.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {id.includes('_') ? id.split('_')[1] : `Account ${id}`}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                          {connectionStatus === 'success' && selectedUser === id ? 'Connecting...' : 'Active Session'}
                        </p>
                      </div>
                    </div>
                    {selectedUser === id && (
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Area: Flow Overview */}
        <Card className="col-span-5 shadow-xl border-white/5 bg-slate-900/50 backdrop-blur-md overflow-hidden">
          <Tabs defaultValue="active" className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">Chatbot Flows</CardTitle>
                <CardDescription>
                  Current automation logic for <strong>{selectedUser || 'None'}</strong>
                </CardDescription>
              </div>
              <TabsList className="bg-slate-950/50 border border-slate-800">
                <TabsTrigger value="active">Active Flows</TabsTrigger>
                <TabsTrigger value="logs">Recent Hits</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-0">
              <TabsContent value="active" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {flows.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-2xl border-2 border-dashed border-slate-800">
                      <MessageSquare className="h-10 w-10 text-slate-700 mb-4" />
                      <p className="text-slate-400 font-medium">No flows created for this user.</p>
                      <Link href={`/whatsapp-bot/builder?userId=${selectedUser}`} className="mt-4">
                        <Button variant="secondary">Start Building</Button>
                      </Link>
                    </div>
                  )}
                  {flows.map((flow) => (
                    <div
                      key={flow.id}
                      className={`group flex items-start space-x-4 p-4 rounded-xl transition-all border bg-slate-950/50 ${flow.is_active ? 'border-indigo-500/20' : 'border-slate-800 opacity-60'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${flow.is_active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-600'}`}>
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200">{flow.name}</h4>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => toggleFlow(flow.id, !flow.is_active)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10" onClick={() => deleteFlow(flow.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <Badge variant="secondary" className="bg-slate-900 text-slate-400 hover:bg-slate-900 uppercase">
                            Trigger: {flow.trigger_keyword === '*' ? 'ANY' : flow.trigger_keyword}
                          </Badge>
                          <Badge variant="secondary" className="bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/30">
                            State: {flow.required_state}
                          </Badge>
                          {flow.next_state && (
                            <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/30">
                              <ArrowRight className="mr-1 h-3 w-3" /> Next: {flow.next_state}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-1 italic">
                          "{flow.reply_message}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="logs">
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground uppercase tracking-widest text-xs">
                  Live Session Intelligence coming soon
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
