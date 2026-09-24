import { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Lead } from '../types';

import { useLeadFormDialogs } from './useLeadFormDialogs';
import { useStageDialogs } from './useStageDialogs';
import { useDataDialogs } from './useDataDialogs';
import { useActionDialogs } from './useActionDialogs';

interface UseLeadsPageDialogsProps {
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  fetchStagesData: () => Promise<void>;
  handleError: (error: any, options?: any) => void;
  setCurrentPage: (page: number) => void;
  selectedLeads: number[];
  stages: Record<string, { color: string; icon: LucideIcon; id?: number }>;
}

export function useLeadsPageDialogs(props: UseLeadsPageDialogsProps) {
  // Shared state for dialogs
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const stageDialogs = useStageDialogs({
    leads: props.leads,
    fetchLeads: props.fetchLeads,
    fetchStagesData: props.fetchStagesData,
    handleError: props.handleError,
    editingLead,
    setEditingLead,
    stages: props.stages
  });

  const formDialogs = useLeadFormDialogs({
    fetchLeads: props.fetchLeads,
    leads: props.leads,
    handleError: props.handleError,
    setEditingLead,
    setShowDealValue: stageDialogs.setShowDealValue
  });

  const dataDialogs = useDataDialogs({
    fetchLeads: props.fetchLeads,
    handleError: props.handleError
  });

  const actionDialogs = useActionDialogs({
    fetchLeads: props.fetchLeads,
    handleError: props.handleError,
    setCurrentPage: props.setCurrentPage,
    editingLead,
    setEditingLead,
    selectedLeads: props.selectedLeads
  });

  return {
    editingLead,
    setEditingLead,
    ...formDialogs,
    ...stageDialogs,
    ...dataDialogs,
    ...actionDialogs
  };
}
