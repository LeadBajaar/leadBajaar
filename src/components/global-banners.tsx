"use client"

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'
import { TopBannerNotification } from './top-banner-notification'

export function GlobalBanners() {
  const { user, isLoading: isLoadingUser } = useUser()
  const [banners, setBanners] = useState<any[]>([])

  const fetchBanners = async () => {
    if (isLoadingUser || !user) return

    // Skip polling if tab is hidden in background or browser is offline
    if (typeof window !== 'undefined') {
      if (document.visibilityState === 'hidden' || !navigator.onLine) {
        return
      }
    }

    try {
      const notificationsResponse = await api.get('/notifications', {
        timeout: 10000,
      })
      const allNotifications = notificationsResponse.data?.data || []
      
      const activeBanners = allNotifications.filter((n: any) => 
        !n.is_read && n.data?.display_format === 'banner'
      )
      
      setBanners(activeBanners)
    } catch (error: any) {
      // Background banner polling should fail gracefully without spamming the console.
      // Ignore transient network blips, socket timeouts, 401/403, or background tab aborts.
      if (process.env.NODE_ENV === 'development' && error?.response?.status && error.response.status >= 500) {
        console.debug('Global banners background poll skipped:', error.message)
      }
    }
  }

  useEffect(() => {
    fetchBanners()

    // Poll every 60 seconds instead of 30 seconds to reduce unnecessary network pressure
    const interval = setInterval(fetchBanners, 60000)

    // Re-check automatically when user returns to this tab or reconnects
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBanners()
      }
    }
    const handleOnline = () => fetchBanners()

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [user, isLoadingUser])

  const markAsRead = async (id: number) => {
    try {
      await api.post('/notifications/mark-read', { notification_ids: [id] })
      setBanners(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error marking banner as read:', error)
    }
  }

  if (banners.length === 0) return null

  return (
    <TopBannerNotification 
      notifications={banners} 
      onClose={() => setBanners(prev => prev.slice(1))} 
      onMarkAsRead={markAsRead} 
    />
  )
}
