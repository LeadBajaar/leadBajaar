'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TestTube, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  BarChart3,
  Eye,
  Copy,
  RefreshCw,
  Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ConversionConfig {
  integration_id: number
  pixel_id: string
  page_name: string
  test_event_code?: string
  is_configured: boolean
}

interface TestResult {
  success: boolean
  message?: string
  error?: string
  response?: any
  events_received?: number
  fbtrace_id?: string
}

export function ConversionApiTester() {
  const [configurations, setConfigurations] = useState<ConversionConfig[]>([])
  const [selectedConfig, setSelectedConfig] = useState<ConversionConfig | null>(null)
  const [testEventCode, setTestEventCode] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const { toast } = useToast()

  // Single event test state
  const [singleEventName, setSingleEventName] = useState('Lead')
  const [singleEventData, setSingleEventData] = useState('')
  const [singleUserData, setSingleUserData] = useState('')

  // Batch event test state
  const [batchEvents, setBatchEvents] = useState('')
  const [batchEventCount, setBatchEventCount] = useState(1)

  // Connection test state
  const [connectionTestResult, setConnectionTestResult] = useState<TestResult | null>(null)

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      setIsLoading(true)
      const response = await integrationApi.getConversionApiConfiguration()
      setConfigurations(response.configurations || [])
      
      if (response.configurations && response.configurations.length > 0) {
        setSelectedConfig(response.configurations[0])
        setTestEventCode(response.configurations[0].test_event_code || '')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load configurations",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSingleEventTest = async () => {
    if (!selectedConfig) return

    try {
      setIsTesting(true)
      setTestResults([])

      const eventData = singleEventData ? JSON.parse(singleEventData) : {
        content_name: 'Test Lead Event',
        content_category: 'Lead Generation',
        value: 0,
        currency: 'USD'
      }

      const userData = singleUserData ? JSON.parse(singleUserData) : {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      }

      const result = await integrationApi.sendTestConversionEvent({
        pixel_id: selectedConfig.pixel_id,
        test_event_code: testEventCode,
        event_name: singleEventName,
        event_data: eventData,
        user_data: userData,
        integration_id: selectedConfig.integration_id
      })

      setTestResults([result])
      
      toast({
        title: "Test Event Sent",
        description: result.success ? "Test event sent successfully!" : "Test event failed",
        variant: result.success ? "default" : "destructive"
      })

    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        error: error.message || "Failed to send test event"
      }
      setTestResults([errorResult])
      
      toast({
        title: "Error",
        description: error.message || "Failed to send test event",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleBatchEventTest = async () => {
    if (!selectedConfig) return

    try {
      setIsTesting(true)
      setTestResults([])

      const events = JSON.parse(batchEvents || '[]')
      if (!Array.isArray(events) || events.length === 0) {
        throw new Error('Please provide valid events array')
      }

      const result = await integrationApi.sendBatchConversionEvents({
        pixel_id: selectedConfig.pixel_id,
        events: events,
        integration_id: selectedConfig.integration_id
      })

      setTestResults([result])
      
      toast({
        title: "Batch Test Sent",
        description: result.success ? 
          `Successfully sent ${result.events_received} events!` : 
          "Batch test failed",
        variant: result.success ? "default" : "destructive"
      })

    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        error: error.message || "Failed to send batch test"
      }
      setTestResults([errorResult])
      
      toast({
        title: "Error",
        description: error.message || "Failed to send batch test",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const generateSampleEvents = () => {
    const sampleEvents = []
    for (let i = 0; i < batchEventCount; i++) {
      sampleEvents.push({
        event_name: 'Lead',
        event_data: {
          content_name: `Sample Lead ${i + 1}`,
          content_category: 'Lead Generation',
          value: Math.floor(Math.random() * 1000),
          currency: 'USD'
        },
        user_data: {
          email: `test${i + 1}@example.com`,
          first_name: `Test${i + 1}`,
          last_name: 'User'
        }
      })
    }
    setBatchEvents(JSON.stringify(sampleEvents, null, 2))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    })
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Conversion API configurations...</span>
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
              <TestTube className="h-6 w-6 text-purple-600" />
              <CardTitle>Conversion API Tester</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={loadConfigurations}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Test and validate your Facebook Conversion API setup with various event types
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {configurations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No Conversion API configurations found. Please configure Conversion API first.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Configuration</Label>
                  <Select 
                    value={selectedConfig?.integration_id.toString() || ''} 
                    onValueChange={(value) => {
                      const config = configurations.find(c => c.integration_id.toString() === value)
                      setSelectedConfig(config || null)
                      setTestEventCode(config?.test_event_code || '')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select configuration" />
                    </SelectTrigger>
                    <SelectContent>
                      {configurations.map((config) => (
                        <SelectItem key={config.integration_id} value={config.integration_id.toString()}>
                          {config.page_name} ({config.pixel_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Event Code</Label>
                  <Input
                    value={testEventCode}
                    onChange={(e) => setTestEventCode(e.target.value)}
                    placeholder="Enter test event code"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="single">Single Event</TabsTrigger>
                  <TabsTrigger value="batch">Batch Events</TabsTrigger>
                  <TabsTrigger value="connection">Connection Test</TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Event Type</Label>
                      <Select value={singleEventName} onValueChange={setSingleEventName}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="PageView">PageView</SelectItem>
                          <SelectItem value="Purchase">Purchase</SelectItem>
                          <SelectItem value="CompleteRegistration">Complete Registration</SelectItem>
                          <SelectItem value="ViewContent">View Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Event Data (JSON)</Label>
                    <Textarea
                      value={singleEventData}
                      onChange={(e) => setSingleEventData(e.target.value)}
                      placeholder='{"content_name": "Test Lead", "value": 100, "currency": "USD"}'
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>User Data (JSON)</Label>
                    <Textarea
                      value={singleUserData}
                      onChange={(e) => setSingleUserData(e.target.value)}
                      placeholder='{"email": "test@example.com", "first_name": "Test", "last_name": "User"}'
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSingleEventTest}
                    disabled={!selectedConfig || isTesting}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Single Event Test
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="batch" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label>Number of Events</Label>
                      <Input
                        type="number"
                        value={batchEventCount}
                        onChange={(e) => setBatchEventCount(parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        className="w-32"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={generateSampleEvents}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Sample Events
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Events Array (JSON)</Label>
                    <Textarea
                      value={batchEvents}
                      onChange={(e) => setBatchEvents(e.target.value)}
                      placeholder='[{"event_name": "Lead", "event_data": {...}, "user_data": {...}}]'
                      rows={8}
                    />
                  </div>

                  <Button
                    onClick={handleBatchEventTest}
                    disabled={!selectedConfig || isTesting || !batchEvents}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Batch Event Test
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="connection" className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connection test will send a simple PageView event to verify your Conversion API setup.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleSingleEventTest}
                    disabled={!selectedConfig || isTesting}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Test Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge 
                    className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {result.success ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
