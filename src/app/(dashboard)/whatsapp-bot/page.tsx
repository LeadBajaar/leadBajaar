'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, MessageSquare, Bot, ArrowRight, Activity, Trash2, Edit3, Settings, Settings2, Zap, MessageCircle, Users, Rocket, RefreshCw, QrCode, Loader2, ArrowLeft, Play } from 'lucide-react';
import { WhatsAppBotChat } from '@/components/whatsapp-bot/WhatsAppBotChat';
import { WhatsAppBotGroups } from '@/components/whatsapp-bot/WhatsAppBotGroups';
import { WhatsAppBotCampaigns } from '@/components/whatsapp-bot/WhatsAppBotCampaigns';
import { WhatsAppConnectModal } from '@/components/whatsapp-bot/WhatsAppConnectModal';
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
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

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
  const { 
    user,
    hasFeature 
  } = useUser();
  const { 
    sessions, 
    ghostSessions,
    shredSession,
    setIsConnectModalOpen,
    selectedUser, 
    setSelectedUser, 
    flows, 
    loading,
    fetchSessions,
    toggleFlow,
    deleteFlow
  } = useWhatsApp();

  if (!user) return null;

  // Plan Guard: Use dynamic feature check
  if (!hasFeature('whatsapp_bot')) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/20">
        <Card className="max-w-md w-full border-dashed border-2 border-slate-200 dark:border-slate-800 shadow-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Unlock Automation</CardTitle>
            <CardDescription className="text-sm font-medium mt-2">
              The WhatsApp Bot and Sequence Tracer are exclusive to our Pro and Enterprise partners.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              {[
                "Unlimited Automation Sequences",
                "Recursive Journey Mapping",
                "Advanced Match Types (Regex/Contains)",
                "Live Chat & Multi-Agent Support"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ArrowRight className="h-3 w-3 text-emerald-600" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-8 px-8">
            <Link href="/billing" className="w-full">
              <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all text-sm uppercase tracking-widest">
                Upgrade to Pro
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Smart Sequence Tracer: Group nodes into logical journeys starting from 'START'
  const flowGroups = useMemo(() => {
    if (!flows.length) return [];

    const rootNodes = flows.filter(f => !f.required_state || f.required_state === 'START' || f.required_state === 'ALL');
    const childNodes = flows.filter(f => f.required_state && f.required_state !== 'START' && f.required_state !== 'ALL');
    
    return rootNodes.map(root => {
      const journey: Flow[] = [root];
      let currentState = root.next_state;
      
      // Trace the sequence (limited to avoid infinite loops)
      let depth = 0;
      while (currentState && depth < 20) {
        const nextNode = childNodes.find(n => n.required_state === currentState);
        if (nextNode && !journey.find(j => j.id === nextNode.id)) {
          journey.push(nextNode);
          currentState = nextNode.next_state;
          depth++;
        } else {
          break;
        }
      }

      return {
        id: root.id,
        name: root.name,
        is_active: root.is_active,
        trigger: root.trigger_keyword,
        match: root.match_type,
        rootMessage: root.reply_message,
        nodes: journey,
        fullPath: journey.map(n => n.trigger_keyword || '*').join(' → ')
      };
    }).sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
  }, [flows]);

  return (
    <div className="h-full flex flex-col overflow-hidden p-0 bg-slate-50/30 dark:bg-slate-950/20">
      <div className="flex-1 min-h-0 flex flex-col">
        <Card className="flex-1 flex flex-col shadow-none border-0 bg-transparent sm:bg-white dark:sm:bg-slate-900/50 backdrop-blur-md rounded-none overflow-hidden">
          <Tabs defaultValue="active" className="flex-1 flex flex-col min-h-0">
            <CardHeader className="shrink-0 px-2 sm:px-6 pb-2 sm:pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <TabsList className="bg-transparent h-12 p-0 gap-6 sm:gap-8 justify-start overflow-x-auto no-scrollbar">
                  <TabsTrigger 
                    value="active" 
                    className="h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-4 font-black text-[11px] uppercase tracking-widest text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Flows
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat" 
                    className="h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-4 font-black text-[11px] uppercase tracking-widest text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Live Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="groups" 
                    className="h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-4 font-black text-[11px] uppercase tracking-widest text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="campaigns" 
                    className="h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-4 font-black text-[11px] uppercase tracking-widest text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Broadcast
                  </TabsTrigger>
                  <TabsTrigger 
                    value="logs" 
                    className="h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-4 font-black text-[11px] uppercase tracking-widest text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Logs
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {/* Active Sessions */}
                  <div className="hidden lg:flex items-center gap-2">
                    {sessions.map(id => (
                      <div key={id} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-emerald-500/20 px-3 py-1 rounded-xl shadow-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">
                          {id.includes('_') ? id.split('_')[1] : id}
                        </span>
                        <Button 
                          variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-rose-500 rounded-md"
                          onClick={async () => {
                            if(confirm('Disconnect this node?')) {
                              try {
                                await axios.post(`${WHATSAPP_BASE_URL}/messages/logout`, { userId: id });
                                toast.success('Disconnected');
                                fetchSessions();
                              } catch (err) {
                                toast.error('Failed to disconnect');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Ghost Sessions */}
                    {ghostSessions.map(id => (
                      <div key={id} className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl opacity-60">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 italic uppercase tracking-tighter">
                          {id.includes('_') ? id.split('_')[1] : id}
                        </span>
                        <Button 
                          variant="ghost" size="icon" className="h-5 w-5 text-rose-400 hover:bg-rose-50 rounded-md"
                          onClick={() => shredSession(id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {sessions.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsConnectModalOpen(true)}
                      className="h-9 px-4 rounded-xl border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <QrCode className="mr-2 h-3.5 w-3.5" /> Connect
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6 sm:pt-4">
                  <TabsContent value="active" className="mt-0 space-y-4 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {!selectedUser ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="h-16 w-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Bot className="h-8 w-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Connect your WhatsApp to view flows</p>
                        </div>
                      ) : flowGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                          <MessageSquare className="h-10 w-10 text-slate-300 mb-4" />
                          <p className="text-slate-500 dark:text-slate-400 font-bold">No active automation flows detected.</p>
                          <Link href={`/whatsapp-bot/builder?userId=${selectedUser}`} className="mt-6">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition-all">Start Building</Button>
                          </Link>
                        </div>
                      ) : (
                        flowGroups.map((flow: any) => (
                          <Card key={flow.id} className={cn(
                            "group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden",
                            !flow.is_active && "opacity-60 grayscale-[0.5]"
                          )}>
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
                              <div className={cn(
                                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                                flow.is_active ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              )}>
                                <Zap className={cn("h-5 w-5", flow.is_active && "animate-pulse")} />
                              </div>
                              
                              <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{flow.name}</h4>
                                    <Badge variant="outline" className="text-[8px] font-black tracking-widest px-1.5 py-0 bg-slate-50 dark:bg-slate-800/50 border-none shrink-0">
                                      {flow.nodes.length} {flow.nodes.length === 1 ? 'STEP' : 'STEPS'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Link href={`/whatsapp-bot/builder?userId=${selectedUser}`}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                                        <Settings2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg transition-colors", flow.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400")} onClick={() => toggleFlow(flow.id, !flow.is_active)}>
                                      <Play className={cn("h-3.5 w-3.5", flow.is_active && "fill-emerald-500")} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50" onClick={() => deleteFlow(flow.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-none text-[9px] font-black px-2 py-0.5 shrink-0">
                                      WHEN: {flow.trigger === '*' ? 'ANYTHING' : flow.trigger.toUpperCase()}
                                    </Badge>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50" />
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                    {flow.rootMessage}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
                    {selectedUser && <WhatsAppBotChat userId={selectedUser} />}
                  </TabsContent>
                  <TabsContent value="groups" className="mt-0 focus-visible:outline-none">
                    {selectedUser && <WhatsAppBotGroups userId={selectedUser} />}
                  </TabsContent>
                  <TabsContent value="campaigns" className="mt-0 focus-visible:outline-none">
                    {selectedUser && <WhatsAppBotCampaigns userId={selectedUser} />}
                  </TabsContent>
                  <TabsContent value="logs" className="focus-visible:outline-none">
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50/30 dark:bg-slate-950/10 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Activity className="h-12 w-12 text-slate-200 dark:text-slate-800 mb-4 animate-pulse" />
                      <p className="font-black text-xs text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Neural Analytics Coming Soon</p>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      <WhatsAppConnectModal />
    </div>
  );
}
