'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  CalendarDays, Clock, Video, MapPin, Phone,
  FileText, Edit, Save, X, Users, User, UserCircle, CheckCircle2,
  CalendarCheck, CircleDot, Settings2,
  ChevronRight, ChevronDown, Mail, Building2, AlignLeft, Loader2,
  Trash2, CalendarRange, Search
} from 'lucide-react'
import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { format } from 'date-fns'
import { getBookings, deleteBooking, rescheduleBooking, updateBooking, teamApi } from '@/lib/api'
import { toast } from 'sonner'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { RoleGuard } from '@/components/RoleGuard'
import { getAgentColor } from '@/utils/agentColors'
import { useTheme } from 'next-themes'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  name: string; email: string; phone: string
  profession: string; company: string; state: string
  requirements: string; avatar: string
}
interface TeamMember {
  id: number; name: string; email: string; avatar: string; role: string; status: string
}
interface QuestionnaireItem { question: string; answer: string }

export interface Attendee {
  id: number;
  lead: Lead;
  questionnaire: QuestionnaireItem[];
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  outcome?: string;
}
interface Meeting {
  id: number; title: string; date: string; time: string; duration: string
  lead: Lead; assignedTo: TeamMember; agent?: { id: number; name: string }
  type: 'video' | 'phone' | 'in-person'
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled'
  meetingLink?: string; agenda?: string[]
  questionnaire?: QuestionnaireItem[]; source: string
  notes?: string; outcome?: string; followUpDate?: string
  start_time?: string; timezone: string
  event_type_id: number
  duration_minutes: number
  eventType?: { id: number; title: string; color: string; type: string }
  attendees?: Attendee[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Mock team members removed - using real team data from API

const meetingTypeConfig = {
  video: { icon: Video, label: 'Video Call', color: 'text-primary', bg: 'bg-primary/10 dark:bg-indigo-900/20' },
  phone: { icon: Phone, label: 'Phone Call', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'in-person': { icon: MapPin, label: 'In Person', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' },
  completed: { label: 'Completed', className: 'bg-primary/10 text-primary border-primary/20 dark:bg-indigo-900/20 dark:text-indigo-400' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400' },
  rescheduled: { label: 'Rescheduled', className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400' },
}

// ─── Group by Date ─────────────────────────────────────────────────────────────

const groupMeetingsByDate = (meetings: Meeting[]) => {
  const sorted = [...meetings].sort((a, b) =>
    new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime()
  )
  const groups = sorted.reduce((g, m) => {
    const key = formatInTimeZone(new Date(m.start_time!), 'UTC', 'yyyy-MM-dd')
    if (!g[key]) g[key] = []
    g[key].push(m)
    return g
  }, {} as Record<string, Meeting[]>)

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .reduce((o, [k, v]) => { o[k] = v; return o }, {} as Record<string, Meeting[]>)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MeetingsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Time Slot Picker ──────────────────────────────────────────────────────────

const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4)
  const m = (i % 4) * 15
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const h12 = h % 12 === 0 ? 12 : h % 12
  return { value, label: `${h12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
})

function TimeSlotPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-medium">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <SelectValue placeholder="Select time" />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-[var(--crm-border)] z-[110] max-h-[240px]">
        {TIME_SLOTS.map(slot => (
          <SelectItem key={slot.value} value={slot.value} className="rounded-lg text-sm">
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

function MeetingDetailDialog({
  meeting, open, onOpenChange, onUpdate, onDelete, onReschedule, team = []
}: {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onUpdate?: (m: Meeting) => void | Promise<void>
  onDelete?: (id: number) => void | Promise<void>
  onReschedule?: (id: number, date: string, time: string) => void | Promise<void>
  team: TeamMember[]
}) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'

  // ── Per-field edit state ──
  type EditableField = 'host' | 'notes' | 'outcome'
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const [confirmingField, setConfirmingField] = useState<EditableField | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Committed values (shown in view mode) ──
  const [notes, setNotes] = useState(meeting?.notes ?? '')
  const [outcome, setOutcome] = useState(meeting?.outcome ?? '')
  const [assignedTo, setAssignedTo] = useState<TeamMember | null>(meeting?.assignedTo || null)

  // ── Draft values (while editing) ──
  const [draftNotes, setDraftNotes] = useState(meeting?.notes ?? '')
  const [draftOutcome, setDraftOutcome] = useState(meeting?.outcome ?? '')
  const [draftAssignedTo, setDraftAssignedTo] = useState<TeamMember | null>(meeting?.assignedTo || null)

  // ── Reschedule / Delete state ──
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newTime, setNewTime] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const resetReschedule = () => {
    if (meeting?.start_time) {
      const date = new Date(meeting.start_time)
      setNewDate(date)
      const total = Math.round((date.getHours() * 60 + date.getMinutes()) / 15) * 15
      const snapped = total >= 24 * 60 ? 0 : total
      const hours = String(Math.floor(snapped / 60)).padStart(2, '0')
      const minutes = String(snapped % 60).padStart(2, '0')
      setNewTime(`${hours}:${minutes}`)
    }
  }

  React.useEffect(() => {
    if (meeting) {
      setNotes(meeting.notes ?? '')
      setOutcome(meeting.outcome ?? '')
      setAssignedTo(meeting.assignedTo)
      setDraftNotes(meeting.notes ?? '')
      setDraftOutcome(meeting.outcome ?? '')
      setDraftAssignedTo(meeting.assignedTo)
      setEditingField(null)
      setConfirmingField(null)
      setIsRescheduling(false)
      setPopoverOpen(false)
      setIsDeleting(false)
      resetReschedule()
    }
  }, [meeting])

  if (!meeting) return null

  const typeInfo = meetingTypeConfig[meeting.type] ?? meetingTypeConfig.video
  const TypeIcon = typeInfo.icon
  const statusInfo = statusConfig[meeting.status] ?? statusConfig.confirmed

  // ── Per-field helpers ──
  const startEdit = (field: EditableField) => {
    setDraftNotes(notes)
    setDraftOutcome(outcome)
    setDraftAssignedTo(assignedTo)
    setEditingField(field)
    setConfirmingField(null)
  }
  const cancelEdit = () => { setEditingField(null); setConfirmingField(null) }

  const handleFieldSave = async (field: EditableField) => {
    if (!meeting) return
    setIsSubmitting(true)
    try {
      const updated = {
        ...meeting,
        notes: field === 'notes' ? draftNotes : notes,
        outcome: field === 'outcome' ? draftOutcome : outcome,
        assignedTo: (field === 'host' ? draftAssignedTo : assignedTo) as TeamMember,
      }
      await onUpdate?.(updated)
      if (field === 'notes') setNotes(draftNotes)
      if (field === 'outcome') setOutcome(draftOutcome)
      if (field === 'host') setAssignedTo(draftAssignedTo)
      setEditingField(null)
      setConfirmingField(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleting(true)
  }

  const handleConfirmDelete = async () => {
    if (!meeting) return
    setIsSubmitting(true)
    try {
      await onDelete?.(meeting.id)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRescheduleSubmit = async () => {
    if (!meeting || !newDate || !newTime) return
    setIsSubmitting(true)
    try {
      const dateStr = format(newDate, 'yyyy-MM-dd')
      await onReschedule?.(meeting.id, dateStr, newTime)
      setIsRescheduling(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = (name?: string | null) => (name || '').split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-16px)] sm:w-full max-w-4xl p-0 bg-white dark:bg-slate-900 border-none shadow-[0_24px_80px_-16px_rgba(30,45,107,0.35)] rounded-[20px] sm:rounded-[24px] gap-0 [&>button]:hidden">

        {/* Tinted Gradient Header */}
        <div className="relative p-4 sm:p-6 sm:pb-7 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent dark:from-primary/20 dark:via-primary/[0.06] border-b border-[var(--crm-border)]">
          <div className="flex items-start gap-3 pr-10">
            <div className="relative shrink-0">
              <div className="flex items-center justify-center h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-[0_8px_24px_-8px_rgba(30,45,107,0.4)] ring-1 ring-primary/15 text-primary">
                <TypeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full ring-[3px] ring-white dark:ring-slate-900"
                style={{ backgroundColor: meeting.eventType?.color || 'var(--lb-navy, #1e2d6b)' }}
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {meeting.title}
                </DialogTitle>
                <Badge className={cn('rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold shadow-none border shrink-0', statusInfo.className)}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <TypeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> {typeInfo.label}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> {meeting.time} · {meeting.duration}
                </span>
              </div>
            </div>
          </div>
          <DialogClose className="absolute right-3 top-3 sm:right-5 sm:top-5 h-8 w-8 rounded-full flex items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] transition-all">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* 2-Column Body — scrolls on mobile, dual-column fixed-height on desktop */}
        <div className="p-3 sm:p-5 max-h-[80vh] overflow-y-auto lg:overflow-hidden lg:h-[min(680px,80vh)] lg:max-h-none custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 lg:h-full">

            {/* Left Column: Details (scrolls independently on desktop) */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1">

              {/* Participant/Attendees Section */}
              <div className="border border-[var(--crm-border)] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="px-5 py-3.5 border-b border-[var(--crm-border)] flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    {meeting.attendees && meeting.attendees.length > 0
                      ? <Users className="h-4 w-4 text-primary" />
                      : <User className="h-4 w-4 text-primary" />}
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                    {meeting.attendees && meeting.attendees.length > 0 ? `Attendees (${meeting.attendees.length})` : 'Participant'}
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {meeting.attendees && meeting.attendees.length > 0 ? (
                    <div className="space-y-4">
                      {meeting.attendees.map((attendee, i) => (
                        <div key={i} className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: meeting.eventType?.color || '#1e2d6b' }}>
                              {initials(attendee.lead.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{attendee.lead.name}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                                <a href={`mailto:${attendee.lead.email}`} className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                                  <Mail className="h-3 w-3" />{attendee.lead.email}
                                </a>
                                {attendee.lead.phone && (
                                  <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <Phone className="h-3 w-3" />{attendee.lead.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {attendee.questionnaire && attendee.questionnaire.length > 0 && (
                            <div className="ml-13 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2">
                              {attendee.questionnaire.map((qa, j) => (
                                <div key={j}>
                                  <p className="text-xs font-medium text-slate-500">{qa.question}</p>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{qa.answer}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: meeting.eventType?.color || '#1e2d6b' }}>
                            {initials(meeting.lead.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{meeting.lead.name}</p>
                            {(meeting.lead.profession || meeting.lead.company) && (
                              <p className="text-xs text-slate-500 truncate">{meeting.lead.profession} {meeting.lead.company ? `· ${meeting.lead.company}` : ''}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                          {meeting.lead.email && (
                            <a href={`mailto:${meeting.lead.email}`} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 rounded-lg px-2 py-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors min-w-0 max-w-full">
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{meeting.lead.email}</span>
                            </a>
                          )}
                          {meeting.lead.phone && (
                            <span className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-2 py-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{meeting.lead.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {meeting.questionnaire && meeting.questionnaire.length > 0 && (
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-2.5">
                          {meeting.questionnaire.map((qa, i) => (
                            <div key={i}>
                              <p className="text-[10px] uppercase tracking-wider font-bold text-primary/70">{qa.question}</p>
                              <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{qa.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes — inline editable */}
              <div className="border border-[var(--crm-border)] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="px-5 py-3.5 border-b border-[var(--crm-border)] flex items-center justify-between gap-2">
                  <h4 className="text-[11px] uppercase tracking-[0.08em] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Meeting Notes
                  </h4>
                  {editingField !== 'notes' && (
                    <button
                      onClick={() => startEdit('notes')}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all shrink-0"
                      title="Edit notes"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {editingField === 'notes' ? (
                    <>
                      <Textarea value={draftNotes} onChange={e => setDraftNotes(e.target.value)} placeholder="Add meeting notes..." className="min-h-[100px] text-sm rounded-xl" />
                      {confirmingField === 'notes' ? (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Save these notes?</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold" onClick={cancelEdit} disabled={isSubmitting}>Cancel</Button>
                            <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-primary text-white" onClick={() => handleFieldSave('notes')} disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold text-slate-500" onClick={cancelEdit}>Discard</Button>
                          <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20" onClick={() => setConfirmingField('notes')}>
                            <Save className="h-3 w-3 mr-1" /> Save
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {notes || <span className="text-slate-400 italic">No notes added yet. Click the pencil to add.</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Outcome — inline editable */}
              <div className="border border-[var(--crm-border)] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="px-5 py-3.5 border-b border-[var(--crm-border)] flex items-center justify-between gap-2">
                  <h4 className="text-[11px] uppercase tracking-[0.08em] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Outcome
                  </h4>
                  {editingField !== 'outcome' && (
                    <button
                      onClick={() => startEdit('outcome')}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all shrink-0"
                      title="Edit outcome"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {editingField === 'outcome' ? (
                    <>
                      <Textarea value={draftOutcome} onChange={e => setDraftOutcome(e.target.value)} placeholder="Add meeting outcome..." className="min-h-[80px] text-sm rounded-xl" />
                      {confirmingField === 'outcome' ? (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Save this outcome?</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold" onClick={cancelEdit} disabled={isSubmitting}>Cancel</Button>
                            <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-primary text-white" onClick={() => handleFieldSave('outcome')} disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold text-slate-500" onClick={cancelEdit}>Discard</Button>
                          <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20" onClick={() => setConfirmingField('outcome')}>
                            <Save className="h-3 w-3 mr-1" /> Save
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {outcome || <span className="text-slate-400 italic">No outcome recorded yet. Click the pencil to add.</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Schedule & Actions */}
            <div className="lg:col-span-5 lg:h-full lg:min-h-0">
              <div className="bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] dark:from-primary/10 dark:to-primary/[0.03] border border-primary/15 rounded-[20px] p-3 sm:p-4 flex flex-col lg:h-full">

                <div className="flex items-center gap-3 mb-3 shrink-0">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">Schedule</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">When and how this meeting happens.</p>
                  </div>
                  {/* No global Edit button — fields are individually editable */}
                </div>

                <div className="space-y-2.5 flex-1 min-h-0 overflow-hidden">
                  {/* Assigned Host — inline editable */}
                  <div className="bg-white dark:bg-slate-900 border border-[var(--crm-border)] rounded-2xl px-3.5 py-2.5 shadow-sm space-y-2">
                    {editingField === 'host' ? (
                      <>
                        <Select value={draftAssignedTo?.email || ''} onValueChange={(v) => {
                          const m = team.find(t => t.email === v)
                          if (m) setDraftAssignedTo(m)
                        }}>
                          <SelectTrigger className="h-10 rounded-xl border-[var(--crm-border)] bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Select Host" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[var(--crm-border)] z-[200]" position="popper">
                            {team.filter(m => !m.status || m.status.toLowerCase() !== 'invited').map(m => (
                              <SelectItem key={m.id} value={m.email} className="rounded-lg py-2">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: getAgentColor(m.id).bg }}>
                                    {initials(m.name)}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name || m.email}</p>
                                    <p className="text-xs text-slate-500">{m.role}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {confirmingField === 'host' ? (
                          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                              Change host to <span className="font-bold">{draftAssignedTo?.name ?? 'Unassigned'}</span>?
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold" onClick={cancelEdit} disabled={isSubmitting}>Cancel</Button>
                              <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-primary text-white" onClick={() => handleFieldSave('host')} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold text-slate-500" onClick={cancelEdit}>Discard</Button>
                            <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20" onClick={() => setConfirmingField('host')}>
                              <Save className="h-3 w-3 mr-1" /> Save
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: assignedTo && assignedTo.id !== 0 ? getAgentColor(assignedTo.id).bg : '#94a3b8' }}>
                          {assignedTo ? initials(assignedTo.name) : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {assignedTo && assignedTo.id !== 0 ? assignedTo.name : 'Unassigned'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {assignedTo && assignedTo.id !== 0 ? assignedTo.role : 'Waiting for host'}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit('host')}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all shrink-0"
                          title="Change host"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Schedule Card */}
                  <div className="bg-white dark:bg-slate-900 border border-[var(--crm-border)] rounded-2xl shadow-sm divide-y divide-[var(--crm-border)]">
                    <div className="flex items-center justify-between px-3.5 py-2.5">
                      <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Date</span>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">{meeting.date}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2.5">
                      <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Time</span>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">{meeting.time}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2.5">
                      <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Duration</span>
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{meeting.duration}</span>
                    </div>
                    {meeting.eventType && (
                      <div className="flex items-center justify-between px-3.5 py-2.5">
                        <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Format</span>
                        <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900 dark:text-white">
                          {meeting.eventType.type === 'group' ? <Users className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-primary" />}
                          {meeting.eventType.type === 'group' ? 'Group Event' : '1-on-1'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Actions Bottom Area — pinned to rail bottom */}
                <div className="shrink-0 mt-auto pt-4 border-t border-primary/10">
                  {isRescheduling ? (
                    <div className="space-y-4 bg-white dark:bg-slate-900 border border-[var(--crm-border)] rounded-2xl p-5 shadow-sm">
                      <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-primary" /> Reschedule Meeting
                      </h4>
                      <div className="space-y-3">
                        <Popover modal={true} open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-medium">
                              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                              {newDate ? format(newDate, 'PPP') : 'Select Date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[110] shadow-xl rounded-2xl" align="center">
                            <Calendar
                              mode="single"
                              selected={newDate}
                              onSelect={(date) => { setNewDate(date); setPopoverOpen(false) }}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <TimeSlotPicker value={newTime} onChange={setNewTime} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="ghost" className="flex-1 h-11 rounded-xl font-bold" onClick={() => { resetReschedule(); setIsRescheduling(false) }} disabled={isSubmitting}>Cancel</Button>
                        <Button className="flex-1 h-11 rounded-xl bg-primary text-white font-bold shadow-md" onClick={handleRescheduleSubmit} disabled={isSubmitting || !newDate || !newTime}>
                          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Confirm'}
                        </Button>
                      </div>
                    </div>
                  ) : isDeleting ? (
                    <div className="space-y-4 bg-red-50/70 dark:bg-red-900/10 border border-red-200/60 dark:border-red-900/50 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-red-800 dark:text-red-200">Cancel Appointment?</h4>
                      <p className="text-xs text-red-600/80 dark:text-red-300/80">This action cannot be undone.</p>
                      <div className="flex gap-2 pt-2">
                        <Button variant="ghost" className="flex-1 h-11 rounded-xl font-bold text-red-600 hover:bg-red-100" onClick={() => setIsDeleting(false)} disabled={isSubmitting}>Keep It</Button>
                        <Button variant="destructive" className="flex-1 h-11 rounded-xl font-bold shadow-md bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete} disabled={isSubmitting}>
                          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelling...</> : 'Yes, Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35" onClick={() => setIsRescheduling(true)} disabled={(meeting.attendees?.length ?? 0) > 0}>
                        <CalendarRange className="h-4 w-4 mr-2" /> Reschedule Meeting
                      </Button>
                      <div className="flex items-center gap-3 px-1">
                        <span className="h-px flex-1 bg-[var(--crm-border)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">or</span>
                        <span className="h-px flex-1 bg-[var(--crm-border)]" />
                      </div>
                      <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-sm text-red-600 dark:text-red-400 border-red-200/70 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/15 hover:text-red-700 bg-white dark:bg-slate-900" onClick={handleDeleteClick} disabled={(meeting.attendees?.length ?? 0) > 0}>
                        Cancel Meeting
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Meeting Card (Upcoming) ───────────────────────────────────────────────────

function MeetingCard({ meeting, onSelect }: { meeting: Meeting; onSelect: (m: Meeting) => void }) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const typeInfo = meetingTypeConfig[meeting.type] ?? meetingTypeConfig.video
  const TypeIcon = typeInfo.icon
  const statusInfo = statusConfig[meeting.status] ?? statusConfig.confirmed
  const initials = (name?: string | null) => (name || '').split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('')

  return (
    <div
      onClick={() => onSelect(meeting)}
      className="group flex flex-col p-3.5 sm:p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:border-[var(--crm-primary)] hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden relative"
    >
      {/* Dynamic left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: meeting.eventType?.color || '#4f46e5' }}
      />

      {/* Top: Avatar + Info */}
      <div className="flex items-start gap-3 pl-1">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm mt-0.5"
          style={{ backgroundColor: meeting.eventType?.color || '#4f46e5' }}
        >
          {meeting.attendees && meeting.attendees.length > 0
            ? <Users className="h-4 w-4" />
            : initials(meeting.lead.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <p className="font-semibold text-sm text-[var(--crm-text-primary)] truncate">{meeting.title}</p>
            {meeting.eventType && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 whitespace-nowrap"
                style={{
                  color: meeting.eventType.color || '#4f46e5',
                  backgroundColor: `${meeting.eventType.color || '#4f46e5'}12`,
                  borderColor: `${meeting.eventType.color || '#4f46e5'}40`
                }}
              >
                {meeting.eventType.type === 'group' ? 'Group' : '1-ON-1'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--crm-text-secondary)] mb-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{meeting.time} · {meeting.duration}</span>
          </div>
          {meeting.agent && (
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: isDark ? getAgentColor(meeting.agent.id).bgDark : getAgentColor(meeting.agent.id).bg,
                color: isDark ? getAgentColor(meeting.agent.id).textDark : getAgentColor(meeting.agent.id).text,
                borderColor: isDark ? getAgentColor(meeting.agent.id).borderDark : getAgentColor(meeting.agent.id).border,
              }}
            >
              <Users className="h-3 w-3 opacity-70" />
              <span>Host: {meeting.agent.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Type badge + Status + Actions + Chevron */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[var(--crm-border)]">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <div className={cn('flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border', typeInfo.bg, typeInfo.color, 'border-current/10')}>
            <TypeIcon className="h-3 w-3 shrink-0" />
            <span>{typeInfo.label.replace(' Call', '')}</span>
          </div>
          {/* Status */}
          <Badge variant="outline" className={cn('text-[10px] sm:text-xs font-semibold border shrink-0', statusInfo.className)}>
            {statusInfo.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Call & WhatsApp */}
          {meeting.lead.phone && (
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <a
                href={`tel:${meeting.lead.phone}`}
                className="flex items-center justify-center h-7 w-7 rounded-full border border-indigo-100 dark:border-indigo-800/50 bg-primary/5 hover:bg-primary/20 text-primary dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 transition-all duration-200 shadow-sm"
                title={`Call ${meeting.lead.name}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://wa.me/${meeting.lead.phone.replace(/\D/g, '').length === 10 ? '91' + meeting.lead.phone.replace(/\D/g, '') : meeting.lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-7 w-7 rounded-full border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 transition-all duration-200 shadow-sm"
                title={`WhatsApp ${meeting.lead.name}`}
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          )}
          <ChevronRight className="h-4 w-4 text-[var(--crm-text-tertiary)] group-hover:text-[var(--crm-primary)] transition-colors shrink-0" />
        </div>
      </div>
    </div>
  )
}


// ─── Infinite Scroll Hook ─────────────────────────────────────────────────────

function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean, debugName: string) {
  const observer = useRef<IntersectionObserver | null>(null)

  return useCallback((node: HTMLDivElement | null) => {
    if (observer.current) {
      observer.current.disconnect()
    }

    if (node && hasMore) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onLoadMore()
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      )
      observer.current.observe(node)
    }
  }, [onLoadMore, hasMore, debugName])
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const groupRawBookings = (rawBookings: any[]) => {
  const grouped = new Map<string, any>()
  const results: any[] = []

  for (const b of rawBookings) {
    if (b.eventType?.type === 'group') {
      const key = `${b.event_type_id}_${b.start_time}`
      if (grouped.has(key)) {
        grouped.get(key).grouped_bookings.push(b)
      } else {
        const parent = { ...b, grouped_bookings: [b] }
        grouped.set(key, parent)
        results.push(parent)
      }
    } else {
      results.push(b)
    }
  }
  return results
}

const mapBooking = (booking: any, defaultStatus: string): Meeting => {
  const isGrouped = booking.grouped_bookings && booking.grouped_bookings.length > 0;
  // Use the first booking as the representative for generic fields
  const repBooking = isGrouped ? booking.grouped_bookings[0] : booking;

  const getAnswer = (answersToSearch: any, key: string) => {
    if (Array.isArray(answersToSearch)) {
      return answersToSearch.find((a: any) => a.question?.toUpperCase() === key.toUpperCase())?.answer
    }
    if (typeof answersToSearch === 'object' && answersToSearch !== null) {
      const k = key.toLowerCase()
      return answersToSearch[`q-${k}`] || answersToSearch[k] || answersToSearch[key] ||
        Object.entries(answersToSearch).find(([ak]) => ak.toLowerCase().includes(k))?.[1]
    }
    return null
  }

  const name = repBooking.lead?.name || getAnswer(repBooking.answers, 'NAME') || getAnswer(repBooking.answers, 'name') || 'Guest'
  const email = repBooking.lead?.email || getAnswer(repBooking.answers, 'EMAIL') || getAnswer(repBooking.answers, 'email') || ''
  const phone = repBooking.lead?.phone || getAnswer(repBooking.answers, 'phone') || getAnswer(repBooking.answers, 'MOBILE NUMBER') || ''
  const startTime = new Date(repBooking.start_time)

  const parseQuestionnaire = (answersObj: any): QuestionnaireItem[] => {
    if (Array.isArray(answersObj)) {
      return answersObj.map((a: any) => ({ question: a.question, answer: a.answer }))
    }
    if (typeof answersObj === 'object' && answersObj !== null) {
      return Object.entries(answersObj).map(([k, v]) => ({
        question: k.replace(/^q-/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        answer: String(v)
      }))
    }
    return []
  }

  const attendees: Attendee[] | undefined = isGrouped
    ? booking.grouped_bookings.map((b: any) => ({
      id: b.id,
      lead: {
        name: b.lead?.name || getAnswer(b.answers, 'NAME') || getAnswer(b.answers, 'name') || 'Guest',
        email: b.lead?.email || getAnswer(b.answers, 'EMAIL') || getAnswer(b.answers, 'email') || '',
        phone: b.lead?.phone || getAnswer(b.answers, 'phone') || getAnswer(b.answers, 'MOBILE NUMBER') || '',
        profession: '', company: b.lead?.company || '', state: '', requirements: '', avatar: ''
      },
      questionnaire: parseQuestionnaire(b.answers),
      status: b.status || defaultStatus,
      notes: b.notes,
      outcome: b.outcome
    }))
    : undefined;

  return {
    id: repBooking.id, // For grouped, this is just the first booking's ID
    title: isGrouped ? `${repBooking.eventType?.title || 'Group Event'}` : `${name}`,
    date: formatInTimeZone(startTime, 'UTC', 'EEE, MMM d, yyyy'),
    time: formatInTimeZone(startTime, 'UTC', 'h:mm a'),
    duration: `${repBooking.eventType?.duration || 30} minutes`,
    type: (repBooking.eventType?.location as Meeting['type']) || 'video',
    status: (repBooking.status || defaultStatus) as Meeting['status'],
    lead: {
      name, email, phone, profession: '', company: repBooking.lead?.company || '',
      state: '', requirements: '', avatar: '',
    },
    attendees,
    assignedTo: {
      id: repBooking.user_id || 0,
      name: repBooking.user?.name || 'Host',
      email: repBooking.user?.email || '',
      role: 'Host',
      avatar: '',
      status: repBooking.user?.status || 'Active'
    },
    agent: repBooking.user ? {
      id: repBooking.user.id,
      name: repBooking.user.name
    } : undefined,
    meetingLink: repBooking.meeting_link || '',
    source: repBooking.lead?.source || 'Website',
    questionnaire: parseQuestionnaire(repBooking.answers),
    start_time: repBooking.start_time,
    timezone: repBooking.timezone || 'UTC',
    event_type_id: repBooking.event_type_id,
    duration_minutes: repBooking.eventType?.duration || 30,
    eventType: repBooking.eventType ? {
      id: repBooking.eventType.id,
      title: repBooking.eventType.title,
      color: repBooking.eventType.color,
      type: repBooking.eventType.type
    } : undefined
  }
}

export default function MeetingsPage() {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'history'>('upcoming')
  // Raw booking rows from the API, deduped by id. Meetings shown in the UI are
  // derived from these (grouped + mapped) so that pagination overlaps and group
  // events split across page boundaries can never render the same meeting twice.
  const [rawBookings, setRawBookings] = useState<{ upcoming: any[]; history: any[] }>({ upcoming: [], history: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState({ upcoming: false, history: false })
  // Synchronous in-flight guard: IntersectionObserver can fire again before the
  // isFetchingMore state update is committed, which double-fetched the same page.
  const fetchingRef = useRef({ upcoming: false, history: false })

  const meetings = useMemo(() => ({
    upcoming: groupRawBookings(rawBookings.upcoming).map((b: any) => mapBooking(b, 'confirmed')),
    history: groupRawBookings(rawBookings.history).map((b: any) => mapBooking(b, 'completed')),
  }), [rawBookings])

  const mergeRawBookings = (prev: any[], incoming: any[]) => {
    const seen = new Set(prev.map((b: any) => b.id))
    return [...prev, ...incoming.filter((b: any) => !seen.has(b.id))]
  }
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const [pagination, setPagination] = useState({
    upcoming: { page: 1, hasMore: true, total: 0 },
    history: { page: 1, hasMore: true, total: 0 }
  })

  // ─── Team Data ─────────────────────────────────────────────────────────────
  const [team, setTeam] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const members = await teamApi.getMembers()
        if (Array.isArray(members)) {
          setTeam(members)
        }
      } catch (err) {
        console.error('Error fetching team:', err)
      }
    }
    fetchTeam()
  }, [])

  const loadMoreUpcoming = useCallback(async () => {
    if (fetchingRef.current.upcoming || !pagination.upcoming.hasMore) return

    try {
      fetchingRef.current.upcoming = true
      setIsFetchingMore(prev => ({ ...prev, upcoming: true }))
      const nextPage = pagination.upcoming.page + 1
      const response = await getBookings({ type: 'upcoming', page: nextPage, per_page: 15, search: debouncedSearch })
      const body = response.data
      const data = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])

      if (data.length > 0) {
        setRawBookings(prev => ({ ...prev, upcoming: mergeRawBookings(prev.upcoming, data) }))
        setPagination(prev => ({ ...prev, upcoming: { page: nextPage, hasMore: data.length >= 15, total: body.total || prev.upcoming.total } }))
      } else {
        setPagination(prev => ({ ...prev, upcoming: { ...prev.upcoming, hasMore: false } }))
      }
    } catch (err) {
      console.error('Error loading more upcoming:', err)
    } finally {
      fetchingRef.current.upcoming = false
      setIsFetchingMore(prev => ({ ...prev, upcoming: false }))
    }
  }, [pagination.upcoming, debouncedSearch])

  const loadMoreHistory = useCallback(async () => {
    if (fetchingRef.current.history || !pagination.history.hasMore) {
      return
    }

    try {
      fetchingRef.current.history = true
      setIsFetchingMore(prev => ({ ...prev, history: true }))
      const nextPage = pagination.history.page + 1
      const response = await getBookings({ type: 'history', page: nextPage, per_page: 15, search: debouncedSearch })

      const body = response.data
      const data = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])

      if (data.length > 0) {
        setRawBookings(prev => ({ ...prev, history: mergeRawBookings(prev.history, data) }))
        setPagination(prev => ({ ...prev, history: { page: nextPage, hasMore: data.length >= 15, total: body.total || prev.history.total } }))
      } else {
        setPagination(prev => ({ ...prev, history: { ...prev.history, hasMore: false } }))
      }
    } catch (err) {
      console.error('[MeetingsPage] Error loading more history:', err)
    } finally {
      fetchingRef.current.history = false
      setIsFetchingMore(prev => ({ ...prev, history: false }))
    }
  }, [pagination.history, debouncedSearch])

  const upcomingSentinel = useInfiniteScroll(loadMoreUpcoming, pagination.upcoming.hasMore, 'Upcoming')
  const historySentinel = useInfiniteScroll(loadMoreHistory, pagination.history.hasMore, 'History')

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
      setIsLoading(true)
        const [upRes, histRes] = await Promise.all([
          getBookings({ type: 'upcoming', page: 1, per_page: 15, search: debouncedSearch }),
          getBookings({ type: 'history', page: 1, per_page: 15, search: debouncedSearch })
        ])

        const extractData = (res: any) => {
          const body = res.data
          return Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])
        }

        const upData = extractData(upRes)
        const histData = extractData(histRes)


        setRawBookings({ upcoming: upData, history: histData })

        setPagination({
          upcoming: { page: 1, hasMore: upData.length >= 15, total: upRes.data.total || upData.length },
          history: { page: 1, hasMore: histData.length >= 15, total: histRes.data.total || histData.length }
        })
      } catch (err) {
        console.error('[MeetingsPage] Error fetching initial meetings:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [debouncedSearch])

  const handleMeetingUpdate = async (updated: Meeting) => {
    try {
      // Extract the fields we want to update
      const updateData = {
        user_id: updated.assignedTo.id,
        notes: updated.notes,
        outcome: updated.outcome
      };

      const response = await updateBooking(updated.id, updateData);
      const freshBooking = response.data.booking;
      const freshlyMapped = mapBooking(freshBooking, updated.status);

      // Merge onto the existing raw row so relations the update response may
      // omit (eventType, lead) aren't lost; derived meetings recompute from this.
      const patchRaw = (rows: any[]) => rows.map(b => b.id === freshBooking.id ? { ...b, ...freshBooking } : b)
      setRawBookings(prev => ({
        upcoming: patchRaw(prev.upcoming),
        history: patchRaw(prev.history),
      }))
      setSelectedMeeting(freshlyMapped)
      toast.success('Meeting updated successfully')
    } catch (err) {
      console.error('Failed to update meeting:', err);
      toast.error('Failed to update meeting');
    }
  }

  const handleMeetingDelete = async (id: number) => {
    try {
      await deleteBooking(id)
      setRawBookings(prev => ({
        upcoming: prev.upcoming.filter((b: any) => b.id !== id),
        history: prev.history.filter((b: any) => b.id !== id),
      }))
      toast.success('Meeting canceled successfully')
    } catch (err) {
      toast.error('Failed to cancel meeting')
    }
  }

  const handleMeetingReschedule = async (id: number, date: string, time: string) => {
    try {
      const meeting = [...meetings.upcoming, ...meetings.history].find(m => m.id === id)
      const duration = meeting?.duration_minutes || 30
      const response = await rescheduleBooking(id, { date, time, duration })
      const freshBooking = response.data.booking
      const updated = mapBooking(freshBooking, 'confirmed')

      const patchRaw = (rows: any[]) => rows.map(b => b.id === id ? { ...b, ...freshBooking } : b)
      setRawBookings(prev => ({
        upcoming: patchRaw(prev.upcoming),
        history: patchRaw(prev.history),
      }))
      setSelectedMeeting(updated)
      toast.success('Meeting rescheduled successfully')
    } catch (err: any) {
      if (err.response?.status !== 422) {
        console.error('Frontend reschedule error:', err)
      }
      const msg = err.response?.data?.message || err.message || 'Failed to reschedule meeting'
      toast.error(msg)
    }
  }

  const openMeeting = (m: Meeting) => {
    setSelectedMeeting(m)
    setDialogOpen(true)
  }

  const initials = (name?: string | null) => (name || '').split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('')

  const filteredUpcoming = meetings.upcoming.filter(m => statusFilter === 'all' || m.status === statusFilter)
  const filteredHistory = meetings.history.filter(m => statusFilter === 'all' || m.status === statusFilter)

  // Stats
  const totalUpcoming = pagination.upcoming.total || meetings.upcoming.length
  const totalHistory = pagination.history.total || meetings.history.length

  // Try to use true API totals for these, but fallback to arrays if unavailable.
  // Note: If you want exact server-side "confirmed" counts, you'd need backend support,
  // but this is close enough as a fallback for the KPI row.
  const totalConfirmed = meetings.upcoming.filter(m => m.status === 'confirmed').length
  const totalCompleted = meetings.history.filter(m => m.status === 'completed').length

  return (
    <RoleGuard allowedFeatures={['meetings']}>
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <div className="shrink-0">
          {/* Header: Search + Event Types button */}
          <div className="flex items-center gap-2 pb-3 sm:pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--crm-text-tertiary)]" />
              <Input
                placeholder="Search by name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 h-8 text-[12px] bg-[var(--crm-surface-2)] border-[var(--crm-border)] focus-visible:ring-[var(--lb-navy)]"
              />
            </div>
            <Link href="/meetings/event-types" className="shrink-0">
              <Button size="sm" className="h-8 px-2 sm:px-3 text-[12px] bg-[var(--lb-navy)] hover:opacity-90 text-white shadow-sm transition-opacity">
                <Settings2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Event Types</span>
              </Button>
            </Link>
          </div>

          {/* KPI Row — 2-col grid on mobile, horizontal scroll on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:overflow-x-auto gap-2 sm:gap-3 shrink-0 pb-3 border-b border-[var(--crm-border)] no-scrollbar mb-2">
            {[
              { label: 'Upcoming', value: totalUpcoming, color: 'text-primary dark:text-indigo-400', bg: 'bg-primary/10 dark:bg-primary/10 border-indigo-100 dark:border-primary/20' },
              { label: 'Confirmed', value: totalConfirmed, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
              { label: 'Completed', value: totalCompleted, color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20' },
              { label: 'Total', value: totalUpcoming + totalHistory, color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={cn("flex items-center justify-between sm:justify-start sm:gap-2 px-3 py-2 rounded-lg border shadow-sm", bg)}>
                <span className={cn("font-medium text-xs opacity-80", color)}>{label}</span>
                <span className={cn("font-bold text-sm", color)}>
                  {isLoading ? <Skeleton className="h-4 w-6 inline-block bg-current/20" /> : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <Tabs defaultValue="upcoming" className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-[var(--crm-border)] shrink-0 bg-transparent">
              <TabsList className="h-11 bg-transparent p-0 gap-2 sm:gap-4">
                <TabsTrigger value="upcoming" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--lb-navy)] data-[state=active]:text-[var(--lb-navy)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-1 sm:px-2 text-xs sm:text-sm font-semibold">
                  <span className="hidden sm:inline">Upcoming Meetings</span>
                  <span className="sm:hidden">Upcoming</span>
                  {totalUpcoming > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-[var(--crm-accent)] text-white border-transparent">
                      {totalUpcoming}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--lb-navy)] data-[state=active]:text-[var(--lb-navy)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-1 sm:px-2 text-xs sm:text-sm font-semibold">
                  <span className="hidden sm:inline">Past Meetings</span>
                  <span className="sm:hidden">Past</span>
                </TabsTrigger>
              </TabsList>
              <div className="py-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-[110px] sm:w-[140px] border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-xs sm:text-sm">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Upcoming Tab ── */}
            <TabsContent value="upcoming" className="flex-1 data-[state=active]:flex flex-col min-h-0 m-0 mt-0 overflow-hidden outline-none">
              <div className="flex-1 overflow-auto px-2 py-3 sm:p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {isLoading ? (
                  <div className="space-y-4">
                    <MeetingsSkeleton />
                  </div>
                ) : filteredUpcoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                      <CalendarCheck className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No upcoming meetings</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Meetings booked via your event types will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupMeetingsByDate(filteredUpcoming)).map(([date, dayMeetings]) => (
                      <div key={date}>
                        <div className="flex items-center gap-3 mb-4">
                          <p className="text-[10px] font-bold text-primary dark:text-indigo-400 uppercase tracking-widest bg-primary/10 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {formatInTimeZone(new Date(date), 'UTC', 'EEE, MMM d, yyyy')}
                          </p>
                          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                          <span className="text-xs font-medium text-slate-400">{dayMeetings.length} meeting{dayMeetings.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-3">
                          {dayMeetings.map(m => (
                            <MeetingCard key={m.id} meeting={m} onSelect={openMeeting} />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Scroll sentinel */}
                    <div ref={upcomingSentinel} className="py-8 flex flex-col items-center justify-center gap-3">
                      {pagination.upcoming.hasMore && (
                        <>
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          <p className="text-xs text-slate-500 font-medium">Loading more meetings...</p>
                        </>
                      )}
                      {!pagination.upcoming.hasMore && totalUpcoming > 0 && (
                        <p className="text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full">You've reached the end of the list</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── History Tab ── */}
            <TabsContent value="history" className="flex-1 data-[state=active]:flex flex-col min-h-0 m-0 mt-0 overflow-hidden outline-none">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  <MeetingsSkeleton />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                    <AlignLeft className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No meeting history</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Past meetings will appear here</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 bg-transparent">
                  <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    <Table className="relative border-separate border-spacing-0 min-w-max">
                      <TableHeader className="sticky top-0 z-20">
                        <TableRow className="bg-[var(--crm-surface-2)] shadow-sm">
                          {['Meeting', 'Attendee', 'Date & Time', 'Type', 'Status', 'Outcome', 'Actions'].map(h => (
                            <TableHead key={h}
                              className="h-12 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)] backdrop-blur-sm first:pl-6">
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistory.map(m => {
                          const typeInfo = meetingTypeConfig[m.type] ?? meetingTypeConfig.video
                          const TypeIcon = typeInfo.icon
                          const statusInfo = statusConfig[m.status] ?? statusConfig.completed
                          return (
                            <TableRow key={m.id}
                              className="border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)] transition-colors">
                              <TableCell className="whitespace-nowrap font-semibold text-sm text-[var(--crm-text-primary)] pl-6">
                                {m.title}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                                    {initials(m.lead.name)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-semibold text-[var(--crm-text-primary)] whitespace-nowrap">{m.lead.name}</p>
                                      {m.lead.phone && (
                                        <div className="flex items-center gap-1 inline-flex shrink-0">
                                          <a
                                            href={`tel:${m.lead.phone}`}
                                            className="flex items-center justify-center p-1 rounded-full text-[var(--crm-text-tertiary)] hover:text-primary hover:bg-primary/10 dark:hover:bg-indigo-900/30 transition-colors"
                                            title={`Call ${m.lead.name}`}
                                          >
                                            <Phone className="h-3 w-3" />
                                          </a>
                                          <a
                                            href={`https://wa.me/${m.lead.phone.replace(/\D/g, '').length === 10 ? '91' + m.lead.phone.replace(/\D/g, '') : m.lead.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center p-1 rounded-full text-[var(--crm-text-tertiary)] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                                            title={`WhatsApp ${m.lead.name}`}
                                          >
                                            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                    {m.lead.company && <p className="text-[10px] text-[var(--crm-text-secondary)] mt-0.5 whitespace-nowrap">{m.lead.company}</p>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-[var(--crm-text-secondary)]">
                                <div className="font-medium text-[var(--crm-text-primary)]">{m.date}</div>
                                <div className="mt-0.5">{m.time}</div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border shadow-sm', typeInfo.bg, typeInfo.color, 'border-current/10')}>
                                  <TypeIcon className="h-3 w-3" />{typeInfo.label}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant="outline" className={cn('text-[10px] font-bold uppercase tracking-wider border shadow-sm px-2.5 py-0.5 rounded-full', statusInfo.className)}>
                                  {statusInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-[var(--crm-text-secondary)] max-w-[200px] truncate">
                                {m.outcome || <span className="text-[var(--crm-text-tertiary)] italic">— No outcome recorded —</span>}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] transition-all"
                                  onClick={() => openMeeting(m)}>
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>

                    {/* Scroll sentinel moved inside scrollable div */}
                    <div ref={historySentinel} className="py-8 flex flex-col items-center justify-center gap-3 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                      {pagination.history.hasMore && (
                        <>
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          <p className="text-xs text-slate-500 font-medium">Loading history...</p>
                        </>
                      )}
                      {!pagination.history.hasMore && totalHistory > 0 && (
                        <p className="text-xs text-slate-400 font-medium bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow-sm">End of history</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          <MeetingDetailDialog
            meeting={selectedMeeting}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onUpdate={handleMeetingUpdate}
            onDelete={handleMeetingDelete}
            onReschedule={handleMeetingReschedule}
            team={team}
          />
        </div>
      </div>
    </RoleGuard>
  )
}
