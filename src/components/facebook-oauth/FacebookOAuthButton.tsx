'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Facebook, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface FacebookService {
  id: string
  name: string
  type: 'page' | 'waba' | 'oauth'
  status: 'connected' | 'disconnected' | 'error'
  metadata?: {
    page_id?: string
    waba_id?: string
    phone_numbers_count?: number
    connected_at?: string
  }
}

interface FacebookOAuthButtonProps {
  onConnect?: (services: FacebookService[]) => void
  className?: string
}

export function FacebookOAuthButton({ onConnect, className }: FacebookOAuthButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [connectedServices, setConnectedServices] = useState<FacebookService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load connected services on mount
  React.useEffect(() => {
    loadConnectedServices()
  }, [])

  const loadConnectedServices = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/meta/status')
      // console.log('Meta connection status:', response.data)

      if (response.data) {
        const data = response.data
        const services: FacebookService[] = []

        // Add OAuth service
        if (data.facebook_oauth) {
          services.push({
            id: 'oauth',
            name: data.facebook_oauth.metadata?.meta_user_name || 'Facebook Account',
            type: 'oauth',
            status: 'connected',
            metadata: {
              connected_at: data.facebook_oauth.metadata?.connected_at
            }
          })
        }

        // Add pages
        if (data.facebook_pages && Array.isArray(data.facebook_pages)) {
          data.facebook_pages.forEach((page: any) => {
            if (page.config) {
              services.push({
                id: page.config.page_id,
                name: page.config.page_name,
                type: 'page',
                status: 'connected',
                metadata: {
                  page_id: page.config.page_id,
                  connected_at: page.metadata?.connected_at
                }
              })
            }
          })
        }

        // Add WhatsApp Business Accounts
        if (data.whatsapp_business && Array.isArray(data.whatsapp_business)) {
          data.whatsapp_business.forEach((waba: any) => {
            if (waba.config) {
              services.push({
                id: waba.config.waba_id,
                name: waba.config.waba_name,
                type: 'waba',
                status: 'connected',
                metadata: {
                  waba_id: waba.config.waba_id,
                  phone_numbers_count: waba.metadata?.phone_numbers_count,
                  connected_at: waba.metadata?.connected_at
                }
              })
            }
          })
        }

        setConnectedServices(services)
        // console.log('Parsed services:', services)
      }
    } catch (error) {
      console.error('Failed to load connected services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Get OAuth URL from the new meta/connect endpoint
      const response = await api.get('/meta/connect')

      const data = response.data

      // Open OAuth popup
      const popup = window.open(
        data.auth_url,
        'facebook-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Listen for localStorage changes (Bulletproof fallback for COOP blocking window.opener)
      const handleStorage = (event: StorageEvent) => {
        if (event.key === 'META_OAUTH_SUCCESS') {
          window.removeEventListener('storage', handleStorage)
          clearInterval(fallbackCheck)
          setIsConnecting(false)
          loadConnectedServices()
          toast({
            title: "Facebook Connected",
            description: "Your Facebook services have been connected successfully!",
          })
          // Clear it so it can fire again next time
          localStorage.removeItem('META_OAUTH_SUCCESS')
          onConnect?.(connectedServices)
        } else if (event.key === 'META_OAUTH_ERROR') {
          window.removeEventListener('storage', handleStorage)
          clearInterval(fallbackCheck)
          setIsConnecting(false)
          toast({
            title: "Connection Failed",
            description: "Meta OAuth failed. Please try again.",
            variant: "destructive",
          })
          localStorage.removeItem('META_OAUTH_ERROR')
        }
      }

      window.addEventListener('storage', handleStorage)

      // Fallback: if popup is closed without sending a message (user closed it manually)
      const fallbackCheck = setInterval(() => {
        if (popup.closed) {
          clearInterval(fallbackCheck)
          window.removeEventListener('storage', handleStorage)
          setIsConnecting(false)
          // Silently reload in case auth succeeded but postMessage wasn't sent
          loadConnectedServices()
          // Ensure dashboard sync is triggered
          onConnect?.([])
        }
      }, 1000)

    } catch (error: any) {
      console.error('OAuth connection failed:', error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Facebook. Please try again.",
        variant: "destructive"
      })
      setIsConnecting(false)
    }
  }

  const handleRefreshToken = async () => {
    setIsRefreshing(true)

    try {
      const response = await api.post('/facebook/oauth/refresh-token')

      const data = response.data

      toast({
        title: "Token Refreshed",
        description: "Your Facebook access token has been refreshed successfully!",
      })

      // Reload connected services
      loadConnectedServices()

    } catch (error: any) {
      console.error('Token refresh failed:', error)
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh token. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'page':
        return '📄'
      case 'waba':
        return '💬'
      case 'oauth':
        return '🔐'
      default:
        return '📱'
    }
  }

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'page':
        return 'Facebook Page'
      case 'waba':
        return 'WhatsApp Business'
      case 'oauth':
        return 'Facebook Account'
      default:
        return 'Service'
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Facebook services...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasConnectedServices = connectedServices.length > 0

  if (hasConnectedServices) {
    return (
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-[var(--crm-border)] rounded-xl gap-3 bg-[var(--crm-surface-1)] shadow-sm", className)}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Facebook className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-[var(--crm-text-primary)] flex items-center gap-1.5">
              Meta Services Connected
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            </h3>
            <p className="text-[11px] text-[var(--crm-text-secondary)] mt-0.5">
              {connectedServices.length} {connectedServices.length === 1 ? 'service' : 'services'} synced successfully
            </p>
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="flex-1 sm:flex-none h-7 text-[11px] px-3"
          >
            {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <RefreshCw className="h-3 w-3 mr-1.5" />}
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-1 sm:flex-none h-7 text-[11px] px-3 !bg-[#1877F2] hover:!bg-[#1877F2]/90 !text-white border-0"
            style={{ backgroundColor: '#1877F2', color: 'white' }}
          >
            {isConnecting ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <Facebook className="h-3 w-3 mr-1.5" />
            )}
            Manage Facebook
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-[var(--crm-border)] rounded-xl gap-3 bg-[var(--crm-surface-1)] shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-blue-500/10">
          <Facebook className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-[13px] font-medium text-[var(--crm-text-primary)]">Facebook & Meta Services</h3>
          <p className="text-[11px] text-[var(--crm-text-secondary)] mt-0.5">
            Connect pages, WhatsApp accounts, and other Meta services
          </p>
        </div>
      </div>
      <div className="flex w-full sm:w-auto items-center gap-2">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
          className="flex-1 sm:flex-none h-7 text-[11px] px-3 !bg-[#1877F2] hover:!bg-[#1877F2]/90 !text-white border-0"
          style={{ backgroundColor: '#1877F2', color: 'white' }}
        >
          {isConnecting ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <Facebook className="h-3 w-3 mr-1.5" />
          )}
          Connect Facebook
        </Button>
      </div>
    </div>
  )
}


