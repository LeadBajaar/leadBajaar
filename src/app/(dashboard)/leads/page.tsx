'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableColumnToggle } from '@/components/ui/table-column-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  User, Mail, Phone, Building2, Tag, Globe,
  CheckCircle, Clock, Star, AlertCircle, Globe2,
  Facebook, Linkedin, MonitorSmartphone, MessageSquare,
  Pencil, Trash, FileDown, Search,
  Settings2, Plus, Loader2, X, FileSpreadsheet,
  CheckCircle2, Flame, ThermometerSun, Snowflake, Thermometer,
  XCircle, RefreshCcw, Calendar as CalendarIcon,
  FileUp,
  Computer,
  Map,
  IndianRupee,
  Wallet,
  UserCheck
} from 'lucide-react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  createLead,
  type CreateLeadDto,
  getLeads,
  deleteLead,
  updateLead,
  bulkDeleteLeads,
  bulkUpdateLeadStatus,
  bulkUpdateLeadStage,
  updateLeadStage,
  importLeads,
  exportLeads,
  integrationApi,
  createPayment,
  getStages,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
  syncDefaultStages,
  type Stage as ApiStage,
  teamApi
} from '@/lib/api'
import { LeadsMobileView } from './LeadsMobileView'
import { KanbanBoard } from './KanbanBoard'
import { MobileFilterBottomSheet } from './mobile/MobileFilterBottomSheet'
import { MobileBulkActionBar } from './mobile/MobileBulkActionBar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { RoleGuard } from '@/components/RoleGuard'
import { handleError as baseHandleError } from '@/utils/handleError'
import { useErrorHandler } from '@/utils/useErrorHandler'
import { logger } from '@/utils/logger'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns'
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
// import { addDays } from "date-fns" // Add this import

import {
  Lead, NewLead, ColumnMapping, ImportError, ImportStats, TemplateComponent, MessageTemplate,
  columns, temperatureConfig, defaultStages, sourceConfig, iconMapping, LeadFormErrors, BroadcastResponse
} from './types'
import { LeadsHeader } from './LeadsHeader'
import { LeadsDialogsRenderer } from './components/dialogs/LeadsDialogsRenderer'
import { useLeadsPageDialogs } from './hooks/useLeadsPageDialogs'
import { useLeadsBulkActions } from './hooks/useLeadsBulkActions'
import { useLeadsData } from './hooks/useLeadsData'
import { parseCSVContent, prepareImportData } from '@/lib/leads/csv-import'
import { LeadsFilters } from './LeadsFilters'
import { LeadsTable, LeadsTableSkeleton } from './LeadsTable'
import { PaginationControls } from './components/PaginationControls'
import { toTelHref, toWhatsAppPhone } from '@/lib/phone'

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {message}
    </AlertDescription>
  </Alert>
)

export default function LeadsPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const leadsData = useLeadsData(isMobile);
  const {
    leads, setLeads,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    visibleColumns, setVisibleColumns,
    viewMode, setViewMode,
    currentPage, setCurrentPage,
    isInitialLoading, setIsInitialLoading,
    itemsPerPage, setItemsPerPage,
    isLoading, setIsLoading,
    totalItems, setTotalItems,
    totalPages, setTotalPages,
    error, setError,
    filters, setFilters,
    debouncedSearch,
    isSearching, setIsSearching,
    isMobileFilterOpen, setIsMobileFilterOpen,
    handleFilterChange, clearFilters,
    fetchLeads, fetchLeadsConfig
  } = leadsData;

  // Add ref for file input
  const resultsSectionRef = useRef<HTMLDivElement>(null)

  // Sticky horizontal scrollbar refs
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollbarRef = useRef<HTMLDivElement>(null)
  const tableInnerRef = useRef<HTMLDivElement>(null)


  // Add new state variables

  // Add new state for templates loading

  // Add these new state variables at the top of your component

  const [stages, setStages] = useState<Record<string, { color: string; icon: LucideIcon; id?: number }>>(defaultStages);
  const [stagesList, setStagesList] = useState<ApiStage[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Sync horizontal scroll between table body and sticky bottom scrollbar
  useEffect(() => {
    const tableEl = tableScrollRef.current
    const bottomEl = bottomScrollbarRef.current
    const innerEl = tableInnerRef.current
    if (!tableEl || !bottomEl || !innerEl) return

    // Update spacer width whenever table content changes
    const updateWidth = () => {
      innerEl.style.width = tableEl.scrollWidth + 'px'
    }
    updateWidth()

    const syncFromTable = () => {
      if (bottomEl.scrollLeft !== tableEl.scrollLeft)
        bottomEl.scrollLeft = tableEl.scrollLeft
    }
    const syncFromBottom = () => {
      if (tableEl.scrollLeft !== bottomEl.scrollLeft)
        tableEl.scrollLeft = bottomEl.scrollLeft
    }

    tableEl.addEventListener('scroll', syncFromTable)
    bottomEl.addEventListener('scroll', syncFromBottom)

    // Use ResizeObserver to keep spacer width in sync as columns change
    const ro = new ResizeObserver(updateWidth)
    ro.observe(tableEl)

    return () => {
      tableEl.removeEventListener('scroll', syncFromTable)
      bottomEl.removeEventListener('scroll', syncFromBottom)
      ro.disconnect()
    }
  }, [leads, visibleColumns])

  const { handleError } = useErrorHandler();

  // Add these state variables near your other states

  // State to hold the CSV data and column mappings
  const [csvData, setCsvData] = useState<string[][]>([]);



  // Move all function definitions here
 
  const fetchStagesData = async () => {
     try {
       const data = await getStages();
       setStagesList(data);
       
       if (data.length > 0) {
         const stagesRecord: Record<string, { color: string; icon: LucideIcon; id?: number }> = {};
         data.forEach(s => {
           stagesRecord[s.name] = {
             id: s.id,
             color: s.color.startsWith('bg-') 
               ? s.color 
               : `bg-${s.color}-500 text-white font-extrabold border-none hover:bg-${s.color}-600`,
             icon: iconMapping[s.icon as keyof typeof iconMapping] || User
           };
         });
         setStages(stagesRecord);
       }
     } catch (error) {
       // Silent error for stages fetch as it uses defaults anyway
     }
   };

  const fetchTeamMembers = async () => {
    try {
      const members = await teamApi.getMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to fetch team members:', (error as any)?.message || error);
    }
  };

  const dialogs = useLeadsPageDialogs({
    leads,
    fetchLeads,
    fetchStagesData,
    handleError,
    setCurrentPage,
    selectedLeads,
    stages
  });
  
  const {
    editingLead,
    setEditingLead,
    
    // formDialogs
    showNewLead, setShowNewLead,
    newLead, setNewLead,
    formErrors, setFormErrors,
    isSubmitting, setIsSubmitting,
    submitError, setSubmitError,
    showEditLead, setShowEditLead,
    editedLead, setEditedLead,
    isUpdating, setIsUpdating,
    handleAddLead, validateAndSubmit, handleEditLead, handleUpdateLead,
    
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
    isSavingDealValue, setIsSavingDealValue,
    handleDealValueClick, handleSaveDealValue, handleStageChange,
    handleAddStage, handleEditStage, handleUpdateStage, handleDeleteStage, handleSyncDefaultStages,
    
    // dataDialogs
    fileInputRef,
    file, setFile,
    preview, setPreview,
    showMapping, setShowMapping,
    columnMapping, setColumnMapping,
    importStats, setImportStats,
    importError, setImportError,
    isImporting, setIsImporting,
    showGeneratingReport, setShowGeneratingReport,
    showExportDialog, setShowExportDialog,
    isExporting, setIsExporting,
    isExportSuccess, setIsExportSuccess,
    showFacebookRetrieval, setShowFacebookRetrieval,
    facebookForms, setFacebookForms,
    selectedForm, setSelectedForm,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    isRetrievingLeads, setIsRetrievingLeads,
    retrievalResults, setRetrievalResults,
    showResults, setShowResults,
    showProgress, setShowProgress,
    progress, setProgress,
    progressMessage, setProgressMessage,
    handleFileChange, handleColumnMapChange, resetImport, handleImportClick, handleRetrieveLeads,
    
    // actionDialogs
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
  } = dialogs;

  const { handleBulkDelete, handleBulkStageChange } = useLeadsBulkActions({
    selectedLeads,
    setSelectedLeads,
    fetchLeads,
    setCurrentPage,
    handleError,
    setShowStageChange,
    setSelectedStage
  });

  useEffect(() => {
    fetchStagesData();
    fetchTeamMembers();
    fetchLeads();
  }, [currentPage, itemsPerPage, debouncedSearch, filters.status, filters.stage, filters.source, filters.dateRange, filters.createdAt]);

  useEffect(() => {
    if (showDealValue && editingLead) {
      setDealValueAmount(editingLead.deal_value?.toString() || '');
    }
  }, [showDealValue, editingLead]);

  const handleDelete = (lead: Lead) => {
    setDeleteConfirmation({
      isOpen: true,
      leadId: lead.id,
      leadName: lead.name
    });
  };


  const handleEdit = (lead: Lead) => {
    setEditedLead({ ...lead });
    setEditingLead(lead);
    setShowEditLead(true);
  };

  const handleWhatsAppClick = (lead: Lead) => {
    window.open(`https://wa.me/${toWhatsAppPhone(lead.phone)}`, '_blank');
  };



  const handleCallClick = (lead: Lead) => {
    if (!lead.phone) return;

    const a = document.createElement('a');
    a.href = toTelHref(lead.phone);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };




  const handleImport = async () => {
    if (!file || isImporting) return;

    setIsImporting(true);
    setShowGeneratingReport(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          let csv = '';
          if (file.name.match(/\.xlsx?$/i)) {
             const XLSX = await import('xlsx');
             const data = new Uint8Array(event.target?.result as ArrayBuffer);
             const workbook = XLSX.read(data, { type: 'array' });
             csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
          } else {
             csv = event.target?.result as string;
          }
          
          const leads = prepareImportData(csv, columnMapping);
          
          if (leads.length === 0) {
            setIsImporting(false);
            setShowGeneratingReport(false);
            return;
          }

          const response = await importLeads({ leads });

          setImportStats({
            totalRows: leads.length,
            successfulRows: response.successful || 0,
            skippedRows: response.skipped || 0,
            errors: response.errors || [],
            skippedColumns: columnMapping
              .filter(m => m.leadField === 'skip')
              .map(m => m.csvHeader)
          });

          setCurrentPage(1)
          await fetchLeads();

          toast.success(`Successfully imported ${response.successful} leads`);

        } catch (error: any) {
          setImportError(error.message || 'Failed to import leads');
          handleError(error, { title: 'Import Failed' });
        }

        setIsImporting(false);
        setShowGeneratingReport(false);
      };

      reader.onerror = () => {
        setImportError('Failed to read the file');
        setIsImporting(false);
        setShowGeneratingReport(false);
      };

      if (file.name.match(/\.xlsx?$/i)) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }

    } catch (error: any) {
      console.error('Import failed:', error);
      setImportError(error.message || 'Failed to import leads');
      setIsImporting(false);
      setShowGeneratingReport(false);
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns(current =>
      current.includes(columnId)
        ? current.filter(id => id !== columnId)
        : [...current, columnId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };



  const handleExport = async (exportAll: boolean = false) => {
    try {
      setIsExporting(true);
      await exportLeads(exportAll ? undefined : selectedLeads);

      toast.success("Leads exported successfully");
      setIsExportSuccess(true);
      setTimeout(() => {
        setIsExportSuccess(false);
        setShowExportDialog(false);
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };




  const fetchFacebookForms = async () => {
    try {
      const response = await integrationApi.getFacebookLeadForms();
      setFacebookForms(response.forms || []);

      if (response.forms && response.forms.length === 0 && response.debug_info) {
        toast.error(`${response.message} (Found ${response.debug_info.total_integrations} total integrations, types: ${response.debug_info.integration_types.join(', ')})`);
      }
    } catch (error: any) {
      handleError(error, { title: 'Connection Error' });
    }
  };


  const openFacebookRetrieval = () => {
    setShowFacebookRetrieval(true);
    setShowResults(false);
    setShowProgress(false);
    setRetrievalResults(null);
    setProgress(0);
    setProgressMessage('');
    fetchFacebookForms();
  };

  useEffect(() => {
    if (showBroadcastDialog) {
      fetchTemplates();
    }
  }, [showBroadcastDialog]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await integrationApi.getWhatsAppAccounts();
      if (response.accounts && response.accounts.length > 0) {
        setTemplates(response.accounts[0].templates || []);
      } else {
        toast.error("No WhatsApp account found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };



  // Mobile: infinite scroll + pull-to-refresh
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, isLoading, currentPage, totalPages, leads.length]);

  const handlePullTouchStart = (e: React.TouchEvent) => {
    if ((mobileScrollRef.current?.scrollTop ?? 1) <= 0) {
      pullStartY.current = e.touches[0].clientY;
    } else {
      pullStartY.current = null;
    }
  };

  const handlePullTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current === null || isRefreshing) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0 && (mobileScrollRef.current?.scrollTop ?? 1) <= 0) {
      setPullDistance(Math.min(90, dy * 0.5));
    } else {
      setPullDistance(0);
    }
  };

  const handlePullTouchEnd = async () => {
    if (pullStartY.current === null) return;
    const shouldRefresh = pullDistance > 60;
    pullStartY.current = null;
    if (!shouldRefresh) {
      setPullDistance(0);
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
    setIsRefreshing(true);
    setPullDistance(48);
    try {
      if (currentPage === 1) {
        await fetchLeads();
      } else {
        // Resetting the page refetches page 1 via the currentPage effect
        setCurrentPage(1);
      }
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  return (
    <RoleGuard allowedFeatures={['leads']}>
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <div className="shrink-0 mb-3 sm:mb-4">
        <LeadsFilters
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          isSearching={isSearching}
          setShowNewLead={setShowNewLead}
          visibleColumns={visibleColumns}
          handleColumnToggle={handleColumnToggle}
          setShowStageManager={setShowStageManager}
          setShowExportDialog={setShowExportDialog}
          handleImportClick={handleImportClick}
          openFacebookRetrieval={openFacebookRetrieval}
          stages={stages}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        />
      </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {leads.length > 0 && selectedLeads.length > 0 && !isMobile && (
          <div className="mx-2 mb-2 flex items-center justify-between p-2.5 rounded-[var(--r-xl)] border bg-[var(--crm-surface-1)] animate-in fade-in slide-in-from-top-1 duration-300" style={{ borderColor: 'var(--crm-border)' }}>
            <div className="flex items-center gap-2.5 px-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-[var(--r-pill)] bg-[var(--crm-accent)] text-white text-[10px] font-black">
                {selectedLeads.length}
              </div>
              <span className="text-[13px] font-semibold text-[var(--crm-text-primary)]">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-emerald-600 border-none"
                onClick={() => setShowBroadcastDialog(true)}
              >
                <i className="ti ti-message-circle mr-1" />
                Broadcast
              </Button>
              <Button
                variant="ghost"
                className="text-[var(--crm-text-primary)] border-none"
                onClick={() => setShowStageChange(true)}
              >
                Change Stage
              </Button>
              <Button
                variant="ghost"
                className="text-red-500 border-none"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        {isMobile ? (
          <div
            ref={mobileScrollRef}
            className="flex-1 overflow-y-auto no-scrollbar"
            onTouchStart={handlePullTouchStart}
            onTouchMove={handlePullTouchMove}
            onTouchEnd={handlePullTouchEnd}
          >
            {/* Pull-to-refresh indicator */}
            <div
              style={{ height: pullDistance }}
              className="flex items-end justify-center overflow-hidden bg-[var(--crm-surface-2)]/50"
            >
              <div className="mb-2 h-8 w-8 rounded-full bg-[var(--crm-surface-1)] border border-[var(--crm-border)] shadow-sm flex items-center justify-center">
                <i
                  className={`ti ti-refresh text-[16px] text-[var(--crm-accent)] ${(isRefreshing || pullDistance > 60) ? 'animate-spin' : ''}`}
                  style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                />
              </div>
            </div>
            {/* Total lead count — sticky while the list scrolls */}
            {!error && totalItems > 0 && (
              <div className="sticky top-0 z-20 px-4 py-2 text-[12px] font-medium text-[var(--crm-text-tertiary)] bg-[var(--crm-surface-1)]/95 backdrop-blur-sm border-b border-[var(--crm-border)]">
                {leads.length < totalItems
                  ? `Showing ${leads.length} of ${totalItems.toLocaleString('en-IN')} leads`
                  : `${totalItems.toLocaleString('en-IN')} lead${totalItems === 1 ? '' : 's'}`}
              </div>
            )}
            <LeadsMobileView
              leads={leads}
              isLoading={isLoading && currentPage === 1 && !isRefreshing}
              error={error}
              selectedLeads={selectedLeads}
              handleSelectLead={handleSelectLead}
              handleEdit={handleEditLead}
              handleDelete={handleDeleteLead}
              handleWhatsAppClick={handleWhatsAppClick}
              handleCallClick={handleCallClick}
              handleDealValueClick={handleDealValueClick}
              handleAssignAgentClick={handleAssignAgentClick}
              handleCardClick={(id) => router.push(`/leads/${id}`)}
              handleStageChange={handleStageChange}
              stages={stages}
              onRetry={() => fetchLeads()}
              onAddLead={() => setShowNewLead(true)}
              hasActiveFilters={
                filters.search !== '' ||
                filters.status.length > 0 ||
                filters.stage.length > 0 ||
                filters.source.length > 0 ||
                !!filters.dateRange ||
                !!filters.createdAt
              }
              onClearFilters={clearFilters}
            />
            {/* Infinite-scroll sentinel */}
            {leads.length > 0 && currentPage < totalPages && (
              <div ref={loadMoreRef} className="py-5 flex items-center justify-center">
                {isLoading && currentPage > 1 && (
                  <i className="ti ti-loader-2 animate-spin text-[20px] text-[var(--crm-text-tertiary)]" />
                )}
              </div>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            leads={leads}
            stages={stages}
            isLoading={isLoading}
            error={error}
            handleStageChange={handleStageChange}
            handleEdit={handleEditLead}
            handleWhatsAppClick={handleWhatsAppClick}
            handleCallClick={handleCallClick}
            handleDealValueClick={handleDealValueClick}
            handleAssignAgentClick={handleAssignAgentClick}
            handleDelete={handleDeleteLead}
            handleCardClick={(id) => router.push(`/leads/${id}`)}
          />
        ) : (
          <LeadsTable
            leads={leads}
            isLoading={isLoading}
            error={error}
            visibleColumns={visibleColumns}
            selectedLeads={selectedLeads}
            handleSelectLead={handleSelectLead}
            handleSelectAll={handleSelectAll}
            handleEdit={handleEditLead}
            handleDelete={handleDeleteLead}
            handleWhatsAppClick={handleWhatsAppClick}
            handleCallClick={handleCallClick}
            handleDealValueClick={handleDealValueClick}
            handleAssignAgentClick={handleAssignAgentClick}
            fetchLeads={fetchLeads}
            setError={setError}
            stages={stages}
          />
        )}
        {!isMobile && viewMode === 'table' && (
          <div className="shrink-0 pt-2.5 pb-0.5">
            <PaginationControls
              totalItems={totalItems}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
        </div>
      </div>

      <LeadsDialogsRenderer
        dialogs={dialogs}
        selectedLeadsCount={selectedLeads.length}
        stages={stages}
        teamMembers={teamMembers}
        handleBulkStageChange={handleBulkStageChange}
        fetchLeads={fetchLeads}
        handleImport={handleImport}
        handleExport={handleExport}
        handleRetrieveLeads={handleRetrieveLeads}
        confirmDelete={confirmDelete}
        handleBroadcast={handleBroadcast}
      />

      <MobileFilterBottomSheet
        isOpen={isMobileFilterOpen}
        onOpenChange={setIsMobileFilterOpen}
        filters={filters}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        stages={stages}
      />
      
      {isMobile && (
        <MobileBulkActionBar
          selectedCount={selectedLeads.length}
          totalCount={leads.length}
          onClearSelection={() => setSelectedLeads([])}
          onSelectAll={() => setSelectedLeads(leads.map(lead => lead.id))}
          onBroadcast={() => setShowBroadcastDialog(true)}
          onChangeStage={() => setShowStageChange(true)}
          onDelete={handleBulkDelete}
        />
      )}

      {/* Mobile floating Add Lead button — hidden while bulk selection bar is up */}
      {isMobile && selectedLeads.length === 0 && (
        <button
          onClick={() => setShowNewLead(true)}
          aria-label="Add lead"
          className="fixed bottom-6 right-4 z-40 h-14 w-14 rounded-full bg-[#E84C3A] text-white shadow-lg shadow-[#E84C3A]/30 flex items-center justify-center active:scale-95 transition-transform"
        >
          <i className="ti ti-plus text-[24px]" />
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
      />

    </RoleGuard>
  )
}
