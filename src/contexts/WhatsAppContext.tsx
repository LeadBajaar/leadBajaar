'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';

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

interface SessionDetail {
  whatsappId: string;
  name: string;
  phone: string;
}

interface WhatsAppContextType {
  sessions: string[];
  ghostSessions: string[];
  historicalSessions: string[];
  sessionDetails: Record<string, SessionDetail>;
  selectedUser: string | null;
  setSelectedUser: (id: string | null) => void;
  flows: Flow[];
  loading: boolean;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  prefilledUserId: string;
  setPrefilledUserId: (id: string) => void;
  fetchSessions: () => Promise<void>;
  fetchFlows: (userId: string) => Promise<void>;
  shredSession: (userId: string) => Promise<void>;
  toggleFlow: (flowId: number, isActive: boolean) => Promise<void>;
  deleteFlow: (flowId: number) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [sessions, setSessions] = useState<string[]>([]);
  const [ghostSessions, setGhostSessions] = useState<string[]>([]);
  const [historicalSessions, setHistoricalSessions] = useState<string[]>([]);
  const [sessionDetails, setSessionDetails] = useState<Record<string, SessionDetail>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [prefilledUserId, setPrefilledUserId] = useState('');

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axios.get(`${WHATSAPP_BASE_URL}/dashboard/status`, {
        params: { userId: user.id }
      });
      const activeSessions = res.data.activeSessions || [];
      const ghosts = res.data.ghostSessions || [];
      const historicals = res.data.historicalSessions || [];
      const details = res.data.sessionDetails || {};
      
      setSessions(activeSessions);
      setGhostSessions(ghosts);
      setHistoricalSessions(historicals);
      setSessionDetails(details);

      if (activeSessions.length > 0 && !selectedUser) {
        setSelectedUser(activeSessions[0]);
      }
    } catch (err) {
      console.warn('Failed to connect to WhatsApp Service', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedUser]);

  const fetchFlows = useCallback(async (userId: string) => {
    try {
      const res = await axios.get(`${WHATSAPP_BASE_URL}/chatbot/flows/${userId}`);
      setFlows(res.data.flows || []);
    } catch (err) {
      toast.error('Failed to load chatbot flows');
    }
  }, []);

  const shredSession = async (userId: string) => {
    if (!confirm(`CAUTION: This will permanently DELETE all session credentials and history files for "${userId.split('_')[1] || userId}". Proceed?`)) return;

    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/dashboard/session/${userId}`);
      toast.success('Session cleared successfully');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to shred session data');
    }
  };

  const toggleFlow = useCallback(async (flowId: number, isActive: boolean) => {
    if (!selectedUser) return;
    try {
      await axios.patch(`${WHATSAPP_BASE_URL}/chatbot/flows/${flowId}/toggle`, {
        user_id: selectedUser,
        is_active: isActive
      });
      toast.success(isActive ? 'Flow enabled' : 'Flow disabled');
      fetchFlows(selectedUser);
    } catch (err) {
      toast.error('Failed to update flow status');
    }
  }, [selectedUser, fetchFlows]);

  const deleteFlow = useCallback(async (flowId: number) => {
    if (!selectedUser) return;
    if (!confirm('Are you sure you want to delete this flow?')) return;
    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/chatbot/flows/${flowId}`, {
        data: { user_id: selectedUser }
      });
      toast.success('Flow deleted successfully');
      fetchFlows(selectedUser);
    } catch (err) {
      toast.error('Failed to delete flow');
    }
  }, [selectedUser, fetchFlows]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  useEffect(() => {
    if (selectedUser) {
      fetchFlows(selectedUser);
    }
  }, [selectedUser, fetchFlows]);

  return (
    <WhatsAppContext.Provider value={{
      sessions,
      ghostSessions,
      historicalSessions,
      sessionDetails,
      selectedUser,
      setSelectedUser,
      flows,
      loading,
      isConnectModalOpen,
      setIsConnectModalOpen,
      prefilledUserId,
      setPrefilledUserId,
      fetchSessions,
      fetchFlows,
      shredSession,
      toggleFlow,
      deleteFlow
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}
