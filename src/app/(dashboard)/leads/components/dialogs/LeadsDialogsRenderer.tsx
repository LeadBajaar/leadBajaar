import React from 'react';
import { StageManagerDialog } from './StageManagerDialog';
import { StageChangeDialog } from './StageChangeDialog';
import { DealValueDialog } from './DealValueDialog';
import { ImportLeadsDialog } from './ImportLeadsDialog';
import { FacebookRetrievalDialog } from './FacebookRetrievalDialog';
import { ExportLeadsDialog } from './ExportLeadsDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { BroadcastMessageDialog } from './BroadcastMessageDialog';
import { EditLeadDialog } from './EditLeadDialog';
import { AddLeadDialog } from './AddLeadDialog';
import { AssignAgentDialog } from './AssignAgentDialog';

import { Lead } from '../../types';
import { useLeadsPageDialogs } from '../../hooks/useLeadsPageDialogs';

interface LeadsDialogsRendererProps {
  dialogs: ReturnType<typeof useLeadsPageDialogs>;
  selectedLeadsCount: number;
  stages: any;
  teamMembers: any[];
  handleBulkStageChange: (stage: string) => void;
  fetchLeads: () => Promise<void>;
  handleImport: () => Promise<void>;
  handleExport: (exportAll?: boolean) => Promise<void>;
  handleRetrieveLeads: () => Promise<void>;
  confirmDelete: () => Promise<void>;
  handleBroadcast: () => Promise<void>;
}

export const LeadsDialogsRenderer: React.FC<LeadsDialogsRendererProps> = ({
  dialogs,
  selectedLeadsCount,
  stages,
  teamMembers,
  handleBulkStageChange,
  fetchLeads,
  handleImport,
  handleExport,
  handleRetrieveLeads,
  confirmDelete,
  handleBroadcast
}) => {
  const {
    editingLead,
    setEditingLead,
    
    // formDialogs
    showNewLead, setShowNewLead,
    newLead, setNewLead,
    formErrors, setFormErrors,
    isSubmitting,
    submitError,
    showEditLead, setShowEditLead,
    editedLead, setEditedLead,
    isUpdating,
    validateAndSubmit, handleUpdateLead,
    
    // stageDialogs
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
    isSavingDealValue,
    handleSaveDealValue, handleStageChange,
    handleAddStage, handleUpdateStage, handleSyncDefaultStages,
    handleEditStage, handleDeleteStage,
    
    // dataDialogs
    showMapping, setShowMapping,
    columnMapping, handleColumnMapChange,
    importStats,
    importError,
    isImporting,
    showGeneratingReport,
    showExportDialog, setShowExportDialog,
    isExporting,
    isExportSuccess,
    showFacebookRetrieval, setShowFacebookRetrieval,
    facebookForms,
    selectedForm, setSelectedForm,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    isRetrievingLeads,
    retrievalResults,
    showResults, setShowResults,
    showProgress,
    progress,
    progressMessage,
    resetImport,
    
    // actionDialogs
    deleteConfirmation, setDeleteConfirmation,
    showAssignAgent, setShowAssignAgent,
    isAssigning,
    showBroadcastDialog, setShowBroadcastDialog,
    templates,
    selectedTemplate, setSelectedTemplate,
    variables, setVariables,
    variableColumnMapping, setVariableColumnMapping,
    isLoadingTemplates,
    isSendingBroadcast,
    broadcastResponse, setBroadcastResponse,
    handleAssignAgent,
    extractVariables
  } = dialogs;

  return (
    <>
      <StageManagerDialog
        isOpen={showStageManager}
        onOpenChange={setShowStageManager}
        stages={stages}
        newStageName={newStageName}
        setNewStageName={setNewStageName}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedIcon={selectedIcon}
        editingStage={editingStage}
        setEditingStage={setEditingStage}
        editedStageName={editedStageName}
        setEditedStageName={setEditedStageName}
        editedStageColor={editedStageColor}
        setEditedStageColor={setEditedStageColor}
        handleUpdateStage={handleUpdateStage}
        handleAddStage={handleAddStage}
        handleEditStage={handleEditStage}
        handleDeleteStage={handleDeleteStage}
        onSyncDefault={handleSyncDefaultStages}
      />

      <StageChangeDialog
        isOpen={showStageChange}
        onOpenChange={setShowStageChange}
        leadName={editingLead ? editingLead.name : null}
        selectedLeadsCount={selectedLeadsCount}
        stages={stages}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        onConfirm={() => {
          if (selectedStage) {
            if (editingLead) {
              handleStageChange(editingLead.id, selectedStage);
            } else {
              handleBulkStageChange(selectedStage);
            }
          }
        }}
        onCancel={() => setShowStageChange(false)}
      />

      <DealValueDialog
        isOpen={showDealValue}
        onOpenChange={setShowDealValue}
        leadName={editingLead?.name || ''}
        dealValueAmount={dealValueAmount}
        setDealValueAmount={setDealValueAmount}
        recordInitialPayment={recordInitialPayment}
        setRecordInitialPayment={setRecordInitialPayment}
        initialPaymentAmount={initialPaymentAmount}
        setInitialPaymentAmount={setInitialPaymentAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSave={handleSaveDealValue}
        onCancel={() => {
          setShowDealValue(false);
          setEditingLead(null);
          setDealValueAmount('');
        }}
        isSaving={isSavingDealValue}
      />

      <ImportLeadsDialog
        showMapping={showMapping}
        setShowMapping={setShowMapping}
        resetImport={resetImport}
        importError={importError}
        columnMapping={columnMapping}
        handleColumnMapChange={handleColumnMapChange}
        isImporting={isImporting}
        handleImport={handleImport}
        importStats={importStats}
        showGeneratingReport={showGeneratingReport}
      />

      <FacebookRetrievalDialog
        showFacebookRetrieval={showFacebookRetrieval}
        setShowFacebookRetrieval={setShowFacebookRetrieval}
        facebookForms={facebookForms}
        selectedForm={selectedForm}
        setSelectedForm={setSelectedForm}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        isRetrievingLeads={isRetrievingLeads}
        handleRetrieveLeads={handleRetrieveLeads}
        retrievalResults={retrievalResults}
        showResults={showResults}
        showProgress={showProgress}
        progress={progress}
        progressMessage={progressMessage}
        setShowResults={setShowResults}
        fetchLeads={fetchLeads}
      />

      <ExportLeadsDialog
        isOpen={showExportDialog}
        onOpenChange={setShowExportDialog}
        selectedCount={selectedLeadsCount}
        isExporting={isExporting}
        isExportSuccess={isExportSuccess}
        onExport={handleExport}
        onCancel={() => setShowExportDialog(false)}
      />

      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
        leadName={deleteConfirmation.leadName}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, leadId: null, leadName: '' })}
      />

      <BroadcastMessageDialog
        isOpen={showBroadcastDialog}
        onOpenChange={setShowBroadcastDialog}
        selectedCount={selectedLeadsCount}
        templates={templates}
        isLoadingTemplates={isLoadingTemplates}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        variables={variables}
        setVariables={setVariables}
        variableColumnMapping={variableColumnMapping}
        setVariableColumnMapping={setVariableColumnMapping}
        isSendingBroadcast={isSendingBroadcast}
        broadcastResponse={broadcastResponse}
        setBroadcastResponse={setBroadcastResponse}
        onBroadcast={handleBroadcast}
        extractVariables={extractVariables}
      />

      <EditLeadDialog
        isOpen={showEditLead}
        onOpenChange={setShowEditLead}
        lead={editedLead}
        setLead={setEditedLead}
        stages={stages}
        isUpdating={isUpdating}
        onUpdate={handleUpdateLead}
        onCancel={() => setShowEditLead(false)}
      />

      <AddLeadDialog
        isOpen={showNewLead}
        onOpenChange={setShowNewLead}
        newLead={newLead}
        setNewLead={setNewLead}
        formErrors={formErrors as Record<string, string>}
        setFormErrors={(errors) => setFormErrors(errors as any)}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onSave={validateAndSubmit}
        onCancel={() => setShowNewLead(false)}
        stages={stages}
      />
      
      <AssignAgentDialog
        isOpen={showAssignAgent}
        onOpenChange={setShowAssignAgent}
        leadName={editingLead?.name || ''}
        currentAgentId={editingLead?.agent?.id || (editingLead?.user_id ? Number(editingLead.user_id) : null)}
        teamMembers={teamMembers}
        isAssigning={isAssigning}
        onAssign={handleAssignAgent}
        onCancel={() => setShowAssignAgent(false)}
      />
    </>
  );
};
