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
} from 'lucide-react'
import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { getBookings } from '@/lib/api'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  name: string; email: string; phone: string
  profession: string; company: string; state: string
  requirements: string; avatar: string
}
interface TeamMember {
  id: number; name: string; email: string; avatar: string; role: string
}
interface QuestionnaireItem { question: string; answer: string }
interface Meeting {
  id: number; title: string; date: string; time: string; duration: string
  lead: Lead; assignedTo: TeamMember
  type: 'video' | 'phone' | 'in-person'
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled'
  meetingLink?: string; agenda?: string[]
  questionnaire?: QuestionnaireItem[]; source: string
  notes?: string; outcome?: string; followUpDate?: string
  start_time?: string; timezone: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const teamMembers: TeamMember[] = [
  { id: 1, name: 'Alex Thompson', email: 'alex@leadbajaar.com', avatar: '', role: 'Sales Representative' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@leadbajaar.com', avatar: '', role: 'Senior Sales Executive' },
  { id: 3, name: 'Michael Brown', email: 'michael@leadbajaar.com', avatar: '', role: 'Account Manager' },
  { id: 4, name: 'Emily Wilson', email: 'emily@leadbajaar.com', avatar: '', role: 'Sales Manager' },
]

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
  meeting, open, onOpenChange, onUpdate
}: {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onUpdate?: (m: Meeting) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(meeting?.notes ?? '')
  const [outcome, setOutcome] = useState(meeting?.outcome ?? '')
  const [assignedTo, setAssignedTo] = useState(meeting?.assignedTo ?? teamMembers[0])

  // Sync state when meeting changes
  React.useEffect(() => {
    if (meeting) {
      setNotes(meeting.notes ?? '')
      setOutcome(meeting.outcome ?? '')
      setAssignedTo(meeting.assignedTo)
      setIsEditing(false)
    }
  }, [meeting])

  if (!meeting) return null

  const typeInfo = meetingTypeConfig[meeting.type] ?? meetingTypeConfig.video
  const TypeIcon = typeInfo.icon
  const statusInfo = statusConfig[meeting.status] ?? statusConfig.confirmed

  const handleSave = () => {
    onUpdate?.({ ...meeting, notes, outcome, assignedTo })
    setIsEditing(false)
  }

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-white">{meeting.title}</DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white')}>
                  <TypeIcon className="h-3.5 w-3.5" />
                  {typeInfo.label}
                </span>
                <span className="text-xs text-white/70">{meeting.date} · {meeting.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs font-semibold border', statusInfo.className)}>
                {statusInfo.label}
              </Badge>
              <DialogClose className="ml-1 text-white/80 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </DialogClose>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Lead Info */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials(meeting.lead.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">{meeting.lead.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{meeting.lead.profession} {meeting.lead.company ? `· ${meeting.lead.company}` : ''}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {meeting.lead.email && (
                  <a href={`mailto:${meeting.lead.email}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    <Mail className="h-3 w-3" />{meeting.lead.email}
                  </a>
                )}
                {meeting.lead.phone && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Phone className="h-3 w-3" />{meeting.lead.phone}
                  </span>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <CalendarDays className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{meeting.date}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <Clock className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{meeting.time}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <CircleDot className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Duration</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{meeting.duration}</p>
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
              <Select value={assignedTo.email} onValueChange={(v) => {
                const m = teamMembers.find(t => t.email === v)
                if (m) setAssignedTo(m)
              }}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.email}>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {initials(m.name)}
                        </div>
                        <span className="text-sm">{m.name}</span>
                        <span className="text-xs text-slate-400">· {m.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials(assignedTo.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{assignedTo.name}</p>
                  <p className="text-xs text-slate-500">{assignedTo.role}</p>
                </div>
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

          {/* Save button */}
          {isEditing && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1.5" />Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Meeting Card (Upcoming) ───────────────────────────────────────────────────

function MeetingCard({ meeting, onSelect }: { meeting: Meeting; onSelect: (m: Meeting) => void }) {
  const typeInfo = meetingTypeConfig[meeting.type] ?? meetingTypeConfig.video
  const TypeIcon = typeInfo.icon
  const statusInfo = statusConfig[meeting.status] ?? statusConfig.confirmed
  const initials = (name: string) => name.split(' ').map(n => n[0]).join('')

  return (
    <div
      onClick={() => onSelect(meeting)}
      className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {initials(meeting.lead.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{meeting.title}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" />{meeting.time} · {meeting.duration}
          </span>
          {meeting.lead.company && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="h-3 w-3" />{meeting.lead.company}
            </span>
          )}
        </div>
      </div>

      {/* Type badge */}
      <div className={cn('hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', typeInfo.bg, typeInfo.color)}>
        <TypeIcon className="h-3.5 w-3.5" />
        {typeInfo.label}
      </div>

      {/* Status */}
      <Badge variant="outline" className={cn('text-xs font-semibold border shrink-0', statusInfo.className)}>
        {statusInfo.label}
      </Badge>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
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
  const nameAnswer = booking.answers?.find((a: any) => a.question === 'NAME')
  const emailAnswer = booking.answers?.find((a: any) => a.question === 'EMAIL')
  const mobileAnswer = booking.answers?.find((a: any) => a.question === 'MOBILE NUMBER')
  const startTime = new Date(booking.start_time)

  return {
    id: booking.id,
    title: `Meeting with ${nameAnswer?.answer || 'Guest'}`,
    date: formatInTimeZone(startTime, 'UTC', 'EEEE, MMMM d, yyyy'),
    time: formatInTimeZone(startTime, 'UTC', 'h:mm a'),
    duration: `${booking.eventType?.duration || 30} minutes`,
    type: (booking.eventType?.location as Meeting['type']) || 'video',
    status: (booking.status || defaultStatus) as Meeting['status'],
    lead: {
      name: nameAnswer?.answer || 'Guest', email: emailAnswer?.answer || '',
      phone: mobileAnswer?.answer || '', profession: '', company: '',
      state: '', requirements: '', avatar: '',
    },
    assignedTo: { id: booking.user_id, name: 'Host', email: '', role: 'Host', avatar: '' },
    meetingLink: booking.meeting_link || '',
    source: 'Website',
    questionnaire: booking.answers?.map((a: any) => ({ question: a.question, answer: a.answer })) || [],
    start_time: booking.start_time,
    timezone: booking.timezone || 'UTC',
  }
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<{ upcoming: Meeting[]; history: Meeting[] }>({ upcoming: [], history: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState({ upcoming: false, history: false })
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [pagination, setPagination] = useState({
    upcoming: { page: 1, hasMore: true },
    history: { page: 1, hasMore: true }
  })

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

  const handleMeetingUpdate = (updated: Meeting) => {
    setMeetings(prev => ({
      upcoming: prev.upcoming.map(m => m.id === updated.id ? updated : m),
      history: prev.history.map(m => m.id === updated.id ? updated : m),
    }))
    setSelectedMeeting(updated)
  }

  const openMeeting = (m: Meeting) => {
    setSelectedMeeting(m)
    setDialogOpen(true)
  }

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('')

  // Stats
  const totalUpcoming = meetings.upcoming.length
  const totalHistory = meetings.history.length
  const totalConfirmed = meetings.upcoming.filter(m => m.status === 'confirmed').length
  const totalCompleted = meetings.history.filter(m => m.status === 'completed').length

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/30 dark:bg-slate-950/30">
      <div className="flex items-center justify-between gap-4 shrink-0 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* ── Header ── */}
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Meetings</h1>
          <p className="text-xs text-slate-500">Manage your scheduled meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/meetings/event-types">
            <Button variant="outline" size="sm" className="h-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 gap-1.5">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Event Types</span>
            </Button>
          </Link>
          <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Questions</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-3 shrink-0 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {[
          { label: 'Upcoming', value: totalUpcoming, icon: CalendarDays, gradient: 'from-indigo-500 to-indigo-700' },
          { label: 'Confirmed', value: totalConfirmed, icon: CalendarCheck, gradient: 'from-emerald-500 to-emerald-700' },
          { label: 'Completed', value: totalCompleted, icon: CheckCircle2, gradient: 'from-violet-500 to-violet-700' },
          { label: 'Total', value: totalUpcoming + totalHistory, icon: Users, gradient: 'from-amber-500 to-amber-700' },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0', gradient)}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {isLoading ? <Skeleton className="h-5 w-8" /> : value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 flex-1 flex flex-col min-h-0 border-t border-slate-100 dark:border-slate-800">
        <Tabs defaultValue="upcoming" className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-0 px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 h-auto">
                <TabsTrigger value="upcoming"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md px-4 py-1.5 text-sm font-medium">
                  Upcoming
                  {totalUpcoming > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1">
                      {totalUpcoming}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md px-4 py-1.5 text-sm font-medium">
                  History
                </TabsTrigger>
              </TabsList>

              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[140px] border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50">
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
          </CardHeader>

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
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  <Table className="relative border-separate border-spacing-0 min-w-max">
                    <TableHeader className="sticky top-0 z-20">
                      <TableRow className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm">
                        {['Meeting', 'Attendee', 'Date & Time', 'Type', 'Status', 'Outcome', 'Actions'].map(h => (
                          <TableHead key={h}
                            className="h-12 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm first:pl-6">
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
                            className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <TableCell className="whitespace-nowrap font-semibold text-sm text-slate-900 dark:text-white pl-6">
                              {m.title}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                                  {initials(m.lead.name)}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-800 dark:text-white whitespace-nowrap">{m.lead.name}</p>
                                  {m.lead.company && <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{m.lead.company}</p>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-slate-500">
                              <div className="font-medium text-slate-700 dark:text-slate-300">{m.date}</div>
                              <div className="text-slate-400 mt-0.5">{m.time}</div>
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
                            <TableCell className="whitespace-nowrap text-xs text-slate-500 max-w-[200px] truncate">
                              {m.outcome || <span className="text-slate-300 italic">— No outcome recorded —</span>}
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
        />
      </div>
    </div>
  )
}