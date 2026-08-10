'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import { SectionContent } from "@/components/ui/section-content"
import { SectionWarning } from "@/components/ui/section-warning"

import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  XCircle,
  Info,
  MapPin,
  CalendarClock,
  Clock,
  ClipboardList,
  Users,
  Eye,
  Video,
  Phone,
  ChevronDown,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import { eventTypeService } from '@/services/event-types'
import { useUser } from '@/contexts/UserContext'
import { teamApi } from '@/lib/api'
import { WIZARD_DRAFT_STORAGE_KEY } from '@/lib/eventTypeWizard'
import { cn } from '@/lib/utils'
import { TimeSlotManager } from './components/TimeSlotManager'
import { SpecificDateManager } from './components/SpecificDateManager'
import { QuestionsTab } from './components/QuestionsTab'
import { TeamTab } from './components/TeamTab'

import { EventType, Question, QuestionSection, TimeSlot, TeamMember } from '@/types/events'

type SectionId = 'basic' | 'location' | 'availability' | 'limits' | 'questions' | 'team'

const SECTIONS: { id: SectionId; label: string; icon: any }[] = [
  { id: 'basic', label: 'Basic', icon: Info },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'availability', label: 'Availability', icon: CalendarClock },
  { id: 'limits', label: 'Limits', icon: Clock },
  { id: 'questions', label: 'Questions', icon: ClipboardList },
  { id: 'team', label: 'Team', icon: Users },
]

// Note: uppercase removed intentionally — labels on this page use sentence case per design spec.
// Other pages that use their own label styles are unaffected.
const labelStyle = "text-[11px] font-semibold tracking-wide text-[var(--crm-text-secondary)] mb-1.5 block"
const inputStyle = "h-10 text-sm bg-[var(--crm-surface-2)] border-[var(--crm-border)] focus:bg-[var(--crm-surface-1)] transition-all rounded-lg"

const COLOR_OPTIONS = [
  '#4f46e5', '#2563eb', '#0ea5e9', '#10b981', '#84cc16', '#eab308',
  '#f97316', '#ef4444', '#d946ef', '#8b5cf6', '#64748b',
]

const LOCATION_PILLS: { value: string; label: string; icon: any }[] = [
  { value: 'zoom', label: 'Zoom', icon: Video },
  { value: 'phone', label: 'Phone call', icon: Phone },
  { value: 'in-person', label: 'In-person', icon: MapPin },
]

const VIDEO_PROVIDERS = [
  { value: 'google', label: 'Google Meet' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'webex', label: 'Webex' },
  { value: 'gotomeeting', label: 'GoToMeeting' },
  { value: 'custom', label: 'Custom' },
  { value: 'ask_invitee', label: 'Ask invitee' },
]

const ALL_VIDEO_PROVIDERS = [{ value: 'zoom', label: 'Zoom' }, ...VIDEO_PROVIDERS]

export default function EventTypeForm() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { toast } = useToast()
  const isNew = params.id === 'new'
  const defaultType = searchParams.get('type') === 'group' ? 'group' : 'one_on_one'

  const [loading, setLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([])
  const [activeSection, setActiveSection] = useState<SectionId>('basic')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)

  const [eventType, setEventType] = useState<EventType>(() => {
    const base: EventType = {
      id: isNew ? 'new' : '', // Satisfy interface
      title: '',
      description: isNew ? 'A quick meeting to discuss your needs.' : '',
      duration: 30,
      slot_interval: 30,
      location: 'video',
      video_platform: '',
      location_details: '',
      active: true,
      type: isNew ? defaultType : 'one_on_one',
      max_invitees: (isNew && defaultType === 'group') ? 2 : null,
      questions: isNew ? [
        { id: 'invitee_name', question: 'Name', type: 'text', required: true, isLocked: true },
        { id: 'invitee_email', question: 'Email', type: 'email', required: true, isLocked: true },
        { id: 'invitee_phone', question: 'Phone Number', type: 'phone', required: true, isLocked: true },
      ] as Question[] : [] as Question[],
      scheduling: {
        bufferBefore: 0,
        bufferAfter: 0,
        minimumNotice: 24,
        dailyLimit: 0,
        weeklyLimit: 0,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        dateRange: 60,
        timezone: 'Asia/Kolkata',
        timeSlots: [
          {
            id: 'default-1',
            startTime: '09:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
            breaks: []
          }
        ],
        recurring: null
      },
      slots: [] as TimeSlot[],
      teamMembers: [] as TeamMember[],
      sections: [] as QuestionSection[],
      redirect_url: '',
    }

    // If the guided wizard just handed us a pre-filled draft, use it instead of
    // the plain defaults above — the user still reviews everything here before saving.
    if (isNew && typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(WIZARD_DRAFT_STORAGE_KEY)
      if (raw) {
        sessionStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY)
        try {
          const draft = JSON.parse(raw)
          return {
            ...base,
            ...draft,
            scheduling: { ...base.scheduling, ...draft.scheduling },
          }
        } catch {
          // Malformed/stale draft — fall through to the plain defaults.
        }
      }
    }

    return base
  })

  // ... (sensors, useEffect remain same)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    const loadEventType = async () => {
      try {
        setLoading(true)
        const data = await eventTypeService.getById(params.id as string)
        const newEventType: EventType = {
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          duration: data.duration || 30,
          slot_interval: data.slot_interval || data.duration || 30,
          location: data.location || 'video',
          video_platform: data.video_platform || '',
          location_details: data.location_details || '',
          active: data.active ?? true,
          type: data.type || 'one_on_one',
          max_invitees: data.max_invitees || null,
          max_bookings_per_invitee: data.max_bookings_per_invitee || null,
          invitee_booking_limit_timeframe: data.invitee_booking_limit_timeframe || 'ACTIVE',
          questions: data.questions || [],
          scheduling: {
            bufferBefore: data.scheduling?.bufferBefore || 0,
            bufferAfter: data.scheduling?.bufferAfter || 0,
            minimumNotice: data.scheduling?.minimumNotice || 24,
            dailyLimit: data.scheduling?.dailyLimit || 0,
            weeklyLimit: data.scheduling?.weeklyLimit || 0,
            availableDays: data.scheduling?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dateRange: data.scheduling?.dateRange || 60,
            timezone: data.scheduling?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeSlots: data.scheduling?.timeSlots || [],
            recurring: data.scheduling?.recurring || null
          },
          slots: data.slots || [],
          teamMembers: data.teamMembers || [],
          sections: data.sections || [],
          redirect_url: data.redirect_url || '',
        }
        setEventType(newEventType)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event type",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadEventType()
  }, [isNew, params.id])

  useEffect(() => {
    const loadTeamRoster = async () => {
      try {
        const members = await teamApi.getMembers()
        setAvailableMembers(members || [])
      } catch (error) {
        // Non-fatal: the Team tab just shows an empty roster if this fails.
        setAvailableMembers([])
      }
    }
    loadTeamRoster()
  }, [])

  // Use specific skeletons instead of a full-page loading spinner
  // if (loading) return <LoadingSpinner />

  // Handlers (Questions, Scheduling, Team - unchanged logic but omitted for brevity in chunk)
  const addQuestion = () => {
    const newQuestion: Question = { id: Date.now().toString(), question: '', type: 'text', required: false }
    setEventType({ ...eventType, questions: [...eventType.questions, newQuestion] })
  }
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...eventType.questions]; updated[index] = { ...updated[index], [field]: value }
    setEventType({ ...eventType, questions: updated })
  }
  const removeQuestion = (index: number) => {
    const question = eventType.questions[index]
    if (question.isLocked) {
      toast({
        title: "Action Denied",
        description: "This mandatory question cannot be deleted.",
        variant: "destructive",
      })
      return
    }
    setEventType({ ...eventType, questions: eventType.questions.filter((_, i) => i !== index) })
  }
  const handleQuestionDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setEventType((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
        const newIndex = prev.questions.findIndex((q) => q.id === over.id)
        return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) }
      })
    }
  }
  const updateScheduling = (field: string, value: any) => {
    setEventType({ ...eventType, scheduling: { ...eventType.scheduling, [field]: value } })
  }
  const toggleTeamMember = (member: TeamMember) => {
    const members = eventType.teamMembers || []; const isSelected = members.some(m => m.id === member.id)
    setEventType({ ...eventType, teamMembers: isSelected ? members.filter(m => m.id !== member.id) : [...members, member] })
  }
  const updateField = (updates: Partial<EventType>) => setEventType(prev => ({ ...prev, ...updates }))

  // Fires immediately — EventTypeController::update() does a partial Eloquent
  // update with `active` fillable and no validation blocking it, so this
  // doesn't need to wait for "Save changes."
  const handleToggleActive = async () => {
    if (isNew) {
      setEventType(prev => ({ ...prev, active: !prev.active }))
      return
    }
    const nextActive = !eventType.active
    setEventType(prev => ({ ...prev, active: nextActive }))
    try {
      setIsTogglingActive(true)
      await eventTypeService.update(params.id as string, { active: nextActive })
    } catch (error) {
      setEventType(prev => ({ ...prev, active: !nextActive }))
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    } finally {
      setIsTogglingActive(false)
    }
  }

  const openPreview = () => {
    const username = user?.name?.toLowerCase().replace(/\s+/g, '-')
    if (!username || typeof window === 'undefined') return
    const identifier = eventType.slug || eventType.id
    window.open(`${window.location.origin}/${username}/${identifier}`, '_blank')
  }

  const handleSave = async () => {
    // Basic frontend validation
    const errors: Record<string, string> = {}
    
    if (isNew && !user?.name) {
      toast({ title: "Error", description: "User profile name is required to create an event type.", variant: "destructive" })
      return
    }

    if (!eventType.title?.trim()) errors.title = 'Title is required'
    if (!eventType.duration) errors.duration = 'Duration is required'
    if (!eventType.description?.trim()) errors.description = 'Description is required'
    if (eventType.type === 'group' && (!eventType.max_invitees || eventType.max_invitees < 2)) {
      errors.max_invitees = 'Minimum 2 invitees required for a group event'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setErrorMessage("Please fill in all mandatory fields highlighted in red (Title, Description, Duration).")
      setShowErrorDialog(true)
      return
    }

    try {
      setIsSaving(true)
      setFormErrors({})
      if (isNew) {
        await eventTypeService.create(eventType)
      } else {
        await eventTypeService.update(params.id as string, eventType)
      }
      toast({ title: "Success", description: "Event type saved successfully" })
      router.push('/meetings?tab=event-types')
    } catch (error: any) {
      if (error.response?.status === 422) {
        const beErrors = error.response.data.errors || {}
        setFormErrors(beErrors)
        setErrorMessage(error.response.data.message || "The data provided is invalid.")
        setShowErrorDialog(true)
      } else {
        toast({ title: "Error", description: "A system error occurred.", variant: "destructive" })
      }
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full shrink-0 border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-[var(--crm-surface-3)]">
              <ArrowLeft className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
            </Button>
            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-semibold text-[var(--crm-text-secondary)] tracking-wide mb-0.5">
                <span>Meetings</span> <span className="h-0.5 w-0.5 rounded-full bg-[var(--crm-border)]" /> <span>Booking Links</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {!loading && !isNew && (
                  <span className={cn('h-2 w-2 rounded-full shrink-0', eventType.active !== false ? 'bg-emerald-500' : 'bg-slate-400')} />
                )}
                <h1 className="text-base sm:text-lg font-bold text-[var(--crm-text-primary)] leading-none truncate">
                  {loading ? <Skeleton className="h-4 w-32" /> : (isNew ? 'Create Booking Link' : eventType.title || 'Edit Booking Link')}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isNew && !loading && (
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isTogglingActive}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-xs font-semibold text-[var(--crm-text-secondary)] disabled:opacity-60"
              >
                {eventType.active !== false ? 'On' : 'Off'}
                <span className={cn('relative inline-flex h-4 w-7 items-center rounded-full transition-colors', eventType.active !== false ? 'bg-[var(--crm-accent)]' : 'bg-[var(--crm-surface-4)]')}>
                  <span className={cn('inline-block h-3 w-3 transform rounded-full bg-white transition-transform', eventType.active !== false ? 'translate-x-3.5' : 'translate-x-0.5')} />
                </span>
              </button>
            )}
            <Button variant="outline" size="sm" onClick={openPreview} disabled={isNew} className="h-8 gap-1.5 border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-xs">
              <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="h-8 bg-[var(--crm-accent)] hover:opacity-90 text-white rounded-lg font-bold text-xs px-4 gap-2 transition-all active:scale-95 shadow-sm">
              {isSaving ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save changes'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Nav + content — fills remaining viewport height, scroll inside content column */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-2 md:p-3 flex md:flex-col gap-1 md:gap-1 overflow-x-auto custom-scrollbar md:overflow-y-auto z-10 pb-3 md:pb-3">
          {SECTIONS.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'whitespace-nowrap shrink-0 w-auto md:w-full flex items-center gap-2 px-3 md:px-3 py-1.5 md:py-2 rounded-lg text-[13px] md:text-sm font-semibold text-left transition-colors',
                  isActive ? 'bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]' : 'text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-text-primary)]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {section.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 sm:px-6 py-6">
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-0">

                {/* ── Basic ───────────────────────────────────────────────── */}
                {activeSection === 'basic' && (
                  <SectionContent className="space-y-5">
                    <div>
                      <Label htmlFor="title" className={cn(labelStyle, formErrors.title && "text-red-500")}>Event title <span className="text-red-500">*</span></Label>
                      <Input
                        id="title"
                        value={eventType.title}
                        onChange={(e) => updateField({ title: e.target.value })}
                        placeholder="e.g., Product Demo Call"
                        className={cn(inputStyle, formErrors.title && "border-red-500")}
                      />
                      {formErrors.title && <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description" className={cn(labelStyle, formErrors.description && "text-red-500")}>Description <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="description"
                        value={eventType.description}
                        onChange={(e) => updateField({ description: e.target.value })}
                        placeholder="Add a description for your event"
                        className={cn(inputStyle, "min-h-[90px] py-2 resize-none", formErrors.description && "border-red-500")}
                      />
                      {formErrors.description && <p className="text-[10px] font-semibold text-red-500 mt-1">{Array.isArray(formErrors.description) ? formErrors.description[0] : formErrors.description}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className={cn(labelStyle, formErrors.duration && "text-red-500")}>Duration <span className="text-red-500">*</span></Label>
                        <Select value={eventType.duration?.toString()} onValueChange={(v) => updateField({ duration: parseInt(v) })}>
                          <SelectTrigger className={cn(inputStyle, formErrors.duration && "border-red-500")}><SelectValue placeholder="Select duration" /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {[15, 30, 45, 60, 90, 120].map(d => <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {formErrors.duration && <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.duration}</p>}
                      </div>
                      <div>
                        <Label className={labelStyle}>Meeting type</Label>
                        <Select
                          value={eventType.type || 'one_on_one'}
                          onValueChange={(v) => updateField({ type: v as EventType['type'], max_invitees: v === 'one_on_one' ? null : (eventType.max_invitees || 2) })}
                        >
                          <SelectTrigger className={inputStyle}><SelectValue placeholder="Select meeting type" /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="one_on_one">One-on-One</SelectItem>
                            <SelectItem value="group">Group meeting (webinar/class)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {eventType.type === 'group' && (
                      <div>
                        <Label htmlFor="max_invitees" className={cn(labelStyle, formErrors.max_invitees && "text-red-500")}>Maximum invitees <span className="text-red-500">*</span></Label>
                        <Input
                          id="max_invitees"
                          type="number"
                          min="2"
                          value={eventType.max_invitees || 2}
                          onChange={(e) => updateField({ max_invitees: parseInt(e.target.value) || 2 })}
                          className={cn(inputStyle, "w-32", formErrors.max_invitees && "border-red-500")}
                        />
                        <p className="text-xs text-[var(--crm-text-secondary)] mt-1.5">Maximum number of people that can book the exact same time slot.</p>
                        {formErrors.max_invitees && <p className="text-[10px] font-semibold text-red-500 mt-1">{formErrors.max_invitees}</p>}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="redirect_url" className={labelStyle}>Redirect URL (optional)</Label>
                      <Input
                        id="redirect_url"
                        value={eventType.redirect_url || ''}
                        onChange={(e) => updateField({ redirect_url: e.target.value })}
                        placeholder="https://yourwebsite.com/thank-you"
                        className={inputStyle}
                      />
                      <p className="text-xs text-[var(--crm-text-secondary)] mt-1.5">Redirect invitees to this URL after they successfully book a meeting.</p>
                    </div>

                    <div>
                      <Label className={labelStyle}>Event color</Label>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_OPTIONS.map((color) => {
                          const isSelected = (eventType.color || '#4f46e5') === color
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateField({ color })}
                              aria-label={`Select color ${color}`}
                              aria-pressed={isSelected}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none",
                                isSelected
                                  ? "ring-2 ring-offset-[3px] ring-[var(--crm-border)] shadow-[0_0_0_4px_color-mix(in_srgb,currentColor_40%,transparent)] scale-110"
                                  : "opacity-75 hover:opacity-100 hover:scale-105"
                              )}
                              style={{ backgroundColor: color, color }}
                            >
                              {isSelected && (
                                <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-sm block" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-[var(--crm-text-secondary)] mt-1.5">Helps you visually identify this event type on your calendar.</p>
                    </div>
                  </SectionContent>
                )}

                {/* ── Location ────────────────────────────────────────────── */}
                {activeSection === 'location' && (() => {
                  const isZoom = eventType.location === 'video' && eventType.video_platform === 'zoom'
                  const isOtherProvider = eventType.location === 'video' && eventType.video_platform && eventType.video_platform !== 'zoom' && VIDEO_PROVIDERS.some(p => p.value === eventType.video_platform)
                  const currentProvider = ALL_VIDEO_PROVIDERS.find(p => p.value === eventType.video_platform)
                  const noLocationSet = eventType.location === 'video' && !eventType.video_platform
                  return (
                    <SectionContent className="space-y-4">
                      <p className="text-sm text-[var(--crm-text-secondary)]">Where will this meeting happen?</p>

                      {noLocationSet && (
                        <SectionWarning>No video provider selected — pick one below so invitees know how to join.</SectionWarning>
                      )}

                      <div>
                        <Label className={labelStyle}>Location</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {LOCATION_PILLS.map(pill => {
                            const Icon = pill.icon
                            const selected = pill.value === 'zoom' ? isZoom : eventType.location === pill.value
                            return (
                              <button
                                type="button"
                                key={pill.value}
                                onClick={() => updateField(pill.value === 'zoom' ? { location: 'video', video_platform: 'zoom' } : { location: pill.value as EventType['location'] })}
                                className={cn(
                                  'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-all',
                                  selected ? 'border-[var(--crm-accent)] ring-1 ring-[var(--crm-accent)] bg-[var(--crm-accent-soft)]' : 'border-[var(--crm-border)] hover:border-[var(--lb-navy)]/40'
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {pill.label}
                              </button>
                            )
                          })}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setLocationDropdownOpen(v => !v)}
                              className={cn(
                                'w-full h-full flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-all',
                                isOtherProvider ? 'border-[var(--crm-accent)] ring-1 ring-[var(--crm-accent)] bg-[var(--crm-accent-soft)]' : 'border-[var(--crm-border)] hover:border-[var(--lb-navy)]/40'
                              )}
                            >
                              <ChevronDown className="h-4 w-4" />
                              All options
                            </button>
                            {locationDropdownOpen && (
                              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-lg p-1">
                                {VIDEO_PROVIDERS.map(p => (
                                  <button
                                    type="button"
                                    key={p.value}
                                    onClick={() => { updateField({ location: 'video', video_platform: p.value }); setLocationDropdownOpen(false) }}
                                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-md hover:bg-[var(--crm-surface-2)] text-[var(--crm-text-primary)]"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {eventType.location === 'video' && currentProvider && (
                        <p className="text-xs text-[var(--crm-text-secondary)]">
                          Provider: <span className="font-medium text-[var(--crm-text-primary)]">{currentProvider.label}</span>
                        </p>
                      )}

                      {eventType.location === 'in-person' && (
                        <div>
                          <Label className={labelStyle}>Location details</Label>
                          <Textarea
                            value={eventType.location_details || ''}
                            onChange={(e) => updateField({ location_details: e.target.value })}
                            placeholder="Enter the meeting location address or details"
                            className={cn(inputStyle, "min-h-[70px] py-2 resize-none")}
                          />
                        </div>
                      )}

                      {eventType.location === 'phone' && (
                        <p className="text-xs text-[var(--crm-text-secondary)]">
                          Invitees will provide their phone number at booking.
                        </p>
                      )}
                    </SectionContent>
                  )
                })()}

                {/* ── Availability ────────────────────────────────────────── */}
                {activeSection === 'availability' && (() => {
                  const hasNoSlots = !(eventType.scheduling.timeSlots?.length)
                  return (
                    <SectionContent className="space-y-6">
                      {hasNoSlots && (
                        <SectionWarning>
                          No weekly hours set — add at least one time slot below so invitees can book.
                        </SectionWarning>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4 bg-[var(--crm-surface-1)]">
                        <div>
                          <Label className={labelStyle}>Minimum notice</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" min="0" value={eventType.scheduling.minimumNotice} onChange={(e) => updateScheduling('minimumNotice', parseInt(e.target.value) || 0)} className={cn(inputStyle, "w-20")} />
                            <span className="text-xs text-[var(--crm-text-secondary)]">hours before start time</span>
                          </div>
                        </div>
                        <div>
                          <Label className={labelStyle}>Booking window</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" min="1" value={eventType.scheduling.dateRange} onChange={(e) => updateScheduling('dateRange', parseInt(e.target.value) || 1)} className={cn(inputStyle, "w-20")} />
                            <span className="text-xs text-[var(--crm-text-secondary)]">days into the future</span>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className={labelStyle}>Time zone</Label>
                          <Select value={eventType.scheduling.timezone} onValueChange={(v) => updateScheduling('timezone', v)}>
                            <SelectTrigger className={inputStyle}><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="rounded-xl max-h-[250px]">
                              {Array.from(new Set([...(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []), eventType.scheduling.timezone || 'UTC'])).map((tz) => (
                                <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <TimeSlotManager
                        slots={eventType.scheduling.timeSlots || []}
                        onSlotsChange={(slots: any) => updateScheduling('timeSlots', slots)}
                      />

                      <SpecificDateManager
                        slots={(eventType.scheduling as any).specificDates || []}
                        onSlotsChange={(slots: any) => updateScheduling('specificDates', slots)}
                      />
                    </SectionContent>
                  )
                })()}

                {/* ── Limits ──────────────────────────────────────────────── */}
                {activeSection === 'limits' && (
                  <SectionContent className="space-y-5">
                    <p className="text-sm text-[var(--crm-text-secondary)]">Control how many meetings can be booked and when.</p>

                    <div>
                      <Label className={labelStyle}>Padding around meetings</Label>
                      <div className="grid sm:grid-cols-2 gap-4 mt-1.5">
                        <div>
                          <span className="text-xs text-[var(--crm-text-secondary)] mb-1 block">Before</span>
                          <Select value={String(eventType.scheduling.bufferBefore ?? 0)} onValueChange={(v) => updateScheduling('bufferBefore', parseInt(v))}>
                            <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {[0, 5, 10, 15, 30, 45, 60].map(m => <SelectItem key={m} value={String(m)}>{m === 0 ? 'No buffer' : `${m} minutes`}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--crm-text-secondary)] mb-1 block">After</span>
                          <Select value={String(eventType.scheduling.bufferAfter ?? 0)} onValueChange={(v) => updateScheduling('bufferAfter', parseInt(v))}>
                            <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {[0, 5, 10, 15, 30, 45, 60].map(m => <SelectItem key={m} value={String(m)}>{m === 0 ? 'No buffer' : `${m} minutes`}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className={labelStyle}>Daily limit</Label>
                        <Input type="number" min="0" placeholder="No limit" value={eventType.scheduling.dailyLimit || ''} onChange={(e) => updateScheduling('dailyLimit', parseInt(e.target.value) || 0)} className={inputStyle} />
                        <p className="text-xs text-[var(--crm-text-secondary)] mt-1.5">Max bookings accepted in a single day.</p>
                      </div>
                      <div>
                        <Label className={labelStyle}>Weekly limit</Label>
                        <Input type="number" min="0" placeholder="No limit" value={eventType.scheduling.weeklyLimit || ''} onChange={(e) => updateScheduling('weeklyLimit', parseInt(e.target.value) || 0)} className={inputStyle} />
                        <p className="text-xs text-[var(--crm-text-secondary)] mt-1.5">Max bookings accepted in a single week.</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--crm-border)]">
                      <Label className={labelStyle}>Per-invitee limit</Label>
                      <div className="grid sm:grid-cols-2 gap-4 mt-1.5">
                        <div>
                          <span className="text-xs text-[var(--crm-text-secondary)] mb-1 block">Max bookings</span>
                          <Input
                            type="number" min="1" placeholder="No limit"
                            value={eventType.max_bookings_per_invitee || ''}
                            onChange={(e) => updateField({ max_bookings_per_invitee: e.target.value ? parseInt(e.target.value) : null })}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <span className="text-xs text-[var(--crm-text-secondary)] mb-1 block">Timeframe</span>
                          <Select
                            value={eventType.invitee_booking_limit_timeframe || 'ACTIVE'}
                            onValueChange={(v) => updateField({ invitee_booking_limit_timeframe: v as EventType['invitee_booking_limit_timeframe'] })}
                          >
                            <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="ACTIVE">Active (at a time)</SelectItem>
                              <SelectItem value="PER_DAY">Per day</SelectItem>
                              <SelectItem value="PER_WEEK">Per week</SelectItem>
                              <SelectItem value="PER_MONTH">Per month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--crm-text-secondary)] mt-2">Limits how many times the same invitee can book this event type within the chosen timeframe.</p>
                    </div>
                  </SectionContent>
                )}

                {/* ── Questions ───────────────────────────────────────────── */}
                {activeSection === 'questions' && (
                  // QuestionsTab manages its own full-width layout (question cards
                  // with drag handles need more horizontal room than 640px).
                  // No SectionWarning here — zero custom questions is a valid state;
                  // the three locked fields (Name, Email, Phone) are always present.
                  <div>
                    <p className="text-sm text-[var(--crm-text-secondary)] mb-4 max-w-[640px]">
                      Collect information from invitees when they book. Name, email, and phone are always required.
                    </p>
                    <Tabs defaultValue="questions">
                      <QuestionsTab
                        eventType={eventType}
                        setEventType={setEventType}
                        addQuestion={addQuestion}
                        updateQuestion={(index: number, field: string, value: any) => updateQuestion(index, field as keyof Question, value)}
                        removeQuestion={removeQuestion}
                        handleQuestionDragEnd={handleQuestionDragEnd}
                        sensors={sensors}
                      />
                    </Tabs>
                  </div>
                )}

                {/* ── Team ────────────────────────────────────────────────── */}
                {activeSection === 'team' && (
                  // TeamTab manages its own layout. No SectionWarning: the backend
                  // defaults to the event-type creator as the implicit assignee,
                  // so zero explicit team members is a valid state.
                  <div>
                    <p className="text-sm text-[var(--crm-text-secondary)] mb-4 max-w-[640px]">
                      Assign team members who can host this event type. If no one is assigned, bookings go to you.
                    </p>
                    <Tabs defaultValue="team">
                      <TeamTab eventType={eventType} toggleTeamMember={toggleTeamMember} availableMembers={availableMembers} />
                    </Tabs>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 gap-0 border-none bg-white dark:bg-slate-900 shadow-2xl">
          <div className="bg-[var(--crm-red-soft)] p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <XCircle className="h-7 w-7 text-[var(--crm-red)]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-[var(--crm-red)] uppercase tracking-tighter">Configuration Failure</DialogTitle>
              <DialogDescription className="text-[var(--crm-red)]/80 font-medium text-xs">Some fields require your immediate attention.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-[var(--crm-surface-2)] rounded-xl p-4 border border-[var(--crm-border)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-[var(--crm-red)] mt-0.5" />
                <p className="text-xs font-bold text-[var(--crm-text-primary)] leading-relaxed uppercase tracking-wide">{errorMessage}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowErrorDialog(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl shadow-lg hover:opacity-90 transition-all">
                Review Fields
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
