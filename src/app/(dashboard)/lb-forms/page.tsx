'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText, Plus, Link as LinkIcon, ExternalLink,
  ChevronRight, MoreHorizontal, Trash2, Edit2, Share2,
  CalendarCheck, AlertCircle, Loader2, CheckCircle2, Table, LayoutTemplate, Activity
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_BASE_URL } from '@/lib/api'

interface LBForm {
  id: number;
  title: string;
  description: string;
  slug: string;
  submissions_count: number;
  active: boolean;
  created_at: string;
  auto_create_lead: boolean;
}

export default function LBFormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<LBForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedForm, setSelectedForm] = useState<LBForm | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formToDelete, setFormToDelete] = useState<LBForm | null>(null)
  const [forceDelete, setForceDelete] = useState(false)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to fetch forms')
      const data = await response.json()
      setForms(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load forms. Please try again.')
      toast.error('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!formToDelete) return

    try {
      const url = `${API_BASE_URL}/lb-forms/${formToDelete.id}${forceDelete ? '?force=true' : ''}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to delete form')
      
      setForms(forms.filter(f => f.id !== formToDelete.id))
      toast.success('Form deleted successfully')
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('Failed to delete form')
    } finally {
      setShowDeleteDialog(false)
      setFormToDelete(null)
      setForceDelete(false)
    }
  }

  const toggleStatus = async (form: LBForm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${form.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ active: !form.active })
      })

      if (!response.ok) throw new Error('Failed to update status')

      setForms(forms.map(f => 
        f.id === form.id ? { ...f, active: !f.active } : f
      ))
      toast.success(`Form ${!form.active ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to update status')
    }
  }

  const getPublicUrl = (form: LBForm | null) => {
    if (!form) return '';
    return `${window.location.origin}/lb-f/${form.slug}`;
  }

  const openPreview = (form: LBForm | null) => {
    if (!form) return;
    window.open(getPublicUrl(form), '_blank');
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 rounded-full bg-[var(--crm-red-soft)] flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-[var(--crm-red)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--crm-text-primary)] mb-2">Error Loading Forms</h3>
        <p className="text-[var(--crm-text-secondary)] mb-4">{error}</p>
        <Button onClick={fetchForms}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] z-10 overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">LB Forms</h1>
            <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
              Create contact forms and onboarding flows, and embed them anywhere.
            </p>
          </div>
          <Link href="/lb-forms/new">
            <Button className="bg-[var(--crm-primary)] hover:opacity-90 text-white gap-2 shadow-sm rounded-full h-8 text-xs px-4">
              <Plus className="h-3.5 w-3.5" />
              New Form
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-[var(--crm-bg)]">
        {loading ? (
          <div className="p-6">
            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] overflow-hidden">
              <table className="crm-table w-full">
                <thead>
                  <tr>
                    <th><div className="h-4 w-4 rounded bg-[var(--crm-surface-3)] animate-pulse" /></th>
                    <th><div className="h-3 w-16 bg-[var(--crm-surface-3)] animate-pulse rounded" /></th>
                    <th><div className="h-3 w-16 bg-[var(--crm-surface-3)] animate-pulse rounded" /></th>
                    <th><div className="h-3 w-16 bg-[var(--crm-surface-3)] animate-pulse rounded" /></th>
                    <th><div className="h-3 w-16 bg-[var(--crm-surface-3)] animate-pulse rounded" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="border-b border-[var(--crm-border)]">
                      <td className="px-3 py-2"><div className="h-4 w-4 rounded bg-[var(--crm-surface-3)] animate-pulse" /></td>
                      <td className="px-3 py-2"><div className="h-4 w-32 bg-[var(--crm-surface-3)] animate-pulse rounded" /></td>
                      <td className="px-3 py-2"><div className="h-4 w-20 bg-[var(--crm-surface-3)] animate-pulse rounded" /></td>
                      <td className="px-3 py-2"><div className="h-4 w-12 bg-[var(--crm-surface-3)] animate-pulse rounded" /></td>
                      <td className="px-3 py-2"><div className="h-4 w-24 bg-[var(--crm-surface-3)] animate-pulse rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : forms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[var(--crm-surface-1)] flex items-center justify-center mb-6 shadow-sm border border-[var(--crm-border)]">
              <LayoutTemplate className="h-8 w-8 text-[var(--crm-text-tertiary)]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--crm-text-primary)]">No forms yet</h3>
            <p className="text-[13px] text-[var(--crm-text-secondary)] mt-1 max-w-xs mx-auto mb-6">
              Create your first form to start collecting submissions.
            </p>
            <Link href="/lb-forms/new">
              <Button className="bg-[var(--crm-primary)] hover:opacity-90 text-white gap-2 px-6 h-9 text-xs rounded-full shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                New Form
              </Button>
            </Link>
          </div>
        ) : (
          <TooltipProvider>
            <div className="p-6">
            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] overflow-hidden shadow-sm">
              <table className="crm-table w-full text-left border-collapse">
                <thead className="bg-[var(--crm-surface-2)]/50">
                  <tr className="border-b border-[var(--crm-border)]">
                    <th className="w-10 px-4 py-2.5 font-medium text-[var(--crm-text-secondary)] text-[12px]">
                      <FileText className="h-3.5 w-3.5 opacity-50" />
                    </th>
                    <th className="px-4 py-2.5 font-medium text-[var(--crm-text-secondary)] text-[12px]">Form Name</th>
                    <th className="px-4 py-2.5 font-medium text-[var(--crm-text-secondary)] text-[12px]">Status</th>
                    <th className="px-4 py-2.5 font-medium text-[var(--crm-text-secondary)] text-[12px]">Submissions</th>
                    <th className="px-4 py-2.5 font-medium text-[var(--crm-text-secondary)] text-[12px]">Created</th>
                    <th className="w-12 px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--crm-border)]">
                  {forms.map((form) => (
                    <tr key={form.id} className="hover:bg-[var(--crm-surface-2)]/50 transition-colors group">
                      <td className="px-4 py-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[var(--crm-surface-3)] text-[11px] font-mono text-[var(--crm-text-primary)] border border-[var(--crm-border)]">
                          {form.id}
                        </div>
                      </td>
                      <td className="px-4 py-2 min-w-[200px]">
                        <div className="flex flex-col min-w-0">
                          <Link href={`/lb-forms/${form.id}`} className="font-medium text-[13px] text-[var(--crm-text-primary)] hover:text-[var(--crm-primary)] hover:underline truncate">
                            {form.title}
                          </Link>
                          <span className="text-[11px] text-[var(--crm-text-tertiary)] font-mono truncate mt-0.5 max-w-[200px]">
                            {form.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <Badge 
                            variant="secondary" 
                            className={`
                              h-[22px] px-2 text-[10px] font-mono tracking-wider border-0 shadow-none uppercase rounded-full
                              ${form.active 
                                ? 'bg-[var(--crm-green-soft)] text-[var(--crm-green)]' 
                                : 'bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)]'}
                            `}
                          >
                            {form.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {form.auto_create_lead && (
                            <Badge variant="secondary" className="h-[22px] px-2 text-[10px] font-mono tracking-wider border-0 shadow-none uppercase rounded-full bg-[var(--crm-primary)]/10 text-[var(--crm-primary)]">
                              Auto-Lead
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Link href={`/lb-forms/${form.id}/submissions`} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[var(--crm-surface-2)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)]/50 hover:text-[var(--crm-primary)] transition-colors text-[12px] font-mono text-[var(--crm-text-secondary)]">
                          <Activity className="h-3 w-3" />
                          {form.submissions_count}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-[12px] text-[var(--crm-text-tertiary)] font-mono">
                        {form.created_at ? format(new Date(form.created_at), 'dd MMM yy') : '-'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-[6px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)] hover:text-[var(--crm-primary)]"
                                onClick={() => { setSelectedForm(form); setShowShareDialog(true); }}
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-primary)] text-xs">Share</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-[6px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)] hover:text-[var(--crm-primary)]"
                                onClick={() => router.push(`/lb-forms/${form.id}`)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-primary)] text-xs">Edit Settings</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-[6px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)] hover:text-[var(--crm-primary)]"
                                onClick={() => router.push(`/lb-forms/${form.id}/submissions`)}
                              >
                                <Table className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-primary)] text-xs">View Submissions</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-[6px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)] hover:text-[var(--crm-primary)]"
                                onClick={() => toggleStatus(form)}
                              >
                                {form.active ? (
                                  <AlertCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-primary)] text-xs">
                              {form.active ? 'Deactivate' : 'Activate'}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-[6px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-red-soft)] hover:text-[var(--crm-red)]"
                                onClick={() => { setFormToDelete(form); setShowDeleteDialog(true); }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-red)] text-xs">Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </TooltipProvider>
        )}
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-xl w-full bg-[var(--crm-surface-1)] border-[var(--crm-border)] p-6 sm:p-8 rounded-[24px] shadow-2xl">
          <DialogHeader className="text-left space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[var(--crm-surface-2)] flex items-center justify-center border border-[var(--crm-border)] shadow-sm">
              <Share2 className="h-5 w-5 text-[var(--crm-primary)]" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[var(--crm-text-primary)]">Share Form Link</DialogTitle>
              <DialogDescription className="text-sm text-[var(--crm-text-secondary)] mt-1.5">
                Send this link to users or embed it natively on your website.
              </DialogDescription>
            </div>
          </DialogHeader>

          {selectedForm && (
            <Tabs defaultValue="link" className="mt-8">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="link">Share Link</TabsTrigger>
                <TabsTrigger value="embed">Embed Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-[var(--crm-text-tertiary)] group-focus-within:text-[var(--crm-primary)] transition-colors" />
                  </div>
                  <div className="w-full text-sm font-medium bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-2xl p-4 pl-11 pr-24 text-[var(--crm-text-primary)] break-all">
                    {getPublicUrl(selectedForm)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(getPublicUrl(selectedForm))
                      toast.success("Link copied to clipboard.")
                    }}
                    className="absolute right-2 top-2 h-10 px-4 bg-[var(--crm-surface-1)] shadow-sm border border-[var(--crm-border)] rounded-xl hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)]"
                  >
                    Copy
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[var(--crm-primary)] hover:opacity-90 text-white rounded-2xl h-12 font-bold shadow-sm"
                    onClick={() => openPreview(selectedForm)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview Form
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl p-0 border-[var(--crm-border)] bg-[var(--crm-surface-2)]"
                    onClick={() => setShowShareDialog(false)}
                  >
                    X
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="embed" className="space-y-6 mt-0">
                <div className="relative group rounded-2xl overflow-hidden border border-[var(--crm-border)]">
                  <div className="w-full bg-[var(--crm-surface-2)] p-5 text-[var(--crm-text-primary)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed break-words">
                    {`<div style="width: 100%; display: flex; justify-content: center;">
  <iframe 
    src="${getPublicUrl(selectedForm)}?embed=true"
    width="100%"
    height="600"
    style="max-width: 820px; 
           min-height: 600px; 
           border: none; 
           background: transparent;"
    loading="lazy"
    title="LeadBajaar Form"
  ></iframe>
</div>`}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const embedCode = `<div style="width: 100%; display: flex; justify-content: center;">\n  <iframe \n    src="${getPublicUrl(selectedForm)}?embed=true" \n    width="100%" \n    height="600" \n    style="max-width: 820px; min-height: 600px; border: none; background: transparent;" \n    loading="lazy"\n    title="LeadBajaar Form"\n  ></iframe>\n</div>`
                        navigator.clipboard.writeText(embedCode)
                        toast.success("Embed code copied to clipboard.")
                      }}
                      className="h-8 px-3 bg-[var(--crm-surface-1)] shadow-sm border border-[var(--crm-border)] rounded-lg hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)]"
                    >
                      Copy Code
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-[var(--crm-text-secondary)] text-center pb-2">
                  Copy and paste this HTML snippet into your website to embed the form directly onto your page.
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Form"
        description="This action is permanent and cannot be undone. Are you sure you want to delete this form and all its submissions?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
