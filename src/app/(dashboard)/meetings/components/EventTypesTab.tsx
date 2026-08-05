'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Plus, MoreHorizontal, Link as LinkIcon, Trash2, Eye,
  Video, Phone, MapPin, Users, User, CalendarCheck, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { eventTypeService } from '@/services/event-types'
import { EventType } from '@/types/events'
import { useUser } from '@/contexts/UserContext'
import { cn } from '@/lib/utils'
import { DeleteConfirmationModal } from '@/components/shared/DeleteConfirmationModal'
import { EventTypePanel } from './EventTypePanel'
import { EventTypePreview } from './EventTypePreview'

const locationIcons: Record<string, { icon: any; label: string }> = {
  video: { icon: Video, label: 'Video Call' },
  phone: { icon: Phone, label: 'Phone Call' },
  'in-person': { icon: MapPin, label: 'In Person' },
}

export const EventTypesTab = () => {
  const router = useRouter()
  const { user } = useUser()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await eventTypeService.getAll()
      setEventTypes(data || [])
    } catch (error) {
      toast.error('Failed to load events')
      setEventTypes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const getBookingUrl = (eventType: EventType) => {
    // @ts-ignore - owner may not be strongly typed here
    const username = eventType.owner?.name?.toLowerCase().replace(/\s+/g, '-') || user?.name?.toLowerCase().replace(/\s+/g, '-')
    if (!username || typeof window === 'undefined') return '#'
    const identifier = eventType.slug || eventType.id
    return `${window.location.origin}/${username}/${identifier}`
  }

  const copyLink = (eventType: EventType) => {
    navigator.clipboard.writeText(getBookingUrl(eventType))
    toast.success('Booking link copied to clipboard')
  }

  const viewLandingPage = (eventType: EventType) => {
    const url = getBookingUrl(eventType)
    window.open(url.replace(window.location.origin, ''), '_blank')
  }

  const toggleActive = async (eventType: EventType) => {
    const nextActive = !eventType.active
    setTogglingId(eventType.id)
    // Optimistic update — flip it back if the request fails.
    setEventTypes(prev => prev.map(et => et.id === eventType.id ? { ...et, active: nextActive } : et))
    try {
      await eventTypeService.update(eventType.id, { active: nextActive })
      toast.success(nextActive ? 'Event turned on' : 'Event turned off')
    } catch (error) {
      setEventTypes(prev => prev.map(et => et.id === eventType.id ? { ...et, active: !nextActive } : et))
      toast.error('Failed to update event')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await eventTypeService.delete(deleteTarget.id)
      setEventTypes(prev => prev.filter(et => et.id !== deleteTarget.id))
      toast.success('Event deleted')
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  const closePanel = () => {
    setSelectedId(null)
    setPreviewOpen(false) // Panel and preview close together.
  }

  const handlePanelSaved = (updated: EventType) => {
    setEventTypes(prev => prev.map(et => et.id === updated.id ? { ...et, ...updated } : et))
  }

  const handlePanelDeleted = (id: string | number) => {
    setEventTypes(prev => prev.filter(et => et.id !== id))
    closePanel()
  }

  const handlePanelCloned = (created: EventType) => {
    setEventTypes(prev => [created, ...prev])
    setPreviewOpen(false)
    setSelectedId(created.id)
  }

  const startCreate = (mode: 'guided' | 'one_on_one' | 'group') => {
    if (!user?.name) { toast.error('User profile name is required to create an event.'); return }
    if (mode === 'guided') router.push('/meetings/event-types/wizard')
    else router.push(`/meetings/event-types/new?type=${mode}`)
  }

  const filtered = eventTypes.filter(et => et.title.toLowerCase().includes(search.toLowerCase()))
  const selectedEventType = eventTypes.find(et => et.id === selectedId) || null

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Left region: list, or the live preview in its place */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 border-r border-[var(--crm-border)]">
        {previewOpen && selectedEventType ? (
          <EventTypePreview eventType={selectedEventType} bookingUrl={getBookingUrl(selectedEventType)} />
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-[var(--crm-border)] shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--crm-text-tertiary)]" />
                <Input
                  placeholder="Search events"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 h-8 text-[12px] bg-[var(--crm-surface-2)] border-[var(--crm-border)] focus-visible:ring-[var(--lb-navy)]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="h-8 px-2 sm:px-3 text-[12px] bg-[var(--lb-navy)] hover:opacity-90 text-white shadow-sm shrink-0">
                    <Plus className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">New event</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[var(--crm-surface-1)]">
                  <DropdownMenuItem onClick={() => startCreate('guided')} className="cursor-pointer flex flex-col items-start py-2.5 gap-0.5">
                    <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--crm-accent)]" /><span className="font-medium">Guided Setup</span></div>
                    <span className="text-xs text-[var(--crm-text-secondary)]">Answer a few questions and we&apos;ll set it up</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => startCreate('one_on_one')} className="cursor-pointer flex flex-col items-start py-2.5 gap-0.5">
                    <div className="flex items-center gap-2"><User className="h-4 w-4" /><span className="font-medium">One-on-One Event</span></div>
                    <span className="text-xs text-[var(--crm-text-secondary)]">Good for coffee chats, 1:1 interviews, etc.</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => startCreate('group')} className="cursor-pointer flex flex-col items-start py-2.5 gap-0.5">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="font-medium">Group Event</span></div>
                    <span className="text-xs text-[var(--crm-text-secondary)]">Good for webinars, online classes, etc.</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl bg-[var(--crm-surface-3)]" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                    <CalendarCheck className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {eventTypes.length === 0 ? 'No events yet' : 'No matches'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                    {eventTypes.length === 0 ? 'Create your first event to start scheduling meetings.' : 'Try a different search.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map(eventType => {
                    const locInfo = locationIcons[eventType.location] || locationIcons.video
                    const LocIcon = locInfo.icon
                    const isActive = eventType.active !== false
                    const isToggling = togglingId === eventType.id
                    const isSelected = selectedId === eventType.id
                    return (
                      <div
                        key={eventType.id}
                        onClick={() => setSelectedId(eventType.id)}
                        className={cn(
                          'group flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-300',
                          isSelected
                            ? 'border-[var(--crm-accent)] ring-1 ring-[var(--crm-accent)] bg-[var(--crm-accent-soft)]'
                            : 'border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm hover:shadow-md hover:border-[var(--lb-navy)]/50',
                          !isActive && 'opacity-60'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn('h-2 w-2 rounded-full shrink-0', isActive ? 'bg-emerald-500' : 'bg-slate-400')}
                            title={isActive ? 'Active' : 'Paused'}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--crm-text-primary)] truncate">{eventType.title}</p>
                            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5 flex items-center gap-1.5">
                              <span>{eventType.duration} min</span>
                              <span>·</span>
                              <span>{eventType.type === 'group' ? 'Group' : 'One-on-one'}</span>
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:flex items-center gap-1"><LocIcon className="h-3 w-3" />{locInfo.label}</span>
                              {!isActive && <span className="text-slate-400 font-medium">· Paused</span>}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isToggling}
                            onClick={() => toggleActive(eventType)}
                            className={cn(
                              'h-7 text-[11px] px-2.5 border-[var(--crm-border)]',
                              isActive ? 'bg-[var(--crm-surface-2)]' : 'bg-[var(--lb-navy)] text-white hover:opacity-90'
                            )}
                          >
                            {isActive ? 'Turn off' : 'Turn on'}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyLink(eventType)}
                            title="Copy booking link"
                            className="h-7 w-7 border-[var(--crm-border)] bg-[var(--crm-surface-1)]"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => viewLandingPage(eventType)}
                            title="Preview booking page"
                            className="h-7 w-7 border-[var(--crm-border)] bg-[var(--crm-surface-1)]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-7 w-7 border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[var(--crm-surface-1)]">
                              <DropdownMenuItem onClick={() => setDeleteTarget(eventType)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                                <Trash2 className="h-3.5 w-3.5" /> Delete event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right region: slide-in panel */}
      {selectedId && (
        <div className="w-[380px] shrink-0 flex flex-col min-h-0 bg-[var(--crm-surface-1)]">
          <EventTypePanel
            eventTypeId={selectedId}
            onClose={closePanel}
            onSaved={handlePanelSaved}
            onDeleted={handlePanelDeleted}
            onCloned={handlePanelCloned}
            previewOpen={previewOpen}
            onTogglePreview={() => setPreviewOpen(v => !v)}
          />
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
