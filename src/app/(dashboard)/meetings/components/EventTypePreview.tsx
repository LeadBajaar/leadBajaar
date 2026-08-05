'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon, ExternalLink, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { EventType } from '@/types/events'

interface EventTypePreviewProps {
  eventType: EventType
  bookingUrl: string
}

export const EventTypePreview = ({ eventType, bookingUrl }: EventTypePreviewProps) => {
  const isActive = eventType.active !== false
  const relativeUrl = typeof window !== 'undefined' ? bookingUrl.replace(window.location.origin, '') : bookingUrl

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
    toast.success('Booking link copied to clipboard')
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[var(--crm-surface-1)]">
      <div className="shrink-0 bg-[var(--lb-navy)] text-white text-xs px-4 py-2.5 flex items-center justify-between gap-3">
        <span>This is a live preview of your real booking page — share the link with invitees to let them book.</span>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={copyLink} className="h-6 text-[11px] px-2 text-white hover:bg-white/10 gap-1">
            <LinkIcon className="h-3 w-3" /> Copy link
          </Button>
          <a href={relativeUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {!isActive ? (
        // The live public booking page has no "paused" state of its own — it would show
        // a normal booking calendar even for a paused event type — so this fallback is
        // built here rather than relying on something the real page doesn't do (verified).
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-[var(--crm-text-primary)] mb-1">Your event type is off</p>
            <p className="text-xs text-[var(--crm-text-secondary)]">Turn the event type on to preview your real availability here.</p>
          </div>
        </div>
      ) : (
        <iframe
          src={relativeUrl}
          title={`Preview of ${eventType.title}`}
          className="flex-1 w-full border-0 min-h-0"
        />
      )}
    </div>
  )
}
