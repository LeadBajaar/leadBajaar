'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  X, MoreVertical, ChevronDown, Video, Phone, MapPin,
  AlertTriangle, Eye, Loader2, Trash2, Plus, Pencil, Copy,
  Clock, Users, AlignLeft, CalendarClock, SlidersHorizontal, ClipboardList, CheckCircle2,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { eventTypeService } from '@/services/event-types'
import { teamApi } from '@/lib/api'
import { EventType, Question, TeamMember } from '@/types/events'
import { TeamTab } from '../event-types/[id]/components/TeamTab'
import { InviteeQuestionCard } from './InviteeQuestionCard'
import { LOCKED_QUESTIONS } from '@/lib/eventTypeWizard'
import { AvailabilityEditor } from './AvailabilityEditor'

const LOCATION_PILLS: { value: string; label: string; icon: any }[] = [
  { value: 'video', label: 'Video call', icon: Video },
  { value: 'phone', label: 'Phone call', icon: Phone },
  { value: 'in-person', label: 'In-person', icon: MapPin },
]

const VIDEO_PROVIDERS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google', label: 'Google Meet' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'webex', label: 'Webex' },
  { value: 'gotomeeting', label: 'GoToMeeting' },
  { value: 'custom', label: 'Custom' },
]

const COLOR_OPTIONS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f472b6', label: 'Light pink' },
  { value: '#d946ef', label: 'Magenta' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#10b981', label: 'Lime green' },
  { value: '#84cc16', label: 'Electric lime' },
  { value: '#eab308', label: 'Bright yellow' },
  { value: '#f97316', label: 'Orange' },
]

const labelStyle = 'text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-1.5 block'
const inputStyle = 'h-9 text-sm bg-[var(--crm-surface-2)] border-[var(--crm-border)] focus:bg-[var(--crm-surface-1)] transition-all rounded-lg'

interface AccordionSectionProps {
  id: string
  title: string
  summary: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  warn?: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

const AccordionSection = ({ id, title, summary, icon: Icon, warn, isOpen, onToggle, children }: AccordionSectionProps) => (
  <div className="border-t border-[var(--crm-border)] last:border-b">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3.5 text-left"
    >
      <span className="text-base font-bold text-[var(--crm-text-primary)]">{title}</span>
      <ChevronDown className={cn('h-4 w-4 text-[var(--crm-text-secondary)] transition-transform shrink-0', isOpen && 'rotate-180')} />
    </button>
    {!isOpen && (
      <p className={cn(
        'text-sm mb-3.5 flex items-center gap-2',
        warn ? 'text-amber-600' : 'text-[var(--crm-text-secondary)]'
      )}>
        {warn ? <AlertTriangle className="h-4 w-4 shrink-0" /> : Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        <span className="truncate">{summary}</span>
      </p>
    )}
    {isOpen && <div className="pb-4">{children}</div>}
  </div>
)

interface EventTypePanelProps {
  eventTypeId: string | number | null
  onClose: () => void
  onSaved: (updated: EventType) => void
  onDeleted: (id: string | number) => void
  onCloned: (created: EventType) => void
  previewOpen: boolean
  onTogglePreview: () => void
}

export const EventTypePanel = ({ eventTypeId, onClose, onSaved, onDeleted, onCloned, previewOpen, onTogglePreview }: EventTypePanelProps) => {
  const [loading, setLoading] = useState(true)
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([])
  const [view, setView] = useState<'quick' | 'more'>('quick')
  const [openSection, setOpenSection] = useState<string | null>('duration')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!eventTypeId) return
    setLoading(true)
    setView('quick')
    setOpenSection('duration')
    eventTypeService.getById(eventTypeId)
      .then(data => {
        // Event types created before invitee name/email/phone became locked
        // default questions won't have them yet — backfill so this event type's
        // booking form actually collects them once saved.
        const existingIds = new Set((data.questions || []).map((q: Question) => q.id))
        const missingLocked = LOCKED_QUESTIONS.filter(lq => !existingIds.has(lq.id))
        setEventType(missingLocked.length > 0 ? { ...data, questions: [...missingLocked, ...(data.questions || [])] } : data)
      })
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false))
  }, [eventTypeId])

  useEffect(() => {
    teamApi.getMembers().then((members: TeamMember[]) => setAvailableMembers(members || [])).catch(() => setAvailableMembers([]))
  }, [])

  if (!eventTypeId) return null

  const toggleSection = (id: string) => setOpenSection(prev => prev === id ? null : id)

  const updateField = (updates: Partial<EventType>) => {
    setEventType(prev => prev ? { ...prev, ...updates } : prev)
  }

  const updateScheduling = (field: string, value: any) => {
    setEventType(prev => prev ? { ...prev, scheduling: { ...prev.scheduling, [field]: value } } : prev)
  }

  const addQuestion = () => {
    if (!eventType) return
    const newQuestion: Question = { id: Date.now().toString(), question: '', type: 'text', required: false }
    updateField({ questions: [...eventType.questions, newQuestion] })
  }
  const updateQuestion = (index: number, field: string, value: any) => {
    if (!eventType) return
    const updated = [...eventType.questions]
    const current = updated[index]
    let next = { ...current, [field]: value }
    if (field === 'type' && ['radio', 'checkbox', 'dropdown'].includes(value) && !(current.options && current.options.length > 0)) {
      next = { ...next, options: ['', ''] }
    }
    updated[index] = next
    updateField({ questions: updated })
  }
  const removeQuestion = (index: number) => {
    if (!eventType) return
    const question = eventType.questions[index]
    if (question.isLocked) {
      toast.error('This mandatory question cannot be deleted.')
      return
    }
    updateField({ questions: eventType.questions.filter((_, i) => i !== index) })
  }
  const handleQuestionDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setEventType(prev => {
      if (!prev) return prev
      const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
      const newIndex = prev.questions.findIndex((q) => q.id === over.id)
      return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) }
    })
  }
  const toggleTeamMember = (member: TeamMember) => {
    if (!eventType) return
    const members = eventType.teamMembers || []
    const isSelected = members.some(m => m.id === member.id)
    updateField({ teamMembers: isSelected ? members.filter(m => m.id !== member.id) : [...members, member] })
  }

  const handleSave = async () => {
    if (!eventType) return
    if (!eventType.title?.trim()) { toast.error('Title is required'); setView('quick'); return }
    if (!eventType.duration) { toast.error('Duration is required'); setView('quick'); return }

    try {
      setIsSaving(true)
      const updated = await eventTypeService.update(eventType.id, eventType)
      toast.success('Changes saved')
      onSaved(updated || eventType)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClone = async () => {
    if (!eventType) return
    try {
      setIsCloning(true)
      const created = await eventTypeService.create({
        title: `${eventType.title} (Copy)`,
        description: eventType.description,
        duration: eventType.duration,
        slot_interval: eventType.slot_interval,
        location: eventType.location,
        video_platform: eventType.video_platform,
        location_details: eventType.location_details,
        type: eventType.type,
        max_invitees: eventType.max_invitees,
        color: eventType.color,
        questions: eventType.questions,
        scheduling: eventType.scheduling,
        redirect_url: eventType.redirect_url,
        teamMembers: eventType.teamMembers,
      } as any)
      toast.success('Event cloned')
      onCloned(created)
    } catch (error) {
      toast.error('Failed to clone event')
    } finally {
      setIsCloning(false)
    }
  }

  const handleDelete = async () => {
    if (!eventType) return
    try {
      setIsDeleting(true)
      await eventTypeService.delete(eventType.id)
      toast.success('Event deleted')
      onDeleted(eventType.id)
    } catch (error) {
      toast.error('Failed to delete event')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
    }
  }

  if (loading || !eventType) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--crm-text-secondary)]" />
      </div>
    )
  }

  const scheduling = eventType.scheduling
  const weeklySlotCount = (scheduling.timeSlots || []).length
  const overrideCount = (scheduling.specificDates || []).length
  const locProvider = VIDEO_PROVIDERS.find(p => p.value === eventType.video_platform)
  const locationSummary = eventType.location === 'video'
    ? (locProvider ? locProvider.label : null)
    : eventType.location === 'phone' ? 'Phone call'
      : eventType.location === 'in-person' ? 'In-person' : null
  const locationWarn = !locationSummary

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header — pinned */}
      <div className="shrink-0 px-4 py-3.5 border-b border-[var(--crm-border)]">
        <div className="flex justify-end mb-1">
          <button onClick={onClose} className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--crm-text-tertiary)] mb-0.5">Event</p>
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setColorPickerOpen(v => !v)}
              className="block h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: eventType.color || '#4f46e5' }}
              title="Change color"
            />
            {colorPickerOpen && (
              <div className="absolute left-0 top-6 z-30 w-44 max-h-64 overflow-y-auto rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-lg py-1">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => { updateField({ color: c.value }); setColorPickerOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--crm-surface-2)]',
                      c.value === (eventType.color || '#4f46e5') ? 'bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] font-medium' : 'text-[var(--crm-text-primary)]'
                    )}
                  >
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.value }} />
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {renaming ? (
            <input
              autoFocus
              value={eventType.title}
              onChange={(e) => updateField({ title: e.target.value })}
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setRenaming(false) }}
              className="min-w-0 flex-1 text-base font-bold text-[var(--crm-text-primary)] bg-transparent outline-none border-b border-[var(--crm-accent)]"
            />
          ) : (
            <button type="button" onClick={() => setRenaming(true)} className="min-w-0 text-left">
              <p className="text-base font-bold text-[var(--crm-text-primary)] truncate">{eventType.title || 'Untitled event'}</p>
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-colors shrink-0 ml-2">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[var(--crm-surface-1)]">
              <DropdownMenuItem onClick={() => setRenaming(true)} className="cursor-pointer gap-2">
                <Pencil className="h-3.5 w-3.5" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClone} disabled={isCloning} className="cursor-pointer gap-2">
                {isCloning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />} Clone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteConfirmOpen(true)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5" /> Delete event
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">{eventType.active !== false ? 'On' : 'Off'}</span>
                <Switch
                  checked={eventType.active !== false}
                  onCheckedChange={(checked) => updateField({ active: checked })}
                  className="data-[state=checked]:bg-[var(--crm-accent)]"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-xs text-[var(--crm-text-secondary)]">{eventType.type === 'group' ? 'Group' : 'One-on-one'}</p>
          {eventType.active === false && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">Paused</span>
          )}
        </div>
      </div>

      {deleteConfirmOpen && (
        <div className="shrink-0 px-4 py-3 bg-red-50 dark:bg-red-900/10 border-b border-red-200/60 dark:border-red-900/50 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">Delete this event? This can&apos;t be undone.</p>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* Accordion body — scrolls independently */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {view === 'quick' ? (
          <div>
            <AccordionSection
              id="duration" title="Duration" icon={Clock} isOpen={openSection === 'duration'} onToggle={() => toggleSection('duration')}
              summary={`${eventType.duration} min`}
            >
              <Select value={eventType.duration?.toString()} onValueChange={(v) => updateField({ duration: parseInt(v) })}>
                <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[15, 30, 45, 60, 90, 120].map(d => <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>)}
                </SelectContent>
              </Select>
            </AccordionSection>

            <AccordionSection
              id="meeting-type" title="Meeting type" icon={Users} isOpen={openSection === 'meeting-type'} onToggle={() => toggleSection('meeting-type')}
              summary={eventType.type === 'group' ? `Group · up to ${eventType.max_invitees || 2} invitees per slot` : 'One-on-one'}
            >
              <Select
                value={eventType.type || 'one_on_one'}
                onValueChange={(v) => updateField({ type: v as EventType['type'], max_invitees: v === 'group' ? (eventType.max_invitees || 2) : null })}
              >
                <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="one_on_one">One-on-One</SelectItem>
                  <SelectItem value="group">Group (Webinar/Class)</SelectItem>
                </SelectContent>
              </Select>
              {eventType.type === 'group' && (
                <div className="mt-3">
                  <label className={labelStyle}>Max invitees per slot</label>
                  <Input
                    type="number" min="2"
                    value={eventType.max_invitees || 2}
                    onChange={(e) => updateField({ max_invitees: parseInt(e.target.value) || 2 })}
                    className={inputStyle}
                  />
                  <p className="text-[10px] text-[var(--crm-text-secondary)] mt-1">Maximum number of people who can book the same time slot.</p>
                </div>
              )}
            </AccordionSection>

            <AccordionSection
              id="location" title="Location" icon={MapPin} isOpen={openSection === 'location'} onToggle={() => toggleSection('location')}
              warn={locationWarn}
              summary={locationSummary || 'No location set'}
            >
              <div className="grid grid-cols-4 gap-1.5">
                {LOCATION_PILLS.map(pill => {
                  const Icon = pill.icon
                  const selected = eventType.location === pill.value
                  return (
                    <button
                      type="button"
                      key={pill.value}
                      onClick={() => updateField({ location: pill.value })}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2.5 text-[11px] font-medium transition-all',
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
                      'w-full h-full flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2.5 text-[11px] font-medium transition-all',
                      locProvider ? 'border-[var(--crm-accent)] ring-1 ring-[var(--crm-accent)] bg-[var(--crm-accent-soft)]' : 'border-[var(--crm-border)] hover:border-[var(--lb-navy)]/40'
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                    All options
                  </button>
                  {locationDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-lg p-1">
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

              {eventType.location === 'video' && (
                <p className="text-[11px] text-[var(--crm-text-secondary)] mt-2">
                  Provider: <span className="font-medium text-[var(--crm-text-primary)]">{locProvider?.label || 'Not set — pick one above'}</span>
                </p>
              )}
              {eventType.location === 'in-person' && (
                <Textarea
                  value={eventType.location_details || ''}
                  onChange={(e) => updateField({ location_details: e.target.value })}
                  placeholder="Address or meeting location"
                  className={cn(inputStyle, 'mt-2 min-h-[60px] resize-none')}
                />
              )}
            </AccordionSection>

            <AccordionSection
              id="availability" title="Availability" icon={CalendarClock} isOpen={openSection === 'availability'} onToggle={() => toggleSection('availability')}
              summary={`${weeklySlotCount} weekly slot${weeklySlotCount === 1 ? '' : 's'}${overrideCount ? ` · ${overrideCount} date override${overrideCount === 1 ? '' : 's'}` : ''}`}
            >
              <AvailabilityEditor scheduling={scheduling} onChange={updateScheduling} />
            </AccordionSection>

            <AccordionSection
              id="team" title="Team" icon={Users} isOpen={openSection === 'team'} onToggle={() => toggleSection('team')}
              summary={eventType.teamMembers?.length ? `${eventType.teamMembers.length} member${eventType.teamMembers.length === 1 ? '' : 's'} assigned` : 'No one assigned yet'}
            >
              <Tabs defaultValue="team">
                <TeamTab eventType={eventType} toggleTeamMember={toggleTeamMember} availableMembers={availableMembers} />
              </Tabs>
            </AccordionSection>
          </div>
        ) : (
          <div>
            <AccordionSection
              id="description" title="Description" icon={AlignLeft} isOpen={openSection === 'description'} onToggle={() => toggleSection('description')}
              summary={eventType.description || 'Tell your invitees what this meeting is about'}
            >
              <Textarea
                value={eventType.description}
                onChange={(e) => updateField({ description: e.target.value })}
                placeholder="Tell your invitees what this meeting is about"
                className={cn(inputStyle, 'min-h-[70px] resize-none')}
              />
            </AccordionSection>

            <AccordionSection
              id="limits" title="Limits and buffers" icon={Clock} isOpen={openSection === 'limits'} onToggle={() => toggleSection('limits')}
              summary={[
                scheduling.bufferBefore || scheduling.bufferAfter ? `${scheduling.bufferBefore || 0}/${scheduling.bufferAfter || 0} min buffer` : null,
                scheduling.dailyLimit ? `${scheduling.dailyLimit}/day` : null,
                scheduling.weeklyLimit ? `${scheduling.weeklyLimit}/week` : null,
              ].filter(Boolean).join(' · ') || 'Buffer times, max limits'}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Buffer before</label>
                  <Select value={String(scheduling.bufferBefore ?? 0)} onValueChange={(v) => updateScheduling('bufferBefore', parseInt(v))}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[0, 5, 10, 15, 30, 45, 60].map(m => <SelectItem key={m} value={String(m)}>{m === 0 ? 'No buffer' : `${m} minutes`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={labelStyle}>Buffer after</label>
                  <Select value={String(scheduling.bufferAfter ?? 0)} onValueChange={(v) => updateScheduling('bufferAfter', parseInt(v))}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[0, 5, 10, 15, 30, 45, 60].map(m => <SelectItem key={m} value={String(m)}>{m === 0 ? 'No buffer' : `${m} minutes`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={labelStyle}>Daily limit</label>
                  <Input
                    type="number" min="0" placeholder="No limit"
                    value={scheduling.dailyLimit || ''}
                    onChange={(e) => updateScheduling('dailyLimit', parseInt(e.target.value) || 0)}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Weekly limit</label>
                  <Input
                    type="number" min="0" placeholder="No limit"
                    value={scheduling.weeklyLimit || ''}
                    onChange={(e) => updateScheduling('weeklyLimit', parseInt(e.target.value) || 0)}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Per-invitee limit</label>
                  <Input
                    type="number" min="1" placeholder="No limit"
                    value={eventType.max_bookings_per_invitee || ''}
                    onChange={(e) => updateField({ max_bookings_per_invitee: e.target.value ? parseInt(e.target.value) : null })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Limit timeframe</label>
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
            </AccordionSection>

            <AccordionSection
              id="booking-page" title="Booking page options" icon={SlidersHorizontal} isOpen={openSection === 'booking-page'} onToggle={() => toggleSection('booking-page')}
              summary={`/${eventType.slug || '...'} · ${eventType.slot_interval || eventType.duration} min increments · ${scheduling.timezone || 'UTC'}`}
            >
              <div>
                <label className={labelStyle}>Booking page URL</label>
                <Input value={`/${eventType.slug || ''}`} disabled className={cn(inputStyle, 'opacity-70')} />
                <p className="text-[10px] text-[var(--crm-text-secondary)] mt-1">Generated automatically from the event title — not editable yet.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelStyle}>Slot increments</label>
                  <Select value={String(eventType.slot_interval || eventType.duration || 30)} onValueChange={(v) => updateField({ slot_interval: parseInt(v) })}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[15, 30, 45, 60, 90, 120].map(m => <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={labelStyle}>Time zone</label>
                  <Select value={scheduling.timezone} onValueChange={(v) => updateScheduling('timezone', v)}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[250px]">
                      {Array.from(new Set([...(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []), scheduling.timezone || 'UTC'])).map((tz) => (
                        <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              id="invitee-form" title="Invitee form" icon={ClipboardList} isOpen={openSection === 'invitee-form'} onToggle={() => toggleSection('invitee-form')}
              summary={(() => {
                const customCount = eventType.questions.filter(q => !q.isLocked).length
                return `Asking for name, email${customCount ? `, +${customCount} question${customCount === 1 ? '' : 's'}` : ''}`
              })()}
            >
              {(() => {
                const lockedQuestions = eventType.questions.filter(q => q.isLocked)
                const customQuestions = eventType.questions
                  .map((question, index) => ({ question, index }))
                  .filter(({ question }) => !question.isLocked)
                return (
                  <>
                    {lockedQuestions.length > 0 && (
                      <div className="mb-5">
                        <p className="text-sm font-semibold text-[var(--crm-text-primary)] mb-0.5">Invitee details</p>
                        <p className="text-sm text-[var(--crm-accent)] mb-3">
                          Collected from every invitee automatically — always required
                        </p>
                        <div className="rounded-lg border border-[var(--crm-border)] divide-y divide-[var(--crm-border)]">
                          {lockedQuestions.map(q => (
                            <div key={q.id} className="flex items-center justify-between px-3.5 py-2.5">
                              <span className="text-sm text-[var(--crm-text-primary)]">{q.question}</span>
                              <span className="text-xs text-[var(--crm-text-secondary)]">Required</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-2">Invitee questions</p>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
                      <SortableContext items={customQuestions.map(({ question }) => question.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {customQuestions.map(({ question, index }, displayIndex) => (
                            <InviteeQuestionCard
                              key={question.id}
                              question={question}
                              index={index}
                              displayIndex={displayIndex}
                              updateQuestion={updateQuestion}
                              removeQuestion={removeQuestion}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--crm-accent)] mt-3"
                    >
                      <Plus className="h-4 w-4" /> Add new question
                    </button>
                  </>
                )
              })()}
            </AccordionSection>

            <AccordionSection
              id="confirmation" title="Confirmation page" icon={CheckCircle2} isOpen={openSection === 'confirmation'} onToggle={() => toggleSection('confirmation')}
              summary={eventType.redirect_url ? `Redirects to ${eventType.redirect_url}` : 'Shows the default confirmation page'}
            >
              <label className={labelStyle}>Redirect URL (optional)</label>
              <Input
                value={eventType.redirect_url || ''}
                onChange={(e) => updateField({ redirect_url: e.target.value })}
                placeholder="e.g. https://yoursite.com/thank-you"
                className={inputStyle}
              />
              <p className="text-[10px] text-[var(--crm-text-secondary)] mt-1">Leave blank to show the default confirmation page after booking.</p>
            </AccordionSection>
          </div>
        )}
      </div>

      {/* Footer — pinned */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-t border-[var(--crm-border)]">
        <Button variant="outline" size="sm" onClick={onTogglePreview} className="h-8 text-xs gap-1.5 border-[var(--crm-border)]">
          <Eye className="h-3.5 w-3.5" /> {previewOpen ? 'Hide preview' : 'Preview'}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setView(v => v === 'quick' ? 'more' : 'quick')} className="h-8 text-xs">
            {view === 'quick' ? 'More options' : 'Back'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 text-xs bg-[var(--lb-navy)] hover:opacity-90 text-white">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
