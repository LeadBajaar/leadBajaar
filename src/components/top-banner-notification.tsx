"use client"

import React, { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'

interface TopBannerNotificationProps {
  notifications: any[]
  onClose: () => void
  onMarkAsRead: (id: number) => void
}

export function TopBannerNotification({ notifications, onClose, onMarkAsRead }: TopBannerNotificationProps) {
  if (!notifications || notifications.length === 0) return null

  // We only show the first one at a time
  const notification = notifications[0]
  const data = notification.data || {}
  
  const handleClose = () => {
    onMarkAsRead(notification.id)
    onClose()
  }

  const bgColor = data.bg_color || '#1e2d6b'
  const textColor = data.text_color || '#ffffff'
  const primaryColor = data.primary_color || '#ffffff'

  return (
    <div 
      className="w-full px-4 py-2 flex items-center justify-center relative z-[100] shadow-sm border-b"
      style={{ backgroundColor: bgColor, color: textColor, borderColor: primaryColor }}
    >
      <div className="flex items-center gap-2 text-[13px] font-medium text-center">
        <span>{notification.message}</span>
        {data.cta_link && (
          <a 
            href={data.cta_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity ml-2 flex items-center gap-1"
            style={{ color: primaryColor }}
          >
            {data.cta_text || 'Upgrade Now'}
          </a>
        )}
      </div>
      
      <button 
        onClick={handleClose}
        className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
        aria-label="Close"
      >
        <X className="h-4 w-4" style={{ color: textColor }} />
      </button>
    </div>
  )
}
