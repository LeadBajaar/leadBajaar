import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { integrationApi } from '@/lib/api/integrations.api';
import { parseCSVContent } from '@/lib/leads/csv-import';
import { ColumnMapping, ImportStats } from '../types';

interface UseDataDialogsProps {
  fetchLeads: () => Promise<void>;
  handleError: (error: any, options?: any) => void;
}

export function useDataDialogs({ fetchLeads, handleError }: UseDataDialogsProps) {
  // Import Dialog State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showGeneratingReport, setShowGeneratingReport] = useState(false);

  // Export Dialog State
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportSuccess, setIsExportSuccess] = useState(false);

  // Facebook Retrieval State
  const [showFacebookRetrieval, setShowFacebookRetrieval] = useState(false);
  const [facebookForms, setFacebookForms] = useState<Array<{ id: string; name: string; integration_id: number; status: string }>>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isRetrievingLeads, setIsRetrievingLeads] = useState(false);
  const [retrievalResults, setRetrievalResults] = useState<{ processed: number; new: number; duplicates: number } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setImportError(null)
    setImportStats(null)

    if (!selectedFile) {
      setImportError('No file selected')
      return
    }

    if (!selectedFile.name.match(/\.(csv|xlsx?)$/i)) {
      setImportError('Please select a CSV or Excel file')
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        let csv = '';
        if (selectedFile.name.match(/\.xlsx?$/i)) {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
          csv = event.target?.result as string;
        }
        
        const { headers, preview } = parseCSVContent(csv)

        setPreview(preview)

        // Initialize column mapping
        setColumnMapping(headers.map(header => ({
          csvHeader: header,
          leadField: 'skip'
        })))
        setShowMapping(true)
      } catch (err: any) {
        console.error('Failed to read file:', err)
        setImportError(err.message || 'Failed to read file. Please check the file format.')
      }
    }

    reader.onerror = () => {
      setImportError('Failed to read the file')
    }

    if (selectedFile.name.match(/\.xlsx?$/i)) {
      reader.readAsArrayBuffer(selectedFile)
    } else {
      reader.readAsText(selectedFile)
    }
  }

  const handleColumnMapChange = (csvHeader: string, leadField: string) => {
    setColumnMapping(current =>
      current.map(mapping =>
        mapping.csvHeader === csvHeader
          ? { ...mapping, leadField }
          : mapping
      )
    )
  }

  const resetImport = () => {
    setFile(null);
    setPreview([]);
    setShowMapping(false);
    setColumnMapping([]);
    setImportError(null);
    setImportStats(null);
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

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

      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgress(100);
      setProgressMessage('Sync completed successfully!');

      setTimeout(() => {
        setRetrievalResults(response.data);
        setShowProgress(false);
        setShowResults(true);
      }, 1000);

      await fetchLeads();

      toast.success(response.message || "Leads synced successfully");

    } catch (error: any) {
      handleError(error, { title: 'Facebook Sync Error' });
    } finally {
      setIsRetrievingLeads(false);
      setShowProgress(false);
      setProgress(0);
      setProgressMessage('');
    }
  }

  return {
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
    handleFileChange, handleColumnMapChange, resetImport, handleImportClick, handleRetrieveLeads
  };
}
