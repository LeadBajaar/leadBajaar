import { useState } from 'react';
import { toast } from 'sonner';
import { createLead, updateLead } from '@/lib/api';
import { Lead, NewLead, LeadFormErrors } from '../types';

interface UseLeadFormDialogsProps {
  fetchLeads: () => Promise<void>;
  leads: Lead[];
  handleError: (error: any, options?: any) => void;
  setEditingLead: (lead: Lead | null) => void;
  setShowDealValue: (show: boolean) => void;
}

export function useLeadFormDialogs({
  fetchLeads,
  leads,
  handleError,
  setEditingLead,
  setShowDealValue
}: UseLeadFormDialogsProps) {
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState<NewLead>({
    name: '',
    email: '',
    phone: '',
    company: '',
    stage: 'New',
    status: 'Warm',
    source: 'Website',
    city: '',
    profession: ''
  });
  const [formErrors, setFormErrors] = useState<LeadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showEditLead, setShowEditLead] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddLead = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await createLead({
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        company: newLead.company,
        stage: newLead.stage,
        status: newLead.status,
        source: newLead.source,
        city: newLead.city || '',
        profession: newLead.profession || '',
        notes: newLead.notes || ''
      });

      await fetchLeads();

      setShowNewLead(false);
      toast.success("Lead created successfully");

      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        stage: 'New',
        status: 'Warm',
        source: 'Website',
        city: '',
        profession: ''
      });
    } catch (error: any) {
      handleError(error, { title: 'Lead Creation Failed' });
      setIsSubmitting(false);
    }
  }

  const validateAndSubmit = async () => {
    setFormErrors({});
    const errors: LeadFormErrors = {};
    if (!newLead.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (newLead.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
      errors.email = 'Invalid email format';
    }
    if (!newLead.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(newLead.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await handleAddLead();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add lead");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditLead = (lead: Lead) => {
    setEditedLead({ ...lead })
    setShowEditLead(true)
  }

  const handleUpdateLead = async (updatedLead: Lead | null) => {
    if (!updatedLead) return

    try {
      setIsUpdating(true);
      const response = await updateLead(updatedLead.id, {
        name: updatedLead.name,
        email: updatedLead.email,
        phone: updatedLead.phone,
        company: updatedLead.company,
        stage: updatedLead.stage,
        status: (updatedLead.status === 'Hot' || updatedLead.status === 'Warm' || updatedLead.status === 'Cold')
          ? updatedLead.status
          : 'Cold',
        source: updatedLead.source,
        city: updatedLead.city || '',
        profession: updatedLead.profession || '',
        notes: updatedLead.notes || '',
        new_note: (updatedLead as any).new_note || '',
      })

      await fetchLeads()

      toast.success("Lead updated successfully")
      setShowEditLead(false)
      setEditedLead(null)

      const originalLead = leads.find(l => l.id === updatedLead.id);
      if ((updatedLead.stage === 'Deal Closed' || updatedLead.stage === 'Closed Won') &&
        originalLead && originalLead.stage !== 'Deal Closed' && originalLead.stage !== 'Closed Won') {
        setEditingLead(response);
        setShowDealValue(true);
      }
    } catch (error: any) {
      handleError(error, { title: 'Update Failed' });
    } finally {
      setIsUpdating(false);
    }
  }

  return {
    showNewLead, setShowNewLead,
    newLead, setNewLead,
    formErrors, setFormErrors,
    isSubmitting, setIsSubmitting,
    submitError, setSubmitError,
    showEditLead, setShowEditLead,
    editedLead, setEditedLead,
    isUpdating, setIsUpdating,
    handleAddLead, validateAndSubmit, handleEditLead, handleUpdateLead
  };
}
