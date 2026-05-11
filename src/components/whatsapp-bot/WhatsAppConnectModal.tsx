'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Bot, QrCode, Loader2, RefreshCw, Activity } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

export function WhatsAppConnectModal() {
  const { user } = useUser();
  const { isConnectModalOpen, setIsConnectModalOpen, fetchSessions } = useWhatsApp();
  const [newUserId, setNewUserId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'qr' | 'success'>('idle');

  const handleConnectRequest = async () => {
    if (!newUserId) {
      toast.error('Please enter a User ID');
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionStatus('idle');
      setQrCode(null);

      const scopedId = `${user!.id}_${newUserId}`;
      await axios.post(`${WHATSAPP_BASE_URL}/messages/connect`, { userId: scopedId });

      setConnectionStatus('qr');
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
      if (pollCount > 60) {
        clearInterval(interval);
        setIsConnecting(false);
        return;
      }

      try {
        const qrRes = await axios.get(`${WHATSAPP_BASE_URL}/dashboard/qr/${userId}`);
        if (qrRes.data.qr) {
          setQrCode(qrRes.data.qr);
        }

        const statusRes = await axios.get(`${WHATSAPP_BASE_URL}/dashboard/status`);
        const activeSessions = statusRes.data.activeSessions || [];
        if (activeSessions.includes(userId)) {
          setConnectionStatus('success');
          clearInterval(interval);
          setIsConnecting(false);
          toast.success('WhatsApp Connected Successfully!');
          fetchSessions();
          setTimeout(() => {
            setIsConnectModalOpen(false);
            setConnectionStatus('idle');
            setQrCode(null);
            setNewUserId('');
          }, 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  return (
    <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Connect WhatsApp</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
            Enter a unique identifier for this account and scan the QR code.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 text-center">
          {connectionStatus === 'idle' && (
            <div className="grid gap-3 text-left">
              <Label htmlFor="newId" className="text-xs font-bold uppercase tracking-widest text-slate-500">Account Identifier</Label>
              <div className="flex flex-col gap-3">
                <input
                  id="newId"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="e.g. support_desk or phone"
                />
                <Button onClick={handleConnectRequest} disabled={isConnecting} className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/20 transition-all">
                  {isConnecting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting Engine...</>
                  ) : 'Initialize Session'}
                </Button>
              </div>
            </div>
          )}

          {connectionStatus === 'qr' && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl mx-auto min-h-[280px] min-w-[280px] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {qrCode ? (
                <div className="p-4 bg-white rounded-xl shadow-xl ring-1 ring-slate-200">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-6" />
                    <Bot className="h-5 w-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest animate-pulse">Generating Secure QR...</p>
                </div>
              )}
              <div className="mt-6 flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Auto-refreshing every 5s
              </div>
            </div>
          )}

          {connectionStatus === 'success' && (
            <div className="flex flex-col items-center justify-center p-8 text-emerald-500">
              <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                <Activity className="h-10 w-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black">Authenticated!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">Redirecting to session view...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
