"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Megaphone, ExternalLink, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface PromotionModalProps {
  notifications: any[]
  onClose: () => void
  onMarkAsRead: (id: number) => void
}

export function PromotionModal({ notifications, onClose, onMarkAsRead }: PromotionModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSnoozing, setIsSnoozing] = useState(false)
  
  if (!notifications || notifications.length === 0) return null
  
  const notification = notifications[currentIndex]
  const data = notification.data || {}
  const category = data.category || 'Announcement'
  
  const handleNextOrClose = () => {
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onClose()
    }
  }

  const handleGotIt = () => {
    onMarkAsRead(notification.id)
    handleNextOrClose()
  }

  const handleSnooze = async () => {
    try {
      setIsSnoozing(true)
      await api.post(`/notifications/${notification.id}/snooze`)
      handleNextOrClose()
    } catch (error) {
      toast.error('Failed to snooze notification')
    } finally {
      setIsSnoozing(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="sm:max-w-[420px] p-0 overflow-hidden rounded-xl border border-[var(--crm-border)] shadow-xl bg-[var(--crm-surface-1)]">
        <DialogTitle className="sr-only">{notification.title}</DialogTitle>
        <DialogDescription className="sr-only">{notification.message}</DialogDescription>
        
        {/* Close Button Top Right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-colors rounded-sm opacity-70 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 bg-white/50 dark:bg-black/50 p-1 backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image Header (if exists) */}
        {data.image_url && (
          <div className="w-full aspect-video bg-[var(--crm-surface-2)] overflow-hidden">
            <img src={data.image_url} alt="Announcement Media" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Padding Container */}
        <div className="px-5 pt-5 pb-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-[#E84C3A]/10 flex items-center justify-center shrink-0">
              <Megaphone className="h-4 w-4 text-[#E84C3A]" />
            </div>
            <div className="px-2 py-0.5 rounded-full bg-[#E84C3A]/10 text-[#E84C3A] text-[11px] font-bold uppercase tracking-wider">
              {category}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5 mb-4">
            <h2 className="text-[17px] font-bold text-[var(--crm-text-primary)] leading-snug truncate pr-6">
              {notification.title}
            </h2>
            <p className="text-[14px] text-[var(--crm-text-secondary)] leading-[1.6] line-clamp-4">
              {notification.message}
            </p>
          </div>

          {/* Learn More Link */}
          {data.cta_link && (
            <div className="mb-1">
              <a 
                href={data.cta_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-[13px] font-bold text-[#E84C3A] hover:opacity-80 transition-opacity"
              >
                {data.cta_text || 'Learn more'} 
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--crm-border)] bg-[var(--crm-surface-1)] flex items-center justify-between">
          {/* Pagination Dots */}
          <div className="flex items-center gap-1.5">
            {notifications.length > 1 && notifications.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  idx === currentIndex ? "bg-[#E84C3A]" : "bg-[var(--crm-border)]"
                )}
                aria-label={`Announcement ${idx + 1} of ${notifications.length}`}
              />
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {data.allow_snooze !== false && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSnooze}
                disabled={isSnoozing}
                className="h-8 px-3 text-[12px] font-bold border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-text-primary)] shadow-none"
              >
                Remind me later
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleGotIt}
              className="h-8 px-3 text-[12px] font-bold bg-[#E84C3A] text-white hover:bg-[#D64332] shadow-sm"
            >
              Got it
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
