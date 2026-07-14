"use client"

import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Megaphone, ExternalLink, MegaphoneOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface PromotionModalProps {
  notification: any
  onClose: () => void
}

export function PromotionModal({ notification, onClose }: PromotionModalProps) {
  if (!notification) return null

  const data = notification.data || {}
  const type = data.alert_type || 'info'
  
  const getColors = () => {
    switch (type) {
      case 'warning': return { primary: 'bg-amber-600', light: 'bg-amber-50', text: 'text-amber-900', icon: 'text-amber-600' }
      case 'success': return { primary: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-900', icon: 'text-emerald-600' }
      default: return { primary: 'bg-primary', light: 'bg-primary/10', text: 'text-indigo-900', icon: 'text-primary' }
    }
  }

  const colors = getColors()

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-white dark:bg-slate-900">
        <DialogTitle className="sr-only">{notification.title}</DialogTitle>
        <DialogDescription className="sr-only">{notification.message}</DialogDescription>
        
        {notification.image_url ? (
          <div className="relative h-[280px] w-full overflow-hidden">
            <img src={notification.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
               <div className={cn("px-2.5 py-1 text-white text-[10px] font-black uppercase rounded-lg w-fit mb-3 shadow-lg", colors.primary)}>
                 Announcement
               </div>
               <h2 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                 {notification.title}
               </h2>
            </div>
          </div>
        ) : (
          <div className={cn("p-8 pb-4 flex items-center gap-4", colors.light, "dark:bg-slate-800/50")}>
            <div className={cn("p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm")}>
              <Megaphone className={cn("h-7 w-7", colors.icon)} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {notification.title}
            </h2>
          </div>
        )}
        
        <div className="p-8 pt-6">
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm">
              {notification.message}
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {data.cta_link && (
              <Button 
                onClick={() => {
                   window.open(data.cta_link, '_blank')
                   onClose()
                }}
                className={cn("flex-1 text-white font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg transition-all active:scale-95", colors.primary)}
              >
                {data.cta_text || 'Learn More'} <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-widest h-12 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Dismiss
            </Button>
          </div>
          
          <p className="mt-6 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
            Platform Announcement &bull; {new Date(notification.created_at).toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
