'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock, Video, MapPin, Phone, Users,
  Link as LinkIcon, Plus, Calendar, Copy, ExternalLink,
  ChevronRight, MoreHorizontal, Globe2, Trash2, Edit2,
  CalendarCheck, ArrowRight, Zap, X
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
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

const locationIcons = {
  video: { icon: Video, label: 'Video Call', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  phone: { icon: Phone, label: 'Phone Call', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'in-person': { icon: MapPin, label: 'In Person', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' }
}

export default function EventTypesPage() {
  const { toast } = useToast()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareDialog, setShowShareDialog] = useState(false)
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
        toast({
          title: "Error",
          description: "Failed to load event types",
          variant: "destructive",
        })
        setEventTypes([])
      } finally {
        setLoading(false)
      }
    }

    loadEventTypes()
  }, [])

  const copyBookingLink = (eventType: EventType) => {
    const bookingLink = `${window.location.origin}/book/${eventType.id}`
    navigator.clipboard.writeText(bookingLink)
    toast({
      title: "Link Copied",
      description: "Booking link has been copied to clipboard",
    })
  }

  const openPreview = (eventType: EventType) => {
    window.open(`/book/${eventType.id}`, '_blank')
  }

  const deleteEventType = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this event type?')) return
    try {
      await eventTypeService.delete(id)
      setEventTypes(eventTypes.filter(et => et.id !== id))
      toast({
        title: "Success",
        description: "Event type deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event type",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col p-6 h-full overflow-hidden gap-6">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Event Types
            <Zap className="h-5 w-5 text-indigo-500 fill-indigo-500" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure your availability and booking page settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/api/auth/google'}
            className="h-9 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Connect Google Calendar
          </Button>
          <Link href="/meetings/event-types/new">
            <Button size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Event Type
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 rotate-6">
              <CalendarCheck className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No event types yet</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto mb-8">
              Create your first event type to start scheduling meetings and automating your booking process.
            </p>
            <Link href="/meetings/event-types/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6">
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
                <Card key={eventType.id} className="group relative border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                  {/* Status Indicator (Top Bar) */}
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors" />

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-2 rounded-xl border transition-all duration-300 group-hover:scale-110", loc.bg, "border-transparent group-hover:border-current shadow-sm")}>
                        <loc.icon className={cn("h-5 w-5", loc.color)} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 p-1.5 rounded-xl">
                          <DropdownMenuItem asChild className="rounded-lg focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400 cursor-pointer">
                            <Link href={`/meetings/event-types/${eventType.id}`} className="flex items-center gap-2 w-full">
                              <Edit2 className="h-4 w-4" /> Edit Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedEventType(eventType); setShowShareDialog(true); }} className="rounded-lg focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400 cursor-pointer flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" /> Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPreview(eventType)} className="rounded-lg focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400 cursor-pointer flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Preview Live
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 mx-1" />
                          <DropdownMenuItem onClick={() => deleteEventType(eventType.id)} className="rounded-lg focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400 cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-4 w-4" /> Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {eventType.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 h-10 italic">
                        {eventType.description || "No description provided."}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {eventType.duration} Min
                        </div>
                        <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {(eventType.teamMembers || []).length || 1} Member
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => copyBookingLink(eventType)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy text link
                      </button>

                      <Link href={`/meetings/event-types/${eventType.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 group/btn text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 -mr-2"
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
              <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-300 cursor-pointer min-h-[240px]">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">Add Event Type</p>
                  <p className="text-xs text-slate-500 mt-1">Create a new scheduling card</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
              <Globe2 className="h-8 w-8 text-indigo-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Share Booking Link</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Send this link to clients or colleagues to let them see your availability and book a slot instantly.
            </DialogDescription>
          </DialogHeader>

          {selectedEventType && (
            <div className="mt-8 space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <div className="w-full text-sm font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-11 pr-24 text-slate-900 dark:text-white break-all">
                  {`${window.location.origin}/book/${selectedEventType.id}`}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const bookingLink = `${window.location.origin}/book/${selectedEventType.id}`
                    navigator.clipboard.writeText(bookingLink)
                    toast({ title: "Copied!", description: "Link copied to clipboard." })
                  }}
                  className="absolute right-2 top-2 h-10 px-4 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
                  onClick={() => openPreview(selectedEventType)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Booking Page
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-12 rounded-2xl p-0 border-slate-200 dark:border-slate-800"
                  onClick={() => setShowShareDialog(false)}
                >
                  <X className="h-5 w-5 text-slate-400" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 