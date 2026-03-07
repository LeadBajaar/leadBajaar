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
      console.log('Meta connection status:', response.data)

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
        console.log('Parsed services:', services)
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

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsConnecting(false)

          // Reload connected services
          loadConnectedServices()

          toast({
            title: "Facebook Connected",
            description: "Your Facebook services have been connected successfully!",
          })

          onConnect?.(connectedServices)
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

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            <CardTitle>Facebook & Meta Services</CardTitle>
          </div>
          {hasConnectedServices && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshToken}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          )}
        </div>
        <CardDescription>
          Connect your Facebook pages, WhatsApp Business accounts, and other Meta services
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasConnectedServices ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Connected to Facebook</span>
            </div>

            <div className="space-y-2">
              {connectedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getServiceIcon(service.type)}</span>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {getServiceTypeLabel(service.type)}
                        {service.metadata?.phone_numbers_count && (
                          <span> • {service.metadata.phone_numbers_count} phone numbers</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="h-4 w-4 mr-2" />
                  Add More Services
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <AlertCircle className="h-5 w-5" />
              <span>No Facebook services connected</span>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="h-4 w-4 mr-2" />
                  Connect Facebook Services
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500">
              This will connect your Facebook pages, WhatsApp Business accounts, and other Meta services
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


