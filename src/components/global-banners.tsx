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

    try {
      const notificationsResponse = await api.get('/notifications')
      const allNotifications = notificationsResponse.data.data || []
      
      const activeBanners = allNotifications.filter((n: any) => 
        !n.is_read && n.data?.display_format === 'banner'
      )
      
      setBanners(activeBanners)
    } catch (error) {
      console.error('Error fetching global banners:', error)
    }
  }

  useEffect(() => {
    fetchBanners()
    const interval = setInterval(fetchBanners, 30000)
    return () => clearInterval(interval)
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
