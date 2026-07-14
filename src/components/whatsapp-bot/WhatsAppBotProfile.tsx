'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Fingerprint, Trash2, QrCode, RefreshCw, AlertTriangle } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import axios from 'axios';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';

interface WhatsAppBotProfileProps {
  userId: string;
}

export function WhatsAppBotProfile({ userId }: WhatsAppBotProfileProps) {
  const { sessions, ghostSessions, historicalSessions, sessionDetails, shredSession, setPrefilledUserId, setIsConnectModalOpen, fetchSessions } = useWhatsApp();

  const details = sessionDetails[userId];
  const isActive = sessions.includes(userId);
  const isGhost = ghostSessions.includes(userId);
  const isHistorical = historicalSessions.includes(userId);

  const handleReconnectGhost = async () => {
    try {
      await axios.post(`${WHATSAPP_BASE_URL}/messages/connect`, { userId });
      toast.success('Reconnection initiated...');
      setTimeout(fetchSessions, 3000);
    } catch (err) {
      toast.error('Failed to reconnect');
    }
  };

  const handleDisconnect = async () => {
    if(confirm('Disconnect this WhatsApp account? It will require scanning QR code to reconnect.')) {
      try {
        await axios.post(`${WHATSAPP_BASE_URL}/messages/logout`, { userId }, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_SECRET}`
          }
        });
        toast.success('Disconnected');
        fetchSessions();
      } catch (err) {
        toast.error('Failed to disconnect');
      }
    }
  };

  const handleConnectHistorical = () => {
    setPrefilledUserId(userId.includes('_') ? userId.split('_')[1] : userId);
    setIsConnectModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 h-full">
      <div className="h-24 sm:h-32 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 relative shrink-0">
        <div className="absolute -bottom-8 left-6 sm:left-10">
          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white dark:bg-slate-950 rounded-3xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
            <User className="h-10 w-10 text-slate-300" />
          </div>
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          {isActive && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black px-3 py-1">ACTIVE</Badge>}
          {isGhost && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black px-3 py-1">DISCONNECTED (GHOST)</Badge>}
          {isHistorical && <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 font-black px-3 py-1 line-through">SHREDDED</Badge>}
        </div>
      </div>
      
      <div className="pt-12 pb-6 px-6 sm:px-10 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {details?.name || 'WhatsApp Account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Profile Overview & Connection Settings</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isActive && (
                <Button variant="outline" className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl font-bold" onClick={handleDisconnect}>
                  Log Out Session
                </Button>
              )}
              
              {isGhost && (
                <>
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 rounded-xl font-bold" onClick={handleReconnectGhost}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reconnect
                  </Button>
                  <Button variant="outline" className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl font-bold" onClick={() => shredSession(userId)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Shred Session
                  </Button>
                </>
              )}
              
              {isHistorical && (
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold" onClick={handleConnectHistorical}>
                  <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
                </Button>
              )}
            </div>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Identifier</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {userId.includes('_') ? userId.split('_')[1] : userId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {details?.phone ? `+${details.phone}` : 'Not Available (Requires Active Session)'}
                </p>
              </div>
            </div>
          </div>

          {!isActive && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="text-sm font-medium text-amber-700 dark:text-amber-500">
                <p className="font-bold mb-1">Session Disconnected</p>
                <p>To run campaigns or bot flows, you must reconnect the session.</p>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
