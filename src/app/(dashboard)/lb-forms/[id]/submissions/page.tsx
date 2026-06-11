'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Loader2, Table as TableIcon, Download } from 'lucide-react'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'

interface FormSubmission {
  id: number
  data: Record<string, any>
  ip_address: string
  created_at: string
}

interface FormField {
  id: string
  label: string
}

export default function SubmissionsPage() {
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [fields, setFields] = useState<FormField[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchFormData()
    fetchSubmissions()
  }, [id])

  const fetchFormData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Failed to load form')
      const data = await response.json()
      setTitle(data.title)
      setFields(data.fields || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${id}/submissions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Failed to load submissions')
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error(error)
    }
  }

  const exportSubmissionsToCSV = () => {
    if (submissions.length === 0) return;

    // Get all unique field keys from all submissions
    const allKeys = new Set<string>();
    submissions.forEach(sub => {
      if (sub.data && typeof sub.data === 'object') {
        Object.keys(sub.data).forEach(key => allKeys.add(key));
      }
    });

    const headers = ['Submitted At', 'IP Address', ...Array.from(allKeys)];
    
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header row

    submissions.forEach(sub => {
      const row = [
        `"${new Date(sub.created_at).toLocaleString()}"`,
        `"${sub.ip_address || ''}"`
      ];

      Array.from(allKeys).forEach(key => {
        let val = sub.data[key] || '';
        // If the value is an array (like multiple checkboxes), join it
        if (Array.isArray(val)) val = val.join('; ');
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        row.push(`"${val}"`);
      });

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `form_submissions_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-primary)]" />
    </div>
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] overflow-hidden z-20">
      <div className="shrink-0 h-[60px] border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Link href="/lb-forms">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="font-bold text-[var(--crm-text-primary)]">
            {title || 'Form'} Submissions 
            <span className="text-xs text-[var(--crm-text-tertiary)] font-normal ml-2 bg-[var(--crm-surface-2)] px-2 py-1 rounded-md border border-[var(--crm-border)]">ID: {id}</span>
            <span className="ml-2">({submissions.length})</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportSubmissionsToCSV} disabled={submissions.length === 0} className="gap-2 border-[var(--crm-border)]">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[var(--crm-bg)]">
        <div className="max-w-6xl mx-auto">
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--crm-surface-1)] rounded-2xl border border-[var(--crm-border)]">
              <div className="h-16 w-16 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center mb-4">
                <TableIcon className="h-8 w-8 text-[var(--crm-text-tertiary)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--crm-text-primary)]">No submissions yet</h3>
              <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
                Share your form to start collecting responses.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-[var(--crm-text-secondary)]">Submitted At</th>
                      {fields.slice(0, 5).map(f => (
                        <th key={f.id} className="px-6 py-4 font-semibold text-[var(--crm-text-secondary)]">{f.label}</th>
                      ))}
                      <th className="px-6 py-4 font-semibold text-[var(--crm-text-secondary)] text-right">More Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--crm-border)]">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[var(--crm-surface-2)]/50 transition-colors">
                        <td className="px-6 py-4 text-[var(--crm-text-primary)] whitespace-nowrap">
                          {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString()}
                        </td>
                        {fields.slice(0, 5).map(f => {
                          const val = sub.data?.[f.label]
                          let displayVal = val || '-'
                          if (Array.isArray(val)) displayVal = val.join(', ')
                          
                          return (
                            <td key={f.id} className="px-6 py-4 text-[var(--crm-text-primary)] max-w-[200px] truncate" title={String(displayVal)}>
                              {displayVal}
                            </td>
                          )
                        })}
                        <td className="px-6 py-4 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-[var(--crm-primary)] hover:bg-[var(--crm-primary)]/10">View All</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-[var(--crm-surface-1)] border-[var(--crm-border)]">
                              <DialogHeader>
                                <DialogTitle>Submission Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                                {Object.entries(sub.data || {}).map(([key, value]) => (
                                  <div key={key} className="border-b border-[var(--crm-border)] pb-3">
                                    <div className="text-sm font-semibold text-[var(--crm-text-secondary)] mb-1">{key}</div>
                                    <div className="text-[var(--crm-text-primary)] whitespace-pre-wrap">
                                      {Array.isArray(value) ? value.join(', ') : String(value || '-')}
                                    </div>
                                  </div>
                                ))}
                                <div className="pt-4 flex gap-4 text-xs text-[var(--crm-text-tertiary)]">
                                  <span>IP: {sub.ip_address || 'Unknown'}</span>
                                  <span>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
