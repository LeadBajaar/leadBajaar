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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Search, Plus, MoreHorizontal, Link as LinkIcon, Trash2, Eye,
  Video, Phone, MapPin, Users, User, CalendarCheck, Sparkles,
  Share2, ExternalLink, X, Copy, Check, Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { eventTypeService } from '@/services/event-types'
import { EventType } from '@/types/events'
import { useUser } from '@/contexts/UserContext'
import { cn } from '@/lib/utils'
import { DeleteConfirmationModal } from '@/components/shared/DeleteConfirmationModal'

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
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [copiedId, setCopiedId] = useState<string | number | null>(null)

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

  const copyLink = (eventType: EventType, e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard.writeText(getBookingUrl(eventType))
    setCopiedId(eventType.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openShareDialog = (eventType: EventType) => {
    setSelectedEventType(eventType)
    setShowShareDialog(true)
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

  const startCreate = (mode: 'guided' | 'one_on_one' | 'group') => {
    if (!user?.name) { toast.error('User profile name is required to create an event.'); return }
    if (mode === 'guided') router.push('/meetings/event-types/wizard')
    else router.push(`/meetings/event-types/new?type=${mode}`)
  }

  const filtered = eventTypes.filter(et => et.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
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
                    <span className="text-xs text-[var(--crm-text-secondary)]">Answer a few questions and we'll set it up</span>
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
                    {eventTypes.length === 0 ? 'Create your first booking link to start scheduling meetings.' : 'Try a different search.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map(eventType => {
                    const locInfo = locationIcons[eventType.location] || locationIcons.video
                    const LocIcon = locInfo.icon
                    const isActive = eventType.active !== false
                    const isToggling = togglingId === eventType.id
                    return (
                      <div
                        key={eventType.id}
                        onClick={() => router.push(`/meetings/event-types/${eventType.id}`)}
                        className={cn(
                          'group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-300',
                          'border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm hover:shadow-md hover:border-[var(--lb-navy)]/50'
                        )}
                      >
                        <div className={cn("flex items-center gap-3 w-full min-w-0", !isActive && "opacity-60")}>
                          <span
                            className={cn('h-2 w-2 rounded-full shrink-0', isActive ? 'bg-emerald-500' : 'bg-slate-400')}
                            title={isActive ? 'Active' : 'Paused'}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--crm-text-primary)] truncate">{eventType.title}</p>
                            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
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
                          className="flex flex-wrap items-center gap-1.5 shrink-0 pl-5 sm:pl-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isToggling}
                            onClick={() => toggleActive(eventType)}
                            className={cn(
                              'h-7 text-[11px] px-2.5 border-[var(--crm-border)] active:scale-95 transition-transform',
                              isActive ? 'bg-[var(--crm-surface-2)] hover:bg-[var(--crm-surface-3)]' : 'bg-[var(--lb-navy)] text-white hover:opacity-90'
                            )}
                          >
                            {isActive ? 'Turn off' : 'Turn on'}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => copyLink(eventType, e)}
                            title="Copy booking link"
                            className={cn(
                              "h-7 w-7 border-[var(--crm-border)] active:scale-95 transition-all",
                              copiedId === eventType.id
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                                : "bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)]"
                            )}
                          >
                            {copiedId === eventType.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openShareDialog(eventType)}
                            title="Share / Embed"
                            className="h-7 w-7 border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)] active:scale-95 transition-transform"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => viewLandingPage(eventType)}
                            title="Preview booking page"
                            className="h-7 w-7 border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)] active:scale-95 transition-transform"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-7 w-7 border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)] active:scale-95 transition-transform">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[var(--crm-surface-1)]">
                              <DropdownMenuItem onClick={() => router.push(`/meetings/event-types/${eventType.id}`)} className="cursor-pointer gap-2">
                                <Pencil className="h-3.5 w-3.5" /> Edit event
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => copyLink(eventType, e as any)} className="cursor-pointer gap-2">
                                {copiedId === eventType.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} 
                                {copiedId === eventType.id ? <span className="text-emerald-600 font-medium">Copied!</span> : "Copy link"}
                              </DropdownMenuItem>
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
      </div>

      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={confirmDelete}
        title="Delete Booking Link"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the booking link and prevent new bookings. Past and upcoming meetings will remain in your history.`}
        isLoading={isDeleting}
      />

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md w-full bg-[var(--crm-surface-1)] border-[var(--crm-border)] p-6 rounded-xl shadow-lg">
          <DialogHeader className="text-left space-y-1 mb-2">
            <DialogTitle className="text-lg font-bold text-[var(--crm-text-primary)]">Share Booking Link</DialogTitle>
            <DialogDescription className="text-sm text-[var(--crm-text-secondary)]">
              Send this link or embed it on your website.
            </DialogDescription>
          </DialogHeader>

          {selectedEventType && (
            <Tabs defaultValue="link" className="mt-2 w-full min-w-0">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-[var(--crm-surface-2)]">
                <TabsTrigger value="link">Share Link</TabsTrigger>
                <TabsTrigger value="embed">Embed Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-4">
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon className="h-3.5 w-3.5 text-[var(--crm-text-tertiary)]" />
                    </div>
                    <div className="w-full text-xs font-medium bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-lg h-9 leading-9 pl-9 pr-3 text-[var(--crm-text-primary)] truncate block">
                      {getBookingUrl(selectedEventType)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => copyLink(selectedEventType)}
                    className={cn(
                      "h-9 px-4 shrink-0 rounded-lg text-xs transition-colors",
                      copiedId === selectedEventType.id
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-[var(--lb-navy)] hover:opacity-90 text-white"
                    )}
                  >
                    {copiedId === selectedEventType.id ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copiedId === selectedEventType.id ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-2)] rounded-lg h-9 text-xs font-medium"
                  onClick={() => viewLandingPage(selectedEventType)}
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  Preview Booking Page
                </Button>
              </TabsContent>

              <TabsContent value="embed" className="space-y-4 mt-0">
                <div className="relative group rounded-lg overflow-hidden border border-[var(--crm-border)] bg-[var(--crm-surface-2)]">
                  <div className="w-full p-4 text-[var(--crm-text-primary)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed break-words h-[140px] overflow-y-auto">
                    {`<div style="width: 100%; display: flex; justify-content: center;">\n  <iframe \n    src="${getBookingUrl(selectedEventType)}?embed=true"\n    width="100%"\n    height="600"\n    style="max-width: 820px; min-height: 600px; border: none; background: transparent;"\n    loading="lazy"\n    title="LeadBajaar Booking Calendar"\n  ></iframe>\n</div>`}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const embedCode = `<div style="width: 100%; display: flex; justify-content: center;">\n  <iframe \n    src="${getBookingUrl(selectedEventType)}?embed=true" \n    width="100%" \n    height="600" \n    style="max-width: 820px; min-height: 600px; border: none; background: transparent;" \n    loading="lazy"\n    title="LeadBajaar Booking Calendar"\n  ></iframe>\n</div>`
                        navigator.clipboard.writeText(embedCode)
                        setCopiedId('embed')
                        setTimeout(() => setCopiedId(null), 2000)
                      }}
                      className={cn(
                        "shadow-sm border-[var(--crm-border)] text-xs h-7 px-2 transition-colors",
                        copiedId === 'embed'
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                          : "bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-3)]"
                      )}
                    >
                      {copiedId === 'embed' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />} 
                      {copiedId === 'embed' ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
