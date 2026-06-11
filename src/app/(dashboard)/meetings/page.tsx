'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
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
  FileText, Edit, Save, X, Users, CheckCircle2,
  CalendarCheck, CircleDot, ExternalLink, Settings2,
  ChevronRight, Mail, Building2, AlignLeft, Loader2,
  Trash2, CalendarRange,
} from 'lucide-react'
import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { format } from 'date-fns'
import { getBookings, deleteBooking, rescheduleBooking, updateBooking, teamApi } from '@/lib/api'
import { toast } from 'sonner'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Mock team members removed - using real team data from API

const meetingTypeConfig = {
  video: { icon: Video, label: 'Video Call', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  phone: { icon: Phone, label: 'Phone Call', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'in-person': { icon: MapPin, label: 'In Person', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' },
  completed: { label: 'Completed', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400' },
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

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

function MeetingDetailDialog({
  meeting, open, onOpenChange, onUpdate, onDelete, onReschedule, team = []
}: {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onUpdate?: (m: Meeting) => void
  onDelete?: (id: number) => void
  onReschedule?: (id: number, date: string, time: string) => void
  team: TeamMember[]
}) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const [isEditing, setIsEditing] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [notes, setNotes] = useState(meeting?.notes ?? '')
  const [outcome, setOutcome] = useState(meeting?.outcome ?? '')
  const [assignedTo, setAssignedTo] = useState<TeamMember | null>(meeting?.assignedTo || null)

  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newTime, setNewTime] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Sync state when meeting changes
  const resetReschedule = () => {
    if (meeting?.start_time) {
      const date = new Date(meeting.start_time)
      setNewDate(date)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      setNewTime(`${hours}:${minutes}`)
    }
  }

  React.useEffect(() => {
    if (meeting) {
      setNotes(meeting.notes ?? '')
      setOutcome(meeting.outcome ?? '')
      setAssignedTo(meeting.assignedTo)
      setIsEditing(false)
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

  const handleSave = () => {
    if (!meeting) return
    onUpdate?.({ ...meeting, notes, outcome, assignedTo: assignedTo as TeamMember })
    setIsEditing(false)
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 [&>button]:text-white/90 [&>button]:hover:text-white [&>button]:bg-black/25 [&>button]:hover:bg-black/40 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:transition-all [&>button]:duration-200 [&>button]:right-5 [&>button]:top-5 [&>button]:focus:ring-white/20 [&>button]:focus:ring-offset-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-bold text-white break-words">{meeting.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white shrink-0')}>
                  <TypeIcon className="h-3.5 w-3.5" />
                  {typeInfo.label}
                </span>
                <span className="text-xs text-white/70">{meeting.date} · {meeting.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={cn('text-xs font-semibold border', statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto border-b border-slate-100 dark:border-slate-800">

          {/* Lead Info */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials(meeting.lead.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">{meeting.lead.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{meeting.lead.profession} {meeting.lead.company ? `· ${meeting.lead.company}` : ''}</p>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mt-2">
                {meeting.lead.email && (
                  <a href={`mailto:${meeting.lead.email}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    <Mail className="h-3 w-3" />{meeting.lead.email}
                  </a>
                )}
                {meeting.lead.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3 w-3" />
                    <span>{meeting.lead.phone}</span>
                    <a
                      href={`tel:${meeting.lead.phone}`}
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors shadow-sm ml-1"
                      title={`Call ${meeting.lead.name}`}
                    >
                      <Phone className="h-2.5 w-2.5" />
                    </a>
                    <a
                      href={`https://wa.me/${meeting.lead.phone.replace(/\D/g, '').length === 10 ? '91' + meeting.lead.phone.replace(/\D/g, '') : meeting.lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors shadow-sm"
                      title={`WhatsApp ${meeting.lead.name}`}
                    >
                      <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </div>
                )}
                {meeting.lead.state && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />{meeting.lead.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meeting details row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <CalendarDays className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-slate-500">Date</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{meeting.date}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <Clock className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-slate-500">Time</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{meeting.time}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <CircleDot className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-slate-500">Duration</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{meeting.duration}</p>
            </div>
          </div>

          {/* Meeting link */}
          {meeting.meetingLink && (
            <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-600 font-medium hover:bg-indigo-100 transition-colors w-fit">
              <ExternalLink className="h-4 w-4" />
              Join Meeting
            </a>
          )}

          {/* Assigned Rep */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Assigned To</p>
              {onUpdate && (
                <button onClick={() => setIsEditing(e => !e)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  {isEditing ? <Save className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
                  {isEditing ? 'Save' : 'Change'}
                </button>
              )}
            </div>
            {isEditing ? (
              <Select value={assignedTo?.email || ''} onValueChange={(v) => {
                const m = team.find(t => t.email === v)
                if (m) setAssignedTo(m)
              }}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Host" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  {team.filter(m => m.status === 'Active').map(m => (
                    <SelectItem key={m.id} value={m.email} className="rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                          style={{ backgroundColor: getAgentColor(m.id).bg }}
                        >
                          {initials(m.name)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{m.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium italic">{m.role}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md ring-2 ring-white dark:ring-slate-900"
                    style={{ 
                      backgroundColor: assignedTo && assignedTo.id !== 0 
                        ? getAgentColor(assignedTo.id).bg 
                        : '#94a3b8' 
                    }}
                  >
                    {assignedTo ? initials(assignedTo.name) : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {assignedTo && assignedTo.id !== 0 ? assignedTo.name : 'Not Assigned'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">
                      {assignedTo && assignedTo.id !== 0 ? assignedTo.role : 'Waiting for host'}
                    </p>
                  </div>
                </div>
                {assignedTo && assignedTo.id !== 0 && (
                   <Badge 
                    variant="outline" 
                    className="text-[10px] font-bold uppercase tracking-tighter"
                    style={{
                      backgroundColor: isDark ? getAgentColor(assignedTo.id).bgDark : getAgentColor(assignedTo.id).bg,
                      color: isDark ? getAgentColor(assignedTo.id).textDark : getAgentColor(assignedTo.id).text,
                      borderColor: isDark ? getAgentColor(assignedTo.id).borderDark : getAgentColor(assignedTo.id).border,
                    }}
                   >
                    Active Host
                   </Badge>
                )}
              </div>
            )}
          </div>

          {/* Questionnaire */}
          {meeting.questionnaire && meeting.questionnaire.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Questionnaire</p>
              <div className="space-y-2">
                {meeting.questionnaire.map((qa, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{qa.question}</p>
                    <p className="text-sm text-slate-800 dark:text-white mt-0.5">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Notes</p>
              {!isEditing && onUpdate && (
                <button onClick={() => setIsEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <Edit className="h-3 w-3" />Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add meeting notes..." className="min-h-[80px] text-sm" />
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                {notes || 'No notes added'}
              </p>
            )}
          </div>

          {/* Outcome */}
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Outcome</p>
            {isEditing ? (
              <Textarea value={outcome} onChange={e => setOutcome(e.target.value)}
                placeholder="Add meeting outcome..." className="min-h-[60px] text-sm" />
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                {outcome || 'No outcome recorded'}
              </p>
            )}
          </div>

          {/* Save button moved inside footer */}
          {/* Notes and Outcome stay in scrollable body */}
        </div>

        {/* Footer (Sticky) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          {isEditing && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1.5" />Save Changes
              </Button>
            </div>
          )}

          {/* Reschedule UI */}
          {isRescheduling && (
            <div className="bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-800/50 rounded-xl p-4 shadow-sm space-y-4 ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3 mb-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-violet-500" />
                  Reschedule Appointment
                </p>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800">
                  New Slot
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-0.5">Pick Date</label>
                  <Popover modal={true} open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs h-10 border-slate-200 dark:border-slate-700 px-3 bg-slate-50/50 dark:bg-slate-800/50">
                        <CalendarDays className="h-4 w-4 mr-2.5 text-slate-400" />
                        {newDate ? format(newDate, 'PPP') : 'Select Date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[70] shadow-2xl border-slate-200 dark:border-slate-700" align="start" side="top" sideOffset={12}>
                      <Calendar
                        mode="single"
                        selected={newDate}
                        onSelect={(date) => {
                          setNewDate(date)
                          setPopoverOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-0.5">Select Time</label>
                  <div className="relative">
                    <Input 
                      type="time" 
                      value={newTime} 
                      onChange={e => setNewTime(e.target.value)}
                      className="h-10 text-xs border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-violet-500/20" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-4 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" 
                  onClick={() => {
                    resetReschedule()
                    setIsRescheduling(false)
                  }} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="h-9 bg-violet-600 hover:bg-violet-700 text-white px-5 shadow-lg shadow-violet-500/20 font-semibold" 
                  onClick={handleRescheduleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CalendarCheck className="h-4 w-4 mr-2" />
                  )}
                  Confirm New Time
                </Button>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          {!isEditing && !isRescheduling && !isDeleting && (
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Meeting
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8"
                onClick={() => setIsRescheduling(true)}
                disabled={isSubmitting}
              >
                <CalendarRange className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </div>
          )}

          {/* Delete confirmation UI */}
          {isDeleting && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-950 dark:text-red-100">Cancel Meeting?</h4>
                  <p className="text-xs text-red-700/80 dark:text-red-300/60 mt-0.5">This action cannot be undone. Are you sure you want to cancel this appointment?</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs font-semibold text-red-800 dark:text-red-200 hover:bg-red-200/50 dark:hover:bg-red-900/30"
                  onClick={() => setIsDeleting(false)}
                  disabled={isSubmitting}
                >
                  No, Keep It
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 text-xs font-bold px-4"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                  Yes, Cancel Meeting
                </Button>
              </div>
            </div>
          )}
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
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:border-[var(--crm-primary)] hover:shadow-sm transition-all duration-200 cursor-pointer"
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials(meeting.lead.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[var(--crm-text-primary)] truncate">{meeting.title}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-[var(--crm-text-secondary)]">
              <Clock className="h-3 w-3" />{meeting.time} · {meeting.duration}
            </span>
            {meeting.lead.company && (
              <span className="flex items-center gap-1 text-xs text-[var(--crm-text-secondary)]">
                <Building2 className="h-3 w-3" />{meeting.lead.company}
              </span>
            )}
            {meeting.agent && (
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-300"
                title={`Meeting Host: ${meeting.agent.name}`}
                style={{
                  backgroundColor: isDark 
                    ? getAgentColor(meeting.agent.id).bgDark 
                    : getAgentColor(meeting.agent.id).bg,
                  color: isDark 
                    ? getAgentColor(meeting.agent.id).textDark 
                    : getAgentColor(meeting.agent.id).text,
                  borderColor: isDark 
                    ? getAgentColor(meeting.agent.id).borderDark 
                    : getAgentColor(meeting.agent.id).border,
                }}
              >
                <Users className="h-2.5 w-2.5 opacity-70" />
                <span>Host: {meeting.agent.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Badges & Call / WhatsApp Quick Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t border-[var(--crm-border)] sm:border-t-0 mt-1 sm:mt-0">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm', typeInfo.bg, typeInfo.color, 'border-current/10')}>
            <TypeIcon className="h-3 w-3" />
            <span className="text-[10px]">{typeInfo.label}</span>
          </div>

          {/* Status */}
          <Badge variant="outline" className={cn('text-xs font-semibold border shrink-0', statusInfo.className)}>
            {statusInfo.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Call & WhatsApp Quick Actions */}
          {meeting.lead.phone && (
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <a
                href={`tel:${meeting.lead.phone}`}
                className="flex items-center justify-center h-8 w-8 rounded-full border border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 transition-all duration-200 shadow-sm"
                title={`Call ${meeting.lead.name}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://wa.me/${meeting.lead.phone.replace(/\D/g, '').length === 10 ? '91' + meeting.lead.phone.replace(/\D/g, '') : meeting.lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-full border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 transition-all duration-200 shadow-sm"
                title={`WhatsApp ${meeting.lead.name}`}
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          )}

          {/* Chevron */}
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
      console.log(`[InfiniteScroll] Attaching observer for ${debugName}`)
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log(`[InfiniteScroll] ${debugName} sentinel intersected! Triggering load...`)
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

const mapBooking = (booking: any, defaultStatus: string): Meeting => {
  const getAnswer = (key: string) => {
    if (Array.isArray(booking.answers)) {
      return booking.answers.find((a: any) => a.question?.toUpperCase() === key.toUpperCase())?.answer
    }
    if (typeof booking.answers === 'object' && booking.answers !== null) {
      // Try q-key, then key, then case-insensitive match
      const k = key.toLowerCase()
      return booking.answers[`q-${k}`] || booking.answers[k] || booking.answers[key] || 
             Object.entries(booking.answers).find(([ak]) => ak.toLowerCase().includes(k))?.[1]
    }
    return null
  }

  const name = booking.lead?.name || getAnswer('NAME') || getAnswer('name') || 'Guest'
  const email = booking.lead?.email || getAnswer('EMAIL') || getAnswer('email') || ''
  const phone = booking.lead?.phone || getAnswer('phone') || getAnswer('MOBILE NUMBER') || ''
  const startTime = new Date(booking.start_time)

  return {
    id: booking.id,
    title: `Meeting with ${name}`,
    date: formatInTimeZone(startTime, 'UTC', 'EEEE, MMMM d, yyyy'),
    time: formatInTimeZone(startTime, 'UTC', 'h:mm a'),
    duration: `${booking.eventType?.duration || 30} minutes`,
    type: (booking.eventType?.location as Meeting['type']) || 'video',
    status: (booking.status || defaultStatus) as Meeting['status'],
    lead: {
      name, email, phone, profession: '', company: booking.lead?.company || '',
      state: '', requirements: '', avatar: '',
    },
    assignedTo: { 
      id: booking.user_id || 0, 
      name: booking.user?.name || 'Host', 
      email: booking.user?.email || '', 
      role: 'Host', 
      avatar: '',
      status: booking.user?.status || 'Active'
    },
    agent: booking.user ? {
      id: booking.user.id,
      name: booking.user.name
    } : undefined,
    meetingLink: booking.meeting_link || '',
    source: booking.lead?.source || 'Website',
    questionnaire: Array.isArray(booking.answers) 
      ? booking.answers.map((a: any) => ({ question: a.question, answer: a.answer }))
      : typeof booking.answers === 'object' && booking.answers !== null
        ? Object.entries(booking.answers).map(([k, v]) => ({ 
            question: k.replace(/^q-/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), 
            answer: String(v) 
          }))
        : [],
    start_time: booking.start_time,
    timezone: booking.timezone || 'UTC',
    event_type_id: booking.event_type_id,
    duration_minutes: booking.eventType?.duration || 30
  }
}

export default function MeetingsPage() {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'history'>('upcoming')
  const [meetings, setMeetings] = useState<{ upcoming: Meeting[]; history: Meeting[] }>({ upcoming: [], history: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState({ upcoming: false, history: false })
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [pagination, setPagination] = useState({
    upcoming: { page: 1, hasMore: true },
    history: { page: 1, hasMore: true }
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
    if (isFetchingMore.upcoming || !pagination.upcoming.hasMore) return

    try {
      setIsFetchingMore(prev => ({ ...prev, upcoming: true }))
      const nextPage = pagination.upcoming.page + 1
      const response = await getBookings({ type: 'upcoming', page: nextPage, per_page: 15 })
      const body = response.data
      const data = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])

      if (data.length > 0) {
        const mapped = data.map((b: any) => mapBooking(b, 'confirmed'))
        setMeetings(prev => ({ ...prev, upcoming: [...prev.upcoming, ...mapped] }))
        setPagination(prev => ({ ...prev, upcoming: { page: nextPage, hasMore: data.length >= 15 } }))
      } else {
        setPagination(prev => ({ ...prev, upcoming: { ...prev.upcoming, hasMore: false } }))
      }
    } catch (err) {
      console.error('Error loading more upcoming:', err)
    } finally {
      setIsFetchingMore(prev => ({ ...prev, upcoming: false }))
    }
  }, [pagination.upcoming, isFetchingMore.upcoming])

  const loadMoreHistory = useCallback(async () => {
    if (isFetchingMore.history || !pagination.history.hasMore) {
      console.log('[MeetingsPage] Skipping loadMoreHistory:', { isFetching: isFetchingMore.history, hasMore: pagination.history.hasMore })
      return
    }

    try {
      console.log(`[MeetingsPage] Loading more history... Page: ${pagination.history.page + 1}`)
      setIsFetchingMore(prev => ({ ...prev, history: true }))
      const nextPage = pagination.history.page + 1
      const response = await getBookings({ type: 'history', page: nextPage, per_page: 15 })

      const body = response.data
      const data = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])
      console.log(`[MeetingsPage] Loaded ${data.length} more history items.`)

      if (data.length > 0) {
        const mapped = data.map((b: any) => mapBooking(b, 'completed'))
        setMeetings(prev => ({ ...prev, history: [...prev.history, ...mapped] }))
        setPagination(prev => ({ ...prev, history: { page: nextPage, hasMore: data.length >= 15 } }))
      } else {
        setPagination(prev => ({ ...prev, history: { ...prev.history, hasMore: false } }))
      }
    } catch (err) {
      console.error('[MeetingsPage] Error loading more history:', err)
    } finally {
      setIsFetchingMore(prev => ({ ...prev, history: false }))
    }
  }, [pagination.history, isFetchingMore.history])

  const upcomingSentinel = useInfiniteScroll(loadMoreUpcoming, pagination.upcoming.hasMore, 'Upcoming')
  const historySentinel = useInfiniteScroll(loadMoreHistory, pagination.history.hasMore, 'History')

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('[MeetingsPage] Fetching initial data...')
        setIsLoading(true)
        const [upRes, histRes] = await Promise.all([
          getBookings({ type: 'upcoming', page: 1, per_page: 15 }),
          getBookings({ type: 'history', page: 1, per_page: 15 })
        ])

        const extractData = (res: any) => {
          const body = res.data
          return Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])
        }

        const upData = extractData(upRes)
        const histData = extractData(histRes)

        console.log('[MeetingsPage] Initial loaded history count:', histData.length)

        setMeetings({
          upcoming: upData.map((b: any) => mapBooking(b, 'confirmed')),
          history: histData.map((b: any) => mapBooking(b, 'completed'))
        })

        setPagination({
          upcoming: { page: 1, hasMore: upData.length >= 15 },
          history: { page: 1, hasMore: histData.length >= 15 }
        })
      } catch (err) {
        console.error('[MeetingsPage] Error fetching initial meetings:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const handleMeetingUpdate = async (updated: Meeting) => {
    try {
      // Extract the fields we want to update
      const updateData = {
        user_id: updated.assignedTo.id,
        notes: updated.notes,
        outcome: updated.outcome
      };
      
      const response = await updateBooking(updated.id, updateData);
      const freshlyMapped = mapBooking(response.data.booking, updated.status);

      setMeetings(prev => ({
        upcoming: prev.upcoming.map(m => m.id === freshlyMapped.id ? freshlyMapped : m),
        history: prev.history.map(m => m.id === freshlyMapped.id ? freshlyMapped : m),
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
      setMeetings(prev => ({
        upcoming: prev.upcoming.filter(m => m.id !== id),
        history: prev.history.filter(m => m.id !== id),
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
      const updated = mapBooking(response.data.booking, 'confirmed')
      
      setMeetings(prev => ({
        upcoming: prev.upcoming.map(m => m.id === id ? updated : m),
        history: prev.history.map(m => m.id === id ? updated : m),
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

  // Stats
  const totalUpcoming = meetings.upcoming.length
  const totalHistory = meetings.history.length
  const totalConfirmed = meetings.upcoming.filter(m => m.status === 'confirmed').length
  const totalCompleted = meetings.history.filter(m => m.status === 'completed').length

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin', 'Manager', 'Agent']}>
      <div className="flex flex-col h-full bg-[var(--crm-bg)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-[var(--crm-text-primary)]">Meetings</h1>
            <p className="text-sm text-[var(--crm-text-secondary)] mt-1">Manage your scheduled meetings</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/meetings/event-types">
              <Button variant="outline" size="sm" className="bg-[var(--crm-surface-2)] border-[var(--crm-border)] text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-3)]">
                <Settings2 className="h-4 w-4 mr-2" />
                Event Types
              </Button>
            </Link>
            <Button size="sm" className="bg-[var(--crm-primary)] hover:opacity-90 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Questions
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-4 gap-4 shrink-0 px-6 py-4 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
          {[
            { label: 'Upcoming', value: totalUpcoming, icon: CalendarDays },
            { label: 'Confirmed', value: totalConfirmed, icon: CalendarCheck },
            { label: 'Completed', value: totalCompleted, icon: CheckCircle2 },
            { label: 'Total', value: totalUpcoming + totalHistory, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 bg-[var(--crm-surface-2)] rounded-lg p-4 border border-[var(--crm-border)] shadow-sm">
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-[var(--crm-surface-3)] shrink-0 border border-[var(--crm-border)]">
                <Icon className="h-5 w-5 text-[var(--crm-text-secondary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--crm-text-secondary)] font-medium mb-1">{label}</p>
                <div className="text-xl font-semibold text-[var(--crm-text-primary)]">
                  {isLoading ? <Skeleton className="h-6 w-10" /> : value}
                </div>
              </div>
            </div>
          ))}
        </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[var(--crm-bg)]">
        <Tabs defaultValue="upcoming" className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 border-b border-[var(--crm-border)] shrink-0 bg-[var(--crm-surface-1)]">
            <TabsList className="h-12 bg-transparent p-0">
              <TabsTrigger value="upcoming" className="h-full">
                Upcoming
                {totalUpcoming > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px] bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)] border border-[var(--crm-border)]">
                    {totalUpcoming}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="h-full">
                History
              </TabsTrigger>
            </TabsList>
            <div className="py-2">
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[140px] border-[var(--crm-border)] bg-[var(--crm-surface-2)]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Upcoming Tab ── */}
          <TabsContent value="upcoming" className="flex-1 data-[state=active]:flex flex-col min-h-0 m-0 mt-0 overflow-hidden outline-none">
            <div className="flex-1 overflow-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {isLoading ? (
                <div className="space-y-4">
                  <MeetingsSkeleton />
                </div>
              ) : meetings.upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                    <CalendarCheck className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No upcoming meetings</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Meetings booked via your event types will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupMeetingsByDate(meetings.upcoming)).map(([date, dayMeetings]) => (
                    <div key={date}>
                      <div className="flex items-center gap-3 mb-4">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                          {formatInTimeZone(new Date(date), 'UTC', 'EEEE, MMMM d, yyyy')}
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
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
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
            ) : meetings.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                  <AlignLeft className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No meeting history</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Past meetings will appear here</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 bg-[var(--crm-bg)]">
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
                      {meetings.history.map(m => {
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
                                          className="flex items-center justify-center p-1 rounded-full text-[var(--crm-text-tertiary)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
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
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/40 rounded-full transition-all"
                                onClick={() => openMeeting(m)}>
                                <FileText className="h-3.5 w-3.5" />
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
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
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
