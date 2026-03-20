'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Facebook, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Settings, 
  TestTube,
  BarChart3,
  Plus,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ConversionApiConfig {
  integration_id: number
  pixel_id: string
  page_name: string
  test_event_code?: string
  is_configured: boolean
}

interface EventType {
  [key: string]: string
}

interface EventData {
  event_name: string
  event_data: any
  user_data: any
}

export function FacebookConversionApiManager() {
  const [configurations, setConfigurations] = useState<ConversionApiConfig[]>([])
  const [eventTypes, setEventTypes] = useState<EventType>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<ConversionApiConfig | null>(null)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [testEventCode, setTestEventCode] = useState('')
  const [testEventName, setTestEventName] = useState('Lead')
  const [testEventData, setTestEventData] = useState('')
  const [testUserData, setTestUserData] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [configResponse, eventTypesResponse] = await Promise.all([
        integrationApi.getConversionApiConfiguration(),
        integrationApi.getConversionApiEventTypes()
      ])

      setConfigurations(configResponse.configurations || [])
      setEventTypes(eventTypesResponse.event_types || {})
    } catch (error: any) {
      console.error('Failed to load Conversion API data:', error)
      toast({
        title: "Connection Error",
        description: "Could not reach Meta services. Please check your connection or integration status.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTestEvent = async () => {
    if (!selectedConfig) return

    try {
      setIsSending(true)
      setTestResults(null)

      const eventData = testEventData ? JSON.parse(testEventData) : {
        content_name: 'Test Lead',
        content_category: 'Lead Generation',
        value: 0,
        currency: 'USD'
      }

      const userData = testUserData ? JSON.parse(testUserData) : {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      }

      const result = await integrationApi.sendTestConversionEvent({
        pixel_id: selectedConfig.pixel_id,
        test_event_code: testEventCode,
        event_name: testEventName,
        event_data: eventData,
        user_data: userData,
        integration_id: selectedConfig.integration_id
      })

      setTestResults(result)
      
      toast({
        title: "Test Event Sent",
        description: result.success ? "Test event sent successfully!" : "Test event failed",
        variant: result.success ? "default" : "destructive"
      })

    } catch (error: any) {
      toast({
        title: "Event Failed",
        description: error.message?.includes('{') ? "Meta rejected the test event. Check your test code and pixel ID." : (error.message || "Failed to send test event"),
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateConfiguration = async (config: ConversionApiConfig) => {
    try {
      await integrationApi.updateConversionApiConfiguration({
        integration_id: config.integration_id,
        pixel_id: config.pixel_id,
        test_event_code: testEventCode
      })

      toast({
        title: "Configuration Updated",
        description: "Conversion API configuration updated successfully!"
      })

      loadData()
      setShowConfigDialog(false)

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive"
      })
    }
  }

  const getEventTypeColor = (eventName: string) => {
    const colors: { [key: string]: string } = {
      'Lead': 'bg-blue-100 text-blue-800',
      'PageView': 'bg-green-100 text-green-800',
      'Purchase': 'bg-purple-100 text-purple-800',
      'AddToCart': 'bg-orange-100 text-orange-800',
      'InitiateCheckout': 'bg-yellow-100 text-yellow-800',
      'CompleteRegistration': 'bg-indigo-100 text-indigo-800',
      'ViewContent': 'bg-pink-100 text-pink-800',
      'Search': 'bg-gray-100 text-gray-800'
    }
    return colors[eventName] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Conversion API data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Facebook className="h-6 w-6 text-blue-600" />
              <CardTitle>Facebook Conversion API</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowConfigDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
          <CardDescription>
            Track conversions and events with Facebook Conversion API for better attribution and optimization
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {configurations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No Facebook Conversion API integrations configured. Please set up a Facebook Conversion API integration in the Marketing tab above.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {configurations.map((config) => (
                  <Card key={config.integration_id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{config.page_name}</h3>
                      <Badge variant={config.is_configured ? "default" : "secondary"}>
                        {config.is_configured ? "Configured" : "Not Configured"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Pixel ID: {config.pixel_id}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedConfig(config)
                          setTestEventCode(config.test_event_code || '')
                          setShowTestDialog(true)
                        }}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Event
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedConfig(config)
                          setTestEventCode(config.test_event_code || '')
                          setShowConfigDialog(true)
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <CardTitle>Available Event Types</CardTitle>
          </div>
          <CardDescription>
            Standard Facebook Conversion API event types you can track
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(eventTypes).map(([eventName, description]) => (
              <div key={eventName} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{eventName}</span>
                  <Badge className={getEventTypeColor(eventName)}>
                    {eventName}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Event Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Test Event</DialogTitle>
            <DialogDescription>
              Send a test event to verify your Conversion API setup
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Pixel ID</Label>
              <Input value={selectedConfig?.pixel_id || ''} disabled />
            </div>
            
            <div className="grid gap-2">
              <Label>Test Event Code</Label>
              <Input
                value={testEventCode}
                onChange={(e) => setTestEventCode(e.target.value)}
                placeholder="Enter test event code"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Event Type</Label>
              <Select value={testEventName} onValueChange={setTestEventName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(eventTypes).map((eventName) => (
                    <SelectItem key={eventName} value={eventName}>
                      {eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Event Data (JSON)</Label>
              <Textarea
                value={testEventData}
                onChange={(e) => setTestEventData(e.target.value)}
                placeholder='{"content_name": "Test Lead", "value": 0, "currency": "USD"}'
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>User Data (JSON)</Label>
              <Textarea
                value={testUserData}
                onChange={(e) => setTestUserData(e.target.value)}
                placeholder='{"email": "test@example.com", "first_name": "Test"}'
                rows={3}
              />
            </div>
            
            {testResults && (
              <Alert className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestEvent} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure Conversion API</DialogTitle>
            <DialogDescription>
              Update your Conversion API configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Page Name</Label>
              <Input value={selectedConfig?.page_name || ''} disabled />
            </div>
            
            <div className="grid gap-2">
              <Label>Pixel ID</Label>
              <Input value={selectedConfig?.pixel_id || ''} disabled />
            </div>
            
            <div className="grid gap-2">
              <Label>Test Event Code (Optional)</Label>
              <Input
                value={testEventCode}
                onChange={(e) => setTestEventCode(e.target.value)}
                placeholder="Enter test event code for testing"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedConfig && handleUpdateConfiguration(selectedConfig)}>
              <Settings className="h-4 w-4 mr-2" />
              Update Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
