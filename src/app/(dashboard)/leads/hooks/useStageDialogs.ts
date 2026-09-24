import { useState } from 'react';
import { toast } from 'sonner';
import { LucideIcon } from 'lucide-react';
import { updateLeadStage, createPayment, createStage, updateStage, deleteStage, syncDefaultStages } from '@/lib/api';
import { Lead, defaultStages, iconMapping } from '../types';
import { Stage as ApiStage } from '@/lib/api/types/stages.types';

interface UseStageDialogsProps {
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  fetchStagesData: () => Promise<void>;
  handleError: (error: any, options?: any) => void;
  editingLead: Lead | null;
  setEditingLead: (lead: Lead | null) => void;
  stages: Record<string, { color: string; icon: LucideIcon; id?: number }>;
}

export function useStageDialogs({
  leads,
  fetchLeads,
  fetchStagesData,
  handleError,
  editingLead,
  setEditingLead,
  stages
}: UseStageDialogsProps) {
  // Stage Manager State
  const [showStageManager, setShowStageManager] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedIcon] = useState<keyof typeof iconMapping>('User');
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editedStageName, setEditedStageName] = useState('');
  const [editedStageColor, setEditedStageColor] = useState('');

  // Stage Change State
  const [showStageChange, setShowStageChange] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Deal Value State
  const [showDealValue, setShowDealValue] = useState(false);
  const [dealValueAmount, setDealValueAmount] = useState('');
  const [recordInitialPayment, setRecordInitialPayment] = useState(false);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSavingDealValue, setIsSavingDealValue] = useState(false);

  const handleDealValueClick = (lead: Lead) => {
    setEditingLead(lead);
    setShowDealValue(true);
  }

  const handleSaveDealValue = async () => {
    if (!editingLead || !dealValueAmount) return;

    setIsSavingDealValue(true);
    try {
      const amount = parseFloat(dealValueAmount);

      await updateLeadStage(editingLead.id, 'Deal Closed', amount);

      if (recordInitialPayment && initialPaymentAmount) {
        await createPayment({
          lead_id: editingLead.id,
          amount: parseFloat(initialPaymentAmount),
          payment_method: paymentMethod,
          status: 'Completed',
          payment_date: new Date().toISOString().split('T')[0]
        });
      }

      await fetchLeads()

      toast.success(recordInitialPayment ? "Deal closed and payment recorded!" : "Deal closed successfully");
      setShowDealValue(false);
      setEditingLead(null);
      setDealValueAmount('');
      setInitialPaymentAmount('');
      setRecordInitialPayment(false);

    } catch (error: any) {
      handleError(error, { title: 'Deal Update Failed' });
    } finally {
      setIsSavingDealValue(false);
    }
  }

  const handleStageChange = async (leadId: number | undefined, newStage: string) => {
    if (typeof leadId !== 'number') return;

    try {
      if (newStage === 'Deal Closed' || newStage === 'Closed Won') {
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.stage !== 'Deal Closed' && lead.stage !== 'Closed Won') {
          setEditingLead(lead || null);
          setShowStageChange(false);
          setShowDealValue(true);
          return;
        }
      }

      await updateLeadStage(leadId, newStage);
      await fetchLeads()

      setShowStageChange(false);
      setEditingLead(null);
      setSelectedStage(null);

      toast.success("Lead stage has been updated successfully");

    } catch (error: any) {
      handleError(error, { title: 'Stage Update Failed' });
    }
  }

  const handleAddStage = async () => {
    if (newStageName && !stages[newStageName]) {
      try {
        await createStage({
          name: newStageName,
          color: selectedColor,
          icon: selectedIcon,
          order: Object.keys(stages).length + 1
        });
        await fetchStagesData();
        setNewStageName('')
        toast.success("Stage created successfully")
      } catch (error) {
        console.error('Failed to create stage:', error);
        toast.error("Failed to create stage")
      }
    }
  }

  const handleEditStage = (stageName: string) => {
    setEditingStage(stageName)
    setEditedStageName(stageName)
    setEditedStageColor(stages[stageName].color.split(' ')[0].replace('bg-', '').replace('-100', ''))
  }

  const handleUpdateStage = async () => {
    if (editedStageName && editingStage) {
      const stageConfig = stages[editingStage]
      if (!stageConfig.id) return

      try {
        await updateStage(stageConfig.id, {
          name: editedStageName,
          color: editedStageColor,
        });
        await fetchStagesData();
        setEditingStage(null)
        setEditedStageName('')
        setEditedStageColor('')
        toast.success("Stage updated successfully")
      } catch (error: any) {
        handleError(error, { title: 'Stage Config Error' });
      }
    }
  }

  const handleDeleteStage = async (stageName: string) => {
    const stageConfig = stages[stageName]
    if (!stageConfig.id) return

    if (!confirm(`Are you sure you want to delete the stage "${stageName}"?`)) return

    try {
      await deleteStage(stageConfig.id);
      await fetchStagesData();
      toast.success("Stage deleted successfully")
    } catch (error) {
      console.error('Failed to delete stage:', error);
      toast.error("Failed to delete stage")
    }
  }

  const handleSyncDefaultStages = async () => {
    try {
      await syncDefaultStages();
      await fetchStagesData();
      toast.success("Default stages synced successfully");
    } catch (error) {
      console.error('Failed to sync default stages:', error);
      toast.error("Failed to sync default stages");
    }
  }

  return {
    showStageManager, setShowStageManager,
    newStageName, setNewStageName,
    selectedColor, setSelectedColor,
    selectedIcon,
    editingStage, setEditingStage,
    editedStageName, setEditedStageName,
    editedStageColor, setEditedStageColor,
    showStageChange, setShowStageChange,
    selectedStage, setSelectedStage,
    showDealValue, setShowDealValue,
    dealValueAmount, setDealValueAmount,
    recordInitialPayment, setRecordInitialPayment,
    initialPaymentAmount, setInitialPaymentAmount,
    paymentMethod, setPaymentMethod,
    isSavingDealValue, setIsSavingDealValue,
    handleDealValueClick, handleSaveDealValue, handleStageChange,
    handleAddStage, handleEditStage, handleUpdateStage, handleDeleteStage, handleSyncDefaultStages
  };
}
