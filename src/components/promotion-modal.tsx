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

  const bgColor = data.bg_color || '#0F172A'
  const primaryColor = data.primary_color || '#FF7A00'
  const textColor = data.text_color || '#ffffff'
  const secondaryTextColor = data.secondary_text_color || '#cbd5e1'

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="sm:max-w-[850px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl w-[95vw]" style={{ backgroundColor: bgColor }}>
        <DialogTitle className="sr-only" style={{ color: textColor }}>{notification.title}</DialogTitle>
        <DialogDescription className="sr-only">{notification.message}</DialogDescription>
        
        {/* Close Button Top Right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:text-white/80 transition-colors rounded-full opacity-80 z-50 bg-black/40 hover:bg-black/60 p-2 backdrop-blur-md"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col w-full h-full max-h-[85vh]">
          {/* Image Header (if exists) */}
          {data.image_url && (
            <div className="w-full relative group flex-shrink-0" style={{ maxHeight: notification.message ? '60vh' : '85vh' }}>
              {data.cta_link ? (
                <a href={data.cta_link} target="_blank" rel="noopener noreferrer" onClick={handleGotIt} className="block w-full h-full">
                  <img src={data.image_url} alt={notification.title} className="w-full h-full object-contain" />
                </a>
              ) : (
                <img src={data.image_url} alt={notification.title} className="w-full h-full object-contain" />
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="px-8 py-8 flex flex-col items-center text-center mt-auto" style={{ background: `linear-gradient(to top, ${bgColor}, ${bgColor}f2)` }}>
            {notification.title && (
              <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: textColor }}>
                {notification.title}
              </h2>
            )}
            {notification.message && (
              <p className="text-sm sm:text-base leading-relaxed max-w-2xl mb-6" style={{ color: secondaryTextColor }}>
                {notification.message}
              </p>
            )}
            
            {data.cta_link && (
              <Button 
                asChild
                onClick={handleGotIt}
                className="text-white font-bold px-10 py-6 h-auto text-lg rounded-full transition-all border-none mb-6 hover:opacity-90"
                style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}66` }}
              >
                <a href={data.cta_link} target="_blank" rel="noopener noreferrer">
                  {data.cta_text || 'TAP TO REGISTER'}
                </a>
              </Button>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-2">
              {data.allow_snooze !== false && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSnooze}
                  disabled={isSnoozing}
                  className="bg-transparent hover:bg-white/10 transition-colors"
                  style={{ color: secondaryTextColor, borderColor: `${secondaryTextColor}33` }}
                >
                  Remind me later
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGotIt}
                className="bg-transparent hover:bg-white/10 transition-colors"
                style={{ color: secondaryTextColor, borderColor: `${secondaryTextColor}33` }}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination Dots (if multiple) */}
        {notifications.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 pointer-events-none">
            {notifications.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  idx === currentIndex ? "bg-white w-4" : "bg-white/30"
                )}
                aria-label={`Announcement ${idx + 1} of ${notifications.length}`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
