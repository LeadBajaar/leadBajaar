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
  createPayment
} from '@/lib/api'
import { LeadsMobileView } from './LeadsMobileView'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
// import axios from 'axios'
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
import { LeadsFilters } from './LeadsFilters'
import { LeadsTable, LeadsTableSkeleton } from './LeadsTable'
import { ImportLeadsDialog } from './ImportLeadsDialog'
import { FacebookRetrievalDialog } from './FacebookRetrievalDialog'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { ExportLeadsDialog } from './ExportLeadsDialog'
import { BroadcastMessageDialog } from './BroadcastMessageDialog'
import { StageManagerDialog } from './StageManagerDialog'
import { StageChangeDialog } from './StageChangeDialog'
import { DealValueDialog } from './DealValueDialog'
import { EditLeadDialog } from './EditLeadDialog'
import { AddLeadDialog } from './AddLeadDialog'

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {message}
    </AlertDescription>
  </Alert>
)

// // Add this component for the date picker
// const DatePicker = ({ date, onChange }: DatePickerProps) => {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           className={cn(
//             "w-[240px] justify-start text-left font-normal",
//             !date && "text-muted-foreground"
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {date ? format(date, "PPP") : <span>Pick a date</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={onChange}
//           initialFocus
//         />
//       </PopoverContent>
//     </Popover>
//   )
// }

// Add this type near your other type definitions
// type SourceType = keyof typeof sourceConfig;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibleColumns, setVisibleColumns] = useState([
    'name',
    'phone',
    'stage',
    // 'status',
    'city',
    'profession',
    'deal_value',
    'paid_amount',
    'created_at',
    'actions'
  ])

  // Add states for import functionality
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [showMapping, setShowMapping] = useState(false)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([])
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [showGeneratingReport, setShowGeneratingReport] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const itemsPerPage = 10

  // Add ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsSectionRef = useRef<HTMLDivElement>(null)

  // Sticky horizontal scrollbar refs
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollbarRef = useRef<HTMLDivElement>(null)
  const tableInnerRef = useRef<HTMLDivElement>(null)

  // Add these states
  const [stages, setStages] = useState<Record<string, { color: string; icon: LucideIcon }>>(defaultStages)
  const [showStageManager, setShowStageManager] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedIcon] = useState<keyof typeof iconMapping>('User')
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [showStageChange, setShowStageChange] = useState(false)

  // Deal Value Dialog State
  const [showDealValue, setShowDealValue] = useState(false);
  const [dealValueAmount, setDealValueAmount] = useState('');
  const [recordInitialPayment, setRecordInitialPayment] = useState(false);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSavingDealValue, setIsSavingDealValue] = useState(false);

  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [editedStageName, setEditedStageName] = useState('')
  const [editedStageColor, setEditedStageColor] = useState('')
  const [showEditLead, setShowEditLead] = useState(false)
  const [editedLead, setEditedLead] = useState<Lead | null>(null)
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
  const [isUpdating, setIsUpdating] = useState(false);


  // Add these to your state variables at the top of LeadsPage component
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)


  // Add this at the top of your component
  const fetchLeadsConfig = React.useMemo(() => ({
    page: currentPage,
    search: searchTerm,
    status: statusFilter,
    perPage: itemsPerPage
  }), [currentPage, searchTerm, statusFilter, itemsPerPage]);

  // Add this to your state variables
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Add this state for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    leadId: number | null;
    leadName: string;
  }>({
    isOpen: false,
    leadId: null,
    leadName: ''
  });

  // Facebook Lead Retrieval States
  const [showFacebookRetrieval, setShowFacebookRetrieval] = useState(false);
  const [facebookForms, setFacebookForms] = useState<Array<{
    id: string;
    name: string;
    status: string;
    integration_id: number;
    page_id: string;
    source?: string;
    error?: string;
  }>>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);

  const [isRetrievingLeads, setIsRetrievingLeads] = useState(false);
  const [retrievalResults, setRetrievalResults] = useState<{
    total_processed: number;
    new_leads: number;
    existing_leads: number;
    processed_leads: Array<{
      facebook_lead_id: string;
      status: 'created' | 'existing';
      lead_id: number;
      name: string;
    }>;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Add state for export dialog
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Add new state variables
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [variableColumnMapping, setVariableColumnMapping] = useState<Record<string, string>>({})

  // Add new state for templates loading
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Add these new state variables at the top of your component
  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    stage: string;
    source: string;
    dateRange: DateRange | undefined;
    createdAt: DateRange | undefined;
  }>({
    search: '',
    status: 'all',
    stage: 'all',
    source: 'all',
    dateRange: undefined,
    createdAt: undefined
  });

  // Add debounced search for better performance
  const debouncedSearch = useDebounce(filters.search, 500); // 500ms delay
  const [isSearching, setIsSearching] = useState(false);

  // Track when search is happening
  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [filters.search, debouncedSearch]);

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

  // Add these state variables near your other states
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResponse, setBroadcastResponse] = useState<BroadcastResponse | null>(null);

  // State to hold the CSV data and column mappings
  const [csvData, setCsvData] = useState<string[][]>([]);
  // const [columnMapping, setColumnMapping] = useState<{ csvHeader: string; leadField: string }[]>([]);

  // Function to handle CSV file upload and parsing
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFile = e.target.files?.[0];
  //   if (selectedFile) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       const csv = event.target?.result as string;
  //       const lines = csv.split('\n').map(line => line.split(',').map(cell => cell.trim()));
  //       setCsvData(lines);
  //       // Initialize column mapping based on CSV headers
  //       const headers = lines[0];
  //       const initialMapping = headers.map(header => ({ csvHeader: header, leadField: 'skip' }));
  //       setColumnMapping(initialMapping);
  //     };
  //     reader.readAsText(selectedFile);
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setImportError(null)
    setImportStats(null)

    if (!selectedFile) {
      setImportError('No file selected')
      return
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n')

        if (lines.length < 2) {
          setImportError('CSV file is empty or has no data rows')
          return
        }

        const result = lines.map(line => line.split(',').map(cell => cell.trim()))
        setPreview(result.slice(0, 5))

        // Initialize column mapping
        const csvHeaders = result[0]
        setColumnMapping(csvHeaders.map(header => ({
          csvHeader: header,
          leadField: 'skip'
        })))
        setShowMapping(true)
      } catch (err) {
        console.error('Failed to read CSV file:', err)
        setImportError('Failed to read CSV file. Please check the file format.')
      }
    }

    reader.onerror = () => {
      setImportError('Failed to read the file')
    }

    reader.readAsText(selectedFile)
  }

  // Move all function definitions here
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset page on filter change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      stage: 'all',
      source: 'all',
      dateRange: undefined,
      createdAt: undefined
    });
    setCurrentPage(1);
  };

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.stage !== 'all' && { stage: filters.stage }),
        ...(filters.source !== 'all' && { source: filters.source }),
        ...(filters.dateRange?.from && {
          last_contact_from: format(filters.dateRange.from, 'yyyy-MM-dd')
        }),
        ...(filters.dateRange?.to && {
          last_contact_to: format(filters.dateRange.to, 'yyyy-MM-dd')
        }),
        ...(filters.createdAt?.from && {
          created_from: format(filters.createdAt.from, 'yyyy-MM-dd')
        }),
        ...(filters.createdAt?.to && {
          created_to: format(filters.createdAt.to, 'yyyy-MM-dd')
        })
      };

      const response = await getLeads(params);

      if (response?.data && Array.isArray(response.data)) {
        setLeads(response.data);
        setTotalItems(response.total || response.meta?.total || 0);
        setTotalPages(response.last_page || response.meta?.last_page || 1);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLeads([]);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, debouncedSearch, filters.status, filters.stage, filters.source, filters.dateRange, filters.createdAt]);

  // Prefill deal value when dialog opens
  useEffect(() => {
    if (showDealValue && editingLead) {
      setDealValueAmount(editingLead.deal_value?.toString() || '');
    }
  }, [showDealValue, editingLead]);

  // Update handleAddLead
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
        profession: newLead.profession || ''
      });

      // Refresh leads list
      await fetchLeads();

      setShowNewLead(false);
      toast.success("Lead created successfully");

      // Reset form
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
      console.error('Failed to create lead:', error);

      // Set the error message to be displayed in the form
      setSubmitError(error.message || 'Failed to create lead. Please try again.');

      // Don't close the modal, let the user see the error
      setIsSubmitting(false);
    }
  };

  // Update bulk actions
  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete the selected leads?')) return

    try {
      await bulkDeleteLeads(selectedLeads)
      await fetchLeads() // Refresh the list
      setSelectedLeads([])
      toast.success("Leads deleted successfully")
    } catch (error) {
      console.error('Failed to delete leads:', error)
      toast.error("Failed to delete leads")
    }
  }

  const handleBulkStageChange = async (newStage: string) => {
    try {
      await bulkUpdateLeadStage(selectedLeads, newStage)
      await fetchLeads() // Refresh the list
      setSelectedLeads([])
      setShowStageChange(false)
      setSelectedStage(null)
      toast.success("Lead stages updated successfully")
    } catch (error) {
      console.error('Failed to update lead stages:', error)
      toast.error("Failed to update lead stages")
    }
  }

  // Update single lead delete
  const handleDelete = (lead: Lead) => {
    setDeleteConfirmation({
      isOpen: true,
      leadId: lead.id,
      leadName: lead.name
    });
  };

  // Add this new function to handle the actual deletion
  const confirmDelete = async () => {
    if (!deleteConfirmation.leadId) return;

    try {
      await deleteLead(deleteConfirmation.leadId);
      await fetchLeads();

      toast.success("Lead deleted successfully");
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error("Failed to delete lead. Please try again.");
    } finally {
      setDeleteConfirmation({ isOpen: false, leadId: null, leadName: '' });
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditedLead({ ...lead });
    setEditingLead(lead);
    setShowEditLead(true);
  };

  const handleWhatsAppClick = (lead: Lead) => {
    const phone = lead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleCallClick = (lead: Lead) => {
    window.open(`tel:${lead.phone}`, '_self');
  };

  const handleDealValueClick = (lead: Lead) => {
    setEditingLead(lead);
    setShowDealValue(true);
  };

  const handleColumnMapChange = (csvHeader: string, leadField: string) => {
    setColumnMapping(current =>
      current.map(mapping =>
        mapping.csvHeader === csvHeader
          ? { ...mapping, leadField }
          : mapping
      )
    )
  }

  const validateRow = (row: string[], csvHeaders: string[], rowIndex: number): ImportError[] => {
    const errors: ImportError[] = []

    columnMapping.forEach((mapping) => {
      if (mapping.leadField !== 'skip') {
        const value = row[csvHeaders.indexOf(mapping.csvHeader)]

        // Validate required fields
        if (['name', 'email'].includes(mapping.leadField) && !value) {
          errors.push({
            row: rowIndex + 2, // Add 2 to account for 1-based indexing and header row
            field: mapping.leadField,
            value: value,
            reason: `${mapping.leadField} is required`
          })
        }

        // Validate email format
        if (mapping.leadField === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            row: rowIndex + 2,
            field: 'email',
            value: value,
            reason: 'Invalid email format'
          })
        }
      }
    })

    return errors
  }

  const handleImport = async () => {
    if (!file || isImporting) return;

    setIsImporting(true);
    setShowGeneratingReport(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const dataRows = lines.slice(1)
            .filter(line => line.trim())
            .map(line => line.split(',').map(cell => cell.trim()));

          const leads = dataRows.map(row => {
            const lead: CreateLeadDto = {
              name: '',
              email: '',
              stage: 'New',
              status: 'Warm',
            };

            columnMapping.forEach(mapping => {
              if (mapping.leadField !== 'skip') {
                const index = headers.indexOf(mapping.csvHeader);
                if (index !== -1) {
                  const value = row[index];
                  switch (mapping.leadField) {
                    case 'name':
                    case 'email':
                    case 'phone':
                    case 'company':
                    case 'stage':
                    case 'source':
                      lead[mapping.leadField] = value;
                      break;
                    case 'status':
                      if (['Hot', 'Warm', 'Cold'].includes(value)) {
                        lead.status = value as 'Hot' | 'Warm' | 'Cold';
                      }
                      break;
                  }
                }
              }
            });

            return lead;
          });

          // Send to backend
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

          // Refresh leads list
          await fetchLeads();

          toast.success(`Successfully imported ${response.successful} leads`);

        } catch (error: any) {
          console.error('Import failed:', error);
          setImportError(error.message || 'Failed to import leads');
          toast.error(error.message || "Failed to import leads");
        }

        setIsImporting(false);
        setShowGeneratingReport(false);
      };

      reader.onerror = () => {
        setImportError('Failed to read the file');
        setIsImporting(false);
        setShowGeneratingReport(false);
      };

      reader.readAsText(file);

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

  const resetImport = () => {
    setFile(null);
    setPreview([]);
    setShowMapping(false);
    setColumnMapping([]);
    setImportError(null);
    setImportStats(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  // Update pagination controls
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2">
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const handleAddStage = () => {
    if (newStageName && !stages[newStageName]) {
      setStages(prev => ({
        ...prev,
        [newStageName]: {
          color: `bg-${selectedColor}-100 text-${selectedColor}-800 dark:bg-${selectedColor}-900 dark:text-${selectedColor}-100`,
          icon: iconMapping[selectedIcon as keyof typeof iconMapping] || User
        }
      }))
      setNewStageName('')
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

      // Update the lead locally instead of fetching
      setLeads(prev => prev.map(lead =>
        lead.id === leadId
          ? { ...lead, stage: newStage }
          : lead
      ));

      setShowStageChange(false);
      setEditingLead(null);
      setSelectedStage(null);

      toast.success("Lead stage has been updated successfully");

    } catch (error) {
      console.error('Failed to update lead stage:', error);

      toast.error("Failed to update lead stage. Please try again.");
    }
  };

  const handleSaveDealValue = async () => {
    if (!editingLead || !dealValueAmount) return;

    setIsSavingDealValue(true);
    try {
      const amount = parseFloat(dealValueAmount);

      // 1. Update lead stage and deal value
      await updateLeadStage(editingLead.id, 'Deal Closed', amount);

      // 2. Create initial payment if requested
      if (recordInitialPayment && initialPaymentAmount) {
        await createPayment({
          lead_id: editingLead.id,
          amount: parseFloat(initialPaymentAmount),
          payment_method: paymentMethod,
          status: 'Completed',
          payment_date: new Date().toISOString().split('T')[0]
        });
      }

      // Update local state
      setLeads(prev => prev.map(lead =>
        lead.id === editingLead.id
          ? { ...lead, stage: 'Deal Closed', deal_value: amount }
          : lead
      ));

      toast.success(recordInitialPayment ? "Deal closed and payment recorded!" : "Deal closed successfully");
      setShowDealValue(false);
      setEditingLead(null);
      setDealValueAmount('');
      setInitialPaymentAmount('');
      setRecordInitialPayment(false);

    } catch (error) {
      console.error('Failed to save deal value:', error);
      toast.error("Failed to save deal details");
    } finally {
      setIsSavingDealValue(false);
    }
  };

  const handleEditStage = (stageName: string) => {
    setEditingStage(stageName)
    setEditedStageName(stageName)
    setEditedStageColor(stages[stageName].color.split(' ')[0].replace('bg-', '').replace('-100', ''))
  }

  const handleUpdateStage = () => {
    if (editedStageName && editingStage) {
      const stageConfig = stages[editingStage]
      const updatedStages = { ...stages }

      // Delete old stage if name changed
      if (editingStage !== editedStageName) {
        delete updatedStages[editingStage]
      }

      // Add updated stage
      updatedStages[editedStageName] = {
        ...stageConfig,
        color: `bg-${editedStageColor}-100 text-${editedStageColor}-800 dark:bg-${editedStageColor}-900 dark:text-${editedStageColor}-100`
      }

      setStages(updatedStages)
      setEditingStage(null)
      setEditedStageName('')
      setEditedStageColor('')
    }
  }

  const handleDeleteStage = (stageName: string) => {
    const updatedStages = { ...stages }
    delete updatedStages[stageName]
    setStages(updatedStages)
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
      })

      // Update local state with response from server
      setLeads(prev => prev.map(lead =>
        lead.id === response.id ? response : lead
      ))

      toast.success("Lead updated successfully")
      setShowEditLead(false)
      setEditedLead(null)

      // Trigger deal value dialog if stage changed to closed and it wasn't closed before
      const originalLead = leads.find(l => l.id === updatedLead.id);
      if ((updatedLead.stage === 'Deal Closed' || updatedLead.stage === 'Closed Won') &&
        originalLead && originalLead.stage !== 'Deal Closed' && originalLead.stage !== 'Closed Won') {
        // Find the lead in the updated list to ensure we have the latest data
        setEditingLead(response);
        setShowDealValue(true);
      }
    } catch (error) {
      console.error('Failed to update lead:', error)
      toast.error("Failed to update lead. Please try again.")
    } finally {
      setIsUpdating(false);
    }
  }

  // Add this function to handle bulk selection
  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  // Add this function to handle individual selection
  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Add this before the return statement

  const [formErrors, setFormErrors] = useState<LeadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateAndSubmit = async () => {
    // Reset errors
    setFormErrors({});

    // Validate required fields
    const errors: LeadFormErrors = {};

    if (!newLead.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!newLead.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
      errors.email = 'Invalid email format';
    }

    if (newLead.phone && !/^\+?[\d\s-]{10,}$/.test(newLead.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    // If there are errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit the form
    setIsSubmitting(true);
    try {
      await handleAddLead();
      // Success! Modal will be closed by handleAddLead
    } catch (error) {
      console.error('Failed to add lead:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add lead");
      // Error handling is done in handleAddLead
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add export handler
  const handleExport = async (exportAll: boolean = false) => {
    try {
      setIsExporting(true);
      await exportLeads(exportAll ? undefined : selectedLeads);

      toast.success("Leads exported successfully");

      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : "Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  // Add function to extract variables from template
  const extractVariables = (template: MessageTemplate) => {
    const variableRegex = /{{([^}]+)}}/g
    const variables = new Set<string>()

    template.components.forEach(component => {
      if (component.text) {
        let match
        while ((match = variableRegex.exec(component.text)) !== null) {
          variables.add(match[1])
        }
      }
    })

    return Array.from(variables)
  }

  // Add function to handle broadcast
  const handleBroadcast = async () => {
    if (!selectedTemplate || selectedLeads.length === 0) return;

    setIsSendingBroadcast(true);
    setBroadcastResponse(null);

    try {
      // Prepare the data to be sent
      const broadcastData = {
        template_id: String(selectedTemplate.id),
        lead_ids: selectedLeads,
        variables: variables,
        variable_column_mapping: variableColumnMapping
      };

      // Call your API to send broadcast
      const response = await integrationApi.sendBroadcast(broadcastData);

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
  };

  // Facebook Lead Retrieval Functions
  const fetchFacebookForms = async () => {
    try {
      const response = await integrationApi.getFacebookLeadForms();
      setFacebookForms(response.forms || []);

      // Show debug info if no forms found
      if (response.forms && response.forms.length === 0 && response.debug_info) {
        toast.error(`${response.message} (Found ${response.debug_info.total_integrations} total integrations, types: ${response.debug_info.integration_types.join(', ')})`);
      }
    } catch (error: any) {
      console.error('Failed to fetch Facebook forms:', error);
      toast.error(error.message || "Failed to fetch Facebook lead forms");
    }
  };

  const handleRetrieveLeads = async () => {
    if (!selectedForm) {
      toast.error("Please select a lead form");
      return;
    }

    if (!dateFrom || !dateTo) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    const selectedFormData = facebookForms.find(f => f.id === selectedForm);
    if (!selectedFormData) {
      toast.error("Selected form not found");
      return;
    }

    try {
      setIsRetrievingLeads(true);
      setRetrievalResults(null);
      setShowProgress(true);
      setProgress(0);
      setProgressMessage('Connecting to Facebook API...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      const messageInterval = setInterval(() => {
        setProgressMessage(prev => {
          const messages = [
            'Connecting to Facebook API...',
            'Fetching lead data...',
            'Processing lead information...',
            'Validating lead details...',
            'Saving leads to database...',
            'Finalizing sync process...'
          ];
          const currentIndex = Math.floor((progress / 90) * messages.length);
          return messages[Math.min(currentIndex, messages.length - 1)];
        });
      }, 1000);

      const response = await integrationApi.retrieveFacebookLeads({
        form_id: selectedForm,
        integration_id: selectedFormData.integration_id,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      // Clear intervals and set final progress
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgress(100);
      setProgressMessage('Sync completed successfully!');

      // Wait a moment to show completion
      setTimeout(() => {
        setRetrievalResults(response.data);
        setShowProgress(false);
        setShowResults(true);
      }, 1000);

      // Refresh leads list
      await fetchLeads();

      toast.success(response.message || "Leads synced successfully");

    } catch (error: any) {
      console.error('Failed to retrieve Facebook leads:', error);

      // Handle specific Facebook API errors with proper error styling
      let errorMessage = "Failed to retrieve Facebook leads";
      let showAction = false;

      if (error.response?.data?.error_code) {
        const errorCode = error.response.data.error_code;

        switch (errorCode) {
          case 'TOKEN_EXPIRED':
            errorMessage = "Your Facebook access token has expired. Please refresh your integration in the Integrations page.";
            showAction = true;
            break;
          case 'INVALID_TOKEN':
            errorMessage = "Your Facebook access token is invalid. Please check your integration settings.";
            showAction = true;
            break;
          case 'RATE_LIMIT':
            errorMessage = "Facebook API rate limit exceeded. Please try again later.";
            break;
          case 'INSUFFICIENT_PERMISSIONS':
            errorMessage = "You don't have permission to access this lead form. Please check your Facebook permissions.";
            showAction = true;
            break;
          default:
            errorMessage = error.response.data.error || errorMessage;
        }
      }

      if (showAction) {
        toast.error(errorMessage, {
          action: {
            label: "Go to Integrations",
            onClick: () => window.open('/integrations', '_blank')
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsRetrievingLeads(false);
      setShowProgress(false);
      setProgress(0);
      setProgressMessage('');
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



  // Add useEffect to fetch templates when dialog opens
  useEffect(() => {
    if (showBroadcastDialog) {
      fetchTemplates();
    }
  }, [showBroadcastDialog]);

  // Add function to fetch templates
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

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      <div className="shrink-0">
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
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-0 sm:p-2.5 pb-0 sm:pb-0 overflow-hidden">
        {leads.length > 0 && selectedLeads.length > 0 && (
          <div className="mx-2 mb-2 flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center gap-2.5 px-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-black">
                {selectedLeads.length}
              </div>
              <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-bold text-indigo-600 hover:bg-white dark:hover:bg-slate-800"
                onClick={() => setShowStageChange(true)}
              >
                Change Stage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-bold text-red-500 hover:bg-white dark:hover:bg-slate-800"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        {isMobile ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <LeadsMobileView
              leads={leads}
              isLoading={isLoading}
              error={error}
              selectedLeads={selectedLeads}
              handleSelectLead={handleSelectLead}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleWhatsAppClick={handleWhatsAppClick}
              handleCallClick={handleCallClick}
              handleDealValueClick={handleDealValueClick}
              handleCardClick={(id) => router.push(`/leads/${id}`)}
            />
          </div>
        ) : (
          <LeadsTable
            leads={leads}
            isLoading={isLoading}
            error={error}
            visibleColumns={visibleColumns}
            selectedLeads={selectedLeads}
            handleSelectLead={handleSelectLead}
            handleSelectAll={handleSelectAll}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleWhatsAppClick={handleWhatsAppClick}
            handleCallClick={handleCallClick}
            handleDealValueClick={handleDealValueClick}
            fetchLeads={fetchLeads}
            setError={setError}
          />
        )}
        <div className="shrink-0 mt-2 border-t border-slate-50 dark:border-slate-800/50 pt-2 pb-6 px-4">
          <PaginationControls />
        </div>
      </div>

      {/* Refactored Dialog Components */}
      <StageManagerDialog
        isOpen={showStageManager}
        onOpenChange={setShowStageManager}
        newStageName={newStageName}
        setNewStageName={setNewStageName}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        stages={stages}
        handleEditStage={handleEditStage}
        handleDeleteStage={handleDeleteStage}
        editingStage={editingStage}
        setEditingStage={setEditingStage}
        editedStageName={editedStageName}
        setEditedStageName={setEditedStageName}
        editedStageColor={editedStageColor}
        setEditedStageColor={setEditedStageColor}
        handleUpdateStage={handleUpdateStage}
        handleAddStage={handleAddStage}
      />

      <StageChangeDialog
        isOpen={showStageChange}
        onOpenChange={setShowStageChange}
        leadName={editingLead ? editingLead.name : null}
        selectedLeadsCount={selectedLeads.length}
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
        selectedCount={selectedLeads.length}
        isExporting={isExporting}
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
        selectedCount={selectedLeads.length}
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

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />
    </div>
  )
}
