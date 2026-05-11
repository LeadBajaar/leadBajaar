'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Target, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  BarChart3,
  Plus,
  Trash2,
  Eye
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

interface LeadData {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  stage: string
  source: string
  value?: number
  created_at: string
}

interface EventData {
  event_name: string
  event_data: any
  user_data: any
}

export function LeadConversionTracker() {
  const [configurations, setConfigurations] = useState<ConversionConfig[]>([])
  const [leads, setLeads] = useState<LeadData[]>([])
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [selectedConfig, setSelectedConfig] = useState<ConversionConfig | null>(null)
  const [eventName, setEventName] = useState('Lead')
  const [customEventData, setCustomEventData] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [autoTrack, setAutoTrack] = useState(false)
  const [trackingResults, setTrackingResults] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [configResponse, leadsResponse] = await Promise.all([
        integrationApi.getConversionApiConfiguration(),
        integrationApi.getLeads({ per_page: 50 })
      ])

      setConfigurations(configResponse.configurations || [])
      setLeads(leadsResponse.data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendConversionEvents = async () => {
    if (!selectedConfig || selectedLeads.length === 0) return

    try {
      setIsSending(true)
      setTrackingResults(null)

      const events = selectedLeads.map(leadId => {
        const lead = leads.find(l => l.id === leadId)
        if (!lead) return null

        const eventData = customEventData ? JSON.parse(customEventData) : {
          content_name: `Lead: ${lead.name}`,
          content_category: 'Lead Generation',
          value: lead.value || 0,
          currency: 'USD',
          lead_id: lead.id,
          source: lead.source
        }

        const userData = {
          email: lead.email,
          first_name: lead.name.split(' ')[0],
          last_name: lead.name.split(' ').slice(1).join(' '),
          phone: lead.phone,
          ...(lead.company && { city: lead.company })
        }

        return {
          event_name: eventName,
          event_data: eventData,
          user_data: userData
        }
      }).filter(Boolean)

      const result = await integrationApi.sendBatchConversionEvents({
        pixel_id: selectedConfig.pixel_id,
        events: events as EventData[],
        integration_id: selectedConfig.integration_id
      })

      setTrackingResults(result)
      
      toast({
        title: "Conversion Events Sent",
        description: result.success ? 
          `Successfully sent ${result.events_received} conversion events!` : 
          "Failed to send conversion events",
        variant: result.success ? "default" : "destructive"
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send conversion events",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(lead => lead.id))
    }
  }

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'New': 'bg-blue-100 text-blue-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Proposal': 'bg-yellow-100 text-yellow-800',
      'Negotiation': 'bg-orange-100 text-orange-800',
      'Closed Won': 'bg-purple-100 text-purple-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading conversion tracking data...</span>
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
              <Target className="h-6 w-6 text-red-600" />
              <CardTitle>Lead Conversion Tracking</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-track"
                checked={autoTrack}
                onCheckedChange={setAutoTrack}
              />
              <Label htmlFor="auto-track">Auto-track new leads</Label>
            </div>
          </div>
          <CardDescription>
            Track lead conversions with Facebook Conversion API for better attribution and campaign optimization
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {configurations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No Facebook Conversion API configurations found. Please configure Conversion API first.
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
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Conversion API configuration" />
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
                  <Label>Event Type</Label>
                  <Select value={eventName} onValueChange={setEventName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="CompleteRegistration">Complete Registration</SelectItem>
                      <SelectItem value="ViewContent">View Content</SelectItem>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Event Data (JSON - Optional)</Label>
                <Textarea
                  value={customEventData}
                  onChange={(e) => setCustomEventData(e.target.value)}
                  placeholder='{"content_name": "Custom Lead", "value": 100, "currency": "USD"}'
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllLeads}
                  >
                    {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {selectedLeads.length} of {leads.length} leads selected
                  </span>
                </div>
                <Button
                  onClick={handleSendConversionEvents}
                  disabled={!selectedConfig || selectedLeads.length === 0 || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Conversion Events
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <CardTitle>Leads ({leads.length})</CardTitle>
          </div>
          <CardDescription>
            Select leads to track as conversion events
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {leads.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No leads found. Create some leads first to track conversions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedLeads.includes(lead.id) 
                      ? "bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleSelectLead(lead.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="rounded"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{lead.name}</span>
                        <Badge className={getStageColor(lead.stage)}>
                          {lead.stage}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.email} • {lead.source} • {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {lead.value && (
                      <div className="text-sm font-medium">${lead.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {trackingResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Tracking Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={trackingResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(trackingResults, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
