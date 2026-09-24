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
  CalendarCheck, CircleDot,
  ChevronRight, ChevronDown, Mail, Building2, AlignLeft, Loader2,
  Trash2, CalendarRange, Search, Download, MoreHorizontal, Calendar as CalendarIcon
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toTelHref, toWhatsAppPhone } from '@/lib/phone'
import { EventTypesTab } from './components/EventTypesTab'

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
  video: { icon: Video, label: 'Video Call', color: 'text-[#FE4548]', bg: 'bg-[#FE4548]/10 border border-[#FE4548]/15 dark:bg-[#FE4548]/5 dark:border-[#FE4548]/10' },
  phone: { icon: Phone, label: 'Phone Call', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 border border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/30' },
  'in-person': { icon: MapPin, label: 'In Person', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 border border-purple-250/40 dark:bg-purple-900/20 dark:border-purple-800/30' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-600 text-white border-none font-extrabold shadow-sm' },
  pending: { label: 'Pending', className: 'bg-amber-500 text-white border-none font-extrabold shadow-sm' },
  completed: { label: 'Completed', className: 'bg-blue-600 text-white border-none font-extrabold shadow-sm' },
  cancelled: { label: 'Cancelled', className: 'bg-red-600 text-white border-none font-extrabold shadow-sm' },
  rescheduled: { label: 'Rescheduled', className: 'bg-purple-600 text-white border-none font-extrabold shadow-sm' },
}

const isBlackOrDark = (c?: string | null) => {
  if (!c) return true
  const lower = c.toLowerCase().trim()
  return (
    lower === '#000' ||
    lower === '#000000' ||
    lower === '#0a0a0b' ||
    lower === '#10182d' ||
    lower === '#111827' ||
    lower === '#0f172a' ||
    lower === '#1e293b' ||
    lower === '#1e2d6b' ||
    lower === 'black'
  )
}

// ─── Group by Date ─────────────────────────────────────────────────────────────

const groupMeetingsByDate = (meetings: Meeting[], descending = false) => {
  const validMeetings = meetings.filter(m => {
    if (!m.start_time) return false
    const d = new Date(m.start_time)
    return !isNaN(d.getTime())
  })

  const sorted = [...validMeetings].sort((a, b) => {
    const timeA = new Date(a.start_time!).getTime()
    const timeB = new Date(b.start_time!).getTime()
    return descending ? timeB - timeA : timeA - timeB
  })
  const groups = sorted.reduce((g, m) => {
    try {
      const key = formatInTimeZone(new Date(m.start_time!), 'UTC', 'yyyy-MM-dd')
      if (!g[key]) g[key] = []
      g[key].push(m)
    } catch (e) {
      console.error("Invalid date value", m.start_time)
    }
    return g
  }, {} as Record<string, Meeting[]>)

  return Object.entries(groups)
    .sort(([a], [b]) => {
      const timeA = new Date(a).getTime()
      const timeB = new Date(b).getTime()
      return descending ? timeB - timeA : timeA - timeB
    })
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

  // A meeting whose end time has already passed can't be rescheduled or cancelled.
  const isMeetingPast = React.useMemo(() => {
    if (!meeting?.start_time) return false
    const endTime = new Date(meeting.start_time).getTime() + (meeting.duration_minutes ?? 0) * 60000
    return endTime < Date.now()
  }, [meeting?.start_time, meeting?.duration_minutes])

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
      <DialogContent className="w-screen h-[100dvh] max-w-none sm:w-full sm:max-w-4xl sm:h-auto p-0 bg-white dark:bg-slate-900 border-none shadow-none sm:shadow-[0_24px_80px_-16px_rgba(30,45,107,0.35)] rounded-none sm:rounded-[24px] gap-0 [&>button]:hidden flex flex-col">

        {/* Premium Clean Header */}
        <div className="relative p-4 sm:p-6 sm:pb-7 bg-white dark:bg-slate-900 border-b border-[var(--crm-border)] sm:rounded-t-[24px]">
          <div className="flex items-start gap-3 pr-10">
            <div className="relative shrink-0">
              <div className="flex items-center justify-center h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-slate-500 dark:text-slate-400">
                <TypeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
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
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400">
                {getPlatformBadge(meeting)}
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="flex items-center gap-1 font-medium">
                  <TypeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500" /> {typeInfo.label}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500" /> {meeting.time} · {meeting.duration}
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
        <div className="flex-1 sm:flex-none p-3 sm:p-5 sm:max-h-[80vh] overflow-y-auto lg:overflow-hidden lg:h-[min(680px,80vh)] lg:max-h-none custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 lg:h-full">

            {/* Left Column: Details (scrolls independently on desktop) */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1">

              {/* Participant/Attendees Section */}
              <div className="border border-[var(--crm-border)] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="px-5 py-3.5 border-b border-[var(--crm-border)] flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    {meeting.attendees && meeting.attendees.length > 0
                      ? <Users className="h-4 w-4 text-slate-600" />
                      : <User className="h-4 w-4 text-slate-600" />}
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
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: meeting.eventType?.color && !isBlackOrDark(meeting.eventType.color) ? meeting.eventType.color : getAgentColor(attendee.id || i).bg }}>
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
                          <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: meeting.eventType?.color && !isBlackOrDark(meeting.eventType.color) ? meeting.eventType.color : getAgentColor(meeting.id || 1).bg }}>
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
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2.5">
                          {meeting.questionnaire.map((qa, i) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{qa.question}</p>
                              <p className="text-sm text-slate-900 dark:text-white mt-0.5">{qa.answer}</p>
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
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-500" /> Meeting Notes
                  </h4>
                  {editingField !== 'notes' && (
                    <Button variant="ghost" size="icon"
                      onClick={() => startEdit('notes')}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 p-0"
                      title="Edit notes"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
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
                            <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-[var(--lb-navy)] text-white hover:opacity-90" onClick={() => handleFieldSave('notes')} disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold text-slate-500" onClick={cancelEdit}>Discard</Button>
                          <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-[var(--lb-navy)] text-white hover:opacity-90" onClick={() => setConfirmingField('notes')}>
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
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" /> Outcome
                  </h4>
                  {editingField !== 'outcome' && (
                    <Button variant="ghost" size="icon"
                      onClick={() => startEdit('outcome')}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 p-0"
                      title="Edit outcome"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
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
                            <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-[var(--lb-navy)] text-white hover:opacity-90" onClick={() => handleFieldSave('outcome')} disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold text-slate-500" onClick={cancelEdit}>Discard</Button>
                          <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-[var(--lb-navy)] text-white hover:opacity-90" onClick={() => setConfirmingField('outcome')}>
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
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[20px] p-4 flex flex-col lg:h-full">

                <div className="flex items-center gap-3 mb-4 shrink-0">
                  <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 shadow-sm">
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
                              <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-[var(--lb-navy)] text-white hover:opacity-90" onClick={() => handleFieldSave('host')} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-xs font-bold text-slate-500" onClick={cancelEdit}>Discard</Button>
                            <Button size="sm" className="flex-1 h-8 rounded-lg text-xs font-bold bg-[var(--lb-navy)] text-white hover:opacity-90" onClick={() => setConfirmingField('host')}>
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
                        <Button variant="ghost" size="icon"
                          onClick={() => startEdit('host')}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all shrink-0 p-0"
                          title="Change host"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
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
                        <Button className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer" onClick={handleRescheduleSubmit} disabled={isSubmitting || !newDate || !newTime}>
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
                        <Button variant="destructive" className="flex-1 h-11 rounded-xl font-bold shadow-md bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={handleConfirmDelete} disabled={isSubmitting}>
                          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelling...</> : 'Yes, Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {isMeetingPast && (
                        <p className="text-[11px] font-medium text-slate-400 text-center pb-1">This meeting has already happened and can no longer be changed.</p>
                      )}
                      <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer" onClick={() => setIsRescheduling(true)} disabled={isMeetingPast || (meeting.attendees?.length ?? 0) > 0}>
                        <CalendarRange className="h-4 w-4 mr-2" /> Reschedule Meeting
                      </Button>
                      <div className="flex items-center gap-3 px-1">
                        <span className="h-px flex-1 bg-[var(--crm-border)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">or</span>
                        <span className="h-px flex-1 bg-[var(--crm-border)]" />
                      </div>
                      <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-sm text-red-600 dark:text-red-400 border-red-200/70 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/15 hover:text-red-700 bg-white dark:bg-slate-900 cursor-pointer" onClick={handleDeleteClick} disabled={isMeetingPast || (meeting.attendees?.length ?? 0) > 0}>
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

// ─── Meeting Card (Upcoming & History) ──────────────────────────────────────────

const getMeetingAccent = (meeting: Meeting, index: number = 0) => {
  const predefinedAccents = [
    { color: '#8B5CF6', bgLight: 'bg-purple-50/80 dark:bg-purple-950/30', textLight: 'text-purple-700 dark:text-purple-300', borderLight: 'border-purple-200/60 dark:border-purple-900/40', avatarBg: '#8B5CF6' },
    { color: '#0D9488', bgLight: 'bg-teal-50/80 dark:bg-teal-950/30', textLight: 'text-teal-700 dark:text-teal-300', borderLight: 'border-teal-200/60 dark:border-teal-900/40', avatarBg: '#0D9488' },
    { color: '#2563EB', bgLight: 'bg-blue-50/80 dark:bg-blue-950/30', textLight: 'text-blue-700 dark:text-blue-300', borderLight: 'border-blue-200/60 dark:border-blue-900/40', avatarBg: '#2563EB' },
    { color: '#EA580C', bgLight: 'bg-orange-50/80 dark:bg-orange-950/30', textLight: 'text-orange-700 dark:text-orange-300', borderLight: 'border-orange-200/60 dark:border-orange-900/40', avatarBg: '#EA580C' },
    { color: '#6366F1', bgLight: 'bg-indigo-50/80 dark:bg-indigo-950/30', textLight: 'text-indigo-700 dark:text-indigo-300', borderLight: 'border-indigo-200/60 dark:border-indigo-900/40', avatarBg: '#6366F1' },
    { color: '#059669', bgLight: 'bg-emerald-50/80 dark:bg-emerald-950/30', textLight: 'text-emerald-700 dark:text-emerald-300', borderLight: 'border-emerald-200/60 dark:border-emerald-900/40', avatarBg: '#059669' },
  ];

  const customColor = meeting.eventType?.color;
  if (customColor && !isBlackOrDark(customColor)) {
    return {
      color: customColor,
      bgLight: 'bg-blue-50/60 dark:bg-blue-950/30',
      textLight: 'text-blue-700 dark:text-blue-300',
      borderLight: 'border-blue-200/60 dark:border-blue-900/40',
      avatarBg: customColor,
    };
  }

  const idx = Math.abs((meeting.id || 0) + index) % predefinedAccents.length;
  return predefinedAccents[idx];
};

const getPlatformBadge = (meeting: Meeting) => {
  const link = meeting.meetingLink || '';
  const type = meeting.type;

  if (link.includes('zoom.us') || (type === 'video' && link.toLowerCase().includes('zoom'))) {
    return (
      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold uppercase tracking-wide">
        <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h7a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 16.5v-9zm12.94 2.35 3.56-2.37A1 1 0 0 1 22.5 8.3v7.4a1 1 0 0 1-1.5.83l-3.56-2.38v-4.3z" />
        </svg>
        <span>ZOOM</span>
      </div>
    );
  }

  if (link.includes('meet.google.com') || link.includes('google.com') || (type === 'video' && !link)) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold uppercase tracking-wide">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path d="M12 7v10l8.5 5V2L12 7z" fill="#00832d" />
          <path d="M0 5.5v13C0 20 1.5 21.5 3 21.5h9V2.5H3C1.5 2.5 0 4 0 5.5z" fill="#0066da" />
          <path d="M12 2.5H3C1.5 2.5 0 4 0 5.5L6 12l6-5.5V2.5z" fill="#e53935" />
          <path d="M0 18.5c0 1.5 1.5 3 3 3h9V12L6 12 0 18.5z" fill="#ffba00" />
        </svg>
        <span>GOOGLE MEET</span>
      </div>
    );
  }

  if (type === 'phone') {
    return (
      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wide">
        <Phone className="h-3.5 w-3.5 shrink-0" />
        <span>PHONE CALL</span>
      </div>
    );
  }

  if (type === 'in-person') {
    return (
      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-[11px] font-extrabold uppercase tracking-wide">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span>IN PERSON</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold uppercase tracking-wide">
      <Video className="h-3.5 w-3.5 shrink-0" />
      <span>VIDEO CALL</span>
    </div>
  );
};

const getStatusPill = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return (
        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50 font-bold text-xs px-3.5 py-1 rounded-full whitespace-nowrap">
          Confirmed
        </span>
      );
    case 'pending':
      return (
        <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50 font-bold text-xs px-3.5 py-1 rounded-full whitespace-nowrap">
          Pending
        </span>
      );
    case 'completed':
      return (
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs px-3.5 py-1 rounded-full whitespace-nowrap">
          Completed
        </span>
      );
    case 'rescheduled':
      return (
        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50 font-bold text-xs px-3.5 py-1 rounded-full whitespace-nowrap">
          Rescheduled
        </span>
      );
    case 'cancelled':
    case 'declined':
      return (
        <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/50 font-bold text-xs px-3.5 py-1 rounded-full whitespace-nowrap">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold text-xs px-3.5 py-1 rounded-full whitespace-nowrap capitalize">
          {status || 'Confirmed'}
        </span>
      );
  }
};

const getCategoryTag = (meeting: Meeting) => {
  const title = (meeting.eventType?.title || meeting.title || 'Meeting').toUpperCase();
  let tag = 'MEETING';
  if (title.includes('ONBOARDING')) tag = 'ONBOARDING';
  else if (title.includes('FOLLOW')) tag = 'FOLLOW-UP';
  else if (title.includes('REVIEW')) tag = 'MEETING';
  else if (title.includes('DEMO')) tag = 'DEMO';
  else if (title.includes('DISCOVERY')) tag = 'DISCOVERY';
  else if (title.includes('STRATEGY')) tag = 'STRATEGY';
  else if (meeting.eventType?.type === 'group') tag = 'GROUP';
  else if (meeting.eventType?.type === 'one_on_one') tag = '1-ON-1';
  else if (meeting.eventType?.title) tag = meeting.eventType.title.toUpperCase().slice(0, 12);

  return (
    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
      {tag}
    </span>
  );
};

const formatDateHeader = (dateStr: string) => {
  try {
    const targetDate = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const formattedDate = formatInTimeZone(targetDate, 'UTC', 'EEE, MMM d, yyyy').toUpperCase();
    if (diffDays === 0) return `TODAY • ${formattedDate}`;
    if (diffDays === 1) return `TOMORROW • ${formattedDate}`;
    if (diffDays === -1) return `YESTERDAY • ${formattedDate}`;
    return formattedDate;
  } catch {
    return dateStr.toUpperCase();
  }
};

function MeetingCard({
  meeting,
  team,
  onSelect,
  onUpdate,
  readOnly = false,
  index = 0,
}: {
  meeting: Meeting;
  team: TeamMember[];
  onSelect: (m: Meeting) => void;
  onUpdate?: (m: Meeting) => Promise<void>;
  readOnly?: boolean;
  index?: number;
}) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const accent = getMeetingAccent(meeting, index);
  const [isUpdatingHost, setIsUpdatingHost] = useState(false);
  const hostColor = meeting.agent ? getAgentColor(meeting.agent.id) : getAgentColor(meeting.assignedTo?.id);
  const initials = (name?: string | null) =>
    (name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');

  const durationText = (meeting.duration || '30 min')
    .replace('minutes', 'min')
    .replace('minute', 'min');

  return (
    <div
      onClick={() => onSelect(meeting)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#10182D] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden gap-2.5 sm:gap-4 shadow-2xs"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 sm:w-1.5 rounded-r-full"
        style={{ backgroundColor: accent.color }}
      />

      {/* Left Group: Info */}
      <div className="flex items-start gap-2.5 sm:gap-3.5 flex-1 min-w-0 pl-1.5 sm:pl-2">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h4 className="font-bold text-[13px] sm:text-[15px] text-slate-900 dark:text-white truncate">
              {meeting.title}
            </h4>
            {getCategoryTag(meeting)}
          </div>
          
          <div className="flex items-center">
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-bold tracking-wide', accent.bgLight, accent.borderLight, accent.textLight)}>
              <Clock className="h-3 w-3" />
              {meeting.time || '10:00 AM'} • {durationText}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
            {meeting.lead?.email && (
              <span className="truncate max-w-[200px] sm:max-w-[260px]">
                {meeting.lead.email}
              </span>
            )}
            {meeting.lead?.phone && (
              <span className="flex items-center gap-1 shrink-0">
                <Phone className="h-3 w-3 text-slate-400" />
                {meeting.lead.phone}
              </span>
            )}

            {/* Host Assignment Dropdown / Pill */}
            {readOnly ? (
              <div
                className="inline-flex items-center gap-1.5 py-0.5 px-2 sm:px-2.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-2xs"
                style={{
                  backgroundColor: meeting.agent ? (isDark ? hostColor.bgDark : hostColor.bg) : (isDark ? '#334155' : '#e2e8f0'),
                  color: meeting.agent ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  border: `1px solid ${meeting.agent ? (isDark ? hostColor.borderDark : hostColor.border) : (isDark ? '#475569' : '#cbd5e1')}`,
                }}
              >
                <Users className="h-3 w-3 text-white opacity-85 shrink-0" />
                <span className="truncate max-w-[120px] text-white">Host: {meeting.agent?.name || 'Unassigned'}</span>
              </div>
            ) : (
              <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center">
                <Select
                  value={meeting.agent ? team.find((t) => t.id === meeting.agent?.id)?.email : undefined}
                  onValueChange={async (v) => {
                    const newHost = team.find((t) => t.email === v);
                    if (!newHost || newHost.id === meeting.agent?.id) return;
                    setIsUpdatingHost(true);
                    try {
                      if (onUpdate) {
                        await onUpdate({
                          ...meeting,
                          assignedTo: newHost,
                          agent: { id: newHost.id, name: newHost.name },
                        });
                      }
                    } finally {
                      setIsUpdatingHost(false);
                    }
                  }}
                  disabled={isUpdatingHost}
                >
                  <SelectTrigger
                    className="h-6 py-0 px-2 sm:h-6.5 sm:px-2.5 rounded-md focus:ring-0 shadow-2xs text-[9px] sm:text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5 w-auto hover:brightness-105 transition-all outline-none"
                    style={{
                      backgroundColor: meeting.agent ? (isDark ? hostColor.bgDark : hostColor.bg) : (isDark ? '#334155' : '#e2e8f0'),
                      color: meeting.agent ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                      border: `1px solid ${meeting.agent ? (isDark ? hostColor.borderDark : hostColor.border) : (isDark ? '#475569' : '#cbd5e1')}`,
                    }}
                  >
                    {isUpdatingHost ? (
                      <Loader2 className="h-3 w-3 animate-spin text-white opacity-85 shrink-0" />
                    ) : (
                      <Users className="h-3 w-3 text-white opacity-85 shrink-0" />
                    )}
                    <span className="truncate max-w-[120px] text-white">
                      Host: {meeting.agent?.name || 'Unassigned'}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 z-[200]" position="popper">
                    {team
                      .filter((m) => !m.status || m.status.toLowerCase() !== 'invited')
                      .map((m) => (
                        <SelectItem key={m.id} value={m.email} className="rounded-lg py-1.5 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                              style={{ backgroundColor: getAgentColor(m.id).bg }}
                            >
                              {initials(m.name)}
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {m.name || m.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Group: Status + Actions */}
      <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80">

        {/* Status Pill */}
        <div className="shrink-0">
          {getStatusPill(meeting.status)}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Call Action */}
          {meeting.lead?.phone ? (
            <a
              href={toTelHref(meeting.lead.phone)}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              title={`Call ${meeting.lead.name}`}
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          ) : null}

          {/* WhatsApp Action */}
          {meeting.lead?.phone ? (
            <a
              href={`https://wa.me/${toWhatsAppPhone(meeting.lead.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              title={`WhatsApp ${meeting.lead.name}`}
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          ) : null}

          {/* Calendar / Detail View Action */}
          <Button variant="outline" size="icon"
            onClick={() => onSelect(meeting)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95 p-0"
            title="View Details & Reschedule"
          >
            <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95 p-0"
                title="More Actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[200]">
              <DropdownMenuItem onClick={() => onSelect(meeting)} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-slate-500" /> View Details
              </DropdownMenuItem>
              {meeting.meetingLink && (
                <DropdownMenuItem onClick={() => window.open(meeting.meetingLink, '_blank')} className="cursor-pointer">
                  <Video className="h-4 w-4 mr-2 text-blue-500" /> Join Meeting
                </DropdownMenuItem>
              )}
              {meeting.lead?.phone && (
                <DropdownMenuItem onClick={() => window.open(toTelHref(meeting.lead.phone))} className="cursor-pointer">
                  <Phone className="h-4 w-4 mr-2 text-emerald-500" /> Call Lead
                </DropdownMenuItem>
              )}
              {meeting.lead?.email && (
                <DropdownMenuItem onClick={() => window.open(`mailto:${meeting.lead.email}`)} className="cursor-pointer">
                  <Mail className="h-4 w-4 mr-2 text-indigo-500" /> Send Email
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


// ─── Infinite Scroll Hook ─────────────────────────────────────────────────────

function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean, debugName: string) {
  const observer = useRef<IntersectionObserver | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  return useCallback((node: HTMLDivElement | null) => {
    if (observer.current) {
      observer.current.disconnect()
    }

    if (node && hasMore) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onLoadMoreRef.current()
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      )
      observer.current.observe(node)
    }
  }, [hasMore])
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
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'event-types'>('upcoming')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'upcoming' || tab === 'history' || tab === 'event-types') {
        setActiveTab(tab)
      }
    }
  }, [])
  // Raw booking rows from the API, deduped by id. Meetings shown in the UI are
  // derived from these (grouped + mapped) so that pagination overlaps and group
  // events split across page boundaries can never render the same meeting twice.
  const [rawBookings, setRawBookings] = useState<{ upcoming: any[]; history: any[] }>({ upcoming: [], history: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState({ upcoming: false, history: false })
  // Synchronous in-flight guard: IntersectionObserver can fire again before the
  // isFetchingMore state update is committed, which double-fetched the same page.
  const fetchingRef = useRef({ upcoming: false, history: false })
  const lastFetchedRef = useRef<{ upcoming: string | null; history: string | null }>({ upcoming: null, history: null })

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
  const [historyMonthFilter, setHistoryMonthFilter] = useState('all')

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
      const response = await getBookings({ 
        type: 'upcoming', 
        page: nextPage, 
        per_page: 15, 
        search: debouncedSearch,
        status: statusFilter !== 'all' ? statusFilter : undefined 
      })
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
  }, [pagination.upcoming, debouncedSearch, statusFilter])

  const loadMoreHistory = useCallback(async () => {
    if (fetchingRef.current.history || !pagination.history.hasMore) {
      return
    }

    try {
      fetchingRef.current.history = true
      setIsFetchingMore(prev => ({ ...prev, history: true }))
      const nextPage = pagination.history.page + 1
      const response = await getBookings({ 
        type: 'history', 
        page: nextPage, 
        per_page: 15, 
        search: debouncedSearch,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        month: historyMonthFilter !== 'all' ? historyMonthFilter : undefined
      })

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
  }, [pagination.history, debouncedSearch, statusFilter, historyMonthFilter])

  const upcomingSentinel = useInfiniteScroll(loadMoreUpcoming, pagination.upcoming.hasMore, 'Upcoming')
  const historySentinel = useInfiniteScroll(loadMoreHistory, pagination.history.hasMore, 'History')

  useEffect(() => {
    // When search query or filters change, clear both cache and raw data so switching tabs fetches fresh results
    lastFetchedRef.current = { upcoming: null, history: null }
    setRawBookings({ upcoming: [], history: [] })
    setPagination({
      upcoming: { page: 1, hasMore: true, total: 0 },
      history: { page: 1, hasMore: true, total: 0 }
    })
  }, [debouncedSearch, statusFilter, historyMonthFilter])

  useEffect(() => {
    if (activeTab === 'event-types') return

    const fetchTabInitialData = async () => {
      const tab = activeTab
      
      const cacheKey = `${debouncedSearch}|${statusFilter}|${tab === 'history' ? historyMonthFilter : ''}`
      // If we already loaded this exact tab and search query, don't refetch initial page
      if (lastFetchedRef.current[tab] !== null && lastFetchedRef.current[tab] === cacheKey) return

      try {
        setIsLoading(true)
        const res = await getBookings({ 
          type: tab, 
          page: 1, 
          per_page: 15, 
          search: debouncedSearch,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          month: tab === 'history' && historyMonthFilter !== 'all' ? historyMonthFilter : undefined 
        })
        const body = res.data
        const data = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])

        setRawBookings(prev => ({ ...prev, [tab]: data }))
        setPagination(prev => ({
          ...prev,
          [tab]: { page: 1, hasMore: data.length >= 15, total: body?.total || data.length }
        }))
        lastFetchedRef.current[tab] = cacheKey
      } catch (err) {
        console.error(`[MeetingsPage] Error fetching initial ${tab} meetings:`, err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTabInitialData()
  }, [activeTab, debouncedSearch, statusFilter, historyMonthFilter])

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
      const response = await deleteBooking(id)
      const freshBooking = response.data.booking

      // Cancelling marks the booking's status rather than deleting the row, so patch
      // it in place (same pattern as update/reschedule) instead of removing it from
      // the list — it should keep showing up with its "Cancelled" badge.
      const patchRaw = (rows: any[]) => rows.map(b => b.id === id ? { ...b, ...freshBooking } : b)
      setRawBookings(prev => ({
        upcoming: patchRaw(prev.upcoming),
        history: patchRaw(prev.history),
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

  const filteredUpcoming = meetings.upcoming

  const historyMonthOptions = useMemo(() => {
    const options: string[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push(format(d, 'yyyy-MM'))
    }
    return options
  }, [])

  const filteredHistory = meetings.history

  const historyGroups = useMemo(() => {
    const sorted = [...filteredHistory].sort((a, b) =>
      new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime()
    )
    const groups: { key: string; label: string; meetings: Meeting[] }[] = []
    sorted.forEach(m => {
      let key = 'unknown'
      let label = 'Unknown date'
      if (m.start_time) {
        const d = new Date(m.start_time)
        if (!isNaN(d.getTime())) {
          key = formatInTimeZone(d, 'UTC', 'yyyy-MM')
          label = formatInTimeZone(d, 'UTC', 'MMMM yyyy')
        }
      }
      let group = groups.find(g => g.key === key)
      if (!group) { group = { key, label, meetings: [] }; groups.push(group) }
      group.meetings.push(m)
    })
    return groups
  }, [filteredHistory])

  const exportHistoryCsv = () => {
    const headers = ['Meeting', 'Attendee', 'Attendee Email', 'Attendee Phone', 'Date', 'Time', 'Type', 'Status', 'Outcome']
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`
    const rows = filteredHistory.map(m => [
      m.title, m.lead?.name, m.lead?.email, m.lead?.phone, m.date, m.time,
      meetingTypeConfig[m.type]?.label ?? m.type, statusConfig[m.status]?.label ?? m.status, m.outcome || '',
    ].map(escape).join(','))
    const csvContent = [headers.map(escape).join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `past-meetings-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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
          {/* Header: Search (hidden on the Event types tab — it has its own search) */}
          {activeTab !== 'event-types' && (
            <div className="flex items-center gap-2 pt-1 pl-1 pb-3 sm:pb-4">
              <div className="relative w-full sm:w-[320px] md:w-[400px]">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search by name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 text-[14px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {/* KPI Row — meeting-specific, so hidden on the Event types tab */}
          {activeTab === 'upcoming' && (
            <div className="flex overflow-x-auto gap-2 sm:gap-3 shrink-0 pb-3 border-b border-slate-200 dark:border-slate-800 custom-scrollbar mb-2 px-1">
              {[
                { label: 'Upcoming', value: totalUpcoming, color: 'text-[#FE4548]' },
                { label: 'Confirmed', value: totalConfirmed, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Completed', value: totalCompleted, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Total', value: totalUpcoming + totalHistory, color: 'text-purple-600 dark:text-purple-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between sm:justify-start sm:gap-3 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs min-w-[110px]">
                  <span className="font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                  <span className={cn("font-bold font-heading text-sm tabular-nums", color)}>
                    {isLoading ? <Skeleton className="h-4 w-6 bg-slate-200 dark:bg-slate-800 inline-block" /> : value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative font-sans">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-transparent">
              <div className="overflow-x-auto custom-scrollbar">
                <TabsList className="h-11 bg-transparent p-0 gap-2 sm:gap-4 w-max px-1">
                  <TabsTrigger value="upcoming" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#FE4548] data-[state=active]:text-[#FE4548] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-2 text-xs sm:text-sm font-semibold font-heading whitespace-nowrap">
                    <span className="hidden sm:inline">Upcoming Meetings</span>
                    <span className="sm:hidden">Upcoming</span>
                    {totalUpcoming > 0 && (
                      <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-[#FE4548] text-white border-transparent rounded-full font-semibold">
                        {totalUpcoming}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#FE4548] data-[state=active]:text-[#FE4548] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-2 text-xs sm:text-sm font-semibold font-heading whitespace-nowrap">
                    <span className="hidden sm:inline">Past Meetings</span>
                    <span className="sm:hidden">Past</span>
                  </TabsTrigger>
                  <TabsTrigger value="event-types" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#FE4548] data-[state=active]:text-[#FE4548] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-2 text-xs sm:text-sm font-semibold font-heading whitespace-nowrap">
                    Booking Links
                  </TabsTrigger>
                </TabsList>
              </div>
              {activeTab !== 'event-types' && (
                <div className="py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar px-1 pb-2 sm:pb-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[110px] sm:w-[140px] border-slate-200 bg-white text-slate-800 font-medium text-xs rounded-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  {activeTab === 'history' && (
                    <>
                      <Select value={historyMonthFilter} onValueChange={setHistoryMonthFilter}>
                        <SelectTrigger className="h-8 w-[110px] sm:w-[150px] border-slate-300 bg-white text-slate-800 font-extrabold text-[12px] rounded-[6px] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                          <SelectItem value="all">All Months</SelectItem>
                          {historyMonthOptions.map(key => (
                            <SelectItem key={key} value={key}>{format(new Date(`${key}-01T00:00:00`), 'MMMM yyyy')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm"
                        onClick={exportHistoryCsv}
                        disabled={filteredHistory.length === 0}
                        className="h-8 px-3 gap-1.5 flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 text-[12px] font-extrabold rounded-[6px] border border-slate-300 dark:border-slate-650 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Download className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    </>
                  )}
                </div>
              )}
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
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Meetings booked via your booking links will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupMeetingsByDate(filteredUpcoming)).map(([date, dayMeetings]) => (
                      <div key={date}>
                        <div className="flex items-center justify-between gap-3 mb-3.5 mt-2">
                          <span className="bg-[#EBF3FF] dark:bg-blue-950/40 text-[#1877F2] dark:text-blue-400 font-bold px-3.5 py-1 rounded-full text-[11px] tracking-wider uppercase border border-blue-100 dark:border-blue-900/40 shadow-2xs">
                            {formatDateHeader(date)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {dayMeetings.length} {dayMeetings.length === 1 ? 'meeting' : 'meetings'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {dayMeetings.map((m, idx) => (
                            <MeetingCard
                              key={m.id}
                              meeting={m}
                              team={team}
                              onSelect={openMeeting}
                              onUpdate={handleMeetingUpdate}
                              index={idx}
                            />
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
              <div className="flex-1 overflow-auto px-2 py-3 sm:p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {isLoading ? (
                  <div className="space-y-4">
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
                  <div className="space-y-6">
                    {Object.entries(groupMeetingsByDate(filteredHistory, true)).map(([date, dayMeetings]) => (
                      <div key={date}>
                        <div className="flex items-center justify-between gap-3 mb-3.5 mt-2">
                          <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold px-3.5 py-1 rounded-full text-[11px] tracking-wider uppercase border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                            {formatDateHeader(date)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {dayMeetings.length} {dayMeetings.length === 1 ? 'meeting' : 'meetings'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {dayMeetings.map((m, idx) => (
                            <MeetingCard
                              key={m.id}
                              meeting={m}
                              team={team}
                              onSelect={openMeeting}
                              readOnly={true}
                              index={idx}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Scroll sentinel */}
                    <div ref={historySentinel} className="py-8 flex flex-col items-center justify-center gap-3">
                      {pagination.history.hasMore && (
                        <>
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          <p className="text-xs text-slate-500 font-medium">Loading history...</p>
                        </>
                      )}
                      {!pagination.history.hasMore && totalHistory > 0 && (
                        <p className="text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full">You've reached the end of the list</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Event types Tab ── */}
            <TabsContent value="event-types" className="flex-1 data-[state=active]:flex flex-col min-h-0 m-0 mt-0 overflow-hidden outline-none">
              <EventTypesTab />
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
