'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock, Video, MapPin, Phone, Users,
  Link as LinkIcon, Plus, Calendar, Copy, ExternalLink,
  ChevronRight, MoreHorizontal, Globe2, Trash2, Edit2, Share2,
  CalendarCheck, ArrowRight, Zap, X, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
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
import { eventTypeService } from '@/services/event-types'
import { EventType } from '@/types/events'
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const locationIcons = {
  video: { icon: Video, label: 'Video Call', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  phone: { icon: Phone, label: 'Phone Call', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'in-person': { icon: MapPin, label: 'In Person', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' }
}

export default function EventTypesPage() {
  const router = useRouter()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<string | number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)

  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        setLoading(true)
        const data = await eventTypeService.getAll()
        const processedData = (data || []).map(eventType => ({
          ...eventType,
          teamMembers: eventType.teamMembers || [],
          questions: eventType.questions || [],
          location: eventType.location || 'video'
        }))
        setEventTypes(processedData)
      } catch (error) {
        console.error('Error loading event types:', error)
        toast.error("Failed to load event types")
        setEventTypes([])
      } finally {
        setLoading(false)
      }
    }

    loadEventTypes()
  }, [])

  const getBookingUrl = (eventType: EventType) => {
    // If owner name exists, format it nicely, otherwise use developernd as default
    // @ts-ignore - owner might not be strongly typed here
    const username = eventType.owner?.name?.toLowerCase().replace(/\s+/g, '-') || 'developernd';
    const identifier = eventType.slug || eventType.id;
    return `${window.location.origin}/${username}/${identifier}`;
  };

  const copyBookingLink = (eventType: EventType) => {
    const bookingLink = getBookingUrl(eventType);
    navigator.clipboard.writeText(bookingLink)
    toast.success("Booking link copied to clipboard")
  }

  const openPreview = (eventType: EventType) => {
    // We can just use the absolute URL for window.open
    const url = getBookingUrl(eventType);
    // Convert to relative path for window.open so we don't have issues with base URL 
    const relativePath = url.replace(window.location.origin, '');
    window.open(relativePath, '_blank')
  }

  const deleteEventType = async () => {
    if (!typeToDelete) return
    try {
      setIsDeleting(true)
      await eventTypeService.delete(typeToDelete)
      setEventTypes(eventTypes.filter(et => et.id !== typeToDelete))
      toast.success("Event type deleted successfully")
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Failed to delete event type")
    } finally {
      setIsDeleting(false)
      setTypeToDelete(null)
    }
  }

  return (
    <div className="flex flex-col p-6 gap-6 h-full bg-[var(--crm-bg)] overflow-y-auto">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/meetings')} 
            className="h-9 w-9 border-[var(--crm-border)] bg-[var(--crm-surface-2)] rounded-xl hover:bg-[var(--crm-surface-3)] transition-all active:scale-95 text-[var(--crm-text-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--crm-text-primary)] flex items-center gap-3">
              Event Types
              <Zap className="h-5 w-5 text-[var(--crm-primary)] fill-[var(--crm-primary)]" />
            </h1>
            <p className="text-sm text-[var(--crm-text-secondary)] mt-1">Configure your availability and booking page settings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/api/auth/google'}
            className="h-9 border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-3)] gap-1.5"
          >
            <Calendar className="h-4 w-4 text-[var(--crm-text-secondary)]" />
            Connect Google Calendar
          </Button>
          <Link href="/meetings/event-types/new">
            <Button size="sm" className="h-9 bg-[var(--crm-primary)] hover:opacity-90 text-white gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Event Type
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm overflow-hidden animate-pulse">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-[var(--crm-surface-3)]" />
                  <Skeleton className="h-4 w-1/2 bg-[var(--crm-surface-3)]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full bg-[var(--crm-surface-3)]" />
                  <Skeleton className="h-4 w-2/3 bg-[var(--crm-surface-3)]" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-[var(--crm-surface-3)]" />
                    <Skeleton className="h-6 w-20 rounded-full bg-[var(--crm-surface-3)]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--crm-surface-2)] rounded-3xl border-2 border-dashed border-[var(--crm-border)]">
            <div className="h-16 w-16 rounded-2xl bg-[var(--crm-surface-1)] flex items-center justify-center mb-6 shadow-sm border border-[var(--crm-border)] rotate-6">
              <CalendarCheck className="h-8 w-8 text-[var(--crm-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--crm-text-primary)]">No event types yet</h3>
            <p className="text-sm text-[var(--crm-text-secondary)] mt-2 max-w-xs mx-auto mb-8">
              Create your first event type to start scheduling meetings and automating your booking process.
            </p>
            <Link href="/meetings/event-types/new">
              <Button className="bg-[var(--crm-primary)] hover:opacity-90 text-white gap-2 px-6">
                <Plus className="h-4 w-4" />
                Create your first event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {eventTypes.map((eventType) => {
              const loc = locationIcons[eventType.location as keyof typeof locationIcons] || locationIcons.video
              return (
                <Card key={eventType.id} className="group relative border-[var(--crm-border)] shadow-sm hover:shadow-md hover:border-[var(--crm-primary)]/50 transition-all duration-300 bg-[var(--crm-surface-1)] flex flex-col rounded-xl overflow-visible">
                  {/* Status Indicator (Top Bar) */}
                  <div className="h-1 w-full bg-[var(--crm-surface-3)] group-hover:bg-[var(--crm-primary)] transition-colors rounded-t-xl" />

                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3 relative z-50">
                      <div className={cn("p-1.5 rounded-lg border transition-all duration-300 group-hover:scale-110", loc.bg, "border-transparent group-hover:border-current shadow-sm")}>
                        <loc.icon className={cn("h-4 w-4", loc.color)} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-[var(--crm-surface-3)] rounded-md">
                            <MoreHorizontal className="h-4 w-4 text-[var(--crm-text-tertiary)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[var(--crm-surface-1)] shadow-xl border-[var(--crm-border)] p-1.5 rounded-xl z-[9999] relative">
                          <DropdownMenuItem asChild className="rounded-lg focus:bg-[var(--crm-surface-3)] focus:text-[var(--crm-primary)] cursor-pointer">
                            <Link href={`/meetings/event-types/${eventType.id}`} className="flex items-center gap-2 w-full text-[var(--crm-text-secondary)]">
                              <Edit2 className="h-4 w-4" /> Edit Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedEventType(eventType); setShowShareDialog(true); }} className="rounded-lg focus:bg-[var(--crm-surface-3)] focus:text-[var(--crm-primary)] cursor-pointer flex items-center gap-2 text-[var(--crm-text-secondary)]">
                            <LinkIcon className="h-4 w-4" /> Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPreview(eventType)} className="rounded-lg focus:bg-[var(--crm-surface-3)] focus:text-[var(--crm-primary)] cursor-pointer flex items-center gap-2 text-[var(--crm-text-secondary)]">
                            <ExternalLink className="h-4 w-4" /> Preview Live
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[var(--crm-border)] mx-1" />
                          <DropdownMenuItem onClick={() => { setTypeToDelete(eventType.id); setShowDeleteDialog(true); }} className="rounded-lg focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400">
                             <Trash2 className="h-4 w-4" /> Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex-1 mt-1 relative z-10">
                      <h3 className="font-bold text-base text-[var(--crm-text-primary)] line-clamp-1 group-hover:text-[var(--crm-primary)] transition-colors">
                        {eventType.title}
                      </h3>
                      <p className="text-xs text-[var(--crm-text-secondary)] mt-1 line-clamp-1 italic">
                        {eventType.description || "No description provided."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div className="flex items-center text-[11px] font-medium text-[var(--crm-text-secondary)] gap-1 px-2 py-0.5 rounded-full bg-[var(--crm-surface-2)]">
                          <Clock className="h-3 w-3 text-[var(--crm-text-tertiary)]" />
                          {eventType.duration} Min
                        </div>
                        <div className="flex items-center text-[11px] font-medium text-[var(--crm-text-secondary)] gap-1 px-2 py-0.5 rounded-full bg-[var(--crm-surface-2)]">
                          <Users className="h-3 w-3 text-[var(--crm-text-tertiary)]" />
                          {(eventType.teamMembers || []).length || 1} Member
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--crm-border)] flex items-center justify-between relative z-10">
                      <button
                        onClick={() => { setSelectedEventType(eventType); setShowShareDialog(true); }}
                        className="text-xs font-semibold text-[var(--crm-primary)] flex items-center gap-1.5 hover:underline"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share / Embed
                      </button>

                      <Link href={`/meetings/event-types/${eventType.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 group/btn text-[var(--crm-text-secondary)] hover:text-[var(--crm-primary)] hover:bg-[var(--crm-surface-3)] -mr-2"
                        >
                          Modify <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Add New Card Slot */}
            <Link href="/meetings/event-types/new" className="group">
              <div className="h-full border-2 border-dashed border-[var(--crm-border)] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:border-[var(--crm-primary)]/50 hover:bg-[var(--crm-surface-2)] transition-all duration-300 cursor-pointer min-h-[160px]">
                <div className="h-10 w-10 rounded-full bg-[var(--crm-surface-3)] flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--crm-primary)] group-hover:text-white transition-all duration-300">
                  <Plus className="h-5 w-5 text-[var(--crm-text-secondary)] group-hover:text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[var(--crm-text-primary)]">Add Event Type</p>
                  <p className="text-xs text-[var(--crm-text-secondary)] mt-1">Create a new scheduling card</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-xl w-full bg-[var(--crm-surface-1)] border-[var(--crm-border)] p-6 sm:p-8 rounded-[24px] shadow-2xl">
          <DialogHeader className="text-left space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[var(--crm-surface-2)] flex items-center justify-center border border-[var(--crm-border)] shadow-sm">
              <Share2 className="h-5 w-5 text-[var(--crm-primary)]" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[var(--crm-text-primary)]">Share Booking Link</DialogTitle>
              <DialogDescription className="text-sm text-[var(--crm-text-secondary)] mt-1.5">
                Send this link to clients or colleagues to let them see your availability and book a slot instantly.
              </DialogDescription>
            </div>
          </DialogHeader>

          {selectedEventType && (
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
                    {getBookingUrl(selectedEventType)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const bookingLink = getBookingUrl(selectedEventType);
                      navigator.clipboard.writeText(bookingLink)
                      toast.success("Link copied to clipboard.")
                    }}
                    className="absolute right-2 top-2 h-10 px-4 bg-[var(--crm-surface-1)] shadow-sm border border-[var(--crm-border)] rounded-xl hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)]"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[var(--crm-primary)] hover:opacity-90 text-white rounded-2xl h-12 font-bold shadow-sm"
                    onClick={() => openPreview(selectedEventType)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview Booking Page
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl p-0 border-[var(--crm-border)] bg-[var(--crm-surface-2)]"
                    onClick={() => setShowShareDialog(false)}
                  >
                    <X className="h-5 w-5 text-[var(--crm-text-secondary)]" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="embed" className="space-y-6 mt-0">
                <div className="relative group rounded-2xl overflow-hidden border border-[var(--crm-border)]">
                  <div className="w-full bg-[var(--crm-surface-2)] p-5 text-[var(--crm-text-primary)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed break-words">
                    {`<div style="width: 100%; display: flex; justify-content: center;">
  <iframe 
    src="${getBookingUrl(selectedEventType)}?embed=true"
    width="100%"
    height="600"
    style="max-width: 820px; 
           min-height: 600px; 
           border: none; 
           background: transparent;"
    loading="lazy"
    title="LeadBajaar Booking Calendar"
  ></iframe>
</div>`}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const embedCode = `<div style="width: 100%; display: flex; justify-content: center;">\n  <iframe \n    src="${getBookingUrl(selectedEventType)}?embed=true" \n    width="100%" \n    height="600" \n    style="max-width: 820px; min-height: 600px; border: none; background: transparent;" \n    loading="lazy"\n    title="LeadBajaar Booking Calendar"\n  ></iframe>\n</div>`
                        navigator.clipboard.writeText(embedCode)
                        toast.success("Embed code copied to clipboard.")
                      }}
                      className="h-8 px-3 bg-white shadow-sm border border-[var(--crm-border)] rounded-lg hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)]"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy Code
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-[var(--crm-text-secondary)] text-center pb-2">
                  Copy and paste this HTML snippet into your website to embed the calendar directly onto your page.
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteEventType}
        isLoading={isDeleting}
        title="Delete Event Type"
        description="This action is permanent and cannot be undone. Are you sure you want to delete this event type?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
