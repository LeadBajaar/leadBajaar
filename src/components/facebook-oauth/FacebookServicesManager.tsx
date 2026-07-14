'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Facebook, MessageCircle, Globe, Settings, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface FacebookPage {
  id: string
  name: string
  page_id: string
  category?: string
  tasks: string[]
  connected_at: string
  is_active: boolean
}

interface WhatsAppBusinessAccount {
  id: string
  name: string
  waba_id: string
  timezone?: string
  currency?: string
  phone_numbers: Array<{
    id: string
    display_phone_number: string
    verified_name?: string
  }>
  connected_at: string
  is_active: boolean
}

interface FacebookOAuth {
  id: string
  access_token: string
  expires_at: string
  connected_at: string
  is_active: boolean
}

interface ConnectedServices {
  facebook_oauth?: FacebookOAuth
  facebook_pages: FacebookPage[]
  whatsapp_business: WhatsAppBusinessAccount[]
}

export function FacebookServicesManager() {
  const [services, setServices] = useState<ConnectedServices>({
    facebook_pages: [],
    whatsapp_business: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/facebook/oauth/connected-services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to load services:', error)
      toast({
        title: "Error",
        description: "Failed to load Facebook services",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshToken = async () => {
    try {
      const response = await fetch('/api/facebook/oauth/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Facebook access token refreshed successfully"
        })
        loadServices()
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh token",
        variant: "destructive"
      })
    }
  }

  const getTokenStatus = () => {
    if (!services.facebook_oauth) return { status: 'disconnected', message: 'Not connected' }
    
    const expiresAt = new Date(services.facebook_oauth.expires_at)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', message: 'Token expired' }
    } else if (daysUntilExpiry < 7) {
      return { status: 'expiring', message: `Expires in ${daysUntilExpiry} days` }
    } else {
      return { status: 'active', message: `Expires in ${daysUntilExpiry} days` }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Facebook services...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tokenStatus = getTokenStatus()
  const totalPages = services.facebook_pages.length
  const totalWaba = services.whatsapp_business.length
  const totalPhoneNumbers = services.whatsapp_business.reduce((acc, waba) => acc + waba.phone_numbers.length, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Facebook className="h-6 w-6 text-primary" />
              <CardTitle>Facebook Services Overview</CardTitle>
            </div>
            <Button onClick={handleRefreshToken} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Refresh Token
            </Button>
          </div>
          <CardDescription>
            Manage your connected Facebook pages, WhatsApp Business accounts, and other Meta services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalPages}</div>
              <div className="text-sm text-gray-600">Facebook Pages</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalWaba}</div>
              <div className="text-sm text-gray-600">WhatsApp Accounts</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalPhoneNumbers}</div>
              <div className="text-sm text-gray-600">Phone Numbers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                {getStatusBadge(tokenStatus.status)}
              </div>
              <div className="text-sm text-gray-600">{tokenStatus.message}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Facebook Pages</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Business</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Facebook Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalPages > 0 ? (
                  <div className="space-y-2">
                    {services.facebook_pages.slice(0, 3).map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-gray-500">{page.category || 'No category'}</p>
                        </div>
                        <Badge variant={page.is_active ? "default" : "secondary"}>
                          {page.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    {totalPages > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{totalPages - 3} more pages
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No Facebook pages connected</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp Business</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalWaba > 0 ? (
                  <div className="space-y-2">
                    {services.whatsapp_business.slice(0, 3).map((waba) => (
                      <div key={waba.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{waba.name}</p>
                          <p className="text-sm text-gray-500">
                            {waba.phone_numbers.length} phone number(s)
                          </p>
                        </div>
                        <Badge variant={waba.is_active ? "default" : "secondary"}>
                          {waba.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    {totalWaba > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{totalWaba - 3} more accounts
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No WhatsApp Business accounts connected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Facebook Pages</CardTitle>
              <CardDescription>
                Manage your connected Facebook pages and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalPages > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Connected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.facebook_pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.name}</TableCell>
                        <TableCell>{page.category || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {page.tasks.map((task) => (
                              <Badge key={task} variant="outline" className="text-xs">
                                {task.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.is_active ? "default" : "secondary"}>
                            {page.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(page.connected_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No Facebook pages connected</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Connect your Facebook account to see your pages here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Accounts</CardTitle>
              <CardDescription>
                Manage your WhatsApp Business accounts and phone numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalWaba > 0 ? (
                <div className="space-y-4">
                  {services.whatsapp_business.map((waba) => (
                    <Card key={waba.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{waba.name}</CardTitle>
                          <Badge variant={waba.is_active ? "default" : "secondary"}>
                            {waba.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardDescription>
                          ID: {waba.waba_id} • {waba.timezone || 'No timezone'} • {waba.currency || 'No currency'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium">Phone Numbers:</h4>
                          {waba.phone_numbers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {waba.phone_numbers.map((phone) => (
                                <div key={phone.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <div>
                                    <p className="font-medium">{phone.display_phone_number}</p>
                                    {phone.verified_name && (
                                      <p className="text-sm text-gray-500">{phone.verified_name}</p>
                                    )}
                                  </div>
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No phone numbers available</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No WhatsApp Business accounts connected</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Connect your Facebook account to see your WhatsApp Business accounts here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


