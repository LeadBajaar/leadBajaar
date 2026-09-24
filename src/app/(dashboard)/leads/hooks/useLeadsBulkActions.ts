import { toast } from 'sonner';
import { bulkDeleteLeads, bulkUpdateLeadStage } from '@/lib/api';

interface UseLeadsBulkActionsProps {
  selectedLeads: number[];
  setSelectedLeads: (leads: number[]) => void;
  fetchLeads: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  handleError: (error: any, options?: any) => void;
  setShowStageChange: (show: boolean) => void;
  setSelectedStage: (stage: string | null) => void;
}

export function useLeadsBulkActions({
  selectedLeads,
  setSelectedLeads,
  fetchLeads,
  setCurrentPage,
  handleError,
  setShowStageChange,
  setSelectedStage
}: UseLeadsBulkActionsProps) {

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete the selected leads?')) return;

    try {
      await bulkDeleteLeads(selectedLeads);
      setCurrentPage(1);
      await fetchLeads();
      setSelectedLeads([]);
      toast.success("Leads deleted successfully");
    } catch (error: any) {
      handleError(error, { title: 'Batch Delete Failed' });
    }
  };

  const handleBulkStageChange = async (newStage: string) => {
    try {
      await bulkUpdateLeadStage(selectedLeads, newStage);
      setCurrentPage(1);
      await fetchLeads();
      setSelectedLeads([]);
      setShowStageChange(false);
      setSelectedStage(null);
      toast.success("Lead stages updated successfully");
    } catch (error: any) {
      handleError(error, { title: 'Bulk Update Failed' });
    }
  };

  return {
    handleBulkDelete,
    handleBulkStageChange
  };
}
