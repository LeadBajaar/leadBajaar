import { useState } from 'react';
import { toast } from 'sonner';
import { deleteLead, updateLead } from '@/lib/api';
import { integrationApi } from '@/lib/api/integrations.api';
import { Lead, MessageTemplate, BroadcastResponse } from '../types';

interface UseActionDialogsProps {
  fetchLeads: () => Promise<void>;
  handleError: (error: any, options?: any) => void;
  setCurrentPage: (page: number) => void;
  editingLead: Lead | null;
  setEditingLead: (lead: Lead | null) => void;
  selectedLeads: number[];
}

export function useActionDialogs({
  fetchLeads,
  handleError,
  setCurrentPage,
  editingLead,
  setEditingLead,
  selectedLeads
}: UseActionDialogsProps) {
  // Delete Dialog State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; leadId: number | null; leadName: string }>({
    isOpen: false,
    leadId: null,
    leadName: ''
  });

  // Assign Agent Dialog State
  const [showAssignAgent, setShowAssignAgent] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Broadcast Dialog State
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variableColumnMapping, setVariableColumnMapping] = useState<Record<string, string>>({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResponse, setBroadcastResponse] = useState<BroadcastResponse | null>(null);

  const handleDeleteLead = (lead: Lead) => {
    setDeleteConfirmation({ isOpen: true, leadId: lead.id, leadName: lead.name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.leadId) return;

    try {
      await deleteLead(deleteConfirmation.leadId);
      setCurrentPage(1)
      await fetchLeads();

      toast.success("Lead deleted successfully");
    } catch (error: any) {
      handleError(error, { title: 'Delete Failed' });
    } finally {
      setDeleteConfirmation({ isOpen: false, leadId: null, leadName: '' });
    }
  }

  const handleAssignAgentClick = (lead: Lead) => {
    setEditingLead(lead);
    setShowAssignAgent(true);
  }

  const handleAssignAgent = async (agentId: string) => {
    if (!editingLead) return;
    try {
      setIsAssigning(true);
      const userId = agentId === 'unassign' ? null : parseInt(agentId);
      await updateLead(editingLead.id, { user_id: userId as any });
      toast.success(userId ? "Lead assigned successfully" : "Lead unassigned successfully");
      setShowAssignAgent(false);
      fetchLeads();
    } catch (error: any) {
      handleError(error, { title: 'Assignment Failed' });
    } finally {
      setIsAssigning(false);
    }
  }

  const handleBroadcast = async () => {
    if (!selectedTemplate || selectedLeads.length === 0) return;

    setIsSendingBroadcast(true);
    setBroadcastResponse(null);

    try {
      const broadcastData = {
        template_id: String(selectedTemplate.id),
        lead_ids: selectedLeads,
        variables: variables,
        variable_column_mapping: variableColumnMapping
      };

      await integrationApi.sendBroadcast(broadcastData);

      setBroadcastResponse({
        success: true,
        message: `Successfully initiated broadcast to ${selectedLeads.length} leads`
      });

    } catch (error: any) {
      setBroadcastResponse({
        success: false,
        error: error.message || "Failed to send broadcast"
      });
    } finally {
      setIsSendingBroadcast(false);
    }
  }

  const extractVariables = (template: MessageTemplate): string[] => {
    const variableRegex = /{{([^}]+)}}/g;
    const bodyComponent = template.components?.find(c => c.type === 'BODY');
    if (!bodyComponent || !bodyComponent.text) return [];
    
    const matches = bodyComponent.text.match(variableRegex);
    if (!matches) return [];
    
    return Array.from(new Set(matches.map((match: string) => match.replace(/[{}]/g, ''))));
  }

  return {
    deleteConfirmation, setDeleteConfirmation,
    showAssignAgent, setShowAssignAgent,
    isAssigning, setIsAssigning,
    showBroadcastDialog, setShowBroadcastDialog,
    templates, setTemplates,
    selectedTemplate, setSelectedTemplate,
    variables, setVariables,
    variableColumnMapping, setVariableColumnMapping,
    isLoadingTemplates, setIsLoadingTemplates,
    isSendingBroadcast, setIsSendingBroadcast,
    broadcastResponse, setBroadcastResponse,
    handleDeleteLead, confirmDelete,
    handleAssignAgentClick, handleAssignAgent,
    handleBroadcast, extractVariables
  };
}
