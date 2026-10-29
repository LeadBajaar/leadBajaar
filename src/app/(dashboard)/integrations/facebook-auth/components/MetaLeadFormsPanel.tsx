import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Search,
  Check,
  Copy,
  RefreshCw,
  Plus,
  Loader2,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FacebookPageItem } from './MetaPagesPanel';

export interface LeadFormItem {
  id: string;
  name: string;
  status: string;
  created_time?: string;
}

export interface CreateMetaFormPayload {
  name: string;
  questions: Array<{ type: string; key: string }>;
  privacy_policy?: { url: string };
  follow_up_url?: string;
}

interface MetaLeadFormsPanelProps {
  selectedPage: FacebookPageItem | null;
  forms: LeadFormItem[];
  trackedFormIds: string[];
  isLoadingForms: boolean;
  onToggleTrackForm: (form: LeadFormItem, isTracked: boolean) => Promise<void>;
  onPullRecentLeads: (form: LeadFormItem) => Promise<void>;
  onCreateForm: (payload: CreateMetaFormPayload) => Promise<void>;
  syncingFormId: string | null;
}

const FORM_FIELDS_OPTIONS = [
  { key: 'full_name', type: 'FULL_NAME', label: 'Full Name', description: 'Contact legal name', required: true },
  { key: 'phone_number', type: 'PHONE', label: 'Phone Number', description: 'Direct mobile number', required: true },
  { key: 'email', type: 'EMAIL', label: 'Email Address', description: 'Email address', required: false },
  { key: 'city', type: 'CITY', label: 'City', description: 'Location / City', required: false },
  { key: 'company_name', type: 'COMPANY_NAME', label: 'Company Name', description: 'Organization name', required: false },
  { key: 'job_title', type: 'JOB_TITLE', label: 'Job Title', description: 'Designation / Role', required: false },
];

export function MetaLeadFormsPanel({
  selectedPage,
  forms,
  trackedFormIds,
  isLoadingForms,
  onToggleTrackForm,
  onPullRecentLeads,
  onCreateForm,
  syncingFormId,
}: MetaLeadFormsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['full_name', 'phone_number', 'email']);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.id.includes(searchQuery)
  );

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Form ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = async () => {
    if (!newFormName.trim()) {
      toast.error('Form name is required');
      return;
    }
    if (selectedFields.length === 0) {
      toast.error('Please select at least one contact field');
      return;
    }

    try {
      setIsSubmittingForm(true);
      const questions = selectedFields.map((key) => {
        const option = FORM_FIELDS_OPTIONS.find((f) => f.key === key);
        return {
          key,
          type: option?.type || key.toUpperCase(),
        };
      });

      // Privacy policy & thank-you URL are automatically passed behind the scenes
      await onCreateForm({
        name: newFormName.trim(),
        questions,
        privacy_policy: { url: 'https://leadbajaar.com/privacy' },
        follow_up_url: 'https://leadbajaar.com/thank-you',
      });

      setNewFormName('');
      setSelectedFields(['full_name', 'phone_number', 'email']);
      setIsCreateDialogOpen(false);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (!selectedPage) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 h-full min-h-[480px] shadow-xs text-center">
        <div className="h-11 w-11 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-2xs">
          <FileText className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          No Facebook Page Selected
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1 max-w-sm leading-normal">
          Select a Facebook Page from the list on the left to view, manage, and configure lead forms for automatic CRM synchronization.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col h-full min-h-[480px] shadow-xs">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[320px]">
                {selectedPage.name} — Lead Forms
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Lead generation forms configured on this Facebook Page
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-8 text-xs px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create Form
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {forms.length > 2 && (
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filter forms by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8.5 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-normal"
            />
          </div>
        )}
      </div>

      {/* Forms List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {isLoadingForms ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Fetching lead forms from Meta Graph API...</span>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">No lead forms found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm font-normal">
              {searchQuery
                ? "No lead forms match your search filter."
                : "This page does not have any lead forms yet. You can create one above or in Meta Ads Manager."}
            </p>
          </div>
        ) : (
          filteredForms.map((form) => {
            const isTracked = trackedFormIds.includes(form.id);
            const isSyncing = syncingFormId === form.id;
            const isActive = form.status?.toUpperCase() === 'ACTIVE';

            return (
              <div
                key={form.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-2xs"
              >
                {/* Form Top Row: Name, Status, Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {form.name}
                      </h4>
                      {isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5">
                          {form.status || 'Draft'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                      <span>ID: {form.id}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(e, form.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-0.5"
                        title="Copy Form ID"
                      >
                        {copiedId === form.id ? (
                          <Check className="h-3 w-3 text-emerald-600 font-bold" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      {form.created_time && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {new Date(form.created_time).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sync Switch */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
                    <span className={`text-xs font-semibold ${isTracked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                      {isTracked ? "Auto-Sync On" : "Auto-Sync Off"}
                    </span>
                    <Switch
                      checked={isTracked}
                      onCheckedChange={(checked) => onToggleTrackForm(form, checked)}
                      aria-label="Toggle CRM Sync"
                      className="data-[state=checked]:bg-[#E84C3A]"
                    />
                  </div>
                </div>

                {/* Form Bottom Row: Description and Manual Sync */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {isTracked
                      ? "Leads submitted to this form sync to CRM in real-time via webhook."
                      : "Enable Auto-Sync to capture future leads into your CRM database."}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSyncing}
                    onClick={() => onPullRecentLeads(form)}
                    className="h-7 text-xs px-3 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold shrink-0 shadow-2xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${isSyncing ? "animate-spin text-blue-600" : "text-slate-500 dark:text-slate-400"}`} />
                    {isSyncing ? "Pulling Leads..." : "Pull Past 7 Days"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Lead Form Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Create Lead Form
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
              Configure form name and contact fields to collect for &quot;{selectedPage.name}&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Form Name */}
            <div className="space-y-1.5">
              <Label htmlFor="form-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Form Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="form-name"
                placeholder="e.g. Summer Campaign Inquiry Form"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Questions / Lead Fields Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contact Information Fields to Collect <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400 font-normal">
                  {selectedFields.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FORM_FIELDS_OPTIONS.map((field) => {
                  const isChecked = selectedFields.includes(field.key);
                  return (
                    <div
                      key={field.key}
                      onClick={() => {
                        if (field.required) return;
                        setSelectedFields((prev) =>
                          isChecked ? prev.filter((k) => k !== field.key) : [...prev, field.key]
                        );
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2",
                        isChecked
                          ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-2xs"
                          : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      )}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {field.label}
                          </p>
                          {field.required && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              (Required)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {field.description}
                        </p>
                      </div>
                      <Checkbox
                        checked={isChecked}
                        disabled={field.required}
                        onCheckedChange={() => {
                          if (field.required) return;
                          setSelectedFields((prev) =>
                            isChecked ? prev.filter((k) => k !== field.key) : [...prev, field.key]
                          );
                        }}
                        className="rounded"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmittingForm}
              className="text-xs h-9 rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateSubmit}
              disabled={isSubmittingForm || !newFormName.trim()}
              className="text-xs h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {isSubmittingForm && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              Create on Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
